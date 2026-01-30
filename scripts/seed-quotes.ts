/**
 * Seed script for the quote bank.
 * Run with: bun run scripts/seed-quotes.ts
 * 
 * Prerequisites:
 * - CONVEX_URL or VITE_CONVEX_URL must be set in .env.local
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
 * Quote bank for Hayl.
 * Tags: motivational, funny, coach-greg, exercise-specific
 * contextTrigger: optional exercise name for contextual display
 */
const QUOTES = [
  // MOTIVATIONAL - GENERAL
  {
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown",
    tags: ["motivational"],
  },
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    tags: ["motivational"],
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    tags: ["motivational"],
  },
  {
    text: "The pain you feel today will be the strength you feel tomorrow.",
    author: "Unknown",
    tags: ["motivational"],
  },
  {
    text: "Success is not given. It is earned. On the track, on the field, in the gym.",
    author: "Unknown",
    tags: ["motivational"],
  },

  // FUNNY / COACH GREG STYLE
  {
    text: "If you're not cheating on your curls, are you even training biceps?",
    author: "Coach Greg",
    tags: ["funny", "coach-greg"],
    contextTrigger: "curl",
  },
  {
    text: "Abs are made in the kitchen. Unfortunately, so is pizza.",
    author: "Unknown",
    tags: ["funny"],
  },
  {
    text: "I don't always do cardio, but when I do, it's because I'm being chased.",
    author: "Unknown",
    tags: ["funny"],
  },
  {
    text: "Train harder than last time!",
    author: "Coach Greg",
    tags: ["motivational", "coach-greg"],
  },
  {
    text: "Maingaining is the way. No dirty bulk, no aggressive cut.",
    author: "Coach Greg",
    tags: ["coach-greg", "nutrition"],
  },

  // EXERCISE-SPECIFIC
  {
    text: "Squat deep or go home. Parallel is for amateurs.",
    author: "Unknown",
    tags: ["exercise-specific"],
    contextTrigger: "squat",
  },
  {
    text: "The deadlift doesn't build character, it reveals it.",
    author: "Unknown",
    tags: ["exercise-specific", "motivational"],
    contextTrigger: "deadlift",
  },
  {
    text: "Bench press is the ultimate test of upper body strength. Earn your arch.",
    author: "Unknown",
    tags: ["exercise-specific"],
    contextTrigger: "bench",
  },
  {
    text: "Pull-ups: the true measure of relative strength. No kipping.",
    author: "Unknown",
    tags: ["exercise-specific"],
    contextTrigger: "pull",
  },
  {
    text: "Row your way to a thick back. Squeeze every rep.",
    author: "Unknown",
    tags: ["exercise-specific"],
    contextTrigger: "row",
  },

  // ADDIS ABABA / ETHIOPIA SPECIFIC
  {
    text: "From Addis to the world. Train like a champion.",
    author: "Hayl",
    tags: ["motivational", "ethiopia"],
  },
  {
    text: "Ethiopian runners are built different. Now build your body.",
    author: "Hayl",
    tags: ["motivational", "ethiopia"],
  },
  {
    text: "Injera for fuel, iron for gains. Balance is key.",
    author: "Hayl",
    tags: ["nutrition", "ethiopia"],
  },
];

async function main() {
  console.log(`💬 Seeding quotes to Convex...`);
  console.log(`   URL: ${convexUrl}`);

  try {
    await client.mutation(api.quotes.seedQuotes, {
      quotes: QUOTES,
    });
    console.log(`✅ Successfully seeded ${QUOTES.length} quotes!`);
  } catch (error) {
    console.error("❌ Failed to seed quotes:", error);
    process.exit(1);
  }
}

main();
