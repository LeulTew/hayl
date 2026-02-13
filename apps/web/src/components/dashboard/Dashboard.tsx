import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ArrowRight, Trophy, Activity, Dumbbell } from 'lucide-react';

import { Page } from "../ui/Page";
import { SectionHeader } from "../ui/SectionHeader";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { StatBlock } from "../ui/StatBlock";

import { useUserProfile } from '../../hooks/useUserProfile';

interface DashboardProps {
  onSelectProgram?: (programId: string) => void;
}

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';

const numberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatNumber(num: number) {
  if (num <= 9999) {
    return String(Math.round(num));
  }
  return numberFormatter.format(num);
}

function getStreakDays(sessionStartTimes: number[]): number {
  if (sessionStartTimes.length === 0) {
    return 0;
  }

  const uniqueDays = Array.from(
    new Set(sessionStartTimes.map((time) => new Date(time).toDateString()))
  ).map((day) => new Date(day).getTime()).sort((a, b) => b - a);

  const oneDayMs = 24 * 60 * 60 * 1000;
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const yesterdayStart = todayStart - oneDayMs;

  if (uniqueDays[0] !== todayStart && uniqueDays[0] !== yesterdayStart) {
    return 0;
  }

  let streak = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const prev = uniqueDays[index - 1];
    const curr = uniqueDays[index];
    if (prev - curr === oneDayMs) {
      streak += 1;
      continue;
    }
    break;
  }

  return streak;
}

export function Dashboard({ onSelectProgram }: DashboardProps) {
  const { profile } = useUserProfile();
  const programs = useQuery(api.programs.list);

  // Real Stats from Local DB
  const history = useLiveQuery(() => db.sessions.where('state').equals('completed').toArray()) || [];

  const weeklyWorkouts = history.filter(s => {
    const diff = Date.now() - s.startTime;
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const totalVolume = history.reduce((acc, s) => {
    const sessionVol = s.logs.reduce((vol, log) => vol + (log.weight || 0) * log.reps, 0);
    return acc + sessionVol;
  }, 0);

  const streak = getStreakDays(history.map((session) => session.startTime));

  return (
    <Page className="pt-8">
      {/* 1. Header with Greeting */}
      <header className="mb-12">
        <SectionHeader 
          title="DASHBOARD"
          subtitle={`WELCOME BACK, ${profile?.name?.split(' ')[0] || 'ATHLETE'}`}
          size="lg"
        />
      </header>

      {/* 2. Weekly Snapshot Grid */}
      <section className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col justify-between h-32">
          <Activity className="text-hayl-accent mb-2" size={20} />
          <StatBlock label="CONSISTENCY" value={weeklyWorkouts} unit="/ 4" size="md" />
        </Card>
        <Card className="p-4 flex flex-col justify-between h-32">
          <Dumbbell className="text-hayl-muted mb-2" size={20} />
          <StatBlock label="VOLUME (KG)" value={formatNumber(totalVolume)} size="md" />
        </Card>
        <Card className="p-4 flex flex-col justify-between h-32">
          <Trophy className="text-hayl-muted mb-2" size={20} />
          <StatBlock label="STREAK" value={streak} unit="DAYS" size="md" />
        </Card>
        <Card className="p-4 flex flex-col justify-between h-32 bg-hayl-text text-hayl-bg border-transparent">
          <div className="font-heading uppercase text-xs tracking-widest opacity-60">NEXT SESSION</div>
          <div className="font-heading text-3xl font-bold leading-none">UPPER POWER</div>
          <div className="text-xs font-mono opacity-60">Est. 45 min</div>
        </Card>
      </section>

      {/* 3. Active Programs */}
      <section className="mb-12">
        <SectionHeader title="PROTOCOLS" subtitle="AVAILABLE TRAINING BLOCKS" className="mb-6" />
        
        <div className="space-y-4">
          {programs?.map((program) => (
            <Card 
              key={program._id} 
              hover 
              onClick={() => onSelectProgram?.(program._id)}
              className="group relative overflow-hidden transition-all active:scale-[0.99]"
            >
              <div className="p-6 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={program.isPremium ? 'accent' : 'outline'}>
                      {program.splitType.replace('-', ' ')}
                    </Badge>
                    <Badge variant="muted">{program.difficulty}</Badge>
                  </div>
                  <h3 className="font-heading text-4xl font-bold uppercase text-hayl-text mb-1 group-hover:text-hayl-accent transition-colors">
                    {program.title}
                  </h3>
                  <p className="font-mono text-xs text-hayl-muted uppercase tracking-wider">
                    Build strength & aesthetics • {program.isPremium ? 'PRO ACCESS' : 'FREE'}
                  </p>
                </div>
                
                <div className="hidden md:flex h-12 w-12 rounded-full border border-hayl-border items-center justify-center group-hover:border-hayl-accent transition-colors">
                    <ArrowRight className="text-hayl-muted group-hover:text-hayl-accent" size={20} />
                </div>
              </div>
            </Card>
          ))}

           {programs === undefined && (
             <div className="p-12 border border-dashed border-hayl-border rounded-2xl text-center">
                <Spinner />
                <p className="mt-4 text-hayl-muted font-heading uppercase tracking-widest text-sm">Loading Protocols...</p>
             </div>
          )}

           {programs !== undefined && programs.length === 0 && (
             <div className="p-12 border border-dashed border-hayl-border rounded-2xl text-center">
               <p className="text-hayl-muted font-heading uppercase tracking-widest text-sm">No Protocols Available</p>
             </div>
           )}
        </div>
      </section>
    </Page>
  );
}

function Spinner() {
    return (
        <div className="w-6 h-6 border-2 border-hayl-muted border-t-transparent rounded-full animate-spin mx-auto" />
    )
}
