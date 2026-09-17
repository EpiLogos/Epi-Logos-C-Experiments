import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { M3IChingCastRibbon, parseIChingCastRibbonReceipt } from './m3IChingCastRibbon';

const receipt = {
    cast_method: 'three-coin',
    lines: [6, 7, 8, 9, 6, 9],
    primary_hexagram_id: 1,
    derived_hexagram_id: 2,
    changing_line_indices: [0, 3, 4, 5],
    cast_id: 7,
    provenance: 'epi-cli.nara.oracle.iching.three-coin'
};

afterEach(cleanup);

describe('M3IChingCastRibbon', () => {
    it('renders exactly the governed six-line receipt without local derivation', () => {
        render(<M3IChingCastRibbon receipt={parseIChingCastRibbonReceipt(receipt)} pending={false} error={null} onCast={() => undefined} />);
        expect(screen.getByTestId('m3-iching-cast-ribbon').getAttribute('data-state')).toBe('received');
        expect(screen.getAllByTestId('m3-iching-lines')[0].querySelectorAll('[data-line]')).toHaveLength(6);
        expect(screen.getByText('Hex 1 → 2')).toBeTruthy();
    });

    it('fails closed on a non-six-line or unprovenanced receipt', () => {
        expect(() => parseIChingCastRibbonReceipt({ ...receipt, lines: [6, 7] })).toThrow('exactly six');
        expect(() => parseIChingCastRibbonReceipt({ ...receipt, provenance: 'browser-random' })).toThrow('provenance');
    });

    it('renders a cast failure as inline blocked readiness, not a separate error panel', () => {
        render(<M3IChingCastRibbon receipt={null} pending={false} error="oracle unavailable" onCast={() => undefined} />);
        expect(screen.getByTestId('blocked-overlay').textContent).toContain('oracle unavailable');
        expect(screen.queryByTestId('m3-iching-error')).toBeNull();
        expect((screen.getByTestId('m3-iching-cast') as HTMLButtonElement).disabled).toBe(true);
    });
});
