
import { v } from "convex/values";
import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { normalizeDayOrder } from "./routinesLogic";

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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (existing) {
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
      });

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
        createdAt: Date.now(),
      });

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
