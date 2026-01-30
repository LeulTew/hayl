import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useWakeLock
 * 
 * A React hook for the Screen Wake Lock API.
 * Prevents the device screen from dimming/locking during active workouts.
 * 
 * Features:
 * - Automatic re-acquisition on visibilitychange
 * - Graceful error handling for unsupported browsers
 * - Clean release on unmount
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
 */
export function useWakeLock() {
  const [isSupported] = useState(() => 'wakeLock' in navigator);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Use ref to persist sentinel across re-renders
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  
  // Track if we should auto-reacquire on visibility change
  const shouldReacquireRef = useRef(false);

  /**
   * Request a screen wake lock
   * 
   * @returns Promise<boolean> - true if lock acquired successfully
   */
  const requestLock = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError(new Error('Wake Lock API not supported'));
      return false;
    }

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      shouldReacquireRef.current = true;
      setIsLocked(true);
      setError(null);

      // Listen for automatic release (tab switch, minimize, etc.)
      sentinel.addEventListener('release', () => {
        setIsLocked(false);
        wakeLockRef.current = null;
      });

      return true;
    } catch (err) {
      // Common failures: low battery, power saver mode, system policy
      const error = err instanceof Error ? err : new Error('Wake lock request failed');
      setError(error);
      setIsLocked(false);
      return false;
    }
  }, [isSupported]);

  /**
   * Release the current wake lock
   */
  const releaseLock = useCallback(async (): Promise<void> => {
    shouldReacquireRef.current = false;
    
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Ignore release errors - lock may already be released
      }
      wakeLockRef.current = null;
      setIsLocked(false);
    }
  }, []);

  // Re-acquire wake lock when tab becomes visible again
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === 'visible' &&
        shouldReacquireRef.current &&
        !wakeLockRef.current
      ) {
        // Auto-reacquire for workout apps - critical for gym floor use
        try {
          const sentinel = await navigator.wakeLock.request('screen');
          wakeLockRef.current = sentinel;
          setIsLocked(true);
          
          sentinel.addEventListener('release', () => {
            setIsLocked(false);
            wakeLockRef.current = null;
          });
        } catch {
          // Silent fail on reacquisition - user can manually retry
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, []);

  return {
    /** Whether the Wake Lock API is supported in this browser */
    isSupported,
    /** Whether a wake lock is currently active */
    isLocked,
    /** Any error that occurred during the last request */
    error,
    /** Request a screen wake lock */
    requestLock,
    /** Release the current wake lock */
    releaseLock,
  };
}
