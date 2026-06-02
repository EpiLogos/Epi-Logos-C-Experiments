import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { ACR_RUNTIME_SERVICE, type AgenticControlRoomRuntimeService, type RunState } from './acr-runtime-service';
import { ACR_WIDGET_IDS } from '../common';
import { missingEvidenceFields, type ReviewDecision } from '../common/run-model';

/**
 * Run flow widget — Track 05 T8.
 *
 * Hosts the run tree, tool stream, diagnostics, abort/retry/continue, evidence
 * deposition, and review decision controls in a single workbench surface.
 *
 * The agentic shell from T4 (in @pratibimba/ide-shell-m0-m5) provides the
 * VAK fields + capability tree; this widget provides the run-time mechanics.
 */
@injectable()
export class RunFlowWidget extends ReactWidget {
    static readonly ID = ACR_WIDGET_IDS.RUN_TREE;
    static readonly LABEL = 'Agentic Run Flow';

    @inject(ACR_RUNTIME_SERVICE)
    protected readonly runtime!: AgenticControlRoomRuntimeService;

    protected state: RunState | null = null;
    protected dispose1: (() => void) | null = null;

    @postConstruct()
    protected init(): void {
        this.id = RunFlowWidget.ID;
        this.title.label = RunFlowWidget.LABEL;
        this.title.caption = RunFlowWidget.LABEL;
        this.title.closable = true;
        this.addClass('acr-widget');
        this.addClass('acr-run-flow');
        this.state = this.runtime.state;
        const sub = this.runtime.onChange(s => {
            this.state = s;
            this.update();
        });
        this.dispose1 = () => sub.dispose();
    }

    override dispose(): void {
        if (this.dispose1) {
            try { this.dispose1(); } catch { /* noop */ }
            this.dispose1 = null;
        }
        super.dispose();
    }

    protected override render(): React.ReactNode {
        const s = this.state ?? this.runtime.state;
        const candidate = s.candidate;
        const tree = s.runTree;
        const missingEvidence = s.evidence === null ? null : missingEvidenceFields(s.evidence);
        return (
            <div className="acr-widget-root" data-test="acr-run-flow-root">
                <header className="acr-widget-header">
                    <h3>{RunFlowWidget.LABEL}</h3>
                    <span data-test="acr-run-flow-candidate">
                        candidate: <code>{candidate?.id ?? '—'}</code>
                    </span>
                    {candidate?.humanRequired && (
                        <span
                            className="acr-human-required-pill"
                            data-test="acr-human-required-pill"
                        >
                            HUMAN-REQUIRED
                        </span>
                    )}
                </header>
                <section className="acr-widget-detail" data-test="acr-run-tree">
                    <h4>Run tree</h4>
                    {tree === null ? (
                        <p className="acr-widget-empty" data-test="acr-run-tree-empty">
                            No run yet. Pick a candidate, route, and actor, then start.
                        </p>
                    ) : (
                        <dl>
                            <dt>Run id</dt>
                            <dd data-test="acr-run-id">{tree.id}</dd>
                            <dt>Label</dt>
                            <dd data-test="acr-run-label">{tree.label}</dd>
                            <dt>Status</dt>
                            <dd data-test="acr-run-status">{tree.status}</dd>
                            <dt>Started</dt>
                            <dd data-test="acr-run-started">{tree.startedAtMs}</dd>
                            {tree.endedAtMs !== undefined && (
                                <>
                                    <dt>Ended</dt>
                                    <dd data-test="acr-run-ended">{tree.endedAtMs}</dd>
                                </>
                            )}
                        </dl>
                    )}
                </section>
                <section className="acr-widget-detail" data-test="acr-tool-stream">
                    <h4>Tool stream ({s.toolStream.length} events)</h4>
                    <ul data-test="acr-tool-stream-list">
                        {s.toolStream.map(ev => (
                            <li
                                key={ev.id}
                                data-test={`acr-tool-event-${ev.id}`}
                                data-tool={ev.tool}
                                data-kind={ev.kind}
                            >
                                <code>{ev.emittedAtMs}</code> {ev.tool}.{ev.kind}
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="acr-widget-detail" data-test="acr-diagnostics">
                    <h4>Diagnostics ({s.diagnostics.length})</h4>
                    <ul data-test="acr-diagnostics-list">
                        {s.diagnostics.map((d, i) => (
                            <li key={`${i}-${d.slice(0, 16)}`}>{d}</li>
                        ))}
                    </ul>
                </section>
                <section className="acr-widget-detail acr-controls" data-test="acr-controls">
                    <button
                        type="button"
                        onClick={() => void this.runtime.startRun()}
                        disabled={tree?.status === 'running'}
                        data-test="acr-start-button"
                    >
                        Start
                    </button>
                    <button
                        type="button"
                        onClick={() => this.runtime.abort('user abort')}
                        disabled={tree === null || tree.status !== 'running'}
                        data-test="acr-abort-button"
                    >
                        Abort
                    </button>
                    <button
                        type="button"
                        onClick={() => void this.runtime.retry()}
                        disabled={tree === null}
                        data-test="acr-retry-button"
                    >
                        Retry
                    </button>
                    <button
                        type="button"
                        onClick={() => void this.runtime.continueRun('user continue')}
                        disabled={tree === null}
                        data-test="acr-continue-button"
                    >
                        Continue
                    </button>
                </section>
                <section
                    className="acr-widget-detail"
                    data-test="acr-evidence-deposition"
                >
                    <h4>Evidence deposition</h4>
                    {s.evidence === null ? (
                        <p
                            className="acr-widget-empty"
                            data-test="acr-evidence-empty"
                        >
                            No evidence composed yet.
                        </p>
                    ) : (
                        <dl>
                            <dt>Candidate</dt>
                            <dd data-test="acr-evidence-candidate-id">{s.evidence.candidateId}</dd>
                            <dt>Coordinate</dt>
                            <dd data-test="acr-evidence-coordinate">{s.evidence.coordinate ?? '—'}</dd>
                            <dt>Source anchor</dt>
                            <dd data-test="acr-evidence-source-anchor">{s.evidence.sourceAnchor ?? '—'}</dd>
                            <dt>Graph anchor</dt>
                            <dd data-test="acr-evidence-graph-anchor">{s.evidence.graphAnchor ?? '—'}</dd>
                            <dt>Test anchor</dt>
                            <dd data-test="acr-evidence-test-anchor">{s.evidence.testAnchor ?? '—'}</dd>
                            <dt>Review</dt>
                            <dd data-test="acr-evidence-review-id">{s.evidence.reviewId ?? '—'}</dd>
                            <dt>Bridge readiness</dt>
                            <dd data-test="acr-evidence-bridge-readiness">{s.evidence.bridgeReadinessHandle ?? '—'}</dd>
                            <dt>Session key</dt>
                            <dd data-test="acr-evidence-session-key">{s.evidence.sessionKey ?? '—'}</dd>
                            <dt>DAY/NOW</dt>
                            <dd data-test="acr-evidence-day-now">{s.evidence.dayNowContext ?? '—'}</dd>
                            <dt>Profile generation</dt>
                            <dd data-test="acr-evidence-profile-generation">{s.evidence.profileGeneration ?? '—'}</dd>
                            <dt>Missing fields</dt>
                            <dd data-test="acr-evidence-missing-fields">
                                {(missingEvidence ?? []).join(', ') || 'none'}
                            </dd>
                        </dl>
                    )}
                </section>
                <section
                    className="acr-widget-detail"
                    data-test="acr-review-decision"
                >
                    <h4>Review decision</h4>
                    <p>
                        Last transition:{' '}
                        <code data-test="acr-last-transition-decision">
                            {s.lastTransition?.decision ?? '—'}
                        </code>{' '}
                        by <code>{s.lastTransition?.actor ?? '—'}</code>
                    </p>
                    {(['approve', 'reject', 'revise', 'defer'] as ReviewDecision[]).map(decision => (
                        <button
                            key={decision}
                            type="button"
                            onClick={() =>
                                void this.runtime.submitReviewDecision(
                                    decision,
                                    `${decision} via UI`,
                                    false /* actor is agentic by default; M5 surface flips */
                                )
                            }
                            data-test={`acr-decision-${decision}`}
                            disabled={s.candidate === null}
                        >
                            {decision}
                        </button>
                    ))}
                    {s.humanGateBlocks.length > 0 && (
                        <ul
                            className="acr-human-required-blocks"
                            data-test="acr-human-gate-blocks"
                        >
                            {s.humanGateBlocks.map((block, i) => (
                                <li
                                    key={i}
                                    data-test={`acr-human-gate-block-${i}`}
                                >
                                    {block}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
                {s.errored !== null && (
                    <p className="acr-error" data-test="acr-error">{s.errored}</p>
                )}
            </div>
        );
    }
}
