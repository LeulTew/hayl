import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { MarkdownText } from "../ui/MarkdownText";
import { useUserProfile } from "../../hooks/useUserProfile";
import { Check } from "lucide-react";
import { useState } from "react";

interface PlanGuideProps {
  planId: string;
  onStartSession: (dayIndex: number) => void;
  onBack: () => void;
}

export function PlanGuide({ planId, onStartSession, onBack }: PlanGuideProps) {
  const plan = useQuery(api.programs.getPlan, { planId: planId as Id<'derivedPlans'> });
  const { profile, updateProfile } = useUserProfile();
  const [isActivating, setIsActivating] = useState(false);

  const isActive = profile?.activePlanId === planId;

  const handleActivate = async () => {
    setIsActivating(true);
    await updateProfile({ activePlanId: planId, programStartDate: Date.now() });
    
    // Optimistic delay for UX
    setTimeout(() => setIsActivating(false), 500);
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
                    <span className="text-[10px] font-heading font-bold uppercase tracking-[0.2em]">Active Protocol</span>
                </div>
            ) : (
                <button
                    onClick={handleActivate}
                    disabled={isActivating}
                    className="flex items-center gap-2 px-6 py-3 bg-hayl-accent text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-hayl-accent/20"
                >
                    <span className="text-[12px] font-heading font-black uppercase tracking-[0.2em]">
                        {isActivating ? "Deploying..." : "Activate Routine"}
                    </span>
                </button>
            )}
        </div>

        <div className="inline-block bg-hayl-text text-hayl-bg px-3 py-1 text-[9px] font-heading font-black uppercase tracking-[0.2em] rounded-full mb-4">
          {plan.variant.difficulty} Protocol
        </div>
        <h1 className="text-3xl md:text-5xl font-heading font-black italic tracking-tighter uppercase leading-[0.9] mb-4 break-words">
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

      {/* Content Tabs / Sections */}
      <div className="space-y-12">
        {/* Overview */}
        <section>
          <h2 className="text-xl font-heading font-black italic tracking-tighter uppercase mb-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-hayl-text" /> 
            Mission Overview
          </h2>
          <div className="bg-hayl-surface p-6 rounded-[2rem] shadow-sm border border-hayl-border">
             <MarkdownText content={plan.overview_markdown || "No briefing available."} />
          </div>
        </section>

        {/* Philosophy */}
        {plan.philosophy_markdown && (
          <section>
            <h2 className="text-xl font-heading font-black italic tracking-tighter uppercase mb-4 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-hayl-text" /> 
              Science & Theory
            </h2>
            <div className="bg-hayl-surface p-6 rounded-[2rem] shadow-sm border border-hayl-border">
              <MarkdownText content={plan.philosophy_markdown} />
            </div>
          </section>
        )}

        {/* Schedule / Schedule Selector */}
        <section>
           <h2 className="text-xl font-heading font-black italic tracking-tighter uppercase mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-hayl-text" /> 
            Deploy Session
          </h2>
          <div className="grid gap-4">
            {plan.days.map((day) => (
              <button
                key={day.dayIndex}
                onClick={() => onStartSession(day.dayIndex)}
                className="group relative overflow-hidden bg-hayl-surface p-6 rounded-[2rem] border border-hayl-border hover:border-hayl-text transition-all text-left"
              >
                 <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-heading font-black uppercase tracking-[0.2em] text-hayl-muted group-hover:text-hayl-text transition-colors">
                        Day {day.dayIndex + 1}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-heading font-black italic uppercase tracking-tighter">
                        {day.title}
                      </h3>
                      <p className="text-xs text-hayl-muted font-sans font-medium mt-1">
                        {day.phases.length} Phases • {day.phases.reduce((acc, p) => acc + p.items.length, 0)} Exercises
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-hayl-bg border border-hayl-border flex items-center justify-center group-hover:bg-hayl-text group-hover:text-hayl-bg transition-all shrink-0 ml-4">
                      <span className="font-heading font-bold text-lg italic">GO</span>
                    </div>
                 </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
