/**
 * Coordinate: M1' Review-fold 7-8-9 close reader (22.T22.5)
 * Actualises: a real nara session open/close persists the PASU-scoped aggregate
 *   bundle, governed readback returns only that aggregate, and Chromium renders
 *   the exact bound session in the active OmniPanel Review fold.
 * Does NOT own: contemplation law, PASU identity derivation, or Review routing.
 */

import { expect, Page, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

async function selectReview(page: Page): Promise<void> {
    const button = page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Review' })
        .first();
    await expect(button).toBeVisible();
    if (!/--selected/.test((await button.getAttribute('class')) ?? '')) {
        await button.click();
    }
    await expect(button).toHaveClass(/--selected/);
}

test('22.T22.5: real session close aggregate renders as the exact 7-8-9 Review reading', async ({
    page
}) => {
    const sessionId = `e2e-m1-close-${Date.now().toString(36)}`;
    const imported = (await gatewayRpc('sessions.import', {
        targetSessionKey: sessionId,
        sourceSessionKey: 'e2e-m1-close-origin',
        label: 'e2e M1 7-8-9 close'
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
                id: 'pi-e2e-close',
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
                virtue_witness_vector: [true, true, false, true, false, true, true, false, true],
                unsatisfied_constraints: ['#R0-0/1/A-T7-pending?'],
                coherence_score: 0.82
            }
        },
        m1_closure: {
            position_sequence: [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]
        },
        audio_octet: {
            position_sequence: [0, 1, 2, 3, 4, 5, 6, 7, 0]
        }
    })) as { close_ref: string };
    expect(closed.close_ref).toMatch(/^close-/);

    const aggregate = (await gatewayRpc('nara.session_close.read', {
        session_id: sessionId,
        close_ref: closed.close_ref
    })) as Record<string, unknown>;
    expect(aggregate.session_id).toBe(sessionId);
    expect(aggregate.close_ref).toBe(closed.close_ref);
    for (const forbidden of [
        'trajectory',
        'journal',
        'graphiti_relation',
        'pattern_packet',
        'body',
        'contemplation_object'
    ]) {
        expect(aggregate).not.toHaveProperty(forbidden);
    }

    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });
    await page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Sessions' })
        .click();
    const session = page.locator(`.face-active [data-testid="session-${sessionId}"]`);
    await expect(session).toBeVisible({ timeout: 15_000 });
    await session.click();
    await expect(page.getByTestId('status-session')).toContainText(sessionId);

    await selectReview(page);
    const reader = page.locator('.face-active [data-testid="m1-session-close-reader"]');
    await expect(reader).toBeVisible({ timeout: 15_000 });
    await expect(reader).toHaveAttribute('data-close-ref', closed.close_ref);
    await expect(reader.getByTestId('m1-session-close-m1-count')).toContainText('12/12');
    await expect(reader.getByTestId('m1-session-close-m1-count')).toContainText('+7 mod 12');
    await expect(reader.getByTestId('m1-session-close-audio-count')).toContainText('8/8');
    await expect(reader.getByTestId('m1-session-close-audio-count')).toContainText(
        'octave returned'
    );
    await expect(reader.getByTestId('m1-session-close-virtue-count')).toContainText(
        '6/9 · completion 67% · coherence 82%'
    );
    await expect(reader.getByTestId('m1-session-close-question-7')).toContainText(
        'twelve positions'
    );
    await expect(reader.getByTestId('m1-session-close-question-8')).toContainText(
        'octave-closure'
    );
    await expect(reader.getByTestId('m1-session-close-question-9')).toContainText(
        'nine virtue-poles'
    );
});
