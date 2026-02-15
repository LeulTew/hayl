import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Page } from "../ui/Page";
import type { NavigationState } from "../../types/navigation";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { Skeleton } from "../ui/Skeleton";
import { PlanGuide } from "../guide/PlanGuide";
import { ProgramDetail } from "./ProgramDetail";
import { type FilterState, ProgramFilterSheet } from "./ProgramFilterSheet";
import { SlidersHorizontal, X, Filter } from "lucide-react";
import { useUserProfile } from "../../hooks/useUserProfile";

interface ProgramExplorerProps {
  view: 'home' | 'detail';
  planId?: string;
  programId?: string;
  onNavigate: (newState: NavigationState) => void;
  onStartSession: (dayIndex: number) => void;
}

export function ProgramExplorer({ view, planId, programId, onNavigate, onStartSession }: ProgramExplorerProps) {
  // Level 1: Fetch Data (With Metadata for Duration Filtering)
  const allProgramsRaw = useQuery(api.programs.listWithMetadata);
  const allPrograms = useMemo(() => allProgramsRaw ?? [], [allProgramsRaw]);
  const { profile } = useUserProfile();
  
  // State for Advanced Filtering
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    difficulty: [],
    splitType: [],
    duration: []
  });

  // Smart Defaults: Apply user's experience level as default filter
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (profile?.experience && !hasInitialized.current) {
        // Wrap in a microtask to avoid synchronous state update in render effect loop
        // Alternatively, use a state-based approach but ref is fine for "once"
        Promise.resolve().then(() => {
          setFilters(prev => ({
              ...prev,
              difficulty: [profile.experience!]
          }));
        });
        hasInitialized.current = true;
    }
  }, [profile]);

  // Filter Logic (Memoized for performance)
  const filteredPrograms = useMemo(() => {
    return allPrograms.filter(p => {
      // 1. Text Search (Title)
      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (!p.title.toLowerCase().includes(query)) return false;
      }

      // 2. Difficulty
      if (filters.difficulty.length > 0) {
        if (!filters.difficulty.includes(p.difficulty)) return false;
      }

      // 3. Spit Type
      if (filters.splitType.length > 0) {
        if (!filters.splitType.includes(p.splitType)) return false;
      }

      // 4. Duration
      if (filters.duration.length > 0) {
          // Check if program has ANY of the selected durations
          const hasDuration = p.durations.some(d => filters.duration.includes(d.toString()));
          if (!hasDuration) return false;
      }

      return true;
    });
  }, [allPrograms, filters]);


  // Level 3: Specific Plan Guide
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

  // Level 2: Program Detail
  if (view === 'detail' && programId) {
    return (
      <ProgramDetail 
        programId={programId} 
        onNavigate={onNavigate}
        onBack={() => onNavigate({ type: 'programs', view: 'home' })}
      />
    );
  }

  if (!allPrograms) {
    return <Page><Skeleton className="h-64 w-full" /></Page>;
  }

  // Helper to remove a filter chip
  const removeFilter = (key: keyof FilterState, value?: string) => {
      setFilters(prev => {
          if (key === 'search') return { ...prev, search: '' };
          if (!value) return prev;
          return {
              ...prev,
              [key]: (prev[key] as string[]).filter(v => v !== value)
          };
      });
  };

  const activeFilterCount = 
      (filters.search ? 1 : 0) + 
      filters.difficulty.length + 
      filters.splitType.length +
      filters.duration.length;

  return (
    <Page className="pb-24 pt-4 space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Filter Trigger */}
      <header className="px-1 flex items-end justify-between mb-4">
        <div>
            <h1 className="text-5xl font-heading font-black italic tracking-tighter uppercase leading-none mb-1">PROTCL.</h1>
            <p className="text-[10px] font-sans font-bold text-hayl-muted uppercase tracking-[0.2em]">Select your weapons</p>
        </div>
        <button 
            onClick={() => setIsFilterOpen(true)}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-full border transition-all active:scale-95
                ${activeFilterCount > 0 
                    ? 'bg-hayl-text text-hayl-bg border-hayl-text' 
                    : 'bg-hayl-surface text-hayl-muted border-hayl-border'
                }
            `}
        >
            <SlidersHorizontal size={16} />
            <span className="text-xs font-heading font-bold uppercase tracking-wider">FILTERS</span>
            {activeFilterCount > 0 && (
                <span className="ml-1 bg-hayl-bg text-hayl-text rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                    {activeFilterCount}
                </span>
            )}
        </button>
      </header>

      {/* Active Filters Scroll View */}
      {activeFilterCount > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
             {filters.search && (
                 <button onClick={() => removeFilter('search')} className="flex items-center gap-1 bg-hayl-surface border border-hayl-text/20 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase text-hayl-text">
                    <span>"{filters.search}"</span>
                    <X size={10} />
                 </button>
             )}
              {filters.difficulty.map(d => (
                 <button key={d} onClick={() => removeFilter('difficulty', d)} className="flex items-center gap-1 bg-hayl-surface border border-hayl-text/20 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase text-hayl-text">
                    <span>{d}</span>
                    <X size={10} />
                 </button>
             ))}
             {filters.splitType.map(s => (
                 <button key={s} onClick={() => removeFilter('splitType', s)} className="flex items-center gap-1 bg-hayl-surface border border-hayl-text/20 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase text-hayl-text">
                    <span>{s}</span>
                    <X size={10} />
                 </button>
             ))}
             {filters.duration.map(d => (
                 <button key={d} onClick={() => removeFilter('duration', d)} className="flex items-center gap-1 bg-hayl-surface border border-hayl-text/20 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase text-hayl-text">
                    <span>{d}m</span>
                    <X size={10} />
                 </button>
             ))}
             <button onClick={() => setFilters({ search: '', difficulty: [], splitType: [], duration: [] })} className="text-[10px] font-bold text-hayl-primary uppercase tracking-wider px-2 hover:underline">
                 Clear All
             </button>
          </div>
      )}

      {/* Results Grid */}
      <div className="space-y-4">
        {filteredPrograms.map((prog: Doc<"programs">) => (
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
                <div className="flex gap-2 mb-3">
                    <span className="inline-block px-2 py-0.5 text-[9px] font-mono border border-hayl-text/20 rounded md:rounded-full uppercase tracking-widest text-hayl-muted">
                        {prog.splitType}
                    </span>
                    <span className="inline-block px-2 py-0.5 text-[9px] font-mono border border-hayl-text/20 rounded md:rounded-full uppercase tracking-widest text-hayl-muted">
                        {prog.difficulty}
                    </span>
                </div>
                
                <h3 className="text-3xl font-heading font-bold uppercase italic mb-1 leading-8">{prog.title}</h3>
                <p className="text-xs text-hayl-muted font-medium line-clamp-2 max-w-[90%] uppercase tracking-wide">
                    {prog.splitType.replace('-', ' ')} SPLIT • {prog.difficulty} LEVEL
                </p>
             </div>
          </div>
        ))}

        {filteredPrograms.length === 0 && (
            <div className="py-24 text-center border border-dashed border-hayl-border rounded-2xl flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-hayl-border/20 flex items-center justify-center text-hayl-muted">
                    <Filter size={24} />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-heading font-bold uppercase text-hayl-muted">No protocols match</p>
                    <p className="text-xs font-mono text-hayl-muted/50">Try adjusting your filters</p>
                </div>
                <button 
                    onClick={() => setFilters({ search: '', difficulty: [], splitType: [], duration: [] })}
                    className="px-6 py-2 bg-hayl-surface border border-hayl-border rounded-full text-xs font-bold uppercase tracking-wider hover:border-hayl-text transition-colors"
                >
                    Clear Filters
                </button>
            </div>
        )}
      </div>

      {/* Filter Sheet Component */}
      <ProgramFilterSheet 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        allPrograms={allPrograms}
      />
    </Page>
  );
}
