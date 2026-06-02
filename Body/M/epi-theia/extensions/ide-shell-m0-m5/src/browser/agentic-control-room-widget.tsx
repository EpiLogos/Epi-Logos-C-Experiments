import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import { IDE_SHELL_WIDGET_IDS } from '../common/contract';
import {
    parseCapabilityMatrix,
    dispatchToolNames,
    skillNames,
    type CapabilityMatrix
} from '../common/capability-matrix-types';
import { IdeShellBridgeGate } from './bridge-gate';

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
}

const EMPTY_STATE: AgenticControlRoomState = {
    route: null,
    actor: null,
    coordinate: null,
    sessionKey: null,
    dayNow: null,
    profileGeneration: null,
    matrix: null,
    matrixError: null
};

@injectable()
export class AgenticControlRoomWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.AGENTIC_CONTROL_ROOM;
    static readonly LABEL = 'Agentic Control Room';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

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

    /** Update route + actor selection (T4 UI hook for T8). */
    selectRoute(route: string, actor: string): void {
        this.state = { ...this.state, route, actor };
        this.update();
    }

    /** Read-only access for tests / parity assertions. */
    get currentState(): AgenticControlRoomState {
        return this.state;
    }

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
        return (
            <div className="ide-shell-widget-root" data-test="agentic-control-room-root">
                <header className="ide-shell-widget-header">
                    <h3>{AgenticControlRoomWidget.LABEL}</h3>
                    <span data-test="agentic-control-room-shell-version">T4 shell</span>
                </header>
                <section
                    className="ide-shell-widget-detail"
                    data-test="agentic-control-room-vak-fields"
                >
                    <h4>VAK evaluation fields</h4>
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
                    <h4>Capability tree (IOD-17 governance — capability-matrix.json)</h4>
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
                            <h5>Constitutional agents</h5>
                            <ul data-test="acr-constitutional-agents">
                                {matrix.constitutional_agents.map(agent => (
                                    <li key={agent} data-test={`acr-agent-${agent}`}>
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
                    <h4>Run shell (T8 contents land in agentic-control-room extension)</h4>
                    <p className="ide-shell-widget-empty">
                        T4 provides the workbench host shell; the run tree, tool stream,
                        diagnostics, abort/retry/continue, evidence deposition and review
                        decision controls are contributed by the agentic-control-room
                        extension at Track 05 T8. The kernel-bridge readiness gate and the
                        capability tree above are shared by both tranches.
                    </p>
                </section>
            </div>
        );
    }
}
