import { useCallback } from 'react';
import { TIMER_INCREMENT_MS, NAVIGATION_MODE, getIncompleteWorkoutMessage } from '../lib/workout/ux-constants';

interface UseWorkoutUXProps {
  totalExercises: number;
  completedExercisesCount: number;
  totalSets: number;
  completedSetsCount: number;
  skippedExercisesNames: string[];
  partialExerciseDetails: { name: string; setsDone: number; setsTotal: number }[];
}

export function useWorkoutUX() {
  
  // Timer Logic
  const addTime = useCallback((currentSeconds: number) => {
    return currentSeconds + (TIMER_INCREMENT_MS / 1000);
  }, []);

  // Warning Logic
  const getCompletionWarning = useCallback((stats: UseWorkoutUXProps) => {
    return getIncompleteWorkoutMessage({
        totalExercises: stats.totalExercises,
        completedExercises: stats.completedExercisesCount,
        totalSets: stats.totalSets,
        completedSets: stats.completedSetsCount,
        skippedExercises: stats.skippedExercisesNames,
        partialExercises: stats.partialExerciseDetails
    });
  }, []);

  return {
    timerIncrementSeconds: TIMER_INCREMENT_MS / 1000,
    navigationMode: NAVIGATION_MODE,
    addTime,
    getCompletionWarning
  };
}
