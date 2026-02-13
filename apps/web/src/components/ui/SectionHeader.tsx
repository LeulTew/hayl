import type { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SectionHeader({ title, subtitle, action, className, size = 'md' }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between font-heading", className)}>
      <div>
        <h2 className={cn(
          "font-black tracking-tight leading-none uppercase text-hayl-text",
          size === 'sm' && "text-xl",
          size === 'md' && "text-3xl",
          size === 'lg' && "text-5xl",
        )}>
          {title}
        </h2>
        {subtitle && (
          <p className="font-heading font-medium text-hayl-muted text-xs tracking-widest uppercase mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="ml-4 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
