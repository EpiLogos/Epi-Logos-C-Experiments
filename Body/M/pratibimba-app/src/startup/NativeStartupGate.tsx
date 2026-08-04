/**
 * Coordinate: M' native startup gate
 * Residency: Body/M/pratibimba-app/src/startup
 * Position (#n): #0 - visible carrier readiness boundary
 * Actualises: the compact repair surface shown before the native workbench can
 *   truthfully reveal itself.
 * Public surface: NativeStartupGate.
 * Does NOT own: startup state derivation or any runtime dependency.
 */

import type { NativeStartupState } from './nativeStartup';

interface NativeStartupGateProps {
    readonly state: Exclude<NativeStartupState, { ready: true }>;
    readonly onRetry: () => void;
}

export function NativeStartupGate({ state, onRetry }: NativeStartupGateProps) {
    const retryable = state.phase === 'blocked' || state.phase === 'awaiting-vault';
    return (
        <main className="native-startup" data-testid="native-startup" data-phase={state.phase}>
            <section className="native-startup-status" aria-live="polite">
                <span className="native-startup-mark" aria-hidden="true" />
                <p>{state.detail}</p>
                {retryable ? (
                    <button type="button" onClick={onRetry}>
                        Retry
                    </button>
                ) : null}
            </section>
        </main>
    );
}
