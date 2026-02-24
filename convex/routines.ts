import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  buildReorderedDayOrder,
  calculateStreakDaysFromLogs,
  getLocalDayStart,
  normalizeDayOrder,
  resolveNextDayIndex,
} from "./routinesLogic";

type RoutineDoc = Doc<"userActiveRoutines">;
type UserDoc = Doc<"users">;
type PlanDoc = Doc<"derivedPlans">;

async function getUserByToken(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
): Promise<UserDoc | null> {
  return ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
    .first();
}

async function getPlanOrThrow(
  ctx: QueryCtx | MutationCtx,
  planId: Id<"derivedPlans">,
): Promise<PlanDoc> {
  const plan = await ctx.db.get(planId);
  if (!plan) {
    throw new Error("Routine plan not found");
  }
  return plan;
}

async function getRoutineByUserAndPlan(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  planId: Id<"derivedPlans">,
): Promise<RoutineDoc | null> {
  return ctx.db
    .query("userActiveRoutines")
    .withIndex("by_user_plan", (q) => q.eq("userId", userId).eq("planId", planId))
    .first();
}

async function deactivateOtherRoutines(
  ctx: MutationCtx,
  userId: Id<"users">,
  activePlanId: Id<"derivedPlans">,
): Promise<void> {
  const activeRoutines = await ctx.db
    .query("userActiveRoutines")
    .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
    .collect();

  for (const routine of activeRoutines) {
    if (routine.planId === activePlanId) {
      continue;
    }

    await ctx.db.patch(routine._id, {
      isActive: false,
      updatedAt: Date.now(),
    });
  }
}

async function upsertUserRoutine(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    plan: PlanDoc;
    startedAt: number;
    dayOrder: RoutineDoc["dayOrder"];
    markAsActive: boolean;
  },
): Promise<RoutineDoc> {
  const now = Date.now();
  const existing = await getRoutineByUserAndPlan(ctx, args.userId, args.plan._id);

  if (args.markAsActive) {
    await deactivateOtherRoutines(ctx, args.userId, args.plan._id);
  }

  if (existing) {
    await ctx.db.patch(existing._id, {
      programId: args.plan.programId,
      dayOrder: args.dayOrder,
      isActive: args.markAsActive,
      startedAt: existing.startedAt ?? args.startedAt,
      updatedAt: now,
    });

    const updated = await ctx.db.get(existing._id);
    if (!updated) {
      throw new Error("Failed to update active routine");
    }
    return updated;
  }

  const routineId = await ctx.db.insert("userActiveRoutines", {
    userId: args.userId,
    planId: args.plan._id,
    programId: args.plan.programId,
    dayOrder: args.dayOrder,
    isActive: args.markAsActive,
    startedAt: args.startedAt,
    updatedAt: now,
    createdAt: now,
  });

  const created = await ctx.db.get(routineId);
  if (!created) {
    throw new Error("Failed to create active routine");
  }
  return created;
}

async function getRoutineLogs(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  planId: Id<"derivedPlans">,
) {
  return ctx.db
    .query("routineDayLogs")
    .withIndex("by_user_plan_completedAt", (q) =>
      q.eq("userId", userId).eq("planId", planId),
    )
    .collect();
}

async function buildRoutineState(
  ctx: QueryCtx | MutationCtx,
  args: {
    user: UserDoc;
    plan: PlanDoc;
    routine: RoutineDoc | null;
  },
) {
  const dayOrder = normalizeDayOrder(args.plan.days, args.routine?.dayOrder);
  const logs = await getRoutineLogs(ctx, args.user._id, args.plan._id);
  const streakDays = calculateStreakDaysFromLogs(logs);
  const nextDayIndex = resolveNextDayIndex(logs.length, dayOrder);

  return {
    userId: args.user._id,
    planId: args.plan._id,
    programId: args.plan.programId,
    startedAt:
      args.routine?.startedAt ??
      args.user.programStartDate ??
      args.user.createdAt,
    isActive: args.routine?.isActive ?? false,
    dayOrder,
    completedSessionsCount: logs.length,
    streakDays,
    nextDayIndex,
    legacyFallback: args.routine === null,
  };
}

/**
 * Gets the user's currently active workout routine state.
 *
 * @param tokenIdentifier - User's auth token
 * @returns Routine state (day order, streak, next day) or null if no user/plan
 * @failure Returns null if user not found or no active plan set
 */
export const getActiveRoutine = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.tokenIdentifier);
    if (!user) {
      return null;
    }

    const activeRoutine = await ctx.db
      .query("userActiveRoutines")
      .withIndex("by_user_active", (q) => q.eq("userId", user._id).eq("isActive", true))
      .first();

    const targetPlanId = user.currentPlanId ?? activeRoutine?.planId;
    if (!targetPlanId) {
      return null;
    }

    const plan = await getPlanOrThrow(ctx, targetPlanId);
    const routine =
      activeRoutine && activeRoutine.planId === targetPlanId
        ? activeRoutine
        : await getRoutineByUserAndPlan(ctx, user._id, targetPlanId);

    return buildRoutineState(ctx, {
      user,
      plan,
      routine,
    });
  },
});

/**
 * Activates a workout routine for the user, deactivating any others.
 *
 * @param tokenIdentifier - User's auth token
 * @param planId - The derived plan to activate
 * @param startedAt - Optional start timestamp (defaults to now)
 * @returns Updated routine state
 * @failure Throws if user not found or plan not found
 */
export const activateRoutine = mutation({
  args: {
    tokenIdentifier: v.string(),
    planId: v.id("derivedPlans"),
    startedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.tokenIdentifier);
    if (!user) {
      throw new Error("User profile not found");
    }

    const plan = await getPlanOrThrow(ctx, args.planId);
    const dayOrder = normalizeDayOrder(plan.days);
    const startedAt = args.startedAt ?? user.programStartDate ?? Date.now();

    const routine = await upsertUserRoutine(ctx, {
      userId: user._id,
      plan,
      startedAt,
      dayOrder,
      markAsActive: true,
    });

    await ctx.db.patch(user._id, {
      currentPlanId: args.planId,
      programStartDate: startedAt,
    });

    return buildRoutineState(ctx, {
      user: {
        ...user,
        currentPlanId: args.planId,
        programStartDate: startedAt,
      },
      plan,
      routine,
    });
  },
});

/**
 * Reorders the days within the user's active routine.
 *
 * @param tokenIdentifier - User's auth token
 * @param orderedDayIndexes - New day order as array of day indexes
 * @param planId - Optional plan ID (defaults to user's current plan)
 * @returns Updated routine state with new day order
 * @failure Throws if user not found or no active routine exists
 */
export const reorderActiveRoutineDays = mutation({
  args: {
    tokenIdentifier: v.string(),
    orderedDayIndexes: v.array(v.number()),
    planId: v.optional(v.id("derivedPlans")),
  },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.tokenIdentifier);
    if (!user) {
      throw new Error("User profile not found");
    }

    const targetPlanId = args.planId ?? user.currentPlanId;
    if (!targetPlanId) {
      throw new Error("No active routine to reorder");
    }

    const plan = await getPlanOrThrow(ctx, targetPlanId);
    const dayOrder = buildReorderedDayOrder(plan.days, args.orderedDayIndexes);
    const startedAt = user.programStartDate ?? Date.now();

    const routine = await upsertUserRoutine(ctx, {
      userId: user._id,
      plan,
      startedAt,
      dayOrder,
      markAsActive: true,
    });

    await ctx.db.patch(routine._id, {
      lastReorderedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.patch(user._id, {
      currentPlanId: targetPlanId,
      programStartDate: user.programStartDate ?? startedAt,
    });

    const refreshedRoutine = await getRoutineByUserAndPlan(ctx, user._id, targetPlanId);

    return buildRoutineState(ctx, {
      user: {
        ...user,
        currentPlanId: targetPlanId,
        programStartDate: user.programStartDate ?? startedAt,
      },
      plan,
      routine: refreshedRoutine,
    });
  },
});

/**
 * Logs completion of a specific training day within a routine.
 * Inserts a routineDayLog record and updates the routine state.
 *
 * @param tokenIdentifier - User's auth token
 * @param dayIndex - The day index that was completed
 * @param planId - Optional plan ID (defaults to user's current plan)
 * @param completedAt - Optional completion timestamp (defaults to now)
 * @param sessionRef - Optional reference to the local workout session ID
 * @returns Updated routine state with the logged day info
 * @failure Throws if user/plan not found or day index is invalid
 */
export const logRoutineDayCompletion = mutation({
  args: {
    tokenIdentifier: v.string(),
    dayIndex: v.number(),
    planId: v.optional(v.id("derivedPlans")),
    completedAt: v.optional(v.number()),
    sessionRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.tokenIdentifier);
    if (!user) {
      throw new Error("User profile not found");
    }

    const targetPlanId = args.planId ?? user.currentPlanId;
    if (!targetPlanId) {
      throw new Error("No active routine selected");
    }

    const plan = await getPlanOrThrow(ctx, targetPlanId);
    const knownDay = plan.days.find((day) => day.dayIndex === args.dayIndex);
    if (!knownDay) {
      throw new Error("Day index does not exist in plan");
    }

    const currentRoutine = await getRoutineByUserAndPlan(ctx, user._id, targetPlanId);
    const fallbackOrder = normalizeDayOrder(plan.days, currentRoutine?.dayOrder);
    const dayOrderEntry = fallbackOrder.find(
      (entry) => entry.dayIndex === args.dayIndex,
    );

    if (!dayOrderEntry) {
      throw new Error("Unable to resolve day order for routine day");
    }

    const completedAt = args.completedAt ?? Date.now();
    const completedDayStart = getLocalDayStart(completedAt);

    await ctx.db.insert("routineDayLogs", {
      userId: user._id,
      planId: targetPlanId,
      programId: plan.programId,
      dayIndex: args.dayIndex,
      day_order: dayOrderEntry.day_order,
      completedAt,
      completedDayStart,
      sessionRef: args.sessionRef,
      createdAt: Date.now(),
    });

    const routine = await upsertUserRoutine(ctx, {
      userId: user._id,
      plan,
      startedAt: user.programStartDate ?? Date.now(),
      dayOrder: fallbackOrder,
      markAsActive: true,
    });

    await ctx.db.patch(user._id, {
      currentPlanId: targetPlanId,
      programStartDate: user.programStartDate ?? routine.startedAt,
    });

    const state = await buildRoutineState(ctx, {
      user: {
        ...user,
        currentPlanId: targetPlanId,
        programStartDate: user.programStartDate ?? routine.startedAt,
      },
      plan,
      routine,
    });

    return {
      ...state,
      loggedDayIndex: args.dayIndex,
      loggedDayOrder: dayOrderEntry.day_order,
      loggedAt: completedAt,
    };
  },
});
