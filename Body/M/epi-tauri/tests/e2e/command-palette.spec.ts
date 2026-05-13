import { test, expect } from '@playwright/test';

test.describe('Command Palette', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens with / key', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.getByPlaceholder('Navigate to coordinate')).toBeVisible();
  });

  test('opens with Cmd+K', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    await expect(page.getByPlaceholder('Navigate to coordinate')).toBeVisible();
  });

  test('shows workspace navigation entries', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.getByText('M0 — Anuttara')).toBeVisible();
    await expect(page.getByText('M4 — Nara')).toBeVisible();
    await expect(page.getByText('M5 — Epii')).toBeVisible();
  });

  test('filters entries by query', async ({ page }) => {
    await page.keyboard.press('/');
    const input = page.getByPlaceholder('Navigate to coordinate');
    await input.fill('Nara');
    await expect(page.getByText('M4 — Nara')).toBeVisible();
    await expect(page.getByText('M0 — Anuttara')).not.toBeVisible();
  });

  test('closes on Escape', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.getByPlaceholder('Navigate to coordinate')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByPlaceholder('Navigate to coordinate')).not.toBeVisible();
  });

  test('navigates to M0 on selection', async ({ page }) => {
    await page.keyboard.press('/');
    const input = page.getByPlaceholder('Navigate to coordinate');
    await input.fill('M0');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Anuttara')).toBeVisible();
  });
});
