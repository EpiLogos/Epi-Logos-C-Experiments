// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2-3 (Parashakti decan-face axis — the 36 decans × 2 faces =
//                   72 vibrational addresses descending toward the M3 codon lattice)
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser card)
//   Position (#3):  23.3 — Layer B, sacred-sonic card #1 + alchemical-tattvic surface
//   Actualises:     the decan-face reading for the live `address72` — element / sign
//                   / decan / face / ruling-planet / meaning-id — read ONLY through
//                   `kernelBridge.m2.decodeAxisAt(address72, "decan-face")`. Beneath
//                   the element row it hosts the alchemical→tattvic surface (six
//                   ALCHEMICAL_TO_TATTVIC cells per 19.10c) with prima/ultima Möbius
//                   markers on Aether (index 0) and Salt (index 5). A ruling-planet
//                   glyph and an optional Kerykeion live-degree readout (from
//                   `parashakti_meaning.routing_trace.active_decan`) ride the header.
//   Public surface: DecanFaceCard, buildDecanFaceCardModel, the
//                   M2DecanFaceProjection / M2DecanFaceCardBridge typed contract,
//                   and the DecanFaceCardModel / AlchemicalTattvicCell view model.
//   Does NOT own:   the decan law, the 9:8 epogdoon descent, or the
//                   ALCHEMICAL_TO_TATTVIC map itself. The decan rows live kernel-side
//                   (m2.h decan tables, surfaced through `decodeAxisAt`) and the
//                   alchemical→tattvic throughline lives in m0.c (`ALCHEMICAL_TO_TATTVIC[6]`,
//                   surfaced through `kernelBridge.m0.alchemicalToTattvic()`). This card
//                   NEVER recomputes either; it folds the published projection into UI.
//   Cross-links:    Layer A (MefGrid72Component, 23.2), Layer C (CymaticChladniSurface,
//                   23.4), ShadowDecanSurface (108-cell reveal, 23.18), 19.10c
//                   (ALCHEMICAL_TO_TATTVIC), ShemPairCard / MaqamModeCard (sibling cards).
//   Contract:       kernelBridge.m2.decodeAxisAt(address72, "decan-face") →
//                   { address72, elementName, signName, decanNumber, face, rulingPlanet,
//                     rulingPlanetName, meaningId, coordinate }
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../../common/meaning-packet';
import type { M2KleinFlipPhase } from '../../../common/composition';
import { ProvenanceBadge, type ProvenanceReadinessVariant } from '../ProvenanceBadge';

// ── Invariants (declared; never recomputed) ─────────────────────────────────

/** The Parashakti 72-Invariant — every decan-face address resolves here. */
export const DECAN_FACE_ADDRESS_COUNT = 72;

/** The six alchemical elements of the prima/ultima Möbius throughline (19.10c). */
export const ALCHEMICAL_TATTVIC_CELL_COUNT = 6;

/** Aether opens the throughline — the prima materia Möbius marker. */
export const ALCHEMICAL_PRIMA_INDEX = 0;

/** Salt closes the throughline — the ultima materia Möbius marker. */
export const ALCHEMICAL_ULTIMA_INDEX = 5;

/** Provenance source-field for the decan-face payload (routes to the S2 authority). */
export const M2_DECAN_FACE_PROVENANCE_FIELD = 'decanFaceFrame';

/** Provenance source-field for the alchemical-tattvic surface row (19.10c). */
export const M2_ALCHEMICAL_TATTVIC_PROVENANCE_FIELD = 'elementalFrame.alchemicalTattvicRow';

/** The single decan authority this card reads through — never a local computation. */
export const DECAN_FACE_SOURCE = 'kernelBridge.m2.decodeAxisAt(address72, "decan-face")' as const;

/** The single alchemical-tattvic authority — never a local computation. */
export const ALCHEMICAL_TATTVIC_SOURCE = 'kernelBridge.m0.alchemicalToTattvic()' as const;

/** Ruling-planet glyphs, canonical mod-10 order (Sun..Pluto). */
const PLANET_GLYPHS: readonly string[] = Object.freeze(['☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇']);

/** Element hue map mirroring the M2 palette (tattvic / mahabhuta colours). */
const ELEMENT_HUES: Readonly<Record<string, string>> = Object.freeze({
    AGNI: '#c5564b',
    PRITHVI: '#8a7355',
    VAYU: '#6ec1c8',
    APAS: '#5fa9b8',
    AKASHA: '#7d4f9e'
});

/**
 * Pending fallback for the prima/ultima Möbius throughline. Rendered only when the
 * bridge has not yet surfaced `alchemicalToTattvic()`; it carries the canonical
 * alchemical labels so the surface stays legible while the kernel datum is pending.
 */
const ALCHEMICAL_TATTVIC_FALLBACK: readonly AlchemicalTattvicCell[] = Object.freeze([
    Object.freeze({ index: 0, alchemical: 'Aether', tattvic: 'Akasha', isPrima: true, isUltima: false, pending: true }),
    Object.freeze({ index: 1, alchemical: 'Earth', tattvic: 'Prithvi', isPrima: false, isUltima: false, pending: true }),
    Object.freeze({ index: 2, alchemical: 'Water', tattvic: 'Apas', isPrima: false, isUltima: false, pending: true }),
    Object.freeze({ index: 3, alchemical: 'Air', tattvic: 'Vayu', isPrima: false, isUltima: false, pending: true }),
    Object.freeze({ index: 4, alchemical: 'Fire', tattvic: 'Agni', isPrima: false, isUltima: false, pending: true }),
    Object.freeze({ index: 5, alchemical: 'Salt', tattvic: 'Prithvi', isPrima: false, isUltima: true, pending: true })
]);

// ── Bridge contract (the ONLY typed projection this card consumes) ────────────

/** The typed projection returned by `kernelBridge.m2.decodeAxisAt(address72, "decan-face")`. */
export interface M2DecanFaceProjection {
    readonly address72: number;
    readonly coordinate: string;
    readonly elementName: string;
    readonly signName: string;
    readonly decanNumber: number;
    readonly face: 0 | 1;
    readonly faceName: 'light' | 'shadow';
    readonly rulingPlanet: number;
    readonly rulingPlanetName: string;
    readonly meaningId: string;
}

/** One alchemical→tattvic cell of the prima/ultima Möbius surface (19.10c). */
export interface AlchemicalTattvicCell {
    readonly index: number;
    readonly alchemical: string;
    readonly tattvic: string;
    readonly isPrima: boolean;
    readonly isUltima: boolean;
    readonly pending: boolean;
}

/** A function decoding a 72-address along the decan-face axis. */
export type M2DecanFaceDecoder = (address72: number, axis: 'decan-face') => M2DecanFaceProjection;

/** A function surfacing the m0 alchemical→tattvic throughline. */
export type M2AlchemicalToTattvic = () => readonly AlchemicalTattvicCell[];

/** The slice of the kernel-bridge this card depends on. */
export interface M2DecanFaceCardBridge {
    readonly m2: {
        readonly decodeAxisAt: M2DecanFaceDecoder;
    };
    readonly m0?: {
        readonly alchemicalToTattvic?: M2AlchemicalToTattvic;
    };
}

// ── View model ───────────────────────────────────────────────────────────────

export interface DecanFaceCardModel {
    readonly address72: number;
    readonly projection: M2DecanFaceProjection | null;
    readonly tattvicCells: readonly AlchemicalTattvicCell[];
    readonly tattvicPending: boolean;
    readonly elementHue: string;
    readonly planetGlyph: string;
    readonly kleinFlipPhase: M2KleinFlipPhase;
    /** Effective face after any Klein-flip swap of light/shadow primacy. */
    readonly effectiveFace: 0 | 1 | null;
    readonly activeDecanDegree: number | null;
    readonly bridgeReady: boolean;
}

export interface DecanFaceCardProps {
    /** The live vibrational address descending into the decan-face axis. */
    readonly address72: number;
    /** The kernel-bridge slice. When absent the card renders a bridge-down state. */
    readonly kernelBridge?: M2DecanFaceCardBridge | null;
    /** Kerykeion live decan degree from `parashakti_meaning.routing_trace.active_decan`. */
    readonly activeDecanDegree?: number | null;
    /** Klein-flip phase swapping light/shadow face primacy. */
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
    /** Meaning packet for provenance badging. */
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    /** Readiness for provenance badge tone. */
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    readonly className?: string;
}

// ── Model builder (pure; reads ONLY the injected bridge projection) ──────────

export function buildDecanFaceCardModel(input: {
    readonly address72: number;
    readonly kernelBridge?: M2DecanFaceCardBridge | null;
    readonly activeDecanDegree?: number | null;
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
}): DecanFaceCardModel {
    const address72 = clampAddress72(input.address72);
    const kleinFlipPhase = normalizeKleinPhase(input.kleinFlipPhase);
    const inverted = kleinFlipPhase === 'inverted';
    const decoder = input.kernelBridge?.m2?.decodeAxisAt ?? null;
    const projection = decoder ? safeDecode(decoder, address72) : null;

    const tattvicSource = input.kernelBridge?.m0?.alchemicalToTattvic;
    const tattvicCells = safeTattvic(tattvicSource) ?? ALCHEMICAL_TATTVIC_FALLBACK;
    const tattvicPending = tattvicCells === ALCHEMICAL_TATTVIC_FALLBACK;

    const effectiveFace: 0 | 1 | null = projection ? (inverted ? flipFace(projection.face) : projection.face) : null;
    const elementHue = projection ? ELEMENT_HUES[projection.elementName] ?? '#9aa6b2' : '#5a6472';
    const planetGlyph = projection ? PLANET_GLYPHS[clampPlanet(projection.rulingPlanet)] : '·';

    return Object.freeze({
        address72,
        projection,
        tattvicCells: Object.freeze(tattvicCells.map(cell => Object.freeze({ ...cell }))),
        tattvicPending,
        elementHue,
        planetGlyph,
        kleinFlipPhase,
        effectiveFace,
        activeDecanDegree: normalizeDegree(input.activeDecanDegree),
        bridgeReady: projection !== null
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export function DecanFaceCard(props: DecanFaceCardProps): React.ReactElement {
    const model = React.useMemo(
        () =>
            buildDecanFaceCardModel({
                address72: props.address72,
                kernelBridge: props.kernelBridge ?? null,
                activeDecanDegree: props.activeDecanDegree ?? null,
                kleinFlipPhase: props.kleinFlipPhase ?? null
            }),
        [props.address72, props.kernelBridge, props.activeDecanDegree, props.kleinFlipPhase]
    );

    const className = ['m2-decan-face-card', 'm2-sacred-sonic-card', props.className].filter(Boolean).join(' ');
    const p = model.projection;

    return (
        <article
            className={className}
            data-decan-face-card
            data-sacred-sonic-card="decan-face"
            data-address72={model.address72}
            data-card-state={model.bridgeReady ? 'ready' : 'bridge-unavailable'}
            data-effective-face={model.effectiveFace ?? ''}
            data-klein-phase={model.kleinFlipPhase}
        >
            <header className="m2-decan-face-card__header">
                <h4>Decan face</h4>
                <span className="m2-decan-face-card__address">#2-3 · {model.address72}</span>
                <span className="m2-decan-face-card__planet-glyph" aria-hidden="true">
                    {model.planetGlyph}
                </span>
                {model.activeDecanDegree !== null && (
                    <span className="m2-decan-face-card__degree" data-active-decan-degree={model.activeDecanDegree}>
                        {model.activeDecanDegree.toFixed(2)}°
                    </span>
                )}
                {props.packet && (
                    <ProvenanceBadge
                        compact
                        field={M2_DECAN_FACE_PROVENANCE_FIELD}
                        readiness={props.readiness ?? (model.bridgeReady ? 'ready_public_current' : 'bridge_unavailable')}
                        provenance={props.packet.meaningPacketProvenanceFor(M2_DECAN_FACE_PROVENANCE_FIELD)}
                    />
                )}
            </header>

            {p ? (
                <dl className="m2-decan-face-card__body">
                    <dt>Element</dt>
                    <dd data-element-name={p.elementName}>
                        <span className="m2-decan-face-card__element-swatch" style={{ background: model.elementHue }} aria-hidden="true" />
                        {p.elementName}
                    </dd>
                    <dt>Sign</dt>
                    <dd>{p.signName}</dd>
                    <dt>Decan</dt>
                    <dd>decan {p.decanNumber}</dd>
                    <dt>Face</dt>
                    <dd data-face={model.effectiveFace ?? p.face}>
                        {(model.effectiveFace ?? p.face) === 0 ? 'light' : 'shadow'}
                        {model.kleinFlipPhase === 'inverted' && <span className="m2-decan-face-card__flip-tag"> (Klein-flipped)</span>}
                    </dd>
                    <dt>Ruling planet</dt>
                    <dd>
                        {model.planetGlyph} {p.rulingPlanetName}
                    </dd>
                    <dt>Meaning id</dt>
                    <dd>{p.meaningId}</dd>
                </dl>
            ) : (
                <p className="mext-widget-empty" data-pending-field={DECAN_FACE_SOURCE}>
                    The decan-face reading is waiting for {DECAN_FACE_SOURCE}.
                </p>
            )}

            <AlchemicalTattvicSurface
                cells={model.tattvicCells}
                pending={model.tattvicPending}
                packet={props.packet}
                readiness={props.readiness}
            />
        </article>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function AlchemicalTattvicSurface({
    cells,
    pending,
    packet,
    readiness
}: {
    readonly cells: readonly AlchemicalTattvicCell[];
    readonly pending: boolean;
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
}): React.ReactElement {
    return (
        <section
            className="m2-decan-face-card__alchemical-tattvic"
            aria-label="Alchemical to tattvic throughline (prima/ultima Möbius)"
            data-alchemical-tattvic-surface
            data-tattvic-state={pending ? 'pending' : 'ready'}
        >
            <header className="m2-decan-face-card__alchemical-tattvic-header">
                <span>alchemical → tattvic</span>
                {packet && (
                    <ProvenanceBadge
                        compact
                        field={M2_ALCHEMICAL_TATTVIC_PROVENANCE_FIELD}
                        readiness={readiness ?? (pending ? 's2_graph_blocked' : 'ready_public_current')}
                        provenance={packet.meaningPacketProvenanceFor(M2_ALCHEMICAL_TATTVIC_PROVENANCE_FIELD)}
                    />
                )}
            </header>
            <ol className="m2-decan-face-card__tattvic-row">
                {cells.map(cell => (
                    <li
                        key={cell.index}
                        className="m2-decan-face-card__tattvic-cell"
                        data-tattvic-cell
                        data-index={cell.index}
                        data-prima={cell.isPrima ? 'true' : 'false'}
                        data-ultima={cell.isUltima ? 'true' : 'false'}
                        data-pending={cell.pending ? 'true' : 'false'}
                    >
                        {cell.isPrima && (
                            <span className="m2-decan-face-card__mobius-marker" data-mobius="prima" aria-label="prima materia">
                                ↻
                            </span>
                        )}
                        <span className="m2-decan-face-card__alchemical">{cell.alchemical}</span>
                        <span className="m2-decan-face-card__tattvic-arrow" aria-hidden="true">→</span>
                        <span className="m2-decan-face-card__tattvic">{cell.tattvic}</span>
                        {cell.isUltima && (
                            <span className="m2-decan-face-card__mobius-marker" data-mobius="ultima" aria-label="ultima materia">
                                ↺
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </section>
    );
}

// ── Normalisers (bounds + parity only; no decan arithmetic) ──────────────────

function safeDecode(decoder: M2DecanFaceDecoder, address72: number): M2DecanFaceProjection | null {
    try {
        const projection = decoder(address72, 'decan-face');
        if (
            !projection ||
            typeof projection.address72 !== 'number' ||
            typeof projection.elementName !== 'string' ||
            typeof projection.rulingPlanet !== 'number'
        ) {
            return null;
        }
        return projection;
    } catch {
        return null;
    }
}

function safeTattvic(source: M2AlchemicalToTattvic | undefined): readonly AlchemicalTattvicCell[] | null {
    if (!source) {
        return null;
    }
    try {
        const cells = source();
        if (!Array.isArray(cells) || cells.length !== ALCHEMICAL_TATTVIC_CELL_COUNT) {
            return null;
        }
        return cells;
    } catch {
        return null;
    }
}

function normalizeKleinPhase(phase: M2KleinFlipPhase | null | undefined): M2KleinFlipPhase {
    return phase === 'inverted' || phase === 'transitioning' ? phase : 'primary';
}

function flipFace(face: 0 | 1): 0 | 1 {
    return face === 0 ? 1 : 0;
}

function clampAddress72(value: number): number {
    const rounded = Math.trunc(Number.isFinite(value) ? value : 0);
    return ((rounded % DECAN_FACE_ADDRESS_COUNT) + DECAN_FACE_ADDRESS_COUNT) % DECAN_FACE_ADDRESS_COUNT;
}

function clampPlanet(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % PLANET_GLYPHS.length) + PLANET_GLYPHS.length) % PLANET_GLYPHS.length;
}

function normalizeDegree(value: number | null | undefined): number | null {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return null;
    }
    return ((value % 360) + 360) % 360;
}

export default DecanFaceCard;
