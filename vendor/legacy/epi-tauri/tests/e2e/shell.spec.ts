import { test, expect } from '@playwright/test';

test.describe('Shell Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the 1:3 split layout', async ({ page }) => {
    await expect(page.locator('.flex.h-screen')).toBeVisible();
    const panels = page.locator('[data-panel]');
    await expect(panels).toHaveCount(2);
  });

  test('ClockCosmos panel is visible on the left', async ({ page }) => {
    await expect(page.getByText('Clock Cosmos')).toBeVisible();
  });

  test('WorkspacePanel defaults to M4 Nara', async ({ page }) => {
    await expect(page.getByText('Nara')).toBeVisible();
  });

  test('workspace switch via hotkey 0 → M0', async ({ page }) => {
    await page.keyboard.press('0');
    await expect(page.getByText('Anuttara')).toBeVisible();
  });

  test('workspace switch via hotkey 1 → M4', async ({ page }) => {
    await page.keyboard.press('1');
    await expect(page.getByText('Nara')).toBeVisible();
  });

  test('ESC toggles OmniPanel', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.getByText('OmniPanel')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('OmniPanel')).not.toBeVisible();
  });

  test('resize handle exists between panels', async ({ page }) => {
    const handle = page.locator('[data-panel-resize-handle-id]');
    await expect(handle).toBeVisible();
  });
});
