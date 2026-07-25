/**
 * Coordinate: M' M3' (tarot-decan service, 24.T24.16 adapter + 24.T24.7 chain)
 * Residency: Body/M/pratibimba-app/src/services/m3
 * Position (#n): protected scalar-reference read adapter + decan-tarot chain resolver.
 * Actualises: Tarot card-key resolution through `s2.codon.scalar_ref.read`, and
 *   the eight-step medicine chain (card → suit → codon → decan → planet → element
 *   → chakra → body zone) the [[M3']] Mahamaya route walks.
 * Public surface: TarotDecanService, M3_TAROT_DECAN_METHOD, TarotDecanChain,
 *   TarotDecanChainPending, TarotCardKey, TarotSuit, suitFromCardKey, cardLabelFromCardKey.
 * Does NOT own: correspondence LUTs, body data, gateway transport, or persistence.
 *   The chain body (codon/decan/planet/element/chakra/bodyZones/decanBodyPart/
 *   decanHerbs) is protected S2 authority read over the bridge — never a renderer LUT.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.16 + 24.7.
 */

import type { KernelBridgeCapabilityReceipt } from '../../bridge/types';
import { requireNonEmpty, type M3GatewayPort } from './m3GatewayPort';

export const M3_TAROT_DECAN_METHOD = 's2.codon.scalar_ref.read' as const;

/** Tarot card key, e.g. `wands:ace`, `cups:07`, `major:0`. */
export type TarotCardKey = string;

/** The four minor-arcana suits (Wave-C 24.7 type shape). */
export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles';

/**
 * The resolved decan-tarot chain. Every numeric field is a protected S2 authority
 * value read over `s2.codon.scalar_ref.read`; the renderer never re-derives any of
 * it. `elementId` follows the canonical m2.h `Element_Id` convention (nara/lens.rs:
 * akasha=0, air=1, fire=2, water=3, earth=4). Body data (`bodyZones`,
 * `decanBodyPart`, `decanHerbs`) is resolved in the substrate medicine-frame tables
 * (chakra-body-zone / decan-body-part / decan-herb) and arrives already-materialised
 * — never held as a renderer-local table (24.7 forbidden-import + no-renderer-LUT law).
 */
export interface TarotDecanChain {
    readonly card: TarotCardKey;
    readonly suit: TarotSuit;
    readonly codonId: number; // 0..63
    readonly decanIndex: number; // 0..35; the substrate decan index
    readonly zodiacSign: number; // 0..11
    readonly rulingPlanet: number; // 0..9 (mod-10 planet model)
    readonly elementId: number; // 0..4 (m2.h Element_Id: akasha/air/fire/water/earth)
    readonly chakraId: number; // 0..7
    readonly bodyZones: readonly string[]; // substrate chakra-body-zone for this chakra
    readonly decanBodyPart: string; // substrate decan-body-part for this decan
    readonly decanHerbs: readonly string[]; // substrate decan-herb list for this decan
}

/** Honest-pending marker returned when the protected chain has not been read yet. */
export interface TarotDecanChainPending {
    readonly pending: 's2-decan-chain';
}

export const TAROT_DECAN_CHAIN_PENDING: TarotDecanChainPending = Object.freeze({
    pending: 's2-decan-chain'
});

/** Narrow a resolveChain result to the resolved chain. */
export function isResolvedChain(
    value: TarotDecanChain | TarotDecanChainPending
): value is TarotDecanChain {
    return (value as TarotDecanChainPending).pending !== 's2-decan-chain';
}

// ============================================================================
// Aspect → element (Golden Dawn elemental temperament of the four aspect kinds).
//
// Returned in the canonical m2.h Element_Id convention (lens.rs: AKASHA=0,
// VAYU/Air=1, AGNI/Fire=2, APAS/Water=3, PRITHVI/Earth=4) so it composes with the
// `elementId` the bridge supplies on the chain. Consumed by the cosmic-clock
// aspect-edge layer (24.x) to colour chords by element.
//
// ARCHITECT-REVIEW (24.7): the aspect→element correspondence below is the standard
// astrological reading (trine=fire, square=earth, opposition=air, generic aspect=
// water); the exact Golden Dawn temperament is domain law the Architect owns —
// confirm or adjust. `elementForAspect` is a pure total function either way.
// ============================================================================

// m2.h Element_Id (lens.rs): AKASHA=0 (pre-elemental, not an aspect temperament),
// VAYU/Air=1, AGNI/Fire=2, APAS/Water=3, PRITHVI/Earth=4.
const ELEMENT_AIR = 1;
const ELEMENT_FIRE = 2;
const ELEMENT_WATER = 3;
const ELEMENT_EARTH = 4;

export type AspectKind = 'aspect' | 'opposition' | 'trine' | 'square';

const ELEMENT_FOR_ASPECT: Readonly<Record<AspectKind, number>> = Object.freeze({
    aspect: ELEMENT_WATER,
    opposition: ELEMENT_AIR,
    trine: ELEMENT_FIRE,
    square: ELEMENT_EARTH
});

// ============================================================================
// Card-key parsing — the locally-knowable head of the chain (card + suit).
// The oracle body (codon → … → body zone) is never derived here; only the card
// key's own suit head, which is a string fact of the key, not oracle authority.
// ============================================================================

const SUIT_BY_HEAD: Readonly<Record<string, TarotSuit>> = Object.freeze({
    wands: 'wands',
    cups: 'cups',
    swords: 'swords',
    pentacles: 'pentacles',
    disks: 'pentacles' // Thoth-deck alias for the earth suit
});

const RANK_LABEL: Readonly<Record<string, string>> = Object.freeze({
    ace: 'Ace', '02': 'Two', '03': 'Three', '04': 'Four', '05': 'Five',
    '06': 'Six', '07': 'Seven', '08': 'Eight', '09': 'Nine', '10': 'Ten',
    princess: 'Princess', prince: 'Prince', queen: 'Queen', knight: 'Knight',
    page: 'Page', king: 'King'
});

const SUIT_LABEL: Readonly<Record<TarotSuit, string>> = Object.freeze({
    wands: 'Wands',
    cups: 'Cups',
    swords: 'Swords',
    pentacles: 'Pentacles'
});

/** The minor-arcana suit of a card key, or null for a major-arcana trump. */
export function suitFromCardKey(card: TarotCardKey): TarotSuit | null {
    const head = card.split(':', 1)[0]?.toLowerCase() ?? '';
    return SUIT_BY_HEAD[head] ?? null;
}

/** A human label for a card key, e.g. `wands:ace` → "Ace of Wands". */
export function cardLabelFromCardKey(card: TarotCardKey): string {
    const [head, tail] = card.split(':', 2);
    if (head?.toLowerCase() === 'major') {
        const atu = tail !== undefined ? Number.parseInt(tail, 10) : Number.NaN;
        return Number.isFinite(atu) ? `Atu ${atu}` : card;
    }
    const suit = suitFromCardKey(card);
    const rank = tail !== undefined ? RANK_LABEL[tail.toLowerCase()] ?? tail : '';
    return suit && rank ? `${rank} of ${SUIT_LABEL[suit]}` : card;
}

// ============================================================================
// The service — the 24.16 scalar-ref adapter plus the 24.7 chain resolver.
// ============================================================================

export class TarotDecanService {
    constructor(private readonly bridge: M3GatewayPort) {}

    /** 24.16 protected scalar-ref read — returns the raw capability receipt. */
    async resolve(cardKey: string): Promise<KernelBridgeCapabilityReceipt> {
        return this.bridge.invoke(M3_TAROT_DECAN_METHOD, {
            refKind: 'tarot',
            scalarRef: requireNonEmpty(cardKey, 'tarot card key')
        });
    }

    /**
     * 24.7 chain resolver. Reads the protected decan-tarot chain for `card` over
     * `s2.codon.scalar_ref.read` and returns the fully-resolved {@link TarotDecanChain},
     * or the honest {@link TarotDecanChainPending} marker when the bridge is not yet
     * live / the protected authority is incomplete (Wave-B `s2.codon.scalar_ref.read`
     * return-shape closes the loop; until then this renders honest-pending).
     */
    async resolveChain(
        card: TarotCardKey
    ): Promise<TarotDecanChain | TarotDecanChainPending> {
        const key = requireNonEmpty(card, 'tarot card key');
        let receipt: KernelBridgeCapabilityReceipt;
        try {
            receipt = await this.bridge.invoke(M3_TAROT_DECAN_METHOD, {
                refKind: 'tarot',
                scalarRef: key
            });
        } catch {
            return TAROT_DECAN_CHAIN_PENDING;
        }
        return parseChain(key, receipt.artifact) ?? TAROT_DECAN_CHAIN_PENDING;
    }

    /**
     * The element (m2.h `Element_Id`) of a cross-clock aspect edge, per Golden Dawn
     * elemental temperament — consumed by the aspect-edge layer to colour chords.
     */
    elementForAspect(aspect: AspectKind): number {
        return ELEMENT_FOR_ASPECT[aspect];
    }
}

// ============================================================================
// Defensive parser — the protected artifact body is shaped by S2, never trusted.
// A complete, in-range chain returns the frozen record; anything partial returns
// null so the caller yields the honest-pending marker.
// ============================================================================

function parseChain(card: TarotCardKey, artifact: unknown): TarotDecanChain | null {
    const record = unwrap(artifact);
    if (!record) {
        return null;
    }
    const suit = readSuit(record.suit);
    const codonId = readInt(record.codonId, 0, 63);
    const decanIndex = readInt(record.decanIndex, 0, 35);
    const zodiacSign = readInt(record.zodiacSign, 0, 11);
    const rulingPlanet = readInt(record.rulingPlanet, 0, 9);
    const elementId = readInt(record.elementId, 0, 4);
    const chakraId = readInt(record.chakraId, 0, 7);
    const bodyZones = readStringArray(record.bodyZones);
    const decanBodyPart = readString(record.decanBodyPart);
    const decanHerbs = readStringArray(record.decanHerbs);
    if (
        suit === null ||
        codonId === null ||
        decanIndex === null ||
        zodiacSign === null ||
        rulingPlanet === null ||
        elementId === null ||
        chakraId === null ||
        bodyZones === null ||
        decanBodyPart === null ||
        decanHerbs === null
    ) {
        return null;
    }
    return Object.freeze({
        card,
        suit,
        codonId,
        decanIndex,
        zodiacSign,
        rulingPlanet,
        elementId,
        chakraId,
        bodyZones,
        decanBodyPart,
        decanHerbs
    });
}

function unwrap(value: unknown): Readonly<Record<string, unknown>> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    const outer = value as Record<string, unknown>;
    const inner = outer.detail;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
        return inner as Record<string, unknown>;
    }
    return outer;
}

function readSuit(value: unknown): TarotSuit | null {
    return typeof value === 'string' && value in SUIT_LABEL ? (value as TarotSuit) : null;
}

function readInt(value: unknown, minimum: number, maximum: number): number | null {
    return typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= minimum &&
        value <= maximum
        ? value
        : null;
}

function readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function readStringArray(value: unknown): readonly string[] | null {
    if (!Array.isArray(value) || value.length === 0) {
        return null;
    }
    const parts = value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
    return parts.length === value.length ? Object.freeze([...parts]) : null;
}
