// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2 sacred-sonic maqam axis (the Arabic maqamat — 10 families ×
//                   modes-in-family — keyed across the 72 vibrational addresses)
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser card)
//   Position (#3):  23.3 — Layer B, sacred-sonic card #3
//   Actualises:     the maqam reading for the live `address72`, read ONLY through
//                   `kernelBridge.m2.decodeAxisAt(address72, "maqam")` → family (0–9)
//                   + mode-in-family + a 7-interval pattern rendered as 24 quarter-tone
//                   ticks across a 24-position octave bar + planet-ruler glyph. A
//                   Klein-flip plays the tritone-mirror (Bayati↔Hijaz, Rast↔Saba — the
//                   major/minor enharmonic flip) reported by the projection.
//   Public surface: MaqamModeCard, buildMaqamModeCardModel, the M2MaqamProjection /
//                   M2MaqamModeCardBridge typed contract, the MaqamModeCardModel /
//                   QuarterToneTick view model, and OCTAVE_QUARTER_TONE_COUNT.
//   Does NOT own:   the maqam law, the quarter-tone microtonal system, or the
//                   tritone-mirror pairing. The families, interval patterns, and
//                   enharmonic mirror live kernel-side and are surfaced through
//                   `decodeAxisAt`. This card NEVER recomputes them; it folds the
//                   published projection into a 24-tick octave bar.
//   Cross-links:    DecanFaceCard / ShemPairCard / MantraCard (sacred-sonic siblings),
//                   correspondence tree maqam axis chip (23.5), 23.16 (music-tech
//                   MPE / MTS-ESP bridge — deferred; visual interval glyph only here).
//   Contract:       kernelBridge.m2.decodeAxisAt(address72, "maqam") →
//                   { address72, family, familyName, modeInFamily, intervalPattern,
//                     rulingPlanet, tritoneMirrorName }
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../../common/meaning-packet';
import type { M2KleinFlipPhase } from '../../../common/composition';
import { ProvenanceBadge, type ProvenanceReadinessVariant } from '../ProvenanceBadge';

// ── Invariants (declared; never recomputed) ─────────────────────────────────

/** The Parashakti 72-Invariant — every maqam address resolves here. */
export const MAQAM_ADDRESS_COUNT = 72;

/** The ten maqam families (canonical 0–9). */
export const MAQAM_FAMILY_COUNT = 10;

/** Seven scale-degree intervals per maqam (the ajnas-chain pattern). */
export const MAQAM_INTERVAL_COUNT = 7;

/** Twenty-four quarter-tone positions per octave (the Arabic microtonal grid). */
export const OCTAVE_QUARTER_TONE_COUNT = 24;

/** Provenance source-field for the maqam payload (routes to the S2 authority). */
export const M2_MAQAM_PROVENANCE_FIELD = 'sacredSonicFrame.maqamMode';

/** The single maqam authority this card reads through — never a local computation. */
export const MAQAM_SOURCE = 'kernelBridge.m2.decodeAxisAt(address72, "maqam")' as const;

/** Ruling-planet glyphs, canonical mod-10 order (Sun..Pluto). */
const PLANET_GLYPHS: readonly string[] = Object.freeze(['☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇']);

// ── Bridge contract (the ONLY typed projection this card consumes) ────────────

/** The typed projection returned by `kernelBridge.m2.decodeAxisAt(address72, "maqam")`. */
export interface M2MaqamProjection {
    readonly address72: number;
    readonly family: number;
    readonly familyName: string;
    readonly modeInFamily: number;
    /** Cumulative quarter-tone offsets (0..24) for the seven scale degrees. */
    readonly intervalPattern: readonly number[];
    readonly rulingPlanet: number;
    /** The tritone-mirror maqam played on Klein-flip (e.g. Bayati↔Hijaz). */
    readonly tritoneMirrorName: string;
}

/** A function decoding a 72-address along the maqam axis. */
export type M2MaqamDecoder = (address72: number, axis: 'maqam') => M2MaqamProjection;

/** The slice of the kernel-bridge this card depends on. */
export interface M2MaqamModeCardBridge {
    readonly m2: {
        readonly decodeAxisAt: M2MaqamDecoder;
    };
}

// ── View model ───────────────────────────────────────────────────────────────

/** One position on the 24-quarter-tone octave bar. */
export interface QuarterToneTick {
    readonly position: number;
    /** True where a scale degree lands on this quarter-tone. */
    readonly isDegree: boolean;
    /** True for whole-tone (even) gridlines, for visual rhythm. */
    readonly isWholeTone: boolean;
}

export interface MaqamModeCardModel {
    readonly address72: number;
    readonly projection: M2MaqamProjection | null;
    readonly ticks: readonly QuarterToneTick[];
    readonly planetGlyph: string;
    readonly kleinFlipPhase: M2KleinFlipPhase;
    /** True when the Klein-flip is sounding the tritone-mirror. */
    readonly mirrorPlaying: boolean;
    readonly bridgeReady: boolean;
}

export interface MaqamModeCardProps {
    /** The live vibrational address descending into the maqam axis. */
    readonly address72: number;
    /** The kernel-bridge slice. When absent the card renders a bridge-down state. */
    readonly kernelBridge?: M2MaqamModeCardBridge | null;
    /** Klein-flip phase playing the tritone-mirror. */
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
    /** Meaning packet for provenance badging. */
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    /** Readiness for provenance badge tone. */
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    readonly className?: string;
}

// ── Model builder (pure; reads ONLY the injected bridge projection) ──────────

export function buildMaqamModeCardModel(input: {
    readonly address72: number;
    readonly kernelBridge?: M2MaqamModeCardBridge | null;
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
}): MaqamModeCardModel {
    const address72 = clampAddress72(input.address72);
    const kleinFlipPhase = normalizeKleinPhase(input.kleinFlipPhase);
    const mirrorPlaying = kleinFlipPhase === 'inverted';
    const decoder = input.kernelBridge?.m2?.decodeAxisAt ?? null;
    const projection = decoder ? safeDecode(decoder, address72) : null;

    const degreePositions = projection ? degreeSet(projection.intervalPattern) : new Set<number>();
    const ticks = Object.freeze(
        Array.from({ length: OCTAVE_QUARTER_TONE_COUNT }, (_unused, position) =>
            Object.freeze({
                position,
                isDegree: degreePositions.has(position),
                isWholeTone: position % 2 === 0
            })
        )
    );
    const planetGlyph = projection ? PLANET_GLYPHS[clampPlanet(projection.rulingPlanet)] : '·';

    return Object.freeze({
        address72,
        projection,
        ticks,
        planetGlyph,
        kleinFlipPhase,
        mirrorPlaying,
        bridgeReady: projection !== null
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export function MaqamModeCard(props: MaqamModeCardProps): React.ReactElement {
    const model = React.useMemo(
        () =>
            buildMaqamModeCardModel({
                address72: props.address72,
                kernelBridge: props.kernelBridge ?? null,
                kleinFlipPhase: props.kleinFlipPhase ?? null
            }),
        [props.address72, props.kernelBridge, props.kleinFlipPhase]
    );

    const className = ['m2-maqam-mode-card', 'm2-sacred-sonic-card', props.className].filter(Boolean).join(' ');
    const p = model.projection;

    return (
        <article
            className={className}
            data-maqam-mode-card
            data-sacred-sonic-card="maqam"
            data-address72={model.address72}
            data-card-state={model.bridgeReady ? 'ready' : 'bridge-unavailable'}
            data-mirror-playing={model.mirrorPlaying ? 'true' : 'false'}
            data-klein-phase={model.kleinFlipPhase}
        >
            <header className="m2-maqam-mode-card__header">
                <h4>Maqam mode</h4>
                <span className="m2-maqam-mode-card__address">#2 · {model.address72}</span>
                <span className="m2-maqam-mode-card__planet-glyph" aria-hidden="true">
                    {model.planetGlyph}
                </span>
                {props.packet && (
                    <ProvenanceBadge
                        compact
                        field={M2_MAQAM_PROVENANCE_FIELD}
                        readiness={props.readiness ?? (model.bridgeReady ? 'ready_public_current' : 'bridge_unavailable')}
                        provenance={props.packet.meaningPacketProvenanceFor(M2_MAQAM_PROVENANCE_FIELD)}
                    />
                )}
            </header>

            {p ? (
                <>
                    <dl className="m2-maqam-mode-card__body">
                        <dt>Family</dt>
                        <dd data-maqam-family={p.family}>
                            {p.familyName} ({p.family})
                        </dd>
                        <dt>Mode in family</dt>
                        <dd>#{p.modeInFamily}</dd>
                        <dt>Tritone mirror</dt>
                        <dd data-tritone-mirror={p.tritoneMirrorName}>
                            {p.tritoneMirrorName}
                            {model.mirrorPlaying && <span className="m2-maqam-mode-card__mirror-tag"> (sounding)</span>}
                        </dd>
                    </dl>
                    <QuarterToneBar ticks={model.ticks} mirrorPlaying={model.mirrorPlaying} />
                </>
            ) : (
                <p className="mext-widget-empty" data-pending-field={MAQAM_SOURCE}>
                    The maqam reading is waiting for {MAQAM_SOURCE}.
                </p>
            )}
        </article>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function QuarterToneBar({
    ticks,
    mirrorPlaying
}: {
    readonly ticks: readonly QuarterToneTick[];
    readonly mirrorPlaying: boolean;
}): React.ReactElement {
    return (
        <ol
            className="m2-maqam-mode-card__octave-bar"
            aria-label="24 quarter-tone octave bar; lit ticks mark scale degrees"
            data-octave-bar
            data-mirror-playing={mirrorPlaying ? 'true' : 'false'}
        >
            {ticks.map(tick => (
                <li
                    key={tick.position}
                    className="m2-maqam-mode-card__quarter-tone"
                    data-quarter-tone
                    data-position={tick.position}
                    data-degree={tick.isDegree ? 'true' : 'false'}
                    data-whole-tone={tick.isWholeTone ? 'true' : 'false'}
                    aria-label={
                        tick.isDegree
                            ? `quarter-tone ${tick.position}: scale degree`
                            : `quarter-tone ${tick.position}`
                    }
                />
            ))}
        </ol>
    );
}

// ── Normalisers (bounds + parity only; no maqam arithmetic) ──────────────────

function safeDecode(decoder: M2MaqamDecoder, address72: number): M2MaqamProjection | null {
    try {
        const projection = decoder(address72, 'maqam');
        if (
            !projection ||
            typeof projection.address72 !== 'number' ||
            typeof projection.family !== 'number' ||
            !Array.isArray(projection.intervalPattern)
        ) {
            return null;
        }
        return projection;
    } catch {
        return null;
    }
}

function degreeSet(intervalPattern: readonly number[]): Set<number> {
    const set = new Set<number>();
    for (const raw of intervalPattern) {
        if (typeof raw === 'number' && Number.isFinite(raw)) {
            const position = ((Math.trunc(raw) % OCTAVE_QUARTER_TONE_COUNT) + OCTAVE_QUARTER_TONE_COUNT) % OCTAVE_QUARTER_TONE_COUNT;
            set.add(position);
        }
    }
    return set;
}

function normalizeKleinPhase(phase: M2KleinFlipPhase | null | undefined): M2KleinFlipPhase {
    return phase === 'inverted' || phase === 'transitioning' ? phase : 'primary';
}

function clampAddress72(value: number): number {
    const rounded = Math.trunc(Number.isFinite(value) ? value : 0);
    return ((rounded % MAQAM_ADDRESS_COUNT) + MAQAM_ADDRESS_COUNT) % MAQAM_ADDRESS_COUNT;
}

function clampPlanet(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % PLANET_GLYPHS.length) + PLANET_GLYPHS.length) % PLANET_GLYPHS.length;
}

export default MaqamModeCard;
