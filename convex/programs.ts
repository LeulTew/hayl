/// <reference types="node" />
import { v } from "convex/values";
import { query, mutation, type QueryCtx, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Lists all published programs.
 * 
 * @returns Array of published programs
 */
export const list = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    return await ctx.db
      .query("programs")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();
  },
});

/**
 * Lists all programs (including unpublished) for admin.
 * 
 * @returns Array of all programs
 */
export const listAll = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    return await ctx.db
      .query("programs")
      // .filter((q) => q.eq(q.field("published"), true)) // REMOVED: listAll should list ALL

      .collect();
  },
});

/**
 * Gets derived plans for a specific program.
 * 
 * @param programId - The Convex ID of the program
 * @returns Array of derived plans for the program
 */
export const getDerivedPlans = query({
  args: { programId: v.id("programs") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("derivedPlans")
      .withIndex("by_programId", (q) => q.eq("programId", args.programId))
      .collect();
  },
});

/**
 * Gets a specific derived plan by ID.
 * 
 * @param planId - The Convex ID of the derived plan
 * @returns The derived plan document or null
 */
export const getPlan = query({
  args: { planId: v.id("derivedPlans") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db.get(args.planId);
  },
});

/**
 * Gets a program by its slug.
 * 
 * @param slug - The URL-friendly slug of the program
 * @returns The program document or null
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("programs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// ============================================================================
// SEEDING MUTATIONS
// ============================================================================

/**
 * Seeds workout programs.
 * Deduplicates by slug.
 * 
 * @param programs - Array of program objects
 * @returns Object with inserted program IDs mapped by slug
 */
export const seedPrograms = mutation({
  args: {
    programs: v.array(
      v.object({
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
      })
    ),
    adminSecret: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("❌ Unauthorized: Invalid Admin Secret");
    }
    const insertedIds: Record<string, Id<"programs">> = {};

    for (const program of args.programs) {
      const existing = await ctx.db
        .query("programs")
        .withIndex("by_slug", (q) => q.eq("slug", program.slug))
        .first();

      if (!existing) {
        const now = Date.now();
        const id = await ctx.db.insert("programs", {
          ...program,
          createdAt: now,
          updatedAt: now,
        });
        insertedIds[program.slug] = id;
        console.log(`[SEED] Program inserted: ${program.title}`);
      } else {
        // Patch existing program to ensure idempotency update
        await ctx.db.patch(existing._id, {
          ...program,
          // If createdAt is missing (legacy data), backfill it. otherwise keep existing.
          createdAt: existing.createdAt ?? Date.now(),
          updatedAt: Date.now(),
        });
        insertedIds[program.slug] = existing._id;
        console.log(`[SEED] Program updated: ${program.title}`);
      }
    }

    return insertedIds;
  },
});

/**
 * Seeds a derived plan for a program.
 * Links to program by ID and to exercises by ID.
 * 
 * @param plan - The derived plan object with full day structure
 * @returns The inserted plan ID
 */
export const seedDerivedPlan = mutation({
  args: {
    programId: v.id("programs"),
    version: v.string(),
    author: v.string(),
    variant: v.object({
      difficulty: v.union(
        v.literal("amateur"),
        v.literal("intermediate"),
        v.literal("elite")
      ),
      splitFreq: v.string(),
      durationMinutes: v.number(),
      tags: v.optional(v.array(v.string())),
      equipment_needed: v.optional(v.array(v.string())),
    }),
    description: v.string(),
    overview_markdown: v.optional(v.string()),
    schedule_markdown: v.optional(v.string()),
    philosophy_markdown: v.optional(v.string()), // <--- Added fields
    source_refs: v.array(
      v.object({
        docId: v.string(),
        page: v.optional(v.number()),
        note: v.string(),
      })
    ),
    requires_human_review: v.boolean(),
    reviewedBy: v.optional(v.string()),
    days: v.array(
      v.object({
        title: v.string(),
        dayIndex: v.number(),
        phases: v.array(
          v.object({
            name: v.union(
              v.literal("warmup"),
              v.literal("main"),
              v.literal("accessory"),
              v.literal("stretch")
            ),
            items: v.array(
              v.object({
                exerciseId: v.id("exercises"),
                sets: v.number(),
                reps: v.string(),
                rpe: v.optional(v.number()),
                restSeconds: v.number(),
                note: v.optional(v.string()),
              })
            ),
          })
        ),
      })
    ),
    changelog: v.string(),
    adminSecret: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("❌ Unauthorized: Invalid Admin Secret");
    }
    // Check for existing plan with same program + version
    const existing = await ctx.db
      .query("derivedPlans")
      .withIndex("by_program_version", (q) =>
        q.eq("programId", args.programId).eq("version", args.version)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        programId: args.programId,
        version: args.version,
        author: args.author,
        variant: args.variant,
        description: args.description,
        overview_markdown: args.overview_markdown,
        schedule_markdown: args.schedule_markdown,
        philosophy_markdown: args.philosophy_markdown,
        source_refs: args.source_refs,
        requires_human_review: args.requires_human_review,
        reviewedBy: args.reviewedBy,
        days: args.days,
        changelog: args.changelog,
        createdAt: existing.createdAt ?? Date.now(),
      });
      console.log(`[SEED] Plan updated: ${args.version}`);
      return existing._id;
    }

    const id = await ctx.db.insert("derivedPlans", {
      programId: args.programId,
      version: args.version,
      author: args.author,
      variant: args.variant,
      description: args.description,
      overview_markdown: args.overview_markdown,
      schedule_markdown: args.schedule_markdown,
      philosophy_markdown: args.philosophy_markdown,
      source_refs: args.source_refs,
      requires_human_review: args.requires_human_review,
      reviewedBy: args.reviewedBy,
      days: args.days,
      changelog: args.changelog,
      createdAt: Date.now(),
    });

    console.log(`[SEED] Plan inserted: ${args.version}`);
    return id;
  },
});

/**
 * Wipes all derived plans. (Admin use only in prod, but open for dev seeding)
 */
export const wipeDerivedPlans = mutation({
  args: { adminSecret: v.string() },
  handler: async (ctx: MutationCtx, args) => {
  if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("❌ Unauthorized: Invalid Admin Secret");
    }

    const plans = await ctx.db.query("derivedPlans").collect();
    for (const plan of plans) {
      await ctx.db.delete(plan._id);
    }
    console.log(`[WIPE] Deleted ${plans.length} derived plans.`);
    return plans.length;
  },
});

/**
 * Wipes all programs. (Admin use only)
 */
export const wipePrograms = mutation({
  args: { adminSecret: v.string() },
  handler: async (ctx: MutationCtx, args) => {
    if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("❌ Unauthorized: Invalid Admin Secret");
    }

    const programs = await ctx.db.query("programs").collect();
    for (const program of programs) {
      await ctx.db.delete(program._id);
    }
    console.log(`[WIPE] Deleted ${programs.length} programs.`);
    return programs.length;
  },
});
