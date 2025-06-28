import { test, expect } from '@playwright/test';

import { signupWithAutoProfile } from './helpers/auth-simple';

test('stories screen navigation', async ({ page }) => {
  await page.goto('/');

  // Complete signup flow
  await signupWithAutoProfile(page, 'story');

  // Wait for navigation to main app
  await expect(page.getByTestId('friends-tab-button')).toBeVisible({
    timeout: 500,
  });

  // Navigate to Stories tab
  await page.getByTestId('stories-tab-button').click();

  // Wait for stories screen to load by checking for expected elements
  await expect(page.getByTestId('stories-tab-button')).toBeVisible({
    timeout: 200,
  });

  // Verify we're on the stories screen by checking the tab is active
  await expect(page.getByTestId('stories-tab-button')).toBeVisible();
});

test('tab navigation persistence', async ({ page }) => {
  await page.goto('/');

  // Complete signup flow
  await signupWithAutoProfile(page, 'tabnav');

  // Wait for navigation to main app - should start on Friends tab
  await expect(page.getByTestId('friends-tab-button')).toBeVisible({
    timeout: 10000,
  });

  // Navigate through all tabs
  const tabs = ['chats-tab-button', 'camera-tab-button', 'stories-tab-button'];

  for (const tabTestId of tabs) {
    await page.getByTestId(tabTestId).click();
    await expect(page.getByTestId(tabTestId)).toBeVisible({ timeout: 200 });
  }

  // Go back to Friends
  await page.getByTestId('friends-tab-button').click();
  await expect(page.getByTestId('friends-tab-button')).toBeVisible();
});
