import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  variant?: 'accent' | 'success';
}

export function ProgressBar({ value, max = 100, className, variant = 'accent' }: ProgressBarProps) {
  const safeMax = max <= 0 ? 1 : max;
  const percentage = Math.min(Math.max((value / safeMax) * 100, 0), 100);

  return (
    <div className={cn("h-1.5 w-full bg-hayl-border rounded-full overflow-hidden", className)}>
      <div
        className={cn(
          "h-full transition-all duration-300 ease-out rounded-full",
          variant === 'accent' && "bg-hayl-accent",
          variant === 'success' && "bg-hayl-success"
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
