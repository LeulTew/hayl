import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { Page } from '../ui/Page';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { StatBlock } from '../ui/StatBlock';
import { computeSessionKpis } from '../../lib/sessionMetrics';
import { useMemo } from 'react';

import { ArrowLeft, ArrowRight, Calendar, Clock, Dumbbell, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';

interface HistoryViewProps {
  onBack?: () => void;
  onSelectSession?: (sessionId: string) => void;
}

export function HistoryView({ onBack, onSelectSession }: HistoryViewProps) {
  const sessions = useLiveQuery(
    () => db.sessions.where('state').equals('completed').reverse().sortBy('endTime')
  );

  const sessionList = useMemo(
    () =>
      (sessions ?? [])
        .filter((session) => (session.logs?.length ?? 0) > 0)
        .sort((left, right) => (right.endTime ?? right.startTime) - (left.endTime ?? left.startTime)),
    [sessions],
  );
  const allExerciseIds = useMemo(
    () => [...new Set(sessionList.flatMap((session) => session.logs.map((log) => log.exerciseId)))],
    [sessionList],
  );
  const exerciseMap = useQuery(
    api.exercises.getExercisesByIds,
    allExerciseIds.length > 0 ? { ids: allExerciseIds as Id<'exercises'>[] } : 'skip'
  );

  const formatDate = (ts: number) => new Intl.DateTimeFormat('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric', weekday: 'short' 
  }).format(new Date(ts));

  const formatDuration = (start: number, end?: number) => {
    if (!end) return '-- min';
    const minutes = Math.round((end - start) / 60000);
    return `${minutes} min`;
  };

  const historyKpis = useMemo(
    () =>
      sessionList.reduce(
        (acc, session) => {
          const kpis = session.kpis ?? computeSessionKpis(session.logs, session.startTime, session.endTime);
          acc.totalSessions += 1;
          acc.totalSets += kpis.totalSets;
          acc.totalVolumeKg += kpis.totalVolumeKg;
          acc.totalDurationMinutes += kpis.durationMinutes;
          return acc;
        },
        { totalSessions: 0, totalSets: 0, totalVolumeKg: 0, totalDurationMinutes: 0 },
      ),
    [sessionList],
  );

  const averageSets = historyKpis.totalSessions > 0 ? Math.round(historyKpis.totalSets / historyKpis.totalSessions) : 0;
  const averageDuration = historyKpis.totalSessions > 0 ? Math.round(historyKpis.totalDurationMinutes / historyKpis.totalSessions) : 0;

  if (!sessions) {
    return (
      <Page>
         <SectionHeader title="LOGBOOK" subtitle="LOADING DATA..." />
         <div className="animate-pulse space-y-4 mt-8">
            <div className="h-24 bg-hayl-surface rounded-xl" />
            <div className="h-24 bg-hayl-surface rounded-xl" />
         </div>
      </Page>
    );
  }

  return (
    <Page>
      <header className="mb-8 flex items-center gap-4">
        {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft />
            </Button>
        )}
        <SectionHeader title="LOGBOOK" subtitle="COMPLETED SESSIONS" className="flex-1" />
      </header>

      {sessionList.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-hayl-border rounded-3xl">
            <p className="font-heading text-hayl-muted uppercase tracking-widest">No Logged Sessions</p>
            <Button variant="outline" className="mt-4" onClick={onBack}>RETURN TO BASE</Button>
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <StatBlock label="Sessions" value={historyKpis.totalSessions} size="sm" />
              </Card>
              <Card className="p-4">
                <StatBlock label="Total Sets" value={historyKpis.totalSets} size="sm" />
              </Card>
              <Card className="p-4">
                <StatBlock label="Avg Sets" value={averageSets} unit="/session" size="sm" />
              </Card>
              <Card className="p-4">
                <StatBlock label="Avg Duration" value={averageDuration} unit="min" size="sm" />
              </Card>
            </div>

            {sessionList.map((session) => {
                const kpis = session.kpis ?? computeSessionKpis(session.logs, session.startTime, session.endTime);
                const groupedLogs = [...new Set(session.logs.map((log) => log.exerciseId))].map((exerciseId) => {
                  const logs = session.logs
                    .filter((log) => log.exerciseId === exerciseId)
                    .sort((left, right) => left.setIndex - right.setIndex);
                  const averageReps = logs.length > 0 ? logs.reduce((acc, log) => acc + log.reps, 0) / logs.length : 0;
                  const averageWeight = logs.length > 0
                    ? logs.reduce((acc, log) => acc + (log.weight || 0), 0) / logs.length
                    : 0;
                  return {
                    exerciseId,
                    name: exerciseMap?.[exerciseId]?.name ?? 'Exercise',
                    logs,
                    averageReps,
                    averageWeight,
                  };
                });

                return (
                <Card 
                  key={session.sessionId} 
                  className="group"
                >
                  <details className="group/details">
                    <summary className="p-5 flex justify-between items-center cursor-pointer list-none">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-xs text-hayl-muted font-mono uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Calendar size={12}/> {formatDate(session.startTime)}</span>
                                <span className="flex items-center gap-1"><Clock size={12}/> {formatDuration(session.startTime, session.endTime)}</span>
                            </div>
                            <h3 className="font-heading text-2xl font-bold text-hayl-text group-hover:text-hayl-accent transition-colors">
                              WORKOUT SESSION
                              <span className="text-hayl-muted ml-2 text-lg">DAY {session.currentDayIndex + 1}</span>
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-xs font-mono font-bold text-hayl-text">
                                    <Dumbbell size={12} className="text-hayl-accent"/>
                                    {kpis.totalSets} SETS
                                </div>
                                <div className="flex items-center gap-1 text-xs font-mono font-bold text-hayl-text">
                                    <span className="text-hayl-success">{Math.round(kpis.avgRepsPerSet)} AVG REPS/SET</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-hayl-border group-hover:text-hayl-accent transition-colors">
                          <span className="hidden sm:inline text-[10px] font-heading font-bold uppercase tracking-widest text-hayl-muted">
                            Expand
                          </span>
                          <ChevronDown size={20} className="group-open/details:rotate-180 transition-transform" />
                        </div>
                    </summary>

                    <div className="px-5 pb-5 space-y-4 border-t border-hayl-border/60">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
                        <div className="rounded-xl border border-hayl-border p-3 bg-hayl-bg/40">
                          <p className="text-[10px] font-heading uppercase tracking-widest text-hayl-muted">Volume</p>
                          <p className="font-mono font-bold">{Math.round(kpis.totalVolumeKg)} kg</p>
                        </div>
                        <div className="rounded-xl border border-hayl-border p-3 bg-hayl-bg/40">
                          <p className="text-[10px] font-heading uppercase tracking-widest text-hayl-muted">Avg Weight</p>
                          <p className="font-mono font-bold">{kpis.avgWeightKg.toFixed(1)} kg</p>
                        </div>
                        <div className="rounded-xl border border-hayl-border p-3 bg-hayl-bg/40">
                          <p className="text-[10px] font-heading uppercase tracking-widest text-hayl-muted">Unique Exercises</p>
                          <p className="font-mono font-bold">{kpis.uniqueExercises}</p>
                        </div>
                        <div className="rounded-xl border border-hayl-border p-3 bg-hayl-bg/40">
                          <p className="text-[10px] font-heading uppercase tracking-widest text-hayl-muted">Duration</p>
                          <p className="font-mono font-bold">{kpis.durationMinutes} min</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {groupedLogs.map((exercise) => (
                          <details key={`${session.sessionId}-${exercise.exerciseId}`} className="group/ex rounded-xl border border-hayl-border p-3 bg-hayl-bg/20">
                            <summary className="list-none cursor-pointer flex items-center justify-between">
                              <div>
                                <p className="font-heading font-bold uppercase text-sm">{exercise.name}</p>
                                <p className="text-[10px] font-mono text-hayl-muted uppercase">
                                  {exercise.logs.length} sets · {exercise.averageReps.toFixed(1)} avg reps · {exercise.averageWeight.toFixed(1)} avg kg
                                </p>
                              </div>
                              <ChevronDown size={16} className="text-hayl-muted group-open/ex:rotate-180 transition-transform" />
                            </summary>

                            <div className="pt-3 space-y-2">
                              {exercise.logs.map((log) => (
                                <div key={log.setId} className="flex justify-between items-center rounded-lg bg-hayl-surface p-2 text-xs font-mono">
                                  <span className="text-hayl-muted">SET {log.setIndex + 1}</span>
                                  <div className="flex items-center gap-3">
                                    <span>{log.weight ?? '--'} kg</span>
                                    <span>{log.reps} reps</span>
                                    {typeof log.rpe === 'number' && <span>RPE {log.rpe}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => onSelectSession?.(session.sessionId)}>
                          OPEN DETAIL <ArrowRight size={14} className="ml-2" />
                        </Button>
                      </div>
                    </div>
                  </details>
                </Card>
            );})}
        </div>
      )}
    </Page>
  );
}
