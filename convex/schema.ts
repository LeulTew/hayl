import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
    country: v.string(),
    isPremium: v.boolean(),
    subscriptionProvider: v.union(
      v.literal('telebirr'),
      v.literal('chapa'),
      v.literal('stripe'),
      v.literal('none')
    ),
    lastPaymentId: v.optional(v.string()),
    subscriptionExpiry: v.optional(v.number()),
  }).index("by_token", ["tokenIdentifier"]),

  programs: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    difficulty: v.string(), // 'amateur'|'intermediate'|'elite'
    isPremium: v.boolean(),
    canonicalVersion: v.number(), // increment on significant edits
    metadata: v.object({
      durationOptions: v.array(v.number()), // e.g., [60,90]
      splitOptions: v.array(v.string()), // '2day','3day'...
    }),
  }),

  // Nested structure is stored as typed object with controlled shapes
  workouts: defineTable({
    programId: v.id("programs"),
    title: v.string(),
    order: v.number(),
    days: v.array(v.object({
      dayIndex: v.number(),
      title: v.string(),
      phases: v.array(v.object({
        phaseType: v.union(v.literal('warmup'), v.literal('workout'), v.literal('stretch')),
        items: v.array(v.object({
          exerciseId: v.id("exercises"),
          reps: v.string(),
          sets: v.number(),
          tempo: v.optional(v.string()),
          notes: v.optional(v.string())
        }))
      }))
    }))
  }),

  exercises: defineTable({
    name: v.string(),
    muscleGroup: v.string(),
    assetIds: v.array(v.string()), // references to assets table
    canonicalAliases: v.array(v.string()),
    instructions: v.string(),
  }).searchIndex("search_name", { searchField: "name" }),

  assets: defineTable({
    exerciseId: v.optional(v.id("exercises")),
    originalSource: v.string(),
    robotsChecked: v.boolean(),
    licenseType: v.optional(v.string()),
    licenseText: v.optional(v.string()),
    cachedUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    ingestDate: v.number(),
    uploader: v.optional(v.string()),
  }),

  derivedPlans: defineTable({
    title: v.string(),
    source_refs: v.array(v.object({ docId: v.string(), anchor: v.optional(v.string()), note: v.optional(v.string()) })),
    days: v.any(), // intentionally generic but avoid v.any() in mutation validations
    changelog: v.string(),
    author: v.string(),
    published: v.boolean(),
    requires_human_review: v.boolean(),
  }),

  payments: defineTable({
    userId: v.optional(v.id("users")),
    provider: v.union(v.literal('telebirr'), v.literal('chapa'), v.literal('stripe')),
    transactionId: v.string(),
    amountCents: v.number(),
    currency: v.string(),
    state: v.string(),
    receivedAt: v.number(),
  }).index("by_transaction", ["transactionId"]),

  auditLogs: defineTable({
    actor: v.optional(v.string()),
    correlationId: v.string(),
    action: v.string(),
    details: v.string(),
    createdAt: v.number()
  })
});
