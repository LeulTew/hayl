import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { Page } from '../ui/Page';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';

import { ArrowLeft, ArrowRight, Calendar, Clock, Dumbbell } from 'lucide-react';
import { Button } from '../ui/Button';

interface HistoryViewProps {
  onBack?: () => void;
  onSelectSession?: (sessionId: string) => void;
}

export function HistoryView({ onBack, onSelectSession }: HistoryViewProps) {
  const sessions = useLiveQuery(
    () => db.sessions.where('state').equals('completed').reverse().sortBy('endTime')
  );

  const formatDate = (ts: number) => new Intl.DateTimeFormat('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric', weekday: 'short' 
  }).format(new Date(ts));

  const formatDuration = (start: number, end?: number) => {
    if (!end) return '-- min';
    const minutes = Math.round((end - start) / 60000);
    return `${minutes} min`;
  };

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
        <SectionHeader title="LOGBOOK" subtitle="COMPLETED OPERATIONS" className="flex-1" />
      </header>

      {sessions.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-hayl-border rounded-3xl">
            <p className="font-heading text-hayl-muted uppercase tracking-widest">No Logged Sessions</p>
            <Button variant="outline" className="mt-4" onClick={onBack}>RETURN TO BASE</Button>
        </div>
      ) : (
        <div className="space-y-4 animate-slide-up">
            {sessions.map((session) => (
                <Card 
                  key={session.sessionId} 
                  hover 
                  onClick={() => onSelectSession?.(session.sessionId)}
                  className="group"
                >
                    <div className="p-5 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-xs text-hayl-muted font-mono uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Calendar size={12}/> {formatDate(session.startTime)}</span>
                                <span className="flex items-center gap-1"><Clock size={12}/> {formatDuration(session.startTime, session.endTime)}</span>
                            </div>
                            <h3 className="font-heading text-2xl font-bold text-hayl-text group-hover:text-hayl-accent transition-colors">
                                {session.programId.replace(/-/g, ' ').toUpperCase()} 
                                <span className="text-hayl-muted ml-2 text-lg">Day {session.currentDayIndex + 1}</span>
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-xs font-mono font-bold text-hayl-text">
                                    <Dumbbell size={12} className="text-hayl-accent"/>
                                    {session.logs.length} SETS
                                </div>
                                <div className="flex items-center gap-1 text-xs font-mono font-bold text-hayl-text">
                                    <span className="text-hayl-success">COMPLETE</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-hayl-border group-hover:text-hayl-accent transition-colors">
                             <ArrowRight size={24} />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
      )}
    </Page>
  );
}
