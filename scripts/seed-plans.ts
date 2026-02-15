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
/**
 * Programs to seed.
 */
const PROGRAMS: any[] = [
  // Programs are now seeded by their respective content scripts (e.g. seed-foundations.ts, seed-hardcore.ts)
  // This file is kept as a utility if we need to seed metadata-only programs in the future.
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

