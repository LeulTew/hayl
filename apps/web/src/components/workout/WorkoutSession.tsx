import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { useActiveSession } from "../../hooks/useActiveSession";
import { useWakeLock } from "../../hooks/useWakeLock";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { RestTimer } from "./RestTimer";
import { GlobalTimer } from "./GlobalTimer";
import { ExerciseCard } from "./ExerciseCard";
import { PhaseTabs } from "./PhaseTabs";

// Type definitions for plan structure
interface WorkoutItem {
  exerciseId: Id<'exercises'>;
  sets: number;
  reps: string;
  restSeconds: number;
  rpe?: number;
  note?: string;
}

interface WorkoutPhase {
  name: 'warmup' | 'main' | 'accessory' | 'stretch';
  items: WorkoutItem[];
}

interface WorkoutDay {
  title: string;
  dayIndex: number;
  phases: WorkoutPhase[];
}

interface WorkoutPlan {
  _id: Id<'derivedPlans'>;
  days: WorkoutDay[];
}

interface WorkoutSessionProps {
  planId: string;
}

/**
 * WorkoutSession
 * 
 * The main active workout view. Displays:
 * - Global session timer
 * - Phase tab navigation
 * - Current exercise card with name and quote
 * - Set tracking with weight/rep inputs
 * - Rest timer overlay
 * 
 * Integrates Wake Lock to keep screen active during gym floor use.
 */
export function WorkoutSession({ planId }: WorkoutSessionProps) {
  const { activeSession, logSet, nextExercise, finishSession, discardSession } = useActiveSession();
  const { requestLock, releaseLock, isLocked } = useWakeLock();
  const plan = useQuery(api.programs.getPlan, { planId: planId as Id<'derivedPlans'> }) as WorkoutPlan | undefined;
  
  // Local state
  const [restTimer, setRestTimer] = useState<{ active: boolean; seconds: number }>({ active: false, seconds: 0 });
  const [, setActivePhaseIndex] = useState(0);
  
  // Input refs for weight/reps
  const weightInputRef = useRef<HTMLInputElement>(null);
  const repsInputRef = useRef<HTMLInputElement>(null);

  // Acquire Wake Lock when session starts
  useEffect(() => {
    if (activeSession && !isLocked) {
      requestLock();
    }
    
    return () => {
      releaseLock();
    };
  }, [activeSession, isLocked, requestLock, releaseLock]);

  // Loading state
  if (!plan || !activeSession) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hayl-accent" />
        <p className="font-heading font-bold text-hayl-muted uppercase tracking-widest animate-pulse">
          Initializing Session...
        </p>
      </div>
    );
  }

  const currentDay = plan.days[activeSession.currentDayIndex];
  if (!currentDay) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 font-bold">Invalid Day Index</p>
      </div>
    );
  }

  // Flatten all exercises across phases for linear navigation
  const allExercises = currentDay.phases.flatMap((phase) =>
    phase.items.map((item) => ({
      ...item,
      phaseName: phase.name,
    }))
  );

  const currentExercise = allExercises[activeSession.currentExerciseIndex];

  // Build phase info for tabs
  const phasesInfo = currentDay.phases.map((phase, phaseIndex) => {
    // Calculate how many exercises in this phase are completed
    const phaseStartIndex = currentDay.phases
      .slice(0, phaseIndex)
      .reduce((acc, p) => acc + p.items.length, 0);
    const phaseEndIndex = phaseStartIndex + phase.items.length;
    
    const completedCount = Math.min(
      Math.max(0, activeSession.currentExerciseIndex - phaseStartIndex),
      phase.items.length
    );

    return {
      name: phase.name,
      itemCount: phase.items.length,
      completedCount: 
        activeSession.currentExerciseIndex >= phaseEndIndex 
          ? phase.items.length 
          : completedCount,
    };
  });

  // Determine which phase the current exercise belongs to
  const currentPhaseIndex = (() => {
    let exerciseCount = 0;
    for (let i = 0; i < currentDay.phases.length; i++) {
      exerciseCount += currentDay.phases[i].items.length;
      if (activeSession.currentExerciseIndex < exerciseCount) {
        return i;
      }
    }
    return currentDay.phases.length - 1;
  })();

  // Workout Complete State
  if (!currentExercise) {
    return (
      <div className="bg-hayl-surface p-8 rounded-2xl text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl font-bold">✓</span>
        </div>
        <h2 className="text-3xl font-heading font-bold uppercase italic">
          Workout Complete!
        </h2>
        <p className="text-hayl-muted font-sans max-w-xs mx-auto">
          Great work. Your logs are saved locally and will sync when online.
        </p>
        {activeSession.startTime && (
          <div className="py-4">
            <p className="text-xs text-hayl-muted uppercase mb-1">Total Duration</p>
            <GlobalTimer startTime={activeSession.startTime} isActive={false} />
          </div>
        )}
        <button
          onClick={finishSession}
          className="w-full bg-hayl-text text-hayl-bg py-4 rounded-xl font-heading font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Finish Session
        </button>
      </div>
    );
  }

  const handleLogSet = () => {
    const weight = parseFloat(weightInputRef.current?.value || '0');
    const reps = parseInt(repsInputRef.current?.value || '0', 10);
    
    logSet(currentExercise.exerciseId, weight, reps);

    // Clear inputs for next set
    if (weightInputRef.current) weightInputRef.current.value = '';
    if (repsInputRef.current) repsInputRef.current.value = '';

    // Trigger Rest Timer if configured
    if (currentExercise.restSeconds > 0) {
      setRestTimer({ active: true, seconds: currentExercise.restSeconds });
    }
  };

  return (
    <div className="flex flex-col min-h-[80vh] pb-24">
      {/* Header with Global Timer */}
      <header className="mb-6 flex justify-between items-start">
        <div>
          <p className="text-xs font-bold font-heading text-hayl-accent uppercase tracking-widest mb-1">
            {currentDay.title}
          </p>
          <h1 className="text-2xl font-heading font-bold uppercase italic tracking-tighter leading-none">
            Active Session
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <GlobalTimer startTime={activeSession.startTime} isActive={true} />
          <button
            onClick={discardSession}
            className="text-[10px] font-bold font-heading text-red-500/70 uppercase tracking-tighter hover:text-red-500 transition-colors"
          >
            Discard
          </button>
        </div>
      </header>

      {/* Phase Tabs */}
      <div className="mb-6">
        <PhaseTabs
          phases={phasesInfo}
          activeIndex={currentPhaseIndex}
          onTabClick={setActivePhaseIndex}
        />
      </div>

      {/* Exercise Card */}
      <div className="mb-6">
        <ExerciseCard
          exerciseId={currentExercise.exerciseId}
          sets={currentExercise.sets}
          reps={currentExercise.reps}
          restSeconds={currentExercise.restSeconds}
          currentSetIndex={activeSession.currentSetIndex}
          exerciseNumber={activeSession.currentExerciseIndex + 1}
          totalExercises={allExercises.length}
          onSetComplete={handleLogSet}
        />
      </div>

      {/* Set Tracking */}
      <div className="space-y-3 mb-6">
        {Array.from({ length: currentExercise.sets }).map((_, i) => {
          const isCompleted = i < activeSession.currentSetIndex;
          const isCurrent = i === activeSession.currentSetIndex;

          return (
            <div
              key={i}
              className={`
                flex items-center gap-3 p-3 rounded-xl border transition-all duration-300
                ${isCurrent 
                  ? 'bg-hayl-surface border-hayl-accent shadow-glow' 
                  : 'bg-transparent border-hayl-border opacity-50'
                }
              `}
            >
              <span className="w-8 font-heading font-bold text-lg tabular-nums">
                {i + 1}
              </span>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  ref={isCurrent ? weightInputRef : undefined}
                  type="number"
                  inputMode="decimal"
                  placeholder="kg"
                  disabled={!isCurrent}
                  className="w-full bg-hayl-bg border border-hayl-border rounded-lg p-2 text-sm font-bold focus:border-hayl-accent focus:outline-none transition-colors"
                />
                <input
                  ref={isCurrent ? repsInputRef : undefined}
                  type="number"
                  inputMode="numeric"
                  placeholder={currentExercise.reps}
                  disabled={!isCurrent}
                  className="w-full bg-hayl-bg border border-hayl-border rounded-lg p-2 text-sm font-bold focus:border-hayl-accent focus:outline-none transition-colors"
                />
              </div>
              <button
                disabled={!isCurrent}
                onClick={handleLogSet}
                className={`
                  w-12 h-12 rounded-full font-bold flex items-center justify-center transition-all
                  ${isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                      ? 'bg-hayl-accent text-hayl-bg hover:opacity-90 active:scale-95' 
                      : 'bg-hayl-muted/20 text-hayl-muted'
                  }
                `}
                aria-label={isCompleted ? 'Set completed' : isCurrent ? 'Log set' : 'Future set'}
              >
                {isCompleted ? '✓' : 'GO'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Next Exercise Button */}
      {activeSession.currentSetIndex >= currentExercise.sets && (
        <button
          onClick={nextExercise}
          className="w-full bg-hayl-accent text-hayl-bg py-4 rounded-xl font-heading font-bold uppercase tracking-widest shadow-glow animate-pulse"
        >
          Next Exercise →
        </button>
      )}

      {/* Wake Lock Indicator */}
      {!isLocked && (
        <div className="fixed bottom-4 left-4 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase">
          ⚠️ Screen may dim
        </div>
      )}

      {/* Rest Timer Overlay */}
      {restTimer.active && (
        <RestTimer
          seconds={restTimer.seconds}
          onComplete={() => setRestTimer({ active: false, seconds: 0 })}
          onSkip={() => setRestTimer({ active: false, seconds: 0 })}
        />
      )}
    </div>
  );
}
