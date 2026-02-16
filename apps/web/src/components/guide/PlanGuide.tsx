import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { MarkdownText } from "../ui/MarkdownText";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useSafeActiveRoutine } from "../../hooks/useSafeActiveRoutine";
import { Check, ArrowUp, ArrowDown, X, Save, Edit3 } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "../ui/Button";

interface PlanGuideProps {
  planId: string;
  onStartSession: (dayIndex: number) => void;
  onBack: () => void;
}

export function PlanGuide({ planId, onStartSession, onBack }: PlanGuideProps) {
  const plan = useQuery(api.programs.getPlan, { planId: planId as Id<'derivedPlans'> });
  const { profile, updateProfile } = useUserProfile();
  const reorderDays = useMutation(api.routines.reorderActiveRoutineDays);
  
  const [isActivating, setIsActivating] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
   const [saveError, setSaveError] = useState<string | null>(null);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem("hayl-token") : null;
   const { activeRoutine, isUnavailable: isRoutineApiUnavailable } = useSafeActiveRoutine(token);

  const isActive = profile?.activePlanId === planId;

  // Local state for reordering
  const [tempDayOrder, setTempDayOrder] = useState<number[]>([]);

   const getPersistedOrder = useCallback(() => {
      if (!plan) return [] as number[];
      if (activeRoutine?.planId === planId) {
         return activeRoutine.dayOrder.map((d: { dayIndex: number }) => d.dayIndex);
      }
      return plan.days.map((d: { dayIndex: number }) => d.dayIndex);
   }, [plan, activeRoutine, planId]);

  useEffect(() => {
     if (plan && !isReordering) {
        // Initial order from active routine or plan defaults
        const initialOrder = getPersistedOrder();
        setTempDayOrder(initialOrder);
     }
   }, [plan, isReordering, getPersistedOrder]);

  const orderedDays = useMemo(() => {
     if (!plan) return [];
     return tempDayOrder.map(idx => plan.days.find((d: { dayIndex: number }) => d.dayIndex === idx)!).filter(Boolean);
  }, [plan, tempDayOrder]);

  const handleActivate = async () => {
    setIsActivating(true);
    await updateProfile({ activePlanId: planId, programStartDate: Date.now() });
    
    // Optimistic delay for UX
    setTimeout(() => setIsActivating(false), 500);
  };

  const moveDay = (fromIndex: number, toIndex: number) => {
     const newOrder = [...tempDayOrder];
     const [removed] = newOrder.splice(fromIndex, 1);
     newOrder.splice(toIndex, 0, removed);
     setTempDayOrder(newOrder);
  };

  const handleSaveOrder = async () => {
     if (!token) return;
     const previousOrder = getPersistedOrder();
     const optimisticOrder = [...tempDayOrder];

     setSaveError(null);
     setIsReordering(false);
     setTempDayOrder(optimisticOrder);
     setIsSaving(true);

     try {
        await reorderDays({
           tokenIdentifier: token,
           orderedDayIndexes: optimisticOrder,
           planId: planId as Id<'derivedPlans'>
        });
     } catch (err) {
        setTempDayOrder(previousOrder);
        setSaveError("Could not save your new order. Reverted to previous schedule.");
        console.error("Failed to reorder:", err);
     } finally {
        setIsSaving(false);
     }
  };

  const handleCancelReorder = () => {
    setSaveError(null);
    setTempDayOrder(getPersistedOrder());
    setIsReordering(false);
  };

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="w-12 h-12 border-2 border-hayl-text border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-heading font-bold uppercase tracking-[0.3em] opacity-50">Loading Protocol...</p>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-8 duration-700 pb-32 px-6 md:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8 pt-6">
        <div className="flex justify-between items-start">
            <button 
            onClick={onBack}
            className="mb-8 text-[10px] font-heading font-black uppercase tracking-[0.3em] text-hayl-muted hover:text-hayl-text transition-colors flex items-center gap-2"
            >
            ← Return to Command
            </button>

                  {isActive ? (
                     <div className="flex items-center gap-2 px-4 py-2 bg-hayl-text text-hayl-bg rounded-full border border-hayl-text">
                        <Check size={14} strokeWidth={3} />
                        <span className="text-[10px] font-heading font-bold uppercase tracking-[0.2em]">Active</span>
                     </div>
                  ) : (
                <Button
                    onClick={handleActivate}
                    disabled={isActivating}
                    className="shadow-xl shadow-hayl-accent/20"
                >
                    {isActivating ? "Deploying..." : "Activate"}
                </Button>
            )}
        </div>

        <div className="inline-block bg-hayl-text text-hayl-bg px-3 py-1 text-[9px] font-heading font-black uppercase tracking-[0.2em] rounded-full mb-4">
          {plan.variant.difficulty} Protocol
        </div>
            <h1 className="text-3xl md:text-5xl font-heading font-black italic tracking-tighter uppercase leading-[0.9] mb-4 wrap-break-word">
          {plan.description}
        </h1>
        <div className="flex gap-4 border-b border-hayl-border pb-8">
           <div className="flex flex-col">
             <span className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-hayl-muted">Frequency</span>
             <span className="text-xl font-heading font-black italic">{plan.variant.splitFreq}</span>
           </div>
           <div className="w-px bg-hayl-border h-auto" />
           <div className="flex flex-col">
             <span className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-hayl-muted">Duration</span>
             <span className="text-xl font-heading font-black italic">~{plan.variant.durationMinutes}m</span>
           </div>
        </div>
      </header>

         {/* Content Sections */}
      <div className="space-y-12">
            {/* Deploy Section (Primary) */}
        <section>
               <div className="mb-6 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-heading font-black italic tracking-tighter uppercase flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-hayl-text" />
                     Deploy Session
                  </h2>
                  {isActive && !isReordering && (
                     <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-[10px] uppercase tracking-widest"
                        disabled={isRoutineApiUnavailable}
                        onClick={() => setIsReordering(true)}
                     >
                        <Edit3 size={14} />
                        Reorder Days
                     </Button>
                  )}
               </div>

          <div className={`grid gap-4 ${isReordering ? 'opacity-95' : ''}`}>
            {orderedDays.map((day, idx) => (
              <div
                key={day.dayIndex}
                className={`
                            group relative overflow-hidden bg-hayl-surface p-6 rounded-4xl border transition-all 
                   ${isReordering ? 'border-hayl-accent bg-hayl-accent/5' : 'border-hayl-border hover:border-hayl-text'}
                `}
              >
                 <div className="relative z-10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       {isReordering && (
                          <div className="flex flex-col gap-1 pointer-events-auto">
                             <button 
                                onClick={() => moveDay(idx, Math.max(0, idx - 1))}
                                disabled={idx === 0}
                                className="p-2 hover:bg-hayl-accent hover:text-white rounded-full transition-colors disabled:opacity-30"
                             >
                                <ArrowUp size={16} />
                             </button>
                             <button 
                                onClick={() => moveDay(idx, Math.min(orderedDays.length - 1, idx + 1))}
                                disabled={idx === orderedDays.length - 1}
                                className="p-2 hover:bg-hayl-accent hover:text-white rounded-full transition-colors disabled:opacity-30"
                             >
                                <ArrowDown size={16} />
                             </button>
                          </div>
                       )}
                       <div>
                          <span className="text-[10px] font-heading font-black uppercase tracking-[0.2em] text-hayl-muted group-hover:text-hayl-text transition-colors">
                            Day {idx + 1}
                          </span>
                          <h3 className="text-2xl md:text-3xl font-heading font-black italic uppercase tracking-tighter">
                            {day.title}
                          </h3>
                          <p className="text-xs text-hayl-muted font-sans font-medium mt-1">
                            {day.phases.length} Phases • {day.phases.reduce((acc: number, p: { items: { exerciseId: string }[] }) => acc + p.items.length, 0)} Exercises
                          </p>
                       </div>
                    </div>
                    
                    {!isReordering && (
                       <button 
                          onClick={() => onStartSession(day.dayIndex)}
                          className="w-12 h-12 rounded-full bg-hayl-bg border border-hayl-border flex items-center justify-center hover:bg-hayl-text hover:text-hayl-bg transition-all shrink-0 ml-4 active:scale-90"
                       >
                          <span className="font-heading font-bold text-lg italic">GO</span>
                       </button>
                    )}
                 </div>
              </div>
            ))}
          </div>
        </section>

            {/* Knowledge Sections (Secondary, Collapsible) */}
            {!isReordering && (
               <>
                  <section>
                     <details className="group rounded-4xl border border-hayl-border bg-hayl-surface p-4" open>
                        <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                           <span className="text-xl font-heading font-black italic tracking-tighter uppercase flex items-center gap-3">
                              <span className="w-2 h-2 rounded-full bg-hayl-text" />
                              Mission Overview
                           </span>
                           <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-hayl-muted group-open:hidden">Expand</span>
                           <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-hayl-muted hidden group-open:inline">Collapse</span>
                        </summary>
                        <div className="pt-4 px-2">
                           <MarkdownText content={plan.overview_markdown || "No briefing available."} />
                        </div>
                     </details>
                  </section>

                  {plan.philosophy_markdown && (
                     <section>
                        <details className="group rounded-4xl border border-hayl-border bg-hayl-surface p-4">
                           <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                              <span className="text-xl font-heading font-black italic tracking-tighter uppercase flex items-center gap-3">
                                 <span className="w-2 h-2 rounded-full bg-hayl-text" />
                                 Science & Theory
                              </span>
                              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-hayl-muted group-open:hidden">Expand</span>
                              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-hayl-muted hidden group-open:inline">Collapse</span>
                           </summary>
                           <div className="pt-4 px-2">
                              <MarkdownText content={plan.philosophy_markdown} />
                           </div>
                        </details>
                     </section>
                  )}
               </>
            )}
      </div>

         {saveError && (
            <div className="mt-6 rounded-2xl border border-hayl-danger/40 bg-hayl-danger/10 p-4">
               <p className="text-xs font-heading font-bold uppercase tracking-wider text-hayl-danger">
                  {saveError}
               </p>
            </div>
         )}

         {isRoutineApiUnavailable && (
            <div className="mt-6 rounded-2xl border border-hayl-border bg-hayl-surface p-4">
               <p className="text-xs font-heading font-bold uppercase tracking-wider text-hayl-muted">
                  Reorder is temporarily unavailable. Run `npx convex dev` or deploy backend routines.
               </p>
            </div>
         )}

      {/* Reorder Action Bar */}
      {isReordering && (
         <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-hayl-text text-hayl-bg p-4 rounded-3xl flex items-center justify-between shadow-2xl">
               <div className="hidden sm:block pl-2">
                  <p className="font-heading font-bold uppercase text-xs tracking-widest text-hayl-bg/60">Tactical Reorder</p>
                  <p className="text-[10px] font-mono uppercase text-hayl-bg/40">Manual Override Active</p>
               </div>
               <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                     variant="ghost" 
                     className="bg-hayl-bg/10 hover:bg-hayl-bg/20 text-hayl-bg border-transparent flex-1 sm:flex-initial"
                     onClick={handleCancelReorder}
                  >
                     <X size={16} className="mr-2" />
                     CANCEL
                  </Button>
                  <Button 
                     className="bg-hayl-accent text-white flex-1 sm:flex-initial"
                     onClick={handleSaveOrder}
                     disabled={isSaving}
                  >
                     <Save size={16} className="mr-2" />
                     {isSaving ? "SAVING..." : "COMMIT"}
                  </Button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
