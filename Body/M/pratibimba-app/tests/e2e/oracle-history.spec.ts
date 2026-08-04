/**
 * Coordinate: M' M4' (oracle history viewer e2e — rerun 25.T25.9)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium + spawned gateway acceptance boundary
 * Actualises: the viewer against the REAL S0 cast and position-state ledgers.
 *   The spec places typed I-Ching and Tarot casts through the live gateway,
 *   advances one spread position, and proves newest-first timestamps, decay,
 *   aliveness, privacy, and read-only click-through in the carrier.
 * Does NOT own: the ledger (epi-cli `nara/oracle_route.rs`), the cast, or the
 *   host pane's own flows (integrated-loop.spec.ts).
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

test('25.T25.9: structured history carries real timestamps, aliveness, and read-only casts', async ({
    page
}) => {
    const tarotQuestion = `history spec tarot ${Date.now().toString(36)}`;
    const ichingQuestion = `history spec iching ${Date.now().toString(36)}`;
    const tarot = await gatewayRpc('nara.oracle.cast_tarot', {
        system: 'thoth',
        question: tarotQuestion,
        spreadSize: 4,
        yes: true
    }) as { castId: number; spreadId: string };
    const iching = await gatewayRpc('nara.oracle.cast_iching', {
        question: ichingQuestion,
        yes: true
    }) as { castId: number; spreadId: string };
    await gatewayRpc('nara.oracle.update_position_state', {
        spreadId: iching.spreadId,
        positionIndex: 0,
        liveState: 'muting'
    });

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
    expect(listed[0].testid).toBe(`oracle-history-row-${iching.castId}`);
    expect(listed[1].testid).toBe(`oracle-history-row-${tarot.castId}`);

    // cast ids strictly descend — the producer's order, preserved not re-sorted
    const ids = listed.map(row => Number(row.testid?.replace('oracle-history-row-', '')));
    for (let i = 1; i < ids.length; i += 1) {
        expect(ids[i]).toBeLessThan(ids[i - 1]);
    }

    // Both casts happened seconds ago, and the producer supplied each cast_at.
    expect(listed[0].decay).toBe('open');
    expect(listed[1].decay).toBe('open');

    await expect(history.getByTestId(`oracle-history-live-${iching.castId}`)).toContainText('muting');
    await expect(history.getByTestId(`oracle-history-live-${iching.castId}`)).toContainText('generating');
    await expect(history.getByTestId('oracle-history-count')).toContainText('showing');

    await history.getByRole('button', { name: `open cast ${iching.castId} read only` }).click();
    const result = page.getByTestId('oracle-result');
    await expect(result).toHaveAttribute('data-read-only', 'true');
    await expect(result.getByTestId('oracle-iching-mode')).toBeVisible();
    await expect(result.getByRole('button', { name: /advance position/ })).toHaveCount(0);

    // Interpretation prose remains behind the protected-local artifact handle.
    const text = (await history.textContent()) ?? '';
    expect(text).not.toContain('Tarot Draw #');
    expect(text).not.toContain('Primary hexagram');
});
