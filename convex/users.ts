
import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";

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
    goal: v.optional(v.string())
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
        primaryGoal: args.goal
      });
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
        createdAt: Date.now(),
      });
      return id;
    }
  },
});
