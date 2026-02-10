/**
 * Seed Script: Hardcore Template III
 * Source: HTLT_Greg.pdf (Pages 116-121)
 * Naming: hardcore-3day-90min-hypertrophy
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Doc, Id } from "../convex/_generated/dataModel.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

const EXERCISES = [
  { name: "Close Neutral Grip Lat Pull-Down", muscleGroup: "Back", instructions: "Use the V-bar or close neutral grip attachment. Pull to upper chest, keep elbows tucked. Target lower lats." },
];

const PROGRAM = {
  slug: "hardcore-3day-90min-hypertrophy",
  title: "Hardcore Template III",
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

  console.log("🌱 Seeding Hardcore Template III (3-Day, 90min, Hypertrophy)...");

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
    author: "Coach Greg / Hayl Adaptation",
    variant: {
      difficulty: "elite",
      splitFreq: "3-day",
      durationMinutes: 90,
      tags: ["hypertrophy", "high-volume", "elite", "hardcore"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 90-minute advanced hypertrophy program. Extreme volume 3-day split (repeated for 6 days/week). Incorporates drop sets, partials, and high-frequency training for the elite physique.",
    overview_markdown: `
# Hardcore Template III - 90 Min Full Body PPL Hypertrophy

**Duration**: 90 Minutes  
**Split**: 3-Day (Legs/Biceps + Chest/Shoulders/Triceps + Back/Deadlift)  
**Focus**: Hypertrophy (Muscle Building)  
**Level**: Advanced / Elite

## The Philosophy
This is one of the highest volume programs in the HTLT system. 90 minutes allows for extensive straight sets followed by heavy accessory circuits and finishing with high-intensity techniques. This is for the lifter who eats, sleeps, and breathes the gym.

## Key Principles
1. **Max Volume** - Multiple compound movements per day before even getting to accessories.
2. **Technique under Fatigue** - Maintaining perfect form even during the 60th minute of the workout.
3. **Metabolic Stress** - Drop sets and partials are used to create incredible levels of blood flow and muscle damage.
4. **Frequency** - Designed to be run 6 days a week to maximize weekly protein synthesis.

## Equipment Needed
- Barbell + Plates
- Dumbbells
- Cable Machine
- Lat Pull-down Station (V-bar + wide bar)
- Squat Machine or Rack
- Chest Machine
- Preacher Curl Bench
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
      { docId: "HTLT_Greg.pdf", page: 116, note: "Day 1 - Legs & Biceps" },
      { docId: "HTLT_Greg.pdf", page: 118, note: "Day 2 - Chest, Shoulders, Triceps" },
      { docId: "HTLT_Greg.pdf", page: 120, note: "Day 3 - Deadlists and Back" }
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
    changelog: "v1.0.0: Initial digitization from HTLT_Greg.pdf pages 116-121",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
