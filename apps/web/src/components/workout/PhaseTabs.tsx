import { memo } from 'react';

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

const PHASE_ICONS: Record<Phase['name'], string> = {
  warmup: '🔥',
  main: '💪',
  accessory: '🎯',
  stretch: '🧘',
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
            key={phase.name}
            role="tab"
            aria-selected={isActive}
            aria-controls={`phase-panel-${phase.name}`}
            onClick={() => onTabClick(index)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-lg font-heading font-bold text-sm uppercase tracking-widest
              transition-all duration-200 relative overflow-hidden
              ${isActive 
                ? 'bg-hayl-accent text-hayl-bg shadow-glow' 
                : 'bg-hayl-surface border border-hayl-border text-hayl-muted hover:text-hayl-text hover:border-hayl-accent/50'
              }
              ${isComplete && !isActive ? 'border-green-500/50' : ''}
            `}
          >
            {/* Progress bar background */}
            {!isActive && progress > 0 && (
              <div 
                className="absolute bottom-0 left-0 h-0.5 bg-hayl-accent/50 transition-all"
                style={{ width: `${progress}%` }}
              />
            )}
            
            <span className="mr-1.5" aria-hidden="true">
              {isComplete ? '✓' : PHASE_ICONS[phase.name]}
            </span>
            {PHASE_LABELS[phase.name]}
            
            {/* Item count badge */}
            <span className={`
              ml-2 text-[10px] px-1.5 py-0.5 rounded
              ${isActive ? 'bg-hayl-bg/20' : 'bg-hayl-bg'}
            `}>
              {phase.completedCount}/{phase.itemCount}
            </span>
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
