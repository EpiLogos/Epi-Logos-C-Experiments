/**
 * Coordinate: M' M3' (22 + 56 tarot wheel real-boot proof — 24.T24.6)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #0 cosmic face, ide-deep M3 inspectors area.
 * Actualises: real Chromium proof over the spawned gateway that
 *   `M3TarotWheel` renders 22 major + 56 minor cards, that the LIVE bus carries
 *   `mahamaya.tarotMajorArcanaCardId` (WC-M3-SA-2) and `mahamaya.tarotMinorId`
 *   — i.e. the surface is NOT in the `pending` state that a stubbed producer
 *   would leave it in — that the lit cards are exactly the ids the live bus
 *   named, that suits carry distinct element colours, and that turning a card
 *   dispatches `s2.codon.scalar_ref.read` and renders the gateway's answer
 *   verbatim (including an honest `resolved: false`).
 * Public surface: Playwright test over the spawned gateway.
 * Does NOT own: deck identity (kernel `m3.c M3_MAJOR_ARCANA` /
 *   `M3_TAROT_CODON_MAP`), the codon→card transcription (portal-core
 *   `m3_transcription_bridge`), profile production, or gateway I/O.
 * Contract: [[M3'-SPEC]] §8.7 + rerun [[24-m3-mahamaya-frontend-deep]] 24.6.
 *
 * GROUND TRUTH (portal-core `kernel/projections/binary.rs`, 24.T24.6): the
 *   Mahamaya profile field mirrors BOTH tarot ids off the tick's codon —
 *   `tarotMajorArcanaCardId = m3_major_arcana_from_codon(codonId)` (null on the
 *   three STOP codons) and `tarotMinorId` over the kernel's 56-card exact cover
 *   (null for the 8 codons outside it). Both nulls are ANSWERS; an absent field
 *   is not. This test reads whatever the live bus carries and asserts the
 *   surface distinguishes the two — it hardcodes no card.
 */

import { expect, Page, test } from '@playwright/test';

/** Dispatch the cross-layout intent that mounts the full M3 inspectors area. */
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

interface WheelSnapshot {
    present: boolean;
    majorState: string | null;
    minorState: string | null;
    majorCardRaw: string | null;
    minorCardRaw: string | null;
    litMajor: number[];
    litMinor: number[];
    majorCount: number;
    minorCount: number;
    suitElements: (string | null)[];
    suitFills: (string | null)[];
    majorReadout: string;
    minorReadout: string;
}

/** ONE atomic read — the ~1 Hz profile tick re-derives every field together. */
async function readWheel(page: Page): Promise<WheelSnapshot> {
    return page.evaluate(() => {
        const empty: WheelSnapshot = {
            present: false,
            majorState: null,
            minorState: null,
            majorCardRaw: null,
            minorCardRaw: null,
            litMajor: [],
            litMinor: [],
            majorCount: 0,
            minorCount: 0,
            suitElements: [],
            suitFills: [],
            majorReadout: '',
            minorReadout: ''
        };
        const wheel = document.querySelector(
            '.face-active [data-testid="m3-inspectors"] [data-testid="m3-tarot-wheel"]'
        );
        if (!wheel) {
            return empty;
        }
        const majors = Array.from(wheel.querySelectorAll('[data-testid^="m3-tarot-major-"]')).filter(
            node => /m3-tarot-major-\d+$/.test(node.getAttribute('data-testid') ?? '')
        );
        const minors = Array.from(wheel.querySelectorAll('[data-testid^="m3-tarot-minor-"]')).filter(
            node => /m3-tarot-minor-\d+$/.test(node.getAttribute('data-testid') ?? '')
        );
        const idOf = (node: Element, prefix: string) =>
            Number((node.getAttribute('data-testid') ?? '').replace(prefix, ''));
        return {
            present: true,
            majorState: wheel.getAttribute('data-major-state'),
            minorState: wheel.getAttribute('data-minor-state'),
            majorCardRaw: wheel.getAttribute('data-major-card'),
            minorCardRaw: wheel.getAttribute('data-minor-card'),
            litMajor: majors
                .filter(node => node.getAttribute('data-active') === 'true')
                .map(node => idOf(node, 'm3-tarot-major-')),
            litMinor: minors
                .filter(node => node.getAttribute('data-active') === 'true')
                .map(node => idOf(node, 'm3-tarot-minor-')),
            majorCount: majors.length,
            minorCount: minors.length,
            suitElements: [0, 14, 28, 42].map(
                id =>
                    wheel
                        .querySelector(`[data-testid="m3-tarot-minor-${id}"]`)
                        ?.getAttribute('data-element') ?? null
            ),
            suitFills: [0, 14, 28, 42].map(
                id =>
                    wheel
                        .querySelector(`[data-testid="m3-tarot-minor-${id}"]`)
                        ?.getAttribute('fill') ?? null
            ),
            majorReadout:
                wheel.querySelector('[data-testid="m3-tarot-major-readout"]')?.textContent ?? '',
            minorReadout:
                wheel.querySelector('[data-testid="m3-tarot-minor-readout"]')?.textContent ?? ''
        };
    });
}

test('24.T24.6: the 22+56 tarot wheel lights the LIVE bussed arcana ids and turns a card over the gateway', async ({
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

    await inspectors.getByTestId('m3-summon-tarot-wheel').click();
    const wheel = inspectors.getByTestId('m3-tarot-wheel');
    await expect(wheel).toBeVisible();

    // ── (a) The LIVE gateway must carry both tarot ids. Before 24.T24.6 the
    //        projection stubbed them to `None` with the key absent, which lands
    //        here as `pending` — so requiring a non-pending state IS the
    //        live-wire proof that the mirror crossed the real wire, not a
    //        fixture. `card` and `no-arcana` are both acceptable ANSWERS.
    let snap!: WheelSnapshot;
    await expect(async () => {
        snap = await readWheel(page);
        expect(snap.present).toBe(true);
        expect(['card', 'no-arcana']).toContain(snap.majorState);
        expect(['card', 'no-arcana']).toContain(snap.minorState);
    }).toPass({ timeout: 30_000 });

    // (a.1) Both rings render in full.
    expect(snap.majorCount).toBe(22);
    expect(snap.minorCount).toBe(56);
    await expect(wheel.getByTestId('m3-tarot-counts')).toHaveText('22 + 56');

    // (a.2) Whatever the bus named is what is lit — and nothing else. When the
    //       bus answered "no arcana" (STOP codon / outside the 56-card cover)
    //       NOTHING is lit and the readout says which, so an honest refusal can
    //       never be mistaken for a lit card.
    if (snap.majorState === 'card') {
        const cardId = Number(snap.majorCardRaw);
        expect(Number.isInteger(cardId)).toBe(true);
        expect(cardId).toBeGreaterThanOrEqual(0);
        expect(cardId).toBeLessThanOrEqual(21);
        expect(snap.litMajor).toEqual([cardId]);
        expect(snap.majorReadout).toContain(`Atu ${cardId}`);
    } else {
        expect(snap.litMajor).toEqual([]);
        expect(snap.majorReadout).toContain('no-major-arcana:stop-codon');
    }

    if (snap.minorState === 'card') {
        const cardId = Number(snap.minorCardRaw);
        expect(Number.isInteger(cardId)).toBe(true);
        expect(cardId).toBeGreaterThanOrEqual(0);
        expect(cardId).toBeLessThanOrEqual(55);
        expect(snap.litMinor).toEqual([cardId]);
    } else {
        expect(snap.litMinor).toEqual([]);
        expect(snap.minorReadout).toContain('no-minor-arcana:outside-56-card-cover');
    }

    // (a.3) Suits carry their element and four DISTINCT colours — the arc heads
    //       are Cups(Water) · Wands(Fire) · Pentacles(Earth) · Swords(Air) in
    //       the kernel's deck order.
    expect(snap.suitElements).toEqual(['Water', 'Fire', 'Earth', 'Air']);
    expect(new Set(snap.suitFills).size).toBe(4);

    // ── (b) Turning a card goes out over the REAL gateway method and the answer
    //        is rendered as itself. The tarot arm of `s2.codon.scalar_ref.read`
    //        currently answers an explicit `resolved: false` naming its owner;
    //        the surface must show that, not a fabricated resolution.
    await expect(wheel).toHaveAttribute('data-rpc-method', 's2.codon.scalar_ref.read');
    await wheel.getByTestId('m3-tarot-minor-22').click();
    const turn = wheel.getByTestId('m3-tarot-turn-readout');
    await expect(turn).toBeVisible();
    await expect(turn).toHaveAttribute('data-turn-card', 'wands:09');
    await expect(turn).toHaveAttribute('data-turn-status', /resolved|unresolved/, {
        timeout: 15_000
    });
    const status = await turn.getAttribute('data-turn-status');
    expect(['resolved', 'unresolved']).toContain(status);
    if (status === 'unresolved') {
        // The honest refusal must name its owner so the surface cannot be
        // mistaken for a broken call.
        await expect(turn).toContainText('owner');
    }
});
