/**
 * Seed Script: HAYL Elite IV
 * Author: Leul Tewodros Agonafer
 * Slug: hardcore-3day-90min-strength
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
  { name: "Serratus Straight-Arm Lat Pull-downs", muscleGroup: "Back", instructions: "Target the lats and serratus. Keep arms straight, slight forward lean. Pull the bar to your thighs focusing on the side of your torso." },
];

const PROGRAM = {
  slug: "hardcore-3day-90min-strength",
  title: "HAYL Elite IV",
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

  console.log("🌱 Seeding HAYL Elite IV (3-Day, 90min, Strength)...");

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
      durationMinutes: 90,
      tags: ["strength", "powerbuilding", "elite"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 90-minute advanced strength program. The ultimate strength tier. Heavy compounds, high volume, and extended rest periods (3-5 min) for peak power development.",
    overview_markdown: `
# HAYL Elite IV — 90 Min PPL Strength

**Duration**: 90 min | **Split**: 3-Day PPL | **Focus**: Strength | **Level**: Elite+

## Why This Program
The pinnacle of the HAYL strength system. 90 minutes allows for maximum rest between massive sets. If your goal is to move the heaviest weight possible, this is your program.

## Core Principles
- **Neurological Overload** — heavy triples and fives (5-8 rep range) across many sets
- **Ego Control** — paused bench is mandatory; no bouncing weights
- **Compound Density** — multiple horizontal and vertical pulls in the same session
- **Mechanical Advantage Supersets** — pushing tricep stimulus while maintaining heavy work

## Coach's Notes
> This is the final Boss. You need 6 committed sessions/week, elite nutrition, and 7+ hours of sleep. If any of those are missing, drop to Elite I or II until they're locked in.

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
- Heavy Squats (PAUSE FOCUS)
- Legs Accessory Circuit (4 heavy rounds)
- Biceps Finisher

### Day 2: Chest, Shoulders, Triceps Strength
- Flat Bench & Chest Press Intensity Sets
- Shoulder Press and Side Lateral Straight Sets
- Tricep Superset Finisher (Multiple intensive rounds)

### Day 3: Deadlifts and Back Strength
- 5-Set Deadlift Power Block (Up to 5 rep max)
- Volume Back Straight Sets (Rows & Pull-downs)
- Lats & Traps Isolation Finishers
    `,
    philosophy_markdown: `
## The Pinnacle of Power

**Longer Rest for Larger Reps**  
In Template IV, we recommend up to 3-5 minutes of rest on your heavy deadlifts and squats. This isn't laziness—it's necessary to let your phosphocreatine stores replenish so you can lift 100% intensity next set.

**Strength is a Skill**  
By repeating these heavy movements twice a week, you are "greasing the groove" and making your technique more efficient. The better your technique, the more weight you can safely move.

**Why Partials on Accessories?**  
Even in a strength plan, we want to maximize muscle thickness. Partials at the end of a heavy set of shrugs or laterals ensure that every possible muscle fiber is stimulated before you leave the gym.
    `,
    source_refs: [
      { docId: "hayl-internal", note: "HAYL Elite IV — Day 1: Legs & Biceps. Author: Leul Tewodros Agonafer" },
      { docId: "hayl-internal", note: "HAYL Elite IV — Day 2: Chest, Shoulders, Triceps. Author: Leul Tewodros Agonafer" },
      { docId: "hayl-internal", note: "HAYL Elite IV — Day 3: Deadlifts & Back. Author: Leul Tewodros Agonafer" }
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
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Warmup - Light. PAUSE ALL REPS." },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "10-12", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "9-12", restSeconds: 240, rpe: 10, note: "Same weight - ALL OUT." },
              
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "15-20", restSeconds: 120, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "12-15", restSeconds: 180, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "10-15 + 5-10 partials", restSeconds: 240, rpe: 10, note: "Same weight - ALL OUT." },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Adductor Machine"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Abductor Machine"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              // Round 2-4 intensive
              { exerciseId: getEx("Adductor Machine"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy Hard" },
              { exerciseId: getEx("Abductor Machine"), sets: 1, reps: "10 + partials", restSeconds: 60, rpe: 10, note: "Round 3 - Heavier ALL OUT" },
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "8-10 + partials", restSeconds: 60, rpe: 10, note: "Round 3 - Heavier ALL OUT" },
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
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy. Pause reps." },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "10", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "6-8", restSeconds: 240, rpe: 9, note: "Heavier - Harder" },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "5-8", restSeconds: 240, rpe: 10, note: "Same weight - ALL OUT." },
              
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "12", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "8-10", restSeconds: 180, rpe: 9, note: "Heavier - Harder" },
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "7-10", restSeconds: 180, rpe: 10, note: "Same weight - ALL OUT" },
              
              { exerciseId: getEx("Pec Deck"), sets: 1, reps: "15", restSeconds: 60, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Pec Deck"), sets: 1, reps: "12", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Pec Deck"), sets: 1, reps: "8-10", restSeconds: 180, rpe: 10, note: "Heavier - ALL OUT" },
            ]
          },
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "15", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "8-10", restSeconds: 150, rpe: 8, note: "Heavier - Hard" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "7-10", restSeconds: 150, rpe: 10, note: "Same Weight - ALL OUT" },

              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "15", restSeconds: 30, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "10-12", restSeconds: 60, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "8-10 + 5-10 partials", restSeconds: 45, rpe: 10, note: "Heavier - ALL OUT" },
              
              { exerciseId: getEx("Reverse Pec Deck / Face Pull"), sets: 1, reps: "15", restSeconds: 30, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Reverse Pec Deck / Face Pull"), sets: 1, reps: "12-15", restSeconds: 30, rpe: 8, note: "Heavier - Hard" },
              { exerciseId: getEx("Reverse Pec Deck / Face Pull"), sets: 1, reps: "10-15 + partials", restSeconds: 45, rpe: 10, note: "Same weight - ALL OUT" },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Skullcrushers & Close-Grip Bench Superset"), sets: 1, reps: "10 + 10", restSeconds: 90, rpe: 6, note: "Light - Easy" },
              { exerciseId: getEx("Skullcrushers & Close-Grip Bench Superset"), sets: 1, reps: "8-10 + fail", restSeconds: 150, rpe: 8, note: "Moderate - Moderate" },
              { exerciseId: getEx("Skullcrushers & Close-Grip Bench Superset"), sets: 1, reps: "6-10 + fail", restSeconds: 180, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: getEx("Skullcrushers & Close-Grip Bench Superset"), sets: 1, reps: "4-8 + fail", restSeconds: 180, rpe: 10, note: "Same weight - ALL OUT" },
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
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light. Reset all reps." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate. Reset." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "10", restSeconds: 180, rpe: 8, note: "Heavy. Reset." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "6-8", restSeconds: 240, rpe: 9, note: "Heavier - Harder" },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "5-8", restSeconds: 240, rpe: 10, note: "Same weight - ALL OUT" },
              
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy. Wear straps." },
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "10-12", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "9-12", restSeconds: 240, rpe: 9, note: "Same weight - Harder" },
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "8-12", restSeconds: 240, rpe: 10, note: "Same weight - ALL OUT" },
            ]
          },
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "12", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "8-10", restSeconds: 150, rpe: 9, note: "Heavier - Hard" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "7-10", restSeconds: 150, rpe: 10, note: "Same weight - ALL OUT" },
              
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "15", restSeconds: 60, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "12", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "8-10", restSeconds: 150, rpe: 10, note: "Heavier - ALL OUT" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "7-10", restSeconds: 150, rpe: 10, note: "Same weight - ALL OUT" },
              
              { exerciseId: getEx("Close Neutral Grip Lat Pull-Down"), sets: 1, reps: "12-15", restSeconds: 60, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Close Neutral Grip Lat Pull-Down"), sets: 1, reps: "8-10", restSeconds: 120, rpe: 9, note: "Heavier - Hard" },
              { exerciseId: getEx("Close Neutral Grip Lat Pull-Down"), sets: 1, reps: "7-10", restSeconds: 150, rpe: 10, note: "Same weight - ALL OUT" },

              { exerciseId: getEx("Serratus Straight-Arm Lat Pull-downs"), sets: 1, reps: "12-15", restSeconds: 60, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Serratus Straight-Arm Lat Pull-downs"), sets: 1, reps: "10-12", restSeconds: 120, rpe: 9, note: "Heavier - Hard" },
              { exerciseId: getEx("Serratus Straight-Arm Lat Pull-downs"), sets: 1, reps: "9-12", restSeconds: 150, rpe: 10, note: "Same weight - ALL OUT" },
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
