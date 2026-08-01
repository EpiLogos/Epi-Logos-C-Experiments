/**
 * Coordinate: M' M3' (60-position Fibonacci Ground outer ring, real-boot proof — 24.T60)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #0 cosmic face, ide-deep M3 inspectors area.
 * Actualises: real Chromium proof that the Level-0 outer ring is a PROJECTION
 *   of the live bussed `phaseSpace.fibonacciGround.digitLut` — every one of the
 *   60 rendered digits is compared, position by position, against the LUT on
 *   the profile the running app received from the spawned gateway. Counting
 *   sixty wedges proves nothing about provenance; this does.
 * Public surface: Playwright test over the spawned gateway.
 * Does NOT own: the Pisano digit law (kernel `phase_space.rs::pisano60_digit`),
 *   the Sun→ground projection, backbone degrees, or gateway I/O.
 * Contract: [[35-fibonacci-ground-level-0-temporal-substrate]] §2.4 + rerun
 *   [[24-m3-mahamaya-frontend-deep]] 24.19 render-contract item 1 (24.T60).
 *
 * GROUND TRUTH: the ring is 60 wedges of 6° each labelled with the backend's
 *   `fibonacci_digit`; cardinal-zero anchors sit at {0,15,30,45}; zodiacal-five
 *   anchors at {5,10,20,25,35,40,50,55}; 24 backbone ticks ride just inside,
 *   origin emphasised; the natal Sun is a gold RING and the live Sun a silver
 *   DOT, both projected backend-side. NO renderer-local Pisano table exists —
 *   the digits arrive on the wire or the ring does not render at all.
 */

import { expect, Page, test } from '@playwright/test';

const CARDINAL_POSITIONS = [0, 15, 30, 45];
const ZODIACAL_POSITIONS = [5, 10, 20, 25, 35, 40, 50, 55];

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

interface RingSnapshot {
    present: boolean;
    /** The digits as RENDERED, indexed by wedge position. */
    renderedDigits: (string | null)[];
    /** The digits as BUSSED, read from the same tick's profile in the store. */
    bussedDigits: number[] | null;
    wedgeCount: number;
    cardinals: number[];
    zodiacals: number[];
    backboneCount: number;
    backboneDegrees: (string | null)[];
    originEmphasised: boolean;
    natalClass: string | null;
    liveClass: string | null;
    layerOrder: string | null;
}

/**
 * ONE atomic read of BOTH the DOM and the store-held profile, so the rendered
 * digits and the bussed digits are guaranteed to be the same tick's — the ring
 * re-derives on every profile frame.
 */
async function readRing(page: Page): Promise<RingSnapshot> {
    return page.evaluate(async () => {
        const empty: RingSnapshot = {
            present: false,
            renderedDigits: [],
            bussedDigits: null,
            wedgeCount: 0,
            cardinals: [],
            zodiacals: [],
            backboneCount: 0,
            backboneDegrees: [],
            originEmphasised: false,
            natalClass: null,
            liveClass: null,
            layerOrder: null
        };
        const ring = document.querySelector(
            '.face-active [data-testid="m3-inspectors"] [data-testid="m3-fibonacci-ground-ring"]'
        );
        if (!ring) {
            return empty;
        }
        const stores = await import('/src/state/stores.ts');
        const profile = stores.useTickStore.getState().profile as
            | { profile?: Record<string, unknown> }
            | null;
        // The payload is either the profile itself or wrapped in
        // `harmonicProfile` — the same unwrap `buildM3WheelSurface` performs.
        const payload = (profile?.profile ?? {}) as Record<string, unknown>;
        const root = (payload.harmonicProfile as Record<string, unknown> | undefined) ?? payload;
        const phaseSpace = root.phaseSpace as Record<string, unknown> | undefined;
        const ground = phaseSpace?.fibonacciGround as Record<string, unknown> | undefined;
        const lut = Array.isArray(ground?.digitLut) ? (ground!.digitLut as number[]) : null;

        const wedges = Array.from(ring.querySelectorAll('[data-testid^="m3-fibonacci-wedge-"]'));
        const renderedDigits: (string | null)[] = [];
        for (const wedge of wedges) {
            const position = Number(
                (wedge.getAttribute('data-testid') ?? '').replace('m3-fibonacci-wedge-', '')
            );
            renderedDigits[position] = wedge.getAttribute('data-digit');
        }
        const idsOf = (prefix: string) =>
            Array.from(ring.querySelectorAll(`[data-testid^="${prefix}"]`))
                .map(node => Number((node.getAttribute('data-testid') ?? '').replace(prefix, '')))
                .sort((a, b) => a - b);
        const backbones = Array.from(
            ring.querySelectorAll('[data-testid^="m3-fibonacci-backbone-"]')
        );
        return {
            present: true,
            renderedDigits,
            bussedDigits: lut,
            wedgeCount: wedges.length,
            cardinals: idsOf('m3-fibonacci-cardinal-'),
            zodiacals: idsOf('m3-fibonacci-zodiacal-'),
            backboneCount: backbones.length,
            backboneDegrees: backbones.map(node => node.getAttribute('data-degree')),
            originEmphasised:
                ring
                    .querySelector('[data-testid="m3-fibonacci-backbone-0"]')
                    ?.getAttribute('class')
                    ?.includes('m3-fibonacci-backbone-origin') ?? false,
            natalClass:
                ring.querySelector('[data-testid="m3-fibonacci-natal-sun"]')?.getAttribute('class') ??
                null,
            liveClass:
                ring.querySelector('[data-testid="m3-fibonacci-live-sun"]')?.getAttribute('class') ??
                null,
            layerOrder: ring.getAttribute('data-layer-order')
        };
    });
}

test('24.T60: the 60-position outer ring renders the LIVE bussed Pisano digits, not a local table', async ({
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

    let snap!: RingSnapshot;
    await expect(async () => {
        snap = await readRing(page);
        expect(snap.present).toBe(true);
        // The LUT must be on the live wire. If it were absent the ring would be
        // honest-pending — which is correct behaviour, but would mean this test
        // proved nothing about the backend authoring the digits.
        expect(snap.bussedDigits).toHaveLength(60);
    }).toPass({ timeout: 30_000 });

    // ── (a) Sixty wedges, and every digit is the bussed digit at that position.
    //        THIS is the provenance assertion: a renderer-local Pisano table, an
    //        index-labelled ring, or a stale baked sequence all fail here while
    //        passing any count-based check.
    expect(snap.wedgeCount).toBe(60);
    const bussed = snap.bussedDigits!;
    for (let position = 0; position < 60; position++) {
        expect(snap.renderedDigits[position]).toBe(String(bussed[position]));
    }
    // Guard against a degenerate LUT making the comparison vacuous.
    expect(new Set(bussed).size).toBeGreaterThan(1);

    // ── (b) The anchor contract, at the contract positions.
    expect(snap.cardinals).toEqual(CARDINAL_POSITIONS);
    expect(snap.zodiacals).toEqual(ZODIACAL_POSITIONS);

    // ── (c) 24 backbone ticks, backend-authored degrees, origin emphasised.
    expect(snap.backboneCount).toBe(24);
    for (const degree of snap.backboneDegrees) {
        const value = Number(degree);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(359);
    }
    expect(snap.originEmphasised).toBe(true);

    // ── (d) Layer order, outer → inner, as the render contract fixes it.
    expect(snap.layerOrder).toBe('fibonacci-ground,backbone,lens-annulus,walk,torus-core');

    // ── (e) The two Sun markers are DISTINCT marks (gold ring vs silver dot) —
    //        the natal-to-live distance is read geometrically, so identical
    //        marks would make the reading unavailable. Either may be honestly
    //        absent when its backend projection is not anchored.
    if (snap.natalClass !== null && snap.liveClass !== null) {
        expect(snap.natalClass).toBe('m3-fibonacci-natal-sun');
        expect(snap.liveClass).toBe('m3-fibonacci-live-sun');
        expect(snap.natalClass).not.toBe(snap.liveClass);
    } else {
        // Absence must be SAID, not silently dropped.
        const pending = inspectors.locator(
            '[data-testid="m3-fibonacci-natal-pending"], [data-testid="m3-fibonacci-live-pending"]'
        );
        await expect(pending.first()).toBeVisible();
    }
});
