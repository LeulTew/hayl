import { useState } from 'react';
import { LandingPage } from './components/home/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { SplitSelector } from './components/workout/SplitSelector';
import { WorkoutSession } from './components/workout/WorkoutSession';
import { useActiveSession } from './hooks/useActiveSession';
import { useUserProfile } from './hooks/useUserProfile';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { HistoryView } from './components/history/HistoryView';
import { SessionDetail } from './components/history/SessionDetail';

import { PlanGuide } from './components/guide/PlanGuide';

export type TopLevelView = 'dashboard' | 'exercises' | 'nutrition' | 'profile';

export type ViewState = 
  | { type: 'landing' }
  | { type: 'split-selector'; data: { programId: string } }
  | { type: 'guide'; data: { planId: string; programId: string } }
  | { type: 'workout'; data: { planId: string } }
  | { type: 'onboarding' }
  | { type: 'history' }
  | { type: 'session-detail'; sessionId: string }
  | { type: TopLevelView };

import { ExerciseLibrary } from './components/exercises/ExerciseLibrary';
import { NutritionHub } from './components/nutrition/NutritionHub';
import { ProfileView } from './components/profile/ProfileView';
import { GlobalNav } from './components/navigation/GlobalNav';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

function App() {
  const { activeSession, startSession } = useActiveSession();
  const { isOnboarded, isLoading: isProfileLoading } = useUserProfile();
  
  // Initial state logic
  const [view, setView] = useState<ViewState>(() => {
    if (activeSession?.id && activeSession.state === 'active') {
      return { type: 'workout', data: { planId: activeSession.planId } };
    }
    return { type: 'landing' };
  });

  const effectiveView: ViewState = (() => {
    if (activeSession?.id && activeSession.state === 'active') {
      return { type: 'workout', data: { planId: activeSession.planId } };
    }

    if (view.type === 'workout') {
      return { type: 'dashboard' };
    }

    return view;
  })();

  const isTopLevelView = (type: string): type is TopLevelView => {
    return ['dashboard', 'exercises', 'nutrition', 'profile'].includes(type);
  };

  const currentActiveTab = isTopLevelView(effectiveView.type) ? effectiveView.type : 'dashboard';
  const isGlobalNavHidden = effectiveView.type === 'landing' || effectiveView.type === 'workout' || effectiveView.type === 'split-selector' || effectiveView.type === 'guide' || effectiveView.type === 'history' || effectiveView.type === 'session-detail';

  // Core Navigation Handlers
  const handlePlanSelection = (planId: string) => {
    if (view.type === 'split-selector') {
      // Navigate to Guide View
      setView({ type: 'guide', data: { planId, programId: view.data.programId } });
    }
  };

  const handleStartWorkout = async (dayIndex: number) => {
    if (view.type === 'guide') {
      await startSession(view.data.programId, view.data.planId, dayIndex);
      setView({ type: 'workout', data: { planId: view.data.planId } });
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
      <div className={(effectiveView.type === 'landing' || effectiveView.type === 'workout' || effectiveView.type === 'split-selector' || effectiveView.type === 'guide' || effectiveView.type === 'history' || effectiveView.type === 'session-detail') ? 'hidden' : 'block'}>
        {effectiveView.type === 'dashboard' && (
          <Dashboard onSelectProgram={(id) => setView({ type: 'split-selector', data: { programId: id } })} />
        )}
        {effectiveView.type === 'exercises' && <ExerciseLibrary />}
        {effectiveView.type === 'nutrition' && <NutritionHub />}
        {effectiveView.type === 'profile' && (
          <ProfileView onNavigate={(view) => setView(view)} />
        )}
      </div>

      {/* 3. Split Selector Overlay */}
      {effectiveView.type === 'split-selector' && (
        <div className="fixed inset-0 z-50 bg-hayl-bg p-6 pt-10 overflow-y-auto animate-in slide-in-from-bottom duration-500">
          <SplitSelector 
            programId={effectiveView.data.programId} 
            onSelect={handlePlanSelection}
            onCancel={() => setView({ type: 'dashboard' })}
          />
        </div>
      )}

      {/* 4. Plan Guide View (NEW) */}
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

      {/* 6. Global Navigation Bar */}
      <GlobalNav 
        currentView={currentActiveTab} 
        onViewChange={(newView: TopLevelView) => setView({ type: newView })}
        isHidden={isGlobalNavHidden}
      />
      </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;

