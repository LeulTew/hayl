import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // --- 1. PROGRAM DEFINITIONS ---

  programs: defineTable({
    slug: v.string(),
    title: v.string(),
    canonicalVersion: v.string(),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("elite")
    ),
    splitType: v.union(
      v.literal("1-day"),
      v.literal("2-day"),
      v.literal("3-day"),
      v.literal("4-day"),
      v.literal("upper-lower"),
      v.literal("ppl")
    ),
    isPremium: v.boolean(),
    published: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"]),

  // --- 2. DERIVED WORKOUT STRUCTURE ---

  derivedPlans: defineTable({
    programId: v.id("programs"),
    version: v.string(),

    author: v.string(),
    
    // VARIANT ENGINE: Support combinatoric complexity (Duration x Split x Level)
    variant: v.object({
      difficulty: v.union(v.literal("amateur"), v.literal("intermediate"), v.literal("elite")),
      splitFreq: v.string(), // e.g. "2-day", "4-day", "2-day-twice"
      durationMinutes: v.number(), // 60, 90
      
      // Future-proofing: Allow arbitrary tags for new categorization dimensions
      tags: v.optional(v.array(v.string())), 
      equipment_needed: v.optional(v.array(v.string())),
    }),

    // --- RICH CONTENT (GUIDE VIEW) ---
    description: v.string(), // Short snippet for cards
    overview_markdown: v.optional(v.string()), // Full "Start Here" intro
    schedule_markdown: v.optional(v.string()), // "How to run this split"
    philosophy_markdown: v.optional(v.string()), // "Why this works" (Science based)

    source_refs: v.array(v.object({
      docId: v.string(),
      page: v.optional(v.number()),
      note: v.string(),
    })),

    requires_human_review: v.boolean(),
    reviewedBy: v.optional(v.string()),

    days: v.array(v.object({
      title: v.string(),
      dayIndex: v.number(),
      phases: v.array(v.object({
        name: v.union(
          v.literal("warmup"),
          v.literal("main"),
          v.literal("accessory"),
          v.literal("stretch")
        ),
        items: v.array(v.object({
          exerciseId: v.id("exercises"),
          sets: v.number(),
          reps: v.string(),
          rpe: v.optional(v.number()),
          restSeconds: v.number(),
          note: v.optional(v.string()),
        })),
      })),
    })),

    changelog: v.string(),
    createdAt: v.number(),
  })
    .index("by_program_version", ["programId", "version"])
    .index("by_programId", ["programId"]),

  // --- 3. EXERCISES & ASSETS ---

  exercises: defineTable({
    name: v.string(),
    muscleGroup: v.string(),

    visualAsset: v.optional(v.object({
      url: v.string(),
      type: v.union(
        v.literal("mp4"),
        v.literal("gif"),
        v.literal("webm")
      ),
      licenseType: v.union(
        v.literal("licensed"),
        v.literal("public_domain"),
        v.literal("own_creation")
      ),
      robotsChecked: v.boolean(),
      originalSource: v.string(),
      ingestedBy: v.string(),
      checksum: v.string(),
      contentLength: v.number(),
    })),

    instructions: v.string(),
  })
    .index("by_name", ["name"])
    .searchIndex("search_name", { searchField: "name" }),

  quotes: defineTable({
    text: v.string(),
    author: v.string(),
    tags: v.array(v.string()),
    contextTrigger: v.optional(v.string()),
  }).index("by_text", ["text"]),

  // --- 4. USERS & PAYMENTS ---

  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    isPremium: v.boolean(),
    // Legacy (Deprecated in favor of specific plan)
    currentProgramId: v.optional(v.id("programs")),
    
    // Phase 6: Precise Tracking
    currentPlanId: v.optional(v.id("derivedPlans")),
    programStartDate: v.optional(v.number()),

    // Phase 7: Smart Recommendations
    experienceLevel: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("elite"))),
    primaryGoal: v.optional(v.string()), // e.g., "hypertrophy", "strength", "endurance"
    
    
    createdAt: v.number(),
  }).index("by_token", ["tokenIdentifier"]),

  telebirrTransactions: defineTable({
    transactionId: v.string(),
    userId: v.id("users"),
    amountCents: v.number(),
    currency: v.literal("ETB"),
    status: v.union(
      v.literal("PENDING"),
      v.literal("COMPLETED"),
      v.literal("FAILED")
    ),
    rawPayload: v.string(),
    receivedAt: v.number(),
  }).index("by_txn_id", ["transactionId"]),

  auditLogs: defineTable({
    action: v.string(),
    actor: v.string(),
    contextId: v.optional(v.string()),
    details: v.string(),
    timestamp: v.number(),
  }).index("by_action_time", ["action", "timestamp"]),

  // --- 5. NUTRITION ---

  ingredients: defineTable({
    name: v.string(),
    amharicName: v.optional(v.string()),
    calories: v.number(), // per 100g
    protein: v.number(),
    carbs: v.number(),
    fats: v.number(),
    fiber: v.number(),
    category: v.union(
      v.literal("grain"),
      v.literal("legume"),
      v.literal("meat"),
      v.literal("vegetable"),
      v.literal("other")
    ),
    isLocal: v.boolean(),
  })
    .index("by_name", ["name"])
    .index("by_isLocal", ["isLocal"])
    .searchIndex("search_name", { searchField: "name" }),

  mealPlans: defineTable({
    title: v.string(),
    description: v.string(),
    goal: v.union(v.literal("cut"), v.literal("bulk"), v.literal("maintain")),
    budget: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    totalCalories: v.number(),
    meals: v.array(v.object({
      name: v.string(),
      ingredients: v.array(v.object({
        ingredientId: v.id("ingredients"),
        amountGrams: v.number(),
      })),
    })),
  }),
});
