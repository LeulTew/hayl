import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seeds the exercise library with core exercises.
 * Deduplicates by name to prevent duplicate entries on re-run.
 * 
 * @param exercises - Array of exercise objects with name, muscleGroup, instructions
 * @returns void
 */
export const seedExercises = mutation({
  args: {
    exercises: v.array(
      v.object({
        name: v.string(),
        muscleGroup: v.string(),
        instructions: v.string(),
      })
    ),
  },
  handler: async (ctx: MutationCtx, args) => {
    let inserted = 0;
    let skipped = 0;

    for (const exercise of args.exercises) {
      // Check for existing exercise by exact name match
      const existing = await ctx.db
        .query("exercises")
        .filter((q) => q.eq(q.field("name"), exercise.name))
        .first();

      if (!existing) {
        await ctx.db.insert("exercises", {
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          instructions: exercise.instructions,
        });
        inserted++;
      } else {
        skipped++;
      }
    }

    console.log(`[SEED] Exercises: ${inserted} inserted, ${skipped} skipped (duplicates)`);
  },
});

/**
 * Retrieves a single exercise by its ID.
 * 
 * @param id - The Convex ID of the exercise
 * @returns The exercise document or null
 */
export const getExercise = query({
  args: { id: v.id("exercises") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Searches exercises by name using the full-text search index.
 * 
 * @param query - The search term
 * @returns Up to 20 matching exercises
 */
export const searchExercises = query({
  args: { query: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    if (!args.query.trim()) {
      // Return all exercises if no query (limited)
      return await ctx.db.query("exercises").take(20);
    }

    return await ctx.db
      .query("exercises")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(20);
  },
});

/**
 * Lists all exercises (for admin/dashboard views).
 * 
 * @returns All exercises in the database
 */
export const listAll = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("exercises").collect();
  },
});

/**
 * Batch retrieves multiple exercises by their IDs.
 * Efficiently fetches exercise details for workout views.
 * 
 * @param ids - Array of Convex exercise IDs
 * @returns Record mapping exercise ID to exercise data (or null if not found)
 */
export const getExercisesByIds = query({
  args: { ids: v.array(v.id("exercises")) },
  handler: async (ctx: QueryCtx, args) => {
    const results: Record<string, { name: string; muscleGroup: string; instructions: string } | null> = {};
    
    // Batch fetch using Promise.all for efficiency
    const exercises = await Promise.all(
      args.ids.map((id) => ctx.db.get(id))
    );
    
    args.ids.forEach((id, index) => {
      const exercise = exercises[index];
      if (exercise) {
        results[id] = {
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          instructions: exercise.instructions,
        };
      } else {
        results[id] = null;
      }
    });
    
    return results;
  },
});

