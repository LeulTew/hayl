import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'underline' | 'pill' | 'editorial';
  fullWidth?: boolean;
}

export function Tabs({ items, activeId, onChange, className, variant = 'editorial', fullWidth = false }: TabsProps) {
  
  return (
    <div className={cn("relative flex items-center overflow-x-auto no-scrollbar", className)}>
      {/* Editorial Variant: Clean text, bottom border on active, uppercase Teko font */}
      {(variant === 'editorial' || variant === 'underline') && (
        <div className={cn("flex space-x-1 border-b border-hayl-border w-full", fullWidth && "justify-between")}>
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={cn(
                  "relative pb-3 px-4 text-lg font-heading font-medium tracking-wide uppercase transition-colors whitespace-nowrap",
                  isActive ? "text-hayl-text" : "text-hayl-muted hover:text-hayl-text/70",
                  fullWidth && "flex-1 text-center"
                )}
              >
                {item.label}
                {item.badge && (
                  <span className="ml-2 text-[10px] bg-hayl-surface border border-hayl-border rounded-full px-1.5 py-0.5 align-middle text-hayl-muted font-mono">
                    {item.badge}
                  </span>
                )}
                
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-hayl-accent"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Pill Variant: Classic segmented control */}
      {variant === 'pill' && (
        <div className="flex p-1 bg-hayl-surface/50 rounded-xl border border-hayl-border w-full">
            {items.map((item) => {
                const isActive = activeId === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onChange(item.id)}
                        className={cn(
                            "relative flex-1 py-1.5 px-3 text-sm font-heading font-bold uppercase transition-colors rounded-lg z-10",
                            isActive ? "text-hayl-bg" : "text-hayl-muted hover:text-hayl-text"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTabPill"
                                className="absolute inset-0 bg-hayl-text rounded-lg -z-10 shadow-none"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{item.label}</span>
                    </button>
                )
            })}
        </div>
      )}
    </div>
  );
}
