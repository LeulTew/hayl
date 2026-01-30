import { useState, useEffect } from 'react';
import { LandingPage } from './components/home/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { SplitSelector } from './components/workout/SplitSelector';
import { WorkoutSession } from './components/workout/WorkoutSession';
import { useActiveSession } from './hooks/useActiveSession';

type ViewState = 
  | { type: 'landing' }
  | { type: 'dashboard' }
  | { type: 'split-selector'; data: { programId: string } }
  | { type: 'workout'; data: { planId: string } };

function App() {
  const { activeSession, startSession } = useActiveSession();
  
  // Initial state is landing unless there's an active session
  const [view, setView] = useState<ViewState>({ type: 'landing' });

  // Sync view with active session on mount or session change
  useEffect(() => {
    if (activeSession) {
      if (view.type !== 'workout' || view.data.planId !== activeSession.planId) {
        setView({ type: 'workout', data: { planId: activeSession.planId } });
      }
    } else if (view.type === 'workout') {
      // If session ended and we're in workout view, go back to dashboard
      setView({ type: 'dashboard' });
    }
  }, [activeSession, view.type]);

  const handleStartWorkout = async (planId: string, dayIndex: number) => {
    if (view.type === 'split-selector') {
      await startSession(view.data.programId, planId, dayIndex);
      // View will auto-sync via useEffect
    }
  };

  return (
    <div className="min-h-screen bg-hayl-bg text-hayl-text font-sans selection:bg-hayl-accent selection:text-hayl-bg">
      
      {/* 1. Landing View */}
      {view.type === 'landing' && (
        <LandingPage onEnter={() => setView({ type: 'dashboard' })} />
      )}

      {/* 2. Dashboard View */}
      {view.type === 'dashboard' && (
        <div className="p-6 pb-20">
          <Dashboard onSelectProgram={(id) => setView({ type: 'split-selector', data: { programId: id } })} />
        </div>
      )}

      {/* 3. Split Selector Overlay */}
      {view.type === 'split-selector' && (
        <div className="fixed inset-0 z-50 bg-hayl-bg p-6 pt-10 overflow-y-auto animate-in slide-in-from-bottom duration-500">
          <SplitSelector 
            programId={view.data.programId} 
            onSelect={handleStartWorkout}
            onCancel={() => setView({ type: 'dashboard' })}
          />
        </div>
      )}

      {/* 4. Active Workout View */}
      {view.type === 'workout' && (
        <div className="fixed inset-0 z-50 bg-hayl-bg p-6 pt-10 overflow-y-auto">
          <WorkoutSession planId={view.data.planId} />
        </div>
      )}

    </div>
  );
}

export default App;

