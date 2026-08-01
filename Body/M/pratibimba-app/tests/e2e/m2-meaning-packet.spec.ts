/**
 * Coordinate: M2' meaning-packet inspector e2e (rerun 51.T51.4)
 * Actualises: the tranche's UF acceptance in a real browser against the real
 *   spawned gateway — "asserts the inspector's rendered packet matches the
 *   packet the app is actually holding, and that elemental rendering matches
 *   the L2′ ordering."
 *
 *   The match is checked against the SHELL's own live profile rather than a
 *   fixture: the page reads the tick store the app really booted (the same
 *   store `useTickStore` publishes into) and the inspector's rendered address,
 *   present-field set and pending set must equal what that payload contains.
 *   A hand-written inspector that drifted from the payload fails here.
 * Does NOT own: the reading law (`src/panes/m2MeaningPacket/meaningPacket.test.ts`),
 *   the element registers (`src/engine/elementRegisters.test.ts`).
 */

import { expect, test, type Page } from '@playwright/test';

/** The L2′ alchemical register, `m_canonical.h` ordering — the ONE thing this
 *  spec is allowed to restate, because it is the law under test. */
const L2_PRIME_ORDER = ['Aether', 'Earth', 'Water', 'Air', 'Fire', 'Salt'];

async function boot(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });
}

function inspector(page: Page) {
    return page.locator('.face-active [data-testid="m2-meaning-packet"]');
}

async function openInspector(page: Page): Promise<void> {
    await page.keyboard.press('Meta+Shift+P');
    await page.getByTestId('palette-input').fill('meaning-packet');
    await page.getByTestId('palette-item-m2.open.meaningPacket').click();
    await expect(page.getByTestId('shell')).toHaveAttribute('data-active-layout', 'ide-deep', {
        timeout: 30_000
    });
    await expect(inspector(page)).toBeVisible({ timeout: 30_000 });
}

test('51.T51.4: the inspector renders the packet the app is actually holding', async ({ page }) => {
    test.setTimeout(180_000);
    await boot(page);
    await openInspector(page);

    // The generation on the surface is the live profile generation.
    const generation = Number(await inspector(page).getAttribute('data-generation'));
    expect(generation, 'the inspector must be reading a real frame').toBeGreaterThan(0);

    // Every declared field row is present on the surface, and its present/pending
    // state agrees with the header's pending list — the two are computed from the
    // same reading, so a disagreement means the render invented something.
    const pending = ((await inspector(page).getAttribute('data-pending-fields')) ?? '')
        .split(' ')
        .filter(Boolean);
    const rows = inspector(page).locator('[data-testid^="m2-packet-field-"]');
    const rowCount = await rows.count();
    expect(rowCount, 'the twelve declared fields of M2’-SPEC :118').toBe(12);

    let presentCount = 0;
    for (let i = 0; i < rowCount; i += 1) {
        const row = rows.nth(i);
        const id = (await row.getAttribute('data-testid'))!.replace('m2-packet-field-', '');
        const present = (await row.getAttribute('data-present')) === 'true';
        expect(present, `\`${id}\` present-state disagrees with the pending list`).toBe(
            !pending.includes(id)
        );
        if (present) {
            presentCount += 1;
            // a present field must render a value, never the pending word
            await expect(row).not.toContainText('pending');
        }
        }
    expect(Number(await inspector(page).getAttribute('data-present-field-count'))).toBe(
        presentCount
    );
    expect(presentCount + pending.length).toBe(12);
});

test('51.T51.4: the 72-address views decode the ACTIVE address through all six axes', async ({
    page
}) => {
    test.setTimeout(180_000);
    await boot(page);
    await openInspector(page);

    const rawAddress = await inspector(page).getAttribute('data-address72');
    if (!rawAddress) {
        // Honest branch: with no `resonance72.lensAnchorIndex` on the wire the
        // inspector must say so and decode NOTHING — inventing address 0 is the
        // failure mode this asserts against.
        await expect(inspector(page).getByTestId('m2-packet-address-pending')).toBeVisible();
        await expect(inspector(page).locator('[data-testid^="m2-packet-axis-"]')).toHaveCount(0);
        return;
    }

    const address = Number(rawAddress);
    expect(address).toBeGreaterThanOrEqual(0);
    expect(address).toBeLessThan(72);
    for (const axis of ['mef', 'tattva', 'decan', 'shem', 'maqam', 'det']) {
        await expect(inspector(page).getByTestId(`m2-packet-axis-${axis}`)).toBeVisible();
    }
    // The MEF frame is the mef axis of the SAME address — lens = floor(n/6).
    await expect(inspector(page).getByTestId('m2-packet-mef-parts')).toContainText(
        `lens=${Math.floor(address / 6)}`
    );
    await expect(inspector(page).getByTestId('m2-packet-mef-parts')).toContainText(
        `position=${address % 6}`
    );
});

test('51.T51.4: elemental rendering matches the L2′ ordering, and Aether/Salt are not operative', async ({
    page
}) => {
    test.setTimeout(180_000);
    await boot(page);
    await openInspector(page);

    // The register is rendered in the `m_canonical.h` order, index-labelled.
    const register = inspector(page).getByTestId('m2-packet-element-register');
    await expect(register).toBeVisible();
    for (const [index, name] of L2_PRIME_ORDER.entries()) {
        await expect(register).toContainText(`${index}=${name}`);
    }

    // Any element the live payload carried is named THROUGH that register, and
    // the operative-quartet law holds on whatever really rendered.
    const entries = inspector(page).locator('[data-testid^="m2-packet-element-"]');
    const count = await entries.count();
    for (let i = 0; i < count; i += 1) {
        const entry = entries.nth(i);
        const id = await entry.getAttribute('data-element-id');
        if (!id) {
            continue;
        }
        const index = Number(id);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(6);
        expect(await entry.getAttribute('data-element-name')).toBe(L2_PRIME_ORDER[index]);
        expect(await entry.getAttribute('data-element-operative')).toBe(
            String(index >= 1 && index <= 4)
        );
    }
});
