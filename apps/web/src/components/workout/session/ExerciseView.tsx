import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../convex/_generated/dataModel';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Skeleton } from '../../ui/Skeleton';
import { ChevronDown, Info } from 'lucide-react';
import { ExerciseMediaPlayer } from '../ExerciseMediaPlayer';

interface ExerciseViewProps {
  exerciseId: Id<'exercises'>;
  totalSets: number;
  repsTarget: string;
  restSeconds: number;
  exerciseIndex: number;
  totalExercises: number;
}

export function ExerciseView({ 
  exerciseId, 
  totalSets, 
  repsTarget, 
  restSeconds,
  exerciseIndex,
  totalExercises 
}: ExerciseViewProps) {
  
  const exercise = useQuery(api.exercises.getExercise, { id: exerciseId });

  if (!exercise) return <Skeleton className="h-64 w-full" />;

  return (
    <Card className="mb-6 overflow-hidden">
      {/* Media Area (Placeholder) */}
         <div className="relative border-b border-hayl-border">
            <ExerciseMediaPlayer media={exercise.mediaResolved} />
        
        {/* Progress Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
           <Badge variant="outline" className="bg-hayl-surface/80">EX {exerciseIndex + 1}/{totalExercises}</Badge>
           <Badge variant="muted" className="bg-hayl-surface/80">{exercise.muscleGroup}</Badge>
        </div>
      </div>

      <div className="p-6">
        <h2 className="font-heading text-4xl font-bold uppercase mb-2 leading-none">{exercise.name}</h2>
        
        {/* Targets */}
        <div className="flex gap-4 mb-6">
           <div className="flex flex-col">
              <span className="text-[10px] font-heading font-bold text-hayl-muted uppercase tracking-widest">TARGET</span>
              <span className="font-mono text-xl font-bold">{totalSets} x {repsTarget}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-heading font-bold text-hayl-muted uppercase tracking-widest">REST</span>
              <span className="font-mono text-xl font-bold">{restSeconds}s</span>
           </div>
        </div>

        {/* Instructions Collapsible */}
        <details className="group">
           <summary className="flex items-center gap-2 cursor-pointer text-xs font-heading font-bold uppercase tracking-widest text-hayl-muted hover:text-hayl-text transition-colors list-none select-none">
              <Info size={14} /> TACTICAL BRIEFING <ChevronDown size={14} className="group-open:rotate-180 transition-transform"/>
           </summary>
           <div className="pt-3 pb-1">
              <p className="text-sm text-hayl-muted leading-relaxed font-sans">
                 {exercise.instructions}
              </p>
           </div>
        </details>
      </div>
    </Card>
  );
}
