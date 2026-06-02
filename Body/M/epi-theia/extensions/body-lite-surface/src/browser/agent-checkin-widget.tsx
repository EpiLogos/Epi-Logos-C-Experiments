import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { CommandService } from '@theia/core/lib/common/command';
import {
    BODY_DEEP_LINK_COMMAND_IDS,
    BODY_LITE_WIDGET_IDS,
    type AgentCheckInSnapshot
} from '../common';
import { BodyLiteRuntimeService } from './body-lite-runtime-service';

/**
 * Agent Check-In Widget — Track 09 T9b.
 *
 * Renders in the 0/1 daily layout ONLY. Shows the currently running
 * agent runs (route + actor + capacity), the run id, and an abort-from-
 * glance affordance that deep-links into the deep IDE Agentic Control
 * Room to perform the actual abort (the lite surface NEVER calls the
 * gateway directly for control actions).
 */
@injectable()
export class AgentCheckInWidget extends ReactWidget {
    static readonly ID = BODY_LITE_WIDGET_IDS.AGENT_CHECKIN;
    static readonly LABEL = 'Agent Check-In';

    @inject(BodyLiteRuntimeService)
    protected readonly runtime!: BodyLiteRuntimeService;

    @inject(CommandService)
    protected readonly commands!: CommandService;

    protected snapshot: AgentCheckInSnapshot;

    constructor() {
        super();
        this.snapshot = { activeRunCount: 0, runs: [], snapshotAtMs: 0 };
    }

    @postConstruct()
    protected init(): void {
        this.id = AgentCheckInWidget.ID;
        this.title.label = AgentCheckInWidget.LABEL;
        this.title.caption = AgentCheckInWidget.LABEL;
        this.title.closable = false;
        this.addClass('body-lite-widget');
        this.addClass('body-lite-agent-checkin');
        this.runtime.onChange(state => {
            this.snapshot = state.agentCheckIns;
            this.update();
        });
    }

    protected handleAbortDeepLink = async (runId: string): Promise<void> => {
        // Aborts are NOT performed from /body — only deep-linked to. The
        // control-room contribution in the deep IDE owns the abort capability
        // call. This widget routes via the typed open-control-room intent
        // with the runId pre-focused.
        await this.commands.executeCommand(BODY_DEEP_LINK_COMMAND_IDS.OPEN_CONTROL_ROOM, {
            focusCandidateId: null,
            focusRunId: runId,
            coordinate: null,
            reviewId: null,
            improvementId: null,
            artifactUri: null,
            sessionKey: null,
            dayNow: null,
            profileGeneration: null,
            privacyClass: 'public'
        });
    };

    protected override render(): React.ReactNode {
        return (
            <div className="body-lite-card">
                <header>
                    <span className="body-lite-badge-count" aria-label="active agent runs">
                        {this.snapshot.activeRunCount}
                    </span>
                    <span className="body-lite-title">Agent Check-In</span>
                </header>
                {this.snapshot.runs.length === 0 ? (
                    <p className="body-lite-empty">No agents running.</p>
                ) : (
                    <ul className="body-lite-run-list">
                        {this.snapshot.runs.map(run => (
                            <li key={run.runId}>
                                <span className="body-lite-run-route">{run.route}</span>
                                <span className="body-lite-run-actor"> → {run.actor}</span>
                                {run.capacity ? (
                                    <span className="body-lite-run-capacity">[{run.capacity}]</span>
                                ) : null}
                                <span className="body-lite-run-id" title={run.runId}>
                                    {run.runId.slice(0, 12)}
                                </span>
                                <button
                                    type="button"
                                    className="body-lite-cta-inline"
                                    onClick={() => this.handleAbortDeepLink(run.runId)}
                                    aria-label={`open control room for run ${run.runId}`}
                                >
                                    inspect
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}
