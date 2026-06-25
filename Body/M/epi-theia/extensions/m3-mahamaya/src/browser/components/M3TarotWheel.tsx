import * as React from 'react';
import type { KernelBridgeAPI } from '@pratibimba/m-extension-runtime';
import type { M3ProjectionSurface, M3ScalarOracleRef } from '../../common';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

// M3 Mahāmāyā — 78-card Tarot wheel (Thoth deck + Golden Dawn attributions).
//
// Two concentric rings:
//   - inner ring  : the 22 major arcana (atu 0..21), the trumps;
//   - outer ring  : the 56 minor arcana = 4 suits × 14 ranks (Ace..Ten + the four
//                   court cards Princess/Prince/Queen/Knight, per the Thoth deck).
//
// Each suit carries a classical element and is coloured by it (Wands = Fire,
// Cups = Water, Swords = Air, Disks = Earth). The card(s) matching the active
// projection are rendered luminous.
//
// "Turning" the wheel — clicking a card to bring it to the reading — dispatches
//   bridge.invokeGatewayRpc('s2.codon.scalar_ref.read', { refKind: 'tarot', scalarRef: cardKey })
// reading the protected scalar oracle ref for that card. The renderer never sees
// the protected artifact body; it only ever turns to a scalar ref.

export const M3_TAROT_WHEEL_WIDGET_ID = 'pratibimba.m3-mahamaya:tarot-wheel';
export const M3_TAROT_SCALAR_REF_RPC = 's2.codon.scalar_ref.read';
export const M3_TAROT_REF_KIND: M3ScalarOracleRef['refKind'] = 'tarot';

export const M3_TAROT_MAJOR_COUNT = 22;
export const M3_TAROT_SUIT_COUNT = 4;
export const M3_TAROT_RANK_COUNT = 14;
/** 4 suits × 14 ranks. */
export const M3_TAROT_MINOR_COUNT = M3_TAROT_SUIT_COUNT * M3_TAROT_RANK_COUNT;
/** 22 trumps + 56 minor = the full deck. */
export const M3_TAROT_DECK_SIZE = M3_TAROT_MAJOR_COUNT + M3_TAROT_MINOR_COUNT;

export type M3TarotElement = 'Fire' | 'Water' | 'Air' | 'Earth';
export type M3TarotArcana = 'major' | 'minor';

/** The minimal bridge surface the wheel needs to turn to a scalar oracle ref. */
export type M3TarotBridge = Pick<KernelBridgeAPI, 'invokeGatewayRpc'>;

export interface M3TarotCard {
    /** Stable scalar ref key, e.g. `major:00` or `wands:ace`, `disks:princess`. */
    readonly cardKey: string;
    readonly arcana: M3TarotArcana;
    readonly label: string;
    /** Compact glyph rendered on the wheel face. */
    readonly glyph: string;
    /** Suit element (minor arcana only). */
    readonly element?: M3TarotElement;
    readonly suit?: string;
}

export interface M3TarotWheelProps {
    readonly surface: M3ProjectionSurface;
    /** Bridge used to read a card's scalar oracle ref on turn. */
    readonly bridge?: M3TarotBridge;
    /** Cards rendered luminous. Falls back to the active projection. */
    readonly activeCardKeys?: readonly string[];
    /** Notified after a turn (in addition to the bridge dispatch). */
    readonly onTurn?: (card: M3TarotCard) => void;
}

// ============================================================================
// Deck — Thoth deck names + Golden Dawn elemental suits.
// ============================================================================

const MAJOR_ARCANA: readonly string[] = Object.freeze([
    'The Fool', 'The Magus', 'The Priestess', 'The Empress', 'The Emperor',
    'The Hierophant', 'The Lovers', 'The Chariot', 'Adjustment', 'The Hermit',
    'Fortune', 'Lust', 'The Hanged Man', 'Death', 'Art', 'The Devil',
    'The Tower', 'The Star', 'The Moon', 'The Sun', 'The Aeon', 'The Universe'
]);

interface SuitDescriptor {
    readonly id: string;
    readonly label: string;
    readonly element: M3TarotElement;
}

const SUITS: readonly SuitDescriptor[] = Object.freeze([
    { id: 'wands', label: 'Wands', element: 'Fire' },
    { id: 'cups', label: 'Cups', element: 'Water' },
    { id: 'swords', label: 'Swords', element: 'Air' },
    { id: 'disks', label: 'Disks', element: 'Earth' }
]);

interface RankDescriptor {
    readonly id: string;
    readonly label: string;
    readonly glyph: string;
}

const RANKS: readonly RankDescriptor[] = Object.freeze([
    { id: 'ace', label: 'Ace', glyph: 'A' },
    { id: '02', label: 'Two', glyph: '2' },
    { id: '03', label: 'Three', glyph: '3' },
    { id: '04', label: 'Four', glyph: '4' },
    { id: '05', label: 'Five', glyph: '5' },
    { id: '06', label: 'Six', glyph: '6' },
    { id: '07', label: 'Seven', glyph: '7' },
    { id: '08', label: 'Eight', glyph: '8' },
    { id: '09', label: 'Nine', glyph: '9' },
    { id: '10', label: 'Ten', glyph: '10' },
    { id: 'princess', label: 'Princess', glyph: 'Pr' },
    { id: 'prince', label: 'Prince', glyph: 'P' },
    { id: 'queen', label: 'Queen', glyph: 'Q' },
    { id: 'knight', label: 'Knight', glyph: 'Kn' }
]);

const ELEMENT_COLOR: Readonly<Record<M3TarotElement, string>> = Object.freeze({
    Fire: 'var(--theia-charts-red)',
    Water: 'var(--theia-charts-blue)',
    Air: 'var(--theia-charts-yellow)',
    Earth: 'var(--theia-charts-green)'
});

/** The 22 trumps, index = atu number. */
const MAJOR_CARDS: readonly M3TarotCard[] = Object.freeze(
    MAJOR_ARCANA.map((label, index) => Object.freeze({
        cardKey: `major:${String(index).padStart(2, '0')}`,
        arcana: 'major' as const,
        label,
        glyph: String(index)
    }))
);

/** The 56 minor arcana, suit-major then rank order. */
const MINOR_CARDS: readonly M3TarotCard[] = Object.freeze(
    SUITS.flatMap(suit =>
        RANKS.map(rank => Object.freeze({
            cardKey: `${suit.id}:${rank.id}`,
            arcana: 'minor' as const,
            label: `${rank.label} of ${suit.label}`,
            glyph: rank.glyph,
            element: suit.element,
            suit: suit.id
        }))
    )
);

// ============================================================================
// Component
// ============================================================================

export const M3TarotWheel: React.FC<M3TarotWheelProps> = ({
    surface,
    bridge,
    activeCardKeys,
    onTurn
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();

    const activeKeys = React.useMemo(
        () => new Set(activeCardKeys ?? activeCardKeysFromSurface(surface)),
        [activeCardKeys, surface.activeProjection]
    );

    const turn = React.useCallback(
        (card: M3TarotCard) => {
            if (bridge) {
                // Read the protected scalar oracle ref for this card. The body
                // never enters the renderer — only the scalar ref is turned to.
                void bridge.invokeGatewayRpc(M3_TAROT_SCALAR_REF_RPC, {
                    refKind: M3_TAROT_REF_KIND,
                    scalarRef: card.cardKey
                });
            }
            onTurn?.(card);
        },
        [bridge, onTurn]
    );

    return (
        <article
            className="m3-tarot-wheel"
            data-widget-id={M3_TAROT_WHEEL_WIDGET_ID}
            data-rpc-method={M3_TAROT_SCALAR_REF_RPC}
            data-ref-kind={M3_TAROT_REF_KIND}
            data-deck-size={M3_TAROT_DECK_SIZE}
            data-major-count={M3_TAROT_MAJOR_COUNT}
            data-minor-count={M3_TAROT_MINOR_COUNT}
            data-active-card-count={activeKeys.size}
            data-profile-generation={surface.profileGeneration}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>Tarot wheel (78 · Thoth)</h3>
                    <p style={subtitleStyle}>
                        22 major arcana (inner) + 56 minor (outer = 4 suits × 14 ranks).
                        Suits coloured by element; turning reads the scalar oracle ref.
                    </p>
                </div>
                <ReadinessChip
                    bindingKey="surface.activeProjection.tarot"
                    state={activeKeys.size > 0 ? 'ready' : 'pending'}
                    style={chipStyle}
                >
                    {activeKeys.size > 0 ? `${activeKeys.size} active` : 'no active card'}
                </ReadinessChip>
            </header>

            <div
                role="group"
                aria-label="Tarot deck wheel, 22 major arcana inner ring and 56 minor arcana outer ring"
                style={wheelStyle}
            >
                {/* Outer ring — 56 minor arcana, coloured by suit element. */}
                {MINOR_CARDS.map((card, index) => (
                    <TarotCardButton
                        key={card.cardKey}
                        card={card}
                        active={activeKeys.has(card.cardKey)}
                        radiusPercent={OUTER_RADIUS_PERCENT}
                        angleDeg={(index / M3_TAROT_MINOR_COUNT) * 360}
                        color={card.element ? ELEMENT_COLOR[card.element] : undefined}
                        onTurn={turn}
                    />
                ))}

                {/* Inner ring — 22 major arcana trumps. */}
                {MAJOR_CARDS.map((card, index) => (
                    <TarotCardButton
                        key={card.cardKey}
                        card={card}
                        active={activeKeys.has(card.cardKey)}
                        radiusPercent={INNER_RADIUS_PERCENT}
                        angleDeg={(index / M3_TAROT_MAJOR_COUNT) * 360}
                        onTurn={turn}
                    />
                ))}

                <div aria-hidden="true" style={hubStyle}>78</div>
            </div>

            <div role="list" aria-label="Suit element legend" style={legendStyle}>
                {SUITS.map(suit => (
                    <span
                        key={suit.id}
                        role="listitem"
                        data-suit={suit.id}
                        data-element={suit.element}
                        style={legendItemStyle}
                    >
                        <span
                            aria-hidden="true"
                            style={{ ...legendSwatchStyle, background: ELEMENT_COLOR[suit.element] }}
                        />
                        {suit.label} · {suit.element}
                    </span>
                ))}
            </div>
        </article>
    );
};

export default M3TarotWheel;

const TarotCardButton: React.FC<{
    readonly card: M3TarotCard;
    readonly active: boolean;
    readonly radiusPercent: number;
    readonly angleDeg: number;
    readonly color?: string;
    readonly onTurn: (card: M3TarotCard) => void;
}> = ({ card, active, radiusPercent, angleDeg, color, onTurn }) => {
    // Start at the top (−90°) and wind clockwise.
    const theta = ((angleDeg - 90) * Math.PI) / 180;
    const left = 50 + Math.cos(theta) * radiusPercent;
    const top = 50 + Math.sin(theta) * radiusPercent;
    const accent = color ?? 'var(--theia-foreground)';

    const style: React.CSSProperties = {
        ...cardBaseStyle,
        left: `${left}%`,
        top: `${top}%`,
        color: accent,
        borderColor: active ? accent : 'var(--theia-contrastBorder)',
        ...(active
            ? {
                background: 'var(--theia-editorWidget-background)',
                boxShadow: `0 0 0 1px ${accent} inset, 0 0 10px ${accent}`,
                fontWeight: 600
            }
            : { background: 'var(--theia-editor-background)' })
    };

    return (
        <button
            type="button"
            className="m3-tarot-wheel-card"
            data-test="m3-tarot-wheel-card"
            data-card-key={card.cardKey}
            data-arcana={card.arcana}
            data-suit={card.suit ?? ''}
            data-element={card.element ?? ''}
            data-active={active ? 'true' : 'false'}
            data-rpc-method={M3_TAROT_SCALAR_REF_RPC}
            aria-pressed={active}
            aria-label={`Turn to ${card.label}`}
            title={card.label}
            onClick={() => onTurn(card)}
            style={style}
        >
            {card.glyph}
        </button>
    );
};

// ============================================================================
// Domain helpers
// ============================================================================

/** Derive luminous card keys from the active projection surface. */
function activeCardKeysFromSurface(surface: M3ProjectionSurface): readonly string[] {
    const projection = surface.activeProjection;
    const keys: string[] = [];
    const single = stringValue(projection.tarotCardKey);
    if (single) {
        keys.push(single);
    }
    const many = projection.tarotCardKeys;
    if (Array.isArray(many)) {
        for (const value of many) {
            const key = stringValue(value);
            if (key && !keys.includes(key)) {
                keys.push(key);
            }
        }
    }
    return keys;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

// ============================================================================
// Geometry — radii expressed as a percentage of the wheel half-extent.
// ============================================================================

const INNER_RADIUS_PERCENT = 30;
const OUTER_RADIUS_PERCENT = 45;

// ============================================================================
// Styles
// ============================================================================

const rootStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 12,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)',
    minWidth: 320
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size2)',
    fontWeight: 600
};

const subtitleStyle: React.CSSProperties = {
    margin: '4px 0 0',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)'
};

const chipStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)',
    whiteSpace: 'nowrap'
};

const wheelStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: 460,
    margin: '0 auto',
    aspectRatio: '1 / 1',
    borderRadius: '50%',
    border: '1px solid var(--theia-contrastBorder)',
    background:
        'radial-gradient(circle at 50% 50%, var(--theia-editor-background) 0%, var(--theia-editorWidget-background) 72%)'
};

const cardBaseStyle: React.CSSProperties = {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    minWidth: 22,
    minHeight: 22,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 4,
    padding: '1px 3px',
    cursor: 'pointer',
    fontFamily: 'var(--theia-monospace-font-family)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--theia-ui-font-size0)',
    lineHeight: 1
};

const hubStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'var(--theia-descriptionForeground)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--theia-ui-font-size1)'
};

const legendStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size0)'
};

const legendItemStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5
};

const legendSwatchStyle: React.CSSProperties = {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: 2
};
