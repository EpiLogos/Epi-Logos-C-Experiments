/**
 * Coordinate: M' (drivable-loop spec: type voice — 30.T30.1 / DR-FACE-7)
 * Actualises: the UF proof that the organism speaks ONE type voice — the
 *   `--type-*` vocabulary defined on :root in styles.css. Two claims, both
 *   against the real app on the real gateway: (a) the whole vocabulary is
 *   live on the root element, (b) every rendered element's computed
 *   font-size resolves to a named step of the scale (or the root default
 *   the scale is relative to) — no ad-hoc size survives anywhere the DOM
 *   actually renders. A typed-constants file cannot pass this; only the
 *   live cascade can.
 */

import { expect, test } from '@playwright/test';

/** The full T30.1 vocabulary — parity with src/styles.css :root. */
const TYPE_VOCABULARY = [
    '--type-heading-1',
    '--type-heading-2',
    '--type-heading-3',
    '--type-heading-4',
    '--type-body',
    '--type-body-small',
    '--type-caption',
    '--type-micro',
    '--type-mono',
    '--type-glyph',
    '--type-matheme-block',
    '--type-matheme-inline'
];

test('the organism speaks one type voice: the --type-* scale is live and nothing renders outside it', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // (a) the whole vocabulary is defined on the live root
    const vocabulary = await page.evaluate((names: string[]) => {
        const rootStyle = getComputedStyle(document.documentElement);
        return Object.fromEntries(names.map(name => [name, rootStyle.getPropertyValue(name).trim()]));
    }, TYPE_VOCABULARY);
    for (const name of TYPE_VOCABULARY) {
        expect(vocabulary[name], `${name} must be defined on :root`).not.toBe('');
    }

    // (b) sweep every element the app renders: its computed font-size must be
    // a named step of the scale (or the root default the rem scale hangs on).
    const offVoice = await page.evaluate((names: string[]) => {
        const doc = document;
        const rootStyle = getComputedStyle(doc.documentElement);
        const rootPx = parseFloat(rootStyle.fontSize);
        const stepPx = new Set<number>([Math.round(rootPx * 100)]);
        for (const name of names) {
            const raw = rootStyle.getPropertyValue(name).trim();
            if (raw.endsWith('rem')) stepPx.add(Math.round(parseFloat(raw) * rootPx * 100));
        }
        const misses: string[] = [];
        for (const el of Array.from(doc.querySelectorAll('#root *'))) {
            if (el instanceof SVGElement) continue; // SVG glyph sizes are geometry, not type voice
            const tag = el.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style' || tag === 'canvas') continue;
            const px = Math.round(parseFloat(getComputedStyle(el).fontSize) * 100);
            if (!stepPx.has(px)) {
                misses.push(`${tag}.${(el as HTMLElement).className} @ ${px / 100}px`);
            }
        }
        return misses;
    }, TYPE_VOCABULARY);
    expect(offVoice, `elements rendering outside the --type-* scale:\n${offVoice.join('\n')}`).toEqual([]);
});
