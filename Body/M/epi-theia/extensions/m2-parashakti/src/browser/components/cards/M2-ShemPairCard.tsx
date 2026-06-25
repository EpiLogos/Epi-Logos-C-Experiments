// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2 sacred-sonic Shem axis (the 72 Shem ha-Mephorash angels paired
//                   light/shadow across the decan-face, one pair per vibrational address)
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser card)
//   Position (#3):  23.3 — Layer B, sacred-sonic card #2
//   Actualises:     the Shem light/shadow pair for the live `address72`, read ONLY
//                   through `kernelBridge.m2.decodeAxisAt(address72, "shem")`. Each
//                   name carries a choir-glyph, position-in-choir, element, Hebrew
//                   text, and a meaning resolved by `kernelBridge.s2.meaningIdResolve`.
//                   A Klein-flip swaps which of the pair holds primacy (light↔shadow).
//   Public surface: ShemPairCard, buildShemPairCardModel, the M2ShemProjection /
//                   M2ShemName / M2ShemPairCardBridge typed contract, and the
//                   ShemPairCardModel view model.
//   Does NOT own:   the Shem law or the choir partition. The 72 angels, their choirs,
//                   Hebrew letters, and decan pairing live kernel-side / S2 and are
//                   surfaced through `decodeAxisAt` + `meaningIdResolve`. This card
//                   NEVER recomputes the pairing; it folds the published projection.
//   Cross-links:    DecanFaceCard (sibling), MaqamModeCard / AsmaCard (sacred-sonic
//                   siblings), correspondence tree Shem axis chip (23.5).
//   Contract:       kernelBridge.m2.decodeAxisAt(address72, "shem") →
//                   { address72, lightIndex, shadowIndex, light: M2ShemName,
//                     shadow: M2ShemName }
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../../common/meaning-packet';
import type { M2KleinFlipPhase } from '../../../common/composition';
import { ProvenanceBadge, type ProvenanceReadinessVariant } from '../ProvenanceBadge';

// ── Invariants (declared; never recomputed) ─────────────────────────────────

/** The Parashakti 72-Invariant — every Shem-pair address resolves here. */
export const SHEM_PAIR_ADDRESS_COUNT = 72;

/** The 72 Shem ha-Mephorash names. */
export const SHEM_NAME_COUNT = 72;

/** Provenance source-field for the Shem-pair payload (routes to the S2 authority). */
export const M2_SHEM_PAIR_PROVENANCE_FIELD = 'sacredSonicFrame.shemPair';

/** The single Shem authority this card reads through — never a local computation. */
export const SHEM_PAIR_SOURCE = 'kernelBridge.m2.decodeAxisAt(address72, "shem")' as const;

/** Element hue map mirroring the M2 palette. */
const ELEMENT_HUES: Readonly<Record<string, string>> = Object.freeze({
    AGNI: '#c5564b',
    PRITHVI: '#8a7355',
    VAYU: '#6ec1c8',
    APAS: '#5fa9b8',
    AKASHA: '#7d4f9e'
});

// ── Bridge contract (the ONLY typed projection this card consumes) ────────────

/** One Shem name with its choir position, element, Hebrew text, and resolved meaning. */
export interface M2ShemName {
    readonly index: number;
    readonly name: string;
    readonly choir: string;
    readonly choirGlyph: string;
    readonly positionInChoir: number;
    readonly element: string;
    readonly hebrew: string;
    readonly meaning: string;
}

/** The typed projection returned by `kernelBridge.m2.decodeAxisAt(address72, "shem")`. */
export interface M2ShemProjection {
    readonly address72: number;
    readonly lightIndex: number;
    readonly shadowIndex: number;
    readonly light: M2ShemName;
    readonly shadow: M2ShemName;
}

/** A function decoding a 72-address along the Shem axis. */
export type M2ShemDecoder = (address72: number, axis: 'shem') => M2ShemProjection;

/** The slice of the kernel-bridge this card depends on. */
export interface M2ShemPairCardBridge {
    readonly m2: {
        readonly decodeAxisAt: M2ShemDecoder;
    };
}

// ── View model ───────────────────────────────────────────────────────────────

export interface ShemPairCardModel {
    readonly address72: number;
    readonly projection: M2ShemProjection | null;
    readonly kleinFlipPhase: M2KleinFlipPhase;
    /** The name holding primacy after any Klein-flip swap (light by default). */
    readonly primary: M2ShemName | null;
    /** The complementary name (shadow by default). */
    readonly secondary: M2ShemName | null;
    /** True when the Klein-flip has swapped shadow into primacy. */
    readonly shadowInPrimacy: boolean;
    readonly bridgeReady: boolean;
}

export interface ShemPairCardProps {
    /** The live vibrational address descending into the Shem axis. */
    readonly address72: number;
    /** The kernel-bridge slice. When absent the card renders a bridge-down state. */
    readonly kernelBridge?: M2ShemPairCardBridge | null;
    /** Klein-flip phase swapping light/shadow primacy. */
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
    /** Meaning packet for provenance badging. */
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    /** Readiness for provenance badge tone. */
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    readonly className?: string;
}

// ── Model builder (pure; reads ONLY the injected bridge projection) ──────────

export function buildShemPairCardModel(input: {
    readonly address72: number;
    readonly kernelBridge?: M2ShemPairCardBridge | null;
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
}): ShemPairCardModel {
    const address72 = clampAddress72(input.address72);
    const kleinFlipPhase = normalizeKleinPhase(input.kleinFlipPhase);
    const shadowInPrimacy = kleinFlipPhase === 'inverted';
    const decoder = input.kernelBridge?.m2?.decodeAxisAt ?? null;
    const projection = decoder ? safeDecode(decoder, address72) : null;

    const primary = projection ? (shadowInPrimacy ? projection.shadow : projection.light) : null;
    const secondary = projection ? (shadowInPrimacy ? projection.light : projection.shadow) : null;

    return Object.freeze({
        address72,
        projection,
        kleinFlipPhase,
        primary,
        secondary,
        shadowInPrimacy,
        bridgeReady: projection !== null
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export function ShemPairCard(props: ShemPairCardProps): React.ReactElement {
    const model = React.useMemo(
        () =>
            buildShemPairCardModel({
                address72: props.address72,
                kernelBridge: props.kernelBridge ?? null,
                kleinFlipPhase: props.kleinFlipPhase ?? null
            }),
        [props.address72, props.kernelBridge, props.kleinFlipPhase]
    );

    const className = ['m2-shem-pair-card', 'm2-sacred-sonic-card', props.className].filter(Boolean).join(' ');

    return (
        <article
            className={className}
            data-shem-pair-card
            data-sacred-sonic-card="shem"
            data-address72={model.address72}
            data-card-state={model.bridgeReady ? 'ready' : 'bridge-unavailable'}
            data-shadow-in-primacy={model.shadowInPrimacy ? 'true' : 'false'}
            data-klein-phase={model.kleinFlipPhase}
        >
            <header className="m2-shem-pair-card__header">
                <h4>Shem pair</h4>
                <span className="m2-shem-pair-card__address">#2 · {model.address72}</span>
                {props.packet && (
                    <ProvenanceBadge
                        compact
                        field={M2_SHEM_PAIR_PROVENANCE_FIELD}
                        readiness={props.readiness ?? (model.bridgeReady ? 'ready_public_current' : 'bridge_unavailable')}
                        provenance={props.packet.meaningPacketProvenanceFor(M2_SHEM_PAIR_PROVENANCE_FIELD)}
                    />
                )}
            </header>

            {model.primary && model.secondary ? (
                <div className="m2-shem-pair-card__pair">
                    <ShemNameView name={model.primary} role="primary" />
                    <span className="m2-shem-pair-card__pair-divider" aria-hidden="true">
                        {model.shadowInPrimacy ? '↔ (flipped)' : '↔'}
                    </span>
                    <ShemNameView name={model.secondary} role="secondary" />
                </div>
            ) : (
                <p className="mext-widget-empty" data-pending-field={SHEM_PAIR_SOURCE}>
                    The Shem pair is waiting for {SHEM_PAIR_SOURCE}.
                </p>
            )}
        </article>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function ShemNameView({
    name,
    role
}: {
    readonly name: M2ShemName;
    readonly role: 'primary' | 'secondary';
}): React.ReactElement {
    const hue = ELEMENT_HUES[name.element] ?? '#9aa6b2';
    return (
        <section
            className="m2-shem-pair-card__name"
            data-shem-name
            data-shem-role={role}
            data-shem-index={name.index}
            data-shem-element={name.element}
        >
            <header className="m2-shem-pair-card__name-header">
                <span className="m2-shem-pair-card__choir-glyph" aria-hidden="true">
                    {name.choirGlyph}
                </span>
                <strong className="m2-shem-pair-card__name-text">{name.name}</strong>
                <span className="m2-shem-pair-card__hebrew" lang="he" dir="rtl">
                    {name.hebrew}
                </span>
            </header>
            <dl className="m2-shem-pair-card__name-body">
                <dt>Choir</dt>
                <dd>
                    {name.choir} · #{name.positionInChoir}
                </dd>
                <dt>Element</dt>
                <dd>
                    <span className="m2-shem-pair-card__element-swatch" style={{ background: hue }} aria-hidden="true" />
                    {name.element}
                </dd>
                <dt>Meaning</dt>
                <dd>{name.meaning}</dd>
            </dl>
        </section>
    );
}

// ── Normalisers (bounds + parity only; no Shem arithmetic) ───────────────────

function safeDecode(decoder: M2ShemDecoder, address72: number): M2ShemProjection | null {
    try {
        const projection = decoder(address72, 'shem');
        if (
            !projection ||
            typeof projection.address72 !== 'number' ||
            !isShemName(projection.light) ||
            !isShemName(projection.shadow)
        ) {
            return null;
        }
        return projection;
    } catch {
        return null;
    }
}

function isShemName(value: unknown): value is M2ShemName {
    return (
        !!value &&
        typeof value === 'object' &&
        typeof (value as M2ShemName).name === 'string' &&
        typeof (value as M2ShemName).choir === 'string'
    );
}

function normalizeKleinPhase(phase: M2KleinFlipPhase | null | undefined): M2KleinFlipPhase {
    return phase === 'inverted' || phase === 'transitioning' ? phase : 'primary';
}

function clampAddress72(value: number): number {
    const rounded = Math.trunc(Number.isFinite(value) ? value : 0);
    return ((rounded % SHEM_PAIR_ADDRESS_COUNT) + SHEM_PAIR_ADDRESS_COUNT) % SHEM_PAIR_ADDRESS_COUNT;
}

export default ShemPairCard;
