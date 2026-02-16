import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { useActiveSession } from "../../hooks/useActiveSession";
import { useWakeLock } from "../../hooks/useWakeLock";
import { useWorkoutUX } from "../../hooks/useWorkoutUX";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

import { Page } from "../ui/Page";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";

import { SessionHeader } from "./session/SessionHeader";
import { ExerciseView } from "./session/ExerciseView";
import { SetLogger } from "./session/SetLogger";
import { RestTimer } from "./RestTimer";
import { PhaseTabs } from "./PhaseTabs";

// ... [Interfaces kept same] ...
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

export function WorkoutSession({ planId }: { planId: string }) {
  const { activeSession, logSet, nextExercise, finishSession, discardSession } = useActiveSession();
  const { requestLock, releaseLock } = useWakeLock();
  
  // UX Hooks
  const { addTime, getCompletionWarning } = useWorkoutUX();
  
  const plan = useQuery(api.programs.getPlan, { planId: planId as Id<'derivedPlans'> }) as WorkoutPlan | undefined;
  
  const [restTimer, setRestTimer] = useState<{ active: boolean; seconds: number }>({ active: false, seconds: 0 });
  const [showWarningModal, setShowWarningModal] = useState<{ show: boolean, data: import("../../lib/workout/ux-constants").WorkoutWarning | null }>({ show: false, data: null });

  // Wake Lock
  useEffect(() => {
    if (activeSession?.id && activeSession.state === 'active') {
      void requestLock();
    }
    return () => {
      void releaseLock();
    };
   }, [activeSession?.id, activeSession?.state, requestLock, releaseLock]);


  const currentDay = plan?.days[activeSession?.currentDayIndex ?? 0];
  
  // Data flattening & Current State
  const { allExercises, currentExercise, phasesInfo, currentPhaseIndex } = useMemo(() => {
     if (!currentDay || !activeSession) return { allExercises: [] as (WorkoutItem & { phaseName: string })[], currentExercise: null, phasesInfo: [], currentPhaseIndex: 0 };

     const all = currentDay.phases.flatMap(phase => phase.items.map(item => ({ ...item, phaseName: phase.name })));
     
     const currentEx = all[activeSession.currentExerciseIndex];

     const phases = currentDay.phases.map((phase, idx) => {
        const start = currentDay.phases.slice(0, idx).reduce((acc, p) => acc + p.items.length, 0);
        const end = start + phase.items.length;
        const completed = Math.min(Math.max(0, activeSession.currentExerciseIndex - start), phase.items.length);
        
        return {
            name: phase.name,
            itemCount: phase.items.length,
            completedCount: activeSession.currentExerciseIndex >= end ? phase.items.length : completed
        };
     });

     let phaseIdx = 0;
     let count = 0;
     for (let i = 0; i < currentDay.phases.length; i++) {
        count += currentDay.phases[i].items.length;
        if (activeSession.currentExerciseIndex < count) {
            phaseIdx = i;
            break;
        }
     }

     return { allExercises: all, currentExercise: currentEx, phasesInfo: phases, currentPhaseIndex: phaseIdx };
  }, [currentDay, activeSession]);

   // Loading State
   if (plan === null) {
     return (
        <Page className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
           <p className="font-heading text-3xl font-bold uppercase text-hayl-text">Plan Not Found</p>
           <p className="font-body text-sm text-hayl-muted">The workout plan for this session is no longer available.</p>
           <Button variant="outline" onClick={discardSession}>Discard Session</Button>
        </Page>
     );
   }

   if (plan === undefined || !activeSession) {
    return (
      <Page className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
         <Skeleton className="w-16 h-16 rounded-full animate-pulse" />
         <div className="text-center space-y-4">
            <p className="font-heading font-bold text-hayl-text uppercase tracking-widest animate-pulse">Initializing Session...</p>
            <Button variant="ghost" size="sm" onClick={discardSession} className="text-xs text-hayl-muted hover:text-hayl-error">
                CANCEL & DISCARD
            </Button>
         </div>
      </Page>
    );
  }

   if (!currentDay) {
      return (
         <Page className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
            <p className="font-heading text-3xl font-bold uppercase text-hayl-text">Invalid Session Data</p>
            <p className="font-body text-sm text-hayl-muted">The selected training day could not be loaded.</p>
            <Button variant="outline" onClick={discardSession}>Discard Session</Button>
         </Page>
      );
   }

  // Session Completion View
  if (!currentExercise) {
     const handleFinishClick = () => {
        // Calculate completion stats for warning
        // This is a simplified calculation for now, assuming if we are at this screen we are done.
        // In reality we should check all logs against plan.
        
        // Use a dummy stats object for now since we are at the success screen
        // Phase 1B will pass real stats here
        const stats = {
            totalExercises: allExercises.length,
            completedExercisesCount: allExercises.length, // Optimistic
            totalSets: allExercises.reduce((acc, ex) => acc + ex.sets, 0),
            completedSetsCount: activeSession.logs.length,
            skippedExercisesNames: [],
            partialExerciseDetails: []
        };

        const warning = getCompletionWarning(stats);
        
        if (warning.severity !== 'none') {
            setShowWarningModal({ show: true, data: warning });
        } else {
            void finishSession();
        }
     };

     return (
        <Page className="flex flex-col items-center justify-center min-h-screen text-center space-y-8">
           <div className="w-24 h-24 bg-hayl-text text-hayl-bg rounded-full flex items-center justify-center text-5xl font-heading font-black italic shadow-lg animate-bounce">✓</div>
           <div>
              <h1 className="font-heading text-6xl font-black uppercase italic tracking-tighter leading-none mb-4 lowercase">Session Complete.</h1>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.3em] text-hayl-muted">Data synced to local core</p>
           </div>
           
           <Button size="lg" onClick={handleFinishClick} className="w-full max-w-xs animate-in fade-in slide-in-from-bottom-8 duration-700">
              FINALIZE LOG
           </Button>

            {/* Simple Warning Modal fallback if needed */}
            {showWarningModal.show && showWarningModal.data && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-hayl-bg border border-hayl-border p-6 rounded-2xl max-w-sm w-full space-y-4">
                        <h3 className="font-heading text-xl uppercase">{showWarningModal.data.title}</h3>
                        <p className="whitespace-pre-wrap text-sm text-hayl-text/80">{showWarningModal.data.message}</p>
                        <div className="flex gap-2 pt-2">
                             <Button variant="outline" fullWidth onClick={() => setShowWarningModal({ show: false, data: null })}>
                                {showWarningModal.data.cancelLabel}
                             </Button>
                             <Button fullWidth onClick={() => { setShowWarningModal({ show: false, data: null }); void finishSession(); }}>
                                {showWarningModal.data.confirmLabel}
                             </Button>
                        </div>
                    </div>
                </div>
            )}
        </Page>
     );
  }

  // Current Exercise Logs
  const currentLogs = activeSession.logs
    .filter(l => l.exerciseId === currentExercise.exerciseId)
    .sort((a, b) => (a.setIndex ?? 0) - (b.setIndex ?? 0));

  const handleLog = (reps: number, weight?: number, rpe?: number) => {
     logSet(currentExercise.exerciseId, reps, weight, rpe);
     if (currentExercise.restSeconds > 0) {
        setRestTimer({ active: true, seconds: currentExercise.restSeconds });
     }
  };

  return (
    <Page fullWidth className="max-w-xl mx-auto pb-32 pt-4">
      <SessionHeader 
        dayTitle={currentDay.title} 
        startTime={activeSession.startTime} 
        onAbort={discardSession} 
      />

      <div className="mb-6">
         <PhaseTabs 
            phases={phasesInfo} 
            activeIndex={currentPhaseIndex} 
            onTabClick={() => {}} 
         />
      </div>

      <ExerciseView 
         exerciseId={currentExercise.exerciseId}
         totalSets={currentExercise.sets}
         repsTarget={currentExercise.reps}
         restSeconds={currentExercise.restSeconds}
         exerciseIndex={activeSession.currentExerciseIndex}
         totalExercises={allExercises.length}
      />

      <SetLogger 
         currentSetIndex={activeSession.currentSetIndex}
         totalSets={currentExercise.sets}
         repsTarget={currentExercise.reps}
         previousWeight={currentLogs[currentLogs.length - 1]?.weight} // heuristic: use last set weight
         logs={currentLogs}
         onLog={handleLog}
      />

      {/* Next Exercise Action */}
      {activeSession.currentSetIndex >= currentExercise.sets && (
         <div className="fixed bottom-0 left-0 right-0 p-4 bg-hayl-bg border-t border-hayl-border z-40 md:static md:bg-transparent md:border-0 md:mt-8">
            <Button 
                size="lg" 
                fullWidth 
                onClick={nextExercise}
                className="shadow-xl"
            >
                NEXT EXERCISE →
            </Button>
         </div>
      )}

      {/* Rest Timer Overlay */}
      {restTimer.active && (
         <RestTimer 
            seconds={restTimer.seconds} 
            onComplete={() => setRestTimer({ active: false, seconds: 0 })}
            onSkip={() => setRestTimer({ active: false, seconds: 0 })}
            onAdd15={() => setRestTimer(prev => ({ ...prev, seconds: addTime(prev.seconds) }))}
         />
      )}
    </Page>
  );
}
