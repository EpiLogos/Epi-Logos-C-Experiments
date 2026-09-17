/**
 * Coordinate: M' M4' (journal timeline UF proof — Track 25.T25.3)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Actualises: the NOW-inscription timeline read over the REAL gateway method
 *   `nara.journal.timeline` — a session seeded through the sidecar's vault
 *   write comes back as a timeline ROW (day chip · NOW timestamp · session
 *   short prefix · kind ribbon), newest-first, and clicking it opens the
 *   session's own now.md in the editor. `data-state="read"` can only be set
 *   by the gateway parse — a vault_list fallback has no path to it.
 * Does NOT own: the timeline producer (epi-cli gate/nara.rs) or the day law.
 * Contract: [[M4'-SPEC]]; 25-m4-nara-frontend-deep.md Tranche 25.3.
 */

import { expect, test } from '@playwright/test';
import { SIDECAR_URL, latestSessionId, todayId } from './e2e-env';

test('25.T25.3: the timeline lists the real NOW inscriptions over the gateway and opens one', async ({
    page,
    request
}) => {
    const dayId = todayId();
    const sessionKey = latestSessionId('e2e-jt');
    const sessionDir = `Empty/Present/${dayId}/${sessionKey}`;

    const begin = await request.post(`${SIDECAR_URL}/invoke`, {
        data: { cmd: 'begin_today', args: {} }
    });
    expect(begin.ok()).toBeTruthy();
    const nowWrite = await request.post(`${SIDECAR_URL}/invoke`, {
        data: {
            cmd: 'vault_write',
            args: {
                path: `${sessionDir}/now.md`,
                content: `---\ncoordinate: ""\nc_4_artifact_role: now\n---\n# NOW\n\ntimeline-proof-inscription\n`
            }
        }
    });
    expect(nowWrite.ok()).toBeTruthy();
    const artifactWrite = await request.post(`${SIDECAR_URL}/invoke`, {
        data: {
            cmd: 'vault_write',
            args: {
                path: `${sessionDir}/oracle-cast.md`,
                content: `---\nc_4_artifact_role: "oracle"\n---\nthe reading body stays in the vault\n`
            }
        }
    });
    expect(artifactWrite.ok()).toBeTruthy();

    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const face = page.locator('.face-active');
    await face.locator('.flexlayout__border_button', { hasText: 'Journal' }).click();
    const pane = face.getByTestId('journal-timeline');
    await expect(pane).toBeVisible();

    // The read state IS the wire proof: only the gateway parse sets it, and
    // the pane's declared bound is the spec's 30 days.
    await expect(pane).toHaveAttribute('data-state', 'read', { timeout: 20_000 });
    await expect(pane).toHaveAttribute('data-day-range', '30');

    // The seeded session surfaces as a specced row: today's day chip, the
    // 8-char short prefix, and a kind ribbon carrying oracle + now.
    const row = pane.getByTestId(`journal-row-${sessionKey}`);
    await expect(row).toBeVisible();
    await expect(row).toHaveAttribute('data-day', dayId);
    await expect(row).toContainText(sessionKey.slice(-8));
    const kinds = pane.getByTestId(`journal-kinds-${sessionKey}`);
    await expect(kinds).toHaveAttribute('data-kinds', /now/);
    await expect(kinds).toHaveAttribute('data-kinds', /oracle/);
    // Privacy: the ribbon carries KINDS, never the artifact body.
    await expect(pane).not.toContainText('the reading body stays in the vault');

    // Newest-first: the end-of-day stamp seeded here must be the FIRST row.
    const firstRow = pane.locator('[data-testid^="journal-row-"]').first();
    await expect(firstRow).toHaveAttribute('data-session-key', sessionKey);

    // Click-through opens the session's own NOW inscription as a dynamic
    // editor tab (`vault.open` → MarkdownEditorPane keyed by path).
    await row.click();
    // The Journal border panel overlays the main strip; fold it back so the
    // freshly-opened editor tab is the visible surface.
    await face.locator('.flexlayout__border_button', { hasText: 'Journal' }).click();
    const editor = page.locator(`.face-active [data-testid="editor-${sessionDir}/now.md"]`);
    await expect(editor).toBeVisible({ timeout: 15_000 });
    await expect(editor).toContainText('timeline-proof-inscription', { timeout: 15_000 });
});
