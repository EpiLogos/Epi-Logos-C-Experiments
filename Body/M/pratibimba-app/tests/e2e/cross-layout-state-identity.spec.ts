/**
 * Coordinate: M' shell acceptance
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #0/1 cross-layout carrier boundary
 * Actualises: real Chromium proof that daily-0-1 <-> ide-deep preserves the
 *   seven-field shared identity tuple and the persisted M0 layer/phase/mode
 *   record (the OmniPanel fold is panel state, not identity).
 * Public surface: Playwright test over the spawned gateway and filesystem vault sidecar
 * Does NOT own: gateway profile production, session storage, day anchoring, or route target law
 * Contract: [[M'-SYSTEM-SPEC]] and rerun tranche [[11.T11.6]]
 */

import { expect, Page, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';
import { todayId } from './e2e-env';

interface IdentityTuple {
    coordinate: string | null;
    lens: number | null;
    mode: number | null;
    profileGeneration: number | null;
    sessionKey: string | null;
    dayNow: string | null;
    activityBarMode: string;
}

interface IdentityReceipt {
    fromLayout: 'daily-0-1' | 'ide-deep';
    toLayout: 'daily-0-1' | 'ide-deep';
    before: IdentityTuple;
    after: IdentityTuple;
}

interface IntentPayload {
    coordinate: string;
    artifactUri: string | null;
    reviewId: string | null;
    dayNow: string;
    sessionKey: string;
    profileGeneration: number;
    privacyClass: string;
    requestedExtensionId: string;
    requestedContributionId: string;
}

async function dispatchIntent(page: Page, payload: IntentPayload): Promise<void> {
    await page.evaluate(async intent => {
        const registry = await import('/src/commands/registry.ts');
        const crossLayout = await import('/src/commands/crossLayoutIntent.ts');
        await registry.commands.execute(crossLayout.CROSS_LAYOUT_INTENT_COMMAND, intent);
    }, payload);
}

async function readReceipt(page: Page): Promise<IdentityReceipt> {
    const raw = await page.getByTestId('shell').getAttribute('data-cross-layout-identity-receipt');
    expect(raw, 'the rendered shell did not expose its atomic route receipt').toBeTruthy();
    return JSON.parse(raw as string) as IdentityReceipt;
}

async function ensureSessionsOpen(page: Page): Promise<void> {
    const button = page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Sessions' })
        .first();
    await expect(button).toBeVisible();
    if (!/--selected/.test((await button.getAttribute('class')) ?? '')) {
        await button.click();
    }
    await expect(button).toHaveClass(/--selected/);
}

test('11.T11.6: real shared identity survives daily -> deep -> daily routing', async ({ page }) => {
    const imported = (await gatewayRpc('sessions.import', {
        targetSessionKey: `e2e-cross-layout-${Date.now().toString(36)}`,
        sourceSessionKey: 'e2e-origin',
        label: 'e2e cross-layout identity'
    })) as { canonicalKey?: string };
    expect(imported.canonicalKey, 'sessions.import returned no canonical key').toBeTruthy();
    const sessionKey = imported.canonicalKey as string;

    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });

    const day = todayId();
    const editor = page.locator('.face-active [data-testid="m4-nara-editor"]');
    const beginToday = page.getByTestId('now-begin-today');
    await expect(editor.or(beginToday).first()).toBeVisible({ timeout: 15_000 });
    if (await beginToday.isVisible().catch(() => false)) {
        await beginToday.click().catch(() => undefined);
    }
    await expect(page.getByTestId('status-daynow')).toContainText(day, { timeout: 15_000 });

    await ensureSessionsOpen(page);
    const sessionButton = page.locator(`.face-active [data-testid="session-${sessionKey}"]`);
    await expect(sessionButton).toBeVisible({ timeout: 15_000 });
    await sessionButton.click();
    await expect(page.getByTestId('status-session')).toContainText(sessionKey);

    const generation = Number((await page.getByTestId('status-tick').textContent())?.match(/\d+/)?.[0]);
    expect(Number.isInteger(generation)).toBeTruthy();
    const common = {
        coordinate: 'M3-3',
        artifactUri: "Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md",
        reviewId: null,
        dayNow: day,
        sessionKey,
        profileGeneration: generation,
        privacyClass: 'protected'
    };

    await dispatchIntent(page, {
        ...common,
        requestedExtensionId: 'm3-mahamaya',
        requestedContributionId: 'codon'
    });
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep');
    const intoDeep = await readReceipt(page);
    expect(intoDeep).toMatchObject({ fromLayout: 'daily-0-1', toLayout: 'ide-deep' });
    expect(intoDeep.after).toEqual(intoDeep.before);
    expect(intoDeep.after).toMatchObject({ coordinate: 'M3-3', sessionKey, dayNow: day });
    expect(intoDeep.after.activityBarMode).toBe('coordinate-tree');
    expect(Number.isInteger(intoDeep.after.lens)).toBeTruthy();
    expect(Number.isInteger(intoDeep.after.mode)).toBeTruthy();
    expect(Number.isInteger(intoDeep.after.profileGeneration)).toBeTruthy();

    await dispatchIntent(page, {
        ...common,
        profileGeneration: intoDeep.after.profileGeneration as number,
        requestedExtensionId: 'm0-anuttara',
        requestedContributionId: 'personal'
    });
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');
    const backToDaily = await readReceipt(page);
    expect(backToDaily).toMatchObject({ fromLayout: 'ide-deep', toLayout: 'daily-0-1' });
    expect(backToDaily.after).toEqual(backToDaily.before);
    expect(backToDaily.after).toMatchObject({ coordinate: 'M3-3', sessionKey, dayNow: day });
    expect(backToDaily.after.activityBarMode).toBe('coordinate-tree');
    expect(Number.isInteger(backToDaily.after.lens)).toBeTruthy();
    expect(Number.isInteger(backToDaily.after.mode)).toBeTruthy();
    expect(Number.isInteger(backToDaily.after.profileGeneration)).toBeTruthy();

    await expect(page.getByTestId('status-coordinate')).toContainText('M3-3');
    await expect(page.getByTestId('status-session')).toContainText(sessionKey);
    await expect(page.getByTestId('status-daynow')).toContainText(day);

    await dispatchIntent(page, {
        ...common,
        profileGeneration: backToDaily.after.profileGeneration as number,
        requestedExtensionId: 'm0-anuttara',
        requestedContributionId: 'relations'
    });
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep');
    const m0Surface = page.getByTestId('m0-surface-state');
    await expect(m0Surface).toHaveAttribute('data-active-layer', 'rel');
    await page.getByTestId('m0-phase-explicate').click();
    await page.getByTestId('m0-mode-switch-authoring').click();
    await expect(m0Surface).toHaveAttribute('data-implicate-explicate', 'explicate');
    await expect(m0Surface).toHaveAttribute('data-mode', 'authoring');

    await dispatchIntent(page, {
        ...common,
        profileGeneration: Number((await page.getByTestId('status-tick').textContent())?.match(/\d+/)?.[0]),
        requestedExtensionId: 'm0-anuttara',
        requestedContributionId: 'personal'
    });
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');
    await expect(shell).toHaveAttribute(
        'data-m0-surface-state',
        JSON.stringify({ activeLayer: 'rel', implicateExplicate: 'explicate', mode: 'authoring' })
    );

    await dispatchIntent(page, {
        ...common,
        profileGeneration: Number((await page.getByTestId('status-tick').textContent())?.match(/\d+/)?.[0]),
        requestedExtensionId: 'm0-anuttara',
        requestedContributionId: 'graph'
    });
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep');
    await expect(page.getByTestId('m0-surface-state')).toHaveAttribute('data-active-layer', 'rel');
    await expect(page.getByTestId('m0-surface-state')).toHaveAttribute('data-implicate-explicate', 'explicate');
    await expect(page.getByTestId('m0-surface-state')).toHaveAttribute('data-mode', 'authoring');
});
