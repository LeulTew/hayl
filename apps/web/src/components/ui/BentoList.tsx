import React from 'react';

export interface BentoItem {
  id: string;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

interface BentoListProps {
  items: BentoItem[];
  onItemClick?: (id: string) => void;
  className?: string;
}

export function BentoList({ items, onItemClick, className = '' }: BentoListProps) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {items.map((item) => (
        <button 
          key={item.id} 
          onClick={() => onItemClick?.(item.id)}
          className="
            group
            w-full text-left
            p-6 
            bg-hayl-surface 
            rounded-2xl
            border border-hayl-border
            hover:border-hayl-text
            hover:bg-hayl-bg
            transition-all duration-300 cursor-pointer
            flex justify-between items-center
          "
        >
          <div className="flex flex-col">
            <h3 className="font-heading font-bold text-hayl-text text-2xl tracking-tight leading-none transition-colors">
                {item.title}
            </h3>
            {item.subtitle && (
                <p className="font-sans text-xs text-hayl-muted mt-2 font-bold uppercase tracking-widest">
                    {item.subtitle}
                </p>
            )}
          </div>
          
          <div className="text-hayl-accent transition-all font-heading font-bold text-xl group-hover:translate-x-1">
            {item.rightElement || <span>→</span>}
          </div>
        </button>
      ))}
    </div>

  );
}
