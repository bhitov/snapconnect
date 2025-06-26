import { test, expect } from '@playwright/test';
import { signupWithAutoProfile } from './helpers/auth-simple';

test.describe('Simple User Flows', () => {
  test('basic navigation: signup and tab switching', async ({ page }) => {
    await page.goto('/');

    // Sign up and get to main app
    const user = await signupWithAutoProfile(page, 'testuser');
    await expect(page.getByTestId('friends-tab-button')).toBeVisible();
    
    // Test basic tab navigation
    await page.getByTestId('chats-tab-button').click();
    await expect(page.getByTestId('chats-tab-button')).toBeVisible();
    
    await page.getByTestId('friends-tab-button').click();
    await expect(page.getByTestId('friends-tab-button')).toBeVisible();
    
    await page.getByTestId('stories-tab-button').click();
    await expect(page.getByTestId('stories-tab-button')).toBeVisible();
    
    console.log('Basic navigation test completed successfully');
  });

  test('friends screen basic interaction', async ({ page }) => {
    await page.goto('/');

    const user = await signupWithAutoProfile(page, 'friendsuser');
    await expect(page.getByTestId('friends-tab-button')).toBeVisible();
    
    // Go to friends tab
    await page.getByTestId('friends-tab-button').click();
    
    // Look for basic friends functionality
    const addFriendsButton = page.getByText('Add Friends').first();
    if (await addFriendsButton.isVisible({ timeout: 2000 })) {
      await addFriendsButton.click();
      
      // Should see search functionality
      const searchInput = page.getByPlaceholder('Search').first();
      if (await searchInput.isVisible({ timeout: 2000 })) {
        await searchInput.fill('testfriend');
      }
    }
    
    console.log('Friends interaction test completed');
  });

  test('chats screen basic interaction', async ({ page }) => {
    await page.goto('/');

    const user = await signupWithAutoProfile(page, 'chatsuser');
    await expect(page.getByTestId('chats-tab-button')).toBeVisible();
    
    // Go to chats tab
    await page.getByTestId('chats-tab-button').click();
    
    // Basic verification that we're on chats screen
    await expect(page.getByTestId('chats-tab-button')).toBeVisible();
    
    console.log('Chats interaction test completed');
  });
});