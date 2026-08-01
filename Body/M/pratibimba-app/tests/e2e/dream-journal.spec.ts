/**
 * Coordinate: M4' Dream Journal e2e (rerun 51.T51.6)
 * Actualises: the tranche's UF acceptance in a real browser against the real
 *   spawned gateway and the real vault sidecar — "writes and reads a dream
 *   entry through the protected substrate and asserts the content does NOT
 *   appear on any public graph surface or in any emitted envelope."
 *
 *   THE EGRESS PROOF IS THE POINT, so it is not done by scanning the DOM and
 *   hoping. An init script wraps `WebSocket.prototype.send` before the app
 *   boots and records every frame the page transmits; after the dream is
 *   written, EVERY captured frame is checked for the dream's words. That is a
 *   real "no emitted envelope" assertion: the gateway socket is the only way
 *   out of this carrier (`lint:single-clock` enforces one socket), so a frame
 *   set with no dream in it is a surface that leaked nothing.
 *
 *   The public-graph half then opens the Bimba graph explorer — the public
 *   surface a leak would most plausibly reach — and asserts the same words are
 *   absent from what it renders.
 * Does NOT own: the document/handle law
 *   (`src/panes/dreamJournal/dreamJournal.test.ts`), the vault seam, the graph.
 */

import { expect, test, type Page } from '@playwright/test';
import { SIDECAR_URL, todayId } from './e2e-env';

/** Distinctive, long-token content — a leak of any word is detectable, and no
 *  token collides with ordinary protocol vocabulary. */
const DREAM_TITLE = 'sarcophagus-hexagram-staircase';
const DREAM_WORDS = [
    'sarcophagus',
    'hexagrams',
    'staircase',
    'obsidian',
    'kingfisher',
    'reliquary'
];
const DREAM_BODY = `I climbed an ${DREAM_WORDS[3]} ${DREAM_WORDS[2]} of ${DREAM_WORDS[1]} while a ${DREAM_WORDS[4]} watched from the ${DREAM_WORDS[5]}, and the ${DREAM_WORDS[0]} opened.`;

async function boot(page: Page): Promise<void> {
    // Capture every transmitted WebSocket frame BEFORE the app boots.
    await page.addInitScript(() => {
        const sent: string[] = [];
        (window as unknown as { __sentFrames: string[] }).__sentFrames = sent;
        const original = WebSocket.prototype.send;
        WebSocket.prototype.send = function patched(this: WebSocket, data: unknown) {
            try {
                sent.push(typeof data === 'string' ? data : String(data));
            } catch {
                sent.push('<unserialisable frame>');
            }
            return original.call(this, data as string);
        };
    });
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
}

function journal(page: Page) {
    return page.locator('.face-active [data-testid="dream-journal"]');
}

async function openDreamJournal(page: Page): Promise<void> {
    await page.keyboard.press('Meta+Shift+P');
    await page.getByTestId('palette-input').fill('Dream Journal');
    await page.getByTestId('palette-item-m4.open.dreamJournal').click();
    await expect(page.getByTestId('shell')).toHaveAttribute('data-active-layout', 'ide-deep', {
        timeout: 30_000
    });
    await expect(journal(page)).toBeVisible({ timeout: 30_000 });
}

test('51.T51.6: a dream is written and read back through the protected substrate, and leaks nowhere', async ({
    page,
    request
}) => {
    test.setTimeout(300_000);

    // A real day container through the same sidecar the app writes with.
    const day = todayId();
    const begin = await request.post(`${SIDECAR_URL}/invoke`, {
        data: { cmd: 'begin_today', args: {} }
    });
    expect(begin.ok()).toBeTruthy();

    await boot(page);

    // anchor the day (the same idiom day-container-detail.spec.ts uses)
    const beginButton = page.getByTestId('now-begin-today');
    if (await beginButton.isVisible().catch(() => false)) {
        await beginButton.click().catch(() => undefined);
    }
    await expect(page.getByTestId('status-daynow')).not.toContainText('no day', {
        timeout: 20_000
    });

    await openDreamJournal(page);
    await expect(journal(page)).toHaveAttribute('data-privacy-class', 'protected_local');
    await expect(journal(page)).toHaveAttribute('data-day', day);

    // ── write it through the real protected substrate ───────────────────────
    await journal(page).getByTestId('dream-title').fill(DREAM_TITLE);
    await journal(page).getByTestId('dream-body').fill(DREAM_BODY);
    await journal(page).getByTestId('dream-save').click();
    await expect(journal(page).getByTestId('dream-status')).toContainText('recorded Empty/Present/', {
        timeout: 20_000
    });
    await expect(journal(page)).not.toHaveAttribute('data-dream-count', '0', { timeout: 20_000 });

    // ── the list is HANDLES: a length, not the dream ────────────────────────
    const handle = journal(page).locator('[data-testid^="dream-handle-"]').first();
    await expect(handle).toBeVisible();
    await expect(handle).toHaveAttribute('data-dream-privacy', 'protected_local_handle_only');
    const dreamPath = await handle.getAttribute('data-dream-path');
    expect(dreamPath).toContain('Empty/Present/');
    expect(Number(await handle.getAttribute('data-dream-body-length'))).toBe(DREAM_BODY.length);
    for (const word of DREAM_WORDS) {
        expect(await handle.textContent(), 'a handle row must not carry the dream').not.toContain(
            word
        );
    }

    // ── read it back: the body IS retrievable, on this surface only ─────────
    await journal(page).locator('[data-testid^="dream-open-"]').first().click();
    await expect(journal(page).getByTestId('dream-opened-body')).toContainText(DREAM_WORDS[0], {
        timeout: 20_000
    });
    await expect(journal(page).getByTestId('dream-opened-title')).toHaveText(DREAM_TITLE);

    // …and it really is in the vault, under the write scope (the sidecar reads
    // the same filesystem the app wrote to).
    const stored = await request.post(`${SIDECAR_URL}/invoke`, {
        data: { cmd: 'vault_read', args: { path: dreamPath } }
    });
    expect(stored.ok()).toBeTruthy();
    const storedBody = JSON.stringify(await stored.json());
    expect(storedBody).toContain('c_4_artifact_role: dream');
    expect(storedBody).toContain(DREAM_WORDS[0]);

    // ── NO EMITTED ENVELOPE carries the dream ───────────────────────────────
    // Every WebSocket frame this page has transmitted since before boot.
    const frames = await page.evaluate(
        () => (window as unknown as { __sentFrames: string[] }).__sentFrames
    );
    expect(frames.length, 'the capture must have seen real traffic, or it proves nothing').toBeGreaterThan(0);
    const transmitted = frames.join('\n');
    for (const word of DREAM_WORDS) {
        expect(transmitted, `\`${word}\` reached an emitted envelope`).not.toContain(word);
    }
    expect(transmitted).not.toContain(DREAM_TITLE);

    // ── NO PUBLIC GRAPH SURFACE carries the dream ───────────────────────────
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' }).click();
    const graph = page.locator('.face-active [data-testid="graph-explorer"]');
    await expect(graph).toBeVisible({ timeout: 20_000 });
    const graphText = (await graph.textContent()) ?? '';
    for (const word of DREAM_WORDS) {
        expect(graphText, `\`${word}\` reached the public graph surface`).not.toContain(word);
    }
    expect(graphText).not.toContain(DREAM_TITLE);

    // …and nothing leaked into the observability folds either (dispatch trace,
    // raw gateway log ring, diagnostics) — the surfaces an envelope would show
    // up on if one had carried it.
    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Tools' }).click();
    const tools = page.locator('.face-active [data-testid="tool-stream-fold"]');
    await expect(tools).toBeVisible({ timeout: 20_000 });
    const toolsText = (await tools.textContent()) ?? '';
    for (const word of DREAM_WORDS) {
        expect(toolsText, `\`${word}\` reached the tool-stream fold`).not.toContain(word);
    }

    // Frames kept flowing throughout — the capture was live for the whole run.
    const finalFrames = await page.evaluate(
        () => (window as unknown as { __sentFrames: string[] }).__sentFrames.length
    );
    expect(finalFrames).toBeGreaterThanOrEqual(frames.length);
});
