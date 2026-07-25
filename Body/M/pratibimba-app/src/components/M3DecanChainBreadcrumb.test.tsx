import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { M3DecanChainBreadcrumb } from './M3DecanChainBreadcrumb';
import type { TarotDecanChain } from '../services/m3/TarotDecanService';

function chain(overrides: Partial<TarotDecanChain> = {}): TarotDecanChain {
    return {
        card: 'wands:ace',
        suit: 'wands',
        codonId: 31,
        decanIndex: 12,
        zodiacSign: 9,
        rulingPlanet: 3,
        elementId: 2,
        chakraId: 4,
        bodyZones: ['throat', 'neck'],
        decanBodyPart: 'neck',
        decanHerbs: ['sage'],
        ...overrides
    };
}

describe('M3DecanChainBreadcrumb', () => {
    afterEach(cleanup);

    it('renders all nine chips resolved when the service returns a full chain', () => {
        render(<M3DecanChainBreadcrumb card="wands:ace" chain={chain()} />);

        const surface = screen.getByTestId('decan-chain-breadcrumb');
        expect(surface.getAttribute('data-chain-state')).toBe('ready');
        expect(surface.getAttribute('data-resolved-count')).toBe('9');
        expect(surface.querySelectorAll('[data-decan-chain-chip]').length).toBe(9);
        expect(surface.querySelectorAll('[data-decan-chain-chip][data-state="pending"]').length).toBe(0);
        expect(screen.queryByTestId('pending-codon')).toBeNull();

        // authority values render verbatim (no re-derivation)
        expect(screen.getByTestId('decan-chain-chip-card').textContent).toContain('Ace of Wands');
        expect(screen.getByTestId('decan-chain-chip-codon').textContent).toContain('0x1F');
        expect(screen.getByTestId('decan-chain-chip-decan').textContent).toContain('#12');
        expect(screen.getByTestId('decan-chain-chip-body-zones').textContent).toContain('throat, neck');
    });

    it('shows honest-pending chips for the protected links when the chain is pending', () => {
        render(<M3DecanChainBreadcrumb card="wands:ace" chain={{ pending: 's2-decan-chain' }} />);

        const surface = screen.getByTestId('decan-chain-breadcrumb');
        expect(surface.getAttribute('data-chain-state')).toBe('pending');
        // only the locally-knowable head (card + suit) resolves; the other seven pend
        expect(surface.getAttribute('data-resolved-count')).toBe('2');
        expect(screen.getByTestId('decan-chain-chip-card').textContent).toContain('Ace of Wands');
        expect(screen.getByTestId('decan-chain-chip-suit').textContent).toContain('Wands');
        for (const step of ['codon', 'decan', 'sign', 'planet', 'element', 'chakra', 'body-zones']) {
            expect(screen.getByTestId(`pending-${step}`)).toBeTruthy();
        }
    });

    it('leaves the suit pending too for a major-arcana trump with no chain', () => {
        render(<M3DecanChainBreadcrumb card="major:0" chain={null} />);

        const surface = screen.getByTestId('decan-chain-breadcrumb');
        expect(surface.getAttribute('data-resolved-count')).toBe('1');
        expect(screen.getByTestId('decan-chain-chip-card').textContent).toContain('Atu 0');
        expect(screen.getByTestId('pending-suit')).toBeTruthy();
    });

    it('surfaces the corresponding sub-panel when a chip is clicked', () => {
        const onChipClick = vi.fn();
        render(<M3DecanChainBreadcrumb card="wands:ace" chain={chain()} onChipClick={onChipClick} />);

        fireEvent.click(screen.getByTestId('decan-chain-chip-body-zones'));
        expect(onChipClick).toHaveBeenCalledWith('body-zones');

        fireEvent.click(screen.getByTestId('decan-chain-chip-chakra'));
        expect(onChipClick).toHaveBeenCalledWith('chakra');
    });
});
