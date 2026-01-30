import { useState, useEffect } from "react";

interface RestTimerProps {
    seconds: number;
    onComplete: () => void;
    onSkip: () => void;
}

export function RestTimer({ seconds, onComplete, onSkip }: RestTimerProps) {
    const [timeLeft, setTimeLeft] = useState(seconds);
    const progress = (timeLeft / seconds) * 100;
    
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-hayl-bg/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="text-center space-y-8 flex flex-col items-center">
                <p className="font-heading font-bold text-hayl-muted uppercase tracking-[0.2em] animate-pulse">Rest Interval</p>
                
                {/* Circular Progress */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                        <circle
                            cx="128"
                            cy="128"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-hayl-surface"
                        />
                        <circle
                            cx="128"
                            cy="128"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={circumference}
                            style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s linear' }}
                            className="text-hayl-accent"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="text-7xl font-heading font-bold tabular-nums">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                </div>

                <div className="space-y-4 w-full px-12">
                   <button 
                        onClick={() => setTimeLeft(prev => prev + 30)}
                        className="text-xs font-bold font-heading text-hayl-muted uppercase tracking-widest hover:text-hayl-text border border-hayl-border px-4 py-2 rounded-full transition-colors"
                    >
                        +30 Seconds
                    </button>
                    
                    <button 
                        onClick={onSkip}
                        className="w-full py-4 rounded-xl font-heading font-bold uppercase tracking-[0.2em] text-hayl-text border-2 border-hayl-text hover:bg-hayl-text hover:text-hayl-bg transition-all"
                    >
                        Skip Rest
                    </button>
                </div>
            </div>
        </div>
    );
}
