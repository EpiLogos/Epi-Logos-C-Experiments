/**
 * Coordinate: M' 4-5-0 (contemplation flow UI-flow proof, 29.T29.9)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #5 — the contemplation read across the personal composition
 * Actualises: the 4'-5'-0' contemplation directive resolving at the REAL
 *   mounted engine root against a spawned gateway. Track 29 is UF class, and
 *   the thing a jsdom mount cannot show is that the composition really asks the
 *   live gateway for the latest close and renders what came back.
 *
 *   THIS SPEC DRIVES A REAL CLOSE FIRST. An earlier draft only asserted the
 *   empty reading, which was worthless as a regression net: the e2e harness
 *   makes a fresh `EPI_GATE_STATE_ROOT` per run (global-setup.ts), so with no
 *   close in the vault the surface reads `awaiting-close` — and
 *   `awaiting-close` is *exactly* what a BROKEN persisted read also produces.
 *   The test could not tell working from broken. So it opens a session and
 *   closes it through the live `nara.session_close` (the house idiom from
 *   m4-session-close-ceremony.spec.ts / m1-session-close-reader.spec.ts), then
 *   asserts the composition renders THAT close's own witness vector.
 * Public surface: Playwright test for the personal-recognition-engine
 *   contemplation data attributes.
 * Does NOT own: the directive itself (`engine/contemplationFlowDirector.ts`),
 *   the persisted-projection reader (`panes/m4SessionCloseCeremony.ts`), the
 *   close law (S0 nara), or the three slot renderers.
 * Contract: [[M'-SYSTEM-SPEC]] + rerun [[29-integrated-plugins-composition-deep]]
 *   T29.9 (closes the 19.6 / 19.7 composition path).
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

/** The six spec-ahead asks 29.9 names rather than renders. */
const UNAVAILABLE = [
    'wisdom-delta-byte-tape',
    'gauge-trio-coverage-fractions',
    'four-charge-balance',
    'resonance-72-overlay',
    'mobius-quaternion-arrow',
    'canvas-inscription-write'
].join(',');

/** The five readings the PERSISTED projection cannot serve. */
const LIVE_ONLY = [
    'wisdom-delta',
    'recognition-state',
    'loaded-agents',
    'unsatisfied-constraints',
    'symbolic-round-trips'
].join(',');

/**
 * This closure's verifier vector — 7 of 9 witnessed, and deliberately NOT the
 * same shape as the ceremony spec's, so a lamp count of 7 can only have come
 * from this close.
 */
const WITNESS = [true, true, true, true, true, false, true, false, true];
const LAMPS_LIT = String(WITNESS.filter(Boolean).length);

test('the personal composition renders a REAL session close across its three slots (29.T29.9)', async ({
    page
}) => {
    const sessionId = `e2e-contemplation-${Date.now().toString(36)}`;
    const imported = (await gatewayRpc('sessions.import', {
        targetSessionKey: sessionId,
        sourceSessionKey: 'e2e-contemplation-origin',
        label: 'e2e contemplation flow'
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
                id: 'pi-e2e-contemplation',
                recognition_state: 'recognition-state integrates close-of-session contour',
                loaded_agents: ['Nous', 'Moirai', 'Sophia', 'Psyche']
            },
            engaged_coordinates: [
                { coordinate: 'M3.COMP', target_resonance_vector: [0.2, 0.4, 0.6] },
                { coordinate: 'M3.MOVE', target_resonance_vector: [0.1, 0.3, 0.5] },
                { coordinate: 'M3.RES', target_resonance_vector: [0.9, 0.7, 0.5] }
            ],
            trajectory: [
                { tick_id: 't0', gauge: 'COMP', actual_resonance: [0.2, 0.4, 0.6], codon: 'I' },
                { tick_id: 't1', gauge: 'MOVE', actual_resonance: [0.1, 0.3, 0.5], codon: 'V' },
                { tick_id: 't2', gauge: 'RES', actual_resonance: [0.9, 0.7, 0.5], codon: 'X' }
            ],
            // Two cards, one of which has no matching codon in the trajectory —
            // so the ribbon has something real to be partial about.
            psyche_anchor: { cards: ['The Fool', 'The Star'], codons: ['I', 'XXI'] },
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
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });

    // The composition follows the shell's session key, never one of its own —
    // so the close only reaches it once that session is adopted.
    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Sessions' }).click();
    const session = page.locator(`.face-active [data-testid="session-${sessionId}"]`);
    await expect(session).toBeVisible({ timeout: 15_000 });
    await session.click();
    await expect(page.getByTestId('status-session')).toContainText(sessionId);

    const shell = page.getByTestId('shell');
    if ((await shell.getAttribute('data-face')) !== '1') {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', '1', { timeout: 20_000 });

    const nowTab = page.locator('.face-active .flexlayout__tab_button', { hasText: 'Now' }).first();
    await expect(nowTab).toBeVisible({ timeout: 20_000 });
    await nowTab.click();

    const engine = page.getByTestId('personal-recognition-engine');
    await expect(engine).toBeVisible({ timeout: 20_000 });

    // (a) the directive read the REAL close. `blocked` is deliberately not
    // tolerated — it means the carrier's reader refused what the gateway
    // returned, and accepting it here is how a parse regression would hide.
    await expect(
        engine,
        'the composition never resolved the close it was given'
    ).toHaveAttribute('data-contemplation-state', 'ready', { timeout: 20_000 });
    await expect(engine).toHaveAttribute('data-contemplation-source', 'persisted');

    // (b) all three geometric slots carry their reading, at their own positions
    await expect(engine).toHaveAttribute('data-contemplation-slots', "4',5',0'");

    // (c) the nine lamps read THIS closure's witness vector — 7 of 9. A stale or
    // fabricated reading cannot produce this number by accident.
    await expect(engine).toHaveAttribute('data-contemplation-lamps', LAMPS_LIT);

    // (d) the five readings the persisted projection cannot serve are named,
    // rather than rendered as absent
    await expect(engine).toHaveAttribute('data-contemplation-live-only', LIVE_ONLY);

    // (e) the six spec-ahead asks with no wire source are named on the live
    // surface — the tranche's honesty claim, surviving into the real DOM
    await expect(engine).toHaveAttribute('data-contemplation-unavailable', UNAVAILABLE);

    // (f) the reading summary states what landed and what this wire cannot carry
    const reading = (await engine.getAttribute('data-contemplation-reading')) ?? '';
    expect(reading).toContain("0' 7/9 virtues witnessed");
    expect(reading).toContain('not on this wire: wisdom-delta-byte-tape');

    // (g) `composition.contemplation.complete` — declared since 29.11, emitted by
    // nothing until this tranche — reaches the OmniPanel dispatch trace.
    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Dispatch' }).click();
    const trace = page.getByTestId('composition-dispatch-trace');
    await expect(trace).toBeVisible({ timeout: 20_000 });
    await expect(trace).toContainText('composition.contemplation.complete', { timeout: 20_000 });

    // The 0'/UNDER-LAYER carrier the directive feeds is really on this face.
    await nowTab.click();
    await expect(page.getByTestId('m0-virtue-witness-panel')).toBeVisible({ timeout: 20_000 });
});
