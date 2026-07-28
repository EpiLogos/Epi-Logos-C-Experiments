/**
 * Coordinate: M' M4' (drivable-loop spec: psyche-anchor coherence — 25.T25.20)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / real spawned gateway carrier proof
 * Actualises: the UF half of 25.20, and the only proof that the tranche's
 *   SUBSTRATE widening is real end-to-end. The unit suites prove the arithmetic
 *   against a fixture; a fixture cannot prove that the anchor a caller hands to
 *   `nara.session_close` survives S3's evaluation, S0's persistence and the
 *   contemplation readback to reach the DOM. So this spec closes a REAL session
 *   with a two-card anchor whose codons are deliberately split — "The Magician"
 *   on codon I, which the trajectory walks, and "The Hermit" on codon IX, which
 *   it never reaches — and asserts the panel names WHICH card broke coherence.
 *
 *   Before the widening the projection carried only the verdict and a count, so
 *   this assertion was unmakeable: both cards would have been indistinguishable
 *   behind a single `false`.
 * Does NOT own: the close law (S0 nara), the anchor evaluation (S3 dispatch), or
 *   the coherence arithmetic (m4PsycheAnchorCoherence.ts).
 * Contract: [[M4'-SPEC]] + rerun tranche [[25.T25.20]] (consumes 19.4 + 19.5).
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

const WITNESS = [true, true, false, true, false, true, true, false, true];

test('25.T25.20: the anchor panel names which card a REAL close left unmatched', async ({
    page
}) => {
    const sessionId = `e2e-anchor-${Date.now().toString(36)}`;
    const imported = (await gatewayRpc('sessions.import', {
        targetSessionKey: sessionId,
        sourceSessionKey: 'e2e-anchor-origin',
        label: 'e2e psyche-anchor coherence'
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
                id: 'pi-e2e-anchor',
                recognition_state: 'returned through the disclosed gauge',
                loaded_agents: ['Nous', 'Moirai', 'Sophia', 'Psyche']
            },
            engaged_coordinates: [
                { coordinate: 'M3.COMP', target_resonance_vector: [0.2, 0.4, 0.6] },
                { coordinate: 'M3.MOVE', target_resonance_vector: [0.1, 0.3, 0.5] },
                { coordinate: 'M3.RES', target_resonance_vector: [0.9, 0.7, 0.5] }
            ],
            // The trajectory walks I, II, III — so codon IX never appears.
            trajectory: [
                { tick_id: 't0', gauge: 'COMP', actual_resonance: [0.2, 0.4, 0.6], codon: 'I' },
                { tick_id: 't1', gauge: 'MOVE', actual_resonance: [0.1, 0.3, 0.5], codon: 'II' },
                { tick_id: 't2', gauge: 'RES', actual_resonance: [0.9, 0.7, 0.5], codon: 'III' }
            ],
            psyche_anchor: {
                cards: ['The Magician', 'The Hermit'],
                codons: ['I', 'IX']
            },
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

    // The panel follows the shell's session key, never one of its own.
    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Sessions' }).click();
    const session = page.locator(`.face-active [data-testid="session-${sessionId}"]`);
    await expect(session).toBeVisible({ timeout: 15_000 });
    await session.click();
    await expect(page.getByTestId('status-session')).toContainText(sessionId);

    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Anchor' }).click();
    const panel = page.getByTestId('psyche-anchor-coherence');
    await expect(panel).toBeVisible({ timeout: 20_000 });
    await expect(panel).toHaveAttribute('data-session-key', sessionId);
    await expect(panel).toHaveAttribute('data-load-state', 'loaded', { timeout: 20_000 });
    // Not `unwidened` — this close was persisted by the widened substrate, so
    // the per-card reading really came back over the wire.
    await expect(panel).toHaveAttribute('data-coherence-state', 'ready');

    // The coherence indicator over live data: 1 of 2, 50 %.
    await expect(page.getByTestId('anchor-score')).toContainText('1 of 2 anchor cards matched');
    await expect(page.getByTestId('anchor-score')).toContainText('50%');
    await expect(page.getByTestId('anchor-verdict')).toHaveAttribute('data-verdict', 'incoherent');

    // The per-card hit list — the assertion the un-widened projection could not
    // support, because both cards hid behind one `false`.
    const magician = page.getByTestId('anchor-card-0');
    await expect(magician).toContainText('The Magician');
    await expect(magician).toHaveAttribute('data-card-state', 'matched');

    const hermit = page.getByTestId('anchor-card-1');
    await expect(hermit).toContainText('The Hermit');
    await expect(hermit).toContainText('IX');
    await expect(hermit).toHaveAttribute('data-card-state', 'unmatched');

    // Privacy holds over live data: this is a handle-only surface, and the
    // session trajectory that produced the verdict never crosses to it.
    await expect(panel).toHaveClass(/mext-privacy-protected-local-handle-only/);
    const rendered = (await panel.textContent()) ?? '';
    expect(rendered).not.toContain('returned through the disclosed gauge');
    expect(rendered).not.toContain('q_Nara');
});
