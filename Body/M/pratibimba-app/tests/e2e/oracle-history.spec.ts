/**
 * Coordinate: M' M4' (oracle history viewer e2e — rerun 25.T25.9)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium + spawned gateway acceptance boundary
 * Actualises: the viewer against the REAL S0 cast ledger. The spec places two
 *   casts through the live gateway (`nara.oracle.cast` — the same wire the
 *   pane uses since 25.T25.24, so this is the ledger the user's own casts
 *   write) and then asserts the pane lists exactly those, newest first, with
 *   the modality the CLI recorded and a decay window resolved for the newest.
 *
 *   IT ALSO PINS THE DISCLOSURES. `show_history` carries no per-cast
 *   timestamp, so older rows must read `decay unknown` and not an assumed
 *   `closed`; and the 5.17 aliveness join has no producer, so the pane must
 *   name the unserved method rather than paint a badge. A future substrate
 *   that lands either wire will fail these lines, which is correct — the
 *   disclosure has to move when the truth does.
 * Does NOT own: the ledger (epi-cli `nara/oracle_route.rs`), the cast, or the
 *   host pane's own flows (integrated-loop.spec.ts).
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

test('25.T25.9: the viewer lists the REAL cast ledger, newest first, and discloses what the wire cannot say', async ({
    page
}) => {
    // Two real casts on the gateway's own ledger — an i-ching and a tarot, so
    // the modality mapping is exercised rather than asserted.
    const tarotQuestion = `history spec tarot ${Date.now().toString(36)}`;
    const ichingQuestion = `history spec iching ${Date.now().toString(36)}`;
    await gatewayRpc('nara.oracle.cast', { system: 'rws', question: tarotQuestion, yes: true });
    await gatewayRpc('nara.oracle.cast', { system: 'iching', question: ichingQuestion, yes: true });

    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // anchor the day — the host Oracle pane refuses to paint without one
    const editor = page.locator('.face-active [data-testid="m4-nara-editor"]');
    const beginButton = page.getByTestId('now-begin-today');
    await expect(editor.or(beginButton).first()).toBeVisible({ timeout: 20_000 });
    if (await beginButton.isVisible().catch(() => false)) {
        await beginButton.click().catch(() => undefined);
    }
    await expect(editor).toBeVisible({ timeout: 20_000 });

    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Oracle' }).click();
    const history = page.locator('.face-active [data-testid="oracle-history"]');
    await expect(history).toBeVisible({ timeout: 20_000 });
    await expect(history).toHaveAttribute('data-view-id', 'm4.nara.oracleHistory');
    await expect(history).toHaveAttribute('data-state', 'read');
    // the brief assigns this surface the handle-only tint
    await expect(history).toHaveClass(/mext-privacy-protected-local-handle-only/);

    const rows = history.getByTestId('oracle-history-rows');
    await expect(rows).toBeVisible({ timeout: 20_000 });
    const listed = await rows.locator('li').evaluateAll(nodes =>
        nodes.map(node => ({
            testid: node.getAttribute('data-testid'),
            modality: node.getAttribute('data-modality'),
            decay: node.getAttribute('data-decay'),
            text: (node.textContent ?? '').trim()
        }))
    );
    expect(listed.length, 'the ledger listed nothing after two real casts').toBeGreaterThanOrEqual(2);

    // newest first — the i-ching cast went last, so it heads the list
    expect(listed[0].modality).toBe('i-ching');
    expect(listed[0].text).toContain('history spec iching');
    expect(listed[1].modality).toBe('tarot');
    expect(listed[1].text).toContain('history spec tarot');

    // cast ids strictly descend — the producer's order, preserved not re-sorted
    const ids = listed.map(row => Number(row.testid?.replace('oracle-history-row-', '')));
    for (let i = 1; i < ids.length; i += 1) {
        expect(ids[i]).toBeLessThan(ids[i - 1]);
    }

    // the newest cast happened seconds ago, so its 4h window is open…
    expect(listed[0].decay).toBe('open');
    // …and every older row is honestly unknown, because the wire drops cast_at
    for (const row of listed.slice(1)) {
        expect(row.decay).toBe('unknown');
    }

    // the hygiene line is the CLI's own counter, not a client tally
    await expect(history.getByTestId('oracle-history-hygiene')).toContainText('casts today');
    await expect(history.getByTestId('oracle-history-hygiene')).toContainText('last cast');

    // the two unserved wires are NAMED, not silently omitted
    await expect(history.getByTestId('oracle-history-seam')).toContainText(
        'nara.oracle.update_position_state'
    );

    // privacy: the reading itself never reaches a row — it lives in the day
    // artifact the deposit wrote
    const text = (await history.textContent()) ?? '';
    expect(text).not.toContain('Tarot Draw #');
    expect(text).not.toContain('Primary hexagram');
});
