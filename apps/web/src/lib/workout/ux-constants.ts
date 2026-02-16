export const TIMER_INCREMENT_MS = 15000; // 15 seconds

export const NAVIGATION_MODE = 'hybrid'; // Swipe for sequential, Dropdown for random access

export interface CompletionStats {
  totalExercises: number;
  completedExercises: number;
  totalSets: number;
  completedSets: number;
  skippedExercises: string[]; // Names of completely skipped exercises
  partialExercises: { name: string; setsDone: number; setsTotal: number }[];
}

export type WarningSeverity = 'none' | 'info' | 'warning';

export interface WorkoutWarning {
  title: string;
  message: string;
  severity: WarningSeverity;
  confirmLabel: string;
  cancelLabel: string;
}

/**
 * Generates specific, non-punitive warning messages for incomplete workouts.
 * Focuses on what's left, not what was "failed".
 */
export function getIncompleteWorkoutMessage(stats: CompletionStats): WorkoutWarning {
  const { totalExercises, completedExercises, totalSets, completedSets, skippedExercises, partialExercises } = stats;

  // Case 0: Empty session (0% done)
  if (completedSets === 0) {
    return {
      title: "End Session?",
      message: "You haven't logged any sets yet. This session will be discarded.",
      severity: 'info',
      confirmLabel: "Discard Session",
      cancelLabel: "Resume Workout"
    };
  }

  // Case 1: All Exercises & Sets Complete (100% done)
  if (completedExercises === totalExercises && completedSets === totalSets) {
    return {
      title: "Workout Complete!",
      message: "Great job! You've finished everything on the plan.",
      severity: 'none',
      confirmLabel: "Finish & Log",
      cancelLabel: "Keep Training"
    };
  }

  // Case 2: Incomplete - Detail what's missing
  const missingItems = [];
  
  if (skippedExercises.length > 0) {
    const names = skippedExercises.slice(0, 2).join(", ");
    const remaining = skippedExercises.length > 2 ? ` +${skippedExercises.length - 2} more` : "";
    missingItems.push(`Skipped: ${names}${remaining}`);
  }

  if (partialExercises.length > 0) {
    const details = partialExercises.slice(0, 2).map(e => `${e.name} (${e.setsDone}/${e.setsTotal})`).join(", ");
    const remaining = partialExercises.length > 2 ? ` +${partialExercises.length - 2} more` : "";
    missingItems.push(`Incomplete: ${details}${remaining}`);
  }

  const mainMessage = missingItems.length > 0 
    ? `You still have:\n• ${missingItems.join("\n• ")}`
    : `You've completed ${Math.floor((completedSets / totalSets) * 100)}% of the total volume.`;

  return {
    title: "Finish Early?",
    message: `${mainMessage}\n\nIt's okay to stop here if you need to. Every set counts.`,
    severity: 'warning',
    confirmLabel: "Yes, Finish Now",
    cancelLabel: "Resume"
  };
}
