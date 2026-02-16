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
import { BottomSheet } from "../ui/BottomSheet";
import { ChevronDown, ChevronRight, Circle, CheckCircle2, ListFilter } from "lucide-react";

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
   const { activeSession, logSet, jumpToExercise, finishSession, discardSession } = useActiveSession();
  const { requestLock, releaseLock } = useWakeLock();
  
  // UX Hooks
  const { addTime, getCompletionWarning } = useWorkoutUX();
  
  const plan = useQuery(api.programs.getPlan, { planId: planId as Id<'derivedPlans'> }) as WorkoutPlan | undefined;
  
  const [restTimer, setRestTimer] = useState<{ active: boolean; seconds: number }>({ active: false, seconds: 0 });
   const [showWarningModal, setShowWarningModal] = useState<{
      show: boolean;
      data: import("../../lib/workout/ux-constants").WorkoutWarning | null;
      unfinished: { name: string; setsDone: number; setsTotal: number; setsLeft: number; ratio: number }[];
   }>({ show: false, data: null, unfinished: [] });
   const [isNavOpen, setIsNavOpen] = useState(false);
   
   // Swipe State
   const [touchStart, setTouchStart] = useState<number | null>(null);
   const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

     // Consolidate phases by name (Warmup, Main, Accessory, Stretch)
     const consolidatedPhasesMap = new Map<string, {
        name: string;
        itemCount: number;
        completedCount: number;
        startsAt: number[]; // Track starting indices in the flattened array
     }>();

     let runningCount = 0;
     currentDay.phases.forEach((phase) => {
        const existing = consolidatedPhasesMap.get(phase.name);
        // Completed items for THIS specific block
        const blockStart = runningCount;
        const blockEnd = runningCount + phase.items.length;


        if (existing) {
           existing.itemCount += phase.items.length;
           // Accumulate completed count correctly.
           // Since activeSession.currentExerciseIndex is global, we need to check how many items *within this specific block* (blockStart to blockEnd) are completed.
           // blockCompleted is calculated as: Math.min(Math.max(0, activeSession.currentExerciseIndex - blockStart), phase.items.length)
           // This logic is correct for a sequential progression through blocks.
           // However, if we have [Main, Accessory, Main], and we are in the second Main, the first Main is fully complete.
           // My previous logic `activeSession.currentExerciseIndex >= blockEnd` handles this correctly for sequential blocks.
           // Let's ensure `blockCompleted` logic is robust.
           
           const specificBlockCompleted = activeSession.currentExerciseIndex >= blockEnd 
               ? phase.items.length 
               : Math.max(0, Math.min(activeSession.currentExerciseIndex - blockStart, phase.items.length));

           existing.completedCount += specificBlockCompleted;
           existing.startsAt.push(blockStart);
        } else {
            const specificBlockCompleted = activeSession.currentExerciseIndex >= blockEnd 
               ? phase.items.length 
               : Math.max(0, Math.min(activeSession.currentExerciseIndex - blockStart, phase.items.length));

           consolidatedPhasesMap.set(phase.name, {
              name: phase.name,
              itemCount: phase.items.length,
              completedCount: specificBlockCompleted,
              startsAt: [blockStart]
           });
        }
        runningCount += phase.items.length;
     });


     // 2. Iterate Summaries (Groups) and count them per phase
     const phaseCounts = new Map<string, { total: number; completed: number }>();
     // Initialize all possible phases to 0
     ['warmup', 'main', 'accessory', 'stretch'].forEach(p => phaseCounts.set(p, { total: 0, completed: 0 }));

     // Helper: Check if an exercise group is complete
     // A group is complete if ALL its raw items are swallowed by `activeSession.currentExerciseIndex`.
     // But wait, `currentExerciseIndex` points to the *current* raw item.
     // So items < current are complete.
     
     let runIdx = 0;
     currentDay.phases.forEach(phase => {
        const pName = phase.name;
        // Verify we have a stats entry
        if (!phaseCounts.has(pName)) phaseCounts.set(pName, { total: 0, completed: 0 });
        const stats = phaseCounts.get(pName)!;

        // Group items in this *phase block* by exerciseId
        const groupsInBlock = new Map<string, { start: number; count: number }>();
        phase.items.forEach((item, itemIdx) => {
             const globalIdx = runIdx + itemIdx;
             if (!groupsInBlock.has(item.exerciseId)) {
                 groupsInBlock.set(item.exerciseId, { start: globalIdx, count: 0 });
             }
             groupsInBlock.get(item.exerciseId)!.count++;
        });

        // Now for each *group* in this block, check if it's completed
        groupsInBlock.forEach((groupInfo) => {
             stats.total += 1; // It's 1 exercise
             // Is it completed?
             // It is completed if the FIRST ITEM of the NEXT group is > current index?
             // Or simpler: If existing logs for this exercise >= total sets? 
             // We don't have logs here directly without circular dep.
             // We use `activeSession.currentExerciseIndex`.
             // If `currentExerciseIndex` is PAST the last item of this group.
             const groupEnd = groupInfo.start + groupInfo.count;
             if (activeSession.currentExerciseIndex >= groupEnd) {
                 stats.completed += 1;
             } else if (activeSession.currentExerciseIndex >= groupInfo.start) {
                 // We are IN this group. It is active, not completed.
             }
        });

        runIdx += phase.items.length;
     });

     const finalPhases = Array.from(phaseCounts.entries()).map(([name, stats]) => ({
        name: name as 'warmup' | 'main' | 'accessory' | 'stretch',
        itemCount: stats.total,
        completedCount: stats.completed
     })).filter(p => p.itemCount > 0); // Only show relevant phases
     
     const currentPhaseName = currentEx?.phaseName;
     const phaseIdx = finalPhases.findIndex(p => p.name === currentPhaseName);

     return { 
        allExercises: all, 
        currentExercise: currentEx, 
        phasesInfo: finalPhases, 
        currentPhaseIndex: phaseIdx !== -1 ? phaseIdx : 0
     };
  }, [currentDay, activeSession]);

   const exerciseIds = useMemo(() => {
      const seen = new Set<string>();
      return allExercises
         .map((exercise) => exercise.exerciseId)
         .filter((exerciseId) => {
            const value = exerciseId as string;
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
         });
   }, [allExercises]);

   const exerciseMap = useQuery(
      api.exercises.getExercisesByIds,
      exerciseIds.length > 0 ? { ids: exerciseIds } : "skip"
   );

   const completion = useMemo(() => {
      const sessionLogs = activeSession?.logs ?? [];
      
      // Group all items of the same exercise globally
      const groupsMap = new Map<string, {
         exerciseId: string;
         name: string;
         setsTotal: number;
         firstIndex: number;
      }>();

      allExercises.forEach((item, index) => {
         const existing = groupsMap.get(item.exerciseId);
         if (existing) {
            existing.setsTotal += item.sets;
         } else {
            const resolved = exerciseMap?.[item.exerciseId as string];
            groupsMap.set(item.exerciseId, {
               exerciseId: item.exerciseId,
               name: resolved?.name ?? `Exercise ${index + 1}`,
               setsTotal: item.sets,
               firstIndex: index
            });
         }
      });

      const summaries = Array.from(groupsMap.values()).map((group, index) => {
         const logsForExercise = sessionLogs.filter((log) => log.exerciseId === group.exerciseId);
         const doneSetIndexes = new Set(logsForExercise.map((log) => log.setIndex));
         const setsDone = Math.min(doneSetIndexes.size, group.setsTotal);
         const setsLeft = Math.max(0, group.setsTotal - setsDone);
         const ratio = group.setsTotal > 0 ? setsDone / group.setsTotal : 0;

         return {
            index: group.firstIndex,
            displayIndex: index,
            exerciseId: group.exerciseId,
            name: group.name,
            setsDone,
            setsTotal: group.setsTotal,
            setsLeft,
            ratio,
         };
      });

      const totalSets = summaries.reduce((acc, item) => acc + item.setsTotal, 0);
      const completedSetsCount = summaries.reduce((acc, item) => acc + item.setsDone, 0);
      const completedExercisesCount = summaries.filter((item) => item.setsDone >= item.setsTotal).length;

      return {
         summaries,
         totalSets,
         completedSetsCount,
         completedExercisesCount,
         skippedExercisesNames: summaries.filter((item) => item.setsDone === 0).map((item) => item.name),
         partialExerciseDetails: summaries
            .filter((item) => item.setsDone > 0 && item.setsDone < item.setsTotal)
            .map((item) => ({ name: item.name, setsDone: item.setsDone, setsTotal: item.setsTotal })),
         unfinished: summaries.filter((item) => item.setsDone < item.setsTotal),
      };
   }, [allExercises, activeSession?.logs, exerciseMap]);

   const currentSummary = useMemo(() => {
       if (!activeSession) return null;
       return completion.summaries.find(s => 
          activeSession.currentExerciseIndex >= s.index && 
          (s.displayIndex + 1 < completion.summaries.length 
             ? activeSession.currentExerciseIndex < completion.summaries[s.displayIndex + 1].index 
             : true)
       );
   }, [completion.summaries, activeSession]);

   const handleFinishAttempt = () => {
      const warning = getCompletionWarning({
         totalExercises: allExercises.length,
         completedExercisesCount: completion.completedExercisesCount,
         totalSets: completion.totalSets,
         completedSetsCount: completion.completedSetsCount,
         skippedExercisesNames: completion.skippedExercisesNames,
         partialExerciseDetails: completion.partialExerciseDetails,
      });

      if (warning.severity !== 'none') {
         setShowWarningModal({
            show: true,
            data: warning,
            unfinished: completion.unfinished,
         });
         return;
      }

      void finishSession();
   };

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

     return (
        <Page className="flex flex-col items-center justify-center min-h-screen text-center space-y-8">
           <div className="w-24 h-24 bg-hayl-text text-hayl-bg rounded-full flex items-center justify-center text-5xl font-heading font-black italic shadow-lg animate-bounce">✓</div>
           <div>
              <h1 className="font-heading text-6xl font-black uppercase italic tracking-tighter leading-none mb-4">Session Complete.</h1>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.3em] text-hayl-muted">Data synced to local core</p>
           </div>
           
           <Button size="lg" onClick={handleFinishAttempt} className="w-full max-w-xs animate-in fade-in slide-in-from-bottom-8 duration-700">
              FINALIZE LOG
           </Button>

            {/* Simple Warning Modal fallback if needed */}
                  {showWarningModal.show && showWarningModal.data && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                              <div className="bg-hayl-bg border border-hayl-border p-6 rounded-2xl max-w-md w-full space-y-4">
                        <h3 className="font-heading text-xl uppercase">{showWarningModal.data.title}</h3>
                        <p className="whitespace-pre-wrap text-sm text-hayl-text/80">{showWarningModal.data.message}</p>
                                    {showWarningModal.unfinished.length > 0 && (
                                       <div className="rounded-xl border border-hayl-border bg-hayl-surface/40 p-3">
                                          <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-hayl-muted mb-2">
                                             Remaining Items
                                          </p>
                                          <div className="space-y-2 max-h-56 overflow-y-auto">
                                             {showWarningModal.unfinished.map((item) => (
                                                <div key={item.name} className="flex items-center justify-between text-xs">
                                                   <span className="font-semibold text-hayl-text/90">{item.name}</span>
                                                   <span className="font-mono text-hayl-muted">
                                                      {item.setsDone}/{item.setsTotal} · left {item.setsLeft}
                                                   </span>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    )}
                        <div className="flex gap-2 pt-2">
                                           <Button variant="outline" fullWidth onClick={() => setShowWarningModal({ show: false, data: null, unfinished: [] })}>
                                {showWarningModal.data.cancelLabel}
                             </Button>
                                           <Button fullWidth onClick={() => { setShowWarningModal({ show: false, data: null, unfinished: [] }); void finishSession(); }}>
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
  // --- Group Logic for Main View ---
  const currentGroup = currentSummary ?? {
     exerciseId: currentExercise.exerciseId,
     name: exerciseMap?.[currentExercise.exerciseId as string]?.name ?? 'Loading...',
     setsTotal: currentExercise.sets,
     firstIndex: activeSession.currentExerciseIndex,
     setsDone: 0
  };

  // Calculate real-time set index based on logs for this exercise group
  const logsForCurrentGroup = activeSession.logs.filter(l => l.exerciseId === currentGroup.exerciseId);
  const currentGroupSetIndex = logsForCurrentGroup.length; 

  const handleLog = (reps: number, weight?: number, rpe?: number) => {
     // Pass total sets of the specific *item* for auto-advance
     logSet(currentGroup.exerciseId, reps, weight, rpe, currentExercise.sets);
     
     if (currentExercise.restSeconds > 0) {
        setRestTimer({ active: true, seconds: currentExercise.restSeconds });
     }
  };

  // --- Navigation Logic ---
  const handleNextExercise = () => {
     if (!currentSummary) return;
     const nextSummary = completion.summaries[currentSummary.displayIndex + 1];
     if (nextSummary) {
        void jumpToExercise(nextSummary.index, nextSummary.exerciseId);
     } else {
        handleFinishAttempt();
     }
  };

  const handlePrevExercise = () => {
     if (!currentSummary) return;
     const prevSummary = completion.summaries[currentSummary.displayIndex - 1];
     if (prevSummary) {
        void jumpToExercise(prevSummary.index, prevSummary.exerciseId);
     }
  };

  // --- Swipe Handlers ---
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
     setTouchEnd(null); 
     setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
     setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
     if (!touchStart || !touchEnd) return;
     const distance = touchStart - touchEnd;
     const isLeftSwipe = distance > minSwipeDistance;
     const isRightSwipe = distance < -minSwipeDistance;
     if (isLeftSwipe) handleNextExercise();
     if (isRightSwipe) handlePrevExercise();
  };

  return (
    <Page 
        fullWidth 
        className="max-w-xl mx-auto pb-32 pt-4 min-h-screen"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEndHandler}
     >
      <SessionHeader 
        dayTitle={currentDay.title} 
        startTime={activeSession.startTime} 
      />

      <div className="mb-6">
         <PhaseTabs 
            phases={phasesInfo} 
            activeIndex={currentPhaseIndex} 
            onTabClick={() => {}} 
         />
      </div>

      <ExerciseView 
         exerciseId={currentGroup.exerciseId as Id<'exercises'>}
         totalSets={currentGroup.setsTotal}
         repsTarget={currentExercise.reps} // Use current item for reps metadata
         restSeconds={currentExercise.restSeconds}
         exerciseIndex={currentSummary?.displayIndex ?? activeSession.currentExerciseIndex}
         totalExercises={completion.summaries.length} // Count of GROUPS
      />

         <div className="mb-4 rounded-2xl border border-hayl-border bg-hayl-surface/50 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
               <label className="text-[10px] font-heading font-bold uppercase tracking-widest text-hayl-muted">
                  Tactical Navigator
               </label>
               <span className="text-xs font-mono text-hayl-muted">
                  {completion.completedSetsCount}/{completion.totalSets} total sets
               </span>
            </div>
            
            <button
               type="button"
               onClick={() => setIsNavOpen(true)}
               className="w-full flex items-center justify-between gap-3 rounded-xl border border-hayl-border bg-hayl-bg px-4 py-3 text-left transition-all hover:border-hayl-accent/50 active:scale-[0.98]"
            >
               <div className="flex flex-col">
                  <span className="text-[10px] font-heading font-bold text-hayl-muted uppercase tracking-tighter">Current Target</span>
                  <span className="text-sm font-bold text-hayl-text line-clamp-1">
                     {currentSummary?.name ?? 'Loading...'}
                  </span>
               </div>
               <div className="flex items-center gap-2 text-hayl-muted">
                  <span className="text-xs font-mono bg-hayl-surface px-2 py-0.5 rounded border border-hayl-border">
                     {currentSummary?.setsDone ?? 0}/{currentSummary?.setsTotal ?? 0}
                  </span>
                  <ChevronDown size={16} />
               </div>
            </button>

            <div className="grid grid-cols-2 gap-3 text-[10px] uppercase font-heading font-bold tracking-widest">
               <div className="flex items-center gap-1.5 text-hayl-muted">
                  <ListFilter size={10} />
                  <span>Phase Progress</span>
               </div>
               <p className="text-hayl-muted text-right">Volume Intensity</p>
            </div>
         </div>

         <BottomSheet 
            isOpen={isNavOpen} 
            onClose={() => setIsNavOpen(false)}
            title="SQUAD NAVIGATION"
         >
            <div className="space-y-2">
               {completion.summaries.map((item) => {
                  // Simple check for active based on index
                  const isCurrent = activeSession.currentExerciseIndex >= item.index && 
                     (item.displayIndex + 1 < completion.summaries.length 
                        ? activeSession.currentExerciseIndex < completion.summaries[item.displayIndex + 1].index 
                        : true);
                  
                  const isDone = item.setsDone >= item.setsTotal;

                  return (
                     <button
                        key={`${item.name}-${item.index}`}
                        onClick={() => {
                           void jumpToExercise(item.index, item.exerciseId);
                           setIsNavOpen(false);
                        }}
                        className={`
                           w-full flex items-center justify-between p-4 rounded-2xl border transition-all
                           ${isCurrent 
                              ? 'bg-hayl-text border-hayl-text text-hayl-bg' 
                              : 'bg-hayl-surface/50 border-hayl-border text-hayl-text hover:bg-hayl-surface'
                           }
                        `}
                     >
                        <div className="flex items-center gap-4">
                           <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center border font-mono text-xs
                              ${isCurrent ? 'border-hayl-bg/20 bg-hayl-bg/10' : 'border-hayl-border bg-hayl-bg'}
                           `}>
                              {item.displayIndex + 1}
                           </div>
                           <div className="text-left">
                              <p className={`text-sm font-bold uppercase tracking-tight ${isCurrent ? 'text-hayl-bg' : 'text-hayl-text'}`}>
                                 {item.name}
                              </p>
                              <p className={`text-[10px] font-mono ${isCurrent ? 'text-hayl-bg/60' : 'text-hayl-muted'}`}>
                                 {item.setsDone}/{item.setsTotal} SETS COMPLETED
                              </p>
                           </div>
                        </div>
                        {isDone ? (
                           <CheckCircle2 size={18} className={isCurrent ? 'text-hayl-bg' : 'text-hayl-success'} />
                        ) : isCurrent ? (
                           <ChevronRight size={18} className="text-hayl-bg opacity-50" />
                        ) : (
                           <Circle size={18} className="text-hayl-border" />
                        )}
                     </button>
                  );
               })}
            </div>
         </BottomSheet>

      <SetLogger 
         currentSetIndex={currentGroupSetIndex}
         totalSets={currentGroup.setsTotal}
         repsTarget={currentExercise.reps}
         previousWeight={logsForCurrentGroup[logsForCurrentGroup.length - 1]?.weight} 
         logs={logsForCurrentGroup}
         onLog={handleLog}
      />

         <div className="fixed bottom-0 left-0 right-0 p-4 bg-hayl-bg border-t border-hayl-border z-40 md:static md:bg-transparent md:border-0 md:mt-8">
            <div className="grid grid-cols-3 gap-2">
               <Button
                  size="md"
                  variant="outline"
                  disabled={!currentSummary || currentSummary.displayIndex <= 0}
                  onClick={handlePrevExercise}
               >
                  ← PREV
               </Button>
               <Button
                  size="md"
                  onClick={handleNextExercise}
               >
                  NEXT →
               </Button>
               <Button
                  size="md"
                  variant="ghost"
                  onClick={handleFinishAttempt}
               >
                  END NOW
               </Button>
            </div>
         </div>

         {showWarningModal.show && showWarningModal.data && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
               <div className="bg-hayl-bg border border-hayl-border p-6 rounded-2xl max-w-md w-full space-y-4">
                  <h3 className="font-heading text-xl uppercase">{showWarningModal.data.title}</h3>
                  <p className="whitespace-pre-wrap text-sm text-hayl-text/80">{showWarningModal.data.message}</p>
                  {showWarningModal.unfinished.length > 0 && (
                     <div className="rounded-xl border border-hayl-border bg-hayl-surface/40 p-3">
                        <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-hayl-muted mb-2">
                           Remaining Items
                        </p>
                        <div className="space-y-2 max-h-56 overflow-y-auto">
                           {showWarningModal.unfinished.map((item) => (
                              <div key={`${item.name}-${item.setsTotal}`} className="flex items-center justify-between text-xs">
                                 <span className="font-semibold text-hayl-text/90">{item.name}</span>
                                 <span className="font-mono text-hayl-muted">
                                    {item.setsDone}/{item.setsTotal} · left {item.setsLeft} · {Math.floor(item.ratio * 100)}%
                                 </span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
                  <div className="flex gap-2 pt-2">
                     <Button variant="outline" fullWidth onClick={() => setShowWarningModal({ show: false, data: null, unfinished: [] })}>
                        {showWarningModal.data.cancelLabel}
                     </Button>
                     <Button fullWidth onClick={() => { setShowWarningModal({ show: false, data: null, unfinished: [] }); void finishSession(); }}>
                        {showWarningModal.data.confirmLabel}
                     </Button>
                  </div>
               </div>
            </div>
         )}

      {/* Rest Timer Overlay */}
      {restTimer.active && (
         <RestTimer 
            seconds={restTimer.seconds} 
            onComplete={() => setRestTimer({ active: false, seconds: 0 })}
            onSkip={() => setRestTimer({ active: false, seconds: 0 })}
            onAdd15={() => setRestTimer(prev => ({ ...prev, seconds: addTime(prev.seconds) }))}
            onSubtract15={() => setRestTimer(prev => ({ ...prev, seconds: Math.max(0, prev.seconds - 15) }))}
         />
      )}
    </Page>
  );
}
