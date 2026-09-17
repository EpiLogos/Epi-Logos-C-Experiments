/**
 * Coordinate: M' shell (Wave-C design-system manifest -- Track 20.T20.2)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the active carrier's single, typed index of the ten Wave-C
 *   widget-layer invariants. Later surface, token, and lint tranches consume
 *   this manifest instead of re-declaring their governing enforcement route.
 * Public surface: WaveCDesignInvariant, WAVE_C_DESIGN_SYSTEM_MANIFEST,
 *   WAVE_C_DESIGN_INVARIANT_IDS, validateWaveCDesignSystemManifest,
 *   waveCDesignInvariantFor.
 * Does NOT own: the invariant law (the Seed plan is canonical), any lint
 *   implementation, or a second UI state container.
 */

export type WaveCDesignInvariantId =
    | 'coordinate-primary-navigation'
    | 'profile-tick-primary-ui-clock'
    | 'provenance-always-visible'
    | 'composition-over-juxtaposition'
    | 'no-modal-discipline'
    | 'activity-bar-discipline'
    | 'privacy-class-flow-through'
    | 'tokens-consumed-not-forked'
    | 'chrome-contributions-catalogued'
    | 'slerp-lemniscate-only-motion';

export interface WaveCSourceCitation {
    readonly path: string;
    readonly line: number;
}

export interface WaveCDesignInvariant {
    readonly id: WaveCDesignInvariantId;
    readonly label: string;
    readonly enforcingTracks: readonly string[];
    readonly enforcementIds: readonly string[];
    readonly source: WaveCSourceCitation;
}

const WAVE_C_SOURCE =
    'Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/20-wave-c-frontend-deep-overview.md';

/**
 * The Track-D source for carrier work. Source line references deliberately
 * point to the canonical Wave-C standing-invariant rows, not frozen Theia
 * plumbing; enforcement ids are the named tranche/lint routes those rows own.
 */
export const WAVE_C_DESIGN_SYSTEM_MANIFEST: readonly WaveCDesignInvariant[] = Object.freeze([
    Object.freeze({
        id: 'coordinate-primary-navigation',
        label: 'Coordinate as primary navigation',
        enforcingTracks: Object.freeze(['15', '31']),
        enforcementIds: Object.freeze(['31.6']),
        source: Object.freeze({ path: WAVE_C_SOURCE, line: 42 })
    }),
    Object.freeze({
        id: 'profile-tick-primary-ui-clock',
        label: 'Profile-tick as primary UI clock',
        enforcingTracks: Object.freeze(['15', '27', '28']),
        enforcementIds: Object.freeze(['27.0', '28.17']),
        source: Object.freeze({ path: WAVE_C_SOURCE, line: 43 })
    }),
    Object.freeze({
        id: 'provenance-always-visible',
        label: 'Provenance always visible',
        enforcingTracks: Object.freeze(['15', '28', '30']),
        enforcementIds: Object.freeze(['30.10', '28.11']),
        source: Object.freeze({ path: WAVE_C_SOURCE, line: 44 })
    }),
    Object.freeze({
        id: 'composition-over-juxtaposition',
        label: 'Composition over juxtaposition',
        enforcingTracks: Object.freeze(['15', '29']),
        enforcementIds: Object.freeze(['29.6']),
        source: Object.freeze({ path: WAVE_C_SOURCE, line: 45 })
    }),
    Object.freeze({
        id: 'no-modal-discipline',
        label: 'No-modal discipline',
        enforcingTracks: Object.freeze(['15', '27', '28', '31']),
        enforcementIds: Object.freeze(['31.8']),
        source: Object.freeze({ path: WAVE_C_SOURCE, line: 46 })
    }),
    Object.freeze({
        id: 'activity-bar-discipline',
        label: 'Activity-bar discipline',
        enforcingTracks: Object.freeze(['15', '28', '31']),
        enforcementIds: Object.freeze(['28.2', '31.4']),
        source: Object.freeze({ path: WAVE_C_SOURCE, line: 47 })
    }),
    Object.freeze({
        id: 'privacy-class-flow-through',
        label: 'Privacy-class flow-through',
        enforcingTracks: Object.freeze(['29', '32']),
        enforcementIds: Object.freeze(['32.8', '29.13']),
        source: Object.freeze({ path: WAVE_C_SOURCE, line: 48 })
    }),
    Object.freeze({
        id: 'tokens-consumed-not-forked',
        label: 'Design tokens are consumed, not forked',
        enforcingTracks: Object.freeze(['30']),
        enforcementIds: Object.freeze(['30.11']),
        source: Object.freeze({ path: WAVE_C_SOURCE, line: 49 })
    }),
    Object.freeze({
        id: 'chrome-contributions-catalogued',
        label: 'Chrome contributions are catalogued, not free-floating',
        enforcingTracks: Object.freeze(['31']),
        enforcementIds: Object.freeze(['31.12', '31.13']),
        source: Object.freeze({ path: WAVE_C_SOURCE, line: 50 })
    }),
    Object.freeze({
        id: 'slerp-lemniscate-only-motion',
        label: 'Slerp and lemniscate are the only motion primitives',
        enforcingTracks: Object.freeze(['15']),
        enforcementIds: Object.freeze(['15.9', '15.5']),
        source: Object.freeze({ path: WAVE_C_SOURCE, line: 43 })
    })
]);

export const WAVE_C_DESIGN_INVARIANT_IDS: readonly WaveCDesignInvariantId[] = Object.freeze(
    WAVE_C_DESIGN_SYSTEM_MANIFEST.map(invariant => invariant.id)
);

/**
 * Validate a candidate Track-D manifest before a future lint or surface adds
 * an entry. Returning explicit violations keeps the contract usable by CI
 * without duplicating its invariant list in each consumer.
 */
export function validateWaveCDesignSystemManifest(
    manifest: readonly WaveCDesignInvariant[]
): readonly string[] {
    const violations: string[] = [];
    const ids = new Set<string>();

    for (const invariant of manifest) {
        if (ids.has(invariant.id)) {
            violations.push(`duplicate invariant id: ${invariant.id}`);
        }
        ids.add(invariant.id);

        if (invariant.enforcingTracks.length === 0) {
            violations.push(`missing enforcing track: ${invariant.id}`);
        }
        if (invariant.enforcementIds.length === 0) {
            violations.push(`missing enforcement id: ${invariant.id}`);
        }
        if (!invariant.source.path || invariant.source.line < 1) {
            violations.push(`invalid source citation: ${invariant.id}`);
        }
    }

    for (const id of WAVE_C_DESIGN_INVARIANT_IDS) {
        if (!ids.has(id)) {
            violations.push(`missing required invariant: ${id}`);
        }
    }

    return Object.freeze(violations);
}

/** Resolve a manifest entry without allowing callers to fork its data. */
export function waveCDesignInvariantFor(
    id: WaveCDesignInvariantId
): WaveCDesignInvariant {
    const invariant = WAVE_C_DESIGN_SYSTEM_MANIFEST.find(entry => entry.id === id);
    if (!invariant) {
        throw new Error(`Unknown Wave-C design invariant: ${id}`);
    }
    return invariant;
}
