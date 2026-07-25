/**
 * Coordinate: M' M4' (resonance indicator render surface — Track 05.T5.1)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the §6.5 lean rendering — a resonance chip per artifact
 *   envelope and the day-resonance strip on the day surface (numeric +
 *   Major/Minor/Shadow + pending count). No quaternion-dump: only the
 *   indicator label, character, and counts ever reach the DOM; sourceHandle
 *   stays a title-attribute handle reference (handle-only per DR-M4-3).
 * Public surface: NaraResonanceChip, NaraDayResonanceStrip,
 *   NaraKleinWeightingChip.
 * Does NOT own: indicator/summary law (m4NaraResonance.ts), Klein weighting
 *   law (m4NaraKleinWeighting.ts), the resonance computation (portal-core),
 *   vault listing (vault service), the kernel tick (useTickStore), pane
 *   composition.
 */

import { privacyChrome } from '../ui/privacyChrome';
import { useCallback, useEffect, useState } from 'react';
import { invokeCommand, listenEvent } from '../bridge/tauri';
import { useTickStore } from '../state/stores';
import { VaultEntry } from './FileTreePane';
import {
    kleinWeightingFromNowContent,
    latestSessionNowPath,
    NaraKleinWeighting,
    pendingKleinWeighting
} from './m4NaraKleinWeighting';
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
 * The §6.5 Klein weighting chip (05.T5.15): the prospective/retrospective
 * weight read from `c_3_klein_weighting` in the day's latest session NOW
 * frontmatter. Sessions without the key (today's reality — Janus's default
 * computation is spec-ahead, canvas-spec §4.3) render the honest
 * `pending-weighting` state; a weighting is never fabricated.
 */
export function NaraKleinWeightingChip({ dayNow }: { dayNow: string }) {
    const [weighting, setWeighting] = useState<NaraKleinWeighting>(pendingKleinWeighting());
    const dayPath = `Empty/Present/${dayNow}`;

    const load = useCallback(() => {
        invokeCommand<VaultEntry[]>('vault_list', { path: dayPath })
            .then(entries => {
                const nowPath = latestSessionNowPath(entries);
                if (nowPath === null) {
                    setWeighting(pendingKleinWeighting());
                    return;
                }
                return invokeCommand<{ path: string; content: string }>('vault_read', {
                    path: nowPath
                }).then(file => setWeighting(kleinWeightingFromNowContent(file.content, nowPath)));
            })
            .catch(() => setWeighting(pendingKleinWeighting()));
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

    return (
        <span
            className={`nara-klein-weighting-chip nara-klein-${weighting.state}`}
            data-testid="nara-klein-weighting"
            data-state={weighting.state}
            data-prospective={weighting.prospective ?? ''}
            data-retrospective={weighting.retrospective ?? ''}
            title={weighting.sourcePath ?? undefined}
        >
            {weighting.label}
        </span>
    );
}

/**
 * The day-summary strip: at-now resonance (kernel profile) beside the
 * aggregate over the day's artifact envelopes and the Klein weighting chip.
 * Envelopes are listed from the real Present day folder; deposition does not
 * stamp the §6.6 `resonance` field yet (spec-ahead), so listed artifacts
 * aggregate as pending until the stamping seam lands — the pending-resonance
 * fallback is the honest state.
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
            className={`nara-resonance-strip ${privacyChrome('protected_local_handle_only').className}`}
            title={privacyChrome('protected_local_handle_only').title}
            data-testid="nara-day-resonance"
            data-state={summary.state}
        >
            <NaraResonanceChip indicator={nowIndicator} testId="nara-resonance-now" />
            <NaraKleinWeightingChip dayNow={dayNow} />
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
