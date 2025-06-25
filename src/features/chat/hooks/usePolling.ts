/**
 * @file usePolling.ts
 * @description Custom hook for polling data updates at regular intervals.
 * Only triggers rerenders when data actually changes to optimize performance.
 */

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Options for the polling hook
 */
interface PollingOptions {
  /** Polling interval in milliseconds (default: 500ms for twice per second) */
  interval?: number;
  /** Whether to start polling immediately */
  immediate?: boolean;
  /** Whether to poll only when screen is focused */
  focusOnly?: boolean;
}

/**
 * Hook for polling data at regular intervals
 *
 * @param pollingFunction - Function to call for polling
 * @param options - Polling configuration options
 */
export function usePolling(
  pollingFunction: () => Promise<void> | void,
  options: PollingOptions = {}
) {
  const {
    interval = 500, // 2 times per second
    immediate = true,
    focusOnly = true,
  } = options;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);
  const pollingFunctionRef = useRef(pollingFunction);

  // Update the polling function ref when it changes
  pollingFunctionRef.current = pollingFunction;

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (isPollingRef.current) {
      console.log('🔄 Polling: Already active, skipping start');
      return;
    }

    console.log(`🔄 Polling: Starting with ${interval}ms interval`);
    isPollingRef.current = true;

    // Call immediately if requested
    if (immediate) {
      try {
        pollingFunctionRef.current();
      } catch (error) {
        console.error('❌ Polling: Immediate call failed:', error);
      }
    }

    // Set up interval
    intervalRef.current = setInterval(async () => {
      if (!isPollingRef.current) {
        console.log('🔄 Polling: Stopped during interval, clearing');
        return;
      }

      try {
        await pollingFunctionRef.current();
      } catch (error) {
        console.error('❌ Polling: Interval call failed:', error);
      }
    }, interval);
  }, [interval, immediate]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    console.log('🛑 Polling: Stopping');
    isPollingRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Handle focus-based polling
   */
  useFocusEffect(
    useCallback(() => {
      if (focusOnly) {
        console.log('👁️ Polling: Screen focused, starting polling');
        startPolling();

        return () => {
          console.log('👁️ Polling: Screen unfocused, stopping polling');
          stopPolling();
        };
      }
      return undefined;
    }, [focusOnly, startPolling, stopPolling])
  );

  /**
   * Handle non-focus-based polling lifecycle
   */
  useEffect(() => {
    if (!focusOnly) {
      startPolling();

      return () => {
        stopPolling();
      };
    }
    return undefined;
  }, [focusOnly, startPolling, stopPolling]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    startPolling,
    stopPolling,
    isPolling: isPollingRef.current,
  };
}
