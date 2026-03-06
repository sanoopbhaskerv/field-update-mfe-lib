import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  // Set MOCK_ROLE so the app boots immediately (skips artificial delays)
  await page.addInitScript(() => {
    window.localStorage.setItem('MOCK_ROLE', 'advisor');
  });
  await page.goto('/');

  // After SSO bootstrap, the advisor landing page should render
  await expect(page.locator('h1')).toContainText('Find a Client');
});
