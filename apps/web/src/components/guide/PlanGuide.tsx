import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface PlanGuideProps {
  planId: string;
  onStartSession: (dayIndex: number) => void;
  onBack: () => void;
}

export function PlanGuide({ planId, onStartSession, onBack }: PlanGuideProps) {
  const plan = useQuery(api.programs.getPlan, { planId: planId as Id<'derivedPlans'> });

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="w-12 h-12 border-2 border-hayl-text border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-heading font-bold uppercase tracking-[0.3em] opacity-50">Loading Protocol...</p>
      </div>
    );
  }

  // Helper to render simple markdown-like text (placeholder for a real MD renderer)
  const renderText = (text?: string) => {
    if (!text) return null;
    return text.split('\n\n').map((p, i) => (
      <p key={i} className="mb-4 text-sm leading-relaxed text-hayl-muted font-sans font-medium">
        {p}
      </p>
    ));
  };

  return (
    <div className="animate-in slide-in-from-bottom-8 duration-700 pb-32">
      {/* Header */}
      <header className="mb-8 pt-4">
        <button 
          onClick={onBack}
          className="mb-8 text-[10px] font-heading font-black uppercase tracking-[0.3em] text-hayl-muted hover:text-hayl-text transition-colors flex items-center gap-2"
        >
          ← Return to Command
        </button>
        <div className="inline-block bg-hayl-text text-hayl-bg px-3 py-1 text-[9px] font-heading font-black uppercase tracking-[0.2em] rounded-full mb-4">
          {plan.variant.difficulty} Protocol
        </div>
        <h1 className="text-4xl md:text-6xl font-heading font-black italic tracking-tighter uppercase leading-[0.85] mb-4">
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
          <h2 className="text-2xl font-heading font-black italic tracking-tighter uppercase mb-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-hayl-text" /> 
            Mission Overview
          </h2>
          <div className="bg-hayl-surface p-6 rounded-[2rem] shadow-sm border border-hayl-border">
             {renderText(plan.overview_markdown || "No briefing available.")}
          </div>
        </section>

        {/* Philosophy */}
        {plan.philosophy_markdown && (
          <section>
            <h2 className="text-2xl font-heading font-black italic tracking-tighter uppercase mb-4 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-hayl-text" /> 
              Science & Theory
            </h2>
            <div className="bg-hayl-surface p-6 rounded-[2rem] shadow-sm border border-hayl-border">
              {renderText(plan.philosophy_markdown)}
            </div>
          </section>
        )}

        {/* Schedule / Schedule Selector */}
        <section>
           <h2 className="text-2xl font-heading font-black italic tracking-tighter uppercase mb-6 flex items-center gap-3">
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
                      <h3 className="text-3xl font-heading font-black italic uppercase tracking-tighter">
                        {day.title}
                      </h3>
                      <p className="text-xs text-hayl-muted font-sans font-medium mt-1">
                        {day.phases.length} Phases • {day.phases.reduce((acc, p) => acc + p.items.length, 0)} Exercises
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-hayl-bg border border-hayl-border flex items-center justify-center group-hover:bg-hayl-text group-hover:text-hayl-bg transition-all">
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
