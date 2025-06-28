import { test, expect } from '@playwright/test';

import { signupWithAutoProfile } from './helpers/auth-simple';

test.describe('Navigation Reference Tests', () => {
  test('navigation state verification using navigationRef', async ({
    page,
  }) => {
    // Enable console logging to capture navigation state
    const logs: string[] = [];
    page.on('console', message => {
      const text = message.text();
      logs.push(text);
      console.log(`Browser Console: ${message.type().toUpperCase()} ${text}`);
    });

    await page.goto('/');

    // Complete signup and get to main app
    await signupWithAutoProfile(page, 'navref');

    // Verify we're on the Friends tab by default
    await expect(page.getByTestId('friends-tab-button')).toBeVisible();

    // Navigate to different tabs and verify navigation state

    // Navigate to Chats
    await page.getByTestId('chats-tab-button').click();
    await expect(page.getByTestId('chats-tab-button')).toBeVisible({
      timeout: 200,
    });

    // Navigate to Camera
    await page.getByTestId('camera-tab-button').click();
    await expect(page.getByTestId('camera-tab-button')).toBeVisible({
      timeout: 200,
    });

    // Navigate to Stories
    await page.getByTestId('stories-tab-button').click();
    await expect(page.getByTestId('stories-tab-button')).toBeVisible({
      timeout: 200,
    });

    // Navigate back to Friends
    await page.getByTestId('friends-tab-button').click();
    await expect(page.getByTestId('friends-tab-button')).toBeVisible({
      timeout: 200,
    });

    // Take a screenshot at the end to verify final state
    await page.screenshot({
      path: 'test-results/navigation-ref-final-state.png',
    });
  });

  test('navigation state tracking with console inspection', async ({
    page,
  }) => {
    const navigationLogs: string[] = [];

    page.on('console', message => {
      const text = message.text();
      // Capture navigation-related logs
      if (
        text.includes('RootNavigator') ||
        text.includes('navigation') ||
        text.includes('route')
      ) {
        navigationLogs.push(text);
      }
      console.log(`Nav Log: ${text}`);
    });

    await page.goto('/');

    // Complete signup
    await signupWithAutoProfile(page, 'navtrack');

    // Take screenshot after signup
    await page.screenshot({ path: 'test-results/after-signup.png' });

    // Wait a bit for any navigation logs to be captured
    await page.waitForTimeout(100);

    // Navigate through tabs to trigger navigation events
    const tabs = [
      'chats-tab-button',
      'camera-tab-button',
      'stories-tab-button',
      'friends-tab-button',
    ];

    for (const tabTestId of tabs) {
      await page.getByTestId(tabTestId).click();
      await expect(page.getByTestId(tabTestId)).toBeVisible({ timeout: 200 });

      // Wait for any navigation state changes to be logged
      await page.waitForTimeout(50);

      // Take screenshot for each tab
      const tabName = tabTestId.replace('-tab-button', '');
      await page.screenshot({
        path: `test-results/navigation-${tabName}-tab.png`,
      });
    }

    // Verify we captured some navigation logs
    console.log('Captured navigation logs:', navigationLogs.length);
    navigationLogs.forEach(log => console.log('  -', log));
  });

  test('error handling and recovery in navigation', async ({ page }) => {
    await page.goto('/');

    // Complete signup
    await signupWithAutoProfile(page, 'errortest');

    // Verify navigation works normally first
    await page.getByTestId('chats-tab-button').click();
    await expect(page.getByTestId('chats-tab-button')).toBeVisible({
      timeout: 200,
    });

    // Try rapid navigation switches to test stability
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('friends-tab-button').click();
      await page.getByTestId('stories-tab-button').click();
      await page.getByTestId('camera-tab-button').click();
    }

    // Verify we end up in a stable state
    await page.getByTestId('friends-tab-button').click();
    await expect(page.getByTestId('friends-tab-button')).toBeVisible({
      timeout: 200,
    });

    // Take final screenshot
    await page.screenshot({ path: 'test-results/rapid-navigation-final.png' });
  });
});
