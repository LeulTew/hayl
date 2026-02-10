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
  /*
   * Note: "Hayl Foundations" is seeded via `scripts/seed-foundations.ts`
   * to allow for richer content and separation of concerns.
   */

  {
    slug: "hayl-intermediate",
    title: "Hayl Intermediate",
    canonicalVersion: "v1.0.0",
    difficulty: "intermediate" as const,
    splitType: "4-day" as const,
    isPremium: false,
    published: true,
  },
  {
    slug: "greg-derived-hard",
    title: "The Greg Protocol (Hard)",
    canonicalVersion: "v1.0.0",

    difficulty: "elite" as const,
    splitType: "ppl" as const,
    isPremium: true,
    published: false, // Requires human review
  },
];

async function main() {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ ADMIN_SECRET is not set in environment.");
    process.exit(1);
  }

  console.log(`📋 Seeding programs to Convex...`);
  console.log(`   URL: ${convexUrl}`);

  try {
    // Step 1: Seed programs
    const programIds = await client.mutation(api.programs.seedPrograms, {
      programs: PROGRAMS,
      adminSecret: adminSecret,
    });
    console.log(`✅ Programs seeded:`, programIds);

    // Note: Exercise fetching was removed as this script now only seeds Programs.
    // Derived Plans are seeded by their respective scripts (foundations, casual, etc.)


    console.log(`\n🎉 All programs and plans seeded successfully!`);
  } catch (error) {
    console.error("❌ Failed to seed programs:", error);
    process.exit(1);
  }
}

main().catch(console.error);

