/**
 * Seed Script: HAYL Elite I
 * Author: Leul Tewodros Agonafer
 * Slug: hardcore-3day-60min-hypertrophy
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
  { name: "Flat Bench Press", muscleGroup: "Chest", instructions: "Medium to wide grip for chest focus. Pause on all sets except the ALL OUT set. Control the weight." },
  { name: "Cable Crossovers", muscleGroup: "Chest", instructions: "Target the inner chest. Focus on the squeeze at the peak of the movement." },
  { name: "Pec Deck", muscleGroup: "Chest", instructions: "Isolate the pecs. Keep elbows up and chest out. Control the stretch." },
  { name: "T-Bar Row", muscleGroup: "Back", instructions: "Wear straps. Pull to abdomen, squeeze shoulder blades together." },
  { name: "Machine Preacher Curls", muscleGroup: "Biceps", instructions: "Isolate the biceps. Avoid full lockout at the bottom to maintain tension. Slow eccentric." },
];

const PROGRAM = {
  slug: "hardcore-3day-60min-hypertrophy",
  title: "HAYL Elite I",
  canonicalVersion: "v2.0",
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

  console.log("🌱 Seeding HAYL Elite I (3-Day, 60min, Hypertrophy)...");

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
    version: "v2.0.0",
    author: "HAYL Performance Team",
    variant: {
      difficulty: "elite",
      splitFreq: "3-day",
      durationMinutes: 60,
      tags: ["hypertrophy", "ppl", "elite"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 60-minute advanced high-frequency hypertrophy program. 3-day split designed for 5-6 sessions/week. Maximum volume and intensity for experienced lifters.",
    overview_markdown: `
# HAYL Elite I — 3-Day Split Hypertrophy

**Duration**: 60 min | **Split**: 3-Day PPL (Legs/Biceps + Chest/Shoulders/Triceps + Back/Deadlift) | **Focus**: Hypertrophy | **Level**: Elite

## Why This Program
The Elite tier is for athletes training 5-6 days/week. A 3-day split repeated twice hits every muscle group with maximum volume and intensity — the highest frequency in the HAYL system.

## Core Principles
- **PPL Architecture** — a battle-tested split optimized for high-frequency training
- **Circuit Accessories** — fast-paced circuits keep heart rate elevated and maximize efficiency
- **Strict Compound Form** — pause your bench, reset your deadlifts — even at Elite level
- **Progressive Overload** — "doing more than last time" is the only rule

## Coach's Notes
> Elite programs are not for beginners. If you haven't been consistent on Hybrid for 12+ weeks, you're not ready. This is earned.

## Equipment
Barbell, Dumbbells, Cable Machine, Lat Pull-down, Squat Rack, Pec Deck
    `,
    schedule_markdown: `
## Weekly Schedule (Recommended)
- **Mon/Thu**: Day 1 (Legs & Biceps)
- **Tue/Fri**: Day 2 (Chest, Shoulders, Triceps)
- **Wed/Sat**: Day 3 (Deadlifts and Back)
- **Sun**: Rest

## Daily Structure

### Day 1: Legs & Biceps
- Heavy Squat Straight Sets (Pause focus)
- High-Volume Accessory Circuit
- Bicep Finisher

### Day 2: Chest, Shoulders, Triceps
- Flat Bench & Incline Press
- Shoulder Superset
- Chest/Delt/Tricep Finisher Circuit

### Day 3: Deadlifts and Back
- Deadlift Straight Sets (Reset focus)
- Heavy Back Straight Sets (Rows/Pull-downs)
- Trap & Lat Finisher
    `,
    philosophy_markdown: `
## Advanced Recovery and Intensity

**The 6-Day Schedule**  
To follow this plan as intended, you should be training 6 days per week. This provides the stimulus needed for advanced muscle growth. If you find you can't recover, drop to 5 days or switch back to the Moderate Tier.

**Why Straight Sets for Legs/Back?**  
On Day 1 and Day 3, we use straight sets for the heaviest compounds. This ensures you are fully focused on the movement without the distraction of a circuit, allowing for maximum strength output.

**"Shower Harder than Last Time"**  
The finishers on Day 2 are meant to completely exhaust your pushing muscles. If you can't lift your arms to wash your hair after the workout, you did it right.
    `,
    source_refs: [
      { docId: "hayl-internal", note: "HAYL Elite I — Day 1: Legs & Biceps. Author: Leul Tewodros Agonafer" },
      { docId: "hayl-internal", note: "HAYL Elite I — Day 2: Chest, Shoulders, Triceps. Author: Leul Tewodros Agonafer" },
      { docId: "hayl-internal", note: "HAYL Elite I — Day 3: Deadlifts & Back. Author: Leul Tewodros Agonafer" }
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
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy. PAUSE ALL REPS." },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "10-12", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "9-12", restSeconds: 240, rpe: 10, note: "Same Weight - ALL OUT." },
              
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
              { exerciseId: getEx("Leg Extension"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Leg Curl (Seated or Lying)"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Seated Incline Dumbbell Curls"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              // Round 3 Finisher
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "8-12 + 5-10 partials", restSeconds: 75, rpe: 10, note: "Round 3 - ALL OUT" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "8-12 + 5-10 partials", restSeconds: 75, rpe: 10, note: "Round 3 - ALL OUT" },
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
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "20", restSeconds: 60, rpe: 5, note: "Light - Easy. Pause all reps." },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate. Pause." },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "10-12", restSeconds: 180, rpe: 9, note: "Heavy - Hard. Pause." },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "12-15", restSeconds: 180, rpe: 10, note: "Lighter - ALL OUT. No pause needed on last set." },
              
              { exerciseId: getEx("Incline Chest Press of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Incline Chest Press of Choice"), sets: 1, reps: "12", restSeconds: 150, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: getEx("Incline Chest Press of Choice"), sets: 1, reps: "10-12", restSeconds: 150, rpe: 10, note: "Heavier - ALL OUT" },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "15", restSeconds: 15, rpe: 6, note: "Moderate. Superset with laterals." },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "15", restSeconds: 90, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "12-15", restSeconds: 15, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "12-15", restSeconds: 90, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "10-15", restSeconds: 15, rpe: 10, note: "Same weight - ALL OUT" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "10-15", restSeconds: 90, rpe: 10, note: "Same weight - ALL OUT" },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Cable Crossovers"), sets: 1, reps: "15", restSeconds: 60, rpe: 7, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Reverse Pec Deck / Face Pull"), sets: 1, reps: "15", restSeconds: 60, rpe: 7, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Triceps Press-Down / Skullcrushers"), sets: 1, reps: "15", restSeconds: 60, rpe: 7, note: "Round 1 - Moderate" },
              // Round 2
              { exerciseId: getEx("Cable Crossovers"), sets: 1, reps: "12-15", restSeconds: 60, rpe: 10, note: "Round 2 - Heavier - ALL OUT" },
              { exerciseId: getEx("Reverse Pec Deck / Face Pull"), sets: 1, reps: "12-15", restSeconds: 60, rpe: 10, note: "Round 2 - Heavier - ALL OUT" },
              { exerciseId: getEx("Triceps Press-Down / Skullcrushers"), sets: 1, reps: "12-15", restSeconds: 60, rpe: 10, note: "Round 2 - Heavier - ALL OUT" },
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
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "20", restSeconds: 120, rpe: 5, note: "Light - Easy. Reset all reps." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "15", restSeconds: 180, rpe: 7, note: "Moderate - Moderate. Reset." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "10-15", restSeconds: 180, rpe: 10, note: "Heavy - ALL OUT. No reset on last set." },
              
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate. Wear straps." },
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "12-15", restSeconds: 180, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "10-15", restSeconds: 180, rpe: 10, note: "Heavier - ALL OUT" },

              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "12-15", restSeconds: 120, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "10-15", restSeconds: 120, rpe: 10, note: "Heavier - ALL OUT" },
              
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "12-15", restSeconds: 120, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "12-15", restSeconds: 120, rpe: 10, note: "Heavier - ALL OUT" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "10-15", restSeconds: 120, rpe: 10, note: "Same weight - ALL OUT" },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "15-20", restSeconds: 90, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Straight-Arm Push-Down"), sets: 1, reps: "15-20", restSeconds: 90, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "12-15", restSeconds: 90, rpe: 8, note: "Heavier - Hard" },
              { exerciseId: getEx("Straight-Arm Push-Down"), sets: 1, reps: "12-15", restSeconds: 90, rpe: 8, note: "Heavier - Hard" },
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "10-15", restSeconds: 90, rpe: 10, note: "Same weight - ALL OUT" },
              { exerciseId: getEx("Straight-Arm Push-Down"), sets: 1, reps: "8-12 + 5-10 partials", restSeconds: 90, rpe: 10, note: "Same weight - ALL OUT" },
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
