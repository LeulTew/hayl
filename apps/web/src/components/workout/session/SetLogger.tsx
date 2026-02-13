import { useRef, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Check, Dumbbell, Repeat } from 'lucide-react';

interface SetLoggerProps {
  currentSetIndex: number;
  totalSets: number;
  repsTarget: string;
  previousWeight?: number;
  onLog: (reps: number, weight?: number, rpe?: number) => void;
  logs: { weight?: number, reps: number }[];
}

export function SetLogger({ 
  currentSetIndex, 
  totalSets, 
  repsTarget, 
  previousWeight,
  onLog,
  logs 
}: SetLoggerProps) {
  const weightRef = useRef<HTMLInputElement>(null);
  const repsRef = useRef<HTMLInputElement>(null);

  // Auto-fill previous weight for convenience
  useEffect(() => {
      if (weightRef.current && previousWeight !== undefined && !weightRef.current.value) {
       weightRef.current.value = previousWeight.toString();
    }
  }, [currentSetIndex, previousWeight]);

  const handleLog = () => {
      const w = weightRef.current?.value ? parseFloat(weightRef.current.value) : undefined;
    const r = repsRef.current?.value ? parseInt(repsRef.current.value) : undefined;

      if (r !== undefined && !isNaN(r) && r > 0) {
         const safeWeight = w !== undefined && !isNaN(w) ? w : undefined;
         onLog(r, safeWeight);
      // Clear for next set (except weight which might persist via effect or manual)
      if (repsRef.current) repsRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Previous Completed Sets */}
      {logs.map((log, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-hayl-surface/50 border border-hayl-border/50 rounded-xl opacity-60">
           <span className="font-heading font-bold text-hayl-muted">SET {i + 1}</span>
           <div className="font-mono font-bold text-hayl-text flex gap-4">
              <span>{log.weight ?? '--'} <span className="text-[10px] text-hayl-muted">KG</span></span>
              <span>{log.reps} <span className="text-[10px] text-hayl-muted">REPS</span></span>
           </div>
           <Check size={16} className="text-hayl-success" />
        </div>
      ))}

      {/* Active Set Input */}
      {currentSetIndex < totalSets && (
        <Card className="p-6 border-hayl-accent shadow-lg bg-hayl-surface z-10 relative overflow-hidden animate-in slide-in-from-bottom-4">
           <div className="absolute top-0 left-0 bg-hayl-accent text-hayl-bg px-3 py-1 font-heading font-bold text-xs">
              CURRENT SET {currentSetIndex + 1} OF {totalSets}
           </div>
           
           <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                 <label className="flex items-center gap-2 text-[10px] font-heading font-bold text-hayl-muted uppercase mb-2">
                    <Dumbbell size={12}/> Weight (KG)
                 </label>
                 <Input 
                   ref={weightRef} 
                   type="number" 
                   placeholder={previousWeight?.toString() || "0"} 
                   className="text-3xl h-16"
                 />
              </div>
              <div>
                 <label className="flex items-center gap-2 text-[10px] font-heading font-bold text-hayl-muted uppercase mb-2">
                    <Repeat size={12}/> Reps (Target: {repsTarget})
                 </label>
                 <Input 
                   ref={repsRef} 
                   type="number" 
                   placeholder={repsTarget} 
                   className="text-3xl h-16"
                 />
              </div>
           </div>

           <Button size="lg" fullWidth className="mt-6" onClick={handleLog}>
              LOG SET & REST
           </Button>
        </Card>
      )}

      {/* Future Sets */}
      {Array.from({ length: totalSets - currentSetIndex - 1 }).map((_, i) => (
         <div key={i + currentSetIndex + 1} className="p-4 border border-dashed border-hayl-border rounded-xl text-center opacity-30">
            <span className="font-heading font-bold text-hayl-muted uppercase text-xs tracking-widest">
               SET {currentSetIndex + i + 2} PENDING
            </span>
         </div>
      ))}
    </div>
  );
}
