/**
 * Coordinate: M' M3' (tarot wheel tests — Track 24.T24.6)
 * Actualises: the tranche's verification as behavioral tests — 22 + 56 cards
 *   render, the bussed major and minor ids light their cards, suits carry their
 *   element, a STOP codon reads as an ANSWER rather than an absence, and
 *   turning a card hands up the exact key the gateway scalar-ref read takes.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    M3TarotWheel,
    M3_TAROT_WHEEL_WIDGET_ID,
    minorCardIdFromRef,
    minorRefFromCardId,
    readArcanaState,
    TAROT_MAJOR_COUNT,
    TAROT_MINOR_COUNT,
    tarotCardKeyString,
    tarotCardLabel,
    type M3ArcanaState
} from './M3TarotWheel';

const PENDING_MAJOR: M3ArcanaState = {
    kind: 'pending',
    reason: 'pending-profile-field:mahamaya.tarotMajorArcanaCardId'
};

afterEach(cleanup);

describe('deck arithmetic', () => {
    it('decomposes the 56-card cover into four arcs of fourteen, kernel suit order', () => {
        // Provenance: portal-core `m3_transcription_bridge::suit_name` /
        // epi-lib `m3.c SUIT_NAMES[4]` = Cups · Wands · Pentacles · Swords, and
        // `portal-core/tests/tarot_arcana_profile_field.rs::
        // the_fifty_six_card_ring_is_four_arcs_of_fourteen_in_suit_order`
        // pins the same ordering on the substrate side.
        expect(minorRefFromCardId(0)).toEqual({ suit: 'cups', rank: 1 });
        expect(minorRefFromCardId(13)).toEqual({ suit: 'cups', rank: 14 });
        expect(minorRefFromCardId(14)).toEqual({ suit: 'wands', rank: 1 });
        expect(minorRefFromCardId(28)).toEqual({ suit: 'pentacles', rank: 1 });
        expect(minorRefFromCardId(42)).toEqual({ suit: 'swords', rank: 1 });
        expect(minorRefFromCardId(55)).toEqual({ suit: 'swords', rank: 14 });
        expect(minorRefFromCardId(56)).toBeNull();
        expect(minorRefFromCardId(-1)).toBeNull();
    });

    it('round-trips card id ↔ {suit, rank} across the whole deck', () => {
        for (let cardId = 0; cardId < TAROT_MINOR_COUNT; cardId++) {
            const ref = minorRefFromCardId(cardId);
            expect(ref).not.toBeNull();
            expect(minorCardIdFromRef(ref!)).toBe(cardId);
        }
    });

    it('serialises card keys the way the scalar-ref read parses them', () => {
        expect(tarotCardKeyString({ kind: 'major', id: 0 })).toBe('major:0');
        expect(tarotCardKeyString({ kind: 'minor', suit: 'wands', rank: 1 })).toBe('wands:ace');
        expect(tarotCardKeyString({ kind: 'minor', suit: 'cups', rank: 7 })).toBe('cups:07');
        expect(tarotCardKeyString({ kind: 'minor', suit: 'swords', rank: 14 })).toBe('swords:king');
        expect(tarotCardLabel({ kind: 'minor', suit: 'pentacles', rank: 9 })).toBe(
            'Nine of Pentacles'
        );
    });
});

describe('readArcanaState', () => {
    it('keeps "no card" and "no field" apart', () => {
        expect(
            readArcanaState(undefined, { max: 22, pendingReason: 'p', noArcanaReason: 'n' })
        ).toEqual({ kind: 'pending', reason: 'p' });
        expect(
            readArcanaState(null, { max: 22, pendingReason: 'p', noArcanaReason: 'n' })
        ).toEqual({ kind: 'no-arcana', reason: 'n' });
        expect(
            readArcanaState(14, { max: 22, pendingReason: 'p', noArcanaReason: 'n' })
        ).toEqual({ kind: 'card', cardId: 14 });
        // Out of range is a broken producer, not a card — refuse it.
        expect(
            readArcanaState(22, { max: 22, pendingReason: 'p', noArcanaReason: 'n' })
        ).toEqual({ kind: 'pending', reason: 'p' });
    });
});

describe('M3TarotWheel', () => {
    it('renders 22 major + 56 minor cards', () => {
        render(
            <M3TarotWheel majorArcana={PENDING_MAJOR} minorArcana={PENDING_MAJOR} onTurn={vi.fn()} />
        );
        expect(screen.getByTestId('m3-tarot-wheel').getAttribute('data-widget-id')).toBe(
            M3_TAROT_WHEEL_WIDGET_ID
        );
        expect(screen.getAllByTestId(/^m3-tarot-major-\d+$/)).toHaveLength(TAROT_MAJOR_COUNT);
        expect(screen.getAllByTestId(/^m3-tarot-minor-\d+$/)).toHaveLength(TAROT_MINOR_COUNT);
        expect(screen.getByTestId('m3-tarot-counts').textContent).toBe('22 + 56');
    });

    it('colours each suit by its element and lights the bussed cards', () => {
        render(
            <M3TarotWheel
                majorArcana={{ kind: 'card', cardId: 14 }}
                minorArcana={{ kind: 'card', cardId: 30 }}
                onTurn={vi.fn()}
            />
        );
        expect(screen.getByTestId('m3-tarot-major-14').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('m3-tarot-major-13').getAttribute('data-active')).toBe('false');
        expect(screen.getByTestId('m3-tarot-minor-30').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('m3-tarot-minor-30').getAttribute('data-suit')).toBe('pentacles');

        expect(screen.getByTestId('m3-tarot-minor-0').getAttribute('data-element')).toBe('Water');
        expect(screen.getByTestId('m3-tarot-minor-14').getAttribute('data-element')).toBe('Fire');
        expect(screen.getByTestId('m3-tarot-minor-28').getAttribute('data-element')).toBe('Earth');
        expect(screen.getByTestId('m3-tarot-minor-42').getAttribute('data-element')).toBe('Air');
        // Four suits, four distinct element colours — no single flat fill.
        const fills = [0, 14, 28, 42].map(
            id => screen.getByTestId(`m3-tarot-minor-${id}`).getAttribute('fill')
        );
        expect(new Set(fills).size).toBe(4);

        expect(screen.getByTestId('m3-tarot-major-readout').textContent).toContain('Atu 14');
        expect(screen.getByTestId('m3-tarot-minor-readout').textContent).toContain(
            'Three of Pentacles'
        );
    });

    it('renders a STOP codon as an answer, not as a missing producer', () => {
        render(
            <M3TarotWheel
                majorArcana={{ kind: 'no-arcana', reason: 'no-major-arcana:stop-codon' }}
                minorArcana={PENDING_MAJOR}
                onTurn={vi.fn()}
            />
        );
        const wheel = screen.getByTestId('m3-tarot-wheel');
        expect(wheel.getAttribute('data-major-state')).toBe('no-arcana');
        expect(screen.getByTestId('m3-tarot-major-readout').textContent).toContain(
            'no-major-arcana:stop-codon'
        );
        expect(
            screen.getAllByTestId(/^m3-tarot-major-\d+$/).some(
                node => node.getAttribute('data-active') === 'true'
            )
        ).toBe(false);
    });

    it('hands the turned card up as a key — the pane dispatches, the wheel does not', () => {
        const onTurn = vi.fn();
        render(
            <M3TarotWheel majorArcana={PENDING_MAJOR} minorArcana={PENDING_MAJOR} onTurn={onTurn} />
        );
        fireEvent.click(screen.getByTestId('m3-tarot-minor-14'));
        expect(onTurn).toHaveBeenCalledWith({ kind: 'minor', suit: 'wands', rank: 1 });

        fireEvent.click(screen.getByTestId('m3-tarot-major-3'));
        expect(onTurn).toHaveBeenCalledWith({ kind: 'major', id: 3 });

        expect(screen.getByTestId('m3-tarot-wheel').getAttribute('data-rpc-method')).toBe(
            's2.codon.scalar_ref.read'
        );
    });

    it('renders the gateway turn answer verbatim, including an unresolved one', () => {
        render(
            <M3TarotWheel
                majorArcana={PENDING_MAJOR}
                minorArcana={PENDING_MAJOR}
                onTurn={vi.fn()}
                turnState={{
                    card: { kind: 'minor', suit: 'wands', rank: 9 },
                    status: 'unresolved',
                    detail: 'no scalar tarot producer has landed (owner 24.T24.6)'
                }}
            />
        );
        const readout = screen.getByTestId('m3-tarot-turn-readout');
        expect(readout.getAttribute('data-turn-status')).toBe('unresolved');
        expect(readout.getAttribute('data-turn-card')).toBe('wands:09');
        expect(readout.textContent).toContain('no scalar tarot producer has landed');
    });
});
