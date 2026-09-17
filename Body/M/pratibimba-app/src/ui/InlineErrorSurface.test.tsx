// @vitest-environment jsdom
/**
 * Coordinate: M' shell (error UX surfaces — Track 32.T32.7)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the render half of 32.7 — the inline error surface's four
 *   affordances, the readiness banner's new retry/recovery pair, and the two
 *   live paths whose condition is easiest to state exactly (a bridge refusal at
 *   the try-it seam, and kairos-enabled-with-no-PASU on the M4 empty state).
 *
 *   Every deep-link assertion goes through the REAL command registry rather
 *   than a mocked `execute`: a spy on a mock proves the caller talks to the
 *   mock. Here a real handler is registered under the real id and the test
 *   asserts it ran, so the button is held to the id the carrier really
 *   registers.
 *
 *   The e2e half (tests/e2e/error-ux-grammar.spec.ts) is what actually closes
 *   this UF-class tranche; this file is the fast contract underneath it.
 * Does NOT own: the grammar table (errorUxGrammar.test.ts), the taxonomy
 *   (bridgeReadiness), the empty-state shape (mExtensionEmptyStates.test.tsx).
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { commands } from '../commands/registry';
import { setGateway } from '../bridge/gatewayHolder';
import type { GatewayClient } from '../bridge/gatewayClient';
import { TryItAffordance } from '../panes/omni/gateway/TryItAffordance';
import { KAIROS_ENABLED_PREFERENCE } from '../panes/kairosEnablement';
import { MExtensionEmptyState } from './mExtensionEmptyStates';
import { DIAGNOSTICS_DEEP_LINK, PASU_ABSENT_KAIROS_WARNING } from './errorUxGrammar';
import { InlineErrorSurface } from './InlineErrorSurface';
import { ReadinessBanner } from './ReadinessBanner';

/** Register a real handler under a real catalogued id and report whether the
 *  click reached it. The registry is the carrier's own, not a double. */
function watchCommand(id: string): { readonly calls: () => number; dispose(): void } {
    let calls = 0;
    const dispose = commands.register({ id, title: `test: ${id}`, run: () => void (calls += 1) });
    return { calls: () => calls, dispose };
}

const disposers: (() => void)[] = [];

afterEach(() => {
    cleanup();
    while (disposers.length > 0) {
        disposers.pop()?.();
    }
    setGateway(null);
    localStorage.clear();
});

describe('InlineErrorSurface — the 32.7 inline error surface (spec :215-224)', () => {
    it('renders the message, retry, Diagnostics deep-link and dismiss', () => {
        const retry = vi.fn();
        const dismiss = vi.fn();
        render(
            <InlineErrorSurface
                surfaceId="test.surface"
                message="gateway refused: unimplemented"
                onRetry={retry}
                onDismiss={dismiss}
            />
        );

        const surface = screen.getByTestId('inline-error-surface');
        expect(surface.getAttribute('data-error-path')).toBe('runtime-bridge-call');
        expect(surface.getAttribute('data-surface')).toBe('test.surface');
        expect(surface.getAttribute('role')).toBe('alert');
        expect(screen.getByTestId('inline-error-surface-message').textContent).toBe(
            'gateway refused: unimplemented'
        );

        fireEvent.click(screen.getByTestId('inline-error-surface-retry'));
        expect(retry).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByTestId('inline-error-surface-dismiss'));
        expect(dismiss).toHaveBeenCalledTimes(1);
    });

    it('fires the REAL Diagnostics command the taxonomy declares', () => {
        const watcher = watchCommand(DIAGNOSTICS_DEEP_LINK.commandId as string);
        disposers.push(() => watcher.dispose());
        render(<InlineErrorSurface surfaceId="test.surface" message="boom" />);

        const button = screen.getByTestId('inline-error-surface-diagnostics');
        expect(button.getAttribute('data-command')).toBe(DIAGNOSTICS_DEEP_LINK.commandId);
        fireEvent.click(button);
        expect(watcher.calls()).toBe(1);
    });

    it('offers no retry when the caller cannot re-issue the call', () => {
        render(<InlineErrorSurface surfaceId="test.surface" message="boom" />);
        expect(screen.queryByTestId('inline-error-surface-retry')).toBeNull();
        expect(screen.queryByTestId('inline-error-surface-dismiss')).toBeNull();
    });

    it('is NOT a modal — no dialog role, no portal, no aria-modal', () => {
        const { container } = render(
            <div data-testid="host">
                <InlineErrorSurface surfaceId="test.surface" message="boom" />
            </div>
        );
        const surface = screen.getByTestId('inline-error-surface');
        // It renders INSIDE its host, not hoisted to body — the tab is the surface.
        expect(container.querySelector('[data-testid="host"]')!.contains(surface)).toBe(true);
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(surface.getAttribute('aria-modal')).toBeNull();
    });

    it('suppresses the Diagnostics route for a failure that never reached the bridge', () => {
        render(<InlineErrorSurface surfaceId="test.surface" message="invalid JSON" diagnostics={false} />);
        expect(screen.queryByTestId('inline-error-surface-diagnostics')).toBeNull();
    });
});

describe('ReadinessBanner — the 32.7 retry + recovery affordances (spec :211-213)', () => {
    it('renders Retry only when a retry is supplied, and fires it', () => {
        const retry = vi.fn();
        const { unmount } = render(<ReadinessBanner state="bridge_unavailable" reason="no bridge" />);
        expect(screen.queryByTestId('readiness-banner-retry')).toBeNull();
        unmount();

        render(<ReadinessBanner state="bridge_unavailable" reason="no bridge" onRetry={retry} />);
        fireEvent.click(screen.getByTestId('readiness-banner-retry'));
        expect(retry).toHaveBeenCalledTimes(1);
    });

    it('routes a bridge_unavailable banner to Diagnostics through the real command', () => {
        const watcher = watchCommand(DIAGNOSTICS_DEEP_LINK.commandId as string);
        disposers.push(() => watcher.dispose());
        render(<ReadinessBanner state="bridge_unavailable" reason="no bridge" />);
        const button = screen.getByTestId('readiness-banner-recovery');
        expect(button.textContent).toBe('Open Diagnostics');
        fireEvent.click(button);
        expect(watcher.calls()).toBe(1);
    });

    it('renders NO recovery where the taxonomy has none, and none for a producer it does not know', () => {
        // `degraded_but_readable` has nothing to recover — the datum renders.
        const { unmount } = render(
            <ReadinessBanner state="degraded_but_readable" reason="read-only" />
        );
        expect(screen.queryByTestId('readiness-banner-recovery')).toBeNull();
        unmount();

        // A named-producer pending state is outside the nine; the taxonomy has
        // no route for it, so inventing one would be a fabricated deep-link.
        render(<ReadinessBanner state="pending-kairos" reason="no kairos snapshot" />);
        expect(screen.queryByTestId('readiness-banner-recovery')).toBeNull();
    });
});

describe('path 1 live — a real gateway refusal at the try-it seam', () => {
    function gatewayRefusing(message: string): void {
        setGateway({
            connected: true,
            invoke: () => Promise.reject(new Error(message))
        } as unknown as GatewayClient);
    }

    it('renders the refusal verbatim in the inline surface, with retry + Diagnostics', async () => {
        gatewayRefusing('unimplemented: nara.kairos.probe_kerykeion');
        render(<TryItAffordance capabilityName="nara.kairos.probe_kerykeion" />);
        fireEvent.click(screen.getByTestId('try-it-toggle'));
        fireEvent.click(screen.getByTestId('try-it-run'));

        const surface = await screen.findByTestId('try-it-error');
        expect(surface.getAttribute('data-error-path')).toBe('runtime-bridge-call');
        expect(surface.getAttribute('data-surface')).toBe(
            'gateway.try-it:nara.kairos.probe_kerykeion'
        );
        expect(screen.getByTestId('try-it-error-message').textContent).toBe(
            'unimplemented: nara.kairos.probe_kerykeion'
        );
        expect(screen.getByTestId('try-it-error-diagnostics')).toBeTruthy();

        // Retry re-issues the REAL call; dismiss clears the surface.
        fireEvent.click(screen.getByTestId('try-it-error-retry'));
        expect(await screen.findByTestId('try-it-error')).toBeTruthy();
        fireEvent.click(screen.getByTestId('try-it-error-dismiss'));
        expect(screen.queryByTestId('try-it-error')).toBeNull();
    });

    it('keeps a client-side refusal off the Diagnostics route — it never reached the bridge', () => {
        gatewayRefusing('never called');
        render(<TryItAffordance capabilityName="chat.send" />);
        fireEvent.click(screen.getByTestId('try-it-toggle'));
        fireEvent.change(screen.getByTestId('try-it-params'), { target: { value: '{ not json' } });
        fireEvent.click(screen.getByTestId('try-it-run'));

        expect(screen.getByTestId('try-it-error-message').textContent).toContain('invalid JSON');
        expect(screen.queryByTestId('try-it-error-diagnostics')).toBeNull();
    });
});

describe('path 4 live — PASU absent while kairos is enabled (spec :230)', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('warns in the grammar’s own words and routes to the real 25.4 wizard', () => {
        const watcher = watchCommand('identity.openWizard');
        disposers.push(() => watcher.dispose());
        localStorage.setItem(KAIROS_ENABLED_PREFERENCE, JSON.stringify(true));

        render(<MExtensionEmptyState extensionId="m4-nara" viewId="journal" />);
        const notice = screen.getByTestId('mext-empty-state-notice-pasu-absent-kairos');
        expect(notice.textContent).toContain(PASU_ABSENT_KAIROS_WARNING);
        // It REPLACES the softer incomplete notice rather than stacking on it.
        expect(screen.queryByTestId('mext-empty-state-notice-pasu-incomplete')).toBeNull();

        fireEvent.click(screen.getByTestId('mext-empty-state-notice-pasu-absent-kairos-link'));
        expect(watcher.calls()).toBe(1);
    });

    it('stays silent while kairos is off — FR-3 default is not a misconfiguration', () => {
        render(<MExtensionEmptyState extensionId="m4-nara" viewId="journal" />);
        expect(screen.queryByTestId('mext-empty-state-notice-pasu-absent-kairos')).toBeNull();
    });
});
