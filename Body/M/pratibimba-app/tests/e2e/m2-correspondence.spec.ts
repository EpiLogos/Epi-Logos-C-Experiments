/**
 * Coordinate: M' (drivable-loop spec: M2 correspondence-as-navigable-face — DR-FACE-7)
 * Actualises: the fate-B UF proof of Tranche 23.1. The design-recon asked for a
 *   Theia `correspondenceTree` widget registered with `WidgetFactory`; DR-FACE-7
 *   §3 re-grounds it as a 1-2-3 cosmic-pole face that reads the live 72-address
 *   off the pentadic trace and invokes the REAL `s2.parashaktiCorrespondences`
 *   gateway method for that address. This spec drives the real Vite face against
 *   the real spawned gateway: it opens the Correspondence face, waits for the
 *   live parashakti record to land, and asserts the three correspondence faces
 *   carry REAL kernel + S2 values. The kernel-LUT decan chain proves the
 *   72-address resolved; two LIVE-GRAPH gates prove graphUnavailable === false —
 *   the Arabic name text (`DivineName.m_2_4_arabic_text`, Arabic script) and the
 *   vedic mantra (`PlanetaryHarmonic.l_2_vedic_mantra`, "Om …"). Both are
 *   Neo4j-only fields that render the canonical em-dash when the graph is down,
 *   so the spec FAILS honestly when Neo4j is unreachable (like the walk/m0-rail
 *   live specs) — a jsdom mount can never pass. Navigation across the three
 *   faces is proven live.
 * Does NOT own: the parashakti-deep graph (S2 Neo4j), the 72-address (the profile
 *   pentadic trace), the gateway protocol (S3), the planetary modal signature
 *   re-point (uc-cli-3: c_0_modal_signature).
 */

import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function switchToCosmicFace(page: Page): Promise<void> {
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
}

test('M2 correspondence face: the live 72-address resolves its decan/sacred/planetary faces off the real gateway (23.1 fate-B)', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'Correspondence' })
        .click();

    const pane = page.locator('.face-active [data-testid="m2-correspondence"]');
    await expect(pane).toBeVisible({ timeout: 15_000 });

    // the active 72-address rides the live pentadic trace, and the record loads
    // from the real s2.parashaktiCorrespondences method — never pending/mocked.
    // data-state 'ready' only proves a record landed (the kernel-LUT decan chain
    // alone produces one even with graphUnavailable:true); the live-graph gate
    // below is the honest proof the Neo4j read actually resolved.
    await expect(pane).toHaveAttribute('data-state', 'ready', { timeout: 25_000 });
    await expect(page.getByTestId('corr-address')).toHaveText(/72:\d+/);

    // decan face: a REAL zodiac decan + Chaldean ruler. This chain is kernel-LUT
    // (ZODIAC_DECAN_TABLE), available offline — it proves the 72-address resolved,
    // not that the graph is up.
    const decan = page.getByTestId('corr-decan');
    await expect(decan).toContainText(
        /Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces/
    );

    // navigate to the sacred-name face — the kernel asma group (Jalal/Kamal/Jamal)
    await page.getByTestId('corr-nav-sonic').click();
    const sonic = page.getByTestId('corr-sonic');
    await expect(sonic).toBeVisible();
    await expect(sonic).toContainText(/Jalal|Kamal|Jamal|Hidden/);
    await expect(page.getByTestId('corr-decan')).toHaveCount(0);

    // LIVE-GRAPH GATE #1 — the Arabic name text (DivineName.m_2_4_arabic_text) is a
    // Neo4j-only value: it renders Arabic script (U+0600–U+06FF) when the live
    // parashakti-deep read resolves and the canonical em-dash '—' when the graph
    // is down (graphUnavailable === true). Asserting Arabic script therefore
    // proves graphUnavailable === false. This line FAILS honestly when Neo4j is
    // unreachable, exactly like the walk/m0-rail live specs.
    await expect(sonic).toContainText(/[\u0600-\u06FF]/u, { timeout: 25_000 });

    // navigate to the planetary-chakral face
    await page.getByTestId('corr-nav-planetary').click();
    const planetary = page.getByTestId('corr-planetary');
    await expect(planetary).toBeVisible();
    await expect(page.getByTestId('corr-sonic')).toHaveCount(0);

    // LIVE-GRAPH GATE #2 — the vedic mantra (PlanetaryHarmonic.l_2_vedic_mantra)
    // is a Neo4j-only value present for every classical decan-ruler (each mantra
    // begins "Om "); it renders the em-dash when the graph is down. Every decan's
    // Chaldean ruler is one of the 7 classical planets, so this is address-agnostic
    // and a second independent proof that graphUnavailable === false.
    await expect(planetary).toContainText('Om ', { timeout: 25_000 });

    // LIVE-GRAPH GATE #3 — the planetary modal signature. Sibling uc-cli-3 re-points
    // planetaryMode to PlanetaryHarmonic.c_0_modal_signature; every classical planet's
    // descriptor is "The X-X octave, …". Each decan's Chaldean ruler is one of the 7
    // classical planets (Earth is never a decan ruler), so the live signature always
    // contains "octave" and is NON-EMPTY — never the em-dash. This fails honestly
    // when the graph is down (planetaryMode → em-dash, no "octave").
    await expect(planetary).toContainText(/octave/);
});

test('M2 epogdoon bridge: the real C projection renders the complete 72-to-64-to-56 descent (23.18)', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);
    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'Correspondence' })
        .click();
    await page.getByTestId('corr-nav-cymatic').click();

    const bridge = page.getByTestId('m2-epogdoon-bridge');
    await expect(bridge).toHaveAttribute('data-bridge-state', 'ready', { timeout: 30_000 });
    await expect(bridge).toHaveAttribute('data-source', 'kernelBridge.m2.epogdoonProjection(address72)');
    await expect(bridge.locator('[data-epogdoon-cell]')).toHaveCount(72);
    await expect(bridge.locator('[data-epogdoon-codon]')).toHaveCount(64);
    await expect(bridge.locator('[data-epogdoon-sentinel="true"]')).toHaveCount(8);
    await expect(bridge.locator('[data-epogdoon-tarot-cell][data-padding="false"]')).toHaveCount(56);

    // The renderer never decides the active codon: this exact source/target pair
    // is an observed receipt from the spawned C-backed gateway.
    const activeCell = bridge.locator('[data-epogdoon-cell][data-active="true"]');
    await expect(activeCell).toHaveCount(1);
    await expect(activeCell).toHaveAttribute('data-compressed-codon', /\d+/);
    await expect(bridge.getByTestId('m2-epogdoon-inspector')).toContainText('kernelBridge.m2.epogdoonProjection(address72)');
});
