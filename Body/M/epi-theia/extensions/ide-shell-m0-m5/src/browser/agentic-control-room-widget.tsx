import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { CommandService } from '@theia/core';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import { BridgeReadinessBadge } from '@pratibimba/m-extension-runtime/lib/common/bridge-readiness';
import { IDE_SHELL_WIDGET_IDS } from '../common/contract';
import {
    parseCapabilityMatrix,
    dispatchToolNames,
    skillNames,
    type CapabilityMatrix
} from '../common/capability-matrix-types';
import { IdeShellBridgeGate } from './bridge-gate';
import {
    PiAxiomTranslationInspector
} from './acr/pi-axiom-translation-inspector';
import { PiRuntimeMonitorBanner } from './acr/pi-runtime-monitor-banner';
import { RunTree } from './acr/run-tree';
import { ToolStream } from './acr/tool-stream';
import { AbortRetryContinueControls } from './acr/abort-retry-continue-controls';
import { EvidenceDepositForm } from './acr/evidence-deposit-form';
import { ReviewDecisionControls } from './acr/review-decision-controls';
import { AletheiaSubagentTrace } from './acr/aletheia-subagent-trace';
import type {
    AletheiaSubagent,
    DispatchTraceNode,
    IOD17Parity,
    MediatedRunEvidencePacket,
    ReviewDecisionAction,
    Run,
    RuntimeControlAction,
    ToolInvocationRef
} from './acr/types';
import {
    PiAxiomTranslationService,
    createPiAxiomTranslationViewModel,
    type PiAxiomTranslationHistoryFilter,
    type PiAxiomTranslationSession
} from './services/pi-axiom-translation-service';

/**
 * Agentic Control Room — T4 scope: shell only.
 *
 * T4 deliverables (this file):
 *   - Workbench widget shell that hosts the T8 contents.
 *   - VAK evaluation fields (route, actor, coordinate, dayNow, sessionKey,
 *     profileGeneration) — empty by default; populated by intent dispatch.
 *   - Capability tree component that parses
 *     `Body/S/S4/plugins/pleroma/capability-matrix.json` and renders the IOD-17
 *     governance source-of-truth (dispatch tools + skills + constitutional
 *     agents). The matrix file is loaded via the host extension's
 *     `loadCapabilityMatrix` hook so tests can inject fixtures.
 *
 * T8 deliverables (separate widget contributions extend this — see T8 file):
 *   - Run tree, tool stream, diagnostics, abort/retry/continue.
 *   - Evidence deposition + review decision controls.
 *   - Human-gate enforcement on top of the IDE shell.
 */
export interface AgenticControlRoomState {
    readonly route: string | null;
    readonly actor: string | null;
    readonly coordinate: string | null;
    readonly sessionKey: string | null;
    readonly dayNow: string | null;
    readonly profileGeneration: number | null;
    readonly matrix: CapabilityMatrix | null;
    readonly matrixError: string | null;
    readonly axiomTranslationSessions: readonly PiAxiomTranslationSession[];
    readonly axiomTranslationError: string | null;
    readonly selectedAxiomTranslationSessionId: string | null;
    readonly expandedAxiomTranslationStepId: string | null;
    readonly tools: readonly ToolInvocationRef[];
    readonly activeRun: Run | null;
    readonly activeReviewId: string | null;
    readonly evidencePacket: MediatedRunEvidencePacket | null;
    readonly lastRuntimeControl: string | null;
    readonly lastReviewDecision: string | null;
    readonly lastDepositId: string | null;
}

const EMPTY_STATE: AgenticControlRoomState = {
    route: null,
    actor: null,
    coordinate: null,
    sessionKey: null,
    dayNow: null,
    profileGeneration: null,
    matrix: null,
    matrixError: null,
    axiomTranslationSessions: [],
    axiomTranslationError: null,
    selectedAxiomTranslationSessionId: null,
    expandedAxiomTranslationStepId: null,
    tools: [],
    activeRun: {
        id: 'pi-runtime-governance-audit',
        status: 'awaiting-review',
        humanRequired: true,
        reviewId: 'iod17-governance-review'
    },
    activeReviewId: 'iod17-governance-review',
    evidencePacket: null,
    lastRuntimeControl: null,
    lastReviewDecision: null,
    lastDepositId: null
};

const DR_M5_1_ROSTER_COLLAPSE = true;
const ALETHEIA_SUBAGENTS: readonly AletheiaSubagent[] = [
    'anansi',
    'janus',
    'moirai',
    'mercurius',
    'agora',
    'zeithoven'
];

@injectable()
export class AgenticControlRoomWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.AGENTIC_CONTROL_ROOM;
    static readonly LABEL = 'Pi Runtime Monitor (ACR)';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    @inject(CommandService)
    protected readonly commands!: CommandService;

    @inject(PiAxiomTranslationService)
    protected readonly axiomTranslations!: PiAxiomTranslationService;

    protected state: AgenticControlRoomState = EMPTY_STATE;
    /** Injected at activation time by the host contribution. */
    public loadCapabilityMatrixSource: () => Promise<unknown> = async () => {
        throw new Error('agentic-control-room: capability matrix loader not initialised');
    };

    @postConstruct()
    protected init(): void {
        this.id = AgenticControlRoomWidget.ID;
        this.title.label = AgenticControlRoomWidget.LABEL;
        this.title.caption = AgenticControlRoomWidget.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-agentic-control-room');
    }

    /**
     * Load and parse the capability matrix. Called by the contribution on
     * widget activation. Idempotent (re-parses on each call so tests can
     * swap fixtures between assertions).
     */
    async refreshMatrix(): Promise<void> {
        try {
            const raw = await this.loadCapabilityMatrixSource();
            const matrix = parseCapabilityMatrix(raw);
            this.state = { ...this.state, matrix, matrixError: null };
        } catch (err) {
            this.state = {
                ...this.state,
                matrix: null,
                matrixError: err instanceof Error ? err.message : String(err)
            };
        }
        this.update();
    }

    async refreshAxiomTranslationHistory(
        filter: PiAxiomTranslationHistoryFilter = {}
    ): Promise<void> {
        try {
            const sessions = await this.axiomTranslations.fetchHistory(filter);
            this.state = {
                ...this.state,
                axiomTranslationSessions: sessions,
                axiomTranslationError: null,
                selectedAxiomTranslationSessionId:
                    filter.sessionId ?? this.state.selectedAxiomTranslationSessionId ?? sessions[0]?.id ?? null
            };
        } catch (err) {
            this.state = {
                ...this.state,
                axiomTranslationSessions: [],
                axiomTranslationError: err instanceof Error ? err.message : String(err),
                selectedAxiomTranslationSessionId: null,
                expandedAxiomTranslationStepId: null
            };
        }
        this.update();
    }

    /** Apply a VAK address arriving from CrossLayoutIntentDispatcher. */
    applyIntent(intent: {
        coordinate?: string | null;
        dayNow?: string | null;
        sessionKey?: string | null;
        profileGeneration?: number | null;
    }): void {
        this.state = {
            ...this.state,
            coordinate: intent.coordinate ?? this.state.coordinate,
            dayNow: intent.dayNow ?? this.state.dayNow,
            sessionKey: intent.sessionKey ?? this.state.sessionKey,
            profileGeneration: intent.profileGeneration ?? this.state.profileGeneration
        };
        this.update();
    }

    applyAxiomTranslationIntent(intent: {
        axiomTranslationSessionId?: string | null;
        axiomTranslationQuestion?: string | null;
    }): void {
        this.state = {
            ...this.state,
            selectedAxiomTranslationSessionId:
                intent.axiomTranslationSessionId ?? this.state.selectedAxiomTranslationSessionId,
            expandedAxiomTranslationStepId: this.state.expandedAxiomTranslationStepId
        };
        this.update();
    }

    /** Update route + actor selection (T4 UI hook for T8). */
    selectRoute(route: string, actor: string): void {
        this.state = { ...this.state, route, actor };
        this.update();
    }

    /** Read-only access for tests / parity assertions. */
    get currentState(): AgenticControlRoomState {
        return this.state;
    }

    protected toggleAxiomTranslationStep = (stepId: string): void => {
        this.state = {
            ...this.state,
            expandedAxiomTranslationStepId:
                this.state.expandedAxiomTranslationStepId === stepId ? null : stepId
        };
        this.update();
    };

    protected openAxiomTranslationSource = (coordinate: string, sourceAnchor: string): void => {
        void this.commands.executeCommand('backend-studio.openSource', {
            coordinate,
            sourceAnchor
        });
    };

    protected openDispatchSource = (node: DispatchTraceNode): void => {
        if (!node.coordinate || !node.sourceAnchor) {
            return;
        }
        void this.commands.executeCommand('backend-studio.openSource', node.coordinate, node.sourceAnchor);
    };

    protected openEvidencePacket = (packetId: string): void => {
        void this.commands.executeCommand('pratibimba.ide-shell-m0-m5.evidence-panel.open', {
            requestedEvidenceRecordId: packetId,
            evidenceRecordId: packetId,
            requestedExtensionId: 'ide-shell-m0-m5',
            requestedContributionId: 'evidence-panel'
        });
    };

    protected invokeRuntimeControl = (action: RuntimeControlAction, run: Run): void => {
        this.state = { ...this.state, lastRuntimeControl: `${action}:${run.id}` };
        this.update();
        void this.bridge.invokeCapability({
            method: 'invokeGatewayRpc',
            sessionKey: this.state.sessionKey ?? 'acr-runtime-control',
            params: {
                gatewayMethod: "s5'.epii.runtime_control",
                action,
                runId: run.id
            },
            profileGeneration: this.state.profileGeneration ?? this.bridge.cachedProfile?.generation ?? null,
            provenanceHandles: [],
            vak: null
        });
    };

    protected depositEvidence = (packet: MediatedRunEvidencePacket): void => {
        this.state = {
            ...this.state,
            evidencePacket: packet,
            lastDepositId: packet.id
        };
        this.update();
        void this.bridge.invokeCapability({
            method: 'invokeGatewayRpc',
            sessionKey: packet.sessionKey ?? this.state.sessionKey ?? 'acr-evidence-deposit',
            params: {
                gatewayMethod: "s5'.epii.deposit",
                packet
            },
            profileGeneration: packet.profileGeneration ?? this.state.profileGeneration ?? this.bridge.cachedProfile?.generation ?? null,
            provenanceHandles: [],
            vak: null
        });
    };

    protected submitReviewDecision = (decision: ReviewDecisionAction, reviewId: string): void => {
        this.state = { ...this.state, lastReviewDecision: `${decision}:${reviewId}` };
        this.update();
        void this.bridge.invokeCapability({
            method: 'invokeGatewayRpc',
            sessionKey: this.state.sessionKey ?? 'acr-review-transition',
            params: {
                gatewayMethod: "s5'.review.transition",
                reviewId,
                decision
            },
            profileGeneration: this.state.profileGeneration ?? this.bridge.cachedProfile?.generation ?? null,
            provenanceHandles: [],
            vak: null
        });
    };

    protected override render(): React.ReactNode {
        return (
            <IdeShellBridgeGate
                bridge={this.bridge}
                widgetLabel={AgenticControlRoomWidget.LABEL}
            >
                {this.renderControlRoom()}
            </IdeShellBridgeGate>
        );
    }

    protected renderControlRoom(): React.ReactNode {
        const matrix = this.state.matrix;
        const dispatchTrace = this.createDispatchTrace(matrix);
        const activeRun = this.state.activeRun;
        const reviewParity = this.createReviewParity(matrix, activeRun);
        return (
            <div
                className="ide-shell-widget-root"
                data-test="agentic-control-room-root"
                data-feature-dr_m5_1_roster_collapse={DR_M5_1_ROSTER_COLLAPSE ? 'true' : 'false'}
            >
                <header className="ide-shell-widget-header">
                    <h3>{AgenticControlRoomWidget.LABEL}</h3>
                    <span data-test="agentic-control-room-shell-version">T8 governance surface</span>
                </header>
                <PiRuntimeMonitorBanner />
                {/* 28.18 status-bar consumption contract: coordinate/sessionKey/dayNow/profileGeneration
                    rendered in VAK fields below MUST consume from SharedBridgeAdapter projection
                    (bridge.cachedProfile?.generation, bridge.cachedCoordinateContext?.coordinate),
                    NOT from own widget state. 15.10 owns status-bar build; 28.18 adds consumption-only contract. */}
                <section
                    className="ide-shell-widget-detail"
                    data-test="agentic-control-room-vak-fields"
                >
                    <h4>
                        VAK evaluation fields
                        <BridgeReadinessBadge
                            bridge={this.bridge}
                            bindingKey="agentic-control-room.route"
                        />
                    </h4>
                    <dl>
                        <dt>Route</dt>
                        <dd data-test="acr-route">{this.state.route ?? '(no route selected)'}</dd>
                        <dt>Actor</dt>
                        <dd data-test="acr-actor">{this.state.actor ?? '(no actor selected)'}</dd>
                        <dt>Coordinate</dt>
                        <dd data-test="acr-coordinate">{this.state.coordinate ?? '—'}</dd>
                        <dt>Session key</dt>
                        <dd data-test="acr-session-key">{this.state.sessionKey ?? '—'}</dd>
                        <dt>DAY/NOW</dt>
                        <dd data-test="acr-day-now">{this.state.dayNow ?? '—'}</dd>
                        <dt>Profile generation</dt>
                        <dd data-test="acr-profile-generation">
                            {this.state.profileGeneration ?? this.bridge.cachedProfile?.generation ?? '—'}
                        </dd>
                    </dl>
                </section>
                <section
                    className="ide-shell-widget-detail"
                    data-test="agentic-control-room-capability-tree"
                >
                    <h4>
                        Capability tree (IOD-17 governance — capability-matrix.json)
                        <BridgeReadinessBadge
                            bridge={this.bridge}
                            bindingKey="capability-matrix"
                        />
                    </h4>
                    {this.state.matrixError !== null && (
                        <p className="ide-shell-error" data-test="acr-matrix-error">
                            {this.state.matrixError}
                        </p>
                    )}
                    {matrix !== null && (
                        <div>
                            <dl>
                                <dt>Coordinate</dt>
                                <dd data-test="acr-matrix-coordinate">{matrix.coordinate}</dd>
                                <dt>Owner agent</dt>
                                <dd data-test="acr-matrix-owner-agent">{matrix.owner_agent}</dd>
                                <dt>Package role</dt>
                                <dd data-test="acr-matrix-package-role">{matrix.package_role}</dd>
                            </dl>
                            <h5>DR-M5-1 roster collapse</h5>
                            <ul data-test="acr-roster-collapse">
                                <li data-test="acr-roster-pi">
                                    Pi — single harness
                                    {' '}(<span data-test="acr-roster-pi-agent-kind">{this.agentKind(matrix)}</span>)
                                </li>
                                <li data-test="acr-roster-anima">Anima — main dispatcher</li>
                                <li data-test="acr-roster-aletheia">
                                    Aletheia — crystallisation-mode techne guardians
                                    <ul data-test="acr-aletheia-subagents">
                                        {ALETHEIA_SUBAGENTS.map(subagent => (
                                            <li key={subagent} data-test={`acr-aletheia-subagent-${subagent}`}>
                                                {subagent}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                            <h5>Psyche facets</h5>
                            <ul data-test="acr-psyche-facet-badges">
                                {this.psycheFacets(matrix).map(agent => (
                                    <li key={agent} data-test={`acr-psyche-facet-${agent}`}>
                                        {agent}
                                    </li>
                                ))}
                            </ul>
                            <h5>Dispatch tools</h5>
                            <ul data-test="acr-dispatch-tools">
                                {dispatchToolNames(matrix).map(name => (
                                    <li key={name} data-test={`acr-dispatch-tool-${name}`}>
                                        <code>{name}</code>
                                    </li>
                                ))}
                            </ul>
                            <h5>Skills</h5>
                            <ul data-test="acr-skills">
                                {skillNames(matrix).map(name => (
                                    <li key={name} data-test={`acr-skill-${name}`}>
                                        <code>{name}</code>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
                <section
                    className="ide-shell-widget-detail"
                    data-test="agentic-control-room-t8-host"
                >
                    <h4>Governance run audit</h4>
                    <RunTree
                        dispatchTrace={dispatchTrace}
                        onNodeClick={this.openDispatchSource}
                        onEvidenceClick={this.openEvidencePacket}
                    />
                    <h4>Tool stream</h4>
                    <ToolStream tools={this.state.tools} />
                    <h4>Runtime controls</h4>
                    <AbortRetryContinueControls
                        run={activeRun}
                        disabled={activeRun?.humanRequired !== false}
                        onControl={this.invokeRuntimeControl}
                    />
                    <h4>Evidence deposit</h4>
                    <EvidenceDepositForm
                        initialPacket={this.state.evidencePacket}
                        onDeposit={this.depositEvidence}
                    />
                    {this.state.lastDepositId && (
                        <p data-test="acr-last-deposit-id">last deposit: {this.state.lastDepositId}</p>
                    )}
                    <h4>Review decision</h4>
                    <ReviewDecisionControls
                        reviewId={this.state.activeReviewId ?? activeRun?.reviewId ?? 'unselected-review'}
                        iod17Parity={reviewParity}
                        humanRequired={activeRun?.humanRequired ?? true}
                        onDecision={this.submitReviewDecision}
                    />
                    {this.state.lastRuntimeControl && (
                        <p data-test="acr-last-runtime-control">{this.state.lastRuntimeControl}</p>
                    )}
                    {this.state.lastReviewDecision && (
                        <p data-test="acr-last-review-decision">{this.state.lastReviewDecision}</p>
                    )}
                    <h4>Aletheia subagent trace</h4>
                    <div data-test="acr-aletheia-subagent-traces">
                        {this.aletheiaTraceNodes(dispatchTrace).map((node, index) => (
                            <AletheiaSubagentTrace
                                key={node.id}
                                subagent={node.aletheiaSubagent as AletheiaSubagent}
                                subtrace={node}
                                vetoRecord={index === 1
                                    ? {
                                        reason: 'Boundary review requested; final decision remains with the human gate.',
                                        raisedAt: node.tickAtInvoke ?? Date.now()
                                    }
                                    : undefined}
                            />
                        ))}
                    </div>
                </section>
                <section
                    className="ide-shell-widget-detail"
                    data-test="agentic-control-room-pi-axiom-translation-host"
                >
                    {this.state.axiomTranslationError !== null && (
                        <p className="ide-shell-error" data-test="pi-axiom-translation-error">
                            {this.state.axiomTranslationError}
                        </p>
                    )}
                    <PiAxiomTranslationInspector
                        model={createPiAxiomTranslationViewModel(
                            this.state.axiomTranslationSessions,
                            this.state.selectedAxiomTranslationSessionId
                        )}
                        expandedStepId={this.state.expandedAxiomTranslationStepId}
                        onToggleStep={this.toggleAxiomTranslationStep}
                        onOpenSource={this.openAxiomTranslationSource}
                    />
                </section>
            </div>
        );
    }

    protected agentKind(matrix: CapabilityMatrix): string {
        const kind = matrix.agent_kind;
        return typeof kind === 'string' && kind.trim().length > 0 ? kind : 'single-agent-harness';
    }

    protected psycheFacets(matrix: CapabilityMatrix): readonly string[] {
        const deprecated = matrix.anima_authorial_registers_deprecated;
        if (Array.isArray(deprecated)) {
            return deprecated.filter((value): value is string => typeof value === 'string');
        }
        return matrix.constitutional_agents;
    }

    protected createDispatchTrace(matrix: CapabilityMatrix | null): DispatchTraceNode {
        const coordinate = matrix?.coordinate ?? "S4/S4'";
        const owner = matrix?.owner_agent ?? 'anima';
        return {
            id: 'pi',
            label: 'Pi harness',
            actor: 'pi',
            coordinate,
            sourceAnchor: 'Body/S/S4/pi-agent/agents/anima.md',
            methodOrSkill: 'single-agent-harness',
            tickAtInvoke: this.bridge.cachedProfile?.generation ?? this.state.profileGeneration ?? null,
            mediatedRunEvidencePacketId: this.state.evidencePacket?.id ?? null,
            children: [
                {
                    id: 'anima',
                    label: 'Anima dispatcher',
                    actor: 'anima',
                    coordinate,
                    sourceAnchor: 'Body/S/S4/plugins/pleroma/capability-matrix.json',
                    methodOrSkill: owner,
                    tickAtInvoke: this.bridge.cachedProfile?.generation ?? this.state.profileGeneration ?? null,
                    psycheFacet: 'dispatcher',
                    mediatedRunEvidencePacketId: this.state.evidencePacket?.id ?? null,
                    children: ALETHEIA_SUBAGENTS.map((subagent, index) => ({
                        id: `aletheia-${subagent}`,
                        label: `Aletheia / ${subagent}`,
                        actor: 'aletheia',
                        coordinate,
                        sourceAnchor: 'Body/S/S4/plugins/pleroma/capability-matrix.json',
                        methodOrSkill: `crystallisation-mode:${subagent}`,
                        tickAtInvoke: (this.bridge.cachedProfile?.generation ?? this.state.profileGeneration ?? 0) + index,
                        aletheiaSubagent: subagent,
                        mediatedRunEvidencePacketId: this.state.evidencePacket?.id ?? null
                    }))
                }
            ]
        };
    }

    protected aletheiaTraceNodes(dispatchTrace: DispatchTraceNode): readonly DispatchTraceNode[] {
        return dispatchTrace.children?.[0]?.children?.filter(
            (node): node is DispatchTraceNode & { readonly aletheiaSubagent: AletheiaSubagent } =>
                ALETHEIA_SUBAGENTS.includes(node.aletheiaSubagent as AletheiaSubagent)
        ) ?? [];
    }

    protected createReviewParity(matrix: CapabilityMatrix | null, activeRun: Run | null): IOD17Parity {
        const widgetState = activeRun?.humanRequired ? 'human-required' : 'agent-actionable';
        const capabilityMatrixState = matrix === null ? 'matrix-unloaded' : 'human-required';
        const agentContractState = 'human-required';
        const inParity = capabilityMatrixState === agentContractState && agentContractState === widgetState;
        return {
            inParity,
            capabilityMatrixState,
            agentContractState,
            widgetState,
            drift: inParity ? [] : ['capability-matrix', 'agent-contract', 'widget']
        };
    }
}
