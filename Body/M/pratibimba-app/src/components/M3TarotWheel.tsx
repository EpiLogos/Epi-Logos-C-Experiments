/**
 * Coordinate: M' M3' (tarot wheel — Track 24.T24.6)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): M3' deck surface — 22 major arcana inner ring + 56 minor
 *   arcana outer ring (4 suits × 14 ranks), the "turning the card IS changing
 *   the mode" axiom made touchable.
 * Actualises: `M3TarotWheel` — the active major arcana and the active minor
 *   card rendered luminous off the BUSSED ids (`mahamaya.tarotMajorArcanaCardId`
 *   / `mahamaya.tarotMinorId`, landed by 24.T24.6 in
 *   `portal-core::kernel::projections::binary`), suits coloured by their
 *   element, and a card turn dispatched to `s2.codon.scalar_ref.read`.
 * Public surface: M3TarotWheel, M3_TAROT_WHEEL_WIDGET_ID, TarotMinorRef,
 *   TarotCardKey, TarotMinorSuit, minorRefFromCardId, minorCardIdFromRef,
 *   tarotCardKeyString, readArcanaState, M3ArcanaState.
 * Does NOT own: the decks. Card identity, the 56-card exact cover, and the
 *   codon→arcana transcription are kernel law (`epi-lib m3.c M3_MAJOR_ARCANA` /
 *   `M3_TAROT_CODON_MAP`, mirrored by `portal-core::m3_transcription_bridge`);
 *   this file holds NO card table, NO codon→card map, and NO deck names beyond
 *   the ring's own suit/rank labels. It also does not own the gateway call —
 *   `onTurn` hands the card key up; the pane dispatches through the service.
 * Contract: [[M3'-SPEC]] §8.7 (56 + 8 exact cover) + rerun
 *   [[24-m3-mahamaya-frontend-deep]] 24.6.
 */

import { ProvenanceBadge } from '../ui/primitives';
import { ringLit, inkDim } from '../ui/tokens';
import { ELEMENT_COLOURS } from '../engine/cosmicMath';
import {
    AlchemicalElement,
    alchemicalElementName,
    mahabhutaFromAlchemical,
    type Alchemical
} from '../engine/elementRegisters';
import './m3TarotWheel.css';

export const M3_TAROT_WHEEL_WIDGET_ID = 'pratibimba.m3-mahamaya:tarot-wheel';

/** The four minor-arcana suits, in the kernel's deck order. */
export type TarotMinorSuit = 'cups' | 'wands' | 'pentacles' | 'swords';

export interface TarotMinorRef {
    readonly suit: TarotMinorSuit;
    /** 1..14 — Ace through King, the deck's own 1-based rank. */
    readonly rank: number;
}

export type TarotCardKey =
    | { readonly kind: 'major'; readonly id: number }
    | { readonly kind: 'minor'; readonly suit: TarotMinorSuit; readonly rank: number };

/**
 * The three distinct answers the bus can give for an arcana id. Keeping them
 * apart is the whole point: `no-arcana` is a RESULT (the kernel refuses an
 * arcana for a STOP codon — `m3_major_arcana_from_codon` returns `0xFF`), while
 * `pending` means the field never crossed the wire. Collapsing them into one
 * "—" is how a landed producer reads as an unlanded one.
 */
export type M3ArcanaState =
    | { readonly kind: 'card'; readonly cardId: number }
    | { readonly kind: 'no-arcana'; readonly reason: string }
    | { readonly kind: 'pending'; readonly reason: string };

// ============================================================================
// Deck geometry — 4 suits × 14 ranks = 56, in the kernel's suit order.
//
// PROVENANCE, not invention: the ordering is `portal-core`
// `m3_transcription_bridge::suit_name` (Cups · Wands · Pentacles · Swords),
// which mirrors `epi-lib/src/m3.c::SUIT_NAMES[4]` and the row order of
// `M3_TAROT_CODON_MAP[4][16]`. `minorRefFromCardId` is the same arithmetic
// `minor_arcana` performs (`suit = id / 14`, `rank = id % 14`), and
// `portal-core/tests/tarot_arcana_profile_field.rs::
// the_fifty_six_card_ring_is_four_arcs_of_fourteen_in_suit_order` pins the
// substrate side of that agreement so a re-ordering breaks a test rather than
// silently re-labelling every card here.
// ============================================================================

export const TAROT_SUIT_ORDER: readonly TarotMinorSuit[] = Object.freeze([
    'cups',
    'wands',
    'pentacles',
    'swords'
]);

export const TAROT_RANKS_PER_SUIT = 14;
export const TAROT_MINOR_COUNT = TAROT_SUIT_ORDER.length * TAROT_RANKS_PER_SUIT; // 56
export const TAROT_MAJOR_COUNT = 22;

/** Rank labels, deck order — `epi-lib/src/m3.c::TAROT_RANK_NAMES[14]`. */
const RANK_NAMES: readonly string[] = Object.freeze([
    'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'
]);

/**
 * Suit → element. The spec fixes this pairing renderer-side (Wands = fire,
 * Cups = water, Swords = air, Pentacles = earth) and it agrees with the
 * substrate's `suit_element` (`card_id / 14` → Water · Fire · Earth · Air).
 * The element VALUES come from the [[L2']] alchemical register, never a local
 * element enum.
 */
const SUIT_ELEMENT: Readonly<Record<TarotMinorSuit, Alchemical>> = Object.freeze({
    cups: AlchemicalElement.WATER,
    wands: AlchemicalElement.FIRE,
    pentacles: AlchemicalElement.EARTH,
    swords: AlchemicalElement.AIR
});

/** Gateway card-key rank tokens, matching `TarotDecanService`'s parser. */
const RANK_TOKENS: readonly string[] = Object.freeze([
    'ace', '02', '03', '04', '05', '06', '07', '08', '09', '10',
    'page', 'knight', 'queen', 'king'
]);

const SUIT_LABEL: Readonly<Record<TarotMinorSuit, string>> = Object.freeze({
    cups: 'Cups',
    wands: 'Wands',
    pentacles: 'Pentacles',
    swords: 'Swords'
});

/** Bussed minor card id (0..55) → `{ suit, rank }`, or null when out of deck. */
export function minorRefFromCardId(cardId: number): TarotMinorRef | null {
    if (!Number.isInteger(cardId) || cardId < 0 || cardId >= TAROT_MINOR_COUNT) {
        return null;
    }
    const suit = TAROT_SUIT_ORDER[Math.floor(cardId / TAROT_RANKS_PER_SUIT)];
    return suit === undefined
        ? null
        : { suit, rank: (cardId % TAROT_RANKS_PER_SUIT) + 1 };
}

/** `{ suit, rank }` → the bussed card id (0..55), or null when out of deck. */
export function minorCardIdFromRef(ref: TarotMinorRef): number | null {
    const suitIndex = TAROT_SUIT_ORDER.indexOf(ref.suit);
    if (suitIndex < 0 || !Number.isInteger(ref.rank) || ref.rank < 1 || ref.rank > TAROT_RANKS_PER_SUIT) {
        return null;
    }
    return suitIndex * TAROT_RANKS_PER_SUIT + (ref.rank - 1);
}

/** Card key → the `scalarRef` string `s2.codon.scalar_ref.read` is called with. */
export function tarotCardKeyString(card: TarotCardKey): string {
    return card.kind === 'major'
        ? `major:${card.id}`
        : `${card.suit}:${RANK_TOKENS[card.rank - 1] ?? String(card.rank)}`;
}

/** Human label for a card key — the ring's own naming, no deck table. */
export function tarotCardLabel(card: TarotCardKey): string {
    return card.kind === 'major'
        ? `Atu ${card.id}`
        : `${RANK_NAMES[card.rank - 1] ?? card.rank} of ${SUIT_LABEL[card.suit]}`;
}

/**
 * Read one bussed arcana id into its three-state answer.
 *
 * `undefined` (key absent) and `null` (key present, kernel said "no card") are
 * DIFFERENT and are reported differently — see {@link M3ArcanaState}.
 */
export function readArcanaState(
    value: unknown,
    options: {
        readonly max: number;
        readonly pendingReason: string;
        readonly noArcanaReason: string;
    }
): M3ArcanaState {
    if (value === undefined) {
        return { kind: 'pending', reason: options.pendingReason };
    }
    if (value === null) {
        return { kind: 'no-arcana', reason: options.noArcanaReason };
    }
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < options.max
        ? { kind: 'card', cardId: value }
        : { kind: 'pending', reason: options.pendingReason };
}

const hex = (value: number): string => `#${value.toString(16).padStart(6, '0')}`;

function suitColour(suit: TarotMinorSuit): string {
    const mahabhuta = mahabhutaFromAlchemical(SUIT_ELEMENT[suit]);
    const colour = mahabhuta === null ? undefined : ELEMENT_COLOURS[mahabhuta];
    return colour === undefined ? inkDim : hex(colour);
}

function suitElementName(suit: TarotMinorSuit): string {
    return alchemicalElementName(SUIT_ELEMENT[suit]) ?? 'unknown';
}

function polar(centre: number, radius: number, index: number, count: number): readonly [number, number] {
    const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
    return [centre + Math.cos(angle) * radius, centre + Math.sin(angle) * radius];
}

export interface M3TarotWheelProps {
    /** Major-arcana answer from `mahamaya.tarotMajorArcanaCardId` (WC-M3-SA-2). */
    readonly majorArcana: M3ArcanaState;
    /** Minor-arcana answer from `mahamaya.tarotMinorId`. */
    readonly minorArcana: M3ArcanaState;
    /** Notified when a card is turned; the pane dispatches to the gateway. */
    readonly onTurn: (card: TarotCardKey) => void;
    /** Last turn's gateway answer, rendered verbatim — never faked. */
    readonly turnState?: {
        readonly card: TarotCardKey;
        readonly status: 'pending' | 'resolved' | 'unresolved' | 'error';
        readonly detail: string;
    } | null;
    readonly size?: number;
}

export function M3TarotWheel({
    majorArcana,
    minorArcana,
    onTurn,
    turnState = null,
    size = 300
}: M3TarotWheelProps) {
    const centre = size / 2;
    const minorRadius = centre * 0.86;
    const majorRadius = centre * 0.56;
    const activeMinor =
        minorArcana.kind === 'card' ? minorRefFromCardId(minorArcana.cardId) : null;

    const majorNodes = [];
    for (let card = 0; card < TAROT_MAJOR_COUNT; card++) {
        const [cx, cy] = polar(centre, majorRadius, card, TAROT_MAJOR_COUNT);
        const active = majorArcana.kind === 'card' && majorArcana.cardId === card;
        majorNodes.push(
            <circle
                key={card}
                role="button"
                tabIndex={0}
                data-testid={`m3-tarot-major-${card}`}
                data-active={active ? 'true' : 'false'}
                cx={cx}
                cy={cy}
                r={active ? size * 0.026 : size * 0.014}
                className={active ? 'm3-tarot-major m3-tarot-active' : 'm3-tarot-major'}
                fill={active ? ringLit : 'none'}
                stroke={ringLit}
                strokeWidth={1}
                opacity={active ? 1 : 0.6}
                onClick={() => onTurn({ kind: 'major', id: card })}
                onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onTurn({ kind: 'major', id: card });
                    }
                }}
            >
                <title>{tarotCardLabel({ kind: 'major', id: card })}</title>
            </circle>
        );
    }

    const minorNodes = [];
    for (let cardId = 0; cardId < TAROT_MINOR_COUNT; cardId++) {
        const ref = minorRefFromCardId(cardId);
        if (ref === null) {
            continue;
        }
        const [cx, cy] = polar(centre, minorRadius, cardId, TAROT_MINOR_COUNT);
        const active =
            activeMinor !== null && activeMinor.suit === ref.suit && activeMinor.rank === ref.rank;
        const colour = suitColour(ref.suit);
        minorNodes.push(
            <circle
                key={cardId}
                role="button"
                tabIndex={0}
                data-testid={`m3-tarot-minor-${cardId}`}
                data-suit={ref.suit}
                data-rank={ref.rank}
                data-element={suitElementName(ref.suit)}
                data-active={active ? 'true' : 'false'}
                cx={cx}
                cy={cy}
                r={active ? size * 0.022 : size * 0.011}
                className={active ? 'm3-tarot-minor m3-tarot-active' : 'm3-tarot-minor'}
                fill={colour}
                opacity={active ? 1 : 0.5}
                onClick={() => onTurn({ kind: 'minor', suit: ref.suit, rank: ref.rank })}
                onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onTurn({ kind: 'minor', suit: ref.suit, rank: ref.rank });
                    }
                }}
            >
                <title>
                    {`${tarotCardLabel({ kind: 'minor', suit: ref.suit, rank: ref.rank })} · ${suitElementName(ref.suit)}`}
                </title>
            </circle>
        );
    }

    return (
        <section
            className="m3-tarot-wheel"
            data-testid="m3-tarot-wheel"
            data-widget-id={M3_TAROT_WHEEL_WIDGET_ID}
            data-rpc-method="s2.codon.scalar_ref.read"
            data-major-state={majorArcana.kind}
            data-minor-state={minorArcana.kind}
            data-major-card={majorArcana.kind === 'card' ? majorArcana.cardId : 'none'}
            data-minor-card={minorArcana.kind === 'card' ? minorArcana.cardId : 'none'}
        >
            <header className="m3-tarot-wheel-header">
                <h4>Tarot wheel</h4>
                <span data-testid="m3-tarot-counts">
                    {TAROT_MAJOR_COUNT} + {TAROT_MINOR_COUNT}
                </span>
            </header>
            <svg
                viewBox={`0 0 ${size} ${size}`}
                width={size}
                height={size}
                role="img"
                aria-label={`Tarot wheel — ${TAROT_MAJOR_COUNT} major arcana, ${TAROT_MINOR_COUNT} minor arcana`}
            >
                <g data-testid="m3-tarot-minor-ring">{minorNodes}</g>
                <g data-testid="m3-tarot-major-ring">{majorNodes}</g>
            </svg>
            <dl className="m3-tarot-wheel-readout">
                <dt>Major</dt>
                <dd data-testid="m3-tarot-major-readout">
                    {majorArcana.kind === 'card' ? (
                        tarotCardLabel({ kind: 'major', id: majorArcana.cardId })
                    ) : (
                        <>
                            <ProvenanceBadge
                                state={majorArcana.kind === 'no-arcana' ? 'canonical_absent' : 'pending'}
                                reason={majorArcana.reason}
                            />
                            {majorArcana.reason}
                        </>
                    )}
                </dd>
                <dt>Minor</dt>
                <dd data-testid="m3-tarot-minor-readout">
                    {activeMinor !== null ? (
                        `${tarotCardLabel({ kind: 'minor', ...activeMinor })} · ${suitElementName(activeMinor.suit)}`
                    ) : (
                        <>
                            <ProvenanceBadge
                                state={minorArcana.kind === 'no-arcana' ? 'canonical_absent' : 'pending'}
                                reason={minorArcana.kind === 'card' ? 'minor-card-out-of-deck' : minorArcana.reason}
                            />
                            {minorArcana.kind === 'card' ? 'minor-card-out-of-deck' : minorArcana.reason}
                        </>
                    )}
                </dd>
                {turnState ? (
                    <>
                        <dt>Turn</dt>
                        <dd
                            data-testid="m3-tarot-turn-readout"
                            data-turn-status={turnState.status}
                            data-turn-card={tarotCardKeyString(turnState.card)}
                        >
                            {turnState.status === 'resolved' ? null : (
                                <ProvenanceBadge
                                    state={turnState.status === 'error' ? 'blocked' : 'pending'}
                                    reason={turnState.detail}
                                />
                            )}
                            {tarotCardKeyString(turnState.card)} — {turnState.detail}
                        </dd>
                    </>
                ) : null}
            </dl>
        </section>
    );
}

export default M3TarotWheel;
