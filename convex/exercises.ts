import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

async function resolveExerciseMediaUrls(
  ctx: QueryCtx,
  media:
    | {
        variants: {
          mp4?: { storageId: Id<"_storage"> };
          webm?: { storageId: Id<"_storage"> };
        };
        placeholder?: {
          posterStorageId?: Id<"_storage">;
          blurhash?: string;
          lqipBase64?: string;
        };
        aspectRatio: number;
      }
    | undefined,
) {
  if (!media) return undefined;

  const mp4Url = media.variants.mp4?.storageId
    ? await ctx.storage.getUrl(media.variants.mp4.storageId)
    : null;
  const webmUrl = media.variants.webm?.storageId
    ? await ctx.storage.getUrl(media.variants.webm.storageId)
    : null;
  const posterUrl = media.placeholder?.posterStorageId
    ? await ctx.storage.getUrl(media.placeholder.posterStorageId)
    : null;

  return {
    aspectRatio: media.aspectRatio,
    blurhash: media.placeholder?.blurhash,
    lqipBase64: media.placeholder?.lqipBase64,
    urls: {
      mp4: mp4Url,
      webm: webmUrl,
      poster: posterUrl,
    },
  };
}

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
    adminSecret: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("❌ Unauthorized: Invalid Admin Secret");
    }
    let inserted = 0;
    let skipped = 0;

    for (const exercise of args.exercises) {
      // Check for existing exercise by exact name match (indexed)
      const existing = await ctx.db
        .query("exercises")
        .withIndex("by_name", (q) => q.eq("name", exercise.name))
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
    const exercise = await ctx.db.get(args.id);
    if (!exercise) return null;

    const mediaResolved = await resolveExerciseMediaUrls(ctx, exercise.media);

    return {
      ...exercise,
      mediaResolved,
    };
  },
});

export const createExercise = mutation({
  args: {
    name: v.string(),
    muscleGroup: v.string(),
    instructions: v.string(),
    tutorialUrl: v.optional(v.string()),
    adminSecret: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("❌ Unauthorized: Invalid Admin Secret");
    }

    const existing = await ctx.db
      .query("exercises")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("exercises", {
      name: args.name,
      muscleGroup: args.muscleGroup,
      instructions: args.instructions,
      tutorialUrl: args.tutorialUrl,
    });
  },
});

export const generateMediaUploadUrls = mutation({
  args: {
    adminSecret: v.string(),
    includeMp4: v.boolean(),
    includeWebm: v.boolean(),
    includePoster: v.boolean(),
  },
  handler: async (ctx: MutationCtx, args) => {
    if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("❌ Unauthorized: Invalid Admin Secret");
    }

    const result: {
      mp4UploadUrl?: string;
      webmUploadUrl?: string;
      posterUploadUrl?: string;
    } = {};

    if (args.includeMp4) result.mp4UploadUrl = await ctx.storage.generateUploadUrl();
    if (args.includeWebm) result.webmUploadUrl = await ctx.storage.generateUploadUrl();
    if (args.includePoster) result.posterUploadUrl = await ctx.storage.generateUploadUrl();

    return result;
  },
});

export const finalizeExerciseMedia = mutation({
  args: {
    adminSecret: v.string(),
    exerciseId: v.id("exercises"),
    sourceUrl: v.string(),
    ingestedBy: v.string(),
    checksum: v.string(),
    aspectRatio: v.number(),
    width: v.number(),
    height: v.number(),
    durationMs: v.number(),
    placeholder: v.optional(
      v.object({
        blurhash: v.optional(v.string()),
        lqipBase64: v.optional(v.string()),
        posterStorageId: v.optional(v.id("_storage")),
      }),
    ),
    mp4: v.optional(
      v.object({
        storageId: v.id("_storage"),
        bytes: v.number(),
        mime: v.string(),
      }),
    ),
    webm: v.optional(
      v.object({
        storageId: v.id("_storage"),
        bytes: v.number(),
        mime: v.string(),
      }),
    ),
  },
  handler: async (ctx: MutationCtx, args) => {
    if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("❌ Unauthorized: Invalid Admin Secret");
    }

    const exercise = await ctx.db.get(args.exerciseId);
    if (!exercise) throw new Error("Exercise not found");
    if (!args.mp4 && !args.webm) {
      throw new Error("At least one video format (mp4 or webm) is required");
    }

    await ctx.db.patch(args.exerciseId, {
      media: {
        sourceUrl: args.sourceUrl,
        ingestedBy: args.ingestedBy,
        checksum: args.checksum,
        width: args.width,
        height: args.height,
        aspectRatio: args.aspectRatio,
        durationMs: args.durationMs,
        variants: {
          mp4: args.mp4,
          webm: args.webm,
        },
        placeholder: args.placeholder,
        updatedAt: Date.now(),
      },
    });

    return { ok: true };
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
    let exercises;
    if (!args.query.trim()) {
      exercises = await ctx.db.query("exercises").take(20);
    } else {
      exercises = await ctx.db
        .query("exercises")
        .withSearchIndex("search_name", (q) => q.search("name", args.query))
        .take(20);
    }

    return await Promise.all(
      exercises.map(async (e) => ({
        ...e,
        mediaResolved: await resolveExerciseMediaUrls(ctx, e.media),
      }))
    );
  },
});

/**
 * Lists exercises, optionally filtered by muscle group.
 * Resolves storage URLs for each result.
 *
 * @param muscleGroup - Optional filter (substring match on the muscleGroup field).
 * @param limit - Maximum rows to return (default 100, max 500).
 * @returns Up to `limit` exercises with resolved media URLs.
 */
export const listAll = query({
  args: {
    muscleGroup: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args) => {
    const cap = Math.min(args.limit ?? 100, 500);

    let rows = await ctx.db.query("exercises").take(cap);

    if (args.muscleGroup) {
      const needle = args.muscleGroup.toLowerCase();
      rows = rows.filter((e) => e.muscleGroup.toLowerCase().includes(needle));
    }

    return await Promise.all(
      rows.map(async (e) => ({
        ...e,
        mediaResolved: await resolveExerciseMediaUrls(ctx, e.media),
      }))
    );
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

