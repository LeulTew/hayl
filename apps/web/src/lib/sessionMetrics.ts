import type { LogEntry } from "./db";

export interface SessionKpis {
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number;
  avgRepsPerSet: number;
  avgWeightKg: number;
  avgVolumePerSetKg: number;
  uniqueExercises: number;
  durationMinutes: number;
}

export function computeSessionKpis(
  logs: LogEntry[],
  startTime: number,
  endTime?: number,
): SessionKpis {
  const totalSets = logs.length;
  const totalReps = logs.reduce((acc, log) => acc + (log.reps || 0), 0);
  const totalVolumeKg = logs.reduce(
    (acc, log) => acc + (log.weight || 0) * (log.reps || 0),
    0,
  );
  const totalWeightTrackedSets = logs.filter(
    (log) => typeof log.weight === "number" && log.weight > 0,
  );
  const totalTrackedWeight = totalWeightTrackedSets.reduce(
    (acc, log) => acc + (log.weight || 0),
    0,
  );
  const avgWeightKg =
    totalWeightTrackedSets.length > 0
      ? totalTrackedWeight / totalWeightTrackedSets.length
      : 0;

  const avgRepsPerSet = totalSets > 0 ? totalReps / totalSets : 0;
  const avgVolumePerSetKg = totalSets > 0 ? totalVolumeKg / totalSets : 0;
  const uniqueExercises = new Set(logs.map((log) => log.exerciseId)).size;
  const durationMinutes = endTime
    ? Math.max(0, Math.round((endTime - startTime) / 60000))
    : 0;

  return {
    totalSets,
    totalReps,
    totalVolumeKg,
    avgRepsPerSet,
    avgWeightKg,
    avgVolumePerSetKg,
    uniqueExercises,
    durationMinutes,
  };
}
