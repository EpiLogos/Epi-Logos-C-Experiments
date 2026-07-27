/**
 * Coordinate: M' M4' (drivable-loop spec: DayContainer detail — 25.T25.2)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / real vault sidecar carrier proof
 * Actualises: the UF half of 25.2. The unit suites prove the projection and the
 *   chip law against a fake vault; only the running app can prove the detail
 *   reads the REAL Present tree — so this spec writes a real session folder
 *   with a real NOW (declaring the tranche-mode, response-orbit,
 *   briefing-emitted and Klein-weighting keys) plus a real journal artifact,
 *   then anchors today, opens the Calendar face, clicks the day, and asserts
 *   the container renders THAT session, THOSE chips, and routes the artifact
 *   row into the editor through `vault.open`.
 *
 *   It also proves the privacy law over live files: the artifact body is in the
 *   vault and must NOT appear in the rendered detail.
 * Does NOT own: the vault filesystem (sidecar/src-tauri), the day-now write
 *   (App.tsx + session store), or the projection law (m4DayContainer.ts).
 * Contract: [[M4'-SPEC]] §6.5 + rerun tranche [[25.T25.2]].
 */

import { expect, test } from '@playwright/test';
import { SIDECAR_URL, todayId } from './e2e-env';

const SESSION = '20260101-000000-e2edc';
const BODY_MARKER = 'this journal body must never reach the detail';

test('25.T25.2: the DayContainer detail reads the real day tree', async ({ page, request }) => {
    const day = todayId();
    const sessionPath = `Empty/Present/${day}/${SESSION}`;

    // seed a REAL session folder through the same sidecar the app writes with
    const begin = await request.post(`${SIDECAR_URL}/invoke`, { data: { cmd: 'begin_today', args: {} } });
    expect(begin.ok()).toBeTruthy();
    const nowWrite = await request.post(`${SIDECAR_URL}/invoke`, {
        data: {
            cmd: 'vault_write',
            args: {
                path: `${sessionPath}/now.md`,
                content:
                    `---\nsession_id: "${SESSION}"\nday_id: "${day}"\nc_3_tranche_mode: quiet:90m\n` +
                    `c_3_response_orbit: next-morning\nc_3_briefing_emitted: 2026-07-27T09:31:00Z\n` +
                    `c_3_klein_weighting:\n  prospective: 0.4\n  retrospective: 0.6\n---\n\n# NOW\n`
            }
        }
    });
    expect(nowWrite.ok()).toBeTruthy();
    const artifactWrite = await request.post(`${SIDECAR_URL}/invoke`, {
        data: {
            cmd: 'vault_write',
            args: {
                path: `${sessionPath}/journal.md`,
                content: `---\nc_4_artifact_role: journal\nt_4_kairos_context: "[[Kairos]]"\n---\n\n${BODY_MARKER}\n`
            }
        }
    });
    expect(artifactWrite.ok()).toBeTruthy();

    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();

    // anchor the day so the calendar opens on this month (same idiom as 25.1)
    const editor = page.locator('.face-active [data-testid="m4-nara-editor"]');
    const beginButton = page.getByTestId('now-begin-today');
    await expect(editor.or(beginButton).first()).toBeVisible({ timeout: 15_000 });
    if (await beginButton.isVisible().catch(() => false)) {
        await beginButton.click().catch(() => undefined);
    }
    await expect(page.getByTestId('status-daynow')).not.toContainText('no day', { timeout: 15_000 });

    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Calendar' }).click();
    await expect(page.getByTestId('day-calendar')).toBeVisible({ timeout: 15_000 });

    await page.getByTestId(`cal-day-${day}`).click();
    const container = page.getByTestId('day-container');
    await expect(container).toBeVisible({ timeout: 15_000 });
    await expect(container).toHaveAttribute('data-day', day);

    // the real session, with exactly the chips its own NOW declared
    const session = page.getByTestId(`day-session-${SESSION}`);
    await expect(session).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId(`day-tranche-${SESSION}`)).toHaveText('quiet:90m');
    await expect(page.getByTestId(`day-orbit-${SESSION}`)).toHaveText('next-morning');
    await expect(page.getByTestId(`day-briefing-${SESSION}`)).toHaveText('2026-07-27T09:31:00Z');
    await expect(page.getByTestId(`day-klein-${SESSION}`)).toBeVisible();

    // the real artifact row, with its declared role and kairos chip
    const row = page.getByTestId('day-artifact-journal.md');
    await expect(row).toHaveAttribute('data-kind', 'journal');
    await expect(page.getByTestId('day-artifact-kairos-journal.md')).toHaveText('[[Kairos]]');

    // the body stays in the vault — handles and roles only
    await expect(container).not.toContainText(BODY_MARKER);
    await expect(container).toHaveAttribute('data-protected-bodies-rendered', 'false');

    // clicking the row opens THAT artifact — vault.open mounts an editor tab
    // named for the file it actually opened
    await row.click();
    await expect(
        page.locator('.face-active .flexlayout__tab_button', { hasText: 'journal.md' })
    ).toBeVisible({ timeout: 15_000 });
    // and the editor really mounted THAT path (its testid carries the path)
    await expect(page.getByTestId(`editor-${sessionPath}/journal.md`)).toBeVisible({
        timeout: 15_000
    });
});
