/**
 * Seed Script: HAYL Elite II
 * Author: Leul Tewodros Agonafer
 * Slug: hardcore-3day-60min-strength
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Doc, Id } from "../convex/_generated/dataModel.js";

const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("❌ CONVEX_URL is not set.");
  process.exit(1);
}
const client = new ConvexHttpClient(convexUrl);


const EXERCISES = [
  { name: "Skullcrushers & Close-Grip Bench Superset", muscleGroup: "Triceps", instructions: "Perform 8-10 skullcrushers on a bench, then immediately transition to close-grip bench press to failure using the same bar. No rest between exercises." },
  { name: "Lying Dumbbell Pull-Overs", muscleGroup: "Back", instructions: "Focus on the lats. Keep a slight bend in the elbows. Lower dumbbells behind head feel the stretch, then pull back to chest level." },
];

const PROGRAM = {
  slug: "hardcore-3day-60min-strength",
  title: "HAYL Elite II",
  canonicalVersion: "v1.0",
  difficulty: "elite" as const,
  splitType: "3-day" as const,
  isPremium: false,
  published: true,
};

async function main() {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ ADMIN_SECRET is not set in environment.");
    process.exit(1);
  }

  console.log("🌱 Seeding HAYL Elite II (3-Day, 60min, Strength)...");

  // Seed new exercises
  await client.mutation(api.exercises.seedExercises, { exercises: EXERCISES, adminSecret: adminSecret });

  // Fetch Exercise IDs
  const exercises = (await client.query(api.exercises.listAll)) as Doc<"exercises">[];
  const exMap = new Map<string, Id<"exercises">>(
    exercises.map((e) => [e.name, e._id])
  );

  const getEx = (name: string): Id<"exercises"> => {
    const id = exMap.get(name);
    if (!id) {
      console.error(`❌ Missing exercise: "${name}"`);
      const similar = Array.from(exMap.keys()).filter(k => k.includes(name) || name.includes(k));
      if (similar.length > 0) console.log(`👉 Similar: ${similar.join(", ")}`);
      throw new Error(`Missing exercise: ${name}`);
    }
    return id;
  };

  // Seed Program
  const programIds = (await client.mutation(api.programs.seedPrograms, { programs: [PROGRAM], adminSecret: adminSecret })) as Record<string, Id<"programs">>;
  const programId = programIds[PROGRAM.slug];
  console.log(`✅ Program Created: ${programId}`);

  // Seed Derived Plan
  const planId = await client.mutation(api.programs.seedDerivedPlan, {
    programId, adminSecret: adminSecret,
    version: "v1.0.0",
    author: "HAYL Performance Team",
    variant: {
      difficulty: "elite",
      splitFreq: "3-day",
      durationMinutes: 60,
      tags: ["strength", "powerbuilding", "elite"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 60-minute advanced strength program. 3-day split with low-rep explosive compounds and intensive superset finishers. For serious lifters chasing peak performance.",
    overview_markdown: `
# HAYL Elite II — 3-Day Split Strength

**Duration**: 60 min | **Split**: 3-Day PPL | **Focus**: Strength | **Level**: Elite

## Why This Program
The strength-focused counterpart to Elite I. Maximum neural drive on compound lifts with enough accessory volume for structural balance.

## Core Principles
- **Low Rep Mastery** — 5-8 reps on main compounds to maximize absolute strength
- **Mandatory Pauses** — pause bench on every rep to eliminate momentum
- **Mechanical Advantage Supersets** — techniques like Skullcrushers → Close-Grip Bench to push past failure
- **Floor Resets** — deadlifts reset on the floor for the first 3 sets

## Coach's Notes
> Elite II demands discipline. Every rep must be executed with intent. If you're not pausing your bench and resetting your deadlifts, you're not doing the program.

## Equipment
Barbell, Dumbbells, Cable Machine, Lat Pull-down, Squat Rack, Bench Press
    `,
    schedule_markdown: `
## Weekly Schedule (Recommended)
- **Mon/Thu**: Day 1 (Legs & Biceps)
- **Tue/Fri**: Day 2 (Chest, Shoulders, Triceps)
- **Wed/Sat**: Day 3 (Deadlifts and Back)
- **Sun**: Rest

## Daily Structure

### Day 1: Legs & Biceps Strength
- Heavy Squat Straight Sets (5-8 rep range)
- Legs Accessory Circuit
- Biceps/Calves Superset

### Day 2: Chest, Shoulders, Triceps Strength
- Flat Bench & Overhead Press Intensity
- Shoulder Accessory Alternating Sets
- Tricep Superset Finisher (Choice of 3 options)

### Day 3: Deadlifts and Back Strength
- Heavy Deadlifts (Reset focus)
- Heavy Back Straight Sets (Rows/Lats)
- Lat & Trap Finisher Superset
    `,
    philosophy_markdown: `
## Absolute Intensity

**The Neural Load**  
Training in the 5-8 rep range at 6 days per week is extremely taxing on the Central Nervous System (CNS). Listen to your body. If you hit a wall, take an extra rest day or drop a set.

**Resetting the Deadlift**  
By stopping the momentum on the floor, you ensure your back and glutes are doing 100% of the work to break the inertia. This is the fastest way to build a bulletproof posterior chain.

**Choosing Your Tricep Option**  
Option A (Skullcrusher superset) is the most difficult and provides the best mechanical stress. If your elbows are feeling tender, switch to Option B or C.
    `,
    source_refs: [
      { docId: "hayl-internal", note: "HAYL Elite II — Day 1: Legs & Biceps. Author: Leul Tewodros Agonafer" },
      { docId: "hayl-internal", note: "HAYL Elite II — Day 2: Chest, Shoulders, Triceps. Author: Leul Tewodros Agonafer" },
      { docId: "hayl-internal", note: "HAYL Elite II — Day 3: Deadlifts & Back. Author: Leul Tewodros Agonafer" }
    ],
    requires_human_review: false,
    days: [
      {
        title: "Day 1 - Legs & Biceps",
        dayIndex: 0,
        phases: [
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Warmup - Light/Easy" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "10", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "6-8", restSeconds: 240, rpe: 9, note: "Heavier - Harder" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "5-8", restSeconds: 240, rpe: 10, note: "Same Weight - ALL OUT." },
              
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "15", restSeconds: 120, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "10-12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "8-10", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "6-10 + 10 partials", restSeconds: 180, rpe: 10, note: "Heavier - ALL OUT" },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Adductor Machine"), sets: 1, reps: "15", restSeconds: 30, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Hip Thrust of choice"), sets: 1, reps: "15", restSeconds: 30, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Leg Extension"), sets: 1, reps: "15", restSeconds: 30, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Leg Curl (Seated or Lying)"), sets: 1, reps: "15", restSeconds: 30, rpe: 7, note: "Moderate" },
              // Round 2
              { exerciseId: getEx("Adductor Machine"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 9, note: "Heavier - Hard/All Out" },
              { exerciseId: getEx("Hip Thrust of choice"), sets: 1, reps: "10-12", restSeconds: 45, rpe: 9, note: "Heavier - Hard/All Out" },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Machine Preacher Curls"), sets: 1, reps: "15", restSeconds: 30, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "20", restSeconds: 30, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Machine Preacher Curls"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 10, note: "Heavier - ALL OUT" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "15-20", restSeconds: 45, rpe: 10, note: "Heavier - ALL OUT" },
              { exerciseId: getEx("Machine Preacher Curls"), sets: 1, reps: "10-15", restSeconds: 45, rpe: 10, note: "Same Weight - ALL OUT" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "15-20", restSeconds: 45, rpe: 10, note: "Same Weight - ALL OUT + partials" },
            ]
          }
        ]
      },
      {
        title: "Day 2 - Chest, Shoulders, Triceps",
        dayIndex: 1,
        phases: [
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy. Pause all reps." },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "10", restSeconds: 120, rpe: 7, note: "Moderate - Moderate. Pause." },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "8", restSeconds: 180, rpe: 8, note: "Heavy - Hard. Pause." },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "6-8", restSeconds: 240, rpe: 10, note: "Heavier - ALL OUT." },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "5-8", restSeconds: 240, rpe: 10, note: "Same weight - ALL OUT. Last set can skip pause if needed." },
              
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "12", restSeconds: 60, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "8", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "5-8", restSeconds: 180, rpe: 10, note: "Heavier - ALL OUT" },

              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "15", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "8-10", restSeconds: 150, rpe: 8, note: "Heavier - Hard" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "7-10", restSeconds: 150, rpe: 10, note: "Same weight - ALL OUT" },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "15", restSeconds: 45, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Reverse Pec Deck / Face Pull"), sets: 1, reps: "15", restSeconds: 45, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Reverse Pec Deck / Face Pull"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "10-12", restSeconds: 45, rpe: 9, note: "Same weight - Harder" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "9-12", restSeconds: 45, rpe: 10, note: "Same weight - ALL OUT" },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Skullcrushers & Close-Grip Bench Superset"), sets: 1, reps: "10 + fail", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Skullcrushers & Close-Grip Bench Superset"), sets: 1, reps: "8-10 + fail", restSeconds: 150, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Skullcrushers & Close-Grip Bench Superset"), sets: 1, reps: "6-8 + fail", restSeconds: 150, rpe: 10, note: "Same weight - ALL OUT" },
            ]
          }
        ]
      },
      {
        title: "Day 3 - Deadlifts and Back",
        dayIndex: 2,
        phases: [
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy. Reset all reps." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "10", restSeconds: 120, rpe: 7, note: "Moderate - Moderate. Reset." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "8", restSeconds: 180, rpe: 8, note: "Heavy - Hard. Reset." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "5-8", restSeconds: 240, rpe: 10, note: "Heavier - ALL OUT. No reset." },
              
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "15", restSeconds: 90, rpe: 7, note: "Moderate - Moderate. Wear straps." },
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "10-12", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "8-10", restSeconds: 150, rpe: 9, note: "Heavier - Harder" },
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "6-8", restSeconds: 180, rpe: 10, note: "Same weight - ALL OUT" },
              
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "15", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "12", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "10-12", restSeconds: 150, rpe: 9, note: "Heavier - Harder" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "8-12", restSeconds: 180, rpe: 10, note: "Same weight - ALL OUT" },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Straight-Arm Push-Down"), sets: 1, reps: "15", restSeconds: 75, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "15", restSeconds: 75, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Straight-Arm Push-Down"), sets: 1, reps: "10-15", restSeconds: 75, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "10-15", restSeconds: 75, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Straight-Arm Push-Down"), sets: 1, reps: "8-12", restSeconds: 90, rpe: 10, note: "Heavier - ALL OUT" },
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "8-12 + 5-10 partials", restSeconds: 90, rpe: 10, note: "Heavier - ALL OUT" },
            ]
          }
        ]
      }
    ],
    changelog: "v1.0.0: Initial release. v2.0.0: HAYL Elite rebrand.",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
