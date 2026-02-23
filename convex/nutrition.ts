import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import {
  clamp,
  computeTdee,
  deriveMacroTargets,
  round1,
} from "./fuelEngine";

const fuelUnitValidator = v.union(
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
);

/**
 * Seeds the ingredient database with Ethiopian and global staples.
 * Deduplicates by name using exact text match.
 * 
 * @param ingredients - Array of ingredient objects with macros
 * @returns void
 */
export const seedIngredients = mutation({
  args: {
    ingredients: v.array(
      v.object({
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
          unit: fuelUnitValidator,
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
    ),
    adminSecret: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("❌ Unauthorized: Invalid Admin Secret");
    }
    let inserted = 0;
    let updated = 0;

    for (const ing of args.ingredients) {
      // Check for existing ingredient by exact name match (indexed)
      const existing = await ctx.db
        .query("ingredients")
        .withIndex("by_name", (q) => q.eq("name", ing.name))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          amharicName: ing.amharicName,
          calories: ing.calories,
          protein: ing.protein,
          carbs: ing.carbs,
          fats: ing.fats,
          fiber: ing.fiber,
          nutritionBasis: ing.nutritionBasis,
          servingSizeGrams: ing.servingSizeGrams,
          servingLabel: ing.servingLabel,
          densityGPerMl: ing.densityGPerMl,
          commonMeasures: ing.commonMeasures,
          category: ing.category,
          isLocal: ing.isLocal,
          localeTags: ing.localeTags,
          sourceRefs: ing.sourceRefs,
        });
        updated++;
      } else {
        await ctx.db.insert("ingredients", ing);
        inserted++;
      }
    }

    console.log(`[SEED] Ingredients: ${inserted} inserted, ${updated} updated`);
  },
});

/**
 * Searches ingredients by name using full-text search.
 * 
 * @param query - The search term
 * @returns Up to 20 matching ingredients
 */
export const searchIngredients = query({
  args: { query: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    if (!args.query.trim()) {
      // Return all local ingredients if no query
      return await ctx.db
        .query("ingredients")
        .withIndex("by_isLocal", (q) => q.eq("isLocal", true))
        .take(20);
    }

    return await ctx.db
      .query("ingredients")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(20);
  },
});

/**
 * Gets a single ingredient by ID.
 * 
 * @param id - The Convex ID of the ingredient
 * @returns The ingredient document or null
 */
export const getIngredient = query({
  args: { id: v.id("ingredients") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Lists ingredients for admin/dashboard views.
 *
 * @param limit - Maximum rows to return (default 200, max 500).
 * @returns Up to `limit` ingredients.
 */
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx: QueryCtx, args) => {
    const cap = Math.min(args.limit ?? 200, 500);
    return await ctx.db.query("ingredients").take(cap);
  },
});

/**
 * Lists only local Ethiopian ingredients.
 *
 * @param limit - Maximum rows to return (default 100, max 300).
 * @returns Up to `limit` local ingredients.
 */
export const listLocal = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx: QueryCtx, args) => {
    const cap = Math.min(args.limit ?? 100, 300);
    return await ctx.db
      .query("ingredients")
      .withIndex("by_isLocal", (q) => q.eq("isLocal", true))
      .take(cap);
  },
});

export const suggestFuelPlan = query({
  args: {
    tokenIdentifier: v.string(),
    mealsPerDay: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found. Sync profile first.");
    }

    const profile = {
      weightKg: user.weightKg ?? 70,
      heightCm: user.heightCm ?? 175,
      age: user.age ?? 25,
      gender: user.gender ?? "male",
      activityLevel: user.activityLevel ?? "moderate",
      bodyFatPercent: user.bodyFatPercent,
      goal: user.nutritionGoal ?? (user.primaryGoal === "cut" || user.primaryGoal === "bulk" || user.primaryGoal === "maintain"
        ? user.primaryGoal
        : "maintain"),
      experienceLevel: user.experienceLevel ?? "intermediate",
      mealsPerDay: clamp(args.mealsPerDay ?? user.preferredMealsPerDay ?? 4, 2, 7),
    } as const;

    const energy = computeTdee({
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      age: profile.age,
      gender: profile.gender,
      activityLevel: profile.activityLevel,
      bodyFatPercent: profile.bodyFatPercent,
    });

    const calorieDelta = profile.goal === "cut" ? -450 : profile.goal === "bulk" ? 300 : 0;
    const targetCalories = Math.max(1200, energy.tdee + calorieDelta);

    const dailyTarget = deriveMacroTargets({
      calories: targetCalories,
      weightKg: profile.weightKg,
      experienceLevel: profile.experienceLevel,
      goal: profile.goal,
    });

    const perMeal = {
      calories: round1(dailyTarget.calories / profile.mealsPerDay),
      protein: round1(dailyTarget.protein / profile.mealsPerDay),
      carbs: round1(dailyTarget.carbs / profile.mealsPerDay),
      fats: round1(dailyTarget.fats / profile.mealsPerDay),
      fiber: round1(dailyTarget.fiber / profile.mealsPerDay),
    };

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twentyEightDaysAgo = now - 28 * 24 * 60 * 60 * 1000;

    const logs28 = await ctx.db
      .query("mealLogs")
      .withIndex("by_user_time", (q) =>
        q.eq("userId", user._id).gte("timestamp", twentyEightDaysAgo),
      )
      .collect();

    const logs7 = logs28.filter((log) => log.timestamp >= sevenDaysAgo);

    const mealDays7 = new Set(logs7.map((log) => new Date(log.timestamp).toDateString())).size;
    const mealDays28 = new Set(logs28.map((log) => new Date(log.timestamp).toDateString())).size;
    const consistency7d = round1((mealDays7 / 7) * 100);
    const consistency28d = round1((mealDays28 / 28) * 100);

    const total7 = logs7.reduce(
      (acc, log) => ({
        calories: acc.calories + log.totals.calories,
        protein: acc.protein + log.totals.protein,
      }),
      { calories: 0, protein: 0 },
    );

    const avgDailyCalories7d = round1(total7.calories / 7);
    const avgDailyProtein7d = round1(total7.protein / 7);

    const localIngredients = await ctx.db
      .query("ingredients")
      .withIndex("by_isLocal", (q) => q.eq("isLocal", true))
      .take(30);

    const proteinDense = [...localIngredients]
      .sort((left, right) => (right.protein / Math.max(1, right.calories)) - (left.protein / Math.max(1, left.calories)))
      .slice(0, 5)
      .map((item) => ({
        id: item._id,
        name: item.name,
        protein: item.protein,
        calories: item.calories,
        servingLabel: item.servingLabel,
      }));

    const carbDense = [...localIngredients]
      .sort((left, right) => right.carbs - left.carbs)
      .slice(0, 5)
      .map((item) => ({
        id: item._id,
        name: item.name,
        carbs: item.carbs,
        calories: item.calories,
      }));

    const suggestionNotes: string[] = [];
    if (profile.goal === "cut" && avgDailyCalories7d > dailyTarget.calories * 1.1) {
      suggestionNotes.push("Calories are trending above cut target. Reduce high-density side portions by 10-15%.");
    }
    if (avgDailyProtein7d < dailyTarget.protein * 0.85) {
      suggestionNotes.push("Protein intake is below target. Add one protein-focused component per meal.");
    }
    if (consistency7d < 50) {
      suggestionNotes.push("Meal logging consistency is low. Prioritize logging 2+ meals/day before making aggressive adjustments.");
    }

    const progressSignal = await ctx.db
      .query("nutritionAdaptiveSignals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (progressSignal?.progressSummary) {
      suggestionNotes.unshift(progressSignal.progressSummary);
    }

    return {
      profile,
      energy,
      target: {
        daily: dailyTarget,
        perMeal,
      },
      topFoods: {
        proteinDense,
        carbDense,
      },
      adaptiveHooks: {
        consistency7d,
        consistency28d,
        avgDailyCalories7d,
        avgDailyProtein7d,
        nextReviewAt: now + 7 * 24 * 60 * 60 * 1000,
        confidence: clamp((consistency28d + consistency7d) / 2, 0, 100),
        progressClassification: progressSignal?.progressClassification,
        weeklyWeightDeltaKg: progressSignal?.weeklyWeightDeltaKg,
        dailyCalorieDelta7d: progressSignal?.dailyCalorieDelta7d,
        proteinAdequacyRatio7d: progressSignal?.proteinAdequacyRatio7d,
        lastWeightLogAt: progressSignal?.lastWeightLogAt,
      },
      notes: suggestionNotes,
    };
  },
});

export const updateAdaptiveSignals = mutation({
  args: {
    tokenIdentifier: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twentyEightDaysAgo = now - 28 * 24 * 60 * 60 * 1000;

    const logs28 = await ctx.db
      .query("mealLogs")
      .withIndex("by_user_time", (q) =>
        q.eq("userId", user._id).gte("timestamp", twentyEightDaysAgo),
      )
      .collect();

    const logs7 = logs28.filter((log) => log.timestamp >= sevenDaysAgo);

    const consistency7d = round1((new Set(logs7.map((log) => new Date(log.timestamp).toDateString())).size / 7) * 100);
    const consistency28d = round1((new Set(logs28.map((log) => new Date(log.timestamp).toDateString())).size / 28) * 100);

    const avgDailyCalories7d = round1(
      logs7.reduce((acc, log) => acc + log.totals.calories, 0) / 7,
    );
    const avgDailyProtein7d = round1(
      logs7.reduce((acc, log) => acc + log.totals.protein, 0) / 7,
    );

    const existing = await ctx.db
      .query("nutritionAdaptiveSignals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const payload = {
      consistency7d,
      consistency28d,
      averageDailyCalories7d: avgDailyCalories7d,
      averageDailyProtein7d: avgDailyProtein7d,
      adjustmentConfidence: clamp((consistency7d + consistency28d) / 2, 0, 100),
      lastRecommendationAt: now,
      notes: args.notes,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("nutritionAdaptiveSignals", {
      userId: user._id,
      ...payload,
    });
  },
});
