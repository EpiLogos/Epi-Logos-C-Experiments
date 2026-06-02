import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { ACCEPTANCE_WIDGET_IDS, TRACK_05_T9_ACCEPTANCE_PLAN } from '../common';
import { ACCEPTANCE_RUNNER, type AcceptanceRunner, type AcceptanceState } from './acceptance-runner';

@injectable()
export class HarnessControlWidget extends ReactWidget {
    static readonly ID = ACCEPTANCE_WIDGET_IDS.HARNESS_CONTROL;
    static readonly LABEL = 'Acceptance Harness';

    @inject(ACCEPTANCE_RUNNER)
    protected readonly runner!: AcceptanceRunner;

    protected state: AcceptanceState | null = null;
    protected dispose1: (() => void) | null = null;

    @postConstruct()
    protected init(): void {
        this.id = HarnessControlWidget.ID;
        this.title.label = HarnessControlWidget.LABEL;
        this.title.caption = HarnessControlWidget.LABEL;
        this.title.closable = true;
        this.addClass('acceptance-widget');
        this.state = this.runner.state;
        const sub = this.runner.onChange(s => {
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
        const s = this.state ?? this.runner.state;
        return (
            <div className="acceptance-widget-root" data-test="acceptance-harness-root">
                <h3>{HarnessControlWidget.LABEL}</h3>
                <p>
                    plan: <code data-test="acceptance-plan-id">{TRACK_05_T9_ACCEPTANCE_PLAN.id}</code>{' '}
                    v<code data-test="acceptance-plan-version">{TRACK_05_T9_ACCEPTANCE_PLAN.version}</code>
                </p>
                <p>
                    running:{' '}
                    <code data-test="acceptance-running">{s.running ? 'yes' : 'no'}</code>
                    {' | '}current step:{' '}
                    <code data-test="acceptance-current-step">{s.currentStepId ?? '—'}</code>
                </p>
                <p>
                    bridge subscription stable across layout switch:{' '}
                    <code data-test="acceptance-bridge-stable">
                        {s.bridgeSubscriptionStableAcrossSwitch === null
                            ? '(not yet run)'
                            : s.bridgeSubscriptionStableAcrossSwitch
                            ? 'true'
                            : 'FALSE — leak detected'}
                    </code>
                </p>
                <p>
                    boot profile generation:{' '}
                    <code data-test="acceptance-boot-generation">
                        {s.profileGenerationAtBoot ?? 'pending'}
                    </code>
                </p>
                <button
                    type="button"
                    onClick={() => void this.runner.run()}
                    disabled={s.running}
                    data-test="acceptance-run-button"
                >
                    Run acceptance plan
                </button>
                <ul data-test="acceptance-step-list">
                    {s.records.map(r => (
                        <li
                            key={r.step.id}
                            data-test={`acceptance-step-${r.step.id}`}
                            data-status={r.status}
                        >
                            <strong>{r.step.id}</strong> — {r.status}
                            {r.errored && <p className="acceptance-error">{r.errored}</p>}
                            {r.handles.length > 0 && (
                                <ul>
                                    {r.handles.map(h => (
                                        <li key={h}>
                                            <code>{h}</code>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
                {s.errors.length > 0 && (
                    <ul className="acceptance-error-list" data-test="acceptance-errors">
                        {s.errors.map((e, i) => (
                            <li key={i}>{e}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}
