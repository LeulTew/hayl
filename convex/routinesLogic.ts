export interface PlanDayShape {
  dayIndex: number;
}

export interface DayOrderEntry {
  dayIndex: number;
  day_order: number;
}

export interface RoutineDayLogShape {
  completedAt: number;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function getLocalDayStart(timestamp: number): number {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function getDefaultDayIndexes(planDays: PlanDayShape[]): number[] {
  return [...planDays]
    .sort((a, b) => a.dayIndex - b.dayIndex)
    .map((day) => day.dayIndex);
}

export function normalizeDayOrder(
  planDays: PlanDayShape[],
  persistedDayOrder?: DayOrderEntry[],
): DayOrderEntry[] {
  const defaultDayIndexes = getDefaultDayIndexes(planDays);
  const validDayIndexSet = new Set(defaultDayIndexes);

  const orderedDayIndexes: number[] = [];
  const seen = new Set<number>();

  if (persistedDayOrder && persistedDayOrder.length > 0) {
    const sortedPersisted = [...persistedDayOrder].sort(
      (left, right) => left.day_order - right.day_order,
    );

    for (const entry of sortedPersisted) {
      if (!validDayIndexSet.has(entry.dayIndex) || seen.has(entry.dayIndex)) {
        continue;
      }
      seen.add(entry.dayIndex);
      orderedDayIndexes.push(entry.dayIndex);
    }
  }

  for (const dayIndex of defaultDayIndexes) {
    if (!seen.has(dayIndex)) {
      seen.add(dayIndex);
      orderedDayIndexes.push(dayIndex);
    }
  }

  return orderedDayIndexes.map((dayIndex, position) => ({
    dayIndex,
    day_order: position,
  }));
}

export function buildReorderedDayOrder(
  planDays: PlanDayShape[],
  orderedDayIndexes: number[],
): DayOrderEntry[] {
  const defaultDayIndexes = getDefaultDayIndexes(planDays);
  const expectedSet = new Set(defaultDayIndexes);

  if (orderedDayIndexes.length !== defaultDayIndexes.length) {
    throw new Error("Invalid day order payload length");
  }

  const seen = new Set<number>();
  for (const dayIndex of orderedDayIndexes) {
    if (!expectedSet.has(dayIndex) || seen.has(dayIndex)) {
      throw new Error("Invalid day order payload values");
    }
    seen.add(dayIndex);
  }

  return orderedDayIndexes.map((dayIndex, position) => ({
    dayIndex,
    day_order: position,
  }));
}

export function resolveNextDayIndex(
  completedSessionsCount: number,
  dayOrder: DayOrderEntry[],
): number {
  if (dayOrder.length === 0) {
    throw new Error("Cannot resolve next day for empty day order");
  }

  const normalizedCount = Math.max(0, completedSessionsCount);
  const nextPosition = normalizedCount % dayOrder.length;
  return dayOrder[nextPosition].dayIndex;
}

export function calculateStreakDaysFromTimestamps(
  timestamps: number[],
  now: number = Date.now(),
): number {
  if (timestamps.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(timestamps.map((timestamp) => getLocalDayStart(timestamp))),
  ).sort((a, b) => b - a);

  const todayStart = getLocalDayStart(now);
  const yesterdayStart = todayStart - ONE_DAY_MS;

  if (uniqueDays[0] !== todayStart && uniqueDays[0] !== yesterdayStart) {
    return 0;
  }

  let streak = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previous = uniqueDays[index - 1];
    const current = uniqueDays[index];
    if (previous - current === ONE_DAY_MS) {
      streak += 1;
      continue;
    }
    break;
  }

  return streak;
}

export function calculateStreakDaysFromLogs(
  logs: RoutineDayLogShape[],
  now: number = Date.now(),
): number {
  return calculateStreakDaysFromTimestamps(
    logs.map((log) => log.completedAt),
    now,
  );
}
