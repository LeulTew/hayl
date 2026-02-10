import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";


import { BentoList } from "../ui/BentoList";


/**
 * Dashboard View
 * 
 * The central command center.
 * Flow:
 * 1. Overview (Default) -> Shows "Active Plans" cards
 * 2. SplitSelector -> User picks a plan variant
 * 3. PlanGuide -> User reads the manual/philosophy (NEW)
 * 4. WorkoutSession -> Active gym mode
 */
interface DashboardProps {
  onSelectProgram?: (programId: string) => void;
}

export function Dashboard({ onSelectProgram }: DashboardProps) {


  const programs = useQuery(api.programs.list) || [];

  // Flow Handlers
  const handleProgramClick = (programSlug: string) => {
    const program = programs.find(p => p._id === programSlug || p.slug === programSlug);
    if (program) {
      onSelectProgram?.(program._id); 
    }
  };

  // 1. ACTIVE SESSION MODE
  // Delegated to App.tsx

  // 4. DEFAULT DASHBOARD VIEW
  return (
    <div className="animate-in fade-in duration-700 max-w-2xl mx-auto pt-4">
      {/* Header */}
      <header className="mb-8 px-2 flex justify-between items-end">
        <div>
           <p className="text-[10px] font-sans font-bold text-hayl-muted uppercase tracking-[0.3em] mb-1 opacity-60">Status: Online</p>
           <h1 className="text-4xl font-heading font-black italic tracking-tighter uppercase leading-none">Command Center.</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center animate-pulse">
           <div className="w-2 h-2 bg-green-500 rounded-full" />
        </div>
      </header>
  
      {/* Programs List */}
      <div className="mb-12">
        <h2 className="text-[12px] font-heading font-black uppercase tracking-[0.2em] text-hayl-muted mb-6 px-2">Available Protocols</h2>
        {programs.length > 0 ? (
          <BentoList 
            items={programs.map(p => ({
              id: p.slug, // Use slug for ID to match BentoList expectation
              title: p.title,
              subtitle: `${p.difficulty.toUpperCase()} • ${p.splitType.toUpperCase()}`,
              rightElement: 'SELECT',
            }))}
            onItemClick={handleProgramClick}
          />
        ) : (
          <div className="p-8 border border-dashed border-hayl-border rounded-2xl text-center">
            <p className="text-hayl-muted font-heading font-bold uppercase tracking-widest text-xs">No Protocols Loaded</p>
          </div>
        )}
      </div>

      {/* Recent History Stub */}
      <div className="mb-8">
        <h2 className="text-[12px] font-heading font-black uppercase tracking-[0.2em] text-hayl-muted mb-6 px-2">Recent Sorties</h2>
        <div className="p-6 bg-hayl-surface/50 border border-hayl-border rounded-4xl text-center opacity-50">
           <p className="text-[10px] font-bold uppercase tracking-widest text-hayl-muted">Log Empty</p>
        </div>
      </div>
    </div>
  );
}
