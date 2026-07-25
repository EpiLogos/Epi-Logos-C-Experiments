/**
 * Coordinate: M' M4' (status-bar privacy discipline — 25.T25.18, DR-WC-M4-5)
 * Residency: Body/M/pratibimba-app/src/ui/privacyChromeStatusBar.test.tsx
 * Actualises: the 25.18 brief's fourth verification item — "status-bar
 *   discipline test confirms no privacy-class entry leaks into 15.10's status
 *   bar" — against the RENDERED strip. This is the whole point of DR-WC-M4-5's
 *   recommendation: the privacy indicator belongs on each surface's own chrome
 *   precisely BECAUSE 15.10 pins the status bar to exactly six state threads,
 *   so a seventh privacy entry would break a different ratified contract.
 *
 *   Asserted by mounting, not by grepping the source. "No privacy entry in the
 *   status bar" is a claim about what renders; a source scan for the class name
 *   would pass just as happily if the strip rendered one through a variable.
 * Does NOT own: the six-thread count itself (ui/shellSlotPolicy.ts + its test),
 *   the tint register (ui/privacyChrome.ts).
 */

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { StatusStrip } from '../components/StatusStrip';
import { PRIVACY_CLASSES, PRIVACY_TINT_CLASS } from './privacyChrome';
import { STATE_THREAD_COUNT } from './shellSlotPolicy';

afterEach(cleanup);

describe('25.T25.18 — the privacy indicator stays OFF the status bar (15.10)', () => {
    it('renders no privacy tint anywhere in the live status strip', () => {
        const { container } = render(<StatusStrip />);
        for (const privacyClass of PRIVACY_CLASSES) {
            const tint = PRIVACY_TINT_CLASS[privacyClass];
            expect(
                container.querySelectorAll(`.${tint}`).length,
                `${tint} leaked into the status bar — 15.10 admits exactly ${STATE_THREAD_COUNT} entries`
            ).toBe(0);
        }
        expect(container.querySelectorAll('[class*="mext-privacy-"]').length).toBe(0);
    });

    it('the strip still renders its six state threads, so the check is not vacuous', () => {
        const { container } = render(<StatusStrip />);
        const threads = container.querySelectorAll('[data-testid^="status-"]');
        expect(threads.length, 'a strip that rendered nothing would pass the tint check trivially')
            .toBeGreaterThanOrEqual(STATE_THREAD_COUNT);
    });
});
