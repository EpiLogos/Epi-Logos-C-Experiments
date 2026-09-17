/**
 * Coordinate: M' `/` membrane (M5-4' ACR context-pack acceptance — 51.T51.1)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / real gateway / real assembler carrier proof.
 * Actualises: the whole 51.T51.1 chain in one drive —
 *   (1) the REAL S4' spine compositor assembles and publishes a pack into the
 *       spawned gateway's own state root (the same publisher `before_agent_start`
 *       calls, via `spine/publish-context-pack.ts`);
 *   (2) the REAL gateway serves it over `s4'.context.assemble`, byte-identical;
 *   (3) the REAL ACR fold renders that same pack per carrier.
 *   The point of the tranche is that these three cannot be three different
 *   objects, so the assertions compare bytes, not shapes.
 * Does NOT own: assembly law (S4'), the gateway adapter (S0), or the parse
 *   (src/panes/omni/contextPack.ts).
 * Contract: [[S4-4'-SPEC]] / [[51-specced-surface-gap-closure]].
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { REPO_ROOT, RUN_STATE_FILE, type E2eRunState } from './e2e-env';
import { gatewayRpc } from './gateway-rpc';

/** The app's ContextPackSection asks for the gateway's default session. */
const SESSION_KEY = 'main';

interface PublishedBlock {
    coordinate: string;
    cost: string;
    status: string;
    bytes: number;
    rendered: string | null;
}
interface PublishedPack {
    sessionKey: string;
    injection: string;
    blocks: PublishedBlock[];
    budget: { limitChars: number; usedChars: number };
}

function runState(): E2eRunState {
    return JSON.parse(readFileSync(RUN_STATE_FILE, 'utf8')) as E2eRunState;
}

/**
 * Publish through the REAL assembler. This is the same registration list and
 * the same `SpineCompositor.assembleContextPack` a live session runs; only the
 * trigger differs (a CLI entry instead of `before_agent_start`), because the
 * e2e harness deliberately does not boot a model.
 */
function publishRealPack(gatewayStateRoot: string): PublishedPack {
    const stdout = execFileSync(
        process.execPath,
        [
            '--experimental-strip-types',
            join(REPO_ROOT, 'Body', 'S', 'S4', 'ta-onta', 'spine', 'publish-context-pack.ts'),
            '--session',
            SESSION_KEY
        ],
        {
            encoding: 'utf8',
            env: {
                ...process.env,
                EPI_GATE_STATE_ROOT: gatewayStateRoot,
                EPI_SESSION_ID: SESSION_KEY
            },
            stdio: ['ignore', 'pipe', 'pipe']
        }
    );
    return (JSON.parse(stdout) as { pack: PublishedPack }).pack;
}

test('the gateway serves the exact pack the S4 spine published, and the ACR renders it', async ({
    page
}) => {
    const { gatewayStateRoot } = runState();
    const published = publishRealPack(gatewayStateRoot);

    expect(published.blocks.length).toBe(6);
    expect(published.injection.length).toBeGreaterThan(0);

    // ---- (2) the live gateway returns those bytes, not a re-assembly --------
    const served = (await gatewayRpc("s4'.context.assemble", {
        sessionKey: SESSION_KEY
    })) as {
        owner: string;
        present: boolean;
        assembler: string;
        pack: PublishedPack;
    };

    expect(served.owner).toBe("S4'");
    expect(served.present).toBe(true);
    expect(served.assembler).toBe(
        'Body/S/S4/ta-onta/spine/compositor.ts::SpineCompositor.assembleContextPack'
    );
    expect(served.pack.injection).toBe(published.injection);
    expect(served.pack.blocks.map(b => b.coordinate)).toEqual(
        published.blocks.map(b => b.coordinate)
    );
    for (const block of served.pack.blocks.filter(b => b.status === 'included')) {
        expect(served.pack.injection).toContain(block.rendered as string);
    }

    // An unassembled session must read as absent, never as empty context.
    const absent = (await gatewayRpc("s4'.context.assemble", {
        sessionKey: 'e2e-never-assembled'
    })) as { present: boolean; pack: unknown; reason: string };
    expect(absent.present).toBe(false);
    expect(absent.pack).toBeNull();
    expect(absent.reason).toContain('no context pack');

    // ---- (3) the ACR fold renders that same pack ---------------------------
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });

    const dispatchTab = page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Dispatch' })
        .first();
    await expect(dispatchTab).toBeVisible();
    const box = await dispatchTab.boundingBox();
    expect(box).not.toBeNull();
    await dispatchTab.click({
        position: { x: Math.min(24, box!.width - 1), y: Math.max(1, box!.height - 3) }
    });
    await expect(shell).toHaveAttribute('data-omnipanel-active-tab', 'dispatch-trace');

    const fold = page.getByTestId('dispatch-context-pack');
    await expect(fold).toBeVisible();
    // `> summary` — the fold's own toggle, not the nested injection toggle.
    await fold.locator('> summary').click();

    const contextPack = page.getByTestId('context-pack');
    await expect(contextPack).toBeVisible();
    await expect(page.getByTestId('context-pack-session')).toHaveText(SESSION_KEY);
    await expect(page.getByTestId('context-pack-carriers')).toHaveText(
        `${served.pack.blocks.length} carriers`
    );
    await expect(page.getByTestId('context-pack-budget')).toHaveText(
        `${served.pack.budget.usedChars}/${served.pack.budget.limitChars} chars`
    );

    // Every carrier the gateway returned has a row, and its rendered outcome
    // agrees with the served pack — the view is the pack, not a summary of it.
    for (const block of served.pack.blocks) {
        const row = page.getByTestId(`context-pack-block-${block.coordinate}`);
        await expect(row).toBeVisible();
        await expect(row).toHaveAttribute('data-status', block.status);
    }

    // The injected text itself, byte-for-byte, is reachable from the surface.
    await page.getByTestId('context-pack-injection-toggle').click();
    await expect(page.getByTestId('context-pack-injection')).toHaveText(served.pack.injection);

    await expect(page.getByTestId('context-pack-provenance')).toContainText(
        'SpineCompositor.assembleContextPack'
    );
});
