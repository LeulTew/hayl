import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seeds the quote bank with motivational and exercise-specific quotes.
 * Deduplicates by exact text match.
 * 
 * @param quotes - Array of quote objects with text, author, tags, and optional contextTrigger
 * @returns void
 */
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
  handler: async (ctx: MutationCtx, args) => {
    let inserted = 0;
    let skipped = 0;

    for (const quote of args.quotes) {
      // Simple deduplication: check if exact text exists
      const existing = await ctx.db
        .query("quotes")
        .filter((q) => q.eq(q.field("text"), quote.text))
        .first();

      if (!existing) {
        await ctx.db.insert("quotes", {
          text: quote.text,
          author: quote.author,
          tags: quote.tags,
          contextTrigger: quote.contextTrigger,
        });
        inserted++;
      } else {
        skipped++;
      }
    }

    console.log(`[SEED] Quotes: ${inserted} inserted, ${skipped} skipped (duplicates)`);
  },
});

/**
 * Retrieves a random quote, optionally filtered by tag.
 * Uses a simple approach: fetch all matching quotes, pick random one.
 * For larger quote banks, consider pagination or sampling.
 * 
 * @param tag - Optional tag to filter quotes (e.g., "motivational", "biceps")
 * @returns A random quote matching the criteria, or null if none found
 */
export const getRandomQuote = query({
  args: { tag: v.optional(v.string()) },
  handler: async (ctx: QueryCtx, args) => {
    let quotesQuery = ctx.db.query("quotes");

    // If tag is provided, filter by it
    if (args.tag) {
      const allQuotes = await quotesQuery.collect();
      const filtered = allQuotes.filter((q) => q.tags.includes(args.tag!));
      
      if (filtered.length === 0) return null;
      
      const randomIndex = Math.floor(Math.random() * filtered.length);
      return filtered[randomIndex];
    }

    // No tag filter: get all and pick random
    const allQuotes = await quotesQuery.collect();
    if (allQuotes.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * allQuotes.length);
    return allQuotes[randomIndex];
  },
});

/**
 * Retrieves a context-aware quote based on exercise name or type.
 * Falls back to general motivational quote if no specific match.
 * 
 * @param context - Exercise name or type (e.g., "curl", "squat")
 * @returns A quote relevant to the context
 */
export const getContextualQuote = query({
  args: { context: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    const contextLower = args.context.toLowerCase();

    // First, try to find quotes with matching contextTrigger
    const allQuotes = await ctx.db.query("quotes").collect();
    
    const contextMatches = allQuotes.filter(
      (q) => q.contextTrigger && contextLower.includes(q.contextTrigger.toLowerCase())
    );

    if (contextMatches.length > 0) {
      const randomIndex = Math.floor(Math.random() * contextMatches.length);
      return contextMatches[randomIndex];
    }

    // Fallback: return any motivational quote
    const motivational = allQuotes.filter((q) => q.tags.includes("motivational"));
    if (motivational.length > 0) {
      const randomIndex = Math.floor(Math.random() * motivational.length);
      return motivational[randomIndex];
    }

    // Last resort: any quote
    if (allQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * allQuotes.length);
      return allQuotes[randomIndex];
    }

    return null;
  },
});

/**
 * Lists all quotes (for admin view).
 * 
 * @returns All quotes in the database
 */
export const listAll = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("quotes").collect();
  },
});
