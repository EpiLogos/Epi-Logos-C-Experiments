/**
 * Coordinate: M' (drivable-loop spec: journal write-back)
 * Actualises: the full journal loop over a REAL filesystem — begin today
 *   creates the canonical daily note in the temp vault, typed prose rides the
 *   debounced saver through vault_write, the test reads the ACTUAL file bytes
 *   off the sidecar's disk, and a reload proves the words came back from the
 *   vault, not from component state.
 */

import { expect, test } from '@playwright/test';
import { SIDECAR_URL, todayId } from './e2e-env';

test('begin today → type → real bytes in the vault → reload shows it', async ({ page, request }) => {
    await page.goto('/');

    // anchor the day (creates Empty/Present/<MM-DD-YYYY>/daily-note.md for
    // real). Since T17 the integrated-loop spec runs first and may already
    // have anchored today — in that case the app adopts the existing day on
    // boot and the begin gesture (correctly) never renders.
    const editor = page.locator('.face-active .cm-content');
    const beginButton = page.getByTestId('now-begin-today');
    await expect(editor.or(beginButton).first()).toBeVisible({ timeout: 15_000 });
    if (await beginButton.isVisible().catch(() => false)) {
        // adoption may race the gesture and detach the button mid-click; the
        // editor assertion below is the real gate either way
        await beginButton.click().catch(() => undefined);
    }
    await expect(editor).toBeVisible({ timeout: 15_000 });

    // type into the NOW canvas and wait for the debounced saver to land
    const marker = `e2e-journal-${Date.now().toString(36)}`;
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.type(` ${marker}`);
    await expect(page.getByTestId('editor-save-state')).toHaveText('saved', { timeout: 15_000 });

    // the REAL file bytes, read straight off the sidecar's disk
    const dayId = todayId();
    const notePath = `Empty/Present/${dayId}/daily-note.md`;
    const raw = await request.get(`${SIDECAR_URL}/raw?path=${encodeURIComponent(notePath)}`);
    expect(raw.ok(), `raw read of ${notePath} failed`).toBeTruthy();
    const bytes = await raw.text();
    expect(bytes).toContain(marker);
    // frontmatter must survive the round-trip byte-preserving (editor hides
    // it; the saver reassembles it) — C-family key law intact on disk
    expect(bytes.startsWith('---\n')).toBeTruthy();
    expect(bytes).toContain(`c_3_day_id: "${dayId}"`);

    // relaunch-shows-it: a fresh boot re-reads the vault, not memory
    await page.reload();
    await expect(page.locator('.face-active .cm-content')).toContainText(marker, { timeout: 15_000 });
});
