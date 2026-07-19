/**
 * Coordinate: M' M2' (MEF matrix grid behavioral test — Track 23.T23.2)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): M2' Layer A visual-contract proof.
 * Actualises: the mounted 12x7 scaffold, 12x6 MEF overlay, profile-driven
 *   active cell, octet authority, and Klein halo inversion.
 * Public surface: MefGrid72Component behavior.
 * Does NOT own: MEF address law, profile production, or a local animation clock.
 * Contract: [[M2'-SPEC]] and rerun tranche [[23.T23.2]].
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MefGrid72Component } from './MefGrid72Component';

const ACTIVE_MEF = {
    lens: 7,
    position: 4,
    isInverted: true,
    lFamilyLink: 1
};

afterEach(cleanup);

describe('MefGrid72Component (23.T23.2)', () => {
    it('renders the 12x7 scaffold, 72 decoded MEF cells, and the profile-owned active halo', () => {
        render(
            <MefGrid72Component
                activeMef={ACTIVE_MEF}
                audioOctet={[261.6, 294.3, 327, 348.8, 392.4, 436, 490.5, 523.2]}
                kleinFlip={false}
            />
        );

        const grid = screen.getByTestId('m2-mef-grid');
        expect(screen.getAllByRole('gridcell')).toHaveLength(84);
        expect(grid.querySelectorAll('[data-active-mef="true"]')).toHaveLength(72);
        expect(grid.querySelectorAll('[data-active-mef="false"]')).toHaveLength(12);
        expect(screen.getByTestId('m2-mef-cell-7-4').getAttribute('data-current')).toBe('true');
        expect(screen.getByTestId('m2-mef-cell-7-4').getAttribute('data-halo-hz')).toBe('261.6');
        expect(screen.getByTestId('m2-mef-cell-7-4').textContent).toContain('L7');
        expect(screen.getAllByTestId('m2-mef-tritone-arc')).toHaveLength(6);
        expect(screen.getAllByTestId('m2-mef-tritone-arc')[4].getAttribute('data-bright')).toBe('true');
    });

    it('swaps the warm/cool helix halo only when the profile carries a Klein flip', () => {
        const { rerender } = render(
            <MefGrid72Component activeMef={ACTIVE_MEF} audioOctet={null} kleinFlip={false} />
        );
        expect(screen.getByTestId('m2-mef-cell-0-0').getAttribute('data-halo')).toBe('warm');
        expect(screen.getByTestId('m2-mef-cell-7-4').getAttribute('data-halo')).toBe('cool');

        rerender(<MefGrid72Component activeMef={ACTIVE_MEF} audioOctet={null} kleinFlip />);
        expect(screen.getByTestId('m2-mef-cell-0-0').getAttribute('data-halo')).toBe('cool');
        expect(screen.getByTestId('m2-mef-cell-7-4').getAttribute('data-halo')).toBe('warm');
    });
});
