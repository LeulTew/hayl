import { Monitor, Moon, Sun } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  value: Theme;
  onChange: (theme: Theme) => void;
  className?: string;
}

export function ThemeToggle({ value, onChange, className }: ThemeToggleProps) {
  return (
    <div className={cn("inline-flex bg-hayl-surface border border-hayl-border rounded-full p-1", className)}>
      <button
        type="button"
        onClick={() => onChange('light')}
        className={cn(
          "p-2 rounded-full transition-all text-hayl-muted hover:text-hayl-accent hover:bg-hayl-accent/10",
          value === 'light' && "bg-hayl-text text-hayl-bg shadow-sm"
        )}
        aria-label="Light Mode"
      >
        <Sun size={18} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={() => onChange('system')}
        className={cn(
          "p-2 rounded-full transition-all text-hayl-muted hover:text-hayl-accent hover:bg-hayl-accent/10",
          value === 'system' && "bg-hayl-text text-hayl-bg shadow-sm"
        )}
        aria-label="System Theme"
      >
        <Monitor size={18} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={() => onChange('dark')}
        className={cn(
          "p-2 rounded-full transition-all text-hayl-muted hover:text-hayl-accent hover:bg-hayl-accent/10",
          value === 'dark' && "bg-hayl-text text-hayl-bg shadow-sm"
        )}
        aria-label="Dark Mode"
      >
        <Moon size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
