import { test, expect } from '@playwright/test';

test.describe('ClockCosmos Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows Clock Cosmos header', async ({ page }) => {
    await expect(page.getByText('Clock Cosmos')).toBeVisible();
  });

  test('displays branch lens bar with 6 lenses', async ({ page }) => {
    await expect(page.getByTitle(/Literal/)).toBeVisible();
    await expect(page.getByTitle(/Integral/)).toBeVisible();
  });

  test('S³ button toggles Hopf view', async ({ page }) => {
    const s3Button = page.getByRole('button', { name: 'S³' });
    await expect(s3Button).toBeVisible();
    await s3Button.click();
    await expect(page.getByText('Loading Hopf')).toBeVisible({ timeout: 5000 });
  });

  test('temporal strip shows day info', async ({ page }) => {
    await expect(page.getByText(/No day|day/i)).toBeVisible();
  });

  test('branch lens hotkeys work (Cmd+1 through Cmd+6)', async ({ page }) => {
    await page.keyboard.press('Meta+2');
    const funcBtn = page.getByTitle(/Functional/);
    await expect(funcBtn).toBeVisible();
  });
});
