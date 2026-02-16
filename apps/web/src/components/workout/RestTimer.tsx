import { useState, useEffect } from "react";

interface RestTimerProps {
    seconds: number;
    onComplete: () => void;
    onSkip: () => void;
    onAdd15?: () => void;
}

export function RestTimer({ seconds, onComplete, onSkip, onAdd15 }: RestTimerProps) {
    const [timeLeft, setTimeLeft] = useState(seconds);

    // Sync local timer if parent updates duration (e.g. +15s)
    useEffect(() => {
        setTimeLeft(seconds);
    }, [seconds]);
    const safeSeconds = seconds > 0 ? seconds : 1;
    const progress = (timeLeft / safeSeconds) * 100;
    
    // Circular Progress Constants
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    useEffect(() => {
        if (timeLeft <= 0) {
            // HAPTIC FEEDBACK (Standard Web API)
            if ("vibrate" in navigator) {
                navigator.vibrate([200, 100, 200]);
            }
            onComplete();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-hayl-bg animate-in fade-in duration-300">
            {/* Background Decorative Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(var(--hayl-text) 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
            />

            <div className="relative text-center space-y-16 flex flex-col items-center max-w-sm w-full p-12 rounded-[3rem] border border-hayl-border bg-hayl-surface shadow-premium">
                <div className="space-y-4">
                    <p className="font-heading font-black italic text-hayl-text uppercase tracking-[0.4em] text-xs">Rest Interval</p>
                    <h2 className="text-[10px] font-sans font-bold text-hayl-muted uppercase tracking-[0.3em] opacity-60">Addis Performance Engine</h2>
                </div>
                
                {/* Visual Timer */}
                <div className="relative w-72 h-72 flex items-center justify-center bg-hayl-bg rounded-full border border-hayl-border">
                    <svg className="absolute w-full h-full -rotate-90">
                        <circle
                            cx="144"
                            cy="144"
                            r={radius + 15}
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-hayl-border"
                        />
                        <circle
                            cx="144"
                            cy="144"
                            r={radius + 15}
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={circumference}
                            style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s linear' }}
                            className="text-hayl-text"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="text-8xl font-heading font-black tabular-nums italic tracking-tighter lowercase">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <button 
                        onClick={() => {
                            if (onAdd15) onAdd15();
                            else setTimeLeft(prev => prev + 15);
                        }}
                        className="py-5 bg-hayl-bg rounded-2xl border border-hayl-border font-heading font-bold uppercase tracking-[0.2em] hover:border-hayl-text transition-all text-xs italic"
                    >
                        +15s
                    </button>
                    
                    <button 
                        onClick={onSkip}
                        className="py-6 bg-hayl-text text-hayl-bg rounded-full font-heading font-bold uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all text-xl italic"
                    >
                        Skip Rest →
                    </button>
                </div>
            </div>
        </div>
    );
}
