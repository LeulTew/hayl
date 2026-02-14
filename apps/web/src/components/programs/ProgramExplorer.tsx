import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Page } from "../ui/Page";
import type { NavigationState } from "../../types/navigation";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { Skeleton } from "../ui/Skeleton";
import { PlanGuide } from "../guide/PlanGuide";
import { ProgramDetail } from "./ProgramDetail";

interface ProgramExplorerProps {
  view: 'home' | 'detail';
  planId?: string;
  programId?: string;
  onNavigate: (newState: NavigationState) => void;
  onStartSession: (dayIndex: number) => void;
}

export function ProgramExplorer({ view, planId, programId, onNavigate, onStartSession }: ProgramExplorerProps) {
  // Level 1: Fetch Data (Must be unconditional)
  const programs = useQuery(api.programs.listAll) ?? [];

  // Level 3: Specific Plan Guide (e.g. "HAYL Essentials I - 3 Day")
  if (view === 'detail' && planId) {
    return (
      <PlanGuide 
        planId={planId} 
        onStartSession={onStartSession}
        onBack={() => {
            if (programId) {
                onNavigate({ type: 'programs', view: 'detail', programId });
            } else {
                onNavigate({ type: 'programs', view: 'home' });
            }
        }}
      />
    );
  }

  // Level 2: Program Detail (Variant Selector)
  if (view === 'detail' && programId) {
    return (
      <ProgramDetail 
        programId={programId} 
        onNavigate={onNavigate}
        onBack={() => onNavigate({ type: 'programs', view: 'home' })}
      />
    );
  }

  // Level 1: Program List (Category View)



  if (!programs) {
    return <Page><Skeleton className="h-64 w-full" /></Page>;
  }

  return (
    <Page className="pb-24 pt-4 space-y-8 animate-in fade-in duration-500">
      <header className="mb-6 px-1">
        <h1 className="text-6xl font-heading font-black italic tracking-tighter uppercase leading-none mb-2">Program Lab</h1>
        <p className="text-xs font-sans font-bold text-hayl-muted uppercase tracking-[0.2em]">Select your protocol</p>
      </header>

      <div className="space-y-4">
        {programs.map((prog: Doc<"programs">) => (
          <div 
            key={prog._id}
            onClick={() => onNavigate({ 
                type: 'programs', 
                view: 'detail',
                programId: prog._id
            })}
            className="group relative overflow-hidden rounded-2xl bg-hayl-surface border border-hayl-border p-6 cursor-pointer active:scale-[0.98] transition-all hover:border-hayl-text"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 font-heading text-8xl leading-none -rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0">
                {prog.title.substring(0,2)}
             </div>
             
             <div className="relative z-10">
                <span className="inline-block px-2 py-1 mb-3 text-[10px] font-mono border border-hayl-text/20 rounded-full uppercase tracking-widest text-hayl-muted">
                    {prog.splitType} • {prog.difficulty}
                </span>
                <h3 className="text-3xl font-heading font-bold uppercase italic mb-1">{prog.title}</h3>
                <p className="text-sm text-hayl-muted font-medium line-clamp-2 max-w-[80%]">
                    {prog.splitType.toUpperCase()} SPLIT
                </p>
             </div>
          </div>
        ))}
      </div>
    </Page>
  );
}
