import React, { memo } from 'react';


interface Phase {
  name: 'warmup' | 'main' | 'accessory' | 'stretch';
  itemCount: number;
  completedCount: number;
}

interface PhaseTabsProps {
  /** Array of phases with completion status */
  phases: Phase[];
  /** Currently active phase index */
  activeIndex: number;
  /** Callback when a tab is clicked */
  onTabClick: (index: number) => void;
}

const PHASE_LABELS: Record<Phase['name'], string> = {
  warmup: 'Warmup',
  main: 'Workout',
  accessory: 'Accessory',
  stretch: 'Stretch',
};

const PHASE_ICONS: Record<Phase['name'], React.ReactNode> = {
  warmup: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.99 7.99 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14l2.828.828" />
    </svg>
  ),
  main: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  accessory: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  stretch: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
};

/**
 * PhaseTabs
 * 
 * Horizontal tab navigation for workout phases.
 * Shows completion progress and highlights active phase.
 */
function PhaseTabsComponent({ phases, activeIndex, onTabClick }: PhaseTabsProps) {
  return (
    <nav 
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      role="tablist"
      aria-label="Workout phases"
    >
      {phases.map((phase, index) => {
        const isActive = index === activeIndex;
        const isComplete = phase.completedCount >= phase.itemCount;
        const progress = phase.itemCount > 0 
          ? Math.round((phase.completedCount / phase.itemCount) * 100) 
          : 0;

        return (
          <button
            key={`${phase.name}-${index}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`phase-panel-${phase.name}`}
            onClick={() => onTabClick(index)}
            className={`
              shrink-0 px-6 py-2.5 rounded-full font-heading font-bold text-sm uppercase tracking-widest
              transition-all duration-300 relative overflow-hidden border
              ${isActive 
                ? 'bg-hayl-text text-hayl-bg border-hayl-text' 
                : 'bg-hayl-surface text-hayl-muted hover:text-hayl-text border-hayl-border'
              }
            `}
          >
            {/* Subtle Progress indicator */}
            {!isActive && progress > 0 && (
              <div 
                className="absolute bottom-0 left-0 h-0.5 bg-hayl-text/20 transition-all"
                style={{ width: `${progress}%` }}
              />
            )}
            
            <div className="flex items-center gap-3">
              <span className="text-lg" aria-hidden="true">
                {isComplete ? '✓' : PHASE_ICONS[phase.name]}
              </span>
              <span className="italic tracking-tight">{PHASE_LABELS[phase.name]}</span>
              
              {/* Item count badge (Clean Style) */}
              <span className={`
                ml-1 text-[10px] tabular-nums font-bold
                ${isActive ? 'opacity-70' : 'text-hayl-muted'}
              `}>
                {phase.completedCount}/{phase.itemCount}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

/**
 * Memoized PhaseTabs to prevent unnecessary re-renders.
 */
export const PhaseTabs = memo(PhaseTabsComponent);
