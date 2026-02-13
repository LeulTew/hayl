import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LocalSession, type LogEntry } from '../lib/db';
import { useCallback } from 'react';

/**
 * useActiveSession
 * 
 * Central hook for managing the gym-floor workout experience.
 * Powered by Dexie.js for robust offline persistence and reactive UI updates.
 */
export function useActiveSession() {
  // 1. Reactive query for the current active session
  const activeSession = useLiveQuery(
    () => db.sessions.where('state').equals('active').first()
  );

  /**
   * Starts a new workout session
   */
  const startSession = useCallback(async (programId: string, planId: string, dayIndex: number) => {
    // Safety: Don't start if one is already active
    const existing = await db.sessions.where('state').equals('active').first();
    if (existing) return existing.sessionId;

    const sessionId = crypto.randomUUID();
    const newSession: LocalSession = {
      sessionId,
      programId,
      planId,
      state: 'active',
      startTime: Date.now(),
      currentDayIndex: dayIndex,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      logs: [],
      lastModifiedTs: Date.now(),
    };

    await db.sessions.add(newSession);
    return sessionId;
  }, []);

  /**
   * Records a set in the current session
   */
  const logSet = useCallback(async (exerciseId: string, reps: number, weight?: number, rpe?: number) => {
    if (!activeSession?.id) return;

    await db.transaction('rw', db.sessions, async () => {
      const latestSession = await db.sessions.get(activeSession.id as number);
      if (!latestSession?.id || latestSession.state !== 'active') return;

      const nextSetIndex = latestSession.currentSetIndex;
      const newLog: LogEntry = {
        exerciseId,
        setId: crypto.randomUUID(),
        setIndex: nextSetIndex,
        weight,
        reps,
        rpe,
        timestamp: Date.now(),
      };

      const updatedLogs = [...latestSession.logs, newLog];

      await db.sessions.update(latestSession.id, {
        logs: updatedLogs,
        currentSetIndex: nextSetIndex + 1,
        lastModifiedTs: Date.now(),
      });
    });
  }, [activeSession]);

  /**
   * Advances to the next exercise
   */
  const nextExercise = useCallback(async () => {
      if (!activeSession?.id) return;
      
      await db.sessions.update(activeSession.id, {
          currentExerciseIndex: activeSession.currentExerciseIndex + 1,
          currentSetIndex: 0, // Reset set counter for new exercise
          lastModifiedTs: Date.now(),
      });
  }, [activeSession]);

  /**
   * Ends the current session
   */
  const finishSession = useCallback(async () => {
    if (!activeSession?.id) return;

    await db.sessions.update(activeSession.id, {
      state: 'completed',
      endTime: Date.now(),
      lastModifiedTs: Date.now(),
    });
  }, [activeSession]);

  /**
   * Discards the current session (no data saved to history)
   */
  const discardSession = useCallback(async () => {
    if (!activeSession?.id) return;

    await db.sessions.update(activeSession.id, {
        state: 'discarded',
        endTime: Date.now(),
        lastModifiedTs: Date.now(),
    });
  }, [activeSession]);

  return {
    activeSession,
    isLoading: activeSession === undefined,
    startSession,
    logSet,
    nextExercise,
    finishSession,
    discardSession,
  };
}
