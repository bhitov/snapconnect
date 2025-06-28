import { Page } from '@playwright/test';

export async function signupAndSkipProfile(
  page: Page,
  userPrefix: string = 'user'
) {
  // Navigate to registration screen
  await page.getByText("Don't have an account?").click();
  await page.getByRole('button', { name: 'Sign Up' }).click();

  // Fill out registration form
  const timestamp = Date.now();
  const username = `${userPrefix}${timestamp.toString().slice(-8)}`;
  const email = `${userPrefix}${timestamp}@test.com`;

  await page.getByTestId('username-input').fill(username);
  await page.getByTestId('email-input').fill(email);
  await page.getByTestId('password-input').fill('password');
  await page.getByTestId('confirm-password-input').fill('password');

  await page.getByTestId('register-button').click();

  // Wait for the skip button to be visible and click it
  await page
    .getByTestId('complete-setup-button')
    .waitFor({ state: 'visible', timeout: 500 });
  await page.getByTestId('complete-setup-button').click();

  // Handle the confirmation dialog
  const skipDialogButton = page.getByRole('button', { name: 'Skip' });
  await skipDialogButton.waitFor({ state: 'visible', timeout: 500 });
  await skipDialogButton.click();

  // Wait for navigation to complete by checking for the main app element
  // The app automatically creates a default profile now, so we need to wait for that to complete
  await page
    .getByTestId('friends-tab-button')
    .waitFor({ state: 'visible', timeout: 5000 });

  return { username, email, password: 'password' };
}
