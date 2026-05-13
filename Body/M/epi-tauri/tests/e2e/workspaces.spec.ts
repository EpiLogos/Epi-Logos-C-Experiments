import { test, expect } from '@playwright/test';

test.describe('Workspace Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('M0 Anuttara shows graph visualization', async ({ page }) => {
    await page.keyboard.press('0');
    await expect(page.getByText('Anuttara')).toBeVisible();
  });

  test('M0 has 2D/3D toggle', async ({ page }) => {
    await page.keyboard.press('0');
    const toggleBtn = page.getByTitle('Toggle 2D/3D');
    await expect(toggleBtn).toBeVisible();
  });

  test('Cmd+D toggles dimension', async ({ page }) => {
    await page.keyboard.press('0');
    await page.keyboard.press('Meta+d');
    await expect(page.getByText('2D')).toBeVisible();
  });

  test('M4 Nara shows journal editor', async ({ page }) => {
    await page.keyboard.press('1');
    await expect(page.getByText('Nara')).toBeVisible();
    await expect(page.getByText('Journal')).toBeVisible();
  });

  test('M4 Nara has flow timeline tab', async ({ page }) => {
    await page.keyboard.press('1');
    await expect(page.getByRole('button', { name: 'Flow' })).toBeVisible();
  });

  test('M4 Nara has highlights tab', async ({ page }) => {
    await page.keyboard.press('1');
    await expect(page.getByRole('button', { name: 'Highlights' })).toBeVisible();
  });

  test('M5 Epii shows library/atelier/agent tabs', async ({ page }) => {
    await page.keyboard.press('/');
    await page.getByPlaceholder('Navigate to coordinate').fill('M5');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Library')).toBeVisible();
    await expect(page.getByText('Atelier')).toBeVisible();
    await expect(page.getByText('Epii Agent')).toBeVisible();
  });
});
