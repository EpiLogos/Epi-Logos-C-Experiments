import * as React from 'react';

export function PiRuntimeMonitorBanner(): React.ReactElement {
    return (
        <section className="ide-shell-widget-detail" data-test="acr-pi-runtime-monitor-banner">
            <strong>Pi runtime monitoring</strong>
            <p>
                Pi runtime monitoring — dispatch traces, tool streams, capacity-workflow runs.
                Single agent harness; Anima dispatches; Aletheia subagents surface in
                crystallisation-mode.
            </p>
        </section>
    );
}
