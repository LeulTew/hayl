import { query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * Returns a single aggregated KPI snapshot for the Home Page dashboard.
 * Combines training, nutrition, and progress data into one deterministic payload.
 *
 * @param tokenIdentifier - The user's auth token identifier
 * @returns HomeKpiSnapshot with all KPI data or null if user not found
 *
 * Data sources:
 * - users table (profile, plan, streak metadata)
 * - userActiveRoutines table (active plan/program linkage)
 * - nutritionAdaptiveSignals table (progress classification, weight trend)
 * - mealLogs table (nutrition consistency, adherence)
 * - workoutLogs table (training consistency -- via local DB, not server)
 *
 * NOTE: Training consistency (28d workouts) is computed client-side from
 * IndexedDB (local workout sessions) since workout logs live in Dexie.
 * The server provides nutrition + progress signals only.
 */
export const getKpiSnapshot = query({
  args: {
    tokenIdentifier: v.string(),
  },
  handler: async (ctx: QueryCtx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) {
      return null;
    }

    // --- Active Routine ---
    const activeRoutine = await ctx.db
      .query("userActiveRoutines")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const activePlanId = user.currentPlanId ?? activeRoutine?.planId;

    let activePlanInfo: {
      planId: string;
      programId: string;
      programTitle: string;
      variant: string;
      difficulty: string;
      daysPerWeek: number;
      nextDayIndex: number;
    } | null = null;

    if (activePlanId) {
      const plan = await ctx.db.get(activePlanId);
      if (plan) {
        const program = await ctx.db.get(plan.programId);
        activePlanInfo = {
          planId: plan._id,
          programId: plan.programId,
          programTitle: program?.title ?? "Unknown Program",
          variant: plan.variant.splitFreq,
          difficulty: plan.variant.difficulty,
          daysPerWeek: plan.days.length,
          nextDayIndex: activeRoutine?.dayOrder?.[0]?.dayIndex ?? 0,
        };
      }
    }

    // --- Nutrition Adaptive Signals ---
    const progressSignal = await ctx.db
      .query("nutritionAdaptiveSignals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const progressClassification = progressSignal?.progressClassification ?? "insufficient_data";
    const weeklyWeightDeltaKg = progressSignal?.weeklyWeightDeltaKg ?? 0;
    const proteinAdequacyRatio7d = progressSignal?.proteinAdequacyRatio7d ?? 0;
    const dailyCalorieDelta7d = progressSignal?.dailyCalorieDelta7d ?? 0;
    const progressSummary = progressSignal?.progressSummary ?? null;
    const lastWeightLogAt = progressSignal?.lastWeightLogAt ?? user.lastWeightLogAt ?? null;
    const nutritionConfidence = progressSignal?.adjustmentConfidence ?? 0;

    // --- Nutrition Consistency (7d meal logging) ---
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const recentMealLogs = await ctx.db
      .query("mealLogs")
      .withIndex("by_user_time", (q) =>
        q.eq("userId", user._id).gte("timestamp", sevenDaysAgo),
      )
      .collect();

    const mealDays7 = new Set(
      recentMealLogs.map((log) => new Date(log.timestamp).toDateString()),
    ).size;

    const nutritionConsistency7d = Math.round((mealDays7 / 7) * 100);

    return {
      // User context
      userName: user.name,

      // Progress Signal
      progress: {
        classification: progressClassification,
        weeklyWeightDeltaKg,
        summary: progressSummary,
        confidence: nutritionConfidence,
        lastWeightLogAt,
      },

      // Nutrition Adherence
      nutrition: {
        proteinAdequacyRatio7d,
        dailyCalorieDelta7d,
        consistency7d: nutritionConsistency7d,
        mealDaysLogged7d: mealDays7,
      },

      // Active Plan
      activePlan: activePlanInfo,

      // Timestamps
      snapshotAt: now,
    };
  },
});
