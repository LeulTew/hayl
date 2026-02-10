import { mutation, query } from "./_generated/server";
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
    adminSecret: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("❌ Unauthorized: Invalid Admin Secret");
    }
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
    return { newCount, existingCount };
  },
});

/**
 * Gets a contextual quote based on a trigger keyword.
 * If no match, returns a random general quote.
 * 
 * @param context - The trigger word (e.g., exercise name)
 * @returns A quote object
 */
export const getContextualQuote = query({
  args: { 
    context: v.optional(v.string()),
    seed: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    // 1. Try to find a context-specific quote
    if (args.context) {
      // Future: Search index matching
    }

    // Fallback: Get a random quote deterministically
    const quotes = await ctx.db.query("quotes").collect();

    if (quotes.length === 0) return null;
    
    // Deterministic selection based on seed (default to 0 if missing)
    const seed = args.seed ?? 0;
    const index = Math.abs(seed % quotes.length);
    return quotes[index];
  },
});
