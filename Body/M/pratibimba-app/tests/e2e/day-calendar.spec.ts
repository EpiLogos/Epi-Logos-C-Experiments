/**
 * Coordinate: M' (drivable-loop spec: day-calendar navigation — DR-FACE-7)
 * Actualises: the UF proof of Tranche 25.1 (fate B). The design-recon asked for
 *   a Theia widget that OWNS the day-now write; DR-FACE-7 §3 re-grounds it as a
 *   4-5-0 personal-pole face that READS the session store's day-now thread and
 *   never owns it — navigating is a local view selection. This spec drives the
 *   real Vite face against the real vault sidecar: it anchors today (creating a
 *   real Present day folder), opens the Calendar face, and asserts the month
 *   grid marks today's folder as the day-now anchor, that month navigation is a
 *   local view change, and that navigating never mutates the day-now thread
 *   (the status strip's day-now entry is unchanged after navigation).
 * Does NOT own: the vault filesystem (sidecar/src-tauri), the day-now write
 *   (App.tsx + session store), the markdown editor a day-open routes into.
 */

import { expect, test } from '@playwright/test';
import { todayId } from './e2e-env';

test('day calendar: today is marked the day-now anchor and month nav never owns the day-now (25.1 fate-B)', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();

    // anchor the day (idempotent: click begin if unanchored, else the app
    // already adopted today's folder from the real vault) — this creates a real
    // Present day folder and sets the session day-now thread.
    const editor = page.locator('.face-active .cm-content');
    const beginButton = page.getByTestId('now-begin-today');
    await expect(editor.or(beginButton).first()).toBeVisible({ timeout: 15_000 });
    if (await beginButton.isVisible().catch(() => false)) {
        await beginButton.click().catch(() => undefined);
    }
    await expect(editor).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('status-daynow')).not.toContainText('no day', { timeout: 15_000 });

    // open the Calendar face in the personal border
    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Calendar' }).click();
    const calendar = page.getByTestId('day-calendar');
    await expect(calendar).toBeVisible({ timeout: 15_000 });

    // the grid opens on the day-now month and marks today's folder as the anchor
    const today = todayId();
    const todayCell = page.getByTestId(`cal-day-${today}`);
    await expect(todayCell).toHaveAttribute('data-day-now', 'true', { timeout: 15_000 });
    await expect(todayCell).toHaveAttribute('data-has-folder', 'true');

    // the month label reads as a real calendar month
    const monthLabel = page.getByTestId('cal-month');
    const monthBefore = (await monthLabel.textContent()) ?? '';
    expect(monthBefore).toMatch(/^[A-Za-z]+ \d{4}$/);

    // the day-now thread as the status strip sees it (the carrier truth we must
    // NOT mutate by navigating)
    const dayNowBefore = (await page.getByTestId('status-daynow').textContent()) ?? '';

    // navigate a month back — a LOCAL view change
    await monthLabel.scrollIntoViewIfNeeded();
    await page.getByTestId('cal-prev').click();
    await expect(monthLabel).not.toHaveText(monthBefore);
    // the previous month no longer shows today's cell as the anchor
    await expect(page.getByTestId(`cal-day-${today}`)).toHaveCount(0);

    // and navigation NEVER wrote the day-now thread — the calendar reads it,
    // it does not own it (DR-FACE-7 §3)
    await expect(page.getByTestId('status-daynow')).toHaveText(dayNowBefore);

    // navigate forward again — back on the anchor month, today re-marked
    await page.getByTestId('cal-next').click();
    await expect(monthLabel).toHaveText(monthBefore);
    await expect(page.getByTestId(`cal-day-${today}`)).toHaveAttribute('data-day-now', 'true');
});
