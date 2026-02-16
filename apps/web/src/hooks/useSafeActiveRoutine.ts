import { useCallback, useEffect, useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface ActiveRoutineDayOrder {
  dayIndex: number;
  day_order: number;
}

interface ActiveRoutineState {
  planId: string;
  nextDayIndex: number;
  dayOrder: ActiveRoutineDayOrder[];
}

export function useSafeActiveRoutine(tokenIdentifier: string | null) {
  const convex = useConvex();
  const [activeRoutine, setActiveRoutine] = useState<ActiveRoutineState | null>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTick((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!tokenIdentifier) {
      return;
    }

    let cancelled = false;
    void convex
      .query(api.routines.getActiveRoutine, { tokenIdentifier })
      .then((result) => {
        if (cancelled) return;
        setActiveRoutine(result as ActiveRoutineState | null);
        setIsUnavailable(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        const message =
          error instanceof Error ? error.message : String(error);
        const missingFunction = message.includes(
          "Could not find public function for 'routines:getActiveRoutine'",
        );

        if (!missingFunction) {
          console.warn("Failed to fetch active routine:", error);
        }

        setActiveRoutine(null);
        setIsUnavailable(missingFunction);
      })
      ;

    return () => {
      cancelled = true;
    };
  }, [convex, tokenIdentifier, refreshTick]);

  return {
    activeRoutine: tokenIdentifier ? activeRoutine : null,
    isLoading: false,
    isUnavailable: tokenIdentifier ? isUnavailable : false,
    refresh,
  };
}
