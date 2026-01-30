import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

export const seedIngredients = mutation({
  args: {
    ingredients: v.array(v.object({
      name: v.string(),
      amharicName: v.optional(v.string()),
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fats: v.number(),
      fiber: v.number(),
      category: v.union(v.literal("grain"), v.literal("legume"), v.literal("meat"), v.literal("vegetable"), v.literal("other")),
      isLocal: v.boolean(),
    }))
  },
  handler: async (ctx: MutationCtx, args: { ingredients: any[] }) => {
    // Basic deduplication based on name
    for (const ing of args.ingredients) {
      const existing = await ctx.db
        .query("ingredients")
        .withSearchIndex("search_name", (q) => q.search("name", ing.name))
        .first();

      if (!existing) {
        await ctx.db.insert("ingredients", ing);
      } else {
          // Optional: Update existing? For now, skip to avoid overwrites
      }
    }
  },
});

export const searchFood = query({
  args: { query: v.string() },
  handler: async (ctx: QueryCtx, args: { query: string }) => {
    // Basic search (in real app, use a dedicated search index)
    return await ctx.db
      .query("foods")
      .filter((q: any) =>
        q.or(
          q.eq(q.field("name"), args.query),
          // Simple contains check logic would go here if not using full text search
        )
      )
      .take(10);
  },
});

export const getFood = query({
    args: { id: v.id("foods") },
    handler: async (ctx: QueryCtx, args: { id: string }) => {
        return await ctx.db.get(args.id);
    }
});
