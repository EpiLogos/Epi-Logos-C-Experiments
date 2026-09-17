// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2 (Parashakti vibrational MEF·QL matrix) — the 12 epistemic
//                   lens-anchors × QL modes (84-state landscape) carrying the
//                   12×6 = 72 active vibrational addresses (`address72`).
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser component)
//   Position (#2):  23.2 — Layer A 12×7 MEF matrix grid scaffold
//   Actualises:     the MEF matrix landscape as an SVG scaffold of 12 lens-rows ×
//                   7 mode-columns (84 states), overlaying the 12×6 = 72 active
//                   MEF addresses. Each active cell's payload is read ONLY through
//                   the typed kernel-bridge axis decoder. Lens-anchor row glow and
//                   mode column trace come from the live `lens_mode` frame; the
//                   helix-bit halo splits warm (lens 0–5) / cool (lens 6–11); six
//                   tritone-mirror pair-arcs connect Lens N ↔ Lens N+3; the active
//                   cell's halo intensity reads `audio_octet[0]`; a Klein-flip
//                   swaps warm/cool and brightens the active pair-arc.
//   Public surface: MefGrid72Component, buildMefGrid72Model, the
//                   M2MefCellProjection / M2MefAxisDecoder / M2MefGridBridge typed
//                   contract, the MefCell / MefTritonePair / MefGrid72Model view
//                   model, and the layout invariants (MEF_LENS_COUNT,
//                   MEF_MODE_COLUMNS, MEF_ACTIVE_MODE_COUNT, MEF_ACTIVE_CELL_COUNT).
//   Does NOT own:   the MEF law itself. The 84-state (lens, mode) landscape, the
//                   address72 = lens×6 + mode packing, and the per-cell MEF·QL
//                   coordinate live kernel-side (m2.h `M2_MEF_*`) and are surfaced
//                   through `kernelBridge.m2.decodeAxisAt(address72, "mef")`. This
//                   scaffold NEVER recomputes the decode; it folds the published
//                   projection into geometry and renders it.
//   Cross-links:    Layer B (SacredSonicPanel, 23.3–23.6), Layer C
//                   (CymaticChladniSurface, 23.x), the M1' 84-state landscape
//                   (lens, mode) contract, EpogdoonBridgeEngine (72→64 descent).
//   Contract:       kernelBridge.m2.decodeAxisAt(address72, "mef") →
//                   { address72, lens, mode, coordinate, glyph, helixBit }
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../common/meaning-packet';
import type { M2KleinFlipPhase } from './klein-phase';
import { ProvenanceBadge, type ProvenanceReadinessVariant } from './ProvenanceBadge';

// ── Invariants (declared; never recomputed) ─────────────────────────────────

/** The twelve epistemic lens-anchors — the rows of the MEF landscape. */
export const MEF_LENS_COUNT = 12;

/** Seven mode-columns: QL modes #0..#5 (actualised) + the #5/0 return potential. */
export const MEF_MODE_COLUMNS = 7;

/** The six actualised QL modes (#0..#5) that carry a live MEF address. */
export const MEF_ACTIVE_MODE_COUNT = 6;

/** 12 lens-anchors × 6 actualised modes — the 72-Invariant active MEF address space. */
export const MEF_ACTIVE_CELL_COUNT = 72;

/** The full 12 × 7 = 84-state landscape (active addresses + the return-potential column). */
export const MEF_LANDSCAPE_STATE_COUNT = 84;

/** Tritone-mirror pairing offset — Lens N ↔ Lens N+3 (six disjoint pairs covering all 12). */
export const MEF_TRITONE_OFFSET = 3;

/** Provenance source-field for the MEF cell payload (routes to the axis-decoder authority). */
export const M2_MEF_CELL_PROVENANCE_FIELD = 'lensModeFrame';

/** The single authority each cell reads through — never a local computation. */
export const MEF_CELL_SOURCE = 'kernelBridge.m2.decodeAxisAt(address72, "mef")' as const;

/** Saturating reference (Hz) mapping `audio_octet[0]` magnitude → a bounded halo intensity. */
export const MEF_HALO_SATURATION_HZ = 128;

// ── Bridge contract (the ONLY typed projection this scaffold consumes) ────────

/**
 * The typed projection returned by `kernelBridge.m2.decodeAxisAt(address72, "mef")`.
 * Mirrors the kernel MEF axis decode: the lens-anchor, the actualised QL mode, the
 * MEF·QL coordinate, a short cell glyph, and the canonical helix-bit (warm/cool).
 */
export interface M2MefCellProjection {
    /** Source MEF vibrational address (0..71). */
    readonly address72: number;
    /** Lens-anchor row (0..11). */
    readonly lens: number;
    /** Actualised QL mode column (0..5). */
    readonly mode: number;
    /** MEF·QL coordinate string for this cell (e.g. `#2-…`). */
    readonly coordinate: string;
    /** Short glyph/label rendered inside the cell. */
    readonly glyph: string;
    /** Canonical helix-bit: 0 = warm (lens 0–5), 1 = cool (lens 6–11). */
    readonly helixBit: 0 | 1;
}

/** A function decoding a 72-address along the MEF axis. */
export type M2MefAxisDecoder = (address72: number, axis: 'mef') => M2MefCellProjection;

/** The slice of the kernel-bridge this scaffold depends on. */
export interface M2MefGridBridge {
    readonly m2: {
        readonly decodeAxisAt: M2MefAxisDecoder;
    };
}

// ── View model ───────────────────────────────────────────────────────────────

/** The live (lens, mode) frame highlighting one anchor-row and one mode-column. */
export interface MefLensModeFrame {
    /** Active lens-anchor row (0..11). */
    readonly lens: number;
    /** Active QL mode column (0..5). */
    readonly mode: number;
}

/** One scaffold cell — an (lens, mode) state in the 12 × 7 landscape. */
export interface MefCell {
    /** Active MEF address (0..71) for the six actualised modes; null for the return column. */
    readonly address72: number | null;
    /** Lens-anchor row (0..11). */
    readonly lens: number;
    /** Mode column (0..6); column 6 is the #5/0 return-potential, not a live address. */
    readonly mode: number;
    /** True for the six actualised modes (mode 0..5) — i.e. carries a live address. */
    readonly isActiveAddress: boolean;
    /** Effective helix-bit after any Klein-flip swap: 0 = warm, 1 = cool. */
    readonly helixBit: 0 | 1;
    /** MEF·QL coordinate published by the bridge, if any. */
    readonly coordinate: string | null;
    /** Short glyph published by the bridge, if any. */
    readonly glyph: string | null;
    /** True for the single cell at the live (lens, mode). */
    readonly isLiveCell: boolean;
    /** True for any cell in the live lens-anchor row. */
    readonly inActiveLens: boolean;
    /** True for any cell in the live mode column. */
    readonly inActiveMode: boolean;
    /** Halo intensity (0..1) for the live cell, from `audio_octet[0]`; 0 otherwise. */
    readonly haloIntensity: number;
}

/** One tritone-mirror pair of lens-anchors (Lens N ↔ Lens N+3). */
export interface MefTritonePair {
    readonly lensA: number;
    readonly lensB: number;
    /** True when the live lens-anchor is one of this pair's endpoints. */
    readonly isActivePair: boolean;
}

export interface MefGrid72Model {
    /** All 84 scaffold cells, row-major (lens outer, mode inner). */
    readonly cells: readonly MefCell[];
    /** The six tritone-mirror pairs. */
    readonly tritonePairs: readonly MefTritonePair[];
    /** The live lens/mode frame (clamped). */
    readonly lensMode: MefLensModeFrame;
    /** The live MEF address (0..71) derived from the lens/mode frame. */
    readonly activeAddress72: number;
    /** The effective Klein-flip phase driving the warm/cool swap + pair-arc brightening. */
    readonly kleinFlipPhase: M2KleinFlipPhase;
    /** True once the bridge surfaced a complete, well-formed 72-cell payload. */
    readonly payloadReady: boolean;
    /** The profile-tick that produced this landscape, if known. */
    readonly tick: number | null;
}

export interface MefGrid72ComponentProps {
    /** The kernel-bridge slice. When absent the scaffold renders without cell payload. */
    readonly kernelBridge?: M2MefGridBridge | null;
    /** The live lens/mode frame (from `profile.lensMode`). */
    readonly lensMode?: MefLensModeFrame | null;
    /** Live `audio_octet[0]` magnitude driving the active-cell halo intensity. */
    readonly audioOctet0?: number | null;
    /** The Klein-flip phase swapping warm/cool and brightening the active pair-arc. */
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
    /** Live profile-tick driving the landscape (falls back to deriving the frame). */
    readonly tick?: number | null;
    /** Meaning packet for provenance badging. */
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    /** Readiness for provenance badge tone. */
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    readonly className?: string;
}

// ── Layout geometry (pure constants; the scaffold's physical shape) ───────────

const PADDING = 12;
const LABEL_GUTTER = 56;
const HEADER_GUTTER = 30;
const CELL_W = 38;
const CELL_H = 30;
const CELL_GAP = 6;

const SVG_WIDTH = PADDING * 2 + LABEL_GUTTER + MEF_MODE_COLUMNS * (CELL_W + CELL_GAP);
const SVG_HEIGHT = PADDING * 2 + HEADER_GUTTER + MEF_LENS_COUNT * (CELL_H + CELL_GAP);

/** Warm helix hue (lens 0–5) and cool helix hue (lens 6–11) — mirrors the M2 palette. */
const WARM_HUE = '#c5564b';
const COOL_HUE = '#5fa9b8';

/** QL mode column labels: #0..#5 actualised, then the #5/0 return-potential. */
const MODE_LABELS: readonly string[] = Object.freeze(['0', '1', '2', '3', '4', '5', '↺']);

function cellX(mode: number): number {
    return PADDING + LABEL_GUTTER + mode * (CELL_W + CELL_GAP);
}

function cellY(lens: number): number {
    return PADDING + HEADER_GUTTER + lens * (CELL_H + CELL_GAP);
}

function rowCenterY(lens: number): number {
    return cellY(lens) + CELL_H / 2;
}

// ── Model builder (pure; reads ONLY the injected bridge projection) ──────────

export function buildMefGrid72Model(input: {
    readonly kernelBridge?: M2MefGridBridge | null;
    readonly lensMode?: MefLensModeFrame | null;
    readonly audioOctet0?: number | null;
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
    readonly tick?: number | null;
}): MefGrid72Model {
    const tick = normalizeTick(input.tick);
    const lensMode = resolveLensMode(input.lensMode, tick);
    const activeAddress72 = lensMode.lens * MEF_ACTIVE_MODE_COUNT + lensMode.mode;
    const kleinFlipPhase = normalizeKleinPhase(input.kleinFlipPhase);
    const inverted = kleinFlipPhase === 'inverted';
    const haloIntensity = haloIntensityFromAudio(input.audioOctet0);
    const decoder = input.kernelBridge?.m2?.decodeAxisAt ?? null;

    const cells: MefCell[] = [];
    let decodedActiveAddresses = 0;

    for (let lens = 0; lens < MEF_LENS_COUNT; lens += 1) {
        for (let mode = 0; mode < MEF_MODE_COLUMNS; mode += 1) {
            const isActiveAddress = mode < MEF_ACTIVE_MODE_COUNT;
            const address72 = isActiveAddress ? lens * MEF_ACTIVE_MODE_COUNT + mode : null;
            const projection = isActiveAddress && decoder ? safeDecode(decoder, address72 as number) : null;
            if (projection) {
                decodedActiveAddresses += 1;
            }
            const baseHelixBit: 0 | 1 = lens < MEF_LENS_COUNT / 2 ? 0 : 1;
            const canonicalHelixBit = projection ? clampBit(projection.helixBit) : baseHelixBit;
            const helixBit: 0 | 1 = inverted ? flipBit(canonicalHelixBit) : canonicalHelixBit;
            const isLiveCell = isActiveAddress && lens === lensMode.lens && mode === lensMode.mode;

            cells.push(
                Object.freeze({
                    address72,
                    lens,
                    mode,
                    isActiveAddress,
                    helixBit,
                    coordinate: projection?.coordinate ?? null,
                    glyph: projection?.glyph ?? null,
                    isLiveCell,
                    inActiveLens: lens === lensMode.lens,
                    inActiveMode: isActiveAddress && mode === lensMode.mode,
                    haloIntensity: isLiveCell ? haloIntensity : 0
                })
            );
        }
    }

    return Object.freeze({
        cells: Object.freeze(cells),
        tritonePairs: Object.freeze(buildTritonePairs(lensMode.lens)),
        lensMode,
        activeAddress72,
        kleinFlipPhase,
        payloadReady: decodedActiveAddresses === MEF_ACTIVE_CELL_COUNT,
        tick
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export function MefGrid72Component(props: MefGrid72ComponentProps): React.ReactElement {
    const model = React.useMemo(
        () =>
            buildMefGrid72Model({
                kernelBridge: props.kernelBridge ?? null,
                lensMode: props.lensMode ?? null,
                audioOctet0: props.audioOctet0 ?? null,
                kleinFlipPhase: props.kleinFlipPhase ?? null,
                tick: props.tick ?? null
            }),
        [props.kernelBridge, props.lensMode, props.audioOctet0, props.kleinFlipPhase, props.tick]
    );

    const className = ['m2-mef-grid-72', props.className].filter(Boolean).join(' ');

    return (
        <section
            className={className}
            aria-label="MEF·QL 12 × 7 matrix landscape (12 lens-anchors × 7 modes)"
            data-mef-grid-72
            data-grid-state={model.payloadReady ? 'ready' : 'scaffold-only'}
            data-active-address72={model.activeAddress72}
            data-active-lens={model.lensMode.lens}
            data-active-mode={model.lensMode.mode}
            data-klein-phase={model.kleinFlipPhase}
            data-active-tick={model.tick ?? ''}
        >
            <header className="m2-mef-grid-72__header">
                <h4>MEF·QL matrix — 12 × 7 landscape</h4>
                <span className="m2-mef-grid-72__ratio">12 lens-anchors × 6 modes → 72 addresses</span>
                {props.packet && (
                    <ProvenanceBadge
                        compact
                        field={M2_MEF_CELL_PROVENANCE_FIELD}
                        readiness={props.readiness ?? (model.payloadReady ? 'ready_public_current' : 'bridge_unavailable')}
                        provenance={props.packet.meaningPacketProvenanceFor(M2_MEF_CELL_PROVENANCE_FIELD)}
                    />
                )}
            </header>

            <svg
                className="m2-mef-grid-72__svg"
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                width="100%"
                role="img"
                aria-label={`MEF landscape; live cell lens ${model.lensMode.lens} mode ${model.lensMode.mode} at address ${model.activeAddress72}`}
                preserveAspectRatio="xMidYMid meet"
            >
                <ModeColumnHeaders activeMode={model.lensMode.mode} />
                <TritonePairArcs pairs={model.tritonePairs} kleinFlipPhase={model.kleinFlipPhase} />
                <LensRowLabels activeLens={model.lensMode.lens} />
                {model.cells.map(cell => (
                    <MefCellRect key={`${cell.lens}-${cell.mode}`} cell={cell} />
                ))}
            </svg>
        </section>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function ModeColumnHeaders({ activeMode }: { readonly activeMode: number }): React.ReactElement {
    return (
        <g data-mef-mode-headers aria-hidden="true">
            {MODE_LABELS.map((label, mode) => (
                <text
                    key={mode}
                    className="m2-mef-grid-72__mode-label"
                    data-mode={mode}
                    data-active={mode === activeMode ? 'true' : 'false'}
                    data-return-column={mode >= MEF_ACTIVE_MODE_COUNT ? 'true' : 'false'}
                    x={cellX(mode) + CELL_W / 2}
                    y={PADDING + HEADER_GUTTER - 10}
                    textAnchor="middle"
                    fontSize={12}
                    fill={mode === activeMode ? '#f8fafc' : '#9aa6b2'}
                    fontWeight={mode === activeMode ? 700 : 400}
                >
                    {label}
                </text>
            ))}
        </g>
    );
}

function LensRowLabels({ activeLens }: { readonly activeLens: number }): React.ReactElement {
    return (
        <g data-mef-lens-labels aria-hidden="true">
            {Array.from({ length: MEF_LENS_COUNT }, (_unused, lens) => (
                <text
                    key={lens}
                    className="m2-mef-grid-72__lens-label"
                    data-lens={lens}
                    data-active={lens === activeLens ? 'true' : 'false'}
                    data-helix={lens < MEF_LENS_COUNT / 2 ? 'warm' : 'cool'}
                    x={PADDING + LABEL_GUTTER - 10}
                    y={rowCenterY(lens) + 4}
                    textAnchor="end"
                    fontSize={11}
                    fill={lens === activeLens ? '#f8fafc' : lens < MEF_LENS_COUNT / 2 ? WARM_HUE : COOL_HUE}
                    fontWeight={lens === activeLens ? 700 : 400}
                >
                    L{lens}
                </text>
            ))}
        </g>
    );
}

function TritonePairArcs({
    pairs,
    kleinFlipPhase
}: {
    readonly pairs: readonly MefTritonePair[];
    readonly kleinFlipPhase: M2KleinFlipPhase;
}): React.ReactElement {
    const transitioning = kleinFlipPhase === 'transitioning';
    return (
        <g data-mef-tritone-arcs aria-hidden="true">
            {pairs.map(pair => {
                const yA = rowCenterY(pair.lensA);
                const yB = rowCenterY(pair.lensB);
                const anchorX = PADDING + LABEL_GUTTER - 22;
                // Quadratic arc bulging into the left gutter, depth scaled by row span.
                const depth = 6 + Math.abs(pair.lensB - pair.lensA) * 4;
                const controlX = anchorX - depth;
                const path = `M ${anchorX} ${yA} Q ${controlX} ${(yA + yB) / 2} ${anchorX} ${yB}`;
                const bright = pair.isActivePair;
                return (
                    <path
                        key={`${pair.lensA}-${pair.lensB}`}
                        className="m2-mef-grid-72__tritone-arc"
                        data-tritone-arc
                        data-lens-a={pair.lensA}
                        data-lens-b={pair.lensB}
                        data-active-pair={bright ? 'true' : 'false'}
                        d={path}
                        fill="none"
                        stroke={bright ? '#f8fafc' : '#5a6472'}
                        strokeWidth={bright ? 2 : 1}
                        strokeOpacity={bright ? (transitioning ? 1 : 0.85) : 0.3}
                        // 200ms fade as the Klein-flip brightens the active pair-arc.
                        style={{ transition: 'stroke-opacity 200ms ease, stroke 200ms ease, stroke-width 200ms ease' }}
                    />
                );
            })}
        </g>
    );
}

function MefCellRect({ cell }: { readonly cell: MefCell }): React.ReactElement {
    const x = cellX(cell.mode);
    const y = cellY(cell.lens);
    const hue = cell.helixBit === 0 ? WARM_HUE : COOL_HUE;
    const isReturnColumn = !cell.isActiveAddress;

    // Helix-bit halo tint per cell; live row/column receive a stronger wash; the
    // single live cell adds an audio-driven halo on top.
    const baseOpacity = isReturnColumn ? 0.04 : 0.12;
    const lensWash = cell.inActiveLens ? 0.1 : 0;
    const modeWash = cell.inActiveMode ? 0.1 : 0;
    const fillOpacity = Math.min(0.85, baseOpacity + lensWash + modeWash + cell.haloIntensity * 0.55);

    return (
        <g
            data-mef-cell
            data-lens={cell.lens}
            data-mode={cell.mode}
            data-address72={cell.address72 ?? ''}
            data-active-address={cell.isActiveAddress ? 'true' : 'false'}
            data-return-column={isReturnColumn ? 'true' : 'false'}
            data-helix-bit={cell.helixBit}
            data-live-cell={cell.isLiveCell ? 'true' : 'false'}
            data-in-active-lens={cell.inActiveLens ? 'true' : 'false'}
            data-in-active-mode={cell.inActiveMode ? 'true' : 'false'}
            data-coordinate={cell.coordinate ?? ''}
            data-halo-intensity={cell.haloIntensity.toFixed(4)}
        >
            <title>
                {cell.isActiveAddress
                    ? `Lens ${cell.lens} · mode ${cell.mode} → address ${cell.address72}${
                          cell.coordinate ? ` (${cell.coordinate})` : ''
                      }`
                    : `Lens ${cell.lens} · #5/0 return potential (not a live address)`}
            </title>
            <rect
                className="m2-mef-grid-72__cell-rect"
                x={x}
                y={y}
                width={CELL_W}
                height={CELL_H}
                rx={4}
                ry={4}
                fill={hue}
                fillOpacity={fillOpacity}
                stroke={cell.isLiveCell ? '#f8fafc' : isReturnColumn ? '#3a424e' : '#4a5462'}
                strokeWidth={cell.isLiveCell ? 2 : 1}
                strokeDasharray={isReturnColumn ? '3 3' : undefined}
                style={{ transition: 'fill-opacity 200ms ease, stroke 200ms ease' }}
            />
            {cell.glyph && (
                <text
                    className="m2-mef-grid-72__cell-glyph"
                    x={x + CELL_W / 2}
                    y={y + CELL_H / 2 + 3}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#dfe6ee"
                    pointerEvents="none"
                >
                    {cell.glyph}
                </text>
            )}
        </g>
    );
}

// ── Normalisers (bounds + parity only; no MEF arithmetic) ────────────────────

function safeDecode(decoder: M2MefAxisDecoder, address72: number): M2MefCellProjection | null {
    try {
        const projection = decoder(address72, 'mef');
        if (
            !projection ||
            typeof projection.address72 !== 'number' ||
            typeof projection.lens !== 'number' ||
            typeof projection.mode !== 'number'
        ) {
            return null;
        }
        return projection;
    } catch {
        return null;
    }
}

function buildTritonePairs(activeLens: number): MefTritonePair[] {
    // Six disjoint pairs covering all 12 lenses: Lens N ↔ Lens N+3 for the
    // anchors whose intra-half position is < 3 (N ∈ {0,1,2,6,7,8}).
    const pairs: MefTritonePair[] = [];
    for (let lens = 0; lens < MEF_LENS_COUNT; lens += 1) {
        if (lens % (MEF_LENS_COUNT / 2) < MEF_TRITONE_OFFSET) {
            const lensB = lens + MEF_TRITONE_OFFSET;
            pairs.push(
                Object.freeze({
                    lensA: lens,
                    lensB,
                    isActivePair: activeLens === lens || activeLens === lensB
                })
            );
        }
    }
    return pairs;
}

function resolveLensMode(lensMode: MefLensModeFrame | null | undefined, tick: number | null): MefLensModeFrame {
    if (lensMode && Number.isFinite(lensMode.lens) && Number.isFinite(lensMode.mode)) {
        return Object.freeze({
            lens: clampLens(lensMode.lens),
            mode: clampMode(lensMode.mode)
        });
    }
    if (tick !== null) {
        const address72 = ((Math.trunc(tick) % MEF_ACTIVE_CELL_COUNT) + MEF_ACTIVE_CELL_COUNT) % MEF_ACTIVE_CELL_COUNT;
        return Object.freeze({
            lens: Math.floor(address72 / MEF_ACTIVE_MODE_COUNT),
            mode: address72 % MEF_ACTIVE_MODE_COUNT
        });
    }
    return Object.freeze({ lens: 0, mode: 0 });
}

function normalizeKleinPhase(phase: M2KleinFlipPhase | null | undefined): M2KleinFlipPhase {
    return phase === 'inverted' || phase === 'transitioning' ? phase : 'primary';
}

function haloIntensityFromAudio(audioOctet0: number | null | undefined): number {
    if (typeof audioOctet0 !== 'number' || !Number.isFinite(audioOctet0)) {
        return 0;
    }
    const magnitude = Math.abs(audioOctet0);
    // Saturating curve → bounded 0..1; deterministic and scale-tolerant.
    return clampUnit(magnitude / (magnitude + MEF_HALO_SATURATION_HZ));
}

function normalizeTick(tick: number | null | undefined): number | null {
    return typeof tick === 'number' && Number.isFinite(tick) ? Math.trunc(tick) : null;
}

function clampLens(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % MEF_LENS_COUNT) + MEF_LENS_COUNT) % MEF_LENS_COUNT;
}

function clampMode(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % MEF_ACTIVE_MODE_COUNT) + MEF_ACTIVE_MODE_COUNT) % MEF_ACTIVE_MODE_COUNT;
}

function clampBit(value: number): 0 | 1 {
    return value === 1 ? 1 : 0;
}

function flipBit(value: 0 | 1): 0 | 1 {
    return value === 0 ? 1 : 0;
}

function clampUnit(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.min(1, Math.max(0, value));
}

export default MefGrid72Component;
