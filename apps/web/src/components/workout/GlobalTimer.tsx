import { useState, useEffect, memo } from 'react';

interface GlobalTimerProps {
  /** Session start time in milliseconds (Date.now()) */
  startTime: number;
  /** Whether the timer is currently active */
  isActive?: boolean;
}

/**
 * GlobalTimer
 * 
 * Displays the total elapsed session duration.
 * Uses requestAnimationFrame for smooth updates without excessive re-renders.
 * 
 * @example
 * <GlobalTimer startTime={session.startTime} isActive={true} />
 */
function GlobalTimerComponent({ startTime, isActive = true }: GlobalTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    // Initial update
    setElapsed(Date.now() - startTime);

    const timer = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isActive]);

  // Format elapsed time
  const hours = Math.floor(elapsed / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  const formatTime = () => {
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
      <time 
        className="font-heading font-bold text-lg tabular-nums tracking-tight"
        dateTime={`PT${hours}H${minutes}M${seconds}S`}
        aria-label={`Session duration: ${formatTime()}`}
      >
        {formatTime()}
      </time>
    </div>
  );
}

/**
 * Memoized GlobalTimer to prevent unnecessary re-renders from parent components.
 * Only re-renders when startTime or isActive changes.
 */
export const GlobalTimer = memo(GlobalTimerComponent);
