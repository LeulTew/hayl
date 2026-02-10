import { useState, useEffect } from 'react';
import { LandingPage } from './components/home/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { SplitSelector } from './components/workout/SplitSelector';
import { WorkoutSession } from './components/workout/WorkoutSession';
import { useActiveSession } from './hooks/useActiveSession';

export type TopLevelView = 'dashboard' | 'exercises' | 'nutrition' | 'profile';

export type ViewState = 
  | { type: 'landing' }
  | { type: 'split-selector'; data: { programId: string } }
  | { type: 'workout'; data: { planId: string } }
  | { type: TopLevelView };

import { ExerciseLibrary } from './components/exercises/ExerciseLibrary';
import { NutritionHub } from './components/nutrition/NutritionHub';
import { ProfileView } from './components/profile/ProfileView';
import { GlobalNav } from './components/navigation/GlobalNav';

function App() {
  const { activeSession, startSession } = useActiveSession();
  
  // Initial state logic: If session is active, go straight to workout
  const [view, setView] = useState<ViewState>(() => {
    if (activeSession?.id && activeSession.state === 'active') {
      return { type: 'workout', data: { planId: activeSession.planId } };
    }
    return { type: 'landing' };
  });

  useEffect(() => {
    if (activeSession?.id && activeSession.state === 'active') {
      setView((prev) => {
        if (prev.type === 'workout' && prev.data.planId === activeSession.planId) return prev;
        return { type: 'workout', data: { planId: activeSession.planId } };
      });
    }
  }, [activeSession]);

  // Sync view with active session changes
  // If a session becomes active externally or after load, we must redirect to workout view
  // unless we are already there.

  
  // Render-time redirection: If we are in workout view but have no active session, 
  // we effectively "fallback" to dashboard.
  useEffect(() => {
    if (view.type === 'workout' && (!activeSession || activeSession.state !== 'active')) {
      setView({ type: 'dashboard' });
    }
  }, [view.type, activeSession]);

  if (view.type === 'workout' && (!activeSession || activeSession.state !== 'active')) {
      return <Dashboard onSelectProgram={(id) => setView({ type: 'split-selector', data: { programId: id } })} />;
  }

  const isTopLevelView = (type: string): type is TopLevelView => {
    return ['dashboard', 'exercises', 'nutrition', 'profile'].includes(type);
  };

  const currentActiveTab = isTopLevelView(view.type) ? view.type : 'dashboard';

  const handleStartWorkout = async (planId: string, dayIndex: number = 0) => {
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

      {/* 2. Top Level Views */}
      <div className={`${(view.type === 'landing' || view.type === 'workout' || view.type === 'split-selector') ? 'hidden' : 'block'} p-6 pb-32`}>
        {view.type === 'dashboard' && (
          <Dashboard onSelectProgram={(id) => setView({ type: 'split-selector', data: { programId: id } })} />
        )}
        {view.type === 'exercises' && (
          <ExerciseLibrary />
        )}
        {view.type === 'nutrition' && (
          <NutritionHub />
        )}
        {view.type === 'profile' && (
          <ProfileView />
        )}
      </div>

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

      {/* 5. Global Navigation Bar */}
      <GlobalNav 
        currentView={currentActiveTab} 
        onViewChange={(newView: TopLevelView) => setView({ type: newView })}
        isHidden={view.type === 'landing' || view.type === 'workout' || view.type === 'split-selector'}
      />

    </div>
  );
}

export default App;

