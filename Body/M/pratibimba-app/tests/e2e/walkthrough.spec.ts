/**
 * Coordinate: M' (drivable-loop spec: onboarding walkthrough — 32.T32.3)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / gateway carrier proof
 * Actualises: the UF half of 32.3. The unit tests prove the step model and the
 *   preference writes; only the running app can prove the two claims that are
 *   about the real cascade and real layout:
 *     (a) NON-MODAL, operationally — with the walkthrough open, the shell is
 *         still driven: the 0/1 face is flipped by keyboard, a status-bar
 *         element is clicked, and the walkthrough survives both. A modal would
 *         have swallowed them. The backdrop's computed `pointer-events` is
 *         read directly, and it covers the viewport while doing so.
 *     (b) the tooltips really ANCHOR — each step's spotlight lands on its
 *         target's real box, measured against the live element, not assumed.
 *   Plus the re-trigger: dismissing with Escape and reopening from the real
 *   command palette.
 * Does NOT own: the step content (src/onboarding/walkthrough.ts), the ledger
 *   contract (contracts/onboarding-completion-ledger.json).
 * Contract: rerun tranche [[32.T32.3]] (WC-OB-19); [[CHROME-CONTRACT]] CCT-8.
 */

import { expect, test } from '@playwright/test';

async function openWalkthrough(page: import('@playwright/test').Page): Promise<void> {
    await page.keyboard.press('Meta+Shift+P');
    await expect(page.getByTestId('command-palette')).toBeVisible();
    const input = page.getByTestId('palette-input');
    await input.fill('walkthrough');
    await expect(page.getByTestId('palette-item-epi-logos.help.openWalkthrough')).toBeVisible();
    await page.getByTestId('palette-item-epi-logos.help.openWalkthrough').click();
    await expect(page.getByTestId('walkthrough-card')).toBeVisible();
}

test('32.T32.3: the walkthrough guides over a shell that stays fully usable', async ({ page }) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    await openWalkthrough(page);
    await expect(page.getByTestId('walkthrough-card')).toHaveAttribute(
        'data-step-id',
        'walkthrough.0-1-toggle'
    );
    await expect(page.getByTestId('walkthrough-progress')).toHaveText('1 / 6');

    // (a) NON-MODAL, measured: the backdrop covers the viewport yet takes no
    // pointer events, so nothing underneath is captured.
    const backdrop = await page.getByTestId('walkthrough-backdrop').evaluate(el => {
        const rect = el.getBoundingClientRect();
        return {
            pointerEvents: getComputedStyle(el).pointerEvents,
            coversViewport: rect.width >= window.innerWidth && rect.height >= window.innerHeight
        };
    });
    expect(backdrop.coversViewport, 'the backdrop should span the viewport').toBe(true);
    expect(backdrop.pointerEvents, 'a walkthrough must never capture the pointer (CCT-8)').toBe('none');

    // ...and operationally: drive the shell WHILE the walkthrough stands.
    const faceBefore = await shell.getAttribute('data-face');
    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', faceBefore === '0' ? '1' : '0');
    await expect(page.getByTestId('walkthrough-card'), 'the guide survives shell use').toBeVisible();
    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', faceBefore!);

    // a real click lands on the element underneath, not on the backdrop
    await page.getByTestId('status-strip').click();
    await expect(page.getByTestId('walkthrough-card')).toBeVisible();

    // (b) the tooltip really anchors: the spotlight covers the live target box
    await expect(page.getByTestId('walkthrough-backdrop')).toHaveAttribute('data-anchor-resolved', 'true');
    await expect(page.getByTestId('walkthrough-spotlight')).toHaveAttribute(
        'data-step-id',
        'walkthrough.0-1-toggle'
    );
    const anchored = await page.evaluate(() => {
        const spot = document.querySelector('[data-testid="walkthrough-spotlight"]');
        const target = document.querySelector('[data-testid="face-toggle"]');
        if (!spot || !target) return null;
        const a = spot.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        return { dx: Math.abs(a.left - b.left), dy: Math.abs(a.top - b.top), w: b.width };
    });
    expect(anchored, 'both the spotlight and its target must be present').not.toBeNull();
    expect(anchored!.w, 'the anchor target must be a real, laid-out element').toBeGreaterThan(0);
    expect(anchored!.dx, 'the spotlight must sit on its target').toBeLessThanOrEqual(2);
    expect(anchored!.dy, 'the spotlight must sit on its target').toBeLessThanOrEqual(2);

    // walk to the status-bar step and confirm the anchor MOVED to that target
    for (let step = 0; step < 3; step += 1) {
        await page.getByTestId('walkthrough-next').click();
    }
    await expect(page.getByTestId('walkthrough-card')).toHaveAttribute(
        'data-step-id',
        'walkthrough.status-bar'
    );
    // wait for the SPOTLIGHT to re-measure for this step before reading its box
    await expect(page.getByTestId('walkthrough-spotlight')).toHaveAttribute(
        'data-step-id',
        'walkthrough.status-bar'
    );
    const movedTo = await page.evaluate(() => {
        const spot = document.querySelector('[data-testid="walkthrough-spotlight"]');
        const strip = document.querySelector('[data-testid="status-strip"]');
        if (!spot || !strip) return null;
        const a = spot.getBoundingClientRect();
        const b = strip.getBoundingClientRect();
        return { dx: Math.abs(a.left - b.left), dy: Math.abs(a.top - b.top) };
    });
    expect(movedTo, 'the status-bar step must anchor to the real strip').not.toBeNull();
    expect(movedTo!.dx).toBeLessThanOrEqual(2);
    expect(movedTo!.dy).toBeLessThanOrEqual(2);

    // Regression: the card must stay ON SCREEN at every step. The first cut
    // placed it at `anchor.bottom + 8`, which for a full-height anchor (the
    // OmniPanel border) put the Next button below the viewport — a walkthrough
    // that traps the user on step 2. Walk all six and measure.
    await page.keyboard.press('Escape');
    await openWalkthrough(page);
    for (let step = 0; step < 6; step += 1) {
        const card = page.getByTestId('walkthrough-card');
        await expect(card).toHaveAttribute('data-step-index', String(step));
        const onScreen = await card.evaluate(el => {
            const r = el.getBoundingClientRect();
            return r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth;
        });
        expect(onScreen, `step ${step + 1}'s card fell outside the viewport`).toBe(true);
        await expect(page.getByTestId('walkthrough-next')).toBeVisible();
        await page.getByTestId('walkthrough-next').click();
    }
    await expect(page.getByTestId('walkthrough-card')).toHaveCount(0);

    // Escape dismisses; the command reopens it — the brief's re-trigger path
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('walkthrough-card')).toHaveCount(0);
    await openWalkthrough(page);
    await expect(page.getByTestId('walkthrough-progress')).toHaveText('1 / 6');
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('walkthrough-card')).toHaveCount(0);
});
