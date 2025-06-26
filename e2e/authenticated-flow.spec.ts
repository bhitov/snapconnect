import { test, expect } from '@playwright/test';
import { signupWithAutoProfile } from './helpers/auth-simple';

test.describe('Authenticated user flows', () => {
  test('login and navigate to different screens', async ({ page }) => {
    await page.goto('/');

    // First create a user
    const { email, password } = await signupWithAutoProfile(page, 'auth');

    // Wait for navigation to main app
    await expect(page.getByTestId('friends-tab-button')).toBeVisible({ timeout: 500 });

    // Now logout (we'll need to add logout functionality)
    // For now, we'll just refresh and login
    await page.reload();

    // Should be back at login screen
    await expect(page.getByText("SnapConnect")).toBeVisible();

    // Login with the created account
    await page.getByPlaceholder('Enter your email').fill(email);
    await page.getByPlaceholder('Enter your password').fill(password);
    await page.getByRole('button', { name: 'Log In' }).click();

    // Should navigate back to main app
    await expect(page.getByTestId('friends-tab-button')).toBeVisible({ timeout: 3000 });
  });

  test('profile completion flow', async ({ page }) => {
    await page.goto('/');

    // Create a new user
    await signupWithAutoProfile(page, 'profile');

    // After registration, user should be on the main app
    await expect(page.getByTestId('friends-tab-button')).toBeVisible({ timeout: 500 });
    
    // The profile should be automatically created, so user lands on Friends screen
    await expect(page.getByTestId('friends-tab-button')).toBeVisible();
  });
});