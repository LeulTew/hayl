import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { ArrowRight, Trophy, Activity, Dumbbell, Zap, CalendarDays, CheckCircle2, Clock3 } from 'lucide-react';

import { Page } from "../ui/Page";
import { SectionHeader } from "../ui/SectionHeader";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { StatBlock } from "../ui/StatBlock";
import { Button } from "../ui/Button";

import { useUserProfile } from '../../hooks/useUserProfile';
import { useTranslation } from '../../hooks/useTranslation';
import { useSafeActiveRoutine } from '../../hooks/useSafeActiveRoutine';

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

function getDayStartTimestamp(ts: number): number {
  const date = new Date(ts);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function formatShortDate(ts: number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(ts));
}

function formatMonthYear(ts: number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(ts));
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
  const token = typeof window !== 'undefined' ? localStorage.getItem("hayl-token") : null;
  const { activeRoutine } = useSafeActiveRoutine(token);

  // Real Stats from Local DB
  const rawHistory = useLiveQuery(() => db.sessions.where('state').equals('completed').toArray());
  const history = useMemo(
    () => (rawHistory || []).filter((session) => (session.logs?.length ?? 0) > 0),
    [rawHistory],
  );
  
  const [stableNow] = useState(() => Date.now());

  const weeklyWorkouts = useMemo(() => {
    const sevenDaysAgo = stableNow - 7 * 24 * 60 * 60 * 1000;
    const workoutDays = new Set(
      history
        .filter((session) => session.startTime >= sevenDaysAgo)
        .map((session) => getDayStartTimestamp(session.startTime)),
    );
    return workoutDays.size;
  }, [history, stableNow]);

  const averageVolume = useMemo(() => {
    if (history.length === 0) return 0;
    const totalVolume = history.reduce((acc, s) => {
      const sessionVol = s.logs.reduce((vol, log) => vol + (log.weight || 0) * log.reps, 0);
      return acc + sessionVol;
    }, 0);
    return totalVolume / history.length;
  }, [history]);

  const streak = useMemo(() => getStreakDays(history.map((session) => session.startTime)), [history]);
  
  // Phase 6: Active Routine Logic
  const activePlanId = profile?.activePlanId || activeRoutine?.planId;
  const activePlan = useQuery(api.programs.getPlan, activePlanId ? { planId: activePlanId as Id<"derivedPlans"> } : "skip");
  const consistencyTarget = activePlan?.days?.length ?? 4;
  
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
  
  const fallbackNextDayIndex = activePlan?.days ? routineHistory.length % activePlan.days.length : 0;
  const nextDayIndex = activeRoutine?.nextDayIndex ?? fallbackNextDayIndex;
  const nextDay = activePlan?.days?.find((day) => day.dayIndex === nextDayIndex) ?? activePlan?.days?.[nextDayIndex];
  const nextDayTitle = nextDay?.title || t('next_session');

  const completedDayStarts = useMemo(
    () => new Set(history.map((session) => getDayStartTimestamp(session.startTime))),
    [history],
  );

  const upcomingSessions = useMemo(() => {
    if (!activePlan?.days?.length) return [];
    const count = Math.max(5, Math.min(10, consistencyTarget + 2));
    return Array.from({ length: count }).map((_, offset) => {
      const dayStart = getDayStartTimestamp(stableNow + offset * 24 * 60 * 60 * 1000);
      const cycleDay = activePlan.days[(nextDayIndex + offset) % activePlan.days.length];
      return {
        id: `${cycleDay.dayIndex}-${dayStart}`,
        dayStart,
        dayIndex: cycleDay.dayIndex,
        title: cycleDay.title,
      };
    });
  }, [activePlan, consistencyTarget, nextDayIndex, stableNow]);

  const upcomingDayStarts = useMemo(
    () => new Set(upcomingSessions.map((session) => session.dayStart)),
    [upcomingSessions],
  );

  const recentCompleted = useMemo(
    () =>
      [...history]
        .sort((left, right) => right.startTime - left.startTime)
        .slice(0, 5),
    [history],
  );

  const monthGrid = useMemo(() => {
    const now = new Date(stableNow);
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstWeekdayMondayFirst = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStart = getDayStartTimestamp(stableNow);

    const cells: Array<
      | { type: 'empty'; key: string }
      | {
          type: 'day';
          key: string;
          dayNumber: number;
          dayStart: number;
          isToday: boolean;
          isCompleted: boolean;
          isUpcoming: boolean;
        }
    > = [];

    for (let index = 0; index < firstWeekdayMondayFirst; index += 1) {
      cells.push({ type: 'empty', key: `empty-${index}` });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayStart = new Date(year, month, day).getTime();
      cells.push({
        type: 'day',
        key: `day-${day}`,
        dayNumber: day,
        dayStart,
        isToday: dayStart === todayStart,
        isCompleted: completedDayStarts.has(dayStart),
        isUpcoming: upcomingDayStarts.has(dayStart),
      });
    }

    return {
      label: formatMonthYear(stableNow),
      weekDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      cells,
    };
  }, [completedDayStarts, upcomingDayStarts, stableNow]);

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
          <StatBlock label={t('consistency')} value={weeklyWorkouts} unit={`/ ${consistencyTarget}`} size="md" />
        </Card>
        <Card className="p-4 flex flex-col justify-between h-32">
          <Dumbbell className="text-hayl-muted mb-2" size={20} />
          <StatBlock label={`AVG ${t('volume')} (KG)`} value={formatNumber(averageVolume)} size="md" />
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
                      <Badge variant="muted">{t('week')} {Math.floor((stableNow - (profile?.programStartDate || stableNow)) / (7 * 24 * 60 * 60 * 1000)) + 1}</Badge>
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

      <section className="mb-12">
        <SectionHeader title="TRAINING CALENDAR" subtitle="HISTORY + UPCOMING" className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="text-hayl-accent" size={18} />
                <p className="font-heading font-bold uppercase tracking-widest text-xs text-hayl-muted">{monthGrid.label}</p>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthGrid.weekDays.map((weekday) => (
                <div key={weekday} className="text-center text-[10px] font-heading uppercase tracking-widest text-hayl-muted">
                  {weekday}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 mt-2">
              {monthGrid.cells.map((cell) => {
                if (cell.type === 'empty') {
                  return <div key={cell.key} className="h-10 rounded-lg" />;
                }

                const cellClassName = [
                  'h-10 rounded-lg border text-xs font-mono flex items-center justify-center',
                  cell.isToday
                    ? 'border-hayl-text bg-hayl-text text-hayl-bg'
                    : cell.isCompleted
                      ? 'border-hayl-success/50 bg-hayl-success/10 text-hayl-text'
                      : cell.isUpcoming
                        ? 'border-hayl-accent/50 bg-hayl-accent/10 text-hayl-text'
                        : 'border-hayl-border bg-hayl-surface text-hayl-muted',
                ].join(' ');

                return (
                  <div key={cell.key} className={cellClassName}>
                    {cell.dayNumber}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-[10px] font-heading uppercase tracking-widest text-hayl-muted">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-hayl-success" />Completed</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-hayl-accent" />Upcoming</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-hayl-text" />Today</span>
            </div>
          </Card>

          <Card className="p-4 md:p-5">
            <div className="mb-5">
              <p className="text-[10px] font-heading uppercase tracking-widest text-hayl-muted mb-2">UPCOMING</p>
              <div className="space-y-2">
                {upcomingSessions.length > 0 ? upcomingSessions.slice(0, 4).map((session, index) => (
                  <button
                    type="button"
                    key={session.id}
                    className="w-full rounded-xl border border-hayl-border bg-hayl-surface px-3 py-2 text-left hover:border-hayl-accent/50 transition-colors"
                    onClick={() => {
                      if (!activeProgram || !activePlan) return;
                      onStartSession(session.dayIndex, activeProgram._id, activePlan._id);
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-hayl-text truncate">{session.title}</span>
                      <span className="text-[10px] font-heading uppercase text-hayl-muted">{index === 0 ? 'NEXT' : `${index + 1}`}</span>
                    </div>
                    <p className="text-[10px] font-mono uppercase text-hayl-muted mt-1">{formatShortDate(session.dayStart)}</p>
                  </button>
                )) : (
                  <p className="text-xs font-mono text-hayl-muted">Select a program to generate upcoming sessions.</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-heading uppercase tracking-widest text-hayl-muted mb-2">RECENT COMPLETED</p>
              <div className="space-y-2">
                {recentCompleted.length > 0 ? recentCompleted.slice(0, 4).map((session) => (
                  <div key={session.sessionId} className="rounded-xl border border-hayl-border bg-hayl-bg/30 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-hayl-text truncate">DAY {session.currentDayIndex + 1}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-hayl-success"><CheckCircle2 size={12} /> DONE</span>
                    </div>
                    <p className="text-[10px] font-mono uppercase text-hayl-muted mt-1 inline-flex items-center gap-1">
                      <Clock3 size={12} /> {formatShortDate(session.startTime)}
                    </p>
                  </div>
                )) : (
                  <p className="text-xs font-mono text-hayl-muted">No completed sessions yet.</p>
                )}
              </div>
            </div>

            <Button className="mt-4" variant="outline" fullWidth onClick={() => onNavigate({ type: 'history' })}>
              OPEN FULL LOGBOOK
            </Button>
          </Card>
        </div>
      </section>
    </Page>
  );
}
