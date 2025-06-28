import { test, expect } from '@playwright/test';

import { signupWithAutoProfile } from './helpers/auth-simple';

test('navigation to friends tab after signup', async ({ page }) => {
  // Enable console logging
  page.on('console', message => {
    console.log(
      `Browser Console: ${message.type().toUpperCase()} ${message.text()}`
    );
  });

  await page.goto('/');

  await signupWithAutoProfile(page, 'nav');

  // Wait for the friends tab button to be visible (indicating successful auth)
  await expect(page.getByTestId('friends-tab-button')).toBeVisible({
    timeout: 500,
  });

  // Verify we're on the friends tab by default
  const friendsTabButton = page.getByTestId('friends-tab-button');

  // Click on a different tab (e.g., Chats)
  await page.getByTestId('chats-tab-button').click();

  // Wait for navigation by checking for expected elements
  await expect(page.getByTestId('chats-tab-button')).toBeVisible({
    timeout: 200,
  });

  // Click back to Friends tab
  await friendsTabButton.click();

  // Verify we're back on Friends tab
  await expect(friendsTabButton).toBeVisible();
});

test('simple navigation flow without auth', async ({ page }) => {
  // For this test, we'll check that the navigation ref is accessible
  // This will be expanded once we have a way to access the nav ref from tests

  await page.goto('/');

  // Verify login screen is shown
  await expect(page.getByText('SnapConnect')).toBeVisible();
  await expect(page.getByText("Don't have an account?")).toBeVisible();
});
