/**
 * Coordinate: M' (drivable-loop spec: M0 layer-rail provenance chip — DR-FACE-7)
 * Actualises: the fate-B half of Tranche 21.1 under the M' Engine Faces Ontology.
 *   The design-recon asked for a provenance pill with a `bridged_local`/
 *   `bridged_public` taxonomy the carrier deliberately unified away. Per
 *   DR-FACE-7 §3 (21.1 = fate A + small B) the six-register grammar is already
 *   carried by `M0LayerRail`; the small gap is a per-LOCAL-layer provenance chip
 *   built with the EXISTING `ProvenanceBadge`/`ProvenanceState` primitive, showing
 *   the shared `s2.graph.node` read state only — bridged-ness stays structural
 *   (`placement: 'bridged'`), never a provenance state.
 *   This spec is the UF proof: it drives the real Vite face against the real
 *   spawned gateway, walks the coordinate store to a real :Bimba coordinate (M1),
 *   opens the Bimba graph rail, and asserts the local layer chips carry the REAL
 *   S2 read state (`canonical` for a coordinate that HAS a node) while the bridged
 *   layers carry no S2 chip at all. A jsdom mount cannot pass: only the spawned
 *   `epi gate start` answers `s2.graph.node` with the live Neo4j topology.
 * Does NOT own: the S2 node contract (S3/graph.rs), per-layer field rendering
 *   (T1.5/T1.9), the graph force-layout (GraphExplorerPane).
 */

import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function switchToCosmicFace(page: Page): Promise<void> {
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
}

test('M0 layer rail: local layer chips carry the real S2 node-read state; bridged layers carry none (21.1 fate-B)', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    // walk to a real coordinate — the walk auto-arrives at M1 from the REAL
    // gateway and publishes it to the shared coordinate store (the same store
    // the rail reads). Only the spawned gateway's topology produces this node.
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Walk' }).click();
    await expect(page.getByTestId('walk-node')).toContainText('M1', { timeout: 20_000 });

    // open the Bimba graph rail — it reads s2.graph.node for the selected M1
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' }).click();
    const rail = page.locator('.face-active [data-testid="m0-layer-rail"]');
    await expect(rail).toBeVisible({ timeout: 15_000 });

    // the live read resolves canonical: M1 HAS a :Bimba node, so every LOCAL
    // layer chip reports `canonical` (the S2 read state, not a placeholder)
    for (const key of ['language', 'ql-structure', 'relations', 'time-community']) {
        await expect(
            rail.locator(`[data-testid="m0-layer-${key}"]`),
            `local layer ${key} reports the real S2 read state`
        ).toHaveAttribute('data-s2-read', 'canonical', { timeout: 20_000 });
    }

    // bridged layers (M0-4' personal, M0-5' pedagogy) perform NO S2 read — they
    // route. They carry no S2 chip attribute: bridged-ness is placement, not
    // provenance (no invented bridged_local/bridged_public state).
    await expect(rail.locator('[data-testid="m0-layer-personal"]')).not.toHaveAttribute(
        'data-s2-read',
        /.*/
    );
    await expect(rail.locator('[data-testid="m0-layer-pedagogy"]')).not.toHaveAttribute(
        'data-s2-read',
        /.*/
    );
});
