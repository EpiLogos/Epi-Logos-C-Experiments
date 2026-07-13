/**
 * Coordinate: M' M0'/M1' (drivable-loop proof: gateway-normalised coordinate
 *   render — Track 45.T45.3)
 * Actualises: the forward-guard's live half. The design-recon (45 §3.3) fixes
 *   the coordinate-normalisation algorithm (`#`→`M`, context-frames
 *   parenthesised with the position-N `.` rule, `/`→U+2215) in five
 *   synchronised gateway-side impls; the carrier must render coordinates as the
 *   gateway returns them and never add a sixth local copy. This spec drives the
 *   real Vite face against the REAL spawned `epi gate start` + live Neo4j: it
 *   walks the S2 topology to `M0-4` and asserts the Walk pane surfaces its
 *   context-frame child in the canonical gateway form `M0-4.(0/1)` — the
 *   position-4 dot rule + parens produced ONLY gateway-side and stored canonical
 *   in Neo4j. That exact string is a LIVE-ONLY value: it exists solely as an
 *   `s2.graph.node` relation target, never from any kernel-LUT / offline source,
 *   so this spec FAILS honestly when Neo4j is unreachable (the node read errors
 *   and the child never renders) — a jsdom mount can never pass. The paired
 *   guard vitest (`coordinateNormaliserGuard.test.ts`) proves the render stayed
 *   verbatim (no local transform introduced).
 * Does NOT own: the Bimba graph (S2 Neo4j), the normalisation algorithm
 *   (graph-services), the gateway protocol (S3).
 */

import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function switchToCosmicFace(page: Page): Promise<void> {
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
}

test('Walk pane renders a context-frame child in the canonical gateway form off the live graph (45.T45.3)', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    // activate the Walk tab on the cosmic face
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Walk' }).click();

    const pane = page.locator('.face-active [data-testid="walk-pane"]');
    await expect(pane).toBeVisible({ timeout: 15_000 });

    // let the walk auto-arrive at M1 from the REAL gateway first (avoids racing
    // the initial in-flight node read), then retarget the seed to M0-4 (the
    // position-4 context-frame anchor) and walk it live.
    await expect(pane.getByTestId('walk-node')).toContainText('M1', { timeout: 20_000 });
    const seed = pane.getByTestId('walk-seed');
    await seed.fill('M0-4');
    await seed.press('Enter');

    // the node read resolves against the live topology (s2.graph.node) — only
    // the spawned gateway + Neo4j produce this node.
    await expect(pane.getByTestId('walk-node')).toContainText('M0-4', { timeout: 20_000 });

    // LIVE-GRAPH GATE — `M0-4.(0/1)` is the canonical context-frame child of
    // M0-4 (HAS_INTERNAL_COMPONENT edge, position-4 dot rule + parens). It is a
    // Neo4j-only relation target rendered VERBATIM through the gateway seam
    // (renderGatewayCoordinate) — never produced by a local transform. When the
    // graph is down the node read errors and this child never renders, so this
    // line fails honestly.
    await expect(pane.getByTestId('walk-rel-M0-4.(0/1)')).toContainText('M0-4.(0/1)', {
        timeout: 25_000
    });
    // the relation is a real typed containment edge, not an untyped sweep row
    await expect(pane.getByTestId('walk-rel-M0-4.(0/1)')).toContainText('HAS_INTERNAL_COMPONENT');
});
