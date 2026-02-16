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

  const skipSet = useCallback(async () => {
    if (!activeSession?.id) return;

    await db.transaction('rw', db.sessions, async () => {
      const latestSession = await db.sessions.get(activeSession.id as number);
      if (!latestSession?.id || latestSession.state !== 'active') return;

      await db.sessions.update(latestSession.id, {
        currentSetIndex: latestSession.currentSetIndex + 1,
        lastModifiedTs: Date.now(),
      });
    });
  }, [activeSession]);

  const countLoggedSetsForExercise = useCallback((session: LocalSession, exerciseId: string) => {
    const indexes = new Set(
      session.logs
        .filter((log) => log.exerciseId === exerciseId)
        .map((log) => log.setIndex)
    );
    return indexes.size;
  }, []);

  const jumpToExercise = useCallback(async (targetExerciseIndex: number, exerciseId: string) => {
    if (!activeSession?.id) return;

    await db.transaction('rw', db.sessions, async () => {
      const latestSession = await db.sessions.get(activeSession.id as number);
      if (!latestSession?.id || latestSession.state !== 'active') return;

      const boundedIndex = Math.max(0, targetExerciseIndex);
      const completedSetsForTarget = countLoggedSetsForExercise(latestSession, exerciseId);

      await db.sessions.update(latestSession.id, {
        currentExerciseIndex: boundedIndex,
        currentSetIndex: completedSetsForTarget,
        lastModifiedTs: Date.now(),
      });
    });
  }, [activeSession, countLoggedSetsForExercise]);

  /**
   * Advances to the next exercise
   */
  const nextExercise = useCallback(async (exerciseId?: string) => {
      if (!activeSession?.id) return;

      const nextIndex = activeSession.currentExerciseIndex + 1;

      await db.transaction('rw', db.sessions, async () => {
        const latestSession = await db.sessions.get(activeSession.id as number);
        if (!latestSession?.id || latestSession.state !== 'active') return;

        const nextSetIndex = exerciseId
          ? countLoggedSetsForExercise(latestSession, exerciseId)
          : 0;

        await db.sessions.update(latestSession.id, {
          currentExerciseIndex: nextIndex,
          currentSetIndex: nextSetIndex,
          lastModifiedTs: Date.now(),
        });
      });
  }, [activeSession, countLoggedSetsForExercise]);

  const previousExercise = useCallback(async (exerciseId: string) => {
    if (!activeSession?.id) return;

    const previousIndex = Math.max(0, activeSession.currentExerciseIndex - 1);
    await jumpToExercise(previousIndex, exerciseId);
  }, [activeSession, jumpToExercise]);

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
    skipSet,
    jumpToExercise,
    nextExercise,
    previousExercise,
    finishSession,
    discardSession,
  };
}
