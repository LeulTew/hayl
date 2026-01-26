import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
    country: v.string(),
    isPremium: v.boolean(),
    subscriptionProvider: v.union(v.literal('telebirr'), v.literal('chapa'), v.literal('stripe'), v.literal('none')),
    lastPaymentId: v.optional(v.string()),
    subscriptionExpiry: v.optional(v.number()),
  }).index("by_token", ["tokenIdentifier"]),

  exercises: defineTable({
    name: v.string(),
    muscleGroup: v.string(),
    assetIds: v.array(v.string()),
    instructions: v.string(),
  }).searchIndex("search_name", { searchField: "name" }),

  programs: defineTable({
    title: v.string(),
    level: v.string(),
    isPremium: v.boolean(),
  }),

  workouts: defineTable({
    programId: v.id("programs"),
    title: v.string(),
    order: v.number(),
    blocks: v.any(),
  }),

  // Plans derived from reference docs
  derivedPlans: defineTable({
    title: v.string(),
    source_refs: v.array(v.object({
      docId: v.string(),
      anchor: v.optional(v.string()),
      note: v.optional(v.string())
    })),
    days: v.any(),
    changelog: v.string(),
    author: v.string(),
    published: v.boolean(),
  })
});
