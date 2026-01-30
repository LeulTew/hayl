import { useQuery } from "convex/react";
// Convex imports (resolved via placeholders)
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

// Fallback types for local development (Convex codegen usually provides these)
interface Plan {
    _id: string;
    variant: {
        difficulty: 'amateur' | 'intermediate' | 'elite';
        splitFreq: string;
        durationMinutes: number;
        tags?: string[];
    };
}

interface SplitSelectorProps {
  programId: string;
  onSelect: (planId: string, dayIndex: number) => void;
  onCancel: () => void;
}

export function SplitSelector({ programId, onSelect, onCancel }: SplitSelectorProps) {
  const plans = useQuery(api.programs.getDerivedPlans, { programId: programId as Id<'programs'> }) as Plan[] | undefined;

  if (plans === undefined) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hayl-accent" />
      </div>
    );
  }

  return (
    <div className="bg-hayl-surface p-8 rounded-none neo-border-thick neo-shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div className="mb-8">
        <h2 className="text-3xl font-heading font-bold uppercase italic tracking-tighter leading-none mb-1">Select Your Split</h2>
        <p className="text-hayl-muted text-sm font-sans font-bold uppercase tracking-tight">Choose the frequency that fits your performance goals.</p>
      </div>

      <div className="space-y-6 mb-10">
        {plans.map((plan: Plan) => (
          <button
            key={plan._id}
            onClick={() => onSelect(plan._id, 0)} // Default to Day 1
            className="w-full bg-hayl-bg neo-border p-5 rounded-none text-left hover:translate-x-1 hover:translate-y-1 neo-shadow hover:shadow-none transition-all group"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[11px] font-bold font-heading text-hayl-accent uppercase tracking-widest bg-hayl-accent/10 px-2">
                  {plan.variant.difficulty}
                </span>
                <h3 className="text-2xl font-heading font-bold uppercase italic group-hover:text-hayl-accent transition-colors mt-2">
                  {plan.variant.splitFreq} Frequency
                </h3>
              </div>
              <div className="text-right">
                <p className="text-3xl font-heading font-bold italic">~{plan.variant.durationMinutes}</p>
                <p className="text-[10px] text-hayl-muted uppercase font-bold tracking-tighter">MINUTES / SESSION</p>
              </div>
            </div>
            {plan.variant.tags && (
              <div className="flex gap-2 mt-4">
                {plan.variant.tags.map((tag: string) => (
                  <span key={tag} className="text-[10px] neo-border bg-hayl-surface text-hayl-text px-2 py-0.5 uppercase font-bold tracking-tighter">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>


      <button 
        onClick={onCancel}
        className="w-full py-4 text-base font-heading font-bold text-hayl-muted hover:text-hayl-text uppercase tracking-widest transition-colors neo-border border-dashed hover:border-solid"
      >
        Return to Dashboard
      </button>
    </div>
  );
}
