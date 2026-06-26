// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2 → #3 (Parashakti vibrational web descending into the
//                   Mahamaya codon lattice) read through the Anuttara Archetype-9
//                   epogdoon dynamic (#0-2-9, Paramesvara / Wholeness, 9 = 00+00).
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser component)
//   Position (#23): 23.23 — 9:8 Epogdoon proof overlay + 9-tick bloom (parallel to
//                   the M1 15.8 Mersenne raw/DR proof overlay on the vortex matrices).
//   Actualises:     two INDEPENDENT developer-facing surfaces over the live
//                   72→64 compression — (a) a dev-mode-gated proof-identity panel
//                   rendering the integer identity `7/4 = (72 − 9) / 36` plus the
//                   live `address72 = 9·q + r` decomposition (q∈[0,7], r∈[0,8]);
//                   (b) a Venus warm-amber compression-pulse bloom that fires once
//                   every ninth profile-tick (tick_counter % 9 == 0), a 250ms
//                   ease-out one-shot. Both ride the profile-tick clock (15.6);
//                   NO local timers.
//   Public surface: EpogdoonProofOverlay, buildEpogdoonProofModel, the proof
//                   constants (EPOGDOON_* + M2_PROOF_DEV_* gating tokens), the
//                   EpogdoonProofModel / EpogdoonAddressDecomposition view model,
//                   and resolveEpogdoonDeveloperMode / isM2ProofDebugSearch.
//   Does NOT own:   the compression law. The 9:8 fold (m2.h `m2_epogdoon_compress`
//                   = `val * 8 / 9`, m3.h `apply_epogdoon_compression` /
//                   `is_evolutionary_gap`) lives in C; this overlay only CITES the
//                   identity (citation, no import) and decomposes the live address.
//                   It does NOT recompute the projection — that is the kernel-bridge
//                   surfaced through EpogdoonBridgeEngine (23.18). It does NOT own
//                   the DET/planetary card it blooms over (23.3) nor the descent
//                   lattice (23.18); it is a thin proof/telemetry overlay.
//   Cross-links:    EpogdoonBridgeEngine (23.18 — the 72→64 descent), the M1
//                   Mersenne proof overlay (15.8 — the parallel raw/DR pattern),
//                   Track 37 §7-8-9-spine (Archetype-9 / −1/9 epogdoon dynamic),
//                   Track 21 M0 Paramesvara surface (the M0-side Archetype-9 render).
//   Contract:       proof identity `7/4 = (72 − 9) / 36`; decomposition
//                   `address72 = 9·q + r`; bloom epoch `floor(tick_counter / 9)`,
//                   firing when `tick_counter % 9 == 0`.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { PreferenceService } from '@theia/core/lib/browser/preferences';

// ── Invariants (declared; never recomputed — the compression law lives in C) ──

/** The Parashakti 72-Invariant — every M2 vibrational address resolves here. */
export const EPOGDOON_M2_ADDRESS_COUNT = 72;

/** The Mahamaya 64-Invariant — the uint64_t codon space the 9:8 fold lands in. */
export const EPOGDOON_M3_CODON_COUNT = 64;

/**
 * The nine fold-points — the Anuttara Archetype-9 (Paramesvara, `9 = 00+00`,
 * M0-2-9) signature. `72 × (8/9) = 64`; the `−1/9` loss is the nine M2 indices
 * that do not round-trip through compress→expand. Also the bloom period.
 */
export const EPOGDOON_FOLD_POINT_COUNT = 9;

/** The 36 half-decan / MEF base conditions — the proof-identity denominator. */
export const EPOGDOON_HALF_DECAN_COUNT = 36;

/** The epogdoon compression ratio numerator — `m2_epogdoon_compress = val·8/9`. */
export const EPOGDOON_COMPRESSION_NUMERATOR = 8;

/** The epogdoon compression ratio denominator. */
export const EPOGDOON_COMPRESSION_DENOMINATOR = 9;

/**
 * The static proof identity, rendered verbatim as the equation card. The integers
 * resolve `(72 − 9) / 36 = 63 / 36 = 7 / 4` — the epogdoon ratio in lowest terms.
 */
export const EPOGDOON_PROOF_IDENTITY = '7/4 = (72 − 9) / 36' as const;

/** The C citation (citation ONLY — never imported, never recomputed here). */
export const EPOGDOON_COMPRESS_CITATION = 'm2.h · m2_epogdoon_compress(val) = val * 8 / 9' as const;

/** One-shot compression-pulse bloom duration (ms) — a 250ms ease-out. */
export const EPOGDOON_BLOOM_DURATION_MS = 250;

// ── Dev-mode gating tokens (query param OR Theia preference) ──────────────────

/** Theia preference toggling the proof-identity panel. */
export const M2_PROOF_DEV_MODE_PREFERENCE = 'epiLogos.m2Parashakti.devMode';

/** Query-param key honoured for ad-hoc dev-mode (e.g. `?epi-debug=m2-proof`). */
export const M2_PROOF_DEV_QUERY_KEY = 'epi-debug';

/** Query-param value that switches the proof panel on. */
export const M2_PROOF_DEV_QUERY_VALUE = 'm2-proof';

// ── View model ───────────────────────────────────────────────────────────────

/** The live `address72 = 9·q + r` decomposition (q∈[0,7], r∈[0,8]). */
export interface EpogdoonAddressDecomposition {
    /** Source M2 vibrational address (0..71). */
    readonly address72: number;
    /** Quotient q = ⌊address72 / 9⌋ — the fold-octave (0..7). */
    readonly q: number;
    /** Remainder r = address72 mod 9 — position within the octave (0..8). */
    readonly r: number;
    /** True at the nine fold-points where r === 0 — the `−1/9` withdrawal seam. */
    readonly onFoldSeam: boolean;
}

export interface EpogdoonProofModel {
    /** The static proof identity string (`7/4 = (72 − 9) / 36`). */
    readonly proofIdentity: string;
    /** The live address decomposition. */
    readonly decomposition: EpogdoonAddressDecomposition;
    /** Profile tick-counter `generation − firstObservedGeneration` (clamped ≥0). */
    readonly tickCounter: number;
    /** The bloom epoch `⌊tickCounter / 9⌋` — increments at each ninth tick. */
    readonly bloomEpoch: number;
    /** True when `tickCounter % 9 === 0` — a compression-pulse bloom fires now. */
    readonly bloomFiring: boolean;
    /** The raw profile generation that produced this model, if known. */
    readonly generation: number | null;
}

export interface EpogdoonProofOverlayProps {
    /** Live M2 vibrational address from the profile bus (0..71). */
    readonly address72?: number | null;
    /** Live profile generation (the 15.6 profile-tick clock). */
    readonly generation?: number | null;
    /**
     * The first generation observed this session — the bloom-clock origin.
     * `tickCounter = generation − firstObservedGeneration`; resets cleanly on
     * session restart when the host re-anchors this to the new first generation.
     */
    readonly firstObservedGeneration?: number | null;
    /** Explicit dev-mode override; when set it wins over query-param + preference. */
    readonly developerMode?: boolean;
    /** Theia preference service consulted for `epiLogos.m2Parashakti.devMode`. */
    readonly preferences?: Pick<PreferenceService, 'get' | 'onPreferenceChanged'>;
    /**
     * The location-search string consulted for `?epi-debug=m2-proof`. Defaults to
     * the ambient `window.location.search` when omitted (injected for tests/SSR).
     */
    readonly locationSearch?: string;
    readonly className?: string;
}

// ── Model builder (pure; decomposition + tick arithmetic only) ───────────────

export function buildEpogdoonProofModel(input: {
    readonly address72?: number | null;
    readonly generation?: number | null;
    readonly firstObservedGeneration?: number | null;
}): EpogdoonProofModel {
    const address72 = clampAddress72(input.address72);
    const q = Math.floor(address72 / EPOGDOON_FOLD_POINT_COUNT);
    const r = address72 % EPOGDOON_FOLD_POINT_COUNT;

    const generation = normalizeGeneration(input.generation);
    const firstObserved = normalizeGeneration(input.firstObservedGeneration);
    const tickCounter =
        generation !== null && firstObserved !== null ? Math.max(0, generation - firstObserved) : 0;
    const bloomEpoch = Math.floor(tickCounter / EPOGDOON_FOLD_POINT_COUNT);
    const bloomFiring = tickCounter % EPOGDOON_FOLD_POINT_COUNT === 0;

    return Object.freeze({
        proofIdentity: EPOGDOON_PROOF_IDENTITY,
        decomposition: Object.freeze({
            address72,
            q,
            r,
            onFoldSeam: r === 0
        }),
        tickCounter,
        bloomEpoch,
        bloomFiring,
        generation
    });
}

// ── Dev-mode resolution (explicit prop → query param → preference) ───────────

/** True when the search string carries `epi-debug=m2-proof` (comma-list aware). */
export function isM2ProofDebugSearch(search: string | null | undefined): boolean {
    if (typeof search !== 'string' || search.length === 0) {
        return false;
    }
    let params: URLSearchParams;
    try {
        params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    } catch {
        return false;
    }
    for (const raw of params.getAll(M2_PROOF_DEV_QUERY_KEY)) {
        if (
            raw
                .split(',')
                .map(token => token.trim())
                .includes(M2_PROOF_DEV_QUERY_VALUE)
        ) {
            return true;
        }
    }
    return false;
}

/** Resolve the proof-panel dev-mode: explicit override wins, then query, then pref. */
export function resolveEpogdoonDeveloperMode(input: {
    readonly developerMode?: boolean;
    readonly preferences?: Pick<PreferenceService, 'get'>;
    readonly locationSearch?: string;
}): boolean {
    if (typeof input.developerMode === 'boolean') {
        return input.developerMode;
    }
    if (isM2ProofDebugSearch(input.locationSearch ?? ambientLocationSearch())) {
        return true;
    }
    return input.preferences?.get<boolean>(M2_PROOF_DEV_MODE_PREFERENCE, false) === true;
}

// ── Component ────────────────────────────────────────────────────────────────

export function EpogdoonProofOverlay(props: EpogdoonProofOverlayProps): React.ReactElement {
    const model = React.useMemo(
        () =>
            buildEpogdoonProofModel({
                address72: props.address72 ?? null,
                generation: props.generation ?? null,
                firstObservedGeneration: props.firstObservedGeneration ?? null
            }),
        [props.address72, props.generation, props.firstObservedGeneration]
    );

    const [developerMode, setDeveloperMode] = React.useState<boolean>(() =>
        resolveEpogdoonDeveloperMode({
            developerMode: props.developerMode,
            preferences: props.preferences,
            locationSearch: props.locationSearch
        })
    );

    React.useEffect(() => {
        setDeveloperMode(
            resolveEpogdoonDeveloperMode({
                developerMode: props.developerMode,
                preferences: props.preferences,
                locationSearch: props.locationSearch
            })
        );
    }, [props.developerMode, props.preferences, props.locationSearch]);

    // Live-follow the Theia preference only when dev-mode is not pinned by a prop.
    React.useEffect(() => {
        if (!props.preferences || typeof props.developerMode === 'boolean') {
            return undefined;
        }
        const disposable = props.preferences.onPreferenceChanged(change => {
            if (change.preferenceName === M2_PROOF_DEV_MODE_PREFERENCE) {
                setDeveloperMode(
                    change.newValue === true ||
                        isM2ProofDebugSearch(props.locationSearch ?? ambientLocationSearch())
                );
            }
        });
        return () => disposable.dispose();
    }, [props.developerMode, props.preferences, props.locationSearch]);

    const className = ['m2-epogdoon-proof-overlay', props.className].filter(Boolean).join(' ');

    return (
        <aside
            className={className}
            aria-label="Epogdoon 9:8 proof overlay"
            data-epogdoon-proof-overlay
            data-developer-mode={developerMode ? 'true' : 'false'}
            data-tick-counter={model.tickCounter}
            data-bloom-epoch={model.bloomEpoch}
            data-bloom-firing={model.bloomFiring ? 'true' : 'false'}
            style={overlayStyle}
        >
            {/* The bloom is INDEPENDENT of the proof panel — it always rides the
                profile-tick clock, blooming once every ninth tick over the DET card. */}
            <CompressionPulseBloom
                bloomEpoch={model.bloomEpoch}
                bloomFiring={model.bloomFiring}
                tickCounter={model.tickCounter}
            />
            {developerMode && <ProofIdentityPanel model={model} />}
        </aside>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function ProofIdentityPanel({ model }: { readonly model: EpogdoonProofModel }): React.ReactElement {
    const { decomposition } = model;
    return (
        <section
            className="m2-epogdoon-proof-overlay__panel"
            data-epogdoon-proof-panel
            data-on-fold-seam={decomposition.onFoldSeam ? 'true' : 'false'}
            style={panelStyle}
        >
            <header className="m2-epogdoon-proof-overlay__panel-header" style={panelHeaderStyle}>
                <h4 style={headingStyle}>9 : 8 epogdoon proof</h4>
                <span className="m2-epogdoon-proof-overlay__ratio" style={ratioStyle}>
                    72 × (8 / 9) = 64
                </span>
            </header>

            <code
                className="m2-epogdoon-proof-overlay__identity"
                data-proof-identity
                style={identityStyle}
            >
                {model.proofIdentity}
            </code>

            <dl
                className="m2-epogdoon-proof-overlay__decomposition"
                data-address-decomposition
                data-address72={decomposition.address72}
                data-q={decomposition.q}
                data-r={decomposition.r}
                style={decompositionStyle}
            >
                <dt style={termStyle}>Live decomposition</dt>
                <dd style={defStyle}>
                    <code style={codeStyle}>
                        {decomposition.address72} = 9 · {decomposition.q} + {decomposition.r}
                    </code>
                </dd>
                <dt style={termStyle}>Fold-octave (q ∈ [0, 7])</dt>
                <dd style={defStyle}>{decomposition.q}</dd>
                <dt style={termStyle}>Position (r ∈ [0, 8])</dt>
                <dd style={defStyle}>
                    {decomposition.r}
                    {decomposition.onFoldSeam ? ' — on the −1/9 fold seam' : ''}
                </dd>
            </dl>

            <p className="m2-epogdoon-proof-overlay__citation" data-compress-citation style={citationStyle}>
                {EPOGDOON_COMPRESS_CITATION}
            </p>
        </section>
    );
}

function CompressionPulseBloom({
    bloomEpoch,
    bloomFiring,
    tickCounter
}: {
    readonly bloomEpoch: number;
    readonly bloomFiring: boolean;
    readonly tickCounter: number;
}): React.ReactElement {
    // Keying the bloom node on the epoch remounts it at every ninth tick, replaying
    // the one-shot 250ms ease-out CSS animation — no JS timer, the profile-tick is
    // the only clock. The injected keyframes keep the bloom self-contained.
    return (
        <div
            className="m2-epogdoon-proof-overlay__bloom-stage"
            data-epogdoon-bloom-stage
            aria-hidden="true"
            style={bloomStageStyle}
        >
            <style>{BLOOM_KEYFRAMES}</style>
            <span
                key={bloomEpoch}
                className="m2-epogdoon-proof-overlay__bloom"
                data-epogdoon-bloom
                data-bloom-firing={bloomFiring ? 'true' : 'false'}
                data-bloom-epoch={bloomEpoch}
                data-tick-counter={tickCounter}
                style={bloomFiring ? bloomFiringStyle : bloomIdleStyle}
            />
        </div>
    );
}

// ── Normalisers (bounds + tick arithmetic only; no compression arithmetic) ───

function clampAddress72(value: number | null | undefined): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return 0;
    }
    const rounded = Math.trunc(value);
    return ((rounded % EPOGDOON_M2_ADDRESS_COUNT) + EPOGDOON_M2_ADDRESS_COUNT) % EPOGDOON_M2_ADDRESS_COUNT;
}

function normalizeGeneration(value: number | null | undefined): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : null;
}

function ambientLocationSearch(): string {
    if (typeof window !== 'undefined' && window.location && typeof window.location.search === 'string') {
        return window.location.search;
    }
    return '';
}

// ── Styling (self-contained; SCSS classes mirror these for the Theia theme) ──

const overlayStyle: React.CSSProperties = {
    position: 'relative',
    display: 'grid',
    gap: 10,
    marginTop: 12
};

const bloomStageStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    borderRadius: 6
};

// Venus warm-amber compression-pulse — a radial bloom that eases out once.
const bloomBaseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: 6,
    background:
        'radial-gradient(circle at 50% 50%, rgba(255, 196, 112, 0.55) 0%, rgba(247, 162, 74, 0.28) 38%, rgba(214, 124, 58, 0) 72%)'
};

const bloomIdleStyle: React.CSSProperties = {
    ...bloomBaseStyle,
    opacity: 0
};

const bloomFiringStyle: React.CSSProperties = {
    ...bloomBaseStyle,
    animationName: 'm2-epogdoon-bloom-pulse',
    animationDuration: `${EPOGDOON_BLOOM_DURATION_MS}ms`,
    animationTimingFunction: 'ease-out',
    animationIterationCount: 1,
    animationFillMode: 'forwards'
};

const BLOOM_KEYFRAMES = `
@keyframes m2-epogdoon-bloom-pulse {
    0% { opacity: 0; transform: scale(0.82); }
    32% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.06); }
}`;

const panelStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gap: 8,
    padding: 12,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    background: 'var(--theia-editor-background)'
};

const panelHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8
};

const headingStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 13,
    fontWeight: 700
};

const ratioStyle: React.CSSProperties = {
    fontFamily: 'var(--theia-code-font-family)',
    fontSize: 11,
    color: 'var(--theia-descriptionForeground)'
};

const identityStyle: React.CSSProperties = {
    fontFamily: 'var(--theia-code-font-family)',
    fontSize: 15,
    fontWeight: 600,
    padding: '8px 10px',
    borderRadius: 4,
    border: '1px solid var(--theia-charts-yellow)',
    background: 'rgba(247, 162, 74, 0.10)'
};

const decompositionStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '4px 12px',
    margin: 0
};

const termStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)',
    fontSize: 12
};

const defStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 12
};

const codeStyle: React.CSSProperties = {
    fontFamily: 'var(--theia-code-font-family)',
    fontSize: 12
};

const citationStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: 'var(--theia-code-font-family)',
    fontSize: 11,
    color: 'var(--theia-descriptionForeground)'
};

export default EpogdoonProofOverlay;
