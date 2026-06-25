// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2 → #3 (Parashakti vibrational address descending into the
//                   Mahamaya codon lattice — the 72→64 epogdoon bridge)
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser component)
//   Position (#18): 23.18 — 72→64 epogdoon-bridge engine
//   Actualises:     the live 9:8 compression as the M2 vibrational address (0..71)
//                   descends into the M3 codon space (0..63), reading ONLY the
//                   typed projection published by the kernel-bridge.
//   Public surface: EpogdoonBridgeEngine, buildEpogdoonBridgeModel, the
//                   EpogdoonBridgeProjection / M2EpogdoonProjector / M2KernelBridge
//                   typed contract, and the lattice-cell view model.
//   Does NOT own:   the compression law itself. The 9:8 fold (m2.h
//                   `m2_epogdoon_compress`, m3.h `apply_epogdoon_compression`,
//                   `is_evolutionary_gap`) lives in C and is surfaced through the
//                   kernel-bridge. This engine NEVER recomputes it locally.
//   Cross-links:    Track 24 (M3 Mahamaya codon lattice), Track 37 (DET / M2→M3
//                   evidence-to-codon projection route).
//   Contract:       kernelBridge.m2.epogdoonProjection(address72) →
//                   { compressedCodon: 0..63, isEvolutionaryGap, expandedBack }
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../common/meaning-packet';
import { ProvenanceBadge, type ProvenanceReadinessVariant } from './ProvenanceBadge';

// ── Invariants (declared; never recomputed) ─────────────────────────────────

/** The Parashakti 72-Invariant — every M2 vibrational structure resolves here. */
export const EPOGDOON_M2_ADDRESS_COUNT = 72;

/** The Mahamaya 64-Invariant — the uint64_t codon space (0..63). */
export const EPOGDOON_M3_CODON_COUNT = 64;

/**
 * The nine fold-points: where `isEvolutionaryGap` is true the 9:8 compression
 * folds inward rather than reaching a fresh codon — the evolutionary spiral.
 * This is the EXPECTED count surfaced by the bridge, not a locally-enforced one;
 * the engine renders a glyph for every gap the projection actually reports.
 */
export const EPOGDOON_FOLD_POINT_COUNT = 9;

/** Provenance source-field for the bridge projection (routes to the M3 authority). */
export const M2_EPOGDOON_PROJECTION_PROVENANCE_FIELD = 'detEvidence.epogdoonBridge';

/** The single authority this engine reads through — never a local computation. */
export const EPOGDOON_PROJECTION_SOURCE = 'kernelBridge.m2.epogdoonProjection(address72)' as const;

// ── Bridge contract (the ONLY typed projection this engine consumes) ─────────

/**
 * The typed projection returned by `kernelBridge.m2.epogdoonProjection(address72)`.
 * Mirrors the C bridge surface: `apply_epogdoon_compression` (descending M2→M3),
 * `is_evolutionary_gap` (the 9:8 fold detector), and the `m3_epogdoon_expand`
 * round-trip back into the 72-space.
 */
export interface EpogdoonBridgeProjection {
    /** Compressed M3 codon index (0..63) — `apply_epogdoon_compression(address72)`. */
    readonly compressedCodon: number;
    /** True at the nine fold-points — `is_evolutionary_gap(address72)`. */
    readonly isEvolutionaryGap: boolean;
    /** Round-trip back into the 72-space — `m3_epogdoon_expand(compressedCodon)`. */
    readonly expandedBack: number;
}

/** A function projecting a 72-address into the typed bridge projection. */
export type M2EpogdoonProjector = (address72: number) => EpogdoonBridgeProjection;

/** The slice of the kernel-bridge this engine depends on. */
export interface M2KernelBridge {
    readonly m2: {
        readonly epogdoonProjection: M2EpogdoonProjector;
    };
}

// ── View model ───────────────────────────────────────────────────────────────

/** One descent: a single M2 vibrational address projected into the codon lattice. */
export interface EpogdoonDescentCell {
    /** Source M2 vibrational address (0..71). */
    readonly address72: number;
    /** Compressed M3 codon (0..63) reported by the bridge. */
    readonly compressedCodon: number;
    /** True where the 9:8 fold collapses inward (rendered as a fold-point glyph). */
    readonly isFoldPoint: boolean;
    /** Round-trip address back through `m3_epogdoon_expand`. */
    readonly expandedBack: number;
    /** Whether the round-trip returns to the originating address (informational). */
    readonly roundTripStable: boolean;
    /** True for the address currently descending under the live profile-tick. */
    readonly isActive: boolean;
}

export interface EpogdoonBridgeModel {
    /** All 72 descents, address-ordered. */
    readonly cells: readonly EpogdoonDescentCell[];
    /** The fold-point cells only — the nine evolutionary-gap glyphs. */
    readonly foldPoints: readonly EpogdoonDescentCell[];
    /** The live descending M2 address under the current profile-tick. */
    readonly activeAddress72: number;
    /** The cell at the active address, if any. */
    readonly activeCell: EpogdoonDescentCell | null;
    /** Distinct codons reached by non-fold descents (expected 64). */
    readonly distinctCodonCount: number;
    /** Number of fold-points the bridge actually reported (expected 9). */
    readonly foldPointCount: number;
    /** True once the bridge surfaced a complete, well-formed 72→64 lattice. */
    readonly latticeComplete: boolean;
    /** The profile-tick that produced this descent, if known. */
    readonly tick: number | null;
}

export interface EpogdoonBridgeEngineProps {
    /** The kernel-bridge slice. When absent the engine renders a bridge-down state. */
    readonly kernelBridge?: M2KernelBridge | null;
    /** The live M2 address descending into the lattice (from the profile bus). */
    readonly activeAddress72?: number | null;
    /** Live profile-tick driving the descent (falls back to deriving the address). */
    readonly tick?: number | null;
    /** Meaning packet for provenance badging. */
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    /** Readiness for provenance badge tone. */
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    readonly className?: string;
}

// ── Model builder (pure; reads ONLY the injected bridge projection) ──────────

export function buildEpogdoonBridgeModel(input: {
    readonly kernelBridge?: M2KernelBridge | null;
    readonly activeAddress72?: number | null;
    readonly tick?: number | null;
}): EpogdoonBridgeModel {
    const tick = normalizeTick(input.tick);
    const activeAddress72 = resolveActiveAddress(input.activeAddress72, tick);
    const projector = input.kernelBridge?.m2?.epogdoonProjection ?? null;

    if (!projector) {
        return Object.freeze({
            cells: Object.freeze([] as EpogdoonDescentCell[]),
            foldPoints: Object.freeze([] as EpogdoonDescentCell[]),
            activeAddress72,
            activeCell: null,
            distinctCodonCount: 0,
            foldPointCount: 0,
            latticeComplete: false,
            tick
        });
    }

    const cells: EpogdoonDescentCell[] = [];
    const distinctCodons = new Set<number>();
    let malformed = false;

    for (let address72 = 0; address72 < EPOGDOON_M2_ADDRESS_COUNT; address72 += 1) {
        const projection = safeProject(projector, address72);
        if (!projection) {
            malformed = true;
            continue;
        }
        const compressedCodon = clampCodon(projection.compressedCodon);
        const isFoldPoint = projection.isEvolutionaryGap === true;
        const expandedBack = clampAddress72(projection.expandedBack);
        if (!isFoldPoint) {
            distinctCodons.add(compressedCodon);
        }
        cells.push(
            Object.freeze({
                address72,
                compressedCodon,
                isFoldPoint,
                expandedBack,
                roundTripStable: expandedBack === address72,
                isActive: address72 === activeAddress72
            })
        );
    }

    const foldPoints = cells.filter(cell => cell.isFoldPoint);
    const activeCell = cells.find(cell => cell.isActive) ?? null;
    const latticeComplete = !malformed && cells.length === EPOGDOON_M2_ADDRESS_COUNT;

    return Object.freeze({
        cells: Object.freeze(cells),
        foldPoints: Object.freeze(foldPoints),
        activeAddress72,
        activeCell,
        distinctCodonCount: distinctCodons.size,
        foldPointCount: foldPoints.length,
        latticeComplete,
        tick
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export function EpogdoonBridgeEngine(props: EpogdoonBridgeEngineProps): React.ReactElement {
    const model = React.useMemo(
        () =>
            buildEpogdoonBridgeModel({
                kernelBridge: props.kernelBridge ?? null,
                activeAddress72: props.activeAddress72 ?? null,
                tick: props.tick ?? null
            }),
        [props.kernelBridge, props.activeAddress72, props.tick]
    );

    // Interactive inspection — the focused address defaults to the live descent
    // and follows it as the profile-tick advances, but the user may pin any cell.
    const [pinnedAddress, setPinnedAddress] = React.useState<number | null>(null);
    const focusedAddress = pinnedAddress ?? model.activeAddress72;
    const focusedCell =
        model.cells.find(cell => cell.address72 === focusedAddress) ?? model.activeCell ?? null;

    const className = ['m2-epogdoon-bridge-engine', props.className].filter(Boolean).join(' ');

    if (!model.latticeComplete && model.cells.length === 0) {
        return (
            <section
                className={className}
                aria-label="Epogdoon 72→64 bridge engine"
                data-epogdoon-bridge-engine
                data-bridge-state="bridge-unavailable"
                data-active-address72={model.activeAddress72}
            >
                <p className="mext-widget-empty" data-pending-field={EPOGDOON_PROJECTION_SOURCE}>
                    The 72→64 epogdoon bridge is waiting for {EPOGDOON_PROJECTION_SOURCE}.
                </p>
            </section>
        );
    }

    return (
        <section
            className={className}
            aria-label="Epogdoon 72→64 bridge engine"
            data-epogdoon-bridge-engine
            data-bridge-state={model.latticeComplete ? 'ready' : 'partial'}
            data-active-address72={model.activeAddress72}
            data-active-tick={model.tick ?? ''}
            data-fold-point-count={model.foldPointCount}
            data-distinct-codon-count={model.distinctCodonCount}
        >
            <header className="m2-epogdoon-bridge-engine__header">
                <h4>Epogdoon bridge — 72 → 64</h4>
                <span className="m2-epogdoon-bridge-engine__ratio">9 : 8 compression</span>
                <span
                    className="m2-epogdoon-bridge-engine__fold-tally"
                    data-fold-point-count={model.foldPointCount}
                    data-expected-fold-points={EPOGDOON_FOLD_POINT_COUNT}
                >
                    {model.foldPointCount} fold-points
                </span>
                {props.packet && (
                    <ProvenanceBadge
                        compact
                        field={M2_EPOGDOON_PROJECTION_PROVENANCE_FIELD}
                        readiness={props.readiness ?? 'ready_public_current'}
                        provenance={props.packet.meaningPacketProvenanceFor(M2_EPOGDOON_PROJECTION_PROVENANCE_FIELD)}
                    />
                )}
            </header>

            <FoldPointRibbon
                foldPoints={model.foldPoints}
                focusedAddress={focusedAddress}
                onSelect={setPinnedAddress}
            />

            <ol className="m2-epogdoon-bridge-engine__lattice" aria-label="72→64 descent lattice">
                {model.cells.map(cell => (
                    <EpogdoonDescentCellView
                        key={cell.address72}
                        cell={cell}
                        focused={cell.address72 === focusedAddress}
                        onSelect={setPinnedAddress}
                    />
                ))}
            </ol>

            <EpogdoonInspector cell={focusedCell} pinned={pinnedAddress !== null} onClear={() => setPinnedAddress(null)} />
        </section>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function FoldPointRibbon({
    foldPoints,
    focusedAddress,
    onSelect
}: {
    readonly foldPoints: readonly EpogdoonDescentCell[];
    readonly focusedAddress: number;
    readonly onSelect: (address72: number) => void;
}): React.ReactElement {
    return (
        <div
            className="m2-epogdoon-bridge-engine__fold-ribbon"
            aria-label="Evolutionary-gap fold-points"
            data-fold-ribbon
        >
            {foldPoints.map(cell => (
                <button
                    key={cell.address72}
                    type="button"
                    className="m2-epogdoon-bridge-engine__fold-glyph"
                    data-fold-point-glyph
                    data-address72={cell.address72}
                    data-compressed-codon={cell.compressedCodon}
                    data-active={cell.isActive ? 'true' : 'false'}
                    aria-pressed={cell.address72 === focusedAddress}
                    aria-label={`Fold-point at address ${cell.address72} (evolutionary gap)`}
                    onClick={() => onSelect(cell.address72)}
                >
                    <span aria-hidden="true">∞</span>
                    <span className="m2-epogdoon-bridge-engine__fold-glyph-label">{cell.address72}</span>
                </button>
            ))}
        </div>
    );
}

function EpogdoonDescentCellView({
    cell,
    focused,
    onSelect
}: {
    readonly cell: EpogdoonDescentCell;
    readonly focused: boolean;
    readonly onSelect: (address72: number) => void;
}): React.ReactElement {
    return (
        <li
            className="m2-epogdoon-bridge-engine__cell"
            data-epogdoon-cell
            data-address72={cell.address72}
            data-compressed-codon={cell.compressedCodon}
            data-fold-point={cell.isFoldPoint ? 'true' : 'false'}
            data-active={cell.isActive ? 'true' : 'false'}
            data-descending={cell.isActive ? 'true' : 'false'}
            data-round-trip-stable={cell.roundTripStable ? 'true' : 'false'}
        >
            <button
                type="button"
                className="m2-epogdoon-bridge-engine__cell-button"
                aria-pressed={focused}
                aria-label={
                    cell.isFoldPoint
                        ? `Address ${cell.address72} folds inward (evolutionary gap)`
                        : `Address ${cell.address72} descends to codon ${cell.compressedCodon}`
                }
                onClick={() => onSelect(cell.address72)}
            >
                <span className="m2-epogdoon-bridge-engine__cell-m2">#2·{cell.address72}</span>
                <span className="m2-epogdoon-bridge-engine__cell-arrow" aria-hidden="true">
                    {cell.isFoldPoint ? '↺' : '↓'}
                </span>
                {cell.isFoldPoint ? (
                    <span className="m2-epogdoon-bridge-engine__cell-fold" data-fold-point-glyph aria-hidden="true">
                        ∞
                    </span>
                ) : (
                    <span className="m2-epogdoon-bridge-engine__cell-m3">#3·{cell.compressedCodon}</span>
                )}
            </button>
        </li>
    );
}

function EpogdoonInspector({
    cell,
    pinned,
    onClear
}: {
    readonly cell: EpogdoonDescentCell | null;
    readonly pinned: boolean;
    readonly onClear: () => void;
}): React.ReactElement | null {
    if (!cell) {
        return null;
    }
    return (
        <dl
            className="m2-epogdoon-bridge-engine__inspector"
            data-epogdoon-inspector
            data-address72={cell.address72}
            data-fold-point={cell.isFoldPoint ? 'true' : 'false'}
        >
            <dt>M2 vibrational address</dt>
            <dd>#2·{cell.address72}</dd>
            <dt>M3 compressed codon</dt>
            <dd>{cell.isFoldPoint ? 'evolutionary gap — no fresh codon' : `#3·${cell.compressedCodon}`}</dd>
            <dt>Round-trip (expand → 72)</dt>
            <dd>
                #2·{cell.expandedBack}
                {cell.roundTripStable ? ' (stable)' : ' (folded representative)'}
            </dd>
            <dt>Projection source</dt>
            <dd>{EPOGDOON_PROJECTION_SOURCE}</dd>
            {pinned && (
                <dd>
                    <button
                        type="button"
                        className="m2-epogdoon-bridge-engine__inspector-clear"
                        onClick={onClear}
                        aria-label="Resume following the live descent"
                    >
                        Follow live descent
                    </button>
                </dd>
            )}
        </dl>
    );
}

// ── Normalisers (bounds-only; no compression arithmetic) ─────────────────────

function safeProject(projector: M2EpogdoonProjector, address72: number): EpogdoonBridgeProjection | null {
    try {
        const projection = projector(address72);
        if (
            !projection ||
            typeof projection.compressedCodon !== 'number' ||
            typeof projection.expandedBack !== 'number' ||
            typeof projection.isEvolutionaryGap !== 'boolean'
        ) {
            return null;
        }
        return projection;
    } catch {
        return null;
    }
}

function resolveActiveAddress(activeAddress72: number | null | undefined, tick: number | null): number {
    if (typeof activeAddress72 === 'number' && Number.isFinite(activeAddress72)) {
        return clampAddress72(activeAddress72);
    }
    if (tick !== null) {
        return clampAddress72(tick);
    }
    return 0;
}

function normalizeTick(tick: number | null | undefined): number | null {
    return typeof tick === 'number' && Number.isFinite(tick) ? Math.trunc(tick) : null;
}

function clampAddress72(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % EPOGDOON_M2_ADDRESS_COUNT) + EPOGDOON_M2_ADDRESS_COUNT) % EPOGDOON_M2_ADDRESS_COUNT;
}

function clampCodon(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % EPOGDOON_M3_CODON_COUNT) + EPOGDOON_M3_CODON_COUNT) % EPOGDOON_M3_CODON_COUNT;
}

export default EpogdoonBridgeEngine;
