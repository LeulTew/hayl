import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { Page } from '../ui/Page';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatBlock } from '../ui/StatBlock';
import { computeSessionKpis } from '../../lib/sessionMetrics';
import { ArrowLeft, Clock, Calendar, ChevronDown } from 'lucide-react';

interface SessionDetailProps {
  sessionId: string;
  onBack: () => void;
}

export function SessionDetail({ sessionId, onBack }: SessionDetailProps) {
  const session = useLiveQuery(() => db.sessions.where('sessionId').equals(sessionId).first());

  // Optimization: Only fetch relevant exercises
  const exerciseIds = session ? [...new Set(session.logs.map(l => l.exerciseId))] : [];
  
  const relevantExercises = useQuery(
    api.exercises.getExercisesByIds, 
    session ? { ids: exerciseIds as Id<'exercises'>[] } : "skip"
  );
  
  if (!session) return <Page><div className="animate-pulse">Loading Record...</div></Page>;

  const kpis = session.kpis ?? computeSessionKpis(session.logs, session.startTime, session.endTime);

  const formatDate = (ts: number) => new Intl.DateTimeFormat('en-US', { 
    dateStyle: 'full', timeStyle: 'short' 
  }).format(new Date(ts));

  const formatDuration = (start: number, end?: number) => {
    if (!end) return '--';
    const minutes = Math.round((end - start) / 60000);
    return `${minutes} min`;
  };

    // Group logs by exercise for display
  const exerciseLogs = exerciseIds.map(id => {
      const exercise = relevantExercises?.[id as string];
      const logs = session.logs.filter(l => l.exerciseId === id).sort((a,b) => a.setIndex - b.setIndex);
      const averageReps = logs.length > 0 ? logs.reduce((acc, log) => acc + log.reps, 0) / logs.length : 0;
      const averageWeight = logs.length > 0 ? logs.reduce((acc, log) => acc + (log.weight || 0), 0) / logs.length : 0;
      return {
          id,
          name: exercise?.name || 'Unknown Exercise',
        logs,
        averageReps,
        averageWeight,
      };
  });

  return (
    <Page>
      <header className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
        </Button>
        <div className="flex-1">
            <p className="text-[10px] font-heading font-bold text-hayl-muted uppercase tracking-widest mb-1">
                SESSION RECORD ID: {sessionId.slice(0,8)}
            </p>
            <h1 className="font-heading text-3xl font-bold uppercase leading-none">
            WORKOUT SESSION · DAY {session.currentDayIndex + 1}
            </h1>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <Card className="p-4 flex flex-col justify-between">
            <Calendar className="text-hayl-accent mb-2" size={20} />
            <div>
                <p className="text-[10px] font-heading font-bold text-hayl-muted uppercase">DATE</p>
                <p className="font-mono text-xs font-bold">{formatDate(session.startTime)}</p>
            </div>
         </Card>
         <Card className="p-4 flex flex-col justify-between">
            <Clock className="text-hayl-accent mb-2" size={20} />
            <div>
                <p className="text-[10px] font-heading font-bold text-hayl-muted uppercase">DURATION</p>
                <p className="font-mono text-xl font-bold">{formatDuration(session.startTime, session.endTime)}</p>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <StatBlock label="Sets" value={kpis.totalSets} size="sm" />
        </Card>
        <Card className="p-4">
          <StatBlock label="Volume" value={Math.round(kpis.totalVolumeKg)} unit="kg" size="sm" />
        </Card>
        <Card className="p-4">
          <StatBlock label="Avg Reps" value={kpis.avgRepsPerSet.toFixed(1)} unit="/set" size="sm" />
        </Card>
        <Card className="p-4">
          <StatBlock label="Avg Weight" value={kpis.avgWeightKg.toFixed(1)} unit="kg" size="sm" />
        </Card>
      </div>

      <div className="space-y-6">
        <SectionHeader title="PERFORMANCE LOG" subtitle="EXERCISE BREAKDOWN" size="sm" />
        
        {exerciseLogs.map((ex) => (
            <Card key={ex.id} className="p-0 overflow-hidden">
              <details className="group">
                <summary className="list-none cursor-pointer px-5 py-4 flex items-center justify-between border-b border-hayl-border">
                  <div>
                    <h3 className="font-heading text-xl font-bold uppercase text-hayl-text">
                      {ex.name}
                    </h3>
                    <p className="text-[10px] font-mono text-hayl-muted uppercase">
                      {ex.logs.length} sets · {ex.averageReps.toFixed(1)} avg reps · {ex.averageWeight.toFixed(1)} avg kg
                    </p>
                  </div>
                  <ChevronDown size={18} className="text-hayl-muted group-open:rotate-180 transition-transform" />
                </summary>

                <div className="p-4 space-y-2">
                  {ex.logs.map((log) => (
                    <div key={log.setId} className="flex justify-between items-center text-sm font-mono p-2 bg-hayl-bg/50 rounded-lg">
                      <span className="text-hayl-muted font-bold">SET {log.setIndex + 1}</span>
                      <div className="flex gap-4">
                        <span className="font-bold">{log.weight ?? '--'} <span className="text-[10px] text-hayl-muted font-heading">kg</span></span>
                        <span className="font-bold">{log.reps} <span className="text-[10px] text-hayl-muted font-heading">reps</span></span>
                        {typeof log.rpe === 'number' && (
                          <span className="font-bold">RPE {log.rpe}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </Card>
        ))}
      </div>
    </Page>
  );
}
