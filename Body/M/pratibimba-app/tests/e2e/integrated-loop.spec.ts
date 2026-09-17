/**
 * Coordinate: M' (drivable-loop spec: T17 integrated cross-layer smoke)
 * Actualises: ONE flow asserted at EVERY layer — cutting any layer fails it.
 *   The flow is the oracle cast (the deepest honest chain on this basis):
 *
 *     wire (S3)   real `profile.update` frames captured on the app's OWN
 *                 WebSocket; generations strictly advance; the DOM tick value
 *                 must be one the wire actually carried (wire↔store↔DOM
 *                 congruence — a store mocked without the wire fails it) — AND
 *                 (25.T25.24/25.T25.8) the typed cast REQUEST FRAME itself,
 *                 answered by the gateway on the same request id
 *     UI          OraclePane cast button → rendered draw output `Tarot Draw #N`
 *     S0 (CLI)    the gateway runs the real governed Tarot cast under
 *                 `nara.oracle.cast_tarot` (isolated nara home); its ledger
 *                 gains EXACTLY one line whose cast_id is the same N the UI
 *                 rendered
 *     S1 (vault)  the deposited day artifact's raw disk bytes carry the same
 *                 draw output + typed C-family frontmatter
 *     UI (store)  the deposit handle appears in the journal timeline
 *     rehydrate   a full reload re-lists the artifact from disk, not memory
 *
 *   Cut-points guarded: gateway down → no connect/no frames AND no cast at all
 *   (25.T25.24 removed the silent Tauri fallback, so a dead gateway is a
 *   refusal, not a quieter path to the same artifact); the cast reverting to
 *   the Tauri `oracle_cast` spawn → the cast frame never appears on the socket;
 *   wire→store seam cut → congruence fails; the CLI replaced by a canned result
 *   → cast-id/ledger congruence fails (and the companion negative test fails);
 *   vault write cut → /raw 404s; vault read cut → timeline/reload fail.
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';
import { SIDECAR_URL, todayId } from './e2e-env';

/** Lines of the real S0 cast ledger (epi-cli's history.jsonl), '' if absent. */
async function ledgerText(request: { get: (url: string) => Promise<{ ok(): boolean; text(): Promise<string> }> }): Promise<string> {
    const res = await request.get(`${SIDECAR_URL}/nara-history`);
    return res.ok() ? await res.text() : '';
}

test('integrated loop: cast crosses UI → CLI ledger → vault bytes → timeline → reload, with live wire congruence', async ({
    page,
    request
}) => {
    // ── wire layer capture: wrap the page's WebSocket BEFORE any app code runs
    // (records what the REAL gateway sends the app's own socket — it cannot
    // invent frames, only witness them)
    await page.addInitScript(() => {
        const generations: number[] = [];
        (window as unknown as { __e2eProfileGenerations: number[] }).__e2eProfileGenerations = generations;
        // 25.T25.24: the CAST FRAME itself, not only the profile-tick spine.
        // A cast is a gateway act; if the pane ever reverts to the Tauri
        // `oracle_cast` spawn the socket carries nothing and this stays empty,
        // which is exactly the regression this capture exists to catch.
        const sent: { method: string; id: unknown }[] = [];
        const answered: { id: unknown; ok: boolean }[] = [];
        (window as unknown as { __e2eSentFrames: typeof sent }).__e2eSentFrames = sent;
        (window as unknown as { __e2eAnsweredFrames: typeof answered }).__e2eAnsweredFrames = answered;
        const NativeWebSocket = window.WebSocket;
        function CapturingWebSocket(this: WebSocket, url: string, protocols?: string | string[]) {
            const ws = protocols === undefined ? new NativeWebSocket(url) : new NativeWebSocket(url, protocols);
            const nativeSend = ws.send.bind(ws);
            ws.send = (data: Parameters<WebSocket['send']>[0]) => {
                try {
                    const frame = JSON.parse(String(data));
                    if (frame?.type === 'req' && typeof frame.method === 'string') {
                        sent.push({ method: frame.method, id: frame.id });
                    }
                } catch {
                    /* binary/non-JSON frames are not ours to judge */
                }
                nativeSend(data);
            };
            ws.addEventListener('message', evt => {
                try {
                    const frame = JSON.parse(String((evt as MessageEvent).data));
                    if (frame?.event === 'profile.update' || frame?.event === 'profile') {
                        const generation = (frame.payload ?? frame.params ?? frame)?.generation;
                        if (typeof generation === 'number') {
                            generations.push(generation);
                        }
                    }
                    if (frame?.type === 'res') {
                        answered.push({ id: frame.id, ok: !frame.error });
                    }
                } catch {
                    /* binary/non-JSON frames are not ours to judge */
                }
            });
            return ws;
        }
        CapturingWebSocket.prototype = NativeWebSocket.prototype;
        Object.assign(CapturingWebSocket, {
            CONNECTING: NativeWebSocket.CONNECTING,
            OPEN: NativeWebSocket.OPEN,
            CLOSING: NativeWebSocket.CLOSING,
            CLOSED: NativeWebSocket.CLOSED
        });
        (window as unknown as { WebSocket: unknown }).WebSocket = CapturingWebSocket;
    });

    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // ── pre-state: the S0 ledger has never seen this question
    const question = `what turns in the integrated loop ${Date.now().toString(36)}`;
    const ledgerBefore = await ledgerText(request);
    expect(ledgerBefore).not.toContain(question);
    const linesBefore = ledgerBefore.split('\n').filter(Boolean).length;

    // ── anchor the day (idempotent: click the gesture if the day is unanchored,
    // otherwise the app already adopted today's folder from the real vault)
    const editor = page.locator('.face-active [data-testid="m4-nara-editor"]');
    const beginButton = page.getByTestId('now-begin-today');
    await expect(editor.or(beginButton).first()).toBeVisible({ timeout: 15_000 });
    if (await beginButton.isVisible().catch(() => false)) {
        await beginButton.click().catch(() => undefined); // adoption may race the gesture
    }
    await expect(editor).toBeVisible({ timeout: 15_000 });
    const dayId = todayId();

    // ── UI layer: cast through the pane
    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Oracle' }).click();
    await page.getByTestId('oracle-mode-tarot').click();
    await page.getByTestId('oracle-deck').selectOption('rws');
    await page.getByTestId('oracle-question').fill(question);
    await page.getByTestId('oracle-cast').click();
    const result = page.getByTestId('oracle-result');
    await expect(result).toBeVisible({ timeout: 20_000 });
    const resultText = (await result.textContent()) ?? '';
    const castIdMatch = resultText.match(/Tarot Draw #(\d+)/);
    expect(castIdMatch, `UI did not render a real draw: ${resultText.slice(0, 200)}`).toBeTruthy();
    const castId = Number(castIdMatch![1]);
    expect(resultText).toContain(question);

    // ── S3 layer (25.T25.24): the CAST CROSSED THE WIRE. Read now, before the
    // reload wipes the capture. This is the assertion that fails if the pane
    // ever goes back to spawning the CLI through the Tauri `oracle_cast`
    // bypass — that path sends nothing on this socket, so the frame is absent
    // even though every layer below (ledger, vault, timeline) still passes.
    const castFrames = await page.evaluate(
        () =>
            (window as unknown as { __e2eSentFrames?: { method: string; id: unknown }[] })
                .__e2eSentFrames ?? []
    );
    const castFrame = castFrames.find(frame => frame.method === 'nara.oracle.cast_tarot');
    expect(
        castFrame,
        `the cast never crossed the app's own socket — methods sent: ${castFrames
            .map(frame => frame.method)
            .join(',')}`
    ).toBeTruthy();
    // …and the gateway ANSWERED that exact request id, so the rendered draw is
    // the gateway's reply and not something the client made up around it.
    const answered = await page.evaluate(
        () =>
            (window as unknown as { __e2eAnsweredFrames?: { id: unknown; ok: boolean }[] })
                .__e2eAnsweredFrames ?? []
    );
    expect(
        answered.some(frame => frame.id === castFrame!.id && frame.ok),
        `the gateway never answered cast request id ${String(castFrame!.id)}`
    ).toBe(true);

    // the deposit handle the pane returned
    const linkText = (await page.getByTestId('oracle-artifact-link').textContent()) ?? '';
    const pathMatch = linkText.match(/Empty\/Present\/\S+\.md/);
    expect(pathMatch, `no artifact path in link: ${linkText}`).toBeTruthy();
    const artifactPath = pathMatch![0];
    expect(artifactPath).toContain(`Empty/Present/${dayId}/oracle-`);

    // ── S0 layer: the CLI's own cast ledger gained EXACTLY this cast
    const ledgerAfter = await ledgerText(request);
    expect(ledgerAfter).toContain(question);
    const ledgerLines = ledgerAfter.split('\n').filter(Boolean);
    expect(ledgerLines.length).toBe(linesBefore + 1);
    const lastEntry = JSON.parse(ledgerLines[ledgerLines.length - 1]) as {
        cast_id: number;
        question: string;
        system: string;
    };
    expect(lastEntry.question).toBe(question);
    expect(lastEntry.system).toBe('rws');
    // three-way congruence: the ledger's cast_id IS the N the UI rendered
    expect(lastEntry.cast_id).toBe(castId);

    // ── S1 layer: the REAL artifact bytes on the vault's disk
    const raw = await request.get(`${SIDECAR_URL}/raw?path=${encodeURIComponent(artifactPath)}`);
    expect(raw.ok(), `raw read of ${artifactPath} failed`).toBeTruthy();
    const bytes = await raw.text();
    expect(bytes).toContain(`Tarot Draw #${castId}`);
    expect(bytes).toContain(question);
    expect(bytes.startsWith('---\n')).toBeTruthy();
    expect(bytes).toContain('c_4_artifact_role: "oracle-cast"');
    expect(bytes).toContain('c_2_oracle_system: "rws"');
    expect(bytes).toContain(`c_3_day_id: "${dayId}"`);
    expect(bytes).toContain(`c_3_oracle_cast_id: ${castId}`);
    expect(bytes).toContain(`c_3_oracle_spread_id: "oracle-spread-${castId}"`);
    expect(bytes).toContain(`oracle-frame://cast/${castId}`);

    // ── UI store layer: the deposit handle surfaces in the day container.
    // (25.T25.3 made the Journal border tab the NOW-inscription timeline —
    // sessions only, by spec — so a day-ROOT artifact's UI home is the day
    // calendar's container view, which classifies it off its real
    // c_4_artifact_role frontmatter.)
    const artifactName = artifactPath.split('/').pop() ?? '';
    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Calendar' }).click();
    await page.getByTestId(`cal-day-${dayId}`).click();
    await expect(page.getByTestId(`day-artifact-${artifactName}`)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId(`day-artifact-role-${artifactName}`)).toContainText('oracle');

    // ── rehydration layer: a fresh boot re-lists the artifact from the vault,
    // not from component state
    await page.reload();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Calendar' }).click();
    await page.getByTestId(`cal-day-${dayId}`).click();
    await expect(page.getByTestId(`day-artifact-${artifactName}`)).toBeVisible({ timeout: 15_000 });

    // ── wire layer: the reloaded document's OWN socket carried real profile
    // frames, strictly advancing, and the DOM tick shows a generation the wire
    // actually delivered (wire ↔ store ↔ DOM congruence)
    const readWireGenerations = () =>
        page.evaluate(
            () => (window as unknown as { __e2eProfileGenerations?: number[] }).__e2eProfileGenerations ?? []
        );
    await expect
        .poll(async () => (await readWireGenerations()).length, {
            timeout: 20_000,
            message: 'no profile.update frames crossed the app socket after reload'
        })
        .toBeGreaterThanOrEqual(2);
    const tickText = (await page.getByTestId('status-tick').textContent()) ?? '';
    // 32.T32.9: the entry reads `tick:n gen:g` — n is this window's observed
    // advances, g is the kernel generation. Read the NAMED group: taking the
    // first number in the entry was only ever right while the entry printed one.
    const domGeneration = Number(tickText.match(/gen:(\d+)/)?.[1] ?? Number.NaN);
    expect(Number.isFinite(domGeneration), `status-tick shows no generation: "${tickText}"`).toBeTruthy();
    const wireGenerations = await readWireGenerations();
    for (let i = 1; i < wireGenerations.length; i += 1) {
        expect(wireGenerations[i]).toBeGreaterThan(wireGenerations[i - 1]);
    }
    expect(
        wireGenerations,
        `DOM tick ${domGeneration} was never carried by the wire (${wireGenerations.join(',')})`
    ).toContain(domGeneration);
});

test('cut-point: replacing the real CLI with a canned success cannot stand — the GATEWAY rejects an invalid system', async ({
    request
}) => {
    const ledgerBefore = await ledgerText(request);
    // 25.T25.24 moved this cut-point onto the seam the pane now uses. The UI
    // select only offers valid systems, so the probe goes at the wire: the REAL
    // epi binary, under the gateway, must be the judge of what a system is.
    await expect(
        gatewayRpc('nara.oracle.cast_tarot', {
            system: 'tarot',
            question: 'cut-point probe',
            spreadSize: 3,
            yes: true
        })
    ).rejects.toThrow(/Unknown tarot system/);
    // and the failed cast mutated NOTHING: the S0 ledger is byte-identical
    expect(await ledgerText(request)).toBe(ledgerBefore);
});

test('cut-point: the offline fallback is still the real CLI, and still not a surface path', async ({
    request
}) => {
    // `oracle_cast` survives as the offline fallback (src-tauri/src/oracle.rs).
    // It must stay REAL — a canned success here would make the fallback a lie —
    // while the pane no longer calls it. This probes the shim seam directly.
    // It deliberately makes NO claim about /nara-history: since 25.T25.24 that
    // route serves the GATEWAY's ledger, and the fallback spawns under its own
    // isolated home, so asserting the gateway ledger is unchanged here would
    // pass for a reason having nothing to do with what is being tested.
    const res = await request.post(`${SIDECAR_URL}/invoke`, {
        data: { cmd: 'oracle_cast', args: { system: 'tarot', question: 'fallback probe', dayId: todayId() } }
    });
    const body = (await res.json()) as { ok: boolean; error?: string };
    expect(body.ok).toBe(false);
    expect(body.error ?? '').toContain('Unknown tarot system');
});

test('cut-point: a deposition with no cast behind it is refused', async ({ request }) => {
    // The deposit seam is S1 authority only — it never invents a cast. An empty
    // output must not become an empty artifact on the user's day.
    const res = await request.post(`${SIDECAR_URL}/invoke`, {
        data: {
            cmd: 'oracle_deposit',
            args: { system: 'rws', question: 'empty deposit probe', dayId: todayId(), output: '   ' }
        }
    });
    const body = (await res.json()) as { ok: boolean; error?: string };
    expect(body.ok).toBe(false);
    expect(body.error ?? '').toContain('empty cast');
});

test('cut-point: the persistence read is real — a path with no file behind it 404s', async ({ request }) => {
    const missing = await request.get(
        `${SIDECAR_URL}/raw?path=${encodeURIComponent(`Empty/Present/${todayId()}/oracle-000000-never-cast.md`)}`
    );
    expect(missing.status()).toBe(404);
});
