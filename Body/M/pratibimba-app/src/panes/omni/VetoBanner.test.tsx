/**
 * Coordinate: M' `/` membrane (veto banner tests — Track 27.T27.3 / 12.T12.19 / 26.T26.9)
 * Actualises: the veto surface is red + non-blocking (names the SUBAGENT, the
 *   reason, and what was missed, states the human gate still decides) and
 *   renders NOTHING for a disclosure return.
 *
 *   26.T26.9 — the banner text is the tranche's verbatim line, "Aletheia
 *   subagent {name} veto — {reason}". Before this tranche the banner read
 *   "Aletheia veto" with no name, and no test noticed because none asserted the
 *   name: the datum did not exist to assert. The `data-blocking="false"` claim
 *   is asserted on the ELEMENT here, not only in the Atelier's copy, so the two
 *   surfaces of one primitive are both held to 12.19.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { VetoBanner } from './VetoBanner';

afterEach(cleanup);

describe('VetoBanner (12.19 non-blocking veto)', () => {
    it('names the subagent, the reason, what was missed, and the non-blocking notice', () => {
        render(
            <VetoBanner
                facetReturn={{
                    kind: 'veto',
                    facet: 'janus',
                    reason: 'facets not converging',
                    whatIsMissed: 'the drift angle'
                }}
            />
        );
        const banner = screen.getByTestId('aletheia-veto-banner');
        expect(banner.textContent).toContain('Aletheia subagent Janus veto — facets not converging');
        expect(banner.textContent).toContain('the drift angle');
        expect(banner.textContent).toContain('non-blocking');
        expect(banner.getAttribute('data-facet')).toBe('janus');
    });

    it('declares itself NON-BLOCKING on the element (12.19) — the human gate decides', () => {
        render(
            <VetoBanner
                facetReturn={{
                    kind: 'veto',
                    facet: 'anansi',
                    reason: 'citation trail is broken',
                    whatIsMissed: 'the source-to-source hop'
                }}
            />
        );
        expect(screen.getByTestId('aletheia-veto-banner').getAttribute('data-blocking')).toBe(
            'false'
        );
    });

    it('renders nothing for a disclosure return — a disclosure is not a veto', () => {
        const { container } = render(
            <VetoBanner
                facetReturn={{
                    kind: 'disclosure',
                    facet: 'anansi',
                    angle: 'etymological',
                    evidenceRefs: []
                }}
            />
        );
        expect(container.firstChild).toBeNull();
    });
});
