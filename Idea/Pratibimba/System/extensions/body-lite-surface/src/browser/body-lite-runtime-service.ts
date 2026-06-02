import { injectable, inject } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common/event';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI,
    type KernelBridgeRuntimeEvent
} from '@pratibimba/kernel-bridge';
import {
    PratibimbaSessionStateService,
    SESSION_STATE_SERVICE
} from '@pratibimba/pratibimba-layouts';
import {
    type AgentCheckInSnapshot,
    type ReviewAlertSnapshot,
    type SafeSourceHandle,
    isLiteSurfaceSafePrivacyClass,
    synthAgentCheckInSnapshot,
    synthReviewAlertSnapshot,
    synthSafeSourceHandles,
    type S5CandidateLiteRow,
    type AgentObservabilityFrame,
    type TouchedItemRow
} from '../common';

/**
 * Body lite-surface runtime service — Track 09 T9b.
 *
 * Singleton service shared by the three lite widgets. Subscribes ONCE to
 * `KERNEL_BRIDGE_API.onEvent` for observability events and absorbs them
 * into the agent-check-in snapshot. Review alerts are pulled via the
 * same bridge using `invokeCapability` (`requestReviewEvidence` is the
 * allow-listed capability; the gateway returns S5 DTOs with humanRequired
 * flag and safe titles).
 *
 * Subscription discipline (verified by contract test): exactly one
 * upstream subscription persists. Both 0/1 daily and ide-deep layouts
 * share the same KERNEL_BRIDGE_API singleton.
 *
 * Privacy discipline: every incoming row goes through
 * `isLiteSurfaceSafePrivacyClass`. Forbidden classes are silently
 * dropped — they may NEVER reach the lite-surface DOM.
 */
export const BODY_LITE_RUNTIME_SERVICE = Symbol('PratibimbaBodyLiteRuntimeService');

export interface BodyLiteRuntimeState {
    readonly reviewAlerts: ReviewAlertSnapshot;
    readonly agentCheckIns: AgentCheckInSnapshot;
    readonly safeHandles: ReadonlyArray<SafeSourceHandle>;
    /** Last error (privacy violation, capability rejection, etc.). */
    readonly lastError: string | null;
}

const EMPTY_REVIEW: ReviewAlertSnapshot = {
    pendingCount: 0,
    latest: null,
    recent: [],
    snapshotAtMs: 0
};
const EMPTY_CHECKIN: AgentCheckInSnapshot = {
    activeRunCount: 0,
    runs: [],
    snapshotAtMs: 0
};

const EMPTY_STATE: BodyLiteRuntimeState = {
    reviewAlerts: EMPTY_REVIEW,
    agentCheckIns: EMPTY_CHECKIN,
    safeHandles: [],
    lastError: null
};

@injectable()
export class BodyLiteRuntimeService {
    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    @inject(SESSION_STATE_SERVICE)
    protected readonly sessionState!: PratibimbaSessionStateService;

    protected _state: BodyLiteRuntimeState = EMPTY_STATE;
    protected readonly _onChange = new Emitter<BodyLiteRuntimeState>();
    readonly onChange: Event<BodyLiteRuntimeState> = this._onChange.event;

    protected eventUnsubscribe: (() => void) | null = null;
    /** Active observability frames keyed by runId. */
    protected activeFrames: Map<string, AgentObservabilityFrame> = new Map();
    /** Touched items log (capped). */
    protected touchedItems: TouchedItemRow[] = [];

    get state(): BodyLiteRuntimeState {
        return this._state;
    }

    /**
     * Activate the runtime service. Idempotent — calling twice does NOT
     * open a second upstream subscription. The lite layer is the FIRST
     * subscriber; the deep IDE layer activates on summon and shares the
     * same singleton.
     */
    activate(): void {
        if (this.eventUnsubscribe !== null) {
            return; // already subscribed
        }
        this.eventUnsubscribe = this.bridge.onEvent(ev => this.absorbBridgeEvent(ev));
    }

    deactivate(): void {
        if (this.eventUnsubscribe !== null) {
            this.eventUnsubscribe();
            this.eventUnsubscribe = null;
        }
    }

    /**
     * Replace the review-alert snapshot from a typed S5 lite DTO array.
     * Tests / refresh hooks call this; the production wire-up issues
     * `bridge.invokeCapability({ method: 'requestReviewEvidence' })` and
     * passes the response rows in.
     */
    setReviewAlertRows(rows: ReadonlyArray<S5CandidateLiteRow>, atMs: number = Date.now()): void {
        const next = synthReviewAlertSnapshot(rows, atMs);
        this._state = { ...this._state, reviewAlerts: next };
        this._onChange.fire(this._state);
    }

    /** Reset / replace the touched items list. */
    setTouchedItems(items: ReadonlyArray<TouchedItemRow>): void {
        this.touchedItems = items.slice();
        this._state = {
            ...this._state,
            safeHandles: synthSafeSourceHandles(this.touchedItems, 10)
        };
        this._onChange.fire(this._state);
    }

    /** Append a single touch event. */
    pushTouchedItem(item: TouchedItemRow): void {
        if (!isLiteSurfaceSafePrivacyClass(item.privacyClass)) {
            this._state = {
                ...this._state,
                lastError: `touched item ${item.handleId} rejected: privacy "${item.privacyClass}"`
            };
            this._onChange.fire(this._state);
            return;
        }
        this.touchedItems = [item, ...this.touchedItems].slice(0, 50);
        this._state = {
            ...this._state,
            safeHandles: synthSafeSourceHandles(this.touchedItems, 10)
        };
        this._onChange.fire(this._state);
    }

    /** Test helper — inject an observability frame directly. */
    injectObservabilityFrame(frame: AgentObservabilityFrame): void {
        if (!isLiteSurfaceSafePrivacyClass(frame.privacyClass)) {
            this._state = {
                ...this._state,
                lastError: `observability frame ${frame.runId} rejected: privacy "${frame.privacyClass}"`
            };
            this._onChange.fire(this._state);
            return;
        }
        this.activeFrames.set(frame.runId, frame);
        this.recomputeCheckIn();
    }

    /** Mark a run ended (removes it from active check-ins). */
    closeRun(runId: string, endedAtMs: number = Date.now()): void {
        const existing = this.activeFrames.get(runId);
        if (!existing) return;
        // Replace with ended frame so synth filter drops it.
        this.activeFrames.set(runId, { ...existing, endedAtMs });
        this.recomputeCheckIn();
    }

    protected recomputeCheckIn(): void {
        const frames = Array.from(this.activeFrames.values());
        const next = synthAgentCheckInSnapshot(frames, Date.now());
        this._state = { ...this._state, agentCheckIns: next };
        this._onChange.fire(this._state);
    }

    protected absorbBridgeEvent(ev: KernelBridgeRuntimeEvent): void {
        if (ev.kind !== 'observability') return;
        if (!isLiteSurfaceSafePrivacyClass(ev.privacyClass)) return;
        if (typeof ev.payload !== 'object' || ev.payload === null) return;
        const payload = ev.payload as Record<string, unknown>;
        const runId = typeof payload.runId === 'string' ? payload.runId : null;
        if (runId === null) return;
        const kind = typeof payload.kind === 'string' ? payload.kind : '';

        if (kind === 'route.start') {
            const frame: AgentObservabilityFrame = {
                runId,
                route: typeof payload.route === 'string' ? payload.route : 'unknown',
                actor: typeof payload.actor === 'string' ? payload.actor : 'unknown',
                capacity: typeof payload.capacity === 'string' ? payload.capacity : null,
                startedAtMs: ev.emittedAtMs,
                endedAtMs: null,
                privacyClass: ev.privacyClass
            };
            this.activeFrames.set(runId, frame);
            this.recomputeCheckIn();
        } else if (kind === 'route.end' || kind === 'tool.error') {
            this.closeRun(runId, ev.emittedAtMs);
        }
    }
}
