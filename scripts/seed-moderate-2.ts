/**
 * Seed Script: Moderate Template II
 * Source: HTLT_Greg.pdf (Pages 88-91)
 * Naming: moderate-2day-60min-strength
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Doc, Id } from "../convex/_generated/dataModel.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

const PROGRAM = {
  slug: "moderate-2day-60min-strength",
  title: "Moderate Template II",
  canonicalVersion: "v1.0",
  difficulty: "intermediate" as const,
  splitType: "2-day" as const,
  isPremium: false,
  published: true,
};

async function main() {
  console.log("🌱 Seeding Moderate Template II (2-Day, 60min, Strength)...");

  // Fetch Exercise IDs (already seeded from Moderate I and Casuals)
  const exercises = (await client.query(api.exercises.listAll)) as Doc<"exercises">[];
  const exMap = new Map<string, Id<"exercises">>(
    exercises.map((e) => [e.name, e._id])
  );

  // Helper to get ID with logging
  const getEx = (name: string): Id<"exercises"> => {
    const id = exMap.get(name);
    if (!id) {
      console.error(`❌ Missing exercise: "${name}"`);
      // List similar names for debugging
      const similar = Array.from(exMap.keys()).filter(k => k.includes(name) || name.includes(k));
      if (similar.length > 0) console.log(`👉 Similar: ${similar.join(", ")}`);
      throw new Error(`Missing exercise: ${name}`);
    }
    return id;
  };

  // Seed Program
  const programIds = (await client.mutation(api.programs.seedPrograms, { programs: [PROGRAM], adminSecret: "hayl-seed-secret-2026" })) as Record<string, Id<"programs">>;
  const programId = programIds[PROGRAM.slug];
  console.log(`✅ Program Created: ${programId}`);

  // Seed Derived Plan
  const planId = await client.mutation(api.programs.seedDerivedPlan, {
    programId, adminSecret: "hayl-seed-secret-2026",
    version: "v1.0.0",
    author: "Coach Greg / Hayl Adaptation",
    variant: {
      difficulty: "intermediate",
      splitFreq: "2-day",
      durationMinutes: 60,
      tags: ["strength", "powerbuilding", "intermediate"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 60-minute intermediate strength program. Lower reps, higher intensity, and longer rest periods compared to the hypertrophy version. Focuses on building raw power and compound strength.",
    overview_markdown: `
# Moderate Template II - 2-Day Split Strength

**Duration**: 60 Minutes  
**Split**: 2-Day (Legs/Biceps + Upper/Back)  
**Focus**: Strength (Power Building)  
**Level**: Intermediate / Trained

## The Philosophy
This is the strength-focused version of the moderate split. While it still builds muscle, the primary goal is neurological adaptation to heavy loads. The rep ranges are lower (5-8 for main lifts) to allow for heavier weights.

## Key Principles
1. **Raw Power** - Focus on the weight moved, not just the "burn."
2. **Explosive Concentric** - Pull/Push the weight aggressively but with control.
3. **Pauses for Safety** - Bench press pauses are mandatory to protect your shoulders.
4. **Full Recovery** - Rest 2-3 minutes on main lifts to ensure you can lift heavy every set.

## Equipment Needed
- Barbell + Plates
- Dumbbells
- Cable Machine
- Lat Pull-down / Pull-up Station
- Squat Machine or Rack
- Adductor/Abductor Machines
    `,
    schedule_markdown: `
## Weekly Schedule (Recommended)
- **Mon**: Day 1 (Legs & Biceps)
- **Tue**: Day 2 (Upper Body & Back)
- **Wed**: Rest
- **Thu**: Day 1 (Legs & Biceps)
- **Fri**: Day 2 (Upper Body & Back)
- **Sat/Sun**: Rest / Cardio

## Daily Structure

### Day 1: Legs & Biceps
- Heavy Squat Variations (rep range: 5-8)
- Strength Accessories
- Supersets for Biceps and Calves

### Day 2: Upper Body & Back
- Heavy Deadlifts (Reset focus)
- Bench & Pull-up Strength (rep range: 5-8)
- Overhead Press & Row Alternating Sets
    `,
    philosophy_markdown: `
## The Strength Advantage

**Neural Drive**  
Intermediate lifters benefit greatly from strength phases. By training your brain to recruit more muscle fibers, you increase your potential for hypertrophy when you return to higher rep ranges.

**Reset on Deadlifts**  
By resetting the weight on the floor for the first 3 sets, you ensure perfect form on every single rep. The individual reps are essentially "singles" performed in a set, which is the best way to build a massive deadlift safely.

**Intensity is Identity**  
In this plan, intensity means the percentage of your 1-rep max. We are pushing closer to the limit of your absolute strength.
    `,
    source_refs: [
      { docId: "HTLT_Greg.pdf", page: 88, note: "Day 1 - Legs & Biceps" },
      { docId: "HTLT_Greg.pdf", page: 90, note: "Day 2 - Upper Body & Back" }
    ],
    requires_human_review: false,
    days: [
      {
        title: "Day 1 - Legs & Biceps (Strength)",
        dayIndex: 0,
        phases: [
          // PART 1: LEGS (Straight Sets)
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Warmup - Light/Easy" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "10", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "6-8", restSeconds: 240, rpe: 9, note: "Heavier - Harder" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "5-8", restSeconds: 240, rpe: 10, note: "Same Weight - ALL OUT." },
              
              // Option B
              { exerciseId: getEx("Machine Squat of Choice"), sets: 1, reps: "15", restSeconds: 120, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Machine Squat of Choice"), sets: 1, reps: "10-12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Machine Squat of Choice"), sets: 1, reps: "8-10", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Machine Squat of Choice"), sets: 1, reps: "6-10", restSeconds: 180, rpe: 10, note: "Heavier - ALL OUT + 10 partials." },
            ]
          },
          // PART 2: Accessories Circuit
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Adductor Machine"), sets: 1, reps: "15", restSeconds: 45, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Hip Thrust of choice"), sets: 1, reps: "15", restSeconds: 45, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Leg Extension"), sets: 1, reps: "15", restSeconds: 45, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Leg Curl (Seated or Lying)"), sets: 1, reps: "15", restSeconds: 45, rpe: 7, note: "Moderate" },
              // Round 2
              { exerciseId: getEx("Adductor Machine"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 9, note: "Heavier - Hard/All Out" },
              { exerciseId: getEx("Hip Thrust of choice"), sets: 1, reps: "10-12", restSeconds: 45, rpe: 9, note: "Heavier - Hard/All Out" },
              { exerciseId: getEx("Leg Extension"), sets: 1, reps: "10-12", restSeconds: 45, rpe: 9, note: "Heavier - Hard/All Out" },
              { exerciseId: getEx("Leg Curl (Seated or Lying)"), sets: 1, reps: "10-12", restSeconds: 45, rpe: 9, note: "Heavier - Hard/All Out" },
            ]
          },
          // PART 3: Biceps/Calves Superset
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "15", restSeconds: 45, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "20", restSeconds: 45, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 10, note: "Heavier - ALL OUT" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "15-20", restSeconds: 45, rpe: 10, note: "Heavier - ALL OUT" },
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "10-15", restSeconds: 45, rpe: 10, note: "Same Weight - ALL OUT" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "15-20", restSeconds: 45, rpe: 10, note: "Same Weight - ALL OUT + partials" },
            ]
          }
        ]
      },
      {
        title: "Day 2 - Upper Body & Back (Strength)",
        dayIndex: 1,
        phases: [
          // PART 1: DEADLIFTS
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy. Reset at bottom." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "12", restSeconds: 90, rpe: 7, note: "Moderate - Moderate. Reset." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "10", restSeconds: 180, rpe: 8, note: "Heavy - Hard. Reset." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "5-8", restSeconds: 180, rpe: 10, note: "Heavier - ALL OUT. Touch-and-go OK here." },

              // PART 2: BENCH & BACK
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Neutral Grip Lat Pull-Down"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "12", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Neutral Grip Lat Pull-Down"), sets: 1, reps: "12", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "8", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Neutral Grip Lat Pull-Down"), sets: 1, reps: "8", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "5-8", restSeconds: 120, rpe: 10, note: "Heavier - ALL OUT" },
              { exerciseId: getEx("Neutral Grip Lat Pull-Down"), sets: 1, reps: "5-8", restSeconds: 120, rpe: 10, note: "Heavier - ALL OUT" },
            ]
          },
          // PART 3: UPPER ACCESSORIES
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "10", restSeconds: 90, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "10", restSeconds: 90, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "5-8", restSeconds: 120, rpe: 10, note: "Heavier - ALL OUT" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "5-8", restSeconds: 120, rpe: 10, note: "Heavier - ALL OUT" },
              
              { exerciseId: getEx("Triceps Press-Down / Skullcrushers"), sets: 1, reps: "10-12", restSeconds: 75, rpe: 7, note: "Moderate/Heavy" },
              { exerciseId: getEx("Straight-Arm Push-Down"), sets: 1, reps: "10-12", restSeconds: 75, rpe: 7, note: "Moderate/Heavy" },
              { exerciseId: getEx("Triceps Press-Down / Skullcrushers"), sets: 1, reps: "8-10", restSeconds: 90, rpe: 10, note: "Heavy - ALL OUT" },
              { exerciseId: getEx("Straight-Arm Push-Down"), sets: 1, reps: "8-10", restSeconds: 90, rpe: 10, note: "Heavy - ALL OUT" },
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "10", restSeconds: 120, rpe: 10, note: "+ 10 partials. Beast Mode!" },
            ]
          }
        ]
      }
    ],
    changelog: "v1.0.0: Initial digitization from HTLT_Greg.pdf pages 88-91",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
