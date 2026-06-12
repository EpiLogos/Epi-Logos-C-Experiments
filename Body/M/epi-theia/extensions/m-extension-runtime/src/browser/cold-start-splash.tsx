import * as React from 'react';

/**
 * The matheme glyph (`#`) — the inversion act that grounds the whole coordinate
 * space. Rendered as the cold-start banner header so the splash reads as a
 * harmonic-profile boot, not a generic spinner.
 */
export const MATHEME_GLYPH = '#';

/**
 * Human-readable label per cold-start stage. The orchestrator's literal state
 * strings are surfaced verbatim under the label as a diagnostic marker.
 */
const STAGE_LABELS: Readonly<Record<string, string>> = Object.freeze({
    'initializing': 'Initializing kernel bridge',
    'awaiting-bridge': 'Awaiting bridge subscription',
    'awaiting-handshake': 'Verifying S2/S3 handshake',
    'awaiting-readiness': 'Evaluating M-extension readiness',
    'pasu-identity': 'Awaiting PASU identity',
    'kairos-enablement': 'Kairos enablement',
    'splash-visible': 'Delivering first harmonic profile',
    'dismissed': 'Ready'
});

export interface ColdStartSplashProps {
    readonly stage: string;
    readonly onDismiss: () => void;
    readonly kairosEnablement?: React.ReactNode;
}

/**
 * Non-blocking cold-start overlay. The dismiss button is always active so the
 * user can skip ahead on first-ready even while later stages remain blocked —
 * the overlay never traps the workbench.
 */
export const ColdStartSplash: React.FC<ColdStartSplashProps> = ({ stage, onDismiss, kairosEnablement }) => {
    const label = STAGE_LABELS[stage] ?? stage;
    return (
        <div className="mext-cold-start" role="status" aria-live="polite" data-stage={stage}>
            <div className="mext-cold-start-panel">
                <header className="mext-cold-start-header">
                    <span className="mext-cold-start-glyph" aria-hidden="true">
                        {MATHEME_GLYPH}
                    </span>
                    <h1 className="mext-cold-start-title">Matheme Harmonic Profile</h1>
                </header>
                <div className="mext-cold-start-stage">
                    <span className="mext-cold-start-stage-label">{label}</span>
                    <code className="mext-cold-start-stage-code">{stage}</code>
                </div>
                {stage === 'kairos-enablement' && kairosEnablement}
                <button
                    type="button"
                    className="theia-button mext-cold-start-dismiss"
                    onClick={() => onDismiss()}
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
};
