import { useState } from 'react';
import { LandingPage } from './components/home/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { SplitSelector } from './components/workout/SplitSelector';
import { WorkoutSession } from './components/workout/WorkoutSession';
import { useActiveSession } from './hooks/useActiveSession';
import { useUserProfile } from './hooks/useUserProfile';
import { useTheme } from './hooks/useTheme';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { HistoryView } from './components/history/HistoryView';
import { SessionDetail } from './components/history/SessionDetail';
import { PlanGuide } from './components/guide/PlanGuide';
import { ExerciseLibrary } from './components/exercises/ExerciseLibrary';
import { NutritionHub } from './components/nutrition/NutritionHub';
import { ProfileView } from './components/profile/ProfileView';
import { GlobalNav } from './components/navigation/GlobalNav';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ProgramExplorer } from './components/programs/ProgramExplorer';

import type { NavigationState, TopLevelView } from './types/navigation';
import { getActiveTab } from './types/navigation';

function App() {
  const { activeSession, startSession } = useActiveSession();
  const { isOnboarded, isLoading: isProfileLoading } = useUserProfile();
  useTheme(); // Initialize theme globally
  
  // Initial state logic
  const [view, setView] = useState<NavigationState>(() => {
    if (activeSession?.id && activeSession.state === 'active') {
      return { type: 'workout', data: { planId: activeSession.planId } };
    }
    return { type: 'landing' };
  });

  const effectiveView: NavigationState = (() => {
    if (activeSession?.id && activeSession.state === 'active') {
      // Force workout view if session is active
      // But allow transient views? No, active workout locks screen usually.
      return { type: 'workout', data: { planId: activeSession.planId } };
    }

    if (view.type === 'workout') {
      return { type: 'dashboard' };
    }

    return view;
  })();

  const currentActiveTab = getActiveTab(effectiveView);
  const isGlobalNavHidden = !currentActiveTab; 

  // Core Navigation Handlers
  const handlePlanSelection = (planId: string) => {
    if (view.type === 'split-selector') {
      // Legacy path: Navigate to Guide View
      setView({ type: 'guide', data: { planId, programId: view.data.programId } });
    }
  };

  const handleStartWorkout = async (dayIndex: number) => {
    // Handle start from legacy guide or new programs explorer
    if (view.type === 'guide') {
      await startSession(view.data.programId, view.data.planId, dayIndex);
      setView({ type: 'workout', data: { planId: view.data.planId } });
    } else if (view.type === 'programs' && view.view === 'detail' && view.programId && view.planId) {
       await startSession(view.programId, view.planId, dayIndex);
       setView({ type: 'workout', data: { planId: view.planId } });
    }
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-hayl-bg flex items-center justify-center">
        <h1 className="font-display text-4xl animate-pulse text-hayl-text">HAYL</h1>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-hayl-bg text-hayl-text font-body selection:bg-hayl-accent selection:text-hayl-bg">
      <div className={isGlobalNavHidden ? '' : 'md:pl-64'}>
      
      {/* 1. Landing View */}
      {effectiveView.type === 'landing' && (
        <LandingPage onEnter={() => {
            if (!isOnboarded) setView({ type: 'onboarding' });
            else setView({ type: 'dashboard' });
        }} />
      )}

      {/* 1.5 Onboarding View */}
      {effectiveView.type === 'onboarding' && (
        <OnboardingFlow onComplete={() => setView({ type: 'dashboard' })} />
      )}

      {/* 2. Top Level Views */}
      <div className={isGlobalNavHidden ? 'hidden' : 'block'}>
        {effectiveView.type === 'dashboard' && (
          <Dashboard 
            onNavigate={(newState) => setView(newState)} 
            onStartSession={async (dayIndex, programId, planId) => {
              await startSession(programId, planId, dayIndex);
              setView({ type: 'workout', data: { planId } });
            }}
          />
        )}
        
        {effectiveView.type === 'programs' && (
           <ProgramExplorer 
             view={effectiveView.view} 
             planId={effectiveView.planId}
             programId={effectiveView.programId}
             onNavigate={(newState) => setView(newState)}
             onStartSession={handleStartWorkout} 
           />
        )}

        {effectiveView.type === 'exercises' && (
           <ExerciseLibrary 
             view={effectiveView.view} 
             filter={effectiveView.filter}
             exerciseId={effectiveView.exerciseId}
             onNavigate={(newState) => setView(newState)}
           />
        )}
        {effectiveView.type === 'nutrition' && (
           <NutritionHub 
             view={effectiveView.view}
             contentId={effectiveView.contentId}
             onNavigate={(newState) => setView(newState)}
           />
        )}
        {effectiveView.type === 'profile' && (
          <ProfileView onNavigate={(view) => setView(view as NavigationState)} />
        )}
      </div>

      {/* 3. Split Selector Overlay (Legacy/Fallback) */}
      {effectiveView.type === 'split-selector' && (
        <div className="fixed inset-0 z-50 bg-hayl-bg p-6 pt-10 overflow-y-auto animate-in slide-in-from-bottom duration-500">
          <SplitSelector 
            programId={effectiveView.data.programId} 
            onSelect={handlePlanSelection}
            onCancel={() => setView({ type: 'dashboard' })}
          />
        </div>
      )}

      {/* 4. Plan Guide View (Legacy) */}
      {effectiveView.type === 'guide' && (
        <div className="fixed inset-0 z-50 bg-hayl-bg overflow-y-auto animate-in fade-in duration-300">
          <PlanGuide 
            planId={effectiveView.data.planId} 
            onStartSession={handleStartWorkout}
            onBack={() => setView({ type: 'dashboard' })}
          />
        </div>
      )}

      {/* 5. Active Workout View */}
      {effectiveView.type === 'workout' && (
        <div className="fixed inset-0 z-50 bg-hayl-bg overflow-y-auto animate-in fade-in">
          <WorkoutSession planId={effectiveView.data.planId} />
        </div>
      )}

      {/* 6. History View */}
      {effectiveView.type === 'history' && (
        <HistoryView 
          onBack={() => setView({ type: 'dashboard' })} 
          onSelectSession={(id) => setView({ type: 'session-detail', sessionId: id })}
        />
      )}

      {/* 7. Session Detail */}
      {effectiveView.type === 'session-detail' && (
        <SessionDetail 
          sessionId={effectiveView.sessionId} 
          onBack={() => setView({ type: 'history' })} 
        />
      )}

      {/* 8. Global Navigation Bar */}
      <GlobalNav 
        currentView={currentActiveTab as TopLevelView} 
        onViewChange={(newView: TopLevelView) => {
            // Reset to 'home' view when switching tabs
            if (newView === 'programs') setView({ type: 'programs', view: 'home' });
            else if (newView === 'exercises') setView({ type: 'exercises', view: 'home' });
            else if (newView === 'nutrition') setView({ type: 'nutrition', view: 'home' });
            else setView({ type: newView });
        }}
        isHidden={isGlobalNavHidden}
      />
      </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
