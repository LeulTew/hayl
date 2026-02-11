import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

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
        category: v.union(
          v.literal("grain"),
          v.literal("legume"),
          v.literal("meat"),
          v.literal("vegetable"),
          v.literal("other")
        ),
        isLocal: v.boolean(),
      })
    ),
    adminSecret: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("❌ Unauthorized: Invalid Admin Secret");
    }
    let inserted = 0;
    let skipped = 0;

    for (const ing of args.ingredients) {
      // Check for existing by searching name
      // Check for existing by exact name match
      const existing = await ctx.db
        .query("ingredients")
        .withIndex("by_name", (q) => q.eq("name", ing.name))
        .first();

      // Only skip if exact match
      if (existing && existing.name === ing.name) {
        skipped++;
      } else {
        await ctx.db.insert("ingredients", ing);
        inserted++;
      }
    }

    console.log(`[SEED] Ingredients: ${inserted} inserted, ${skipped} skipped`);
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
 * Lists all ingredients (for admin/dashboard).
 * 
 * @returns All ingredients in the database
 */
export const listAll = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("ingredients").collect();
  },
});

/**
 * Lists only local Ethiopian ingredients.
 * 
 * @returns Ethiopian ingredients
 */
export const listLocal = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    return await ctx.db
      .query("ingredients")
      .withIndex("by_isLocal", (q) => q.eq("isLocal", true))
      .collect();
  },
});
