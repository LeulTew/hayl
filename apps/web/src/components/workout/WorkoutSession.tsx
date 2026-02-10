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
  
  // Input refs for weight/reps

  const weightInputRef = useRef<HTMLInputElement>(null);
  const repsInputRef = useRef<HTMLInputElement>(null);

  // Acquire Wake Lock when session starts
  // Acquire Wake Lock when session starts
  useEffect(() => {
    if (activeSession) {
      requestLock();
    }
    
    return () => {
      releaseLock();
    };
  }, [activeSession, requestLock, releaseLock]);


  // Loading state
  if (!plan || !activeSession) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="w-16 h-16 neo-border-thick border-dashed animate-spin" />
        <p className="font-heading font-bold text-hayl-text uppercase tracking-[0.2em] animate-pulse italic">
          Powering Up Performance Engine...
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
      <div className="bg-hayl-surface p-16 rounded-[3rem] border border-hayl-border text-center space-y-12 animate-in slide-in-from-bottom-12 duration-1000">
        <div className="w-28 h-28 bg-hayl-text text-hayl-bg rounded-full flex items-center justify-center mx-auto mb-4 shadow-premium">
          <span className="text-5xl font-heading font-black italic">H</span>
        </div>
        <div>
          <h2 className="text-6xl font-heading font-black uppercase italic tracking-tighter leading-none mb-4 lowercase">
            Performance Core Logged.
          </h2>
          <p className="text-hayl-muted font-heading font-bold uppercase tracking-[0.3em] text-xs">
            Addis Ababa / session finalization
          </p>
        </div>
        {activeSession.startTime && (
          <div className="py-10 bg-hayl-bg rounded-[2rem] border border-hayl-border border-dashed">
            <p className="text-[10px] font-heading font-bold text-hayl-muted uppercase tracking-[0.3em] mb-4">Total Session Duration</p>
            <GlobalTimer startTime={activeSession.startTime} isActive={false} />
          </div>
        )}
        <button
          onClick={finishSession}
          className="w-full bg-hayl-text text-hayl-bg py-6 rounded-full font-heading font-bold uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all text-2xl italic"
        >
          Close Session →
        </button>
      </div>
    );
  }

  const handleLogSet = () => {
    const weightRaw = weightInputRef.current?.value;
    const repsRaw = repsInputRef.current?.value;

    // Guard against empty input to prevent storing 0s or NaNs
    if (!weightRaw || !repsRaw) return;

    const weight = parseFloat(weightRaw);
    const reps = parseInt(repsRaw, 10);

    if (isNaN(weight) || isNaN(reps)) return;

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
    <div className="flex flex-col min-h-[85vh] pb-32 max-w-2xl mx-auto">
      {/* Header with Global Timer */}
      <header className="mb-8 flex justify-between items-end px-2 pt-6">
        <div>
          <p className="text-[10px] font-bold font-heading text-hayl-text uppercase tracking-[0.3em] mb-2 opacity-50">
            {currentDay.title}
          </p>
          <h1 className="text-4xl font-heading font-bold uppercase italic tracking-tighter leading-none lowercase">
            Active session
          </h1>
        </div>
        <div className="flex flex-col items-end gap-3 pb-1">
          <GlobalTimer startTime={activeSession.startTime} isActive={true} />
          <button
            onClick={discardSession}
            className="text-[9px] font-bold font-heading text-red-500/50 uppercase tracking-widest hover:text-red-500 transition-colors"
          >
            Abort Engine
          </button>
        </div>
      </header>

      {/* Phase Tabs */}
      <div className="mb-8 pl-1">
        <PhaseTabs
          phases={phasesInfo}
          activeIndex={currentPhaseIndex}
          onTabClick={() => {}}
          // Intentionally read-only until we implement session jumping
        />
      </div>

      {/* Exercise Card */}
      <div className="mb-10">
        <ExerciseCard
          exerciseId={currentExercise.exerciseId}
          sets={currentExercise.sets}
          reps={currentExercise.reps}
          restSeconds={currentExercise.restSeconds}
          currentSetIndex={activeSession.currentSetIndex}
          exerciseNumber={activeSession.currentExerciseIndex + 1}

          totalExercises={allExercises.length}
        />

      </div>

      {/* Set Tracking */}
      <div className="space-y-6 mb-12">
        {Array.from({ length: currentExercise.sets }).map((_, i) => {
          const isCompleted = i < activeSession.currentSetIndex;
          const isCurrent = i === activeSession.currentSetIndex;

          return (
            <div
              key={i}
              className={`
                flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-300
                ${isCurrent 
                  ? 'bg-hayl-surface border-hayl-text shadow-premium scale-[1.02] z-10' 
                  : 'bg-hayl-bg/40 border-hayl-border opacity-40'
                }
              `}
            >
              <span className={`w-10 font-heading font-black text-4xl tabular-nums italic ${isCurrent ? 'text-hayl-text' : 'text-hayl-muted'}`}>
                {i + 1}
              </span>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    ref={isCurrent ? weightInputRef : undefined}
                    type="number"
                    inputMode="decimal"
                    placeholder="KG"
                    disabled={!isCurrent}
                    className="w-full bg-hayl-bg rounded-2xl border border-hayl-border p-4 text-xl font-heading font-bold focus:border-hayl-text outline-none transition-all placeholder:text-hayl-muted/30"
                  />
                </div>
                <div className="relative">
                  <input
                    ref={isCurrent ? repsInputRef : undefined}
                    type="number"
                    inputMode="numeric"
                    placeholder={currentExercise.reps}
                    disabled={!isCurrent}
                    className="w-full bg-hayl-bg rounded-2xl border border-hayl-border p-4 text-xl font-heading font-bold focus:border-hayl-text outline-none transition-all placeholder:text-hayl-muted/30"
                  />
                </div>
              </div>
              <button
                disabled={!isCurrent}
                onClick={handleLogSet}
                className={`
                  w-16 h-16 rounded-full border-2 font-heading font-bold text-2xl flex items-center justify-center transition-all
                  ${isCompleted 
                    ? 'bg-green-500 text-hayl-bg border-green-500' 
                    : isCurrent 
                      ? 'bg-hayl-text text-hayl-bg border-hayl-text hover:scale-105 active:scale-95 italic' 
                      : 'bg-hayl-muted/5 text-hayl-muted border-transparent'
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
          className="w-full bg-hayl-text text-hayl-bg py-6 rounded-full font-heading font-black uppercase tracking-[0.2em] italic hover:scale-[1.02] active:scale-[0.98] transition-all text-2xl"
        >
          Next Exercise →
        </button>
      )}

      {/* Wake Lock Indicator */}
      {!isLocked && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-yellow-500 text-hayl-bg px-6 py-2 rounded-full font-heading font-bold uppercase italic text-[9px] tracking-[0.2em] shadow-lg z-40 whitespace-nowrap">
          ⚠️ Screen Defense Restricted
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
