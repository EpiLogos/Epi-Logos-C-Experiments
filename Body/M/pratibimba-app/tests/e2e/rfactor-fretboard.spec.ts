/**
 * Coordinate: M' M4' (R-factor fretboard UF proof — Track 25.T25.23)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Actualises: the fretboard drawn from the LIVE profile wire — one atomic
 *   evaluate reads BOTH the rendered 7×6 grid and the `rfactorRouteTable`
 *   the running app received from the real gateway, and compares them
 *   position-by-position. A renderer-local route table cannot survive it:
 *   the comparison is against the payload the spawned gateway actually sent.
 * Does NOT own: the route table (m0.c / portal-core) or the witness law.
 * Contract: 25-m4-nara-frontend-deep.md Tranche 25.23.
 */

import { expect, test, type Page } from '@playwright/test';

interface FretboardSnapshot {
    readonly present: boolean;
    readonly state: string | null;
    readonly renderedRoutes: readonly {
        readonly baseRoute: string | null;
        readonly mColumn: string | null;
    }[];
    readonly renderedMarkers: readonly {
        readonly route: string;
        readonly rFactor: number;
        readonly position: number;
        readonly course: string | null;
    }[];
    readonly bussedTable: unknown;
    readonly fretCount: number;
    readonly lampCount: number;
    readonly turnSymbol: string | null;
}

async function readFretboard(page: Page): Promise<FretboardSnapshot> {
    return page.evaluate(async () => {
        const empty: FretboardSnapshot = {
            present: false,
            state: null,
            renderedRoutes: [],
            renderedMarkers: [],
            bussedTable: null,
            fretCount: 0,
            lampCount: 0,
            turnSymbol: null
        };
        const pane = document.querySelector('.face-active [data-testid="rfactor-fretboard"]');
        if (!pane) {
            return empty;
        }
        const stores = await import('/src/state/stores.ts');
        const cached = stores.useTickStore.getState().profile as
            | { profile?: Record<string, unknown> }
            | null;
        const payload = (cached?.profile ?? {}) as Record<string, unknown>;
        const root = (payload.harmonicProfile as Record<string, unknown> | undefined) ?? payload;
        const bussedTable = root.rfactorRouteTable ?? null;

        const renderedRoutes = Array.from(
            pane.querySelectorAll('[data-testid^="rfactor-string-"]')
        ).map(node => ({
            baseRoute: node.getAttribute('data-base-route'),
            mColumn: node.getAttribute('data-m-column')
        }));
        const renderedMarkers = Array.from(
            pane.querySelectorAll('[data-testid^="rfactor-marker-"]')
        ).map(node => {
            const id = node.getAttribute('data-testid') ?? '';
            const tail = id.replace('rfactor-marker-', '');
            const split = tail.lastIndexOf('-');
            return {
                route: tail.slice(0, split),
                rFactor: Number(node.getAttribute('data-r-factor')),
                position: Number(node.getAttribute('data-position')),
                course: node.getAttribute('data-course')
            };
        });
        return {
            present: true,
            state: pane.getAttribute('data-state'),
            renderedRoutes,
            renderedMarkers,
            bussedTable,
            fretCount: pane.querySelectorAll('[data-testid^="rfactor-fret-"]').length,
            lampCount: pane.querySelectorAll('[data-testid^="rfactor-virtue-lamp-"]').length,
            turnSymbol:
                pane.querySelector('[data-testid="rfactor-band-turn"]')?.textContent ?? null
        } as FretboardSnapshot;
    });
}

test('25.T25.23: the fretboard draws the LIVE route table — 7 strings × 6 frets, bussed position-by-position', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });

    const face = page.locator('.face-active');
    await face.locator('.flexlayout__border_button', { hasText: 'Fretboard' }).click();
    const pane = face.getByTestId('rfactor-fretboard');
    await expect(pane).toBeVisible();

    // The read state IS the wire proof: only a well-shaped bussed table
    // (7 routes × 6 positions, sentinel 7, (@#), 9 virtues) can set it.
    await expect(pane).toHaveAttribute('data-state', 'read', { timeout: 20_000 });

    const snap = await readFretboard(page);
    expect(snap.present).toBe(true);

    // (a) The instrument's whole shape comes off the bus.
    const bussed = snap.bussedTable as {
        routes: { baseRoute: string; mColumn: number; positions: number[] }[];
        positionless: number;
        bandTurnSymbol: string;
        virtues: unknown[];
    } | null;
    expect(bussed, 'the running app must have received the route table').not.toBeNull();
    expect(bussed!.routes.length).toBe(7);
    expect(snap.renderedRoutes.map(r => r.baseRoute)).toEqual(
        bussed!.routes.map(r => r.baseRoute)
    );
    expect(snap.renderedRoutes.map(r => Number(r.mColumn))).toEqual(
        bussed!.routes.map(r => r.mColumn)
    );
    expect(snap.fretCount).toBe(6);
    expect(snap.lampCount).toBe(9);
    expect(snap.turnSymbol).toBe(bussed!.bandTurnSymbol);

    // (b) Every rendered marker IS a bussed distribution entry, and every
    //     distributed entry is rendered — position-by-position equality.
    const bussedEntries = new Set<string>();
    for (const route of bussed!.routes) {
        route.positions.forEach((position, rFactor) => {
            if (position !== bussed!.positionless && rFactor !== 5) {
                bussedEntries.add(`${route.baseRoute}|${rFactor}|${position}`);
            }
        });
    }
    const renderedEntries = new Set(
        snap.renderedMarkers.map(m => `${m.route}|${m.rFactor}|${m.position}`)
    );
    expect(renderedEntries).toEqual(bussedEntries);
    // Degenerate-table guard: the comparison above cannot pass vacuously.
    expect(bussedEntries.size).toBeGreaterThan(20);

    // (c) The R0 drone stays on the upper triad in the RENDERED surface too.
    const drones = snap.renderedMarkers.filter(m => m.rFactor === 0);
    expect(drones.map(m => m.route).sort()).toEqual(['N#', 'O#', 'X#']);
    expect(new Set(drones.map(m => m.course))).toEqual(new Set(['r0-drone']));
});
