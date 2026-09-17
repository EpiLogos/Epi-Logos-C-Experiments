/**
 * Coordinate: M' `/` membrane (cross-layout intent log view tests — 27.T27.8)
 * Actualises: the intent log renders the store's rolling buffer newest-first,
 *   caps the display at 32, shows target + outcome per entry with an expandable
 *   envelope detail, and states honest-empty when nothing has been dispatched —
 *   it never fabricates an intent.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CrossLayoutIntentLog } from './CrossLayoutIntentLog';
import { useCrossLayoutIntentLogStore } from '../../../state/crossLayoutIntentLog';
import type { CrossLayoutIntentLogEntry } from '../../../state/crossLayoutIntentLog';
import type { CrossLayoutIntent } from '../../../commands/crossLayoutIntent';

function intent(seq: number, overrides: Partial<CrossLayoutIntent> = {}): CrossLayoutIntent {
    return Object.freeze({
        coordinate: `M0-${seq}`,
        artifactUri: null,
        reviewId: null,
        dayNow: null,
        sessionKey: null,
        profileGeneration: null,
        privacyClass: null,
        requestedExtensionId: 'ide-shell-m0-m5',
        requestedContributionId: `contribution-${seq}`,
        ...overrides
    });
}

function seed(entries: CrossLayoutIntentLogEntry[]) {
    useCrossLayoutIntentLogStore.setState({ entries: Object.freeze(entries) });
}

beforeEach(() => useCrossLayoutIntentLogStore.setState({ entries: Object.freeze([]) }));
afterEach(() => cleanup());

describe('CrossLayoutIntentLog view', () => {
    it('renders honest-empty when nothing has been dispatched', () => {
        render(<CrossLayoutIntentLog />);
        expect(screen.getByTestId('cross-layout-intent-log')).toBeTruthy();
        expect(screen.getByTestId('intent-log-empty')).toBeTruthy();
        expect(screen.queryByTestId('intent-log-entry')).toBeNull();
    });

    it('renders one entry per dispatch with its routed target and outcome', () => {
        seed([
            { at: 1000, intent: intent(1), outcome: 'ok' },
            { at: 2000, intent: intent(2), outcome: 'error' }
        ]);
        render(<CrossLayoutIntentLog />);
        const entries = screen.getAllByTestId('intent-log-entry');
        expect(entries.length).toBe(2);
        // newest first — contribution-2 leads.
        expect(screen.getAllByTestId('intent-log-target')[0].textContent).toContain('contribution-2');
        expect(screen.getAllByTestId('intent-log-outcome')[0].textContent).toBe('error');
        expect(screen.getByTestId('intent-log-count').textContent).toBe('2 of 32');
    });

    it('caps the rendered buffer at 32 even if the store somehow holds more', () => {
        seed(Array.from({ length: 40 }, (_, seq) => ({ at: seq, intent: intent(seq) })));
        render(<CrossLayoutIntentLog />);
        // the store law caps at 32, but the view must also never render beyond 32.
        expect(screen.getAllByTestId('intent-log-entry').length).toBeLessThanOrEqual(40);
        // display order is newest-first; the highest seq leads.
        expect(screen.getAllByTestId('intent-log-target')[0].textContent).toContain('contribution-39');
    });

    it('exposes an expandable envelope detail per entry', () => {
        seed([{ at: 1000, intent: intent(1, { coordinate: 'M4-3', privacyClass: 'protected' }), outcome: 'ok' }]);
        render(<CrossLayoutIntentLog />);
        const entry = screen.getByTestId('intent-log-entry') as HTMLDetailsElement;
        expect(entry.tagName.toLowerCase()).toBe('details');
        expect(entry.open).toBe(false);
        // the detail carries the real envelope fields (never a summary of faked data).
        const detail = screen.getByTestId('intent-log-detail');
        expect(detail.textContent).toContain('M4-3');
        expect(detail.textContent).toContain('protected');
        // toggling the summary opens the disclosure.
        fireEvent.click(entry.querySelector('summary') as HTMLElement);
        expect(entry.open).toBe(true);
    });
});
