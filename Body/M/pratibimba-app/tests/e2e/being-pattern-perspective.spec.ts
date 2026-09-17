/**
 * Coordinate: M' M4' (being-pattern perspective e2e — rerun 25.T25.22)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium + spawned gateway acceptance boundary
 * Actualises: the card against the REAL CCT-21 producer. The four
 *   `s3'.being_pattern.*` arms are registered at S3 (`S3_METHODS` /
 *   `register_s3_handlers`, `Body/S/S3/gateway/src/being_pattern.rs`), so this
 *   spec does not assert a dark seam — it OBSERVES two beings into the live
 *   stream over the real wire, PROJECTS their relation edge, and then proves
 *   the card reads that exact generation out of the running gateway.
 *
 *   The observations are placed by the spec, not by the card, and that is the
 *   point: `observe` requires the caller to supply `perspectiveRole` and
 *   `monopolyOperator` — the reading itself — so the card must never call it.
 *   Here the spec plays the upstream observer, and the card plays what it is:
 *   a read.
 *
 *   Two negatives ride along, because they are the tranche's law: no raw
 *   protected body reaches the DOM, and no accept/apply affordance exists on
 *   an `ActualisingOne` reading — only the emit-review-only candidate arm and
 *   the review fold.
 * Does NOT own: the producer, the host pane's own flows
 *   (pratibimba-coordinate specs), or review resolution.
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

const USER = 'e2e-user-being';
const SCHOOL = 'e2e-school-being';

/** Induct both beings and compute their live relation edge, over the real wire. */
async function seedStream(operator: string): Promise<void> {
    await gatewayRpc("s3'.being_pattern.observe", {
        entityId: USER,
        entityKind: 'being',
        perspectiveRole: 'FirstPerson',
        monopolyOperator: operator,
        elementalWeights: { fire: 0.3, water: 0.2, air: 0.4, earth: 0.1 },
        clockAddress: { degree360: 137, tick12: 5, hexagram: 42, line: 3 }
    });
    await gatewayRpc("s3'.being_pattern.observe", {
        entityId: SCHOOL,
        entityKind: 'school-of-thought',
        perspectiveRole: 'ThirdPerson',
        monopolyOperator: 'Poly',
        elementalWeights: { fire: 0.1, water: 0.5, air: 0.2, earth: 0.2 },
        clockAddress: { degree360: 41, tick12: 1 }
    });
    await gatewayRpc("s3'.being_pattern.project", {
        entityId: USER,
        relatedEntityId: SCHOOL,
        edgeKind: 'aspect-like',
        aspectLabel: 'trine'
    });
}

async function openBeingPatternCard(page: import('@playwright/test').Page) {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // face 1 daily, the Coordinate tab of personal-main
    if ((await shell.getAttribute('data-face')) !== '1') {
        await page.getByTestId('face-toggle').click();
    }
    await expect(shell).toHaveAttribute('data-face', '1', { timeout: 20_000 });
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Coordinate' }).click();
    await expect(page.locator('.face-active [data-testid="pratibimba-coordinate-pane"]')).toBeVisible({
        timeout: 20_000
    });
    const card = page.locator('.face-active [data-testid="being-pattern-perspective"]');
    await expect(card).toBeVisible({ timeout: 20_000 });
    await expect(card).toHaveAttribute('data-view-id', 'm4.nara.beingPatternPerspective');
    return card;
}

test('25.T25.22: the card reads the LIVE being-pattern stream the gateway really produced', async ({
    page
}) => {
    await seedStream('MonoPoly');
    const card = await openBeingPatternCard(page);

    // It is a live read, from the subscribe arm — not a fixture, not a stub.
    await expect(card).toHaveAttribute('data-seam', 'live', { timeout: 20_000 });
    await expect(card).toHaveAttribute('data-reading-source', 'live-stream');
    await expect(card.getByTestId('being-reading-source')).toContainText(
        "s3'.being_pattern.subscribe"
    );

    // The roster carries BOTH observed beings; the reading is one of them.
    await expect(card.getByTestId(`being-entity-${USER}`)).toBeVisible();
    await expect(card.getByTestId(`being-entity-${SCHOOL}`)).toBeVisible();

    // Select the user being and read what the producer computed for it.
    await card.getByTestId(`being-entity-${USER}`).click();
    await expect(card.getByTestId('being-entity-ref')).toContainText(USER);
    await expect(card.getByTestId('being-dial-MonoPoly')).toHaveAttribute('aria-current', 'true');
    await expect(card.getByTestId('being-perspective-FirstPerson')).toHaveAttribute(
        'aria-current',
        'true'
    );
    // the clock address the observation carried, through the real serialisation
    await expect(card.getByTestId('being-clock-address')).toContainText('137°');
    await expect(card.getByTestId('being-clock-address')).toContainText('hex 42.3');
    await expect(card.getByTestId('being-elemental-weights')).toContainText('fire:0.30');
    // the projected relation edge, declared live-only — never canon
    await expect(card.getByTestId('being-relation-edge-count')).not.toHaveText('0');
    await expect(card.getByTestId('being-relation-edges')).toContainText('live-only-review-required');
    // a real generation, stamped by the producer
    const generation = await card.getByTestId('being-stream-generation').textContent();
    expect(Number(generation), 'the producer stamps a real stream generation').toBeGreaterThan(0);

    // The other being reads differently — the card is showing per-entity truth,
    // not one reading painted twice.
    await card.getByTestId(`being-entity-${SCHOOL}`).click();
    await expect(card.getByTestId('being-dial-Poly')).toHaveAttribute('aria-current', 'true');
    await expect(card.getByTestId('being-perspective-ThirdPerson')).toHaveAttribute(
        'aria-current',
        'true'
    );

    // PRIVACY: handles and refs only. Nothing that names a protected body may
    // reach the DOM of this surface.
    const text = (await card.textContent()) ?? '';
    for (const forbidden of ['q_identity', 'q_composed', 'rawQuaternion', 'episodeBody']) {
        expect(text, `${forbidden} reached the being-pattern DOM`).not.toContain(forbidden);
    }
    // and it wears the handle-only tint the brief assigns it
    await expect(card).toHaveClass(/mext-privacy-protected-local-handle-only/);
});

test('25.T25.22: an ActualisingOne reading opens a review CANDIDATE and can never accept', async ({
    page
}) => {
    // A second, independent entity so this case cannot be confused with the
    // first test's stream state.
    const forcing = 'e2e-forced-unification-being';
    await gatewayRpc("s3'.being_pattern.observe", {
        entityId: forcing,
        entityKind: 'being',
        perspectiveRole: 'IntegralWeI',
        monopolyOperator: 'ActualisingOne',
        elementalWeights: { fire: 0.25, water: 0.25, air: 0.25, earth: 0.25 },
        clockAddress: { degree360: 300, tick12: 10 }
    });
    const card = await openBeingPatternCard(page);
    await expect(card).toHaveAttribute('data-seam', 'live', { timeout: 20_000 });
    await card.getByTestId(`being-entity-${forcing}`).click();

    const banner = card.getByTestId('being-review-risk');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("s3'.being_pattern.review_candidate");

    // The ONLY affordances on the gate are the candidate arm and the review
    // fold — and nowhere in the whole card is there an accept/apply/promote.
    const gateActions = await banner
        .locator('button')
        .evaluateAll(nodes => nodes.map(node => node.getAttribute('data-testid')));
    expect(gateActions).toEqual(['being-review-open-candidate', 'being-review-open']);
    const cardActions = await card
        .locator('button')
        .evaluateAll(nodes => nodes.map(node => (node.textContent ?? '').trim()));
    for (const label of cardActions) {
        expect(label, 'an accept affordance appeared on a review-gated reading').not.toMatch(
            /accept|apply|promote/i
        );
    }

    // Open the candidate for real, and read the producer's own stamps back.
    await card.getByTestId('being-review-open-candidate').click();
    await expect(card.getByTestId('being-review-emission')).toBeVisible({ timeout: 20_000 });
    await expect(card.getByTestId('being-review-status')).toHaveText('emitted-review-only');
    await expect(card.getByTestId('being-review-s2-mutated')).toHaveText('no');
    await expect(card.getByTestId('being-review-candidate-id')).toContainText(forcing);
});
