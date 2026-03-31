import { test, expect } from '@playwright/test';

test('landing page renders and supports navigation shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /precision parts/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /browse catalog/i })).toBeVisible();
});
