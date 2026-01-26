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
  // @ts-expect-error - Dynamic dispatch to bypass missing generated imports
  const plans = useQuery(api.programs.getDerivedPlans, { programId }) as Plan[] | undefined;

  if (plans === undefined) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hayl-accent" />
      </div>
    );
  }

  return (
    <div className="bg-hayl-surface p-6 rounded-xl shadow-premium animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold uppercase tracking-tight">Select Your Split</h2>
        <p className="text-hayl-muted text-sm font-sans">Choose the frequency that fits your schedule.</p>
      </div>

      <div className="space-y-4 mb-8">
        {plans.map((plan: Plan) => (
          <button
            key={plan._id}
            onClick={() => onSelect(plan._id, 0)} // Default to Day 1
            className="w-full bg-hayl-bg border border-hayl-border p-4 rounded-lg text-left hover:border-hayl-accent transition-all group"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold font-heading text-hayl-accent uppercase tracking-widest">
                  {plan.variant.difficulty}
                </span>
                <h3 className="text-xl font-heading font-bold uppercase group-hover:text-hayl-accent transition-colors">
                  {plan.variant.splitFreq} Frequency
                </h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-heading font-bold">~{plan.variant.durationMinutes}</p>
                <p className="text-[10px] text-hayl-muted uppercase font-bold tracking-tighter">MINUTES</p>
              </div>
            </div>
            {plan.variant.tags && (
              <div className="flex gap-2 mt-2">
                {plan.variant.tags.map((tag: string) => (
                  <span key={tag} className="text-[10px] bg-hayl-muted/10 text-hayl-muted px-2 py-0.5 rounded uppercase font-bold">
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
        className="w-full py-3 text-sm font-heading font-bold text-hayl-muted hover:text-hayl-text uppercase tracking-widest transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
