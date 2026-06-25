// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2 sacred-sonic mantra overlay (the 100 Matrika/Malini phonemes —
//                   50 descent + 50 ascent — sounded across the vibrational landscape)
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser card)
//   Position (#3):  23.3 — Layer B, sacred-sonic card #4
//   Actualises:     the mantra reading for the live `address72`, read ONLY through
//                   `kernelBridge.m2.decodeAxisAt(address72, "mantra")` → Sanskrit
//                   phoneme glyph + frequency band (within 144→432 Hz, base 256 as the
//                   visual anchor) + Matrika (descent, idx 0–49) / Malini (ascent, idx
//                   50–99) phase + element badge. A Klein-flip swaps the Matrika/Malini
//                   phase indicator (descent↔ascent).
//   Public surface: MantraCard, buildMantraCardModel, the M2MantraProjection /
//                   M2MantraCardBridge typed contract, the MantraCardModel view model,
//                   and the band invariants (MANTRA_FREQ_MIN/MAX/BASE, MANTRA_COUNT).
//   Does NOT own:   the mantra law, the Matrika/Malini phoneme order, or the frequency
//                   mapping. The 100-entry overlay lives kernel-side and is surfaced
//                   through `decodeAxisAt`. This card NEVER recomputes it; it folds the
//                   published projection into a band readout (overlay-not-axis per DR-M2-2).
//   Cross-links:    AudioBusVisualiser (routing_trace.mantra_index), MaqamModeCard /
//                   AsmaCard (sacred-sonic siblings), correspondence tree Mantra(100)
//                   sonic-overlay tab (23.5).
//   Contract:       kernelBridge.m2.decodeAxisAt(address72, "mantra") →
//                   { address72, mantraIndex, phoneme, frequencyHz, phase, element }
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../../common/meaning-packet';
import type { M2KleinFlipPhase } from '../../../common/composition';
import { ProvenanceBadge, type ProvenanceReadinessVariant } from '../ProvenanceBadge';

// ── Invariants (declared; never recomputed) ─────────────────────────────────

/** The Parashakti 72-Invariant — every mantra reading keys off a vibrational address. */
export const MANTRA_ADDRESS_COUNT = 72;

/** The 100 Matrika/Malini phonemes (50 descent + 50 ascent). */
export const MANTRA_COUNT = 100;

/** Matrika descent occupies indices 0..49. */
export const MANTRA_MATRIKA_MAX_INDEX = 49;

/** Lower bound of the mantra frequency band (Hz). */
export const MANTRA_FREQ_MIN = 144;

/** Upper bound of the mantra frequency band (Hz). */
export const MANTRA_FREQ_MAX = 432;

/** Visual anchor frequency for the band readout (Hz). */
export const MANTRA_FREQ_BASE = 256;

/** Provenance source-field for the mantra payload (routes to the S2 authority). */
export const M2_MANTRA_PROVENANCE_FIELD = 'sacredSonicFrame.mantra';

/** The single mantra authority this card reads through — never a local computation. */
export const MANTRA_SOURCE = 'kernelBridge.m2.decodeAxisAt(address72, "mantra")' as const;

/** Element hue map mirroring the M2 palette. */
const ELEMENT_HUES: Readonly<Record<string, string>> = Object.freeze({
    AGNI: '#c5564b',
    PRITHVI: '#8a7355',
    VAYU: '#6ec1c8',
    APAS: '#5fa9b8',
    AKASHA: '#7d4f9e'
});

export type MantraPhase = 'matrika' | 'malini';

// ── Bridge contract (the ONLY typed projection this card consumes) ────────────

/** The typed projection returned by `kernelBridge.m2.decodeAxisAt(address72, "mantra")`. */
export interface M2MantraProjection {
    readonly address72: number;
    readonly mantraIndex: number;
    readonly phoneme: string;
    readonly frequencyHz: number;
    readonly phase: MantraPhase;
    readonly element: string;
}

/** A function decoding a 72-address along the mantra overlay. */
export type M2MantraDecoder = (address72: number, axis: 'mantra') => M2MantraProjection;

/** The slice of the kernel-bridge this card depends on. */
export interface M2MantraCardBridge {
    readonly m2: {
        readonly decodeAxisAt: M2MantraDecoder;
    };
}

// ── View model ───────────────────────────────────────────────────────────────

export interface MantraCardModel {
    readonly address72: number;
    readonly projection: M2MantraProjection | null;
    /** Band fraction (0..1) of `frequencyHz` within [MANTRA_FREQ_MIN, MANTRA_FREQ_MAX]. */
    readonly bandFraction: number;
    /** Band fraction (0..1) of the MANTRA_FREQ_BASE anchor, for the marker. */
    readonly baseFraction: number;
    readonly elementHue: string;
    readonly kleinFlipPhase: M2KleinFlipPhase;
    /** Effective phase after any Klein-flip descent↔ascent swap. */
    readonly effectivePhase: MantraPhase | null;
    readonly bridgeReady: boolean;
}

export interface MantraCardProps {
    /** The live vibrational address keying the mantra overlay. */
    readonly address72: number;
    /** The kernel-bridge slice. When absent the card renders a bridge-down state. */
    readonly kernelBridge?: M2MantraCardBridge | null;
    /** Klein-flip phase swapping Matrika/Malini (descent↔ascent). */
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
    /** Meaning packet for provenance badging. */
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    /** Readiness for provenance badge tone. */
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    readonly className?: string;
}

// ── Model builder (pure; reads ONLY the injected bridge projection) ──────────

export function buildMantraCardModel(input: {
    readonly address72: number;
    readonly kernelBridge?: M2MantraCardBridge | null;
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
}): MantraCardModel {
    const address72 = clampAddress72(input.address72);
    const kleinFlipPhase = normalizeKleinPhase(input.kleinFlipPhase);
    const swapped = kleinFlipPhase === 'inverted';
    const decoder = input.kernelBridge?.m2?.decodeAxisAt ?? null;
    const projection = decoder ? safeDecode(decoder, address72) : null;

    const bandFraction = projection ? bandFractionFor(projection.frequencyHz) : 0;
    const baseFraction = bandFractionFor(MANTRA_FREQ_BASE);
    const elementHue = projection ? ELEMENT_HUES[projection.element] ?? '#9aa6b2' : '#5a6472';
    const effectivePhase: MantraPhase | null = projection
        ? swapped
            ? flipPhase(projection.phase)
            : projection.phase
        : null;

    return Object.freeze({
        address72,
        projection,
        bandFraction,
        baseFraction,
        elementHue,
        kleinFlipPhase,
        effectivePhase,
        bridgeReady: projection !== null
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export function MantraCard(props: MantraCardProps): React.ReactElement {
    const model = React.useMemo(
        () =>
            buildMantraCardModel({
                address72: props.address72,
                kernelBridge: props.kernelBridge ?? null,
                kleinFlipPhase: props.kleinFlipPhase ?? null
            }),
        [props.address72, props.kernelBridge, props.kleinFlipPhase]
    );

    const className = ['m2-mantra-card', 'm2-sacred-sonic-card', props.className].filter(Boolean).join(' ');
    const p = model.projection;

    return (
        <article
            className={className}
            data-mantra-card
            data-sacred-sonic-card="mantra"
            data-address72={model.address72}
            data-card-state={model.bridgeReady ? 'ready' : 'bridge-unavailable'}
            data-effective-phase={model.effectivePhase ?? ''}
            data-klein-phase={model.kleinFlipPhase}
        >
            <header className="m2-mantra-card__header">
                <h4>Mantra</h4>
                <span className="m2-mantra-card__address">#2 · {model.address72}</span>
                {props.packet && (
                    <ProvenanceBadge
                        compact
                        field={M2_MANTRA_PROVENANCE_FIELD}
                        readiness={props.readiness ?? (model.bridgeReady ? 'ready_public_current' : 'bridge_unavailable')}
                        provenance={props.packet.meaningPacketProvenanceFor(M2_MANTRA_PROVENANCE_FIELD)}
                    />
                )}
            </header>

            {p ? (
                <>
                    <div className="m2-mantra-card__phoneme-row">
                        <span className="m2-mantra-card__phoneme" lang="sa" aria-label={`Sanskrit phoneme for mantra ${p.mantraIndex}`}>
                            {p.phoneme}
                        </span>
                        <span
                            className="m2-mantra-card__phase"
                            data-mantra-phase={model.effectivePhase ?? p.phase}
                            data-index={p.mantraIndex}
                        >
                            {(model.effectivePhase ?? p.phase) === 'matrika' ? 'Matrika · descent' : 'Malini · ascent'}
                            {model.kleinFlipPhase === 'inverted' && <span className="m2-mantra-card__flip-tag"> (Klein-flipped)</span>}
                        </span>
                        <span
                            className="m2-mantra-card__element"
                            data-element={p.element}
                            style={{ borderColor: model.elementHue }}
                        >
                            {p.element}
                        </span>
                    </div>
                    <FrequencyBand
                        frequencyHz={p.frequencyHz}
                        bandFraction={model.bandFraction}
                        baseFraction={model.baseFraction}
                    />
                </>
            ) : (
                <p className="mext-widget-empty" data-pending-field={MANTRA_SOURCE}>
                    The mantra reading is waiting for {MANTRA_SOURCE}.
                </p>
            )}
        </article>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function FrequencyBand({
    frequencyHz,
    bandFraction,
    baseFraction
}: {
    readonly frequencyHz: number;
    readonly bandFraction: number;
    readonly baseFraction: number;
}): React.ReactElement {
    return (
        <figure
            className="m2-mantra-card__frequency-band"
            aria-label={`Frequency ${frequencyHz} Hz within the ${MANTRA_FREQ_MIN}–${MANTRA_FREQ_MAX} Hz mantra band`}
            data-frequency-band
            data-frequency-hz={frequencyHz}
        >
            <div className="m2-mantra-card__band-track" data-band-min={MANTRA_FREQ_MIN} data-band-max={MANTRA_FREQ_MAX}>
                <span
                    className="m2-mantra-card__band-anchor"
                    data-band-anchor={MANTRA_FREQ_BASE}
                    style={{ left: `${(baseFraction * 100).toFixed(3)}%` }}
                    aria-hidden="true"
                />
                <span
                    className="m2-mantra-card__band-marker"
                    data-band-fraction={bandFraction.toFixed(4)}
                    style={{ left: `${(bandFraction * 100).toFixed(3)}%` }}
                    aria-hidden="true"
                />
            </div>
            <figcaption className="m2-mantra-card__band-caption">
                <span>{MANTRA_FREQ_MIN} Hz</span>
                <span>
                    {frequencyHz} Hz <em>({MANTRA_FREQ_BASE} anchor)</em>
                </span>
                <span>{MANTRA_FREQ_MAX} Hz</span>
            </figcaption>
        </figure>
    );
}

// ── Normalisers (bounds + parity only; no mantra arithmetic) ─────────────────

function safeDecode(decoder: M2MantraDecoder, address72: number): M2MantraProjection | null {
    try {
        const projection = decoder(address72, 'mantra');
        if (
            !projection ||
            typeof projection.address72 !== 'number' ||
            typeof projection.phoneme !== 'string' ||
            typeof projection.frequencyHz !== 'number'
        ) {
            return null;
        }
        return Object.freeze({
            ...projection,
            phase: projection.phase === 'malini' ? 'malini' : 'matrika'
        });
    } catch {
        return null;
    }
}

function bandFractionFor(frequencyHz: number): number {
    if (!Number.isFinite(frequencyHz)) {
        return 0;
    }
    const span = MANTRA_FREQ_MAX - MANTRA_FREQ_MIN;
    const fraction = span > 0 ? (frequencyHz - MANTRA_FREQ_MIN) / span : 0;
    return Math.min(1, Math.max(0, fraction));
}

function flipPhase(phase: MantraPhase): MantraPhase {
    return phase === 'matrika' ? 'malini' : 'matrika';
}

function normalizeKleinPhase(phase: M2KleinFlipPhase | null | undefined): M2KleinFlipPhase {
    return phase === 'inverted' || phase === 'transitioning' ? phase : 'primary';
}

function clampAddress72(value: number): number {
    const rounded = Math.trunc(Number.isFinite(value) ? value : 0);
    return ((rounded % MANTRA_ADDRESS_COUNT) + MANTRA_ADDRESS_COUNT) % MANTRA_ADDRESS_COUNT;
}

export default MantraCard;
