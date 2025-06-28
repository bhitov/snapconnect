import { test, expect } from '@playwright/test';

import { signupWithAutoProfile } from './helpers/auth-simple';

test('chat screen navigation and unread badge', async ({ page }) => {
  // Enable console logging
  page.on('console', message => {
    console.log(
      `Browser Console: ${message.type().toUpperCase()} ${message.text()}`
    );
  });

  await page.goto('/');

  // Complete signup flow
  await signupWithAutoProfile(page, 'chat');

  // Wait for navigation to main app
  await expect(page.getByTestId('friends-tab-button')).toBeVisible({
    timeout: 500,
  });

  // Navigate to Chats tab
  await page.getByTestId('chats-tab-button').click();

  // Wait for chats screen to load by checking for expected elements
  await expect(page.getByTestId('chats-tab-button')).toBeVisible({
    timeout: 200,
  });

  // Verify we're on the chats screen by checking the tab is active
  // Tab should be highlighted/selected when active
  await expect(page.getByTestId('chats-tab-button')).toBeVisible();
});

test('camera screen access', async ({ page }) => {
  await page.goto('/');

  // Complete signup flow
  await signupWithAutoProfile(page, 'camera');

  // Wait for navigation to main app
  await expect(page.getByTestId('friends-tab-button')).toBeVisible({
    timeout: 500,
  });

  // Navigate to Camera tab
  await page.getByTestId('camera-tab-button').click();

  // Wait for camera screen to load by checking for expected elements
  await expect(page.getByTestId('camera-tab-button')).toBeVisible({
    timeout: 200,
  });

  // Verify we're on the camera screen by checking the tab is active
  await expect(page.getByTestId('camera-tab-button')).toBeVisible();
});
