import { test, expect } from '@playwright/test';
import { signupWithAutoProfile } from './helpers/auth-simple';
import { NavigationHelper, injectNavigationHelpers } from './helpers/navigation';

test.describe('Navigation with Reference Tests', () => {
  test('navigation state tracking using navigationRef directly', async ({ page }) => {
    // Inject navigation helpers before page loads
    await injectNavigationHelpers(page);
    
    await page.goto('/');
    
    // Complete signup and get to main app
    await signupWithAutoProfile(page, 'navwithref');
    
    // Initialize navigation helper
    const navHelper = new NavigationHelper(page);
    
    // Wait for navigation ref to be available
    await page.waitForTimeout(500);
    
    // Try to get current route using navigation ref
    const currentRoute = await navHelper.getCurrentRouteName();
    console.log('Current route from navigation ref:', currentRoute);
    
    // Verify we're on the main tab navigation
    await expect(page.getByTestId('friends-tab-button')).toBeVisible();
    
    // Navigate to Chats and verify route change
    await page.getByTestId('chats-tab-button').click();
    await expect(page.getByTestId('chats-tab-button')).toBeVisible({ timeout: 200 });
    
    // Wait for route change and check navigation state
    await page.waitForTimeout(100);
    const chatsRoute = await navHelper.getCurrentRouteName();
    console.log('Route after clicking Chats:', chatsRoute);
    
    // Navigate to Camera
    await page.getByTestId('camera-tab-button').click();
    await expect(page.getByTestId('camera-tab-button')).toBeVisible({ timeout: 200 });
    
    await page.waitForTimeout(100);
    const cameraRoute = await navHelper.getCurrentRouteName();
    console.log('Route after clicking Camera:', cameraRoute);
    
    // Navigate to Stories
    await page.getByTestId('stories-tab-button').click();
    await expect(page.getByTestId('stories-tab-button')).toBeVisible({ timeout: 200 });
    
    await page.waitForTimeout(100);
    const storiesRoute = await navHelper.getCurrentRouteName();
    console.log('Route after clicking Stories:', storiesRoute);
    
    // Navigate back to Friends
    await page.getByTestId('friends-tab-button').click();
    await expect(page.getByTestId('friends-tab-button')).toBeVisible({ timeout: 200 });
    
    await page.waitForTimeout(100);
    const friendsRoute = await navHelper.getCurrentRouteName();
    console.log('Route after clicking Friends:', friendsRoute);
    
    // Take a screenshot of the final state
    await page.screenshot({ path: 'test-results/navigation-with-ref-final.png' });
    
    // Get full navigation state
    const navState = await navHelper.getNavigationState();
    console.log('Full navigation state:', JSON.stringify(navState, null, 2));
  });

  test('navigation state polling and verification', async ({ page }) => {
    await injectNavigationHelpers(page);
    await page.goto('/');
    
    await signupWithAutoProfile(page, 'navpoll');
    
    const navHelper = new NavigationHelper(page);
    
    // Wait for the main app to load
    await expect(page.getByTestId('friends-tab-button')).toBeVisible();
    
    // Test route polling by navigating rapidly
    await page.getByTestId('chats-tab-button').click();
    
    // Use the helper to wait for route change
    const routeChanged = await navHelper.waitForRoute('Chats', 1000);
    console.log('Route change detected:', routeChanged);
    
    await page.getByTestId('camera-tab-button').click();
    const cameraRouteChanged = await navHelper.waitForRoute('Camera', 1000);
    console.log('Camera route change detected:', cameraRouteChanged);
    
    // Take screenshots during navigation
    await page.screenshot({ path: 'test-results/navigation-polling-camera.png' });
    
    await page.getByTestId('stories-tab-button').click();
    const storiesRouteChanged = await navHelper.waitForRoute('Stories', 1000);
    console.log('Stories route change detected:', storiesRouteChanged);
    
    await page.screenshot({ path: 'test-results/navigation-polling-stories.png' });
  });

  test('error handling with navigation ref access', async ({ page }) => {
    await injectNavigationHelpers(page);
    await page.goto('/');
    
    const navHelper = new NavigationHelper(page);
    
    // Try to access navigation ref before it's ready
    const earlyRoute = await navHelper.getCurrentRouteName();
    console.log('Route before app loads:', earlyRoute);
    
    // Complete signup
    await signupWithAutoProfile(page, 'naverror');
    
    // Wait for navigation to be ready
    await expect(page.getByTestId('friends-tab-button')).toBeVisible();
    
    // Now navigation ref should be available
    await page.waitForTimeout(200);
    const readyRoute = await navHelper.getCurrentRouteName();
    console.log('Route after app loads:', readyRoute);
    
    // Test rapid navigation to check stability
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('chats-tab-button').click();
      await page.getByTestId('friends-tab-button').click();
      
      const route = await navHelper.getCurrentRouteName();
      console.log(`Rapid navigation ${i + 1}, route:`, route);
    }
    
    // Final screenshot
    await page.screenshot({ path: 'test-results/navigation-error-handling-final.png' });
  });
});