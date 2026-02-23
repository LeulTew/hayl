import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  macrosFromDish,
  macrosFromIngredient,
  per100g,
  round1,
  sumMacros,
  type FuelUnit,
  type MacroVector,
} from "./fuelEngine";

// --- HELPERS ---

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

async function resolveMealComponent(
  ctx: QueryCtx,
  component: {
    itemId: Id<"ingredients"> | Id<"dishes">;
    itemType: "ingredient" | "dish";
    amount: number;
    unit: FuelUnit;
  },
): Promise<{ grams: number; macros: MacroVector; name: string } | null> {
  if (component.itemType === "ingredient") {
    const ingredient = await ctx.db.get(component.itemId);
    if (!ingredient || !("nutritionBasis" in ingredient)) return null;
    const normalized = macrosFromIngredient(ingredient, component.amount, component.unit);
    return { ...normalized, name: ingredient.name };
  }

  const dish = await ctx.db.get(component.itemId);
  if (!dish || !("defaultServingGrams" in dish)) return null;
  const normalized = macrosFromDish(dish, component.amount, component.unit);
  return { ...normalized, name: dish.name };
}

function isBaseName(name: string): boolean {
  return /(injera|rice|bread|kocho|kinche|genfo|nifro|oats|pasta|quinoa|bulgur|teff)/i.test(name);
}

function isSideName(name: string): boolean {
  return /(salad|fruit|sauce|dip|yogurt|banana|avocado|salsa|pickle|ayib|egg|olive|peanut|sesame|gomen|fosolia|atkilt)/i.test(name);
}

function isLayerName(name: string): boolean {
  return /(wat|wot|stew|sauce|tibs|kitfo|dulet|alicha|misir|shiro|bolognese|alfredo|arrabbiata|pesto)/i.test(name);
}

function matchesSearchContext(
  context: "base" | "topping" | "side" | undefined,
  params: { name: string; category?: "grain" | "legume" | "meat" | "vegetable" | "other"; type: "ingredient" | "dish" },
): boolean {
  if (!context) return true;

  const { name, category } = params;
  if (context === "base") {
    return category === "grain" || isBaseName(name);
  }

  if (context === "side") {
    // Side is intentionally broad enough to avoid "no results" frustration.
    return category === "other" || category === "vegetable" || isSideName(name);
  }

  // topping/layer should be substantial meal components, not bases or light sides.
  if (context === "topping") {
    if (isBaseName(name)) return false;
    if (isSideName(name) && !isLayerName(name)) return false;
    if (category === "meat" || category === "legume" || category === "vegetable") return true;
    if (params.type === "dish") return true;
    return isLayerName(name);
  }

  return true;
}

async function calculateDishNutrition(
  ctx: QueryCtx,
  components: { ingredientId: Id<"ingredients">; amount: number; unit: FuelUnit }[],
  defaultServingGrams: number,
) {
  const vectors: MacroVector[] = [];
  let totalGrams = 0;

  for (const component of components) {
    const ingredient = await ctx.db.get(component.ingredientId);
    if (!ingredient) continue;

    const normalized = macrosFromIngredient(ingredient, component.amount, component.unit);
    vectors.push(normalized.macros);
    totalGrams += normalized.grams;
  }

  const totals = sumMacros(vectors);
  const per100 = per100g(totals, totalGrams);
  const servingRatio = defaultServingGrams > 0 ? defaultServingGrams / 100 : 1;

  return {
    totals,
    totalGrams,
    per100,
    perServing: {
      calories: round1(per100.calories * servingRatio),
      protein: round1(per100.protein * servingRatio),
      carbs: round1(per100.carbs * servingRatio),
      fats: round1(per100.fats * servingRatio),
      fiber: round1(per100.fiber * servingRatio),
      servingGrams: defaultServingGrams,
    },
  };
}

async function getUserByTokenOrThrow(ctx: QueryCtx, tokenIdentifier: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
    .first();

  if (!user) {
    throw new Error("User not found. Sync profile first.");
  }

  return user;
}

// --- MUTATIONS ---

export const createDish = mutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    components: v.array(v.object({
      ingredientId: v.id("ingredients"),
      amount: v.number(),
      unit: fuelUnitValidator,
    })),
    defaultServingGrams: v.number(),
    commonMeasures: v.optional(v.array(v.object({
      unit: fuelUnitValidator,
      grams: v.number(),
      label: v.optional(v.string()),
    }))),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByTokenOrThrow(ctx, args.tokenIdentifier);

    const nutrition = await calculateDishNutrition(
      ctx,
      args.components,
      args.defaultServingGrams,
    );

    const dishId = await ctx.db.insert("dishes", {
      name: args.name,
      description: args.description,
      components: args.components,
      defaultServingGrams: args.defaultServingGrams,
      commonMeasures: args.commonMeasures,
      cachedNutritionPer100g: nutrition.per100,
      cachedNutritionPerServing: nutrition.perServing,
      isPublic: args.isPublic,
      createdBy: user.tokenIdentifier,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return dishId;
  },
});

export const logMeal = mutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.string(),
    timestamp: v.number(),
    goalContext: v.optional(v.union(v.literal("cut"), v.literal("maintain"), v.literal("bulk"))),
    components: v.array(v.object({
        type: v.union(v.literal("base"), v.literal("topping"), v.literal("side")),
        itemId: v.union(v.id("ingredients"), v.id("dishes")),
        itemType: v.union(v.literal("ingredient"), v.literal("dish")),
        amount: v.number(),
        unit: fuelUnitValidator,
      })),
  },
  handler: async (ctx, args) => {
    const user = await getUserByTokenOrThrow(ctx, args.tokenIdentifier);

    const normalizedComponents: {
      itemId: Id<"ingredients"> | Id<"dishes">;
      itemType: "ingredient" | "dish";
      name: string;
      amount: number;
      unit: FuelUnit;
      grams: number;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      fiber: number;
    }[] = [];

    for (const component of args.components) {
      const normalized = await resolveMealComponent(ctx, component);
      if (!normalized) continue;

      normalizedComponents.push({
        itemId: component.itemId,
        itemType: component.itemType,
        name: normalized.name,
        amount: component.amount,
        unit: component.unit,
        grams: round1(normalized.grams),
        calories: round1(normalized.macros.calories),
        protein: round1(normalized.macros.protein),
        carbs: round1(normalized.macros.carbs),
        fats: round1(normalized.macros.fats),
        fiber: round1(normalized.macros.fiber),
      });
    }

    const totals = normalizedComponents.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fats: acc.fats + item.fats,
        fiber: acc.fiber + item.fiber,
        totalGrams: acc.totalGrams + item.grams,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, totalGrams: 0 },
    );

    await ctx.db.insert("mealLogs", {
      userId: user._id,
      name: args.name,
      timestamp: args.timestamp,
      goalContext: args.goalContext,
      components: args.components,
      normalizedComponents,
      totals: {
        calories: round1(totals.calories),
        protein: round1(totals.protein),
        carbs: round1(totals.carbs),
        fats: round1(totals.fats),
        fiber: round1(totals.fiber),
        totalGrams: round1(totals.totalGrams),
      },
      createdAt: Date.now(),
    });

    return {
      ok: true,
      totals: {
        calories: round1(totals.calories),
        protein: round1(totals.protein),
        carbs: round1(totals.carbs),
        fats: round1(totals.fats),
        fiber: round1(totals.fiber),
      },
    };
  },
});

// --- QUERIES ---

export const searchFoods = query({
  args: {
    query: v.string(),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    context: v.optional(v.union(v.literal("base"), v.literal("topping"), v.literal("side"))),
  },
  handler: async (ctx, args) => {
    const query = args.query.trim();
    if (!query) {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      };
    }

    const page = Math.max(1, Math.floor(args.page ?? 1));
    const pageSize = Math.min(25, Math.max(1, Math.floor(args.pageSize ?? 10)));

    const [ingNames, ingAmharic, dishNames, dishAmharic] = await Promise.all([
      ctx.db.query("ingredients")
        .withSearchIndex("search_name", (q) => q.search("name", query))
        .take(60),
      ctx.db.query("ingredients")
        .withSearchIndex("search_amharic", (q) => q.search("amharicName", query))
        .take(60),
      ctx.db.query("dishes")
        .withSearchIndex("search_name", (q) => q.search("name", query))
        .take(60),
      ctx.db.query("dishes")
        .withSearchIndex("search_amharic", (q) => q.search("amharicName", query))
        .take(60),
    ]);

    // Unique ingredients/dishes
    const ingredients = [...ingNames, ...ingAmharic].filter(
      (v, i, a) => a.findIndex(t => t._id === v._id) === i
    );
    const dishes = [...dishNames, ...dishAmharic].filter(
      (v, i, a) => a.findIndex(t => t._id === v._id) === i
    );

    const mappedIngredients = ingredients.map(i => ({
      _id: i._id,
      name: i.name,
      amharicName: i.amharicName,
      type: "ingredient" as const,
      calories: i.nutritionBasis === "per_serving" && i.servingSizeGrams
        ? round1((i.calories / i.servingSizeGrams) * 100)
        : i.calories,
      protein: i.nutritionBasis === "per_serving" && i.servingSizeGrams
        ? round1((i.protein / i.servingSizeGrams) * 100)
        : i.protein,
      carbs: i.nutritionBasis === "per_serving" && i.servingSizeGrams
        ? round1((i.carbs / i.servingSizeGrams) * 100)
        : i.carbs,
      fats: i.nutritionBasis === "per_serving" && i.servingSizeGrams
        ? round1((i.fats / i.servingSizeGrams) * 100)
        : i.fats,
      fiber: i.nutritionBasis === "per_serving" && i.servingSizeGrams
        ? round1((i.fiber / i.servingSizeGrams) * 100)
        : i.fiber,
      description: i.amharicName ? `${i.amharicName} • Ingredient` : (i.servingLabel ? `Ingredient • ${i.servingLabel}` : "Raw Ingredient"),
      servingSizeGrams: i.servingSizeGrams,
      measures: i.commonMeasures ?? [],
      category: i.category,
    }));

    const mappedDishes = dishes.map(d => ({
      _id: d._id,
      name: d.name,
      type: "dish" as const,
      calories: d.cachedNutritionPer100g.calories,
      protein: d.cachedNutritionPer100g.protein,
      carbs: d.cachedNutritionPer100g.carbs,
      fats: d.cachedNutritionPer100g.fats,
      fiber: d.cachedNutritionPer100g.fiber,
      description: d.description || "Composite Dish",
      servingSizeGrams: d.defaultServingGrams,
      measures: d.commonMeasures ?? [],
    }));

    const allItems = [...mappedIngredients, ...mappedDishes].filter((item) =>
      matchesSearchContext(args.context, {
        name: item.name,
        category: "category" in item ? item.category : undefined,
        type: item.type,
      }),
    );
    const total = allItems.length;
    const start = (page - 1) * pageSize;
    const items = allItems.slice(start, start + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
    };
  },
});

export const seedEthiopianFoods = mutation({
  args: {
    foods: v.array(v.object({
      name: v.string(),
      amharicName: v.optional(v.string()),
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fats: v.number(),
      fiber: v.number(),
      category: v.union(v.literal("grain"), v.literal("legume"), v.literal("meat"), v.literal("vegetable"), v.literal("other")),
      isLocal: v.boolean(),
      nutritionBasis: v.union(v.literal("per_100g"), v.literal("per_serving")),
      commonMeasures: v.optional(v.array(v.object({
        unit: fuelUnitValidator,
        grams: v.number(),
        label: v.optional(v.string()),
      }))),
    })),
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const food of args.foods) {
      const existing = await ctx.db
        .query("ingredients")
        .withIndex("by_name", (q) => q.eq("name", food.name))
        .first();

      if (!existing) {
        await ctx.db.insert("ingredients", {
          name: food.name,
          amharicName: food.amharicName,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          fiber: food.fiber,
          category: food.category,
          isLocal: food.isLocal,
          commonMeasures: food.commonMeasures,
          nutritionBasis: food.nutritionBasis,
        });
        count++;
      }
    }
    return `Seeded ${count} items.`;
  },
});

export const listMeals = query({
  args: {
    tokenIdentifier: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) return [];

    const rows = await ctx.db
      .query("mealLogs")
      .withIndex("by_user_time", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit ?? 20);

    return rows;
  },
});
