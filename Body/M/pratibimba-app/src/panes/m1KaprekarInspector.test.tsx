/**
 * 22.T22.7 -- Kaprekar 6174 inspector acceptance tests.
 * Exercises the live carrier seams: the tick-store profile window and the
 * registered vault.open command, without a fabricated navigation adapter.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { commands } from '../commands/registry';
import { useTickStore } from '../state/stores';
import {
    KAPREKAR_PEDAGOGY_SEED_PATH,
    M1KaprekarInspector
} from './m1KaprekarInspector';

function primeProfile(position6: number, skeletonEvent: unknown = null): void {
    useTickStore.setState({
        generation: 41,
        profile: {
            generation: 41,
            cachedAtMs: 1,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'safe-public-current-kernel-tick',
            profile: {
                harmonicProfile: {
                    position6,
                    anandaVortex: { activeCellValue: { skeletonEvent } }
                }
            }
        }
    });
}

describe('M1KaprekarInspector (22.T22.7)', () => {
    beforeEach(() => {
        cleanup();
        useTickStore.setState({ generation: null, profile: null });
    });

    afterEach(() => cleanup());

    it('stays absent away from the seven-row trigger without a Kaprekar event', () => {
        primeProfile(0);
        render(<M1KaprekarInspector layoutId="ide-deep" />);
        expect(screen.queryByTestId('m1-kaprekar-inspector')).toBeNull();
    });

    it('renders the lean four-line pedagogy from the live position6 trigger', () => {
        primeProfile(4);
        render(<M1KaprekarInspector layoutId="ide-deep" />);

        expect(screen.getByTestId('m1-kaprekar-inspector')).toBeTruthy();
        expect(screen.getByTestId('m1-kaprekar-line-1').textContent).toContain(
            '6174 = 7² × 9 × 14 = 18 × 7³'
        );
        expect(screen.getByTestId('m1-kaprekar-line-2').textContent).toContain('DIFF_B axiom');
        expect(screen.getByTestId('m1-kaprekar-line-3').textContent).toContain('QL_DIVINE_ACT_RATIO 16/9');
    });

    it('also renders when the bussed Kaprekar skeleton event is present', () => {
        primeProfile(0, 'KaprekarPedagogyHit');
        render(<M1KaprekarInspector layoutId="daily-0-1" />);

        expect(screen.getByTestId('m1-kaprekar-inspector')).toBeTruthy();
        expect(screen.getByTestId('m1-kaprekar-seed-reference').getAttribute('title')).toBe(
            KAPREKAR_PEDAGOGY_SEED_PATH
        );
    });

    it('opens the canonical pedagogy seed through the carrier vault command in ide-deep', async () => {
        primeProfile(4);
        const opened: unknown[] = [];
        const dispose = commands.register({
            id: 'vault.open',
            title: 'Vault: Open file',
            run: path => {
                opened.push(path);
            }
        });
        try {
            render(<M1KaprekarInspector layoutId="ide-deep" />);
            fireEvent.click(screen.getByTestId('m1-kaprekar-seed-button'));
            await waitFor(() => expect(opened).toEqual([KAPREKAR_PEDAGOGY_SEED_PATH]));
        } finally {
            dispose();
        }
    });
});
