/**
 * Coordinate: M' M5' (Evidence deposition loop — Track 26.T26.4, UF class)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / real spawned gateway carrier proof
 * Actualises: the closed deposition loop the Evidence fold never had. Two
 *   defects kept it empty and only one of them was the missing read method:
 *
 *     1. The WRITE could not succeed. The inline form posted its packet-shaped
 *        draft verbatim to `s5'.epii.deposit`, which deserialises params into
 *        `DepositRequest` — so every submit was refused by serde before it
 *        reached the review store. Its unit test asserted the broken shape
 *        against a permissive mock, so the mock passed and the method never did.
 *     2. The READ did not exist, and now does (`s5'.epii.deposit.list`).
 *
 *   Only the running app against a real gateway can prove the two agree, which
 *   is what this spec does: deposit through the actual form, then find that
 *   deposit in the fold's list. A jsdom mock cannot prove it, because a mock is
 *   exactly what hid the defect.
 * Does NOT own: the deposit contract (S5' epii-agent-core), the review store.
 * Contract: [[M5'-SPEC]] + rerun tranche [[26.T26.4]].
 */

import { expect, test } from '@playwright/test';

test('26.T26.4: a deposit made through the Evidence fold comes back out of it', async ({ page }) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    await page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Evidence' })
        .first()
        .click();
    await expect(shell).toHaveAttribute('data-omnipanel-active-tab', 'evidence');

    const panel = page.getByTestId('evidence-panel');
    await expect(panel).toBeVisible();
    // The fold reads the live list on mount: either rows or an honest empty —
    // never the "unavailable" state, which would mean the read method is gone.
    await expect(page.getByTestId('evidence-deposits')).toBeVisible();
    await expect(page.getByTestId('evidence-deposits-error')).toHaveCount(0);

    const before = Number(await page.getByTestId('evidence-deposit-count').textContent());

    // Deposit through the REAL inline form — not a fabricated store write.
    await page.getByTestId('evidence-deposit-new').click();
    const form = page.getByTestId('evidence-deposit-form');
    await expect(form).toBeVisible();

    const title = `e2e-deposit-${Date.now().toString(36)}`;
    const fields: Record<string, string> = {
        title,
        candidateId: 'cand-e2e-1',
        coordinate: 'M5-4',
        sourceAnchor: 'Idea/Empty/Present/e2e-deposit.md',
        graphAnchor: 'bimba://M5-4/evidence',
        reviewId: 'rev-e2e-1',
        testAnchor: 'tests/e2e/evidence-deposition-loop.spec.ts'
    };
    for (const [field, value] of Object.entries(fields)) {
        await page.getByTestId(`deposit-field-${field}`).fill(value);
    }

    await page.getByTestId('deposit-submit').click();

    // The gateway ACCEPTED it. Before the write fix this was `deposit-refused`
    // carrying a serde error about missing DepositRequest fields.
    await expect(page.getByTestId('deposit-ok')).toBeVisible({ timeout: 20_000 });

    // ...and the read sibling now shows the very row the write just created.
    const deposits = page.getByTestId('evidence-deposits');
    await expect(deposits).toContainText(title, { timeout: 20_000 });
    await expect(page.getByTestId('evidence-deposit-count')).not.toHaveText(String(before));

    const row = page.locator('.evidence-deposit-row', { hasText: title }).first();
    await expect(row).toHaveAttribute('data-deposit-type', 'review_item');
    await expect(row).toContainText('M5-4');
    await expect(row).toContainText('Idea/Empty/Present/e2e-deposit.md');
});
