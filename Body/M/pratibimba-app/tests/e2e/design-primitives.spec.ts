/**
 * Coordinate: M' Track 30 symbolic design primitives.
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Actualises: the real gateway dependency behind CodonString, and the 30.T30.6
 *   state grammar proven on the RUNNING shell — per-id colour really resolves
 *   through the theme, ownerTrack really reaches the user, and the loading
 *   pulse really stops under reduced motion (it is continuous motion).
 * Public surface: Playwright proof for s2.codon.aa_lookup + the state grammar.
 * Does NOT own: codon law, browser-side lookup tables, the taxonomy
 *   (src/ui/bridgeReadiness.ts) or the token values (src/ui/tokens.ts).
 * Contract: rerun tranches [[30.T30.6]] (state grammar) + [[30.T30.5]] (a11y).
 */

import { expect, test, type Page } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';
import {
    BRIDGE_READINESS_IDS,
    readinessOwnerTrack,
    type BridgeReadinessId
} from '../../src/ui/bridgeReadiness';
import { READINESS_ID_COLOURS } from '../../src/ui/tokens';
import { readinessIdCssVar } from '../../src/ui/stateGrammar';

test('S2 resolves start and stop codons through the real portal-core authority', async () => {
    const start = await gatewayRpc('s2.codon.aa_lookup', { codon: 'AUG' }) as {
        aminoAcid: string;
        isStart: boolean;
        authority: string;
    };
    const stop = await gatewayRpc('s2.codon.aa_lookup', { codon: 'UAA' }) as {
        aminoAcid: string;
        isStop: boolean;
    };

    expect(start).toMatchObject({
        aminoAcid: 'Cys',
        isStart: true,
        authority: 'portal-core::transcription'
    });
    expect(stop).toMatchObject({ aminoAcid: 'STOP', isStop: true });
});

async function openShell(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
}

test('the nine per-id readiness colours resolve on the real running shell', async ({ page }) => {
    await openShell(page);

    // Read the custom properties off the live document: this proves styles.css
    // really shipped them and the theme really resolves them, which no jsdom
    // mount can show.
    const resolved = await page.evaluate(
        (vars: string[]) => {
            const style = getComputedStyle(document.documentElement);
            return vars.map(name => style.getPropertyValue(name).trim());
        },
        BRIDGE_READINESS_IDS.map(id => readinessIdCssVar(id))
    );

    BRIDGE_READINESS_IDS.forEach((id, index) => {
        // the shell boots dark, so the dark polarity is the live resolution
        expect(resolved[index].toLowerCase()).toBe(READINESS_ID_COLOURS[id].dark.toLowerCase());
    });
    // per-ID, not one generic amber
    expect(new Set(resolved).size).toBe(BRIDGE_READINESS_IDS.length);
});

test('a real readiness surface names its owning track to the user', async ({ page }) => {
    await openShell(page);

    // Live BridgeReadinessBadge surfaces (graph explorer `s2.graph.node`, the
    // M2 correspondence pane, the M3 walk navigator) render one of these marks.
    // Whatever state the bridge reports, the mark must name its owner — that is
    // the whole point of the 30.6 tooltip.
    const mark = page
        .locator(
            '[data-testid="pending-badge"], [data-testid="readiness-indicator"], [data-testid="blocked-overlay"]'
        )
        .first();
    await expect(mark).toBeAttached({ timeout: 20_000 });

    const readinessId = await mark.getAttribute('data-readiness');
    expect(readinessId).not.toBeNull();
    expect(BRIDGE_READINESS_IDS).toContain(readinessId as BridgeReadinessId);

    const ownerTrack = await mark.getAttribute('data-owner-track');
    expect(ownerTrack).toBe(readinessOwnerTrack(readinessId as BridgeReadinessId));

    // and the reader is told, in words, which axis is down and who owns it
    const title = await mark.getAttribute('title');
    expect(title).toContain(readinessId as string);
    expect(title).toContain(`owner: track ${ownerTrack}`);

    // the per-id colour really painted — the custom property is set on the node
    const painted = await mark.evaluate(node =>
        getComputedStyle(node as Element).getPropertyValue('--readiness-id-colour').trim()
    );
    expect(painted).not.toBe('');
});

test('the loading pulse is continuous motion: reduced motion stops it dead', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openShell(page);
    expect(
        await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ).toBe(true);

    const pulse = page.locator('[data-testid="loading-pulse"]').first();
    if ((await pulse.count()) === 0) {
        // Every binding was reported, so no pulse is on screen. That is a real
        // app state, not licence to fake a pass: mount one into the live
        // document so the assertion still runs against the shipped stylesheet.
        await page.evaluate(() => {
            const probe = document.createElement('span');
            probe.className = 'loading-pulse loading-pulse-local';
            probe.setAttribute('data-testid', 'loading-pulse');
            const mark = document.createElement('span');
            mark.className = 'loading-pulse-mark';
            mark.style.opacity = '0.5';
            probe.appendChild(mark);
            document.body.appendChild(probe);
        });
    }

    const mark = page.locator('[data-testid="loading-pulse"] .loading-pulse-mark').first();
    await expect(mark).toBeAttached();

    const motion = await mark.evaluate(node => {
        const style = getComputedStyle(node as Element);
        return { animationName: style.animationName, opacity: style.opacity };
    });
    // CONTINUOUS motion stops ENTIRELY (DR-WC-DL-4) — and the stop must beat
    // the tick-driven inline opacity, or the pulse would freeze mid-fade.
    expect(motion.animationName).toBe('none');
    expect(Number(motion.opacity)).toBe(1);
});

test('without the preference the bridgeless pulse really animates', async ({ page }) => {
    await openShell(page);
    await page.evaluate(() => {
        const probe = document.createElement('span');
        probe.className = 'loading-pulse loading-pulse-local';
        probe.id = 'pulse-probe';
        const mark = document.createElement('span');
        mark.className = 'loading-pulse-mark';
        probe.appendChild(mark);
        document.body.appendChild(probe);
    });

    const motion = await page.locator('#pulse-probe .loading-pulse-mark').evaluate(node => {
        const style = getComputedStyle(node as Element);
        return { name: style.animationName, duration: style.animationDuration };
    });
    expect(motion.name).toBe('loading-pulse-fade');
    expect(motion.duration).toBe('0.2s');
});
