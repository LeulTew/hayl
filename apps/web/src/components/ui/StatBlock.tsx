
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatBlockProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number; // percentage
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatBlock({ label, value, unit, trend, className, size = 'md' }: StatBlockProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="font-heading font-medium uppercase tracking-widest text-hayl-muted text-[10px] mb-1 leading-none">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className={cn(
          "font-mono font-bold text-hayl-text leading-none tracking-tight",
          size === 'sm' && "text-xl",
          size === 'md' && "text-3xl", 
          size === 'lg' && "text-5xl",
        )}>
          {value}
        </span>
        {unit && (
          <span className="font-heading font-medium text-hayl-muted text-sm uppercase">
            {unit}
          </span>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-1 text-[10px] font-mono font-medium">
          <span className={cn(
            trend.direction === 'up' && "text-hayl-success",
            trend.direction === 'down' && "text-hayl-danger",
            trend.direction === 'neutral' && "text-hayl-muted",
          )}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
        </div>
      )}
    </div>
  );
}
