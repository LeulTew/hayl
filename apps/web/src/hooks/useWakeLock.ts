import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook to lock screen wake state.
 * Vital for workout apps so screen doesn't dim during a plank/set.
 */
export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        const lock = await navigator.wakeLock.request('screen');
        wakeLockRef.current = lock;
        setIsLocked(true);
        
        lock.addEventListener('release', () => {
          setIsLocked(false);
          wakeLockRef.current = null;
        });
        
        console.log('[WakeLock] Acquired');
      } catch (err) {
        console.error('[WakeLock] Failed to acquire:', err);
      }
    } else {
        console.warn('[WakeLock] Not supported in this browser');
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsLocked(false);
      console.log('[WakeLock] Released');
    }
  }, []);

  // Re-acquire lock when page creates visibility change (e.g. switching tabs and back)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !isLocked) {
        // Optional: Auto-reacquire? Or wait for user action? 
        // For a workout app, auto-reacquire if we were supposed to be active is good.
        // For now, we leave manual control to the consumer or valid state.
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      releaseLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [releaseLock, isLocked]);

  return { isLocked, requestLock, releaseLock };
}
