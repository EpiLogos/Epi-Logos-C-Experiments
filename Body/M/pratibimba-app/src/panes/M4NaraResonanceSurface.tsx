/**
 * Coordinate: M' M4' (resonance indicator render surface — Track 05.T5.1)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the §6.5 lean rendering — a resonance chip per artifact
 *   envelope and the day-resonance strip on the day surface (numeric +
 *   Major/Minor/Shadow + pending count). No quaternion-dump: only the
 *   indicator label, character, and counts ever reach the DOM; sourceHandle
 *   stays a title-attribute handle reference (handle-only per DR-M4-3).
 * Public surface: NaraResonanceChip, NaraDayResonanceStrip.
 * Does NOT own: indicator/summary law (m4NaraResonance.ts), the resonance
 *   computation (portal-core), vault listing (vault service), the kernel
 *   tick (useTickStore), pane composition.
 */

import { useCallback, useEffect, useState } from 'react';
import { invokeCommand, listenEvent } from '../bridge/tauri';
import { useTickStore } from '../state/stores';
import { VaultEntry } from './FileTreePane';
import {
    NaraArtifactResonanceSource,
    NaraResonanceIndicator,
    resonanceIndicatorFromProfile,
    summarizeDayResonance
} from './m4NaraResonance';

/** The §6.5 indicator chip — label + character only, never the interior. */
export function NaraResonanceChip({
    indicator,
    testId
}: {
    indicator: NaraResonanceIndicator;
    testId: string;
}) {
    const character = indicator.conjugateFormCharacter;
    return (
        <span
            className={`nara-resonance-chip nara-resonance-${indicator.state}${
                character ? ` nara-resonance-${character.toLowerCase()}` : ''
            }`}
            data-testid={testId}
            data-state={indicator.state}
            data-character={character ?? ''}
            title={indicator.sourceHandle ?? undefined}
        >
            {indicator.label}
        </span>
    );
}

/**
 * The day-summary strip: at-now resonance (kernel profile) beside the
 * aggregate over the day's artifact envelopes. Envelopes are listed from the
 * real Present day folder; deposition does not stamp the §6.6 `resonance`
 * field yet (spec-ahead), so listed artifacts aggregate as pending until the
 * stamping seam lands — the pending-resonance fallback is the honest state.
 */
export function NaraDayResonanceStrip({ dayNow }: { dayNow: string }) {
    const cached = useTickStore(s => s.profile);
    const nowIndicator = resonanceIndicatorFromProfile(cached?.profile ?? null);
    const [artifacts, setArtifacts] = useState<readonly NaraArtifactResonanceSource[]>([]);
    const dayPath = `Empty/Present/${dayNow}`;

    const load = useCallback(() => {
        invokeCommand<VaultEntry[]>('vault_list', { path: dayPath })
            .then(entries =>
                setArtifacts(
                    entries
                        .filter(entry => !entry.isDir && entry.name !== 'daily-note.md')
                        .map(entry => ({ artifactPath: entry.path }))
                )
            )
            .catch(() => setArtifacts([]));
    }, [dayPath]);

    useEffect(() => {
        load();
        let unlisten: (() => void) | undefined;
        void listenEvent<string[]>('vault://changed', paths => {
            if (paths.some(p => p.startsWith(dayPath))) {
                load();
            }
        }).then(u => {
            unlisten = u;
        });
        return () => unlisten?.();
    }, [load, dayPath]);

    const summary = summarizeDayResonance(artifacts);
    return (
        <div
            className="nara-resonance-strip"
            data-testid="nara-day-resonance"
            data-state={summary.state}
        >
            <NaraResonanceChip indicator={nowIndicator} testId="nara-resonance-now" />
            <span className="nara-day-resonance-label" data-testid="nara-day-resonance-label">
                {summary.label}
            </span>
            <span className="nara-day-resonance-counts" data-testid="nara-day-resonance-counts">
                Major {summary.byConjugateFormCharacter.Major} · Minor{' '}
                {summary.byConjugateFormCharacter.Minor} · Shadow{' '}
                {summary.byConjugateFormCharacter.Shadow} · pending {summary.pendingCount}
            </span>
        </div>
    );
}
