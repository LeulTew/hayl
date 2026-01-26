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
    <div className={`flex flex-col gap-2 ${className}`}>
      {items.map((item) => (
        <div 
          key={item.id} 
          onClick={() => onItemClick?.(item.id)}
          className="
            group
            p-5 
            bg-hayl-surface 
            rounded-lg 
            shadow-subtle hover:shadow-md 
            transition-all duration-fast cursor-pointer
            flex justify-between items-center
            border border-transparent hover:border-hayl-border
          "
        >
          <div className="flex flex-col">
            <h3 className="font-heading font-bold text-hayl-text text-xl uppercase tracking-wide leading-none group-hover:text-hayl-accent transition-colors">
                {item.title}
            </h3>
            {item.subtitle && (
                <p className="font-sans text-sm text-hayl-muted mt-1 font-medium">
                    {item.subtitle}
                </p>
            )}
          </div>
          
          <div className="text-hayl-accent transition-opacity font-heading font-bold text-lg">
            {item.rightElement || <span className="text-2xl text-hayl-muted font-light group-hover:text-hayl-accent">→</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
