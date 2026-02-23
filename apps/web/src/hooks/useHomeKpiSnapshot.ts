import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

/**
 * Consumes the aggregated Home KPI snapshot from the server.
 * Returns typed data, loading, and error states for the Dashboard.
 *
 * @param tokenIdentifier - The user's auth token (or null to skip)
 * @returns { snapshot, isLoading }
 */
export function useHomeKpiSnapshot(tokenIdentifier: string | null) {
  const snapshot = useQuery(
    api.home.getKpiSnapshot,
    tokenIdentifier ? { tokenIdentifier } : "skip",
  );

  return {
    snapshot: snapshot ?? null,
    isLoading: snapshot === undefined,
  };
}
