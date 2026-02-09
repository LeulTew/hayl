/**
 * Seed script for workout programs and derived plans.
 * Run with: bun run scripts/seed-plans.ts
 * 
 * Prerequisites:
 * - CONVEX_URL or VITE_CONVEX_URL must be set in .env.local
 * - Exercises must be seeded first (run seed-exercises.ts)
 * 
 * This script seeds:
 * 1. Programs (metadata containers)
 * 2. Derived Plans (actual workout day structures with exercise references)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl) {
  console.error("Error: CONVEX_URL is not set. Make sure .env.local exists.");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

/**
 * Programs to seed.
 */
const PROGRAMS = [
  {
    slug: "hayl-foundations",
    title: "Hayl Foundations",
    canonicalVersion: "1.0.0",
    difficulty: "beginner" as const,
    splitType: "3-day" as const,
    isPremium: false,
    published: true,
  },
  {
    slug: "hayl-intermediate",
    title: "Hayl Intermediate",
    canonicalVersion: "1.0.0",
    difficulty: "intermediate" as const,
    splitType: "4-day" as const,
    isPremium: false,
    published: true,
  },
  {
    slug: "greg-derived-hard",
    title: "The Greg Protocol (Hard)",
    canonicalVersion: "1.0.0",
    difficulty: "elite" as const,
    splitType: "ppl" as const,
    isPremium: true,
    published: false, // Requires human review
  },
];

async function main() {
  console.log(`📋 Seeding programs to Convex...`);
  console.log(`   URL: ${convexUrl}`);

  try {
    // Step 1: Seed programs
    const programIds = await client.mutation(api.programs.seedPrograms, {
      programs: PROGRAMS,
    });
    console.log(`✅ Programs seeded:`, programIds);

    // Step 2: Get exercise IDs for plan creation
    // We need actual exercise IDs to create valid derived plans
    const exercises = await client.query(api.exercises.listAll, {});
    
    if (exercises.length === 0) {
      console.error("❌ No exercises found. Run seed-exercises.ts first!");
      process.exit(1);
    }

    // Build a lookup map by exercise name
    const exerciseMap = new Map<string, Id<"exercises">>();
    for (const ex of exercises) {
      exerciseMap.set(ex.name.toLowerCase(), ex._id);
    }

    // Helper to get exercise ID or throw
    const getExerciseId = (name: string): Id<"exercises"> => {
      const id = exerciseMap.get(name.toLowerCase());
      if (!id) {
        // Try partial match
        for (const [key, value] of exerciseMap) {
          if (key.includes(name.toLowerCase())) {
            return value;
          }
        }
        throw new Error(`Exercise not found: ${name}`);
      }
      return id;
    };

    // Step 3: Seed a derived plan for Hayl Foundations
    const foundationsId = programIds["hayl-foundations"];
    if (foundationsId) {
      await client.mutation(api.programs.seedDerivedPlan, {
        programId: foundationsId as Id<"programs">, adminSecret: "hayl-seed-secret-2026", adminSecret: "hayl-seed-secret-2026", adminSecret: "hayl-seed-secret-2026",
        version: "1.0.0",
        author: "Hayl Team",
        variant: {
          difficulty: "amateur",
          splitFreq: "3-day",
          durationMinutes: 60,
          tags: ["beginner-friendly", "full-body"],
        },
        description: "A comprehensive introduction to full-body training.",
        overview_markdown: "## Overview\nA balanced full-body routine.",
        schedule_markdown: "- **Day 1**: Full Body A\n- **Day 2**: Full Body B\n- **Day 3**: Full Body C",
        philosophy_markdown: "**Philosophy**\nCompound movements first.",
        source_refs: [
          {
            docId: "hayl-foundations-v1",
            note: "Original Hayl team design",
          },
        ],
        requires_human_review: false,
        days: [
          {
            title: "Day 1: Full Body A",
            dayIndex: 0,
            phases: [
              {
                name: "warmup",
                items: [
                  {
                    exerciseId: getExerciseId("goblet squat"),
                    sets: 2,
                    reps: "10",
                    restSeconds: 60,
                    note: "Light weight for warmup",
                  },
                  {
                    exerciseId: getExerciseId("band pull-apart"),
                    sets: 2,
                    reps: "15",
                    restSeconds: 30,
                  },
                ],
              },
              {
                name: "main",
                items: [
                  {
                    exerciseId: getExerciseId("squat"),
                    sets: 3,
                    reps: "8-10",
                    rpe: 7,
                    restSeconds: 120,
                  },
                  {
                    exerciseId: getExerciseId("bench press"),
                    sets: 3,
                    reps: "8-10",
                    rpe: 7,
                    restSeconds: 120,
                  },
                  {
                    exerciseId: getExerciseId("row"),
                    sets: 3,
                    reps: "8-10",
                    rpe: 7,
                    restSeconds: 90,
                  },
                ],
              },
              {
                name: "accessory",
                items: [
                  {
                    exerciseId: getExerciseId("curl"),
                    sets: 2,
                    reps: "12-15",
                    restSeconds: 60,
                  },
                  {
                    exerciseId: getExerciseId("tricep"),
                    sets: 2,
                    reps: "12-15",
                    restSeconds: 60,
                  },
                ],
              },
            ],
          },
          {
            title: "Day 2: Full Body B",
            dayIndex: 1,
            phases: [
              {
                name: "warmup",
                items: [
                  {
                    exerciseId: getExerciseId("goblet squat"),
                    sets: 2,
                    reps: "10",
                    restSeconds: 60,
                  },
                ],
              },
              {
                name: "main",
                items: [
                  {
                    exerciseId: getExerciseId("deadlift"),
                    sets: 3,
                    reps: "5",
                    rpe: 8,
                    restSeconds: 180,
                  },
                  {
                    exerciseId: getExerciseId("overhead press"),
                    sets: 3,
                    reps: "8-10",
                    rpe: 7,
                    restSeconds: 120,
                  },
                  {
                    exerciseId: getExerciseId("leg press"),
                    sets: 3,
                    reps: "10-12",
                    rpe: 7,
                    restSeconds: 90,
                  },
                ],
              },
              {
                name: "accessory",
                items: [
                  {
                    exerciseId: getExerciseId("lateral raise"),
                    sets: 3,
                    reps: "12-15",
                    restSeconds: 60,
                  },
                  {
                    exerciseId: getExerciseId("face pull"),
                    sets: 3,
                    reps: "15-20",
                    restSeconds: 60,
                  },
                ],
              },
            ],
          },
          {
            title: "Day 3: Full Body C",
            dayIndex: 2,
            phases: [
              {
                name: "warmup",
                items: [
                  {
                    exerciseId: getExerciseId("band pull-apart"),
                    sets: 2,
                    reps: "15",
                    restSeconds: 30,
                  },
                ],
              },
              {
                name: "main",
                items: [
                  {
                    exerciseId: getExerciseId("squat"),
                    sets: 3,
                    reps: "6-8",
                    rpe: 8,
                    restSeconds: 150,
                  },
                  {
                    exerciseId: getExerciseId("bench press"),
                    sets: 3,
                    reps: "6-8",
                    rpe: 8,
                    restSeconds: 150,
                  },
                  {
                    exerciseId: getExerciseId("row"),
                    sets: 3,
                    reps: "6-8",
                    rpe: 8,
                    restSeconds: 120,
                  },
                ],
              },
              {
                name: "accessory",
                items: [
                  {
                    exerciseId: getExerciseId("romanian deadlift"),
                    sets: 3,
                    reps: "10-12",
                    restSeconds: 90,
                  },
                  {
                    exerciseId: getExerciseId("plank"),
                    sets: 3,
                    reps: "30-45s",
                    restSeconds: 60,
                  },
                ],
              },
            ],
          },
        ],
        changelog: "Initial seed: 3-day full body program for beginners",
      });
      console.log(`✅ Derived plan seeded for Hayl Foundations`);
    }

    console.log(`\n🎉 All programs and plans seeded successfully!`);
  } catch (error) {
    console.error("❌ Failed to seed programs:", error);
    process.exit(1);
  }
}

main();
