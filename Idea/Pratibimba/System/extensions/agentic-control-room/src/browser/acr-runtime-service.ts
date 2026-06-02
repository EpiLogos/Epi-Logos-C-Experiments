import { injectable, inject } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common/event';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI,
    type KernelBridgeRuntimeEvent
} from '@pratibimba/kernel-bridge';
import {
    type AgenticActor,
    type AgenticRoute,
    type RunTreeNode,
    type ToolStreamEvent,
    type ReviewDecision,
    type ReviewTransition,
    type RunEvidenceEnvelope,
    enforceHumanGate,
    buildEvidenceEnvelope
} from '../common/run-model';
import { isPrivacySafe } from '@pratibimba/ide-shell-m0-m5';

/**
 * AgenticControlRoomRuntimeService — Track 05 T8.
 *
 * The single in-process service that drives the run flow: holds the current
 * run tree, tool stream, diagnostics, and selected candidate state; emits
 * change events to the widgets. Dispatches the actual `s4'.mediation.route`
 * call through `KERNEL_BRIDGE_API.invokeCapability` — never a direct
 * fetch / WebSocket.
 *
 * The service is bound as a Theia singleton so all widgets see the same
 * run state across the deep IDE layout. Tests rebind a fixture instance.
 */
export const ACR_RUNTIME_SERVICE = Symbol('PratibimbaAgenticControlRoomRuntimeService');

export interface SelectedCandidate {
    readonly id: string;
    readonly title: string;
    readonly coordinate: string | null;
    readonly humanRequired: boolean;
    readonly proposer: string | null;
    readonly privacyClass: string;
}

export interface RunState {
    readonly candidate: SelectedCandidate | null;
    readonly route: AgenticRoute | null;
    readonly actor: AgenticActor | null;
    readonly runTree: RunTreeNode | null;
    readonly toolStream: readonly ToolStreamEvent[];
    readonly diagnostics: readonly string[];
    readonly evidence: RunEvidenceEnvelope | null;
    readonly lastTransition: ReviewTransition | null;
    readonly aborted: boolean;
    readonly errored: string | null;
    readonly humanGateBlocks: readonly string[];
}

const EMPTY_STATE: RunState = {
    candidate: null,
    route: null,
    actor: null,
    runTree: null,
    toolStream: [],
    diagnostics: [],
    evidence: null,
    lastTransition: null,
    aborted: false,
    errored: null,
    humanGateBlocks: []
};

@injectable()
export class AgenticControlRoomRuntimeService {
    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    protected _state: RunState = EMPTY_STATE;
    protected readonly _onChange = new Emitter<RunState>();
    readonly onChange: Event<RunState> = this._onChange.event;
    /** Optional bridge subscription so the service can stream tool events. */
    protected eventUnsubscribe: (() => void) | null = null;
    protected runIdSeq: number = 0;

    get state(): RunState {
        return this._state;
    }

    selectCandidate(candidate: SelectedCandidate): void {
        if (!isPrivacySafe(candidate.privacyClass)) {
            this._state = {
                ...this._state,
                errored: `Candidate ${candidate.id} rejected: privacy class "${candidate.privacyClass}"`
            };
            this._onChange.fire(this._state);
            return;
        }
        this._state = {
            ...EMPTY_STATE,
            candidate
        };
        this._onChange.fire(this._state);
    }

    selectRouteActor(route: AgenticRoute, actor: AgenticActor): void {
        this._state = { ...this._state, route, actor };
        this._onChange.fire(this._state);
    }

    /**
     * Dispatch the route through `s4'.mediation.route` via kernel-bridge.
     *
     * This produces an initial RunTreeNode and subscribes to kernel-bridge
     * runtime events so subsequent tool / observability events stream into
     * the toolStream. Aborts and errors transition the run tree state.
     */
    async startRun(): Promise<void> {
        const candidate = this._state.candidate;
        const route = this._state.route;
        const actor = this._state.actor;
        if (!candidate || !route || !actor) {
            this._state = {
                ...this._state,
                errored: 'cannot start run: candidate, route, actor must all be selected'
            };
            this._onChange.fire(this._state);
            return;
        }
        const runId = `run-${++this.runIdSeq}-${Date.now()}`;
        const rootNode: RunTreeNode = {
            id: runId,
            label: `${route} → ${actor}`,
            status: 'running',
            startedAtMs: Date.now()
        };
        this._state = { ...this._state, runTree: rootNode, aborted: false, errored: null };
        this._onChange.fire(this._state);

        // Subscribe to bridge events so tool / observability frames stream in.
        if (this.eventUnsubscribe === null) {
            this.eventUnsubscribe = this.bridge.onEvent(ev => this.absorbBridgeEvent(ev));
        }

        try {
            const receipt = await this.bridge.invokeCapability({
                method: 'invokeGatewayRpc',
                sessionKey: candidate.id,
                params: {
                    gatewayMethod: "s4'.mediation.route",
                    route,
                    actor,
                    candidateId: candidate.id,
                    coordinate: candidate.coordinate
                },
                profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                provenanceHandles: [],
                vak: null
            });
            const endedAtMs = Date.now();
            const status: RunTreeNode['status'] = isPrivacySafe(receipt.privacyClass)
                ? 'completed'
                : 'errored';
            this._state = {
                ...this._state,
                runTree: {
                    ...rootNode,
                    status,
                    endedAtMs
                }
            };
            this._onChange.fire(this._state);
        } catch (err) {
            const endedAtMs = Date.now();
            const errored = err instanceof Error ? err.message : String(err);
            this._state = {
                ...this._state,
                errored,
                runTree: { ...rootNode, status: 'errored', endedAtMs }
            };
            this._onChange.fire(this._state);
        }
    }

    /** Abort the active run — sets the tree status and emits a diagnostic. */
    abort(reason: string): void {
        if (this._state.runTree) {
            const endedAtMs = Date.now();
            this._state = {
                ...this._state,
                aborted: true,
                runTree: { ...this._state.runTree, status: 'aborted', endedAtMs },
                diagnostics: [...this._state.diagnostics, `abort: ${reason}`]
            };
            this._onChange.fire(this._state);
        }
    }

    /** Retry — clears the tree and re-runs. */
    async retry(): Promise<void> {
        if (this._state.runTree === null) {
            return;
        }
        this._state = { ...this._state, runTree: null, toolStream: [], diagnostics: [], aborted: false, errored: null };
        this._onChange.fire(this._state);
        await this.startRun();
    }

    /** Continue — appends a child node and re-dispatches. */
    async continueRun(reason: string): Promise<void> {
        this._state = {
            ...this._state,
            diagnostics: [...this._state.diagnostics, `continue: ${reason}`]
        };
        this._onChange.fire(this._state);
        await this.startRun();
    }

    /** Update the evidence envelope (deposition UI updates this). */
    setEvidence(envelope: RunEvidenceEnvelope): void {
        if (!isPrivacySafe(envelope.privacyClass)) {
            this._state = {
                ...this._state,
                errored: `Evidence rejected: privacy class "${envelope.privacyClass}"`
            };
            this._onChange.fire(this._state);
            return;
        }
        this._state = { ...this._state, evidence: envelope };
        this._onChange.fire(this._state);
    }

    /**
     * Submit a review transition. Enforces the human-gate at the UI BEFORE
     * dispatching. When the gate blocks, the transition is added to
     * `humanGateBlocks` and the gateway is NEVER called (the gateway also
     * enforces the same rule — T8 verification asserts both sides reject).
     */
    async submitReviewDecision(
        decision: ReviewDecision,
        reason: string,
        actorIsHuman: boolean
    ): Promise<void> {
        const candidate = this._state.candidate;
        const actor = this._state.actor;
        if (!candidate) {
            this._state = { ...this._state, errored: 'cannot submit review: no candidate selected' };
            this._onChange.fire(this._state);
            return;
        }
        const gate = enforceHumanGate({
            decision,
            humanRequired: candidate.humanRequired,
            actorIsHuman
        });
        if (!gate.ok) {
            this._state = {
                ...this._state,
                humanGateBlocks: [...this._state.humanGateBlocks, gate.reason]
            };
            this._onChange.fire(this._state);
            return;
        }
        try {
            // Use s5'.review.submit (Track 04 verified).
            await this.bridge.invokeCapability({
                method: 'invokeGatewayRpc',
                sessionKey: candidate.id,
                params: {
                    gatewayMethod: "s5'.review.submit",
                    candidateId: candidate.id,
                    decision,
                    reason,
                    actor,
                    actorIsHuman
                },
                profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                provenanceHandles: [],
                vak: null
            });
            const transition: ReviewTransition = {
                candidateId: candidate.id,
                decision,
                reason,
                actor: actor ?? 'anima',
                humanRequired: candidate.humanRequired,
                transitionAtMs: Date.now()
            };
            this._state = { ...this._state, lastTransition: transition };
            this._onChange.fire(this._state);
        } catch (err) {
            this._state = {
                ...this._state,
                errored: err instanceof Error ? err.message : String(err)
            };
            this._onChange.fire(this._state);
        }
    }

    protected absorbBridgeEvent(ev: KernelBridgeRuntimeEvent): void {
        const isToolKind =
            ev.kind === 'observability' &&
            typeof ev.payload === 'object' &&
            ev.payload !== null;
        if (!isToolKind) {
            return;
        }
        if (!isPrivacySafe(ev.privacyClass)) {
            return;
        }
        const payload = ev.payload as Record<string, unknown>;
        const tool = typeof payload.tool === 'string' ? payload.tool : 'unknown';
        const kind = typeof payload.kind === 'string' ? payload.kind : 'tool.partial';
        const toolEvent: ToolStreamEvent = {
            id: `${ev.emittedAtMs}-${tool}-${this._state.toolStream.length}`,
            emittedAtMs: ev.emittedAtMs,
            tool,
            kind,
            payload,
            privacyClass: ev.privacyClass
        };
        this._state = {
            ...this._state,
            toolStream: [...this._state.toolStream, toolEvent]
        };
        this._onChange.fire(this._state);
    }

    /** Test helper — push a tool event directly into the stream. */
    injectToolEvent(event: ToolStreamEvent): void {
        if (!isPrivacySafe(event.privacyClass)) {
            return;
        }
        this._state = {
            ...this._state,
            toolStream: [...this._state.toolStream, event]
        };
        this._onChange.fire(this._state);
    }

    /** Test helper — build envelope + set evidence. */
    composeEvidence(input: Parameters<typeof buildEvidenceEnvelope>[0]): RunEvidenceEnvelope {
        const env = buildEvidenceEnvelope(input);
        this.setEvidence(env);
        return env;
    }
}
