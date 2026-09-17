/** Rendered carrier proof for Kairos onboarding - 32.T32.10. */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { KairosEnablementPane } from './KairosEnablementPane';
import {
    KAIROS_SKIP_STEP,
    ONBOARDING_COMPLETED_STEPS_PREFERENCE
} from './kairosEnablement';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('KairosEnablementPane', () => {
    it('walks the exact three-card privacy sequence and records a real browser skip', () => {
        render(<KairosEnablementPane />);

        expect(screen.getByTestId('kairos-card').textContent).toContain('What kairos is');
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByTestId('kairos-card').textContent).toContain('Privacy + dependency');
        expect(screen.getByTestId('kairos-card').textContent).toContain('birth data (PASU.md) stays local');
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByTestId('kairos-card').textContent).toContain('Enable or skip');

        fireEvent.click(screen.getByRole('button', { name: 'Continue without kairos' }));
        expect(screen.getByTestId('kairos-relay').textContent).toContain('Kairos disabled');
        expect(JSON.parse(localStorage.getItem(ONBOARDING_COMPLETED_STEPS_PREFERENCE) ?? '[]'))
            .toEqual([KAIROS_SKIP_STEP]);
    });
});
