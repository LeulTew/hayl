import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed mutation for quotes
export const seedQuotes = mutation({
  args: {
    quotes: v.array(
      v.object({
        text: v.string(),
        author: v.string(),
        tags: v.array(v.string()),
        contextTrigger: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let newCount = 0;
    let existingCount = 0;

    for (const quote of args.quotes) {
      const existing = await ctx.db
        .query("quotes")
        .filter(q => q.eq(q.field("text"), quote.text))
        .first();
      
      if (!existing) {
        await ctx.db.insert("quotes", quote);
        newCount++;
      } else {
        existingCount++;
      }
    }
    console.log(`[SEED] Quotes: ${newCount} inserted, ${existingCount} skipped (duplicates)`);
    return JSON.stringify({ newCount, existingCount });
  },
});
