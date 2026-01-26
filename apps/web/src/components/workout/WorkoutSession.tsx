import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useActiveSession } from "../../hooks/useActiveSession";
import { RestTimerOverlay } from "./RestTimerOverlay";

interface WorkoutItem {
    exerciseId: string;
    sets: number;
    reps: string;
    restSeconds: number;
    phase: string;
}

interface WorkoutDay {
    title: string;
    phases: Array<{
        name: string;
        items: Array<{
            exerciseId: string;
            sets: number;
            reps: string;
            restSeconds: number;
        }>;
    }>;
}

interface WorkoutPlan {
    _id: string;
    days: WorkoutDay[];
}

interface WorkoutSessionProps {
    planId: string;
}

export function WorkoutSession({ planId }: WorkoutSessionProps) {
    const { activeSession, logSet, nextExercise, finishSession, discardSession } = useActiveSession();
    // @ts-expect-error - Dynamic dispatch to bypass missing generated imports
    const plan = useQuery(api.programs.getPlan, { planId }) as WorkoutPlan | undefined;
    const [restTimer, setRestTimer] = useState<{ active: boolean; seconds: number }>({ active: false, seconds: 0 });

    // 1. Loading States
    if (!plan || !activeSession) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hayl-accent" />
                <p className="font-heading font-bold text-hayl-muted uppercase tracking-widest animate-pulse">Initializing Session...</p>
            </div>
        );
    }

    const currentDay = plan.days[activeSession.currentDayIndex];
    if (!currentDay) {
        return <div>Invalid Day Index</div>;
    }

    // Flatten exercises for linear navigation
    const allExercises = currentDay.phases.flatMap(
        (p: { name: string; items: { exerciseId: string; sets: number; reps: string; restSeconds: number }[] }) => p.items.map(
            (i: { exerciseId: string; sets: number; reps: string; restSeconds: number }) => ({ ...i, phase: p.name })
        )
    ) as WorkoutItem[];
    const currentExercise = allExercises[activeSession.currentExerciseIndex];

    if (!currentExercise) {
        // Workout Finished
        return (
             <div className="bg-hayl-surface p-8 rounded-2xl text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold">✓</span>
                </div>
                <h2 className="text-3xl font-heading font-bold uppercase italic">Workout Complete!</h2>
                <p className="text-hayl-muted font-sans max-w-xs mx-auto">Great work. Your logs are saved locally and will sync when online.</p>
                <button 
                    onClick={finishSession}
                    className="w-full bg-hayl-text text-hayl-bg py-4 rounded-xl font-heading font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                    Finish Session
                </button>
            </div>
        );
    }

    const handleLogSet = (weight: number, reps: number) => {
        logSet(currentExercise.exerciseId, weight, reps);
        
        // Trigger Rest Timer
        if (currentExercise.restSeconds > 0) {
            setRestTimer({ active: true, seconds: currentExercise.restSeconds });
        }
    };

    return (
        <div className="flex flex-col min-h-[80vh] pb-24">
            {/* Header */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                   <h2 className="text-xs font-bold font-heading text-hayl-accent uppercase tracking-widest mb-1">
                     {currentDay.title} • {currentExercise.phase}
                   </h2>
                   <h1 className="text-3xl font-heading font-bold uppercase italic tracking-tighter leading-none">
                     Active Session
                   </h1>
                </div>
                <button 
                    onClick={discardSession}
                    className="text-[10px] font-bold font-heading text-red-500/70 uppercase tracking-tighter hover:text-red-500 transition-colors"
                >
                    Discard
                </button>
            </div>

            {/* Exercise Visual / Info (Placeholder for now) */}
            <div className="mb-8 p-4 bg-hayl-surface rounded-xl border border-hayl-border aspect-video flex flex-col items-center justify-center text-hayl-muted relative overflow-hidden">
                <div className="absolute top-4 left-4 z-10">
                   <div className="bg-hayl-accent text-hayl-bg px-2 py-1 text-[10px] font-bold rounded-sm uppercase">Exercise {activeSession.currentExerciseIndex + 1}/{allExercises.length}</div>
                </div>
                <p className="font-heading font-bold text-lg text-hayl-text uppercase">{currentExercise.exerciseId}</p>
                <p className="text-xs uppercase font-bold tracking-widest">Visual Asset Loading...</p>
            </div>

            {/* Set Tracking List */}
            <div className="space-y-4 mb-8">
                {Array.from({ length: currentExercise.sets }).map((_, i) => {
                     const isCompleted = i < activeSession.currentSetIndex;
                     const isCurrent = i === activeSession.currentSetIndex;

                     return (
                         <div 
                            key={i} 
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${isCurrent ? 'bg-hayl-surface border-hayl-accent shadow-glow' : 'bg-transparent border-hayl-border opacity-50'}`}
                         >
                            <span className="w-8 font-heading font-bold text-lg">{i + 1}</span>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                               <div className="relative">
                                  <input type="number" placeholder="kg" className="w-full bg-hayl-bg border border-hayl-border rounded p-2 text-sm font-bold" />
                               </div>
                               <div className="relative">
                                  <input type="number" placeholder={currentExercise.reps} className="w-full bg-hayl-bg border border-hayl-border rounded p-2 text-sm font-bold" />
                               </div>
                            </div>
                            <button 
                                disabled={!isCurrent}
                                onClick={() => handleLogSet(0, 0)} // Real data would come from refs/state
                                className={`w-12 h-12 rounded-full font-bold flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-hayl-text text-hayl-bg' : 'bg-hayl-muted/20 text-hayl-muted'}`}
                            >
                                {isCompleted ? '✓' : 'GO'}
                            </button>
                         </div>
                     )
                })}
            </div>

            {/* Navigation */}
            {activeSession.currentSetIndex >= currentExercise.sets && (
                <button 
                    onClick={nextExercise}
                    className="w-full bg-hayl-accent text-hayl-bg py-4 rounded-xl font-heading font-bold uppercase tracking-widest shadow-glow animate-bounce"
                >
                    Next Exercise →
                </button>
            )}

            {/* Overlay */}
            {restTimer.active && (
                <RestTimerOverlay 
                    seconds={restTimer.seconds} 
                    onComplete={() => setRestTimer({ active: false, seconds: 0 })} 
                    onSkip={() => setRestTimer({ active: false, seconds: 0 })}
                />
            )}
        </div>
    );
}
