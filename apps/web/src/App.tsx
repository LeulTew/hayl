import { useState, useEffect } from 'react';
import { BentoList, type BentoItem } from './components/ui/BentoList';
import { useWakeLock } from './hooks/useWakeLock';
import { useSessionTimer } from './hooks/useSessionTimer';
import { MacroCalculator } from './components/nutrition/MacroCalculator';
import { IngredientSearch } from './components/nutrition/IngredientSearch';
import { MythBuster } from './components/nutrition/MythBuster';
import { SplitSelector } from './components/workout/SplitSelector';
import { WorkoutSession } from './components/workout/WorkoutSession';
import { useActiveSession } from './hooks/useActiveSession';

// Demo Data
const PROGRAMS: BentoItem[] = [
  { id: 'prog_1', title: 'Hayl Foundations', subtitle: 'Beginner • 3 Days', rightElement: 'START' },
  { id: 'prog_2', title: 'Power Builder', subtitle: 'Intermediate • 4 Days', rightElement: 'LOCKED' },
  { id: 'prog_3', title: 'Elite Shred', subtitle: 'Elite • 6 Days', rightElement: 'LOCKED' },
];

function App() {
  const { isLocked, requestLock, releaseLock } = useWakeLock();
  const timer = useSessionTimer();
  const { activeSession, startSession } = useActiveSession();
  
  const [activeTab, setActiveTab] = useState<'programs' | 'history' | 'nutrition'>('programs');
  const [view, setView] = useState<{ type: 'home' | 'split-selector' | 'workout', data?: { programId?: string, planId?: string } }>({ type: 'home' });

  const handleProgramClick = (id: string) => {
      setView({ type: 'split-selector', data: { programId: id } });
  };

  const handleStartWorkout = async (planId: string, dayIndex: number) => {
      if (view.data?.programId) {
        await startSession(view.data.programId, planId, dayIndex);
        setView({ type: 'workout', data: { planId } });
      }
  };

  // Sync view with active session on mount
  useEffect(() => {
    if (activeSession && view.type !== 'workout') {
        setView(prev => {
            if (prev.type === 'workout') return prev;
            return { type: 'workout', data: { planId: activeSession.planId } };
        });
    }
  }, [activeSession, view.type]);

  return (
    <div className="min-h-screen bg-hayl-bg text-hayl-text font-sans p-6 pb-20 transition-colors duration-fast">
      
      {/* View Overlays */}
      {view.type === 'split-selector' && view.data?.programId && (
          <div className="fixed inset-0 z-40 bg-hayl-bg/80 backdrop-blur-sm p-6 pt-20 overflow-y-auto">
              <SplitSelector 
                programId={view.data.programId} 
                onSelect={handleStartWorkout}
                onCancel={() => setView({ type: 'home' })}
              />
          </div>
      )}

      {view.type === 'workout' && view.data?.planId && (
          <div className="fixed inset-0 z-40 bg-hayl-bg p-6 pt-10 overflow-y-auto">
              <WorkoutSession planId={view.data.planId} />
          </div>
      )}
      {/* Header */}
      <header className="mb-10 pt-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-heading font-bold italic tracking-tighter leading-none">HAYL</h1>
            <p className="font-sans text-hayl-muted font-medium text-sm tracking-wide">ETHIOPIA'S PREMIER FITNESS ENGINE</p>
          </div>
          <span className="bg-hayl-accent text-hayl-bg px-2 py-0.5 text-xs font-bold font-heading uppercase rounded-sm">ALPHA</span>
        </div>
      </header>

      {/* Stats / Status Board */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="p-5 bg-hayl-surface rounded-xl shadow-subtle flex flex-col justify-between h-32">
            <p className="font-heading text-sm text-hayl-muted uppercase tracking-wider">Session Timer</p>
            <p className="text-4xl font-heading font-bold text-hayl-text tabular-nums">{timer.formatted}</p>
            <div className="flex gap-2">
                {!timer.isRunning ? (
                    <button onClick={timer.start} className="bg-hayl-text text-hayl-bg px-4 py-1 text-sm font-bold font-heading uppercase rounded-full hover:opacity-90 transition-opacity w-full">Start</button>
                ) : (
                    <button onClick={timer.pause} className="bg-hayl-muted/20 text-hayl-text px-4 py-1 text-sm font-bold font-heading uppercase rounded-full hover:bg-hayl-muted/30 transition-colors w-full">Pause</button>
                )}
            </div>
        </div>

        <div className="p-5 bg-hayl-surface rounded-xl shadow-subtle flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <p className="font-heading text-sm text-hayl-muted uppercase tracking-wider">Wake Lock</p>
                <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-green-500 animate-pulse' : 'bg-hayl-muted'}`} />
            </div>
            
            <div className="flex items-end justify-between">
                 <span className="font-heading font-bold text-xl">{isLocked ? 'ACTIVE' : 'OFF'}</span>
                 <button 
                    onClick={isLocked ? releaseLock : requestLock}
                    className="text-xs font-sans font-medium underline text-hayl-muted hover:text-hayl-text"
                >
                    {isLocked ? 'Release' : 'Enable'}
                </button>
            </div>
        </div>
      </div>

      {/* Main List */}
      <main>
        <div className="flex gap-6 mb-6 px-1">
            <button 
                onClick={() => setActiveTab('programs')}
                className={`pb-1 text-lg font-heading font-bold tracking-wide transition-colors ${activeTab === 'programs' ? 'text-hayl-text border-b-2 border-hayl-text' : 'text-hayl-muted hover:text-hayl-text'}`}
            >
                PROGRAMS
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`pb-1 text-lg font-heading font-bold tracking-wide transition-colors ${activeTab === 'history' ? 'text-hayl-text border-b-2 border-hayl-text' : 'text-hayl-muted hover:text-hayl-text'}`}
            >
                HISTORY
            </button>
            <button 
                onClick={() => setActiveTab('nutrition')}
                className={`pb-1 text-lg font-heading font-bold tracking-wide transition-colors ${activeTab === 'nutrition' ? 'text-hayl-text border-b-2 border-hayl-text' : 'text-hayl-muted hover:text-hayl-text'}`}
            >
                NUTRITION
            </button>
        </div>

        {activeTab === 'programs' && (
            <BentoList 
                items={PROGRAMS} 
                onItemClick={handleProgramClick} 
            />
        )}
        
        {activeTab === 'nutrition' && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <MacroCalculator />
                <IngredientSearch />
                <MythBuster />
            </div>
        )}
      </main>

    </div>
  );
}

export default App;
