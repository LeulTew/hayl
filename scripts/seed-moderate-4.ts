/**
 * Seed Script: Moderate Template IV
 * Source: HTLT_Greg.pdf (Pages 98-101)
 * Naming: moderate-2day-90min-strength
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Doc, Id } from "../convex/_generated/dataModel.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

const PROGRAM = {
  slug: "moderate-2day-90min-strength",
  title: "Moderate Template IV",
  canonicalVersion: "v1.0",
  difficulty: "intermediate" as const,
  splitType: "2-day" as const,
  isPremium: false,
  published: true,
};

async function main() {
  console.log("🌱 Seeding Moderate Template IV (2-Day, 90min, Strength)...");

  // Fetch Exercise IDs
  const exercises = (await client.query(api.exercises.listAll)) as Doc<"exercises">[];
  const exMap = new Map<string, Id<"exercises">>( 
    exercises.map((e) => [e.name, e._id])
  );

  // Helper to get ID with logging
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
  const programIds = (await client.mutation(api.programs.seedPrograms, { programs: [PROGRAM] })) as Record<string, Id<"programs">>;
  const programId = programIds[PROGRAM.slug];
  console.log(`✅ Program Created: ${programId}`);

  // Seed Derived Plan
  const planId = await client.mutation(api.programs.seedDerivedPlan, {
    programId,
    version: "v1.0.0",
    author: "Coach Greg / Hayl Adaptation",
    variant: {
      difficulty: "intermediate",
      splitFreq: "2-day",
      durationMinutes: 90,
      tags: ["strength", "powerbuilding", "high-volume-strength", "intermediate"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 90-minute intermediate strength program. High volume strength work with multiple compound lifts and extensive accessory rounds. Combines raw power with metabolic stress.",
    overview_markdown: `
# Moderate Template IV - 90 Min Full Body Strength Split

**Duration**: 90 Minutes  
**Split**: 2-Day (Legs/Biceps + Upper/Back)  
**Focus**: Strength (Power Building)  
**Level**: Intermediate / Trained lifter

## The Philosophy
This template is for the dedicated lifter who wants to maximize strength in 90-minute sessions. It features low rep ranges on major compounds (5-8 reps) and high-volume accessory sets to ensure no weakness is left behind.

## Key Principles
1. **Heavier Than Last Time** - The core of the program. Always strive for one more rep or a slightly heavier weight.
2. **Explosive Concentric** - Fire the muscles hard on the way up, but control the eccentric.
3. **Compound Synergy** - Alternating sets between opposing muscle groups (Chest/Back) to maintain intensity and save time.
4. **Finishers with Partials** - Extra stimulation at the end of accessory work to maximize the pump and strength gains.

## Equipment Needed
- Barbell + Plates
- Dumbbells
- Cable Machine
- Lat Pull-down / Pull-up Station
- Squat Machine or Rack
- Leg Press / machines
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

### Day 1: Legs & Biceps Strength
- Heavy Straight Sets (Squats/Leg Press)
- Large Strength Accessory Circuit (2 intensive rounds)
- Biceps/Calves Superset Finisher

### Day 2: Upper Body & Back Strength
- Heavy Deadlifts (Reset focus)
- Bench & Pull-up Intensity Sets
- Chest, Shoulder, & Back Volume Circuit
- Upper Body Accessory Alternating Sets
    `,
    philosophy_markdown: `
## The Hybrid Athlete Approach

**Strength for Size**  
By mastering weights in the 5-8 rep range, you create a foundation that makes hypertrophy work (10-15 reps) much more effective in the future.

**The Power of Alternating Sets**  
Alternating Bench with Pull-ups allows you to lift heavier than you would in a straight set format because one muscle group is active while the other is in 'active recovery.'

**Why 90 Minutes?**  
Strength requires rest. To lift at your absolute best, you need the time to recover between sets. This plan gives you that buffer to ensure every set is a quality set.
    `,
    source_refs: [
      { docId: "HTLT_Greg.pdf", page: 98, note: "Day 1 - Legs & Biceps" },
      { docId: "HTLT_Greg.pdf", page: 100, note: "Day 2 - Upper Body & Back" }
    ],
    requires_human_review: false,
    days: [
      {
        title: "Day 1 - Legs & Biceps Strength (90 min)",
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
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "5-8", restSeconds: 240, rpe: 10, note: "Same weight - ALL OUT!" },
              
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "15", restSeconds: 120, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "10-12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "8-10", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "6-10 + 10 partials", restSeconds: 180, rpe: 10, note: "Heavier - ALL OUT" },
            ]
          },
          // PART 2: Accessories Circuit (4-6 exercises, 3-4 rounds)
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Adductor Machine"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Abductor Machine"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Hip Thrust of choice"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              // Round 3 intensive
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "8-10 + partials", restSeconds: 60, rpe: 10, note: "Round 3 - Heavier - Hard/All Out" },
              { exerciseId: getEx("Hip Thrust of choice"), sets: 1, reps: "8-12 + partials", restSeconds: 60, rpe: 10, note: "Round 3 - Heavier - Hard/All Out" },
            ]
          }
        ]
      },
      {
        title: "Day 2 - Upper Body & Back Strength (90 min)",
        dayIndex: 1,
        phases: [
          // PART 1: DEADLIFTS
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy. Reset every rep." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "12", restSeconds: 90, rpe: 7, note: "Moderate - Moderate. Reset." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "10", restSeconds: 180, rpe: 8, note: "Heavy - Hard. Reset." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "6-8", restSeconds: 240, rpe: 9, note: "Heavier - Harder" },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "5-8", restSeconds: 240, rpe: 10, note: "Heavier - ALL OUT" },
            ]
          },
          // PART 2: BENCH & BACK
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Neutral Grip Lat Pull-Down"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "10", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Neutral Grip Lat Pull-Down"), sets: 1, reps: "10", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "8", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Neutral Grip Lat Pull-Down"), sets: 1, reps: "8", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "5-7", restSeconds: 120, rpe: 10, note: "Heavier - ALL OUT" },
              { exerciseId: getEx("Neutral Grip Lat Pull-Down"), sets: 1, reps: "5-7", restSeconds: 120, rpe: 10, note: "Heavier - ALL OUT" },
            ]
          },
          // PART 3: CHEST/SHOULDER/BACK circuit
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "12", restSeconds: 60, rpe: 7, note: "Moderate/Hard" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "12", restSeconds: 60, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "7-9", restSeconds: 120, rpe: 10, note: "Heavy - ALL OUT" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "7-9", restSeconds: 120, rpe: 10, note: "Heavy - ALL OUT" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate/Hard" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "7-9", restSeconds: 120, rpe: 10, note: "Heavy - Harder" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "5-8", restSeconds: 120, rpe: 10, note: "Same weight - Harderer" },
            ]
          },
          // PART 4: UPPER ACCESSORIES
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "12", restSeconds: 60, rpe: 7, note: "Moderate" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "10-12", restSeconds: 60, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: getEx("Triceps Press-Down / Skullcrushers"), sets: 1, reps: "12-15", restSeconds: 90, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Face Pull"), sets: 1, reps: "12-15", restSeconds: 60, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "12-15", restSeconds: 90, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "10 + 10 partials", restSeconds: 90, rpe: 10, note: "Heavier - ALL OUT" },
            ]
          }
        ]
      }
    ],
    changelog: "v1.0.0: Initial digitization from HTLT_Greg.pdf pages 98-101",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
