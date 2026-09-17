/**
 * Coordinate: M' integrated 1-2-3 (Inhabited Bimba UF proof — Track 29.T29.16)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Actualises: the live entity field over the REAL CCT-21 producer — two
 *   entities observed and projected over the wire render as markers on the
 *   cosmic clock field under the visual law (the many as many); the CCT-21
 *   acceptance replay carries the nine-event chain with ONE generation for
 *   the M4 consumer and the clock overlay and no S2 mutation; and the canon
 *   boundary holds on the live surface (`data-s2-mutated="false"`).
 * Does NOT own: the producer (S3 being_pattern.rs) or the parse law.
 * Contract: 29-integrated-plugins-composition-deep.md Tranche 29.16.
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

test('29.T29.16: the Bimba map is inhabited by live entities without making live state canonical', async ({
    page
}) => {
    // ── CCT-21 replay fixture (the brief's own verification demand): the
    // nine-event chain, one shared generation, no S2 mutation attempted.
    const replay = (await gatewayRpc("s3'.being_pattern.subscribe", {
        includeAcceptanceReplay: true
    })) as {
        acceptanceReplay: {
            source: string;
            events: readonly { readonly kind?: string }[];
            m4ConsumerGeneration: number;
            clockOverlayGeneration: number;
            s2MutationAttempted: boolean;
        };
    };
    const fixture = replay.acceptanceReplay;
    expect(fixture.source).toBe('acceptance-replay-fixture');
    const chain = fixture.events.map(e => e.kind);
    expect(chain).toEqual([
        'EntityObserved',
        'BeingPatternProjected',
        'PerspectiveRoleResolved',
        'MonoPolyOperatorResolved',
        'ClockAddressUpdated',
        'AspectEdgeComputed',
        'ElementalResonanceChanged',
        'PatternPacketFormed',
        'ReviewCandidateEmitted'
    ]);
    expect(fixture.m4ConsumerGeneration).toBe(fixture.clockOverlayGeneration);
    expect(fixture.s2MutationAttempted).toBe(false);

    // ── Observe + project two REAL entities on the live producer.
    await gatewayRpc("s3'.being_pattern.observe", {
        entityId: 'e2e-user-being',
        entityKind: 'being',
        perspectiveRole: 'FirstPerson',
        monopolyOperator: 'Mono'
    });
    await gatewayRpc("s3'.being_pattern.observe", {
        entityId: 'e2e-school-being',
        entityKind: 'school-of-thought',
        perspectiveRole: 'ThirdPerson',
        monopolyOperator: 'Poly'
    });
    await gatewayRpc("s3'.being_pattern.project", {
        entityId: 'e2e-user-being',
        relatedEntityId: 'e2e-school-being',
        edgeKind: 'aspect-like',
        aspectLabel: 'trine'
    });

    // ── The cosmic field renders them: markers under the visual law.
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '0');

    const overlay = page.locator('.face-active [data-testid="inhabited-bimba-overlay"]');
    await expect(overlay).toHaveAttribute('data-state', 'read', { timeout: 30_000 });
    await expect(overlay).toHaveAttribute('data-source', /live-producer/);
    // The producer never invents an inhabitant; both observed entities (and
    // only real ones) surface. Other specs may have observed more — assert
    // OURS are present rather than pinning a global count.
    const userMarker = overlay.getByTestId('inhabited-marker-e2e-user-being');
    const schoolMarker = overlay.getByTestId('inhabited-marker-e2e-school-being');
    await expect(userMarker).toHaveCount(1);
    await expect(schoolMarker).toHaveCount(1);
    await expect(schoolMarker).toHaveAttribute('data-law', 'many');
    await expect(userMarker).toHaveAttribute('data-perspective', 'FirstPerson');

    // Canon boundary on the LIVE surface: composition reads anchors, never
    // writes graph canon — the producer's own statement rendered verbatim.
    await expect(overlay).toHaveAttribute('data-s2-mutated', 'false');

    // ── The personal pass-through: the 25.22 card (the composition's M4
    // consumer) reads the SAME stream through its 18.10 profile-first seam —
    // one mount, one subscription (DR-WC-IP-4), already on the personal face.
    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '1');
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Coordinate' }).click();
    const card = page.locator('.face-active [data-testid="being-pattern-perspective"]');
    await expect(card).toBeVisible({ timeout: 20_000 });
});
