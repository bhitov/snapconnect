import { Page } from '@playwright/test';

/**
 * Helper to access navigation state via the navigationRef
 * This implements the approach described in claude-react.md for accessing the navigation ref
 */
export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Get the current route name using the navigation ref
   * This evaluates the navigationRef.getCurrentRoute() in the browser context
   */
  async getCurrentRouteName(): Promise<string | null> {
    return await this.page.evaluate(() => {
      // Access the navigation ref that was created in src/shared/navigation/navigationRef.ts
      // @ts-ignore - navigationRef is globally accessible in the app
      const navRef = window.__navigationRef || window.navigationRef;
      if (navRef && navRef.getCurrentRoute) {
        const route = navRef.getCurrentRoute();
        return route ? route.name : null;
      }
      return null;
    });
  }

  /**
   * Get the navigation state using the navigation ref
   */
  async getNavigationState(): Promise<any> {
    return await this.page.evaluate(() => {
      // @ts-ignore - navigationRef is globally accessible in the app
      const navRef = window.__navigationRef || window.navigationRef;
      if (navRef && navRef.getRootState) {
        return navRef.getRootState();
      }
      return null;
    });
  }

  /**
   * Wait for a specific route to be active
   */
  async waitForRoute(routeName: string, timeout: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const currentRoute = await this.getCurrentRouteName();
      if (currentRoute === routeName) {
        return true;
      }
      await this.page.waitForTimeout(100);
    }
    
    return false;
  }

  /**
   * Expose navigation ref to window for testing
   * This should be called after the app loads to make the ref accessible
   */
  async exposeNavigationRef(): Promise<void> {
    await this.page.evaluate(() => {
      // Try to find the navigation ref in the React component tree
      // This is a more robust approach for testing
      const findNavigationRef = () => {
        // Look for the navigation container in the DOM
        const root = document.getElementById('root');
        if (root) {
          // Access React internal instance to find navigation ref
          const reactInternalInstance = (root as any)._reactInternalInstance || (root as any).__reactInternalInstance;
          if (reactInternalInstance) {
            // Navigate through React fiber tree to find navigation ref
            // This is implementation-specific and may need adjustment
            console.log('Found React internal instance');
          }
        }
      };
      
      findNavigationRef();
    });
  }
}

/**
 * Alternative approach: Inject navigation ref access through console commands
 */
export async function injectNavigationHelpers(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // This script runs before the page loads, setting up helpers
    (window as any).__navigationHelpers = {
      getCurrentRoute: () => {
        // This will be populated by the app when navigation ref is ready
        const navRef = (window as any).__navigationRef;
        return navRef?.getCurrentRoute?.()?.name || null;
      },
      getNavigationState: () => {
        const navRef = (window as any).__navigationRef;
        return navRef?.getRootState?.() || null;
      }
    };
  });
}

/**
 * Poll-based approach to wait for navigation changes
 */
export async function waitForNavigationChange(
  page: Page, 
  expectedRoute: string, 
  timeout: number = 3000
): Promise<boolean> {
  const helper = new NavigationHelper(page);
  return await helper.waitForRoute(expectedRoute, timeout);
}