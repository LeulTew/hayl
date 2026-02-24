import { useState, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Activity, Zap, CalendarDays, CheckCircle2, Clock3, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';

import { Page } from "../ui/Page";
import { SectionHeader } from "../ui/SectionHeader";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { PROGRESS_UI_CONFIG, isProgressClassification } from '../../constants/progress';
import { Button } from "../ui/Button";

import { useUserProfile } from '../../hooks/useUserProfile';
import { useTranslation } from '../../hooks/useTranslation';
import { useSafeActiveRoutine } from '../../hooks/useSafeActiveRoutine';
import { useHomeKpiSnapshot } from '../../hooks/useHomeKpiSnapshot';
import { trackEvent } from '../../lib/analytics';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LocalSession } from '../../lib/db';
import type { NavigationState } from '../../types/navigation';

// ──────────────────────────────────────────────
// Pure helpers (no hooks, no side-effects)
// ──────────────────────────────────────────────

/**
 * Returns the most recent programId from completed local sessions.
 * Used as a fallback when no active routine is explicitly set.
 */
function getMostRecentProgramId(history: LocalSession[]): string | undefined {
  if (!history || history.length === 0) return undefined;
  const sorted = [...history].sort((a, b) => b.startTime - a.startTime);
  return sorted[0]?.programId;
}

/** Normalises a timestamp to midnight of its calendar day. */
function getDayStartTimestamp(ts: number): number {
  const date = new Date(ts);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Formats a timestamp as "Feb 24" style. */
function formatShortDate(ts: number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(ts));
}

/** Formats a timestamp as "February 2026" style. */
function formatMonthYear(ts: number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(ts));
}

/**
 * Computes the current workout streak in consecutive days.
 * Streak must include today or yesterday to be non-zero.
 */
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

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

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

  // ── Server KPI Snapshot (single query) ──
  const { snapshot, isLoading: isSnapshotLoading } = useHomeKpiSnapshot(token);

  // ── Local Workout History (Dexie) ──
  const rawHistory = useLiveQuery(() => db.sessions.where('state').equals('completed').toArray());
  const history = useMemo(
    () => (rawHistory || []).filter((session) => (session.logs?.length ?? 0) > 0),
    [rawHistory],
  );

  const [stableNow] = useState(() => Date.now());

  const consistency28d = useMemo(() => {
    const twentyEightDaysAgo = stableNow - 28 * 24 * 60 * 60 * 1000;
    const workoutDays = new Set(
      history
        .filter((session) => session.startTime >= twentyEightDaysAgo)
        .map((session) => getDayStartTimestamp(session.startTime)),
    );
    return workoutDays.size;
  }, [history, stableNow]);

  const streak = useMemo(() => getStreakDays(history.map((session) => session.startTime)), [history]);

  // ── Active Routine Logic ──
  // Dexie stores IDs as plain strings; Convex requires the branded Id type.
  // This is a validated boundary crossing — the value originates from Convex.
  const activePlanId = profile?.activePlanId || activeRoutine?.planId;
  const activePlan = useQuery(api.programs.getPlan, activePlanId ? { planId: activePlanId as Id<"derivedPlans"> } : "skip");
  const consistencyTarget = activePlan?.days?.length ?? 4;

  // ── KPI Snapshot Values ──
  const rawClassification = snapshot?.progress?.classification;
  const progressClassification = isProgressClassification(rawClassification) ? rawClassification : 'insufficient_data';
  const progressSummary = snapshot?.progress?.summary ?? null;
  const weeklyWeightDeltaKg = snapshot?.progress?.weeklyWeightDeltaKg ?? 0;
  const isImperial = profile?.unitPreference === 'imperial';
  const uiConfig = PROGRESS_UI_CONFIG[progressClassification];
  const TrendIcon = uiConfig.icon;
  const proteinRatio = snapshot?.nutrition?.proteinAdequacyRatio7d ?? 0;
  const calorieDelta = snapshot?.nutrition?.dailyCalorieDelta7d ?? 0;

  // ── Fallback Routing ──
  const recentProgramId = getMostRecentProgramId(history);
  const displayProgramId = activePlan?.programId || recentProgramId;
  const activeProgram = programs?.find(p => p._id === displayProgramId);

  // ── Next Session Calculation ──
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

  // ── Analytics: Home KPI Impression ──
  useEffect(() => {
    if (isSnapshotLoading) return;
    trackEvent('home_kpi_impression', {
      visibleCards: ['streak', 'quick_start', 'progress_signal', 'consistency_28d', 'nutrition_7d'],
      progressClassification,
    });
  }, [isSnapshotLoading, progressClassification]);

  return (
    <Page className="pt-8">
      {/* 1. Header with Greeting */}
      <header className="mb-8">
        <SectionHeader
          title={t('dashboard')}
          subtitle={`${t('welcome_back')}, ${snapshot?.userName?.split(' ')[0] || profile?.name?.split(' ')[0] || t('athlete')}`}
          size="lg"
        />
      </header>

      {/* 2. Hero KPI Strip */}
      <section className="mb-6 grid grid-cols-2 gap-4">
        <Card className="p-4 flex flex-col justify-center h-24">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Flame size={20} className={streak > 0 ? "fill-orange-500" : ""} />
             </div>
             <div>
                <p className="text-[10px] font-heading uppercase tracking-widest text-hayl-muted mb-0.5">{t('streak')}</p>
                <div className="flex items-end gap-1">
                   <span className="font-heading text-2xl font-bold leading-none">{streak}</span>
                   <span className="font-heading text-sm text-hayl-muted uppercase pb-0.5">{t('days')}</span>
                </div>
             </div>
          </div>
        </Card>

        {/* Next Session / Quick Start */}
        <Card
            className="p-4 flex flex-col justify-center h-24 border border-hayl-border cursor-pointer hover:border-hayl-accent transition-colors group"
            onClick={() => {
                if (activeProgram && activePlan) {
                    onStartSession(nextDayIndex, activeProgram._id, activePlan._id);
                } else if (activeProgram) {
                    onNavigate({ type: 'programs', view: 'detail', programId: activeProgram._id });
                } else {
                    onNavigate({ type: 'programs', view: 'home' });
                }
                trackEvent('home_cta_click', { ctaId: 'start_session', destination: 'workout' });
            }}
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-hayl-surface text-hayl-muted flex items-center justify-center group-hover:bg-hayl-accent/10 group-hover:text-hayl-accent transition-colors">
                <Zap size={20} />
             </div>
             <div className="flex-1 truncate">
                <p className="text-[10px] font-heading uppercase tracking-widest text-hayl-muted mb-0.5">{activeProgram ? t('deploy_session') : t('start_training')}</p>
                <p className="font-heading text-xl font-bold leading-none truncate pr-2">
                   {activeProgram ? nextDayTitle : t('find_protocol')}
                </p>
             </div>
          </div>
        </Card>
      </section>

      {/* 3. Progress Signal Card */}
      <section className="mb-6">
        <Card className={`p-5 pl-6 border ${uiConfig.border} transition-colors flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${uiConfig.bg} ${uiConfig.text} shrink-0`}>
              <TrendIcon size={32} />
            </div>
            <div>
              <p className="text-[10px] font-heading uppercase tracking-widest text-hayl-muted mb-0.5">Primary Signal</p>
              <h3 className={`font-heading text-2xl sm:text-3xl uppercase font-bold leading-none ${uiConfig.text}`}>
                {uiConfig.label}
              </h3>
              <p className="text-xs text-hayl-muted mt-1.5 line-clamp-2 md:line-clamp-none max-w-sm">
                {progressSummary ?? 'Log weight and meals consistently for confident progress trends.'}
              </p>
            </div>
          </div>

          {progressClassification !== 'insufficient_data' && (
            <div className="shrink-0 flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-hayl-border/50">
              <div className="flex items-center gap-1.5 sm:mb-1">
                {weeklyWeightDeltaKg > 0 ? <TrendingUp size={18} className="text-hayl-muted" /> : weeklyWeightDeltaKg < 0 ? <TrendingDown size={18} className="text-hayl-muted" /> : <Minus size={18} className="text-hayl-muted" />}
                <span className="font-mono text-2xl font-bold">
                  {weeklyWeightDeltaKg > 0 ? '+' : ''}
                  {isImperial ? (weeklyWeightDeltaKg * 2.20462).toFixed(1) : weeklyWeightDeltaKg.toFixed(1)}
                </span>
              </div>
              <p className="text-[10px] font-heading text-hayl-muted uppercase">{isImperial ? 'LBS / WEEK' : 'KG / WEEK'}</p>
            </div>
          )}
        </Card>
      </section>

      {/* 4. Twin Analytics Panels */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Training Consistency */}
        <Card className="p-5 flex flex-col">
          <div className="flex justify-between items-start mb-4">
             <div>
                <p className="text-[10px] font-heading uppercase tracking-widest text-hayl-muted mb-1">Consistency (28d)</p>
                <h4 className="font-heading text-2xl font-bold uppercase">{consistency28d} <span className="text-sm text-hayl-muted">WORKOUTS</span></h4>
             </div>
             <Activity className="text-hayl-accent opacity-50" size={24} />
          </div>
          <div className="mt-auto">
             <div className="w-full bg-hayl-surface rounded-full h-1.5 mb-2 overflow-hidden">
                <div
                  className="bg-hayl-accent h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((consistency28d / (consistencyTarget * 4)) * 100, 100)}%` }}
                />
             </div>
             <p className="text-xs font-mono text-hayl-muted text-right">Target: {consistencyTarget * 4} / month</p>
          </div>
        </Card>

        {/* Nutrition Adherence */}
        <Card className="p-5 flex flex-col">
          <div className="flex justify-between items-start mb-4">
             <div>
                <p className="text-[10px] font-heading uppercase tracking-widest text-hayl-muted mb-1">Nutrition (7d)</p>
                <h4 className="font-heading text-2xl font-bold uppercase">{(proteinRatio * 100).toFixed(0)}% <span className="text-sm text-hayl-muted">PROTEIN</span></h4>
             </div>
             <div className="p-1.5 bg-hayl-surface rounded-md border border-hayl-border text-xs font-mono font-bold">
                 {calorieDelta > 0 ? '+' : ''}{Math.round(calorieDelta)} CAL
             </div>
          </div>
          <div className="mt-auto">
             <div className="w-full bg-hayl-surface rounded-full h-1.5 mb-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${proteinRatio >= 0.85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(proteinRatio * 100, 100)}%` }}
                />
             </div>
             <p className="text-xs font-mono text-hayl-muted text-right">Protein Adherence</p>
          </div>
        </Card>
      </section>

      {/* 5. Active Protocol (or Call to Action) */}
      <section className="mb-12">
        <SectionHeader title={t('current_objective')} subtitle={t('active_deployment')} className="mb-6" />

        {activePlan && activeProgram ? (
             <Card
               hover
               onClick={() => {
                 onNavigate({ type: 'programs', view: 'detail', programId: activeProgram._id, planId: activePlan._id });
                 trackEvent('drill_down_navigation', { sourceCard: 'active_protocol', targetView: 'program_detail' });
               }}
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
