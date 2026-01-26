import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("programs").collect();
  },
});

export const getDerivedPlans = query({
  args: { programId: v.id("programs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("derivedPlans")
      .withIndex("by_programId", (q) => q.eq("programId", args.programId))
      .collect();
  },
});

export const getPlan = query({
  args: { planId: v.id("derivedPlans") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.planId);
  },
});
