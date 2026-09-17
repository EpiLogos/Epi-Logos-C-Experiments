/**
 * Coordinate: M' M4' (Personal Coordinate UF proof — Track 25.T25.7)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Actualises: the live Q_personal sidebar against the REAL gateway — the
 *   medicine leg (dominant chakra + sun-decan ruling planet) crosses the
 *   real `nara.medicine.snapshot` wire; the pole rows tell the truth about
 *   the live profile (resolved exactly when the wire carries the pole,
 *   honest-pending when it withholds it — read atomically with the DOM);
 *   and the UX §6.5 no-quaternion-dump law holds on the rendered surface.
 * Does NOT own: the resonance/pole producers or the medicine chain.
 * Contract: 25-m4-nara-frontend-deep.md Tranche 25.7.
 */

import { expect, test } from '@playwright/test';

test('25.T25.7: the Personal Coordinate sidebar reads its live rows honestly over the gateway', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });

    const face = page.locator('.face-active');
    await face.locator('.flexlayout__border_button', { hasText: 'Personal' }).click();
    const pane = face.getByTestId('m4-personal-coordinate');
    await expect(pane).toBeVisible();

    // (d) the LIVE medicine chain: a real nara.medicine.snapshot answer —
    // chakra name + ruling planet rendered from the wire, never a local map.
    await expect(pane.getByTestId('m4-pc-medicine')).toHaveAttribute('data-state', 'read', {
        timeout: 20_000
    });
    await expect(pane.getByTestId('m4-pc-chakra')).not.toBeEmpty();
    await expect(pane.getByTestId('m4-pc-planet')).not.toBeEmpty();

    // (a)+(b)+(c) — the pole rows agree with the LIVE profile, read in ONE
    // atomic evaluate so no tick can land between the two reads.
    const agreement = await page.evaluate(async () => {
        const pane = document.querySelector('.face-active [data-testid="m4-personal-coordinate"]');
        if (!pane) {
            return null;
        }
        const stores = await import('/src/state/stores.ts');
        const cached = stores.useTickStore.getState().profile as
            | { profile?: Record<string, unknown> }
            | null;
        const payload = (cached?.profile ?? {}) as Record<string, unknown>;
        const root = (payload.harmonicProfile as Record<string, unknown> | undefined) ?? payload;
        const pole = root.personalPole as Record<string, unknown> | undefined;
        const poleResonance = pole?.resonance as Record<string, unknown> | undefined;
        const tickResonance = root.resonance;
        const wireResolved =
            (typeof poleResonance?.score === 'number' &&
                typeof poleResonance?.conjugateFormCharacter === 'string') ||
            (typeof tickResonance === 'number' &&
                typeof root.conjugateFormCharacter === 'string');
        return {
            domState: pane.getAttribute('data-resonance-state'),
            wireResolved,
            elementsState:
                pane.querySelector('[data-testid="m4-pc-elements"]')?.getAttribute('data-state') ??
                null,
            wireHasBalance: Boolean(pole && (pole.elementalBalance as unknown)),
            text: pane.textContent ?? ''
        };
    });
    expect(agreement).not.toBeNull();
    // The surface says resolved exactly when the wire really resolves — an
    // honest pending on a pole-less public tick is a PASS, a painted score
    // over a silent wire is the failure this assertion exists to catch.
    expect(agreement!.domState).toBe(agreement!.wireResolved ? 'resolved' : 'pending');
    expect(agreement!.elementsState).toBe(agreement!.wireHasBalance ? 'resolved' : 'pending');

    // UX §6.5 — no quaternion dump reaches the DOM, whatever the wire said.
    expect(agreement!.text).not.toMatch(/\b[wxyz]\s*=\s*-?\d/);
});
