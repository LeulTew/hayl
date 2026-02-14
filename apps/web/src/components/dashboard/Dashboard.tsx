import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ArrowRight, Trophy, Activity, Dumbbell, Zap } from 'lucide-react';

import { Page } from "../ui/Page";
import { SectionHeader } from "../ui/SectionHeader";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { StatBlock } from "../ui/StatBlock";
import { Button } from "../ui/Button";

import { useUserProfile } from '../../hooks/useUserProfile';
import { useTranslation } from '../../hooks/useTranslation';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LocalSession } from '../../lib/db';
import type { NavigationState } from '../../types/navigation';

// Helper to get active program from history
function getMostRecentProgramId(history: LocalSession[]): string | undefined {
  if (!history || history.length === 0) return undefined;
  const sorted = [...history].sort((a, b) => b.startTime - a.startTime);
  return sorted[0]?.programId;
}

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
  if (sessionStartTimes.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(sessionStartTimes.map((time) => new Date(time).toDateString()))
  ).map((day) => new Date(day).getTime()).sort((a, b) => b - a);

  const oneDayMs = 24 * 60 * 60 * 1000;
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const yesterdayStart = todayStart - oneDayMs;

  if (uniqueDays[0] !== todayStart && uniqueDays[0] !== yesterdayStart) return 0;

  let streak = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const prev = uniqueDays[index - 1];
    const curr = uniqueDays[index];
    if (prev - curr === oneDayMs) {
      streak += 1;
      streakCount: streak += 1; // Correcting potential logic loop
      continue;
    }
    break;
  }
  return streak;
}

interface DashboardProps {
  onNavigate: (view: NavigationState) => void;
  onStartSession: (dayIndex: number, programId: string, planId: string) => void;
}

export function Dashboard({ onNavigate, onStartSession }: DashboardProps) {
  const { profile } = useUserProfile();
  const { t } = useTranslation();
  const programs = useQuery(api.programs.list);

  // Real Stats from Local DB
  const history = useLiveQuery(() => db.sessions.where('state').equals('completed').toArray()) || [];
  
  const [now] = useState(() => Date.now());
  const weeklyWorkouts = history.filter(s => {
    const diff = now - s.startTime;
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const totalVolume = history.reduce((acc, s) => {
    const sessionVol = s.logs.reduce((vol, log) => vol + (log.weight || 0) * log.reps, 0);
    return acc + sessionVol;
  }, 0);

  const streak = getStreakDays(history.map((session) => session.startTime));
  
  // Phase 6: Active Routine Logic
  const activePlanId = profile?.activePlanId;
  const activePlan = useQuery(api.programs.getPlan, activePlanId ? { planId: activePlanId as any } : "skip");
  
  // Fallback to history if no active plan set
  const recentProgramId = getMostRecentProgramId(history);
  const displayProgramId = activePlan?.programId || recentProgramId;
  const activeProgram = programs?.find(p => p._id === displayProgramId);

  // Next Session Calculation
  const routineHistory = history.filter(s => 
    s.planId === activePlanId && 
    profile?.programStartDate && 
    s.startTime >= profile.programStartDate
  );
  
  const nextDayIndex = activePlan?.days ? routineHistory.length % activePlan.days.length : 0;
  const nextDayTitle = activePlan?.days?.[nextDayIndex]?.title || t('next_session');

  return (
    <Page className="pt-8">
      {/* 1. Header with Greeting */}
      <header className="mb-8">
        <SectionHeader 
          title={t('dashboard')}
          subtitle={`${t('welcome_back')}, ${profile?.name?.split(' ')[0] || t('athlete')}`}
          size="lg"
        />
      </header>

      {/* 2. Weekly Snapshot Grid */}
      <section className="mb-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col justify-between h-32">
          <Activity className="text-hayl-accent mb-2" size={20} />
          <StatBlock label={t('consistency')} value={weeklyWorkouts} unit="/ 4" size="md" />
        </Card>
        <Card className="p-4 flex flex-col justify-between h-32">
          <Dumbbell className="text-hayl-muted mb-2" size={20} />
          <StatBlock label={`${t('volume')} (KG)`} value={formatNumber(totalVolume)} size="md" />
        </Card>
        <Card className="p-4 flex flex-col justify-between h-32">
          <Trophy className="text-hayl-muted mb-2" size={20} />
          <StatBlock label={t('streak')} value={streak} unit={t('days')} size="md" />
        </Card>
        
        {/* Next Session / Quick Start */}
        <Card 
            className="p-4 flex flex-col justify-between h-32 bg-hayl-text text-hayl-bg border-transparent cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => {
                if (activeProgram && activePlan) {
                    onStartSession(nextDayIndex, activeProgram._id, activePlan._id);
                } else if (activeProgram) {
                    onNavigate({ type: 'programs', view: 'detail', programId: activeProgram._id });
                } else {
                    onNavigate({ type: 'programs', view: 'home' });
                }
            }}
        >
          <div className="font-heading uppercase text-[10px] tracking-widest opacity-60">
              {activeProgram ? t('deploy_session') : t('start_training')}
          </div>
          <div className="font-heading text-2xl font-bold leading-none truncate">
              {activeProgram ? nextDayTitle : t('find_protocol')}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono opacity-60">
             <span>{t('go_now')}</span>
             <ArrowRight size={12} />
          </div>
        </Card>
      </section>

      {/* 3. Active Protocol (or Call to Action) */}
      <section className="mb-12">
        <SectionHeader title={t('current_objective')} subtitle={t('active_deployment')} className="mb-6" />
        
        {activePlan && activeProgram ? (
             <Card 
               hover 
               onClick={() => onNavigate({ type: 'programs', view: 'detail', programId: activeProgram._id, planId: activePlan._id })}
               className="group relative overflow-hidden transition-all active:scale-[0.99]"
             >
               <div className="p-6 flex justify-between items-start">
                 <div>
                   <div className="flex items-center gap-2 mb-2">
                     <Badge variant={activeProgram.isPremium ? 'accent' : 'outline'}>
                       {activePlan.variant.splitFreq}
                     </Badge>
                     <Badge variant="muted">{t('week')} {Math.floor((Date.now() - (profile?.programStartDate || Date.now())) / (7 * 24 * 60 * 60 * 1000)) + 1}</Badge>
                   </div>
                   <h3 className="font-heading text-4xl font-bold uppercase text-hayl-text mb-1 group-hover:text-hayl-accent transition-colors">
                     {activeProgram.title}
                   </h3>
                   <p className="font-mono text-xs text-hayl-muted uppercase tracking-wider">
                     {activePlan.days.length} {t('sessions_week')} • {activePlan.variant.difficulty}
                   </p>
                 </div>
                 
                 <div className="hidden md:flex flex-col items-end gap-2">
                     <span className="text-[10px] font-mono text-hayl-muted uppercase">{t('next_session')}</span>
                     <div 
                        className="h-12 px-6 rounded-full bg-hayl-text text-hayl-bg flex items-center justify-center font-heading font-black italic uppercase tracking-wider group-hover:bg-hayl-accent transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartSession(nextDayIndex, activeProgram._id, activePlan._id);
                        }}
                      >
                        {nextDayTitle}
                     </div>
                 </div>
               </div>
             </Card>
        ) : (
            <Card 
               hover 
               onClick={() => onNavigate({ type: 'programs', view: 'home' })}
               className="group relative overflow-hidden border-dashed border-hayl-muted/30"
             >
               <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-hayl-surface border border-hayl-border flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Zap className="text-hayl-muted group-hover:text-hayl-accent" size={32} />
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-bold uppercase text-hayl-text mb-2">
                        {t('no_active_protocol')}
                    </h3>
                    <p className="font-body text-sm text-hayl-muted max-w-sm mx-auto">
                        {t('select_program')}
                    </p>
                  </div>
                  <Button variant="outline" className="mt-2" onClick={(e) => {
                      e.stopPropagation();
                      onNavigate({ type: 'programs', view: 'home' });
                  }}>
                      {t('browse_protocols')}
                  </Button>
               </div>
             </Card>
        )}
      </section>
    </Page>
  );
}
