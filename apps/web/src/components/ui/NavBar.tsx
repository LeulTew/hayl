import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { LucideIcon } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface NavBarProps {
  items: NavItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function NavBar({ items, activeId, onChange, className }: NavBarProps) {
  const isIosLiquidGlass =
    typeof window !== 'undefined' &&
    /iPhone/i.test(window.navigator.userAgent || '') &&
    typeof CSS !== 'undefined' &&
    (CSS.supports('backdrop-filter', 'blur(16px)') ||
      CSS.supports('-webkit-backdrop-filter', 'blur(16px)'));
  
  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t md:hidden pb-safe",
        isIosLiquidGlass
          ? "bg-hayl-bg/70 backdrop-blur-2xl border-hayl-border/70"
          : "bg-hayl-bg border-hayl-border",
        className
      )}>
        <div className="flex justify-around items-center h-16 px-2">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                className="relative flex flex-col items-center justify-center w-full h-full space-y-1"
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  className={cn(
                    "p-1.5 rounded-xl transition-colors",
                    isActive ? "text-hayl-accent" : "text-hayl-muted"
                  )}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                
                <span className={cn(
                  "text-[10px] font-heading font-bold uppercase tracking-widest transition-colors",
                  isActive ? "text-hayl-text" : "text-hayl-muted/60"
                )}>
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="mobileNavActive"
                    className="absolute top-0 w-8 h-1 bg-hayl-accent rounded-b-full shadow-[0_0_10px_rgba(255,77,0,0.3)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex fixed top-0 left-0 bottom-0 z-50 w-64 bg-hayl-surface border-r border-hayl-border flex-col p-6",
        className
      )}>
        {/* Logo Area */}
        <div className="mb-12 flex items-center gap-4">
            <img src="/logo.png" alt="HAYL Logo" className="w-12 h-12 rounded-xl object-contain" />
            <div>
              <h1 className="font-display text-5xl text-hayl-text leading-none tracking-tight">HAYL</h1>
              <p className="font-heading text-xs text-hayl-accent tracking-[0.2em] font-bold mt-1">PERFORMANCE ENGINE</p>
            </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 space-y-2">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                className={cn(
                  "flex items-center w-full px-4 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-hayl-bg border-l-4 border-hayl-accent text-hayl-text shadow-sm" 
                    : "text-hayl-muted hover:bg-hayl-bg/50 hover:text-hayl-text"
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <Icon 
                  size={20} 
                  strokeWidth={2}
                  className={cn(
                    "mr-3 transition-colors",
                    isActive ? "text-hayl-accent" : "text-hayl-muted group-hover:text-hayl-text"
                  )} 
                />
                <span className="font-heading font-medium text-lg tracking-wide uppercase pt-0.5">
                  {item.label}
                </span>
                
                {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-hayl-accent" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Footer / User */}
        <div className="mt-auto border-t border-hayl-border pt-6">
            <div className="flex items-center gap-3 bg-hayl-bg p-3 rounded-xl border border-hayl-border">
                <div className="w-8 h-8 rounded-lg bg-hayl-text text-hayl-bg flex items-center justify-center font-heading font-bold text-lg">
              A
                </div>
                <div>
              <p className="font-heading text-sm font-bold leading-none text-hayl-text">Athlete</p>
              <p className="font-mono text-[10px] text-hayl-muted">HAYL USER</p>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
