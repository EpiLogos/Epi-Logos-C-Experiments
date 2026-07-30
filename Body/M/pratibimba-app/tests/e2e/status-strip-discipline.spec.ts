/**
 * Coordinate: M' (drivable-loop spec: status-strip discipline — DR-FACE-7)
 * Actualises: the fate-A close of Tracks 15.10 + 31.1 under the M' Engine
 *   Faces Ontology (DR-FACE-7). Those tranches were authored for Theia, whose
 *   unit is the widget: they asked for six `StatusBarContribution` files under
 *   epi-theia and an "exactly six" enumeration lint. The pratibimba-app carrier
 *   has no shell to contribute into — it has a `StatusStrip` face that reads the
 *   spine's state threads and owns nothing. Per DR-FACE-7 §3 the widget framing
 *   is dead; the CONTENT-LAW survives as carrier-native discipline:
 *     state-thread entries ≡ the spine's state threads, each surfaced EXACTLY
 *     ONCE (threads, not stores — the session store carries TWO threads, day-now
 *     and session-key, and each gets its own entry). The `supervisor` entry is
 *     carrier-truth (boot = supervise, DR-FACE-2); the tick entry is the store's
 *     monotonic generation (the tick thread is the only clock).
 *   This spec is the fate-A UF proof: it drives the real Vite face in real
 *   Chromium against the real spawned gateway and asserts the LIVE strip carries
 *   the discipline — six state-thread entries, each once, day-now and session
 *   distinct, the supervisor thread surfaced, and the tick generation advancing
 *   off the live wire. No StatusStrip code is constructed: the organism already
 *   carries the intent, so the honest close is proof, not construction.
 * Does NOT own: the Tauri supervisor emitter (src-tauri) — in browser mode the
 *   supervisor events never fire (e2eShim.ts), so the supervisor thread reads
 *   `probing` here; its `supervised` transition is Tauri-host truth, covered by
 *   `pnpm smoke`. This spec proves the strip SURFACES the thread, not the host
 *   transition.
 */

import { expect, test } from '@playwright/test';

/** The six spine state-threads the strip surfaces, one entry each (DR-FACE-7 §3). */
const STATE_THREAD_TESTIDS = [
    'status-tick', // the store's monotonic generation — the only clock
    'status-daynow', // session-store thread 1: day-now anchor
    'status-session', // session-store thread 2: gateway session key
    'status-gateway', // provenance connection state
    'status-supervisor', // carrier-truth: boot = supervise (DR-FACE-2)
    'status-coordinate' // active coordinate selection
];

/** The SupervisorStatus vocabulary (src/state/stores.ts) — the strip renders one. */
const SUPERVISOR_STATES = /probing|external|starting|supervised|down/;

test('status strip: the live strip surfaces exactly the six spine state-threads, each once (DR-FACE-7 fate-A)', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-strip')).toBeVisible();

    // each spine state-thread is surfaced exactly once — not zero, not twice
    for (const testId of STATE_THREAD_TESTIDS) {
        await expect(page.getByTestId(testId), `state-thread ${testId} surfaced once`).toHaveCount(1);
    }

    // and NOTHING else lives in the strip: the entries ARE the state threads,
    // no more (the "exactly six" of 15.10/31.1, re-grounded as threads-not-stores)
    const spanCount = await page.locator('[data-testid="status-strip"] > span').count();
    expect(spanCount, 'the strip carries exactly the six state-thread entries').toBe(
        STATE_THREAD_TESTIDS.length
    );

    // threads, not stores: the session store carries TWO threads (day-now and
    // session-key) and each gets its OWN entry — they are not merged into a
    // single "session" store readout
    await expect(page.getByTestId('status-daynow')).toBeVisible();
    await expect(page.getByTestId('status-session')).toBeVisible();

    // the supervisor thread is a first-class entry (carrier-truth: boot =
    // supervise). Browser mode never fires the Tauri emitter, so it reads a real
    // vocabulary state (`probing` here); the entry EXISTING and rendering the
    // thread is the strip-discipline claim — the host transition is smoke's.
    await expect(page.getByTestId('status-supervisor')).toContainText(SUPERVISOR_STATES);
});

test('status strip: the tick entry is the live wire — real gateway connection and an advancing generation', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });

    // real connection against the spawned `epi gate start` — not a mount
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // the tick entry is the store's monotonic generation — the only clock. A
    // mounted mock cannot move it; only the real gateway heartbeat does.
    const readGeneration = async (): Promise<number> => {
        const text = (await page.getByTestId('status-tick').textContent()) ?? '';
        const match = text.match(/(\d+)/);
        return match ? Number(match[1]) : Number.NaN;
    };
    await expect
        .poll(readGeneration, { timeout: 20_000, message: 'first profile tick never arrived' })
        .toBeGreaterThan(0);
    const first = await readGeneration();
    await expect
        .poll(readGeneration, { timeout: 20_000, message: `tick stuck at generation ${first}` })
        .toBeGreaterThan(first);
});
