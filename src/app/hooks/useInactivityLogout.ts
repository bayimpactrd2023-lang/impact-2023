/**
 * useInactivityLogout Hook
 * 
 * Automatically logs out admin users after a period of inactivity:
 * - Monitors user activity (mouse, keyboard, touch, scroll)
 * - 5-minute inactivity timeout
 * - Shows warning before logout
 * - Resets timer on any user interaction
 */

import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const WARNING_BEFORE_LOGOUT = 30 * 1000; // 30 seconds warning

interface UseInactivityLogoutOptions {
  onLogout: () => void;
  onWarning?: () => void;
  enabled?: boolean;
}

export const useInactivityLogout = ({
  onLogout,
  onWarning,
  enabled = true,
}: UseInactivityLogoutOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  /**
   * Reset the inactivity timer
   */
  const resetTimer = useCallback(() => {
    if (!enabled) return;

    clearTimers();

    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      if (onWarning) {
        onWarning();
      }
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      onLogout();
    }, INACTIVITY_TIMEOUT);
  }, [enabled, onLogout, onWarning, clearTimers]);

  /**
   * Activity event handler
   */
  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    // Start the timer
    resetTimer();

    // Activity events to monitor
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners with throttling to prevent excessive resets
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledHandleActivity = () => {
      if (!throttleTimeout) {
        handleActivity();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 1000); // Throttle to once per second
      }
    };

    events.forEach(event => {
      document.addEventListener(event, throttledHandleActivity);
    });

    // Cleanup
    return () => {
      clearTimers();
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
      events.forEach(event => {
        document.removeEventListener(event, throttledHandleActivity);
      });
    };
  }, [enabled, resetTimer, handleActivity, clearTimers]);

  return {
    resetTimer,
  };
};
