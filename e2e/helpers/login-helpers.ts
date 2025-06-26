import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  username: string;
  uid?: string;
}

// Store users created during test run
export const testUsers = new Map<string, TestUser>();

export async function loginExistingUser(page: Page, userKey: string): Promise<TestUser> {
  const user = testUsers.get(userKey);
  if (!user) {
    throw new Error(`User ${userKey} not found. Make sure to create the user first in an earlier test.`);
  }

  await page.goto('/');
  
  // Wait for auth state to settle
  await page.waitForTimeout(1000);
  
  // Check if already on login screen or need to navigate
  try {
    const loginButton = page.getByText('Login').or(page.getByTestId('login-button'));
    if (await loginButton.isVisible({ timeout: 2000 })) {
      await loginButton.click();
    }
  } catch {
    // Already on login screen or different flow
  }

  // Fill login form
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  
  // Submit login
  const submitButton = page.getByRole('button', { name: 'Sign In' })
    .or(page.getByRole('button', { name: 'Login' }))
    .or(page.getByTestId('login-submit'));
  
  await submitButton.click();
  
  // Wait for successful login
  await expect(page.getByTestId('friends-tab-button')).toBeVisible({ timeout: 10000 });
  
  console.log(`Successfully logged in user: ${user.username}`);
  return user;
}

export async function createAndStoreUser(page: Page, userKey: string, baseUsername: string): Promise<TestUser> {
  const timestamp = Date.now();
  const user: TestUser = {
    email: `${baseUsername}${timestamp}@test.com`,
    password: 'testpass123',
    username: `${baseUsername}${timestamp}`
  };

  await page.goto('/');
  
  // Navigate to registration
  const signupButton = page.getByText('Sign Up').or(page.getByTestId('signup-button'));
  if (await signupButton.isVisible({ timeout: 2000 })) {
    await signupButton.click();
  }

  // Fill registration form
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  
  const submitButton = page.getByRole('button', { name: 'Sign Up' })
    .or(page.getByRole('button', { name: 'Register' }))
    .or(page.getByTestId('register-submit'));
    
  await submitButton.click();

  // Complete profile setup if needed
  try {
    const profileSetupTitle = page.getByText('Complete Your Profile').or(page.getByText('Profile Setup'));
    if (await profileSetupTitle.isVisible({ timeout: 3000 })) {
      await page.getByPlaceholder('Display Name').fill(user.username);
      
      const completeButton = page.getByRole('button', { name: 'Complete Profile' })
        .or(page.getByRole('button', { name: 'Save' }))
        .or(page.getByTestId('complete-profile'));
        
      await completeButton.click();
    }
  } catch {
    // Profile setup might be automatic
  }

  // Wait for successful signup
  await expect(page.getByTestId('friends-tab-button')).toBeVisible({ timeout: 10000 });
  
  // Store user for later tests
  testUsers.set(userKey, user);
  console.log(`Created and stored user: ${userKey} -> ${user.username}`);
  
  return user;
}