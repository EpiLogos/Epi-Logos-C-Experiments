import { test, expect } from '@playwright/test';

test.describe('OmniPanel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Escape');
  });

  test('displays primary panel tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Chat' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Workspace' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Channels' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sessions' })).toBeVisible();
  });

  test('defaults to Overview panel', async ({ page }) => {
    await expect(page.getByText('System Status')).toBeVisible();
  });

  test('switches panels on tab click', async ({ page }) => {
    await page.getByRole('button', { name: 'Chat' }).click();
    await expect(page.getByText('Chat')).toBeVisible();
  });

  test('shows advanced panel dropdown', async ({ page }) => {
    await page.getByRole('button', { name: 'More' }).click();
    await expect(page.getByRole('button', { name: 'Config' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Debug' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logs' })).toBeVisible();
  });

  test('close button dismisses the panel', async ({ page }) => {
    const closeBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    await closeBtn.click();
    await expect(page.getByText('System Status')).not.toBeVisible();
  });
});
