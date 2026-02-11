/**
 * Seed Script: HAYL Elite III
 * Author: Leul Tewodros Agonafer
 * Slug: hardcore-3day-90min-hypertrophy
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
  { name: "Close Neutral Grip Lat Pull-Down", muscleGroup: "Back", instructions: "Use the V-bar or close neutral grip attachment. Pull to upper chest, keep elbows tucked. Target lower lats." },
];

const PROGRAM = {
  slug: "hardcore-3day-90min-hypertrophy",
  title: "HAYL Elite III",
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

  console.log("🌱 Seeding HAYL Elite III (3-Day, 90min, Hypertrophy)...");

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
      tags: ["hypertrophy", "high-volume", "elite"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 90-minute advanced hypertrophy program. Extreme volume 3-day split with drop sets, partials, and high-frequency training for elite-level physique development.",
    overview_markdown: `
# HAYL Elite III — 90 Min PPL Hypertrophy

**Duration**: 90 min | **Split**: 3-Day PPL | **Focus**: Hypertrophy | **Level**: Elite+

## Why This Program
One of the highest-volume programs in the HAYL system. 90 minutes of heavy compounds, extensive accessory circuits, and high-intensity finishing techniques. For the athlete who lives in the gym.

## Core Principles
- **Maximum Volume** — multiple compound movements per day before accessories even begin
- **Technique Under Fatigue** — maintaining perfect form even in the 60th minute
- **Metabolic Stress** — drop sets and partials create extreme muscle damage and blood flow
- **6-Day Frequency** — designed to maximize weekly protein synthesis

## Coach's Notes
> This program separates athletes from gym-goers. If your nutrition, sleep, and recovery aren't dialed in, you will burn out. Respect the volume.

## Equipment
Barbell, Dumbbells, Cable Machine, Lat Pull-down (V-bar + wide bar), Squat Rack, Chest Machine, Preacher Curl
    `,
    schedule_markdown: `
## Weekly Schedule (Recommended)
- **Mon/Thu**: Day 1 (Legs & Biceps)
- **Tue/Fri**: Day 2 (Chest, Shoulders, Triceps)
- **Wed/Sat**: Day 3 (Deadlifts and Back)
- **Sun**: Rest

## Daily Structure

### Day 1: Legs & Biceps
- Heavy Squat Straight Sets (Pause reps)
- 7-Exercise Accessory Circuit (3 rounds)
- Biceps/Calves Drop Set Finisher

### Day 2: Chest, Shoulders, Triceps
- Flat Bench & Machine Press Straight Sets
- Extensive Shoulder Volume (Presses, Laterals, Rear Delts)
- Choice of Tricep Superset Finishers (Drop sets/Partials)

### Day 3: Deadlifts and Back
- Deadlift Power Block (5 sets)
- Heavy Back Straight Sets (Rows & Pull-downs)
- Lat & Trap Isolation Finisher
    `,
    philosophy_markdown: `
## The Elite Standard

**Pushing Past Failure**  
In Template III, we don't just stop at failure. We use drop sets (dropping weight 30%) and partials (bottom half of the rep) to push the muscle into territory it has never been before.

**Active Recovery between Days**  
When training 6 days per week, the "rest" muscles are active. For example, your back is resting while you train chest. This balance is critical for safety on the 3rd template.

**Why the 90-Minute Window?**  
Volume is the primary driver of hypertrophy. To fit 20-30 quality sets into a session without rushing your heavy compounds, you need the full 90 minutes. Don't waste time on your phone!
    `,
    source_refs: [
      { docId: "hayl-internal", note: "HAYL Elite III — Day 1: Legs & Biceps. Author: Leul Tewodros Agonafer" },
      { docId: "hayl-internal", note: "HAYL Elite III — Day 2: Chest, Shoulders, Triceps. Author: Leul Tewodros Agonafer" },
      { docId: "hayl-internal", note: "HAYL Elite III — Day 3: Deadlifts & Back. Author: Leul Tewodros Agonafer" }
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
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light. PAUSE ALL REPS." },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "10-12", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "9-12", restSeconds: 240, rpe: 10, note: "Same weight - ALL OUT." },
              
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "15-20", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "12-15", restSeconds: 180, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "10-15 + 5-10 partials", restSeconds: 240, rpe: 10, note: "Same weight - ALL OUT." },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Leg Extension"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Adductor Machine"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Abductor Machine"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Leg Curl (Seated or Lying)"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Hip Thrust of choice"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              // Round 3
              { exerciseId: getEx("Leg Extension"), sets: 1, reps: "10-15 + 5 partials", restSeconds: 45, rpe: 10, note: "Round 3 - ALL OUT" },
              { exerciseId: getEx("Adductor Machine"), sets: 1, reps: "10-15 + 5 partials", restSeconds: 45, rpe: 10, note: "Round 3 - ALL OUT" },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Machine Preacher Curls"), sets: 1, reps: "8-12 + drop set", restSeconds: 30, rpe: 9, note: "Drop weight 30% and go to failure" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "8-12 + drop set", restSeconds: 30, rpe: 9, note: "Drop weight 30% and go to failure" },
              { exerciseId: getEx("Machine Preacher Curls"), sets: 1, reps: "8-12 + drop set", restSeconds: 30, rpe: 10, note: "ALL OUT + Drop Set" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "8-12 + drop set", restSeconds: 30, rpe: 10, note: "ALL OUT + Drop Set" },
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
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "20", restSeconds: 60, rpe: 5, note: "Warmup - Light. Pause reps." },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "12", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "10-12", restSeconds: 180, rpe: 10, note: "Heavier - ALL OUT" },
              { exerciseId: getEx("Flat Bench Press"), sets: 1, reps: "15-20", restSeconds: 120, rpe: 10, note: "Lighter - ALL OUT" },
              
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "15-20", restSeconds: 60, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "15", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "12-15", restSeconds: 120, rpe: 10, note: "Heavier - ALL OUT" },
              
              { exerciseId: getEx("Cable Crossovers"), sets: 1, reps: "15", restSeconds: 60, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Cable Crossovers"), sets: 1, reps: "12-15", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Cable Crossovers"), sets: 1, reps: "10-12", restSeconds: 120, rpe: 10, note: "Heavier - ALL OUT" },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy. Control negative." },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "12-15", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "12-15", restSeconds: 90, rpe: 10, note: "Heavy - ALL OUT" },
              
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "15-20", restSeconds: 60, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "12-15", restSeconds: 60, rpe: 10, note: "Heavier + partials. ALL OUT." },

              { exerciseId: getEx("Reverse Pec Deck / Face Pull"), sets: 1, reps: "15", restSeconds: 60, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Reverse Pec Deck / Face Pull"), sets: 1, reps: "12-15", restSeconds: 60, rpe: 10, note: "Heavier - ALL OUT" },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Skullcrushers & Close-Grip Bench Superset"), sets: 1, reps: "15 + 10", restSeconds: 90, rpe: 6, note: "Light - Easy" },
              { exerciseId: getEx("Skullcrushers & Close-Grip Bench Superset"), sets: 1, reps: "12-15 + fail", restSeconds: 120, rpe: 8, note: "Moderate - Moderate" },
              { exerciseId: getEx("Skullcrushers & Close-Grip Bench Superset"), sets: 1, reps: "8-10 + fail", restSeconds: 120, rpe: 10, note: "ALL OUT!" },
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
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "20", restSeconds: 60, rpe: 5, note: "Light - Easy. Touch-and-go OK here." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "10", restSeconds: 180, rpe: 8, note: "Heavier - Moderate/Hard" },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "10-15", restSeconds: 240, rpe: 10, note: "Heaviest - ALL OUT. FULL RESET at bottom." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "10-12", restSeconds: 240, rpe: 10, note: "Lighter - ALL OUT" },
              
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy. Wear straps." },
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "12-15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "11-14", restSeconds: 180, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: getEx("Barbell Row"), sets: 1, reps: "10-13", restSeconds: 180, rpe: 10, note: "Same weight - ALL OUT" },
            ]
          },
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "12-15", restSeconds: 150, rpe: 9, note: "Heavier - Hard" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "10-12", restSeconds: 150, rpe: 10, note: "Heaviest - ALL OUT" },
              
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "15", restSeconds: 150, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "12-15", restSeconds: 150, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "11-13", restSeconds: 180, rpe: 9, note: "Heavier - Harder" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "9-12", restSeconds: 180, rpe: 10, note: "Heaviest - ALL OUT" },
              
              { exerciseId: getEx("Close Neutral Grip Lat Pull-Down"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Close Neutral Grip Lat Pull-Down"), sets: 1, reps: "12-15", restSeconds: 120, rpe: 9, note: "Heavier - Hard" },
              { exerciseId: getEx("Close Neutral Grip Lat Pull-Down"), sets: 1, reps: "10-15", restSeconds: 120, rpe: 10, note: "Same Weight - ALL OUT" },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Lying Dumbbell Pull-Overs"), sets: 1, reps: "15-20", restSeconds: 90, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Lying Dumbbell Pull-Overs"), sets: 1, reps: "10-15", restSeconds: 90, rpe: 10, note: "Same weight - ALL OUT" },
              
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "20", restSeconds: 90, rpe: 7, note: "Moderate. Pause at top." },
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "15", restSeconds: 90, rpe: 9, note: "Heavier - Hard" },
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "10-15 + 5-10 partials", restSeconds: 90, rpe: 10, note: "Same weight - ALL OUT" },
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
