import { test, expect } from '@playwright/test';
import { signupWithAutoProfile } from './helpers/auth-simple';

test('full signup flow', async ({ page }) => {
  page.on('console', message => {
    console.log(`Browser Console: ${message.type().toUpperCase()} ${message.text()}`);
  });

  await page.goto('/');

  await signupWithAutoProfile(page, 'test');

  // Assert that the user is on the friends page by checking for the friends tab button
  await expect(page.getByTestId('friends-tab-button')).toBeVisible({ timeout: 500 });
});
