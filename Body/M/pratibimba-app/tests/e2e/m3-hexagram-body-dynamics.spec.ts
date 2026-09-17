/**
 * Coordinate: M' M3' (hexagram body-dynamics real-boot proof — 24.T24.8)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #0 cosmic face, ide-deep M3 inspectors area.
 * Actualises: real Chromium proof over the spawned gateway that
 *   `M3HexagramBodyDynamicsViewer` resolves the ACTIVE King Wen hexagram's row
 *   through `s2.codon.scalar_ref.read` (refKind `i-ching`), lights the chakra
 *   points the substrate names, and reads the body zones + dynamic verbatim —
 *   cross-checked against an INDEPENDENT real-wire call to the same method, so
 *   a renderer-local body table could not pass this test.
 * Public surface: Playwright test over the spawned gateway.
 * Does NOT own: `HEXAGRAM_BODY_DYNAMICS[64]` / `CHAKRA_BODY_ZONES[8]`
 *   (epi-cli nara authority), profile production, or gateway I/O.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.8.
 */

import { expect, Page, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

async function dispatchM3Wheel(page: Page): Promise<void> {
    await page.evaluate(async () => {
        const registry = await import('/src/commands/registry.ts');
        const crossLayout = await import('/src/commands/crossLayoutIntent.ts');
        const stores = await import('/src/state/stores.ts');
        const privacyClass = stores.useSessionStore.getState().privacyClass;
        await registry.commands.execute(crossLayout.CROSS_LAYOUT_INTENT_COMMAND, {
            coordinate: stores.useCoordinateStore.getState().selected,
            artifactUri: null,
            reviewId: null,
            dayNow: stores.useSessionStore.getState().dayNow,
            sessionKey: stores.useSessionStore.getState().sessionKey,
            profileGeneration: stores.useTickStore.getState().generation,
            privacyClass:
                privacyClass === 'public' || privacyClass === 'protected' || privacyClass === 'private'
                    ? privacyClass
                    : null,
            requestedExtensionId: 'm3-mahamaya',
            requestedContributionId: 'wheel'
        });
    });
}

interface BodySnapshot {
    present: boolean;
    state: string | null;
    hexagramIdRaw: string | null;
    primaryRaw: string | null;
    secondaryRaw: string | null;
    litRoles: Record<number, string>;
    pointCount: number;
    zonesText: string;
    dynamicText: string;
    haloElement: string | null;
}

/** ONE atomic read — the pane re-derives every field together on each tick. */
async function readBody(page: Page): Promise<BodySnapshot> {
    return page.evaluate(() => {
        const empty: BodySnapshot = {
            present: false,
            state: null,
            hexagramIdRaw: null,
            primaryRaw: null,
            secondaryRaw: null,
            litRoles: {},
            pointCount: 0,
            zonesText: '',
            dynamicText: '',
            haloElement: null
        };
        const panel = document.querySelector(
            '.face-active [data-testid="m3-inspectors"] [data-testid="m3-hexagram-body-dynamics"]'
        );
        if (!panel) {
            return empty;
        }
        const points = Array.from(
            panel.querySelectorAll('[data-testid^="m3-hexagram-chakra-"]')
        );
        const litRoles: Record<number, string> = {};
        for (const point of points) {
            if (point.getAttribute('data-lit') === 'true') {
                const id = Number(
                    (point.getAttribute('data-testid') ?? '').replace('m3-hexagram-chakra-', '')
                );
                litRoles[id] = point.getAttribute('data-role') ?? '';
            }
        }
        return {
            present: true,
            state: panel.getAttribute('data-state'),
            hexagramIdRaw: panel.getAttribute('data-hexagram-id'),
            primaryRaw: panel.getAttribute('data-primary-chakra'),
            secondaryRaw: panel.getAttribute('data-secondary-chakra'),
            litRoles,
            pointCount: points.length,
            zonesText:
                panel.querySelector('[data-testid="m3-hexagram-body-zones"]')?.textContent ?? '',
            dynamicText:
                panel.querySelector('[data-testid="m3-hexagram-body-dynamic"]')?.textContent ?? '',
            haloElement: panel.getAttribute('data-halo-element')
        };
    });
}

test('24.T24.8: the body-dynamics viewer resolves the live hexagram row over the real gateway', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });

    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '0');

    await dispatchM3Wheel(page);
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep');

    const inspectors = page.locator('.face-active [data-testid="m3-inspectors"]');
    await expect(inspectors).toBeVisible();

    await inspectors.getByTestId('m3-summon-hexagram-browser').click();
    await expect(inspectors.getByTestId('m3-hexagram-browser')).toBeVisible();

    // ── (a) The viewer must actually RESOLVE. `pending` here would mean the
    //        i-ching arm of `s2.codon.scalar_ref.read` did not answer — the
    //        exact failure this tranche's dependency chain was blocked on.
    let snap!: BodySnapshot;
    await expect(async () => {
        snap = await readBody(page);
        expect(snap.present).toBe(true);
        expect(snap.state).toBe('ready');
    }).toPass({ timeout: 30_000 });

    expect(snap.pointCount).toBe(8);

    const hexagramId = Number(snap.hexagramIdRaw);
    expect(Number.isInteger(hexagramId)).toBe(true);
    expect(hexagramId).toBeGreaterThanOrEqual(1);
    expect(hexagramId).toBeLessThanOrEqual(64);

    // ── (b) Independent real-wire read of the SAME row. The panel must agree
    //        with the substrate field-for-field. A renderer-local body table
    //        would drift from this the moment the dataset moved — which is the
    //        whole reason the renderer is forbidden one.
    const authority = (await gatewayRpc('s2.codon.scalar_ref.read', {
        refKind: 'i-ching',
        scalarRef: hexagramId
    })) as {
        resolved?: boolean;
        entry?: {
            hexagramId?: number;
            primaryChakraId?: number;
            secondaryChakraIds?: number[];
            bodyZones?: string[];
            dynamic?: string;
        };
        authority?: string;
    };
    expect(authority.resolved).toBe(true);
    expect(authority.authority).toBe('epi-cli::nara::oracle_identity::HEXAGRAM_BODY_DYNAMICS');
    const entry = authority.entry!;
    expect(entry.hexagramId).toBe(hexagramId);

    expect(Number(snap.primaryRaw)).toBe(entry.primaryChakraId);
    expect(snap.secondaryRaw).toBe((entry.secondaryChakraIds ?? []).join(','));
    expect(snap.zonesText).toBe((entry.bodyZones ?? []).join(', '));
    expect(snap.dynamicText).toBe(entry.dynamic);

    // (b.1) The lit points are exactly the substrate's chakras — primary marked
    //       primary, and nothing else lit. The dataset carries one secondary,
    //       which for many hexagrams EQUALS the primary; one lit point is then
    //       the honest rendering, not a dropped datum.
    const expectedLit = new Set<number>([
        entry.primaryChakraId!,
        ...(entry.secondaryChakraIds ?? [])
    ]);
    expect(new Set(Object.keys(snap.litRoles).map(Number))).toEqual(expectedLit);
    expect(snap.litRoles[entry.primaryChakraId!]).toBe('primary');

    // ── (c) The suit-element halo rides the 24.T24.6 bussed minor arcana: a
    //        real element name when the active codon carries a card, and the
    //        honest `none` when it falls outside the 56-card cover.
    expect(['Water', 'Fire', 'Earth', 'Air', 'none']).toContain(snap.haloElement);
});
