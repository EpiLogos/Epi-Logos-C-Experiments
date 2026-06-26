// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2 (Parashakti harmonic-correspondential instrument) — the
//                   single 72-leaf correspondence tree read through six axis
//                   decoders, with two sonic overlays (mantra / asma) that swap
//                   the leaf-space without becoming axes.
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser component)
//   Position (#5):  23.5 — CorrespondenceTreeWidget: six-axis filter + two
//                   sonic-overlay tabs. Mounts under view ID
//                   `m2.parashakti.correspondenceTree` (M2CorrespondenceTreeWidget).
//   Actualises:     ONE tree (TS-16 / DR-WC-M2-1 resolution — NOT six trees). Six
//                   axis-filter chips — MEF·QL ‖ tattva-phase ‖ decan-face ‖ Shem ‖
//                   maqam ‖ DET-projection — filter the 72 leaves through the
//                   corresponding axis decoder; multi-chip activation shows the
//                   intersection (the addresses every active decoder agrees on).
//                   Two sonic-overlay TABS — Mantra (100) and Asma (99+1) — swap the
//                   tree from the 72-leaf invariant to the 100- / 99+1-leaf overlay;
//                   while an overlay is active the axis chips grey out (overlays are
//                   NOT axes, per DR-M2-2). The planetary-keying side panel renders
//                   the 10-row M2_PLANET_LUT alongside (keying, not an axis).
//   Public surface: CorrespondenceTreeWidget, buildCorrespondenceTreeModel, the
//                   M2CorrespondenceTreeBridge / M2TreeDecoder / M2TreeDecodeResult
//                   typed contract, the CorrespondenceTreeModel / CorrespondenceTreeLeaf
//                   / SonicOverlayLeaf view model, the CorrespondenceAxis vocabulary
//                   (CORRESPONDENCE_AXES + AXIS_CHIP_LABELS), and the leaf invariants
//                   (CORRESPONDENCE_TREE_LEAF_COUNT, MANTRA/ASMA overlay counts).
//   Does NOT own:   the axis-decode law, the mantra/asma overlay law, or the planetary
//                   LUT. Every leaf payload is surfaced ONLY through
//                   `kernelBridge.m2.decodeAxisAt(slot, axis)` (Tranche 3.3-M2); S2
//                   enrichment routes through `kernelBridge.s2.parashaktiCorrespondences`
//                   (Tranche 3.4-M2). This widget NEVER recomputes a decode; it folds
//                   the published projection into the tree.
//   Cross-links:    MantraCard / AsmaCard (the per-leaf sacred-sonic readings of the
//                   same overlays), MefGrid72Component (Layer A), the planetary keying
//                   panel (planetary-correspondence.tsx), EpogdoonBridgeEngine.
//   Contract:       kernelBridge.m2.decodeAxisAt(slot, axis) → typed projection;
//                   kernelBridge.s2.parashaktiCorrespondences(address72) → S2 enrichment.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../common/meaning-packet';
import type { AxisName, M2CorrespondenceTreeSonicOverlay } from '../state/M2BimbaPratibimbaSelector';
import type { MantraPhase } from './cards/M2-MantraCard';
import type { AsmaGroup } from './cards/M2-AsmaCard';
import { CorrespondenceTreePlanetaryKeyingPanel } from './planetary-correspondence';
import {
    M2_TREE_LEAF_PROVENANCE_FIELD,
    ProvenanceBadge,
    type ProvenanceReadinessVariant
} from './ProvenanceBadge';

// ── Invariants (declared; never recomputed) ─────────────────────────────────

/** The Parashakti 72-Invariant — the address-keyed tree always has 72 leaves. */
export const CORRESPONDENCE_TREE_LEAF_COUNT = 72;

/** The mantra overlay cardinality (50 Matrika descent + 50 Malini ascent). */
export const MANTRA_OVERLAY_LEAF_COUNT = 100;

/** The Asma overlay cardinality (99 names + 1 Hidden). */
export const ASMA_OVERLAY_LEAF_COUNT = 100;

/** The Hidden Asma name — the +1 beyond the 99. */
export const ASMA_HIDDEN_OVERLAY_INDEX = 99;

/** Lower / upper bound of the mantra frequency gradient (Hz). */
export const MANTRA_OVERLAY_FREQ_MIN = 144;
export const MANTRA_OVERLAY_FREQ_MAX = 432;

/** Provenance source-field for a tree leaf (routes to the S2 correspondence authority). */
export const CORRESPONDENCE_TREE_LEAF_PROVENANCE_FIELD = M2_TREE_LEAF_PROVENANCE_FIELD;

/** The single decode authority every leaf reads through — never a local computation. */
export const CORRESPONDENCE_TREE_DECODE_SOURCE = 'kernelBridge.m2.decodeAxisAt(slot, axis)' as const;

// ── Axis vocabulary (the six chips — overlays are NOT axes, per DR-M2-2) ──────

/**
 * The six correspondence axes — the M2 address-view vocabulary minus the two
 * sonic overlays. `asma` is an overlay TAB, not an axis chip; this is the
 * `M2AddressView['name']` enum split (`'shem'` + `'asma'` separate) honoured.
 */
export type CorrespondenceAxis = Exclude<AxisName, 'asma'>;

/** Canonical chip order (left → right along the chrome). */
export const CORRESPONDENCE_AXES: readonly CorrespondenceAxis[] = Object.freeze([
    'mef',
    'tattva-phase',
    'decan-face',
    'shem',
    'maqam',
    'det-projection'
]);

/** Human chip labels — the chrome captions per spec §23.5. */
export const AXIS_CHIP_LABELS: Readonly<Record<CorrespondenceAxis, string>> = Object.freeze({
    mef: 'MEF·QL',
    'tattva-phase': 'tattva-phase',
    'decan-face': 'decan-face',
    shem: 'Shem',
    maqam: 'maqam',
    'det-projection': 'DET-projection'
});

/** The two sonic-overlay tabs (beside the axis chips). */
export interface SonicOverlayTabDescriptor {
    readonly overlay: Exclude<M2CorrespondenceTreeSonicOverlay, 'none'>;
    readonly label: string;
    readonly cardinality: number;
}

export const SONIC_OVERLAY_TABS: readonly SonicOverlayTabDescriptor[] = Object.freeze([
    Object.freeze({ overlay: 'mantra', label: 'Mantra (100)', cardinality: MANTRA_OVERLAY_LEAF_COUNT }),
    Object.freeze({ overlay: 'asma', label: 'Asma (99+1)', cardinality: ASMA_OVERLAY_LEAF_COUNT })
]);

// ── Bridge contract (the ONLY typed surface this widget consumes) ────────────

/** Which slot-space a decode reads — the six axes plus the two overlays. */
export type M2TreeDecodeAxis = CorrespondenceAxis | 'mantra' | 'asma';

/**
 * The permissive structural projection returned by `decodeAxisAt`. Each of the
 * six axes and two overlays returns its own richer shape (see MefGrid72Component,
 * MantraCard, AsmaCard); the tree reads only the fields below, defensively, so a
 * single decoder serves every axis without the tree owning any decode law.
 */
export interface M2TreeDecodeResult {
    readonly address72?: number;
    readonly coordinate?: string;
    readonly glyph?: string;
    readonly label?: string;
    readonly name?: string;
    readonly meaningId?: string | number;
    // Mantra overlay
    readonly mantraIndex?: number;
    readonly phoneme?: string;
    readonly frequencyHz?: number;
    readonly phase?: MantraPhase;
    readonly element?: string;
    // Asma overlay
    readonly asmaIndex?: number;
    readonly group?: AsmaGroup;
    readonly isInternal?: boolean;
    readonly isProjective?: boolean;
    // Planetary keying (read for the side-panel arrows when a decan/Shem leaf is selected)
    readonly rulingPlanet?: number;
    readonly planetIndex?: number;
    readonly planetRuler?: number;
    readonly [key: string]: unknown;
}

/** A function decoding a slot along one axis / overlay. */
export type M2TreeDecoder = (slot: number, axis: M2TreeDecodeAxis) => M2TreeDecodeResult | null | undefined;

/** Optional S2 enrichment for the selected leaf. */
export type M2ParashaktiCorrespondences = (address72: number) => Promise<unknown> | unknown;

/** The slice of the kernel-bridge this widget depends on. */
export interface M2CorrespondenceTreeBridge {
    readonly m2: {
        readonly decodeAxisAt: M2TreeDecoder;
    };
    readonly s2?: {
        readonly parashaktiCorrespondences?: M2ParashaktiCorrespondences;
    };
}

// ── View model ───────────────────────────────────────────────────────────────

/** One axis-decode of a single address leaf (only the active axes are decoded). */
export interface CorrespondenceAxisCell {
    readonly axis: CorrespondenceAxis;
    /** True when the decoder returned a well-formed projection for this address. */
    readonly decoded: boolean;
    /** Short display label folded from the projection, if any. */
    readonly label: string | null;
    /** MEF·QL / decan coordinate published by the decoder, if any. */
    readonly coordinate: string | null;
}

/** One leaf of the 72-address tree. */
export interface CorrespondenceTreeLeaf {
    readonly address72: number;
    /** Per-active-axis decode cells (empty when no axis chip is active). */
    readonly axisCells: readonly CorrespondenceAxisCell[];
    /** True when every active axis decoded — i.e. the leaf survives the intersection. */
    readonly passesFilter: boolean;
    /** True for the address currently live under the profile-tick. */
    readonly isActive: boolean;
}

/** One leaf of a sonic overlay (mantra 100 or asma 99+1). */
export interface SonicOverlayLeaf {
    /** Enumeration slot (0..cardinality-1). */
    readonly slot: number;
    /** Overlay index reported by the decoder (mantraIndex / asmaIndex), or the slot. */
    readonly index: number;
    /** Primary glyph — Sanskrit phoneme (mantra) or Arabic name (asma). */
    readonly primary: string;
    /** Secondary tag — Matrika/Malini phase (mantra) or Jalal/Kamal/Jamal group (asma). */
    readonly secondary: string;
    /** Trailing detail — frequency readout (mantra) or routing badge (asma). */
    readonly detail: string;
    /** True for the asma Hidden +1 (index 99). */
    readonly isHidden: boolean;
    /** Band fraction (0..1) of `frequencyHz` within the mantra gradient; 0 for asma. */
    readonly bandFraction: number;
    /** True when the overlay decoder returned a well-formed projection. */
    readonly decoded: boolean;
}

export interface CorrespondenceTreeModel {
    /** `axis` while browsing the 72 addresses; `overlay` while a sonic tab is active. */
    readonly mode: 'axis' | 'overlay';
    readonly sonicOverlay: M2CorrespondenceTreeSonicOverlay;
    /** The active axis chips, canonical-ordered. Always empty in overlay mode. */
    readonly activeAxes: readonly CorrespondenceAxis[];
    /** True while an overlay greys out the axis chips. */
    readonly axisChipsDisabled: boolean;
    /** All 72 address leaves (axis mode); empty in overlay mode. */
    readonly leaves: readonly CorrespondenceTreeLeaf[];
    /** The address leaves surviving the active-axis intersection. */
    readonly visibleLeaves: readonly CorrespondenceTreeLeaf[];
    /** The overlay leaves (overlay mode); empty in axis mode. */
    readonly overlayLeaves: readonly SonicOverlayLeaf[];
    /** The active overlay's declared cardinality (100 / 99+1), or 72 in axis mode. */
    readonly leafSpaceCardinality: number;
    /** The live address under the profile-tick. */
    readonly activeAddress72: number;
    /** The planet keyed by the selected decan / Shem leaf, if any (side-panel arrows). */
    readonly selectedPlanetIndex: number | null;
    /** True once at least one decode resolved through the bridge. */
    readonly bridgeReady: boolean;
}

export interface CorrespondenceTreeWidgetProps {
    /** The kernel-bridge slice. When absent the tree renders a bridge-down state. */
    readonly kernelBridge?: M2CorrespondenceTreeBridge | null;
    /** The live M2 address (from the profile bus). */
    readonly activeAddress72?: number | null;
    /** Live profile-tick driving the live address (falls back to deriving it). */
    readonly tick?: number | null;
    /** Initial axis-filter chips (from persisted `correspondenceTreeAxisFilter`). */
    readonly initialAxisFilter?: readonly AxisName[];
    /** Initial sonic-overlay tab (from persisted `correspondenceTreeSonicOverlay`). */
    readonly initialSonicOverlay?: M2CorrespondenceTreeSonicOverlay;
    /** Notified when the user toggles axis chips (for state persistence — 23.15). */
    readonly onAxisFilterChange?: (axes: readonly CorrespondenceAxis[]) => void;
    /** Notified when the user swaps the sonic-overlay tab (for state persistence). */
    readonly onSonicOverlayChange?: (overlay: M2CorrespondenceTreeSonicOverlay) => void;
    /** Meaning packet for provenance badging. */
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    /** Readiness for provenance badge tone. */
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    readonly className?: string;
}

// ── Model builder (pure; reads ONLY the injected bridge projection) ──────────

export function buildCorrespondenceTreeModel(input: {
    readonly kernelBridge?: M2CorrespondenceTreeBridge | null;
    readonly axisFilter?: readonly AxisName[];
    readonly sonicOverlay?: M2CorrespondenceTreeSonicOverlay;
    readonly activeAddress72?: number | null;
    readonly tick?: number | null;
    readonly selectedSlot?: number | null;
}): CorrespondenceTreeModel {
    const decoder = input.kernelBridge?.m2?.decodeAxisAt ?? null;
    const sonicOverlay = normalizeOverlay(input.sonicOverlay);
    const activeAxes = normalizeAxisFilter(input.axisFilter);
    const activeAddress72 = resolveActiveAddress(input.activeAddress72, input.tick);

    if (sonicOverlay !== 'none') {
        const overlayLeaves = buildOverlayLeaves(decoder, sonicOverlay);
        const cardinality = sonicOverlay === 'mantra' ? MANTRA_OVERLAY_LEAF_COUNT : ASMA_OVERLAY_LEAF_COUNT;
        return Object.freeze({
            mode: 'overlay',
            sonicOverlay,
            activeAxes: Object.freeze([] as CorrespondenceAxis[]),
            axisChipsDisabled: true,
            leaves: Object.freeze([] as CorrespondenceTreeLeaf[]),
            visibleLeaves: Object.freeze([] as CorrespondenceTreeLeaf[]),
            overlayLeaves,
            leafSpaceCardinality: cardinality,
            activeAddress72,
            selectedPlanetIndex: null,
            bridgeReady: overlayLeaves.some(leaf => leaf.decoded)
        });
    }

    const leaves: CorrespondenceTreeLeaf[] = [];
    let anyDecoded = false;
    for (let address72 = 0; address72 < CORRESPONDENCE_TREE_LEAF_COUNT; address72 += 1) {
        const axisCells: CorrespondenceAxisCell[] = [];
        let passesFilter = true;
        for (const axis of activeAxes) {
            const projection = decoder ? safeDecode(decoder, address72, axis) : null;
            const decoded = projection !== null;
            if (decoded) {
                anyDecoded = true;
            } else {
                passesFilter = false;
            }
            axisCells.push(
                Object.freeze({
                    axis,
                    decoded,
                    label: projection ? leafLabel(projection, address72) : null,
                    coordinate: projection ? stringField(projection.coordinate) : null
                })
            );
        }
        leaves.push(
            Object.freeze({
                address72,
                axisCells: Object.freeze(axisCells),
                // With no chip active the whole tree is visible (every leaf passes).
                passesFilter: activeAxes.length === 0 ? true : passesFilter,
                isActive: address72 === activeAddress72
            })
        );
    }

    const visibleLeaves = leaves.filter(leaf => leaf.passesFilter);
    const selectedPlanetIndex = resolveSelectedPlanet(decoder, input.selectedSlot);

    return Object.freeze({
        mode: 'axis',
        sonicOverlay,
        activeAxes,
        axisChipsDisabled: false,
        leaves: Object.freeze(leaves),
        visibleLeaves: Object.freeze(visibleLeaves),
        overlayLeaves: Object.freeze([] as SonicOverlayLeaf[]),
        leafSpaceCardinality: CORRESPONDENCE_TREE_LEAF_COUNT,
        activeAddress72,
        selectedPlanetIndex,
        bridgeReady: anyDecoded
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export function CorrespondenceTreeWidget(props: CorrespondenceTreeWidgetProps): React.ReactElement {
    const [axisFilter, setAxisFilter] = React.useState<readonly CorrespondenceAxis[]>(
        () => normalizeAxisFilter(props.initialAxisFilter)
    );
    const [sonicOverlay, setSonicOverlay] = React.useState<M2CorrespondenceTreeSonicOverlay>(
        () => normalizeOverlay(props.initialSonicOverlay)
    );
    const [selectedSlot, setSelectedSlot] = React.useState<number | null>(null);

    const model = React.useMemo(
        () =>
            buildCorrespondenceTreeModel({
                kernelBridge: props.kernelBridge ?? null,
                axisFilter,
                sonicOverlay,
                activeAddress72: props.activeAddress72 ?? null,
                tick: props.tick ?? null,
                selectedSlot
            }),
        [props.kernelBridge, axisFilter, sonicOverlay, props.activeAddress72, props.tick, selectedSlot]
    );

    // S2 enrichment for the selected address leaf — best-effort, never blocking.
    const s2Correspondences = props.kernelBridge?.s2?.parashaktiCorrespondences ?? null;
    React.useEffect(() => {
        if (!s2Correspondences || model.mode !== 'axis' || selectedSlot === null) {
            return;
        }
        let cancelled = false;
        void Promise.resolve()
            .then(() => s2Correspondences(selectedSlot))
            .catch(() => undefined)
            .then(() => {
                if (cancelled) {
                    return;
                }
                // Enrichment is provenance-only here; the leaf payload already
                // resolves through decodeAxisAt. Hook reserved for S2 detail panels.
            });
        return () => {
            cancelled = true;
        };
    }, [s2Correspondences, model.mode, selectedSlot]);

    const toggleAxis = React.useCallback(
        (axis: CorrespondenceAxis) => {
            setAxisFilter(prev => {
                const next = prev.includes(axis) ? prev.filter(a => a !== axis) : [...prev, axis];
                const canonical = normalizeAxisFilter(next);
                props.onAxisFilterChange?.(canonical);
                return canonical;
            });
        },
        [props]
    );

    const selectOverlay = React.useCallback(
        (overlay: Exclude<M2CorrespondenceTreeSonicOverlay, 'none'>) => {
            setSonicOverlay(prev => {
                const next: M2CorrespondenceTreeSonicOverlay = prev === overlay ? 'none' : overlay;
                props.onSonicOverlayChange?.(next);
                return next;
            });
            setSelectedSlot(null);
        },
        [props]
    );

    const className = ['m2-correspondence-tree-widget', props.className].filter(Boolean).join(' ');

    return (
        <section
            className={className}
            aria-label="M2 correspondence tree — six-axis browser with sonic overlays"
            data-correspondence-tree-widget
            data-tree-mode={model.mode}
            data-sonic-overlay={model.sonicOverlay}
            data-axis-chips-disabled={model.axisChipsDisabled ? 'true' : 'false'}
            data-active-address72={model.activeAddress72}
            data-leaf-space-cardinality={model.leafSpaceCardinality}
            data-tree-state={model.bridgeReady ? 'ready' : 'bridge-unavailable'}
        >
            <header className="m2-correspondence-tree-widget__chrome" data-tree-chrome>
                <AxisFilterChips
                    activeAxes={model.activeAxes}
                    disabled={model.axisChipsDisabled}
                    onToggle={toggleAxis}
                />
                <SonicOverlayTabs activeOverlay={model.sonicOverlay} onSelect={selectOverlay} />
                {props.packet && (
                    <ProvenanceBadge
                        compact
                        field={CORRESPONDENCE_TREE_LEAF_PROVENANCE_FIELD}
                        readiness={props.readiness ?? (model.bridgeReady ? 'ready_public_current' : 'bridge_unavailable')}
                        provenance={props.packet.meaningPacketProvenanceFor(CORRESPONDENCE_TREE_LEAF_PROVENANCE_FIELD)}
                    />
                )}
            </header>

            <div className="m2-correspondence-tree-widget__body">
                {/* ONE tree — the leaf-space swaps between the 72 addresses and the
                    active sonic overlay, but it is always the same <ol>. */}
                <ol
                    className="m2-correspondence-tree-widget__tree"
                    aria-label={
                        model.mode === 'overlay'
                            ? `${model.sonicOverlay} sonic-overlay tree (${model.leafSpaceCardinality} leaves)`
                            : `72-address correspondence tree (${model.visibleLeaves.length} of 72 visible)`
                    }
                    data-correspondence-tree
                    data-leaf-count={model.mode === 'overlay' ? model.overlayLeaves.length : model.visibleLeaves.length}
                >
                    {model.mode === 'overlay'
                        ? sortOverlayLeaves(model.overlayLeaves, model.sonicOverlay).map(leaf => (
                              <SonicOverlayLeafView
                                  key={`overlay-${leaf.slot}`}
                                  leaf={leaf}
                                  overlay={model.sonicOverlay}
                                  selected={leaf.slot === selectedSlot}
                                  onSelect={setSelectedSlot}
                              />
                          ))
                        : model.visibleLeaves.map(leaf => (
                              <AddressLeafView
                                  key={`addr-${leaf.address72}`}
                                  leaf={leaf}
                                  selected={leaf.address72 === selectedSlot}
                                  onSelect={setSelectedSlot}
                              />
                          ))}
                    {model.mode === 'axis' && model.visibleLeaves.length === 0 && (
                        <li className="m2-correspondence-tree-widget__empty" data-tree-empty>
                            <p className="mext-widget-empty" data-pending-field={CORRESPONDENCE_TREE_DECODE_SOURCE}>
                                No addresses survive the active-axis intersection
                                {model.bridgeReady ? '.' : ` — waiting for ${CORRESPONDENCE_TREE_DECODE_SOURCE}.`}
                            </p>
                        </li>
                    )}
                </ol>

                <CorrespondenceTreePlanetaryKeyingPanel
                    selectedPlanetIndex={model.selectedPlanetIndex ?? undefined}
                    packet={props.packet}
                    readiness={props.readiness}
                />
            </div>
        </section>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function AxisFilterChips({
    activeAxes,
    disabled,
    onToggle
}: {
    readonly activeAxes: readonly CorrespondenceAxis[];
    readonly disabled: boolean;
    readonly onToggle: (axis: CorrespondenceAxis) => void;
}): React.ReactElement {
    return (
        <div
            className="m2-correspondence-tree-widget__axis-chips"
            role="group"
            aria-label="Correspondence axis filter"
            data-axis-chips
            data-disabled={disabled ? 'true' : 'false'}
        >
            {CORRESPONDENCE_AXES.map(axis => {
                const active = activeAxes.includes(axis);
                return (
                    <button
                        key={axis}
                        type="button"
                        className="m2-correspondence-tree-widget__axis-chip"
                        data-axis-chip
                        data-axis={axis}
                        data-active={active ? 'true' : 'false'}
                        aria-pressed={active}
                        aria-disabled={disabled}
                        disabled={disabled}
                        onClick={() => !disabled && onToggle(axis)}
                    >
                        {AXIS_CHIP_LABELS[axis]}
                    </button>
                );
            })}
        </div>
    );
}

function SonicOverlayTabs({
    activeOverlay,
    onSelect
}: {
    readonly activeOverlay: M2CorrespondenceTreeSonicOverlay;
    readonly onSelect: (overlay: Exclude<M2CorrespondenceTreeSonicOverlay, 'none'>) => void;
}): React.ReactElement {
    return (
        <div
            className="m2-correspondence-tree-widget__sonic-tabs"
            role="tablist"
            aria-label="Sonic-overlay tabs"
            data-sonic-tabs
        >
            {SONIC_OVERLAY_TABS.map(tab => {
                const active = activeOverlay === tab.overlay;
                return (
                    <button
                        key={tab.overlay}
                        type="button"
                        role="tab"
                        className="m2-correspondence-tree-widget__sonic-tab"
                        data-sonic-tab={tab.overlay}
                        data-active={active ? 'true' : 'false'}
                        data-cardinality={tab.cardinality}
                        aria-selected={active}
                        onClick={() => onSelect(tab.overlay)}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

function AddressLeafView({
    leaf,
    selected,
    onSelect
}: {
    readonly leaf: CorrespondenceTreeLeaf;
    readonly selected: boolean;
    readonly onSelect: (address72: number) => void;
}): React.ReactElement {
    return (
        <li
            className="m2-correspondence-tree-widget__leaf"
            data-tree-leaf
            data-leaf-kind="address"
            data-address72={leaf.address72}
            data-active={leaf.isActive ? 'true' : 'false'}
            data-passes-filter={leaf.passesFilter ? 'true' : 'false'}
        >
            <button
                type="button"
                className="m2-correspondence-tree-widget__leaf-button"
                aria-pressed={selected}
                aria-label={`Address ${leaf.address72}${leaf.isActive ? ' (live)' : ''}`}
                onClick={() => onSelect(leaf.address72)}
            >
                <span className="m2-correspondence-tree-widget__leaf-address">#2 · {leaf.address72}</span>
                {leaf.axisCells.length > 0 && (
                    <span className="m2-correspondence-tree-widget__leaf-axes">
                        {leaf.axisCells.map(cell => (
                            <span
                                key={cell.axis}
                                className="m2-correspondence-tree-widget__leaf-axis-cell"
                                data-axis={cell.axis}
                                data-decoded={cell.decoded ? 'true' : 'false'}
                                data-coordinate={cell.coordinate ?? ''}
                                title={`${AXIS_CHIP_LABELS[cell.axis]}: ${cell.label ?? 'pending'}`}
                            >
                                {cell.label ?? '—'}
                            </span>
                        ))}
                    </span>
                )}
            </button>
        </li>
    );
}

function SonicOverlayLeafView({
    leaf,
    overlay,
    selected,
    onSelect
}: {
    readonly leaf: SonicOverlayLeaf;
    readonly overlay: M2CorrespondenceTreeSonicOverlay;
    readonly selected: boolean;
    readonly onSelect: (slot: number) => void;
}): React.ReactElement {
    return (
        <li
            className="m2-correspondence-tree-widget__leaf"
            data-tree-leaf
            data-leaf-kind={overlay}
            data-overlay-slot={leaf.slot}
            data-overlay-index={leaf.index}
            data-overlay-hidden={leaf.isHidden ? 'true' : 'false'}
            data-decoded={leaf.decoded ? 'true' : 'false'}
        >
            <button
                type="button"
                className="m2-correspondence-tree-widget__leaf-button"
                aria-pressed={selected}
                aria-label={`${overlay} overlay leaf ${leaf.index}${leaf.isHidden ? ' (Hidden +1)' : ''}`}
                onClick={() => onSelect(leaf.slot)}
            >
                <span className="m2-correspondence-tree-widget__leaf-primary" lang={overlay === 'asma' ? 'ar' : 'sa'}>
                    {leaf.primary}
                </span>
                <span className="m2-correspondence-tree-widget__leaf-secondary" data-overlay-secondary>
                    {leaf.secondary}
                </span>
                <span className="m2-correspondence-tree-widget__leaf-detail" data-overlay-detail>
                    {leaf.detail}
                </span>
                {leaf.isHidden && <span className="m2-correspondence-tree-widget__leaf-hidden-tag"> (Hidden +1)</span>}
            </button>
        </li>
    );
}

// ── Leaf builders (pure; read ONLY the injected decoder) ──────────────────────

function buildOverlayLeaves(
    decoder: M2TreeDecoder | null,
    overlay: 'mantra' | 'asma'
): readonly SonicOverlayLeaf[] {
    const cardinality = overlay === 'mantra' ? MANTRA_OVERLAY_LEAF_COUNT : ASMA_OVERLAY_LEAF_COUNT;
    const leaves: SonicOverlayLeaf[] = [];
    for (let slot = 0; slot < cardinality; slot += 1) {
        const projection = decoder ? safeDecode(decoder, slot, overlay) : null;
        leaves.push(overlay === 'mantra' ? mantraLeaf(slot, projection) : asmaLeaf(slot, projection));
    }
    return Object.freeze(leaves);
}

function mantraLeaf(slot: number, projection: M2TreeDecodeResult | null): SonicOverlayLeaf {
    const index = numberField(projection?.mantraIndex) ?? slot;
    const phoneme = stringField(projection?.phoneme) ?? stringField(projection?.glyph) ?? '—';
    const phase: MantraPhase = projection?.phase === 'malini' ? 'malini' : 'matrika';
    const frequencyHz = numberField(projection?.frequencyHz);
    return Object.freeze({
        slot,
        index,
        primary: phoneme,
        secondary: phase === 'matrika' ? 'Matrika · descent' : 'Malini · ascent',
        detail: frequencyHz !== null ? `${frequencyHz} Hz` : 'pending',
        isHidden: false,
        bandFraction: frequencyHz !== null ? mantraBandFraction(frequencyHz) : 0,
        decoded: projection !== null
    });
}

function asmaLeaf(slot: number, projection: M2TreeDecodeResult | null): SonicOverlayLeaf {
    const index = numberField(projection?.asmaIndex) ?? slot;
    const isHidden = index === ASMA_HIDDEN_OVERLAY_INDEX || projection?.group === 'Hidden';
    const name = stringField(projection?.name) ?? '—';
    const group: AsmaGroup = normalizeAsmaGroup(projection?.group, isHidden);
    const isInternal = projection?.isInternal === true;
    const isProjective = projection?.isProjective === true;
    const routing = isInternal ? '36-internal' : isProjective ? '64-projective' : 'unrouted';
    return Object.freeze({
        slot,
        index,
        primary: name,
        secondary: group,
        detail: routing,
        isHidden,
        bandFraction: 0,
        decoded: projection !== null
    });
}

// ── Normalisers (bounds + parity only; no decode arithmetic) ─────────────────

function safeDecode(
    decoder: M2TreeDecoder,
    slot: number,
    axis: M2TreeDecodeAxis
): M2TreeDecodeResult | null {
    try {
        const projection = decoder(slot, axis);
        if (!projection || typeof projection !== 'object') {
            return null;
        }
        return projection;
    } catch {
        return null;
    }
}

function leafLabel(projection: M2TreeDecodeResult, address72: number): string {
    return (
        stringField(projection.coordinate) ??
        stringField(projection.label) ??
        stringField(projection.name) ??
        stringField(projection.glyph) ??
        meaningIdLabel(projection.meaningId) ??
        `#2·${address72}`
    );
}

function meaningIdLabel(meaningId: string | number | undefined): string | null {
    if (typeof meaningId === 'string' && meaningId.length > 0) {
        return meaningId;
    }
    if (typeof meaningId === 'number' && Number.isFinite(meaningId)) {
        return String(meaningId);
    }
    return null;
}

function resolveSelectedPlanet(decoder: M2TreeDecoder | null, selectedSlot: number | null | undefined): number | null {
    if (!decoder || typeof selectedSlot !== 'number' || !Number.isFinite(selectedSlot)) {
        return null;
    }
    const address72 = clampAddress72(selectedSlot);
    // Prefer the decan-face decode (carries the ruling planet); fall back to Shem.
    for (const axis of ['decan-face', 'shem'] as const) {
        const projection = safeDecode(decoder, address72, axis);
        const planet =
            numberField(projection?.rulingPlanet) ??
            numberField(projection?.planetRuler) ??
            numberField(projection?.planetIndex);
        if (planet !== null) {
            return planet;
        }
    }
    return null;
}

function sortOverlayLeaves(
    leaves: readonly SonicOverlayLeaf[],
    overlay: M2CorrespondenceTreeSonicOverlay
): readonly SonicOverlayLeaf[] {
    if (overlay !== 'mantra') {
        // Asma keeps its natural Jalal/Kamal/Jamal → Hidden index order.
        return leaves;
    }
    // Mantra renders frequency-gradient sorted 144 → 432 Hz.
    return [...leaves].sort((a, b) => a.bandFraction - b.bandFraction || a.slot - b.slot);
}

function mantraBandFraction(frequencyHz: number): number {
    const span = MANTRA_OVERLAY_FREQ_MAX - MANTRA_OVERLAY_FREQ_MIN;
    const fraction = span > 0 ? (frequencyHz - MANTRA_OVERLAY_FREQ_MIN) / span : 0;
    return Math.min(1, Math.max(0, fraction));
}

function normalizeAxisFilter(value: readonly AxisName[] | undefined): readonly CorrespondenceAxis[] {
    if (!Array.isArray(value)) {
        return Object.freeze([] as CorrespondenceAxis[]);
    }
    const seen = new Set<CorrespondenceAxis>();
    for (const entry of value) {
        if (isCorrespondenceAxis(entry)) {
            seen.add(entry);
        }
    }
    // Canonical chip order so the filter is deterministic across re-renders.
    return Object.freeze(CORRESPONDENCE_AXES.filter(axis => seen.has(axis)));
}

function normalizeOverlay(value: M2CorrespondenceTreeSonicOverlay | undefined): M2CorrespondenceTreeSonicOverlay {
    return value === 'mantra' || value === 'asma' ? value : 'none';
}

function normalizeAsmaGroup(group: unknown, isHidden: boolean): AsmaGroup {
    if (isHidden) {
        return 'Hidden';
    }
    return group === 'Jalal' || group === 'Kamal' || group === 'Jamal' || group === 'Hidden' ? group : 'Jamal';
}

function isCorrespondenceAxis(value: unknown): value is CorrespondenceAxis {
    return typeof value === 'string' && (CORRESPONDENCE_AXES as readonly string[]).includes(value);
}

function resolveActiveAddress(activeAddress72: number | null | undefined, tick: number | null | undefined): number {
    if (typeof activeAddress72 === 'number' && Number.isFinite(activeAddress72)) {
        return clampAddress72(activeAddress72);
    }
    if (typeof tick === 'number' && Number.isFinite(tick)) {
        return clampAddress72(tick);
    }
    return 0;
}

function clampAddress72(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % CORRESPONDENCE_TREE_LEAF_COUNT) + CORRESPONDENCE_TREE_LEAF_COUNT) % CORRESPONDENCE_TREE_LEAF_COUNT;
}

function stringField(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function numberField(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export default CorrespondenceTreeWidget;
