import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PageProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  fullWidth?: boolean;
}

export const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ children, className, fullWidth = false, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          "min-h-screen w-full animate-fade-in", 
          // Mobile: standard padding + safe area fix
          "px-4 pb-32 pt-6",
          // Desktop: Centered, max width
          fullWidth ? "max-w-none" : "max-w-3xl mx-auto",
          className
        )}
        {...props}
      >
        {children}
      </main>
    );
  }
);
Page.displayName = "Page";
