/**
 * Coordinate: M' M5' (axiom-translation inspector UI-flow proof — 26.T26.14)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #4 the DR-B-2 four-column translation read surface
 * Actualises: real Chromium proof that the Axiom inspector reads the seeded
 *   session from s5'.epii.axiom_translation_history over a spawned gateway and
 *   renders the Philosophical English → Formal Notation → OWL → SHACL chain with
 *   its pending verification badge and expandable reasoning. The producer's
 *   model chain is proven by the Rust unit tests (gate::epii_axiom); this proves
 *   the read + render against the real persisted store.
 * Public surface: Playwright test over the spawned gateway.
 * Does NOT own: the translation law or the producer.
 * Contract: [[M5'-SPEC]] + rerun [[26-m5-epii-frontend-deep]] 26.14.
 */

import { expect, Page, test } from '@playwright/test';

/** House idiom (visual-panes.spec): ⌘. toggles to the cosmic face (0). */
async function switchToCosmicFace(page: Page): Promise<void> {
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
}

test('26.T26.14: the axiom inspector renders the seeded English→Formal→OWL→SHACL chain from the gateway', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    await switchToCosmicFace(page);
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Axiom' }).click();

    const inspector = page.getByTestId('pi-axiom-translation-inspector');
    await expect(inspector).toBeVisible();
    await expect(inspector).toHaveAttribute('data-view-id', 'm5.epii.axiomTranslation');

    // The seeded session (global-setup) reads back through the real gateway.
    const session = inspector.getByTestId('axiom-session');
    await expect(session).toBeVisible({ timeout: 20_000 });
    await expect(session).toHaveAttribute('data-session-id', 'axiom-e2e-seed');

    // Four-column chain: every canonical form is present with its real text.
    for (const form of ['philosophical-english', 'formal-notation', 'owl', 'shacl']) {
        await expect(inspector.getByTestId(`axiom-form-${form}`)).toBeVisible();
    }
    await expect(inspector.getByTestId('axiom-form-philosophical-english')).toContainText(
        'All beings return to the ground.'
    );
    await expect(inspector.getByTestId('axiom-form-shacl')).toContainText('sh:NodeShape');

    // Verification badge reads pending (pi-translated, not yet human-final).
    await expect(inspector.getByTestId('axiom-verification-badge')).toHaveAttribute(
        'data-state',
        'pending'
    );

    // Reasoning trace expands on click.
    await expect(inspector.getByTestId('axiom-reasoning-0')).toHaveCount(0);
    await inspector.getByTestId('axiom-step-toggle-0').click();
    await expect(inspector.getByTestId('axiom-reasoning-0')).toContainText('universally quantify');
});
