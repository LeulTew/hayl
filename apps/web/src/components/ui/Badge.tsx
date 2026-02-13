import { type HTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'outline' | 'accent' | 'success' | 'danger' | 'muted';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'outline', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase font-mono tracking-wider transition-colors",
          
          variant === 'outline' && "border-hayl-border text-hayl-text",
          variant === 'accent' && "border-transparent bg-hayl-accent text-white",
          variant === 'success' && "border-transparent bg-hayl-success text-white",
          variant === 'danger' && "border-transparent bg-hayl-danger text-white",
          variant === 'muted' && "border-transparent bg-hayl-muted/20 text-hayl-muted",
          
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
