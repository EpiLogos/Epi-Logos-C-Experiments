/**
 * Coordinate: M' shell (per-readiness-state UX grammar, real-browser proof —
 *   Track 32.T32.5, UF class)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #4 — the render-time context frame, proven where it renders
 * Actualises: the app-flow proof that the grammar is not merely declared. Track
 *   32 is UF class, and a jsdom mount cannot show that the state class actually
 *   reaches the DOM of the running app — only the real surface can.
 *
 *   The proof rides badges the app genuinely renders rather than states this
 *   spec induces: the M3 walk navigator's `cosmicClock.walks` binding is
 *   unreported by the live gateway, so it resolves `bridge_unavailable` for
 *   real (24.T24.4 already depends on exactly that), and the sweep then holds
 *   every readiness node the face happens to render to the same law.
 *
 *   It also carries a real NEGATIVE: profile ticks are flowing by this point,
 *   so `pending_first_tick` must NOT fire on that shell. A flavour that fired
 *   on every bridge_unavailable would pass a positive-only test and would be
 *   wrong — the flavour means "up, awaiting the first tick", not "down".
 * Public surface: Playwright test over the spawned gateway.
 * Does NOT own: the grammar (src/ui/readinessGrammar.ts), the taxonomy
 *   (src/ui/bridgeReadiness.ts), the M3 navigator.
 * Contract: contracts/readiness-state-grammar.json + rerun [[32.T32.5]].
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, Page, test } from '@playwright/test';

interface GrammarContract {
    readonly states: ReadonlyArray<{ readonly state: string }>;
    readonly flavours: ReadonlyArray<{ readonly flavour: string; readonly parentState: string }>;
}

const CONTRACT: GrammarContract = JSON.parse(
    readFileSync(resolve(process.cwd(), 'contracts/readiness-state-grammar.json'), 'utf8')
);
const PARENT_OF = new Map(CONTRACT.flavours.map(entry => [entry.flavour, entry.parentState]));
const STATES = new Set(CONTRACT.states.map(entry => entry.state));

/** Mounts the full M3 inspectors area (ide-deep). Mirrors the helper in
 *  m3-walk-navigator.spec.ts / m3-renderer-modes.spec.ts. */
async function dispatchM3Wheel(page: Page): Promise<void> {
    await page.evaluate(async () => {
        const registry = await import('/src/commands/registry.ts');
        const crossLayout = await import('/src/commands/crossLayoutIntent.ts');
        const stores = await import('/src/state/stores.ts');
        const privacyClass = stores.useSessionStore.getState().privacyClass;
        await registry.commands.execute(crossLayout.CROSS_LAYOUT_INTENT_COMMAND, {
            coordinate: stores.useCoordinateStore.getState().selected,
            artifactUri: null,
            reviewId: null,
            dayNow: stores.useSessionStore.getState().dayNow,
            sessionKey: stores.useSessionStore.getState().sessionKey,
            profileGeneration: stores.useTickStore.getState().generation,
            privacyClass:
                privacyClass === 'public' || privacyClass === 'protected' || privacyClass === 'private'
                    ? privacyClass
                    : null,
            requestedExtensionId: 'm3-mahamaya',
            requestedContributionId: 'wheel'
        });
    });
}

test('32.T32.5: the readiness grammar renders in the running app — state class per binding, flavour only when earned', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    // Ticks are flowing — which is what makes the pending_first_tick negative real.
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });

    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '0');
    await dispatchM3Wheel(page);
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep');

    // A badge the app resolves to a real blocked state, not one this spec induced.
    const walkShell = page
        .locator('.face-active [data-testid="m3-walk-navigator"]')
        .getByTestId('bridge-readiness-shell');
    await expect(walkShell).toHaveAttribute('data-readiness', 'bridge_unavailable');
    await expect(walkShell).toHaveClass(/bridge-readiness-state-bridge_unavailable/);
    // THE NEGATIVE: the bridge is connected and ticking, so this is a genuine
    // absence of the field — not the "awaiting first tick" variant.
    expect(await walkShell.getAttribute('data-flavour')).toBeNull();
    await expect(walkShell).not.toHaveClass(/bridge-readiness-flavour-/);

    // Every readiness node the live face renders obeys the same law.
    const nodes = page.locator(
        '.face-active [data-testid="bridge-readiness-shell"], .face-active [data-testid="bridge-readiness-border"]'
    );
    const count = await nodes.count();
    // Non-vacuous: a sweep over nothing would pass while proving nothing.
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
        const node = nodes.nth(index);
        const state = await node.getAttribute('data-readiness');
        const className = (await node.getAttribute('class')) ?? '';
        const flavour = await node.getAttribute('data-flavour');

        expect(STATES.has(state ?? '')).toBe(true);
        expect(className).toContain(`bridge-readiness-state-${state}`);

        if (flavour !== null) {
            // A flavour is a variant OF its parent state, never free-standing.
            expect(PARENT_OF.get(flavour)).toBe(state);
            expect(className).toContain(`bridge-readiness-flavour-${flavour}`);
        }
    }
});
