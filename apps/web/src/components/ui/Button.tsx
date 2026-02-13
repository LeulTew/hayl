import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          // Base styles: Athletic, Caps, Geometric
          "inline-flex items-center justify-center rounded-xl font-heading font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hayl-accent disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          
          // Variants
          variant === 'primary' && "bg-hayl-accent text-white hover:bg-hayl-accent/90 border-2 border-transparent",
          variant === 'outline' && "bg-transparent border-2 border-hayl-text text-hayl-text hover:bg-hayl-text hover:text-hayl-bg",
          variant === 'ghost' && "bg-transparent text-hayl-muted hover:text-hayl-text hover:bg-hayl-surface",
          variant === 'danger' && "bg-hayl-danger text-white hover:bg-hayl-danger/90",

          // Sizes
          size === 'sm' && "h-9 px-4 text-lg", // Teko is condensed so text needs to be larger
          size === 'md' && "h-12 px-6 text-xl tracking-wide",
          size === 'lg' && "h-14 px-8 text-2xl tracking-widest",
          size === 'icon' && "h-10 w-10",

          // Width
          fullWidth && "w-full",
          
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
