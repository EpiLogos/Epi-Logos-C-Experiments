/**
 * Coordinate: M' M4' (Kairos enablement pane - 32.T32.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): post-PASU optional onboarding surface
 * Actualises: the three-card informed opt-in UI over the strict Kairos
 *   preference/probe/refresh contract.
 * Public surface: KairosEnablementPane.
 * Does NOT own: Kerykeion, PASU, planetary computation, or gateway transport.
 * Contract: [[M4'-SPEC]] / [[CHROME-CONTRACT]].
 * Ported from: Body/M/epi-theia/extensions/m-extension-runtime/src/browser/
 *   onboarding/kairos-enablement-step.tsx.
 */

import { useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import {
    KAIROS_ENABLED_PREFERENCE,
    browserKairosPreferences,
    readKairosEnabled,
    runKairosEnable,
    runKairosSkip,
    type KairosEnableResult
} from './kairosEnablement';

const KAIROS_CARDS = [
    {
        title: 'What kairos is',
        body:
            'Kairos is the live astrological time-signal. When enabled, your widgets carry the current ' +
            'planet positions from kerykeion. Mercurius is the agent that fetches and routes them.'
    },
    {
        title: 'Privacy + dependency',
        body:
            'Kairos requires the kerykeion Python library on your machine. We will probe for it. ' +
            'Your birth data (PASU.md) stays local; only resolved degree values cross into M4_Temporal_Now.'
    },
    {
        title: 'Enable or skip',
        body:
            'Enable the local live-sky feed now, or continue without it. You can return here later from ' +
            'the personal face.'
    }
] as const;

function relayText(result: KairosEnableResult | 'skipped' | null, enabled: boolean): string {
    if (result === 'skipped') return 'Kairos disabled - onboarding step skipped.';
    if (result?.outcome === 'enabled') return `Kairos active - refreshed ${result.refreshedAt}`;
    if (result?.outcome === 'unavailable' || result?.outcome === 'refresh-failed') return result.message;
    return enabled ? 'Kairos enabled - awaiting refresh.' : 'Kairos disabled';
}

export function KairosEnablementPane() {
    const preferences = useMemo(() => browserKairosPreferences(localStorage), []);
    const [cardIndex, setCardIndex] = useState(0);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<KairosEnableResult | 'skipped' | null>(null);
    const [enabled, setEnabled] = useState(() => readKairosEnabled(preferences.get(KAIROS_ENABLED_PREFERENCE)));
    const card = KAIROS_CARDS[cardIndex];
    const finalCard = cardIndex === KAIROS_CARDS.length - 1;

    const enable = () => {
        setBusy(true);
        void runKairosEnable({
            preferences,
            invokeGatewayRpc: async (method, params) => (await gateway().invoke(method, params)).artifact
        })
            .then(next => {
                setResult(next);
                setEnabled(next.outcome === 'enabled' || next.outcome === 'refresh-failed');
            })
            .finally(() => setBusy(false));
    };

    const skip = () => {
        runKairosSkip(preferences);
        setEnabled(false);
        setResult('skipped');
    };

    return (
        <section className="kairos-enablement-pane" data-testid="kairos-enablement-pane">
            <header className="kairos-enablement-header">
                <div>
                    <strong>Kairos enablement</strong>
                    <span>Ambient live-sky ingress, distinct from natal identity</span>
                </div>
                <span className="kairos-card-progress">{cardIndex + 1} / {KAIROS_CARDS.length}</span>
            </header>

            <article className="kairos-enablement-card" data-testid="kairos-card">
                <h2>{card.title}</h2>
                <p>{card.body}</p>
            </article>

            <div
                className="kairos-relay-indicator"
                data-testid="kairos-relay"
                data-state={result && result !== 'skipped' ? result.outcome : enabled ? 'enabled' : 'disabled'}
                role="status"
                aria-live="polite"
            >
                {relayText(result, enabled)}
            </div>

            <footer className="kairos-enablement-actions">
                {cardIndex > 0 ? (
                    <button type="button" onClick={() => setCardIndex(index => index - 1)} disabled={busy}>
                        Back
                    </button>
                ) : null}
                {!finalCard ? (
                    <button type="button" onClick={() => setCardIndex(index => index + 1)} disabled={busy}>
                        Next
                    </button>
                ) : (
                    <>
                        <button type="button" onClick={enable} disabled={busy || result === 'skipped'}>
                            Enable kairos
                        </button>
                        <button type="button" onClick={skip} disabled={busy}>
                            Continue without kairos
                        </button>
                    </>
                )}
            </footer>
        </section>
    );
}
