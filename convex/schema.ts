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
    tutorialUrl: v.optional(v.string()), // Full instructional video (e.g. YouTube embed)

    media: v.optional(v.object({
      sourceUrl: v.string(),
      ingestedBy: v.string(),
      checksum: v.string(),
      width: v.number(),
      height: v.number(),
      aspectRatio: v.number(),
      durationMs: v.number(),
      variants: v.object({
        mp4: v.optional(v.object({
          storageId: v.id("_storage"),
          bytes: v.number(),
          mime: v.string(),
        })),
        webm: v.optional(v.object({
          storageId: v.id("_storage"),
          bytes: v.number(),
          mime: v.string(),
        })),
      }),
      placeholder: v.optional(v.object({
        posterStorageId: v.optional(v.id("_storage")),
        blurhash: v.optional(v.string()),
        lqipBase64: v.optional(v.string()),
      })),
      updatedAt: v.number(),
    })),

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
    
    
    createdAt: v.number(),
  }).index("by_token", ["tokenIdentifier"]),

  userActiveRoutines: defineTable({
    userId: v.id("users"),
    planId: v.id("derivedPlans"),
    programId: v.id("programs"),
    dayOrder: v.array(v.object({
      dayIndex: v.number(),
      day_order: v.number(),
    })),
    isActive: v.boolean(),
    startedAt: v.number(),
    lastReorderedAt: v.optional(v.number()),
    updatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_plan", ["userId", "planId"])
    .index("by_user_active", ["userId", "isActive"]),

  routineDayLogs: defineTable({
    userId: v.id("users"),
    planId: v.id("derivedPlans"),
    programId: v.id("programs"),
    dayIndex: v.number(),
    day_order: v.number(),
    completedAt: v.number(),
    completedDayStart: v.number(),
    sessionRef: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user_plan_completedAt", ["userId", "planId", "completedAt"])
    .index("by_user_plan_day_start", ["userId", "planId", "completedDayStart"])
    .index("by_user_plan_day_order", ["userId", "planId", "day_order", "completedAt"])
    .index("by_user_day_start", ["userId", "completedDayStart"]),

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
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fats: v.number(),
    fiber: v.number(),
    nutritionBasis: v.optional(v.union(v.literal("per_100g"), v.literal("per_serving"))),
    servingSizeGrams: v.optional(v.number()),
    servingLabel: v.optional(v.string()),
    densityGPerMl: v.optional(v.number()),
    commonMeasures: v.optional(v.array(v.object({
      unit: v.union(
        v.literal("grams"),
        v.literal("kg"),
        v.literal("ml"),
        v.literal("cups"),
        v.literal("tbsp"),
        v.literal("tsp"),
        v.literal("pieces"),
        v.literal("rolls"),
        v.literal("ladles"),
        v.literal("slices"),
        v.literal("patties"),
        v.literal("bowls"),
        v.literal("servings"),
      ),
      grams: v.number(),
      label: v.optional(v.string()),
    }))),
    category: v.union(
      v.literal("grain"),
      v.literal("legume"),
      v.literal("meat"),
      v.literal("vegetable"),
      v.literal("other")
    ),
    isLocal: v.boolean(),
    localeTags: v.optional(v.array(v.string())),
    sourceRefs: v.optional(v.array(v.string())),
  })
    .index("by_name", ["name"])
    .index("by_isLocal", ["isLocal"])
    .searchIndex("search_name", { searchField: "name" }),

  dishes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    components: v.array(v.object({
      ingredientId: v.id("ingredients"),
      amount: v.number(),
      unit: v.union(
        v.literal("grams"),
        v.literal("kg"),
        v.literal("ml"),
        v.literal("cups"),
        v.literal("tbsp"),
        v.literal("tsp"),
        v.literal("pieces"),
        v.literal("rolls"),
        v.literal("ladles"),
        v.literal("slices"),
        v.literal("patties"),
        v.literal("bowls"),
        v.literal("servings"),
      ),
    })),
    defaultServingGrams: v.number(),
    commonMeasures: v.optional(v.array(v.object({
      unit: v.union(
        v.literal("grams"),
        v.literal("kg"),
        v.literal("ml"),
        v.literal("cups"),
        v.literal("tbsp"),
        v.literal("tsp"),
        v.literal("pieces"),
        v.literal("rolls"),
        v.literal("ladles"),
        v.literal("slices"),
        v.literal("patties"),
        v.literal("bowls"),
        v.literal("servings"),
      ),
      grams: v.number(),
      label: v.optional(v.string()),
    }))),
    cachedNutritionPer100g: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fats: v.number(),
      fiber: v.number(),
    }),
    cachedNutritionPerServing: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fats: v.number(),
      fiber: v.number(),
      servingGrams: v.number(),
    }),
    isPublic: v.boolean(),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_public", ["isPublic"])
    .searchIndex("search_name", { searchField: "name" }),

  mealLogs: defineTable({
    userId: v.id("users"),
    name: v.string(),
    timestamp: v.number(),
    goalContext: v.optional(v.union(v.literal("cut"), v.literal("maintain"), v.literal("bulk"))),
    components: v.array(v.object({
      type: v.union(v.literal("base"), v.literal("topping"), v.literal("side")),
      itemId: v.union(v.id("ingredients"), v.id("dishes")),
      itemType: v.union(v.literal("ingredient"), v.literal("dish")),
      amount: v.number(),
      unit: v.union(
        v.literal("grams"),
        v.literal("kg"),
        v.literal("ml"),
        v.literal("cups"),
        v.literal("tbsp"),
        v.literal("tsp"),
        v.literal("pieces"),
        v.literal("rolls"),
        v.literal("ladles"),
        v.literal("slices"),
        v.literal("patties"),
        v.literal("bowls"),
        v.literal("servings"),
      ),
    })),
    normalizedComponents: v.array(v.object({
      itemId: v.union(v.id("ingredients"), v.id("dishes")),
      itemType: v.union(v.literal("ingredient"), v.literal("dish")),
      amount: v.number(),
      unit: v.union(
        v.literal("grams"),
        v.literal("kg"),
        v.literal("ml"),
        v.literal("cups"),
        v.literal("tbsp"),
        v.literal("tsp"),
        v.literal("pieces"),
        v.literal("rolls"),
        v.literal("ladles"),
        v.literal("slices"),
        v.literal("patties"),
        v.literal("bowls"),
        v.literal("servings"),
      ),
      grams: v.number(),
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fats: v.number(),
      fiber: v.number(),
    })),
    totals: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fats: v.number(),
      fiber: v.number(),
      totalGrams: v.number(),
    }),
    createdAt: v.number(),
  })
    .index("by_user_time", ["userId", "timestamp"])
    .index("by_user_created", ["userId", "createdAt"]),

  nutritionAdaptiveSignals: defineTable({
    userId: v.id("users"),
    consistency7d: v.number(),
    consistency28d: v.number(),
    averageDailyCalories7d: v.number(),
    averageDailyProtein7d: v.number(),
    lastRecommendationAt: v.optional(v.number()),
    adjustmentConfidence: v.number(),
    notes: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

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
