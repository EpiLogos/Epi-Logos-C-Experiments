import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EpogdoonProofOverlay } from './EpogdoonProofOverlay';

describe('EpogdoonProofOverlay', () => {
    afterEach(cleanup);

    it('gates the proof identity by the debug query or persisted M2 preference', () => {
        const { rerender } = render(
            <EpogdoonProofOverlay
                address72={17}
                generation={41}
                locationSearch="?epi-debug=other"
                developerMode={false}
            />
        );

        expect(screen.queryByTestId('epogdoon-proof-identity')).toBeNull();

        rerender(
            <EpogdoonProofOverlay
                address72={17}
                generation={41}
                locationSearch="?epi-debug=m2-proof"
                developerMode={false}
            />
        );
        expect(screen.getByTestId('epogdoon-proof-identity').textContent).toBe('7/4 = (72 - 9) / 36');

        rerender(
            <EpogdoonProofOverlay address72={17} generation={41} locationSearch="" developerMode />
        );
        expect(screen.getByTestId('epogdoon-proof-identity')).toBeTruthy();
    });

    it('decomposes the active address and fires the bloom on each ninth profile tick', () => {
        const { rerender } = render(
            <EpogdoonProofOverlay address72={17} generation={100} developerMode />
        );

        expect(screen.getByTestId('epogdoon-address-decomposition').textContent).toContain('17 = 9 x 1 + 8');
        expect(screen.getByTestId('epogdoon-proof-overlay').getAttribute('data-tick-counter')).toBe('0');
        expect(screen.getByTestId('epogdoon-compression-bloom').getAttribute('data-firing')).toBe('true');

        rerender(<EpogdoonProofOverlay address72={18} generation={109} developerMode />);
        expect(screen.getByTestId('epogdoon-address-decomposition').textContent).toContain('18 = 9 x 2 + 0');
        expect(screen.getByTestId('epogdoon-proof-overlay').getAttribute('data-tick-counter')).toBe('9');
        expect(screen.getByTestId('epogdoon-compression-bloom').getAttribute('data-firing')).toBe('true');
        expect(screen.getByTestId('epogdoon-compression-bloom').getAttribute('data-epoch')).toBe('1');

        rerender(<EpogdoonProofOverlay address72={27} generation={118} developerMode />);
        expect(screen.getByTestId('epogdoon-proof-overlay').getAttribute('data-tick-counter')).toBe('18');
        expect(screen.getByTestId('epogdoon-compression-bloom').getAttribute('data-firing')).toBe('true');
        expect(screen.getByTestId('epogdoon-compression-bloom').getAttribute('data-epoch')).toBe('2');
    });
});
