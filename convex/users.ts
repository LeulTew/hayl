
import { v } from "convex/values";
import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { normalizeDayOrder } from "./routinesLogic";
import { clamp, classifyWeightProgress, computeTdee, deriveMacroTargets, round1 } from "./fuelEngine";

async function maybeInsertWeightLog(
  ctx: MutationCtx,
  userId: Id<"users">,
  weightKg: number | undefined,
  loggedAt: number,
  source: "onboarding" | "profile_edit" | "reminder",
) {
  if (!weightKg || !Number.isFinite(weightKg) || weightKg <= 0) return;

  const latest = await ctx.db
    .query("weightLogs")
    .withIndex("by_user_loggedAt", (q) => q.eq("userId", userId))
    .order("desc")
    .first();

  if (latest) {
    const hoursSinceLast = (loggedAt - latest.loggedAt) / (60 * 60 * 1000);
    const change = Math.abs(weightKg - latest.weightKg);
    // Avoid duplicate near-identical samples.
    if (hoursSinceLast < 18 && change < 0.05) {
      return;
    }
  }

  await ctx.db.insert("weightLogs", {
    userId,
    weightKg,
    loggedAt,
    source,
    createdAt: Date.now(),
  });
}

async function recomputeAdaptiveSignals(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    goal: "cut" | "maintain" | "bulk";
    weightKg: number;
    heightCm: number;
    age: number;
    gender: "male" | "female";
    activityLevel: "sedentary" | "light" | "moderate" | "active" | "athlete";
    bodyFatPercent?: number;
    lastWeightLogAt?: number;
  },
) {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const twentyEightDaysAgo = now - 28 * 24 * 60 * 60 * 1000;

  const logs28 = await ctx.db
    .query("mealLogs")
    .withIndex("by_user_time", (q) =>
      q.eq("userId", args.userId).gte("timestamp", twentyEightDaysAgo),
    )
    .collect();

  const logs7 = logs28.filter((log) => log.timestamp >= sevenDaysAgo);
  const mealDays7 = new Set(logs7.map((log) => new Date(log.timestamp).toDateString())).size;
  const mealDays28 = new Set(logs28.map((log) => new Date(log.timestamp).toDateString())).size;
  const consistency7d = round1((mealDays7 / 7) * 100);
  const consistency28d = round1((mealDays28 / 28) * 100);

  const avgDailyCalories7d = round1(logs7.reduce((acc, log) => acc + log.totals.calories, 0) / 7);
  const avgDailyProtein7d = round1(logs7.reduce((acc, log) => acc + log.totals.protein, 0) / 7);

  const energy = computeTdee({
    weightKg: args.weightKg,
    heightCm: args.heightCm,
    age: args.age,
    gender: args.gender,
    activityLevel: args.activityLevel,
    bodyFatPercent: args.bodyFatPercent,
  });

  const calorieDeltaFromTdee = round1(avgDailyCalories7d - energy.tdee);
  const proteinTarget = deriveMacroTargets({
    calories: Math.max(1200, energy.tdee),
    weightKg: args.weightKg,
    goal: args.goal,
  }).protein;
  const proteinAdequacyRatio7d = proteinTarget > 0
    ? round1(avgDailyProtein7d / proteinTarget)
    : 1;

  const recentWeights = await ctx.db
    .query("weightLogs")
    .withIndex("by_user_loggedAt", (q) => q.eq("userId", args.userId))
    .order("desc")
    .take(2);

  const newest = recentWeights[0];
  const older = recentWeights[1];

  const weightDeltaKg = newest && older
    ? round1(newest.weightKg - older.weightKg)
    : 0;

  const daysBetweenLogs = newest && older
    ? Math.max(0, (newest.loggedAt - older.loggedAt) / (24 * 60 * 60 * 1000))
    : 0;

  const progress = classifyWeightProgress({
    goal: args.goal,
    weightDeltaKg,
    daysBetweenLogs,
    calorieDeltaFromTdee,
    proteinAdequacyRatio: proteinAdequacyRatio7d,
  });

  const existing = await ctx.db
    .query("nutritionAdaptiveSignals")
    .withIndex("by_user", (q) => q.eq("userId", args.userId))
    .first();

  const payload = {
    consistency7d,
    consistency28d,
    averageDailyCalories7d: avgDailyCalories7d,
    averageDailyProtein7d: avgDailyProtein7d,
    adjustmentConfidence: clamp((consistency7d + consistency28d + progress.confidence) / 3, 0, 100),
    weeklyWeightDeltaKg: progress.weeklyRateKg,
    dailyCalorieDelta7d: calorieDeltaFromTdee,
    proteinAdequacyRatio7d,
    progressClassification: progress.classification,
    progressSummary: progress.summary,
    lastWeightLogAt: args.lastWeightLogAt,
    lastRecommendationAt: now,
    updatedAt: now,
  };

  if (existing) {
    await ctx.db.patch(existing._id, payload);
    return;
  }

  await ctx.db.insert("nutritionAdaptiveSignals", {
    userId: args.userId,
    notes: undefined,
    ...payload,
  });
}

async function syncUserActiveRoutine(
  ctx: MutationCtx,
  userId: Id<"users">,
  currentPlanId: Id<"derivedPlans">,
  programStartDate?: number,
) {
  const plan = await ctx.db.get(currentPlanId);
  if (!plan) {
    return;
  }

  const now = Date.now();
  const dayOrder = normalizeDayOrder(plan.days);

  const activeRoutines = await ctx.db
    .query("userActiveRoutines")
    .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
    .collect();

  for (const activeRoutine of activeRoutines) {
    if (activeRoutine.planId === currentPlanId) {
      continue;
    }
    await ctx.db.patch(activeRoutine._id, {
      isActive: false,
      updatedAt: now,
    });
  }

  const existingRoutine = await ctx.db
    .query("userActiveRoutines")
    .withIndex("by_user_plan", (q) => q.eq("userId", userId).eq("planId", currentPlanId))
    .first();

  if (existingRoutine) {
    await ctx.db.patch(existingRoutine._id, {
      programId: plan.programId,
      dayOrder: normalizeDayOrder(plan.days, existingRoutine.dayOrder),
      isActive: true,
      startedAt: existingRoutine.startedAt ?? programStartDate ?? now,
      updatedAt: now,
    });
    return;
  }

  await ctx.db.insert("userActiveRoutines", {
    userId,
    planId: currentPlanId,
    programId: plan.programId,
    dayOrder,
    isActive: true,
    startedAt: programStartDate ?? now,
    updatedAt: now,
    createdAt: now,
  });
}

/**
 * Gets the current user's profile from the backend.
 * Used for conflict resolution or initial sync.
 */
export const getUserProfile = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();
  },
});

/**
 * Syncs local user profile changes to the backend.
 * Upserts the user record.
 */
export const syncUserProfile = mutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.string(),
    currentPlanId: v.optional(v.id("derivedPlans")),
    programStartDate: v.optional(v.number()),
    // Phase 7: Profile Expansion
    experience: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("elite"))),
    goal: v.optional(v.string()),
    nutritionGoal: v.optional(v.union(v.literal("cut"), v.literal("maintain"), v.literal("bulk"))),
    weightKg: v.optional(v.number()),
    heightCm: v.optional(v.number()),
    age: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    activityLevel: v.optional(v.union(
      v.literal("sedentary"),
      v.literal("light"),
      v.literal("moderate"),
      v.literal("active"),
      v.literal("athlete"),
    )),
    bodyFatPercent: v.optional(v.number()),
    preferredMealsPerDay: v.optional(v.number()),
    lastWeightLogAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (existing) {
      const shouldTrackWeight = typeof args.weightKg === "number" && Number.isFinite(args.weightKg) && args.weightKg > 0;
      const inferredLogAt = args.lastWeightLogAt ?? (shouldTrackWeight ? Date.now() : existing.lastWeightLogAt);

      await ctx.db.patch(existing._id, {
        name: args.name,
        currentPlanId: args.currentPlanId,
        programStartDate: args.programStartDate,
        experienceLevel: args.experience,
        primaryGoal: args.goal,
        nutritionGoal: args.nutritionGoal,
        weightKg: args.weightKg,
        heightCm: args.heightCm,
        age: args.age,
        gender: args.gender,
        activityLevel: args.activityLevel,
        bodyFatPercent: args.bodyFatPercent,
        preferredMealsPerDay: args.preferredMealsPerDay,
        lastWeightLogAt: inferredLogAt,
      });

      if (shouldTrackWeight) {
        const currentWeightKg = args.weightKg as number;
        const source = args.lastWeightLogAt ? "reminder" : existing.weightKg ? "profile_edit" : "onboarding";
        await maybeInsertWeightLog(
          ctx,
          existing._id,
          currentWeightKg,
          inferredLogAt ?? Date.now(),
          source,
        );

        await recomputeAdaptiveSignals(ctx, {
          userId: existing._id,
          goal: args.nutritionGoal ?? (args.goal === "cut" || args.goal === "bulk" || args.goal === "maintain" ? args.goal : "maintain"),
          weightKg: currentWeightKg,
          heightCm: args.heightCm ?? existing.heightCm ?? 175,
          age: args.age ?? existing.age ?? 25,
          gender: args.gender ?? existing.gender ?? "male",
          activityLevel: args.activityLevel ?? existing.activityLevel ?? "moderate",
          bodyFatPercent: args.bodyFatPercent ?? existing.bodyFatPercent,
          lastWeightLogAt: inferredLogAt,
        });
      }

      if (args.currentPlanId) {
        await syncUserActiveRoutine(
          ctx,
          existing._id,
          args.currentPlanId,
          args.programStartDate,
        );
      }

      return existing._id;
    } else {
      const id = await ctx.db.insert("users", {
        tokenIdentifier: args.tokenIdentifier,
        name: args.name,
        isPremium: false,
        currentPlanId: args.currentPlanId,
        programStartDate: args.programStartDate,
        experienceLevel: args.experience,
        primaryGoal: args.goal,
        nutritionGoal: args.nutritionGoal,
        weightKg: args.weightKg,
        heightCm: args.heightCm,
        age: args.age,
        gender: args.gender,
        activityLevel: args.activityLevel,
        bodyFatPercent: args.bodyFatPercent,
        preferredMealsPerDay: args.preferredMealsPerDay,
        lastWeightLogAt: args.lastWeightLogAt ?? (args.weightKg ? Date.now() : undefined),
        createdAt: Date.now(),
      });

      if (typeof args.weightKg === "number" && Number.isFinite(args.weightKg) && args.weightKg > 0) {
        const logAt = args.lastWeightLogAt ?? Date.now();
        await maybeInsertWeightLog(ctx, id, args.weightKg, logAt, "onboarding");
        await recomputeAdaptiveSignals(ctx, {
          userId: id,
          goal: args.nutritionGoal ?? (args.goal === "cut" || args.goal === "bulk" || args.goal === "maintain" ? args.goal : "maintain"),
          weightKg: args.weightKg,
          heightCm: args.heightCm ?? 175,
          age: args.age ?? 25,
          gender: args.gender ?? "male",
          activityLevel: args.activityLevel ?? "moderate",
          bodyFatPercent: args.bodyFatPercent,
          lastWeightLogAt: logAt,
        });
      }

      if (args.currentPlanId) {
        await syncUserActiveRoutine(
          ctx,
          id,
          args.currentPlanId,
          args.programStartDate,
        );
      }

      return id;
    }
  },
});
