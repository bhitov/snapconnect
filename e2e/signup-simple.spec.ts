import { test, expect } from '@playwright/test';
import { signupWithAutoProfile } from './helpers/auth-simple';

test('simple signup with auto profile creation', async ({ page }) => {
  await page.goto('/');

  const { username } = await signupWithAutoProfile(page, 'simple');

  // Verify we're on the main app
  await expect(page.getByTestId('friends-tab-button')).toBeVisible();
  
  // Verify we can navigate between tabs
  await page.getByTestId('chats-tab-button').click();
  await expect(page.getByTestId('chats-tab-button')).toBeVisible({ timeout: 200 });
  
  await page.getByTestId('camera-tab-button').click();
  await expect(page.getByTestId('camera-tab-button')).toBeVisible({ timeout: 200 });
  
  await page.getByTestId('stories-tab-button').click();
  await expect(page.getByTestId('stories-tab-button')).toBeVisible({ timeout: 200 });
  
  // Go back to friends
  await page.getByTestId('friends-tab-button').click();
  await expect(page.getByTestId('friends-tab-button')).toBeVisible({ timeout: 200 });
});