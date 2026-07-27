/**
 * Coordinate: M' M4' (drivable-loop spec: session-close ceremony — 25.T25.19)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / real spawned gateway carrier proof
 * Actualises: the UF half of 25.19. The unit suites prove the parse law; only
 *   the running app can prove the ceremony reads a REAL close — so this spec
 *   drives one: it imports a session, opens it, closes it through the live
 *   `nara.session_close` (the same house idiom m1-session-close-reader.spec.ts
 *   uses), adopts that session in the shell, opens the "Session close" tab, and
 *   asserts the ceremony renders THAT close: its contemplation handle, its
 *   4'-5'-0' triplet, its M1 orbit, and nine virtue lamps lit exactly where the
 *   verifier witnessed (6 of 9 for this closure).
 *
 *   It also proves the privacy law over live data: the PASU quintessence
 *   reflection reaches the DOM as an 8-character handle or not at all.
 * Does NOT own: the close law (S0 nara), the bundle parse (m1SessionCloseReader),
 *   or the ceremony's own projection law (m4SessionCloseCeremony.ts).
 * Contract: [[M4'-SPEC]] + rerun tranche [[25.T25.19]].
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

/** The verifier vector this closure carries — 6 of 9 witnessed. */
const WITNESS = [true, true, false, true, false, true, true, false, true];

test('25.T25.19: the ceremony witnesses a REAL session close', async ({ page }) => {
    const sessionId = `e2e-ceremony-${Date.now().toString(36)}`;
    const imported = (await gatewayRpc('sessions.import', {
        targetSessionKey: sessionId,
        sourceSessionKey: 'e2e-ceremony-origin',
        label: 'e2e session-close ceremony'
    })) as { canonicalKey: string };
    expect(imported.canonicalKey).toBe(sessionId);

    const opened = (await gatewayRpc('nara.session_open', {
        session_id: sessionId,
        kairos: 1_700_000_000_000
    })) as { protein_handle: string };
    expect(opened.protein_handle).toBeTruthy();

    const closed = (await gatewayRpc('nara.session_close', {
        session_id: sessionId,
        protein_handle: opened.protein_handle,
        kairos_close: 1_700_000_000_999,
        contemplation_object: {
            session_id: sessionId,
            q_nara: 'q_Nara',
            pi_instance: {
                id: 'pi-e2e-ceremony',
                recognition_state: 'returned through the disclosed gauge',
                loaded_agents: ['Nous', 'Moirai', 'Sophia', 'Psyche']
            },
            engaged_coordinates: [
                { coordinate: 'M3.COMP', target_resonance_vector: [0.2, 0.4, 0.6] },
                { coordinate: 'M3.MOVE', target_resonance_vector: [0.1, 0.3, 0.5] },
                { coordinate: 'M3.RES', target_resonance_vector: [0.9, 0.7, 0.5] }
            ],
            trajectory: [
                { tick_id: 't0', gauge: 'COMP', actual_resonance: [0.2, 0.4, 0.6], codon: 'I' },
                { tick_id: 't1', gauge: 'MOVE', actual_resonance: [0.1, 0.3, 0.5], codon: 'II' },
                { tick_id: 't2', gauge: 'RES', actual_resonance: [0.9, 0.7, 0.5], codon: 'III' }
            ],
            psyche_anchor: { cards: ['The Magician'], codons: ['I'] },
            verifier_report: {
                virtue_witness_vector: WITNESS,
                unsatisfied_constraints: ['#R0-0/1/A-T7-pending?'],
                coherence_score: 0.82
            }
        },
        m1_closure: { position_sequence: [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5] },
        audio_octet: { position_sequence: [0, 1, 2, 3, 4, 5, 6, 7, 0] }
    })) as { close_ref: string };
    expect(closed.close_ref).toMatch(/^close-/);

    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // adopt the closed session in the shell — the ceremony follows the shell's
    // own session key, never a key of its own
    await page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Sessions' })
        .click();
    const session = page.locator(`.face-active [data-testid="session-${sessionId}"]`);
    await expect(session).toBeVisible({ timeout: 15_000 });
    await session.click();
    await expect(page.getByTestId('status-session')).toContainText(sessionId);

    await page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Session close' })
        .click();
    const ceremony = page.getByTestId('session-close-ceremony');
    await expect(ceremony).toBeVisible({ timeout: 20_000 });
    await expect(ceremony).toHaveAttribute('data-session-key', sessionId);
    await expect(ceremony).toHaveAttribute('data-load-state', 'loaded', { timeout: 20_000 });

    // (a) the delta's handle + the real 4'-5'-0' triplet
    await expect(page.getByTestId('ceremony-contemplation-ref')).toHaveText(/^contemplation-/);
    await expect(page.getByTestId('ceremony-triplet-llm')).toContainText('4 agents');
    await expect(page.getByTestId('ceremony-triplet-verifier')).toContainText('coherence 0.82');

    // (b) the Möbius section: the M1 orbit really closed, and the quintessence
    // reflection is a HANDLE or an honest absence — never a full hash
    await expect(page.getByTestId('ceremony-closure')).toContainText('closed');
    const handle = page.getByTestId('ceremony-quintessence-handle');
    const absent = page.getByTestId('ceremony-quintessence-absent');
    await expect(handle.or(absent)).toBeVisible();
    if (await handle.isVisible()) {
        const text = (await handle.textContent()) ?? '';
        const shown = /quintessence ([0-9a-fA-F]+)…/.exec(text)?.[1] ?? '';
        expect(shown.length, 'only a handle may reach the DOM').toBeLessThanOrEqual(8);
    }

    // (c) the four Arch seeds carry their 19.9 registers
    for (const [archetype, register] of [
        [3, 'speech'],
        [5, 'relationship'],
        [7, 'action'],
        [9, 'completion']
    ] as const) {
        await expect(page.getByTestId(`ceremony-seed-${register}`)).toHaveAttribute(
            'data-archetype',
            String(archetype)
        );
    }

    // (d) nine lamps, lit exactly where THIS closure's verifier witnessed
    for (const [index, lit] of WITNESS.entries()) {
        await expect(page.getByTestId(`ceremony-lamp-${index}`)).toHaveAttribute(
            'data-lit',
            String(lit)
        );
    }
});
