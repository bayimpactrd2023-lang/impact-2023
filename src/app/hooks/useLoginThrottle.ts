/**
 * useLoginThrottle Hook
 * 
 * Manages login attempt throttling with the following features:
 * - Tracks failed login attempts
 * - Locks account after 5 failed attempts
 * - 5-minute cooldown period with countdown timer
 * - Persists state in localStorage for security
 * - Automatic cleanup of expired locks
 */

import { useState, useEffect, useCallback } from 'react';

interface LoginThrottleState {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const STORAGE_KEY = 'login_throttle_state';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useLoginThrottle = () => {
  const [state, setState] = useState<LoginThrottleState>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as LoginThrottleState;
        // Check if lockout has expired
        if (parsed.lockedUntil && parsed.lockedUntil < Date.now()) {
          return { attempts: 0, lockedUntil: null, lastAttempt: 0 };
        }
        return parsed;
      } catch {
        return { attempts: 0, lockedUntil: null, lastAttempt: 0 };
      }
    }
    return { attempts: 0, lockedUntil: null, lastAttempt: 0 };
  });

  const [remainingTime, setRemainingTime] = useState(0);

  // Update countdown timer
  useEffect(() => {
    if (!state.lockedUntil) {
      setRemainingTime(0);
      return;
    }

    const lockedUntil = state.lockedUntil;  // Capture non-null value

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, lockedUntil - now);
      
      if (remaining === 0) {
        // Lock expired, reset state
        const newState = { attempts: 0, lockedUntil: null, lastAttempt: 0 };
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        setRemainingTime(0);
      } else {
        setRemainingTime(Math.ceil(remaining / 1000));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [state.lockedUntil]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  /**
   * Check if login is currently allowed
   */
  const isLocked = useCallback(() => {
    if (!state.lockedUntil) return false;
    return Date.now() < state.lockedUntil;
  }, [state.lockedUntil]);

  /**
   * Record a failed login attempt
   */
  const recordFailedAttempt = useCallback(() => {
    setState(prev => {
      const newAttempts = prev.attempts + 1;
      const now = Date.now();
      
      if (newAttempts >= MAX_ATTEMPTS) {
        // Lock the account
        return {
          attempts: newAttempts,
          lockedUntil: now + LOCKOUT_DURATION,
          lastAttempt: now,
        };
      }
      
      return {
        attempts: newAttempts,
        lockedUntil: null,
        lastAttempt: now,
      };
    });
  }, []);

  /**
   * Reset login attempts (call on successful login)
   */
  const resetAttempts = useCallback(() => {
    const newState = { attempts: 0, lockedUntil: null, lastAttempt: 0 };
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  /**
   * Format remaining time as MM:SS
   */
  const formatRemainingTime = useCallback(() => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [remainingTime]);

  /**
   * Get remaining attempts before lockout
   */
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - state.attempts);

  return {
    isLocked: isLocked(),
    remainingAttempts,
    remainingTime,
    formatRemainingTime,
    recordFailedAttempt,
    resetAttempts,
    currentAttempts: state.attempts,
  };
};
