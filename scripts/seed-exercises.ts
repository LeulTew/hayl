/**
 * Seed script for the exercise library.
 * Run with: bun run scripts/seed-exercises.ts
 * 
 * Prerequisites:
 * - CONVEX_URL or VITE_CONVEX_URL must be set in .env.local
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl) {
  console.error("Error: CONVEX_URL is not set. Make sure .env.local exists.");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

/**
 * Core exercise library for Hayl.
 * Muscle groups follow standard categorization for filtering.
 */
const EXERCISES = [
  // COMPOUND MOVEMENTS
  {
    name: "Barbell Back Squat",
    muscleGroup: "Legs",
    instructions:
      "Stand with feet shoulder-width apart, bar on upper back. Descend by bending knees and hips until thighs are parallel. Drive through heels to stand.",
  },
  {
    name: "Barbell Deadlift",
    muscleGroup: "Back",
    instructions:
      "Stand with feet hip-width, bar over mid-foot. Hinge at hips, grip bar outside knees. Drive through floor, keeping back neutral, until standing tall.",
  },
  {
    name: "Barbell Bench Press",
    muscleGroup: "Chest",
    instructions:
      "Lie on bench, grip bar slightly wider than shoulders. Lower to mid-chest with elbows at 45°. Press up explosively to full lockout.",
  },
  {
    name: "Barbell Overhead Press",
    muscleGroup: "Shoulders",
    instructions:
      "Stand with bar at shoulder height. Brace core, press bar overhead in straight line. Lock out arms fully, then lower with control.",
  },
  {
    name: "Barbell Row",
    muscleGroup: "Back",
    instructions:
      "Hinge at hips with bar hanging at arm's length. Pull bar to lower chest, squeezing shoulder blades. Lower with control.",
  },

  // ACCESSORY - UPPER
  {
    name: "Dumbbell Curl",
    muscleGroup: "Biceps",
    instructions:
      "Stand with dumbbells at sides, palms forward. Curl weights to shoulders without swinging. Lower with control.",
  },
  {
    name: "Tricep Pushdown",
    muscleGroup: "Triceps",
    instructions:
      "Face cable machine, grip rope attachment. Push down until arms are fully extended. Control the return.",
  },
  {
    name: "Lateral Raise",
    muscleGroup: "Shoulders",
    instructions:
      "Stand with dumbbells at sides. Raise arms out to sides until parallel to floor. Lower slowly.",
  },
  {
    name: "Face Pull",
    muscleGroup: "Rear Delts",
    instructions:
      "Set cable at face height with rope. Pull toward face, separating rope at end. Squeeze rear delts.",
  },

  // ACCESSORY - LOWER
  {
    name: "Romanian Deadlift",
    muscleGroup: "Hamstrings",
    instructions:
      "Hold bar at hip height. Hinge at hips, pushing glutes back while keeping legs nearly straight. Feel hamstring stretch, then return.",
  },
  {
    name: "Leg Press",
    muscleGroup: "Legs",
    instructions:
      "Sit in machine, feet shoulder-width on platform. Lower platform by bending knees to 90°. Press back to start.",
  },
  {
    name: "Leg Curl",
    muscleGroup: "Hamstrings",
    instructions:
      "Lie face down on machine. Curl heels toward glutes. Squeeze at top, lower with control.",
  },
  {
    name: "Calf Raise",
    muscleGroup: "Calves",
    instructions:
      "Stand on edge of step, heels hanging off. Rise onto toes, pause at top. Lower until calves stretch.",
  },

  // CORE
  {
    name: "Plank",
    muscleGroup: "Core",
    instructions:
      "Support body on forearms and toes, body in straight line. Brace core, hold position without sagging.",
  },
  {
    name: "Hanging Leg Raise",
    muscleGroup: "Core",
    instructions:
      "Hang from bar with straight arms. Raise legs to parallel (or higher) by contracting abs. Lower with control.",
  },
  {
    name: "Cable Crunch",
    muscleGroup: "Core",
    instructions:
      "Kneel facing cable machine, rope behind head. Crunch down by flexing spine, bringing elbows toward thighs.",
  },

  // WARMUP/MOBILITY
  {
    name: "Goblet Squat",
    muscleGroup: "Legs",
    instructions:
      "Hold dumbbell at chest. Squat deep with elbows tracking inside knees. Great for warmup and mobility.",
  },
  {
    name: "Band Pull-Apart",
    muscleGroup: "Rear Delts",
    instructions:
      "Hold band at arm's length in front. Pull band apart by squeezing shoulder blades together.",
  },
];

async function main() {
  console.log(`🏋️ Seeding exercises to Convex...`);
  console.log(`   URL: ${convexUrl}`);

  try {
    await client.mutation(api.exercises.seedExercises, {
      exercises: EXERCISES, adminSecret: "hayl-seed-secret-2026", adminSecret: "hayl-seed-secret-2026",
    });
    console.log(`✅ Successfully seeded ${EXERCISES.length} exercises!`);
  } catch (error) {
    console.error("❌ Failed to seed exercises:", error);
    process.exit(1);
  }
}

main();
