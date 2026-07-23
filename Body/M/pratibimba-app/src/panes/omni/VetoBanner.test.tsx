/**
 * Coordinate: M' `/` membrane (veto banner tests — Track 27.T27.3 / 12.T12.19)
 * Actualises: the veto surface is red + non-blocking (names reason + what was
 *   missed, states the human gate still decides) and renders NOTHING for a
 *   disclosure return.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { VetoBanner } from './VetoBanner';

afterEach(cleanup);

describe('VetoBanner (12.19 non-blocking veto)', () => {
    it('renders the reason + what was missed + the non-blocking notice for a veto', () => {
        render(
            <VetoBanner
                facetReturn={{ kind: 'veto', reason: 'facets not converging', whatIsMissed: 'the drift angle' }}
            />
        );
        const banner = screen.getByTestId('aletheia-veto-banner');
        expect(banner.textContent).toContain('facets not converging');
        expect(banner.textContent).toContain('the drift angle');
        expect(banner.textContent).toContain('non-blocking');
    });

    it('renders nothing for a disclosure return — a disclosure is not a veto', () => {
        const { container } = render(
            <VetoBanner facetReturn={{ kind: 'disclosure', angle: 'etymological', evidenceRefs: [] }} />
        );
        expect(container.firstChild).toBeNull();
    });
});
