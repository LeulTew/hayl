import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
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
  /** Total exercises in workout */
  exerciseNumber: number;
  totalExercises: number;
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
      <div className="bg-hayl-surface neo-border p-6 animate-pulse">
        <div className="h-6 bg-hayl-muted/20 neo-border w-1/2 mb-4" />
        <div className="aspect-video bg-hayl-muted/10 neo-border mb-4" />
        <div className="h-4 bg-hayl-muted/20 neo-border w-3/4" />
      </div>
    );
  }

  return (
    <article className="bg-hayl-surface rounded-[2.5rem] border border-hayl-border overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Section */}
      <div className="p-8 pb-4">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-2">
            <span className="text-[10px] font-bold font-heading text-hayl-bg bg-hayl-text uppercase tracking-widest px-3 py-1 rounded-full">
              Card {exerciseNumber}/{totalExercises}
            </span>
            <span className="text-[10px] font-bold font-heading text-hayl-muted uppercase tracking-widest bg-hayl-muted/10 px-3 py-1 rounded-full italic">
              {exercise.muscleGroup}
            </span>
          </div>
        </div>
        <h2 className="text-6xl font-heading font-black italic tracking-tighter leading-[0.85] text-hayl-text lowercase">
          {exercise.name}
        </h2>
      </div>

      {/* Visual Hub */}
      <div className="px-8 pb-8">
        <div className="aspect-video bg-hayl-bg rounded-[2rem] border border-hayl-border flex items-center justify-center relative overflow-hidden group">
          <div className="text-center opacity-30 group-hover:opacity-100 transition-opacity">
            <p className="font-heading font-bold text-hayl-muted uppercase tracking-[0.4em] text-[10px]">
              Visual Stream Pending
            </p>
          </div>
          {/* Workload Badge */}
          <div className="absolute top-6 right-6 bg-hayl-text text-hayl-bg px-5 py-2 rounded-full font-heading font-bold uppercase italic text-sm tracking-widest shadow-premium">
            {sets} × {reps}
          </div>
        </div>
      </div>

      {/* Quote Focus */}
      {quote && (
        <div className="px-8 py-6 bg-hayl-bg border-y border-hayl-border">
          <blockquote className="text-base font-heading font-bold uppercase italic tracking-tight leading-snug">
            "{quote.text}"
            <footer className="text-[9px] opacity-40 mt-3 flex items-center gap-3 tracking-widest">
              <span className="w-6 h-[1px] bg-hayl-text/20" /> {quote.author}
            </footer>
          </blockquote>
        </div>
      )}

      {/* Insights (Collapsible) */}
      <details className="group border-b border-hayl-border last:border-b-0">
        <summary className="px-8 py-5 cursor-pointer font-heading font-bold text-xs uppercase tracking-[0.2em] text-hayl-text hover:bg-hayl-bg transition-colors list-none flex justify-between items-center">
          Performance Notes
          <svg className="w-4 h-4 group-open:rotate-180 transition-transform opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="px-8 pb-8 pt-2">
          <p className="font-sans text-xs font-bold uppercase tracking-wide text-hayl-muted leading-relaxed">
            {exercise.instructions}
          </p>
        </div>
      </details>

      {/* Control Footer */}
      <div className="px-8 py-5 bg-hayl-surface border-t border-hayl-border flex justify-between items-center font-heading font-bold uppercase tracking-[0.15em]">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-hayl-text" />
          <span className="text-xs">Set <span className="text-hayl-text">{currentSetIndex + 1}</span> <span className="text-hayl-muted/40">/ {sets}</span></span>
        </div>
        <div className="flex items-center gap-2 text-hayl-muted text-[10px] tracking-[0.2em]">
          <span>REST {restSeconds}S</span>
        </div>
      </div>
    </article>
  );
}

/**
 * Memoized ExerciseCard to prevent unnecessary re-renders.
 */
export const ExerciseCard = memo(ExerciseCardComponent);
