import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id, Doc } from "../../../../../convex/_generated/dataModel";
import { Page } from "../ui/Page";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import type { NavigationState } from "../../types/navigation";

interface ProgramDetailProps {
  programId: string;
  onNavigate: (newState: NavigationState) => void;
  onBack: () => void;
}

export function ProgramDetail({ programId, onNavigate, onBack }: ProgramDetailProps) {
  const program = useQuery(api.programs.listAll)?.find((p: Doc<"programs">) => p._id === programId);
  const plans = useQuery(api.programs.getDerivedPlans, { programId: programId as Id<"programs"> });

  if (!program || !plans) {
    return <Page><Skeleton className="h-64 w-full" /></Page>;
  }

  return (
    <Page className="pb-32 pt-4 animate-in slide-in-from-right duration-500">
      <div className="mb-8">
        <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={onBack}>
          ← BACK TO LAB
        </Button>
      </div>

      <header className="mb-12">
        <div className="inline-block px-3 py-1 mb-4 text-xs font-mono border border-hayl-text rounded-full uppercase tracking-widest">
            {program.difficulty} Level
        </div>
        <h1 className="text-6xl font-heading font-black italic tracking-tighter uppercase leading-none mb-4">{program.title}</h1>
        <p className="text-lg font-sans text-hayl-muted max-w-xl">
            {program.difficulty.toUpperCase()} • {program.splitType.toUpperCase()} SPLIT
        </p>
      </header>

      <section className="space-y-8">
        <h2 className="text-2xl font-heading font-bold uppercase italic border-b border-hayl-border pb-2">Select Variant</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan: Doc<"derivedPlans">) => (
            <div 
              key={plan._id}
              className="p-6 border border-hayl-border rounded-xl hover:border-hayl-text cursor-pointer transition-all bg-hayl-surface"
              onClick={() => onNavigate({ 
                  type: 'programs', 
                  view: 'detail',
                  programId: programId, 
                  planId: plan._id 
              })}
            >
              <h3 className="text-xl font-heading font-bold uppercase mb-2">{plan.variant.splitFreq}</h3>
              <div className="flex gap-2 text-xs font-mono text-hayl-muted uppercase">
                 <span>{plan.variant.durationMinutes} Min</span>
                 <span>•</span>
                 <span>{plan.days.length} Days/Week</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}
