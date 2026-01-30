import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { memo } from 'react';

interface ExerciseCardProps {
  /** Convex exercise ID */
  exerciseId: Id<'exercises'>;
  /** Number of sets for this exercise */
  sets: number;
  /** Rep range (e.g., "8-12", "10") */
  reps: string;
  /** Rest seconds between sets */
  restSeconds: number;
  /** Current set index (0-based) */
  currentSetIndex: number;
  /** Total exercises in workout */
  exerciseNumber: number;
  totalExercises: number;
  /** Callback when a set is completed */
  onSetComplete: (weight: number, reps: number) => void;
}

/**
 * ExerciseCard
 * 
 * Displays exercise information with:
 * - Exercise name and muscle group
 * - Contextual quote injection
 * - Set tracking inputs
 * - Visual placeholder for exercise GIF (future enhancement)
 */
function ExerciseCardComponent({
  exerciseId,
  sets,
  reps,
  restSeconds,
  currentSetIndex,
  exerciseNumber,
  totalExercises,
  onSetComplete,
}: ExerciseCardProps) {
  // Fetch exercise details
  const exercise = useQuery(api.exercises.getExercise, { id: exerciseId });
  
  // Fetch contextual quote based on exercise name
  const quote = useQuery(
    api.quotes.getContextualQuote,
    exercise ? { context: exercise.name } : 'skip'
  );

  if (!exercise) {
    return (
      <div className="bg-hayl-surface rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-hayl-border rounded w-1/2 mb-4" />
        <div className="aspect-video bg-hayl-border rounded mb-4" />
        <div className="h-4 bg-hayl-border rounded w-3/4" />
      </div>
    );
  }

  return (
    <article className="bg-hayl-surface rounded-xl border border-hayl-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-hayl-border">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold font-heading text-hayl-accent uppercase tracking-widest">
            Exercise {exerciseNumber}/{totalExercises}
          </span>
          <span className="text-[10px] font-bold text-hayl-muted uppercase">
            {exercise.muscleGroup}
          </span>
        </div>
        <h2 className="text-2xl font-heading font-bold uppercase tracking-tight">
          {exercise.name}
        </h2>
      </div>

      {/* Visual Placeholder (Future: Lazy-loaded GIF) */}
      <div className="aspect-video bg-gradient-to-br from-hayl-bg to-hayl-surface flex items-center justify-center relative">
        <div className="text-center">
          <p className="font-heading font-bold text-hayl-muted uppercase tracking-widest text-sm">
            Demo Coming Soon
          </p>
        </div>
        {/* Badge */}
        <div className="absolute top-3 right-3 bg-hayl-bg/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase">
          {sets} × {reps}
        </div>
      </div>

      {/* Quote Injection */}
      {quote && (
        <div className="px-4 py-3 bg-hayl-accent/5 border-t border-hayl-border">
          <blockquote className="text-sm italic text-hayl-muted">
            "{quote.text}"
            <footer className="text-[10px] font-bold mt-1 text-hayl-accent uppercase">
              — {quote.author}
            </footer>
          </blockquote>
        </div>
      )}

      {/* Pro Tips (Collapsible) */}
      <details className="group border-t border-hayl-border">
        <summary className="px-4 py-3 cursor-pointer font-heading font-bold text-sm uppercase tracking-widest text-hayl-muted hover:text-hayl-text transition-colors list-none flex justify-between items-center">
          Pro Tips
          <span className="group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="px-4 pb-4">
          <p className="text-sm text-hayl-muted leading-relaxed">
            {exercise.instructions}
          </p>
        </div>
      </details>

      {/* Set Info Footer */}
      <div className="px-4 py-3 bg-hayl-bg border-t border-hayl-border flex justify-between items-center text-xs font-bold uppercase">
        <span>
          Set {currentSetIndex + 1} of {sets}
        </span>
        <span className="text-hayl-muted">
          Rest: {restSeconds}s
        </span>
      </div>
    </article>
  );
}

/**
 * Memoized ExerciseCard to prevent unnecessary re-renders.
 */
export const ExerciseCard = memo(ExerciseCardComponent);
