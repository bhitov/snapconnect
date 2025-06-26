import { Page } from '@playwright/test';

export async function signupWithAutoProfile(page: Page, userPrefix: string = 'user') {
  // Navigate to registration screen
  await page.getByText("Don't have an account?").click();
  await page.getByRole('button', { name: 'Sign Up' }).click();

  // Fill out registration form
  const timestamp = Date.now();
  const username = `${userPrefix}${timestamp.toString().slice(-8)}`;
  const email = `${userPrefix}${timestamp}@test.com`;

  await page.getByTestId('username-input-register').fill(username);
  await page.getByTestId('email-input-register').fill(email);
  await page.getByTestId('password-input-register').fill('password');
  await page.getByTestId('confirm-password-input-register').fill('password');

  await page.getByTestId('register-button').click();

  // After registration, we might land on profile setup - check for skip button
  try {
    // Wait for complete setup button to appear (on profile setup screen)
    await page.getByTestId('complete-setup-button').waitFor({ state: 'visible', timeout: 3000 });
    await page.getByTestId('complete-setup-button').click();
  } catch (error) {
    // Complete setup button not found, maybe auto profile creation happened
    console.log('Complete setup button not found, checking for main app...');
  }

  // Wait for navigation to main app
  await page.getByTestId('friends-tab-button').waitFor({ state: 'visible', timeout: 5000 });

  return { username, email, password: 'password' };
}

export async function loginWithCredentials(page: Page, userData: { email: string, password: string }) {
  await page.goto('/');
  
  await page.getByTestId('email-input-login').waitFor({state: 'visible', timeout: 2000});
  await page.getByTestId('email-input-login').fill(userData.email);
  await page.getByTestId('password-input-login').fill(userData.password);
  await page.getByTestId('login-button').click();
  
  // Wait for successful login
  await page.getByTestId('friends-tab-button').waitFor({ state: 'visible', timeout: 5000 });
}