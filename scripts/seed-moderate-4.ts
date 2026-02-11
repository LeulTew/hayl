/**
 * Seed Script: HAYL Hybrid IV
 * Author: Leul Tewodros Agonafer
 * Slug: moderate-2day-90min-strength
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


const PROGRAM = {
  slug: "moderate-2day-90min-strength",
  title: "HAYL Hybrid IV",
  canonicalVersion: "v1.0",
  difficulty: "intermediate" as const,
  splitType: "2-day" as const,
  isPremium: false,
  published: true,
};

async function main() {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ ADMIN_SECRET is not set in environment.");
    process.exit(1);
  }

  console.log("🌱 Seeding HAYL Hybrid IV (2-Day, 90min, Strength)...");

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
  const programIds = (await client.mutation(api.programs.seedPrograms, { programs: [PROGRAM], adminSecret: adminSecret })) as Record<string, Id<"programs">>;
  const programId = programIds[PROGRAM.slug];
  console.log(`✅ Program Created: ${programId}`);

  // Seed Derived Plan
  const planId = await client.mutation(api.programs.seedDerivedPlan, {
    programId, adminSecret: adminSecret,
    version: "v1.0.0",
    author: "HAYL Performance Team",
    variant: {
      difficulty: "intermediate",
      splitFreq: "2-day",
      durationMinutes: 90,
      tags: ["strength", "powerbuilding", "high-volume-strength", "intermediate"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 90-minute intermediate strength program. High-volume strength work with multiple compounds and extensive accessory rounds. Raw power meets metabolic stress.",
    overview_markdown: `
# HAYL Hybrid IV — 90 Min Strength Split

**Duration**: 90 min | **Split**: 2-Day (Legs/Biceps + Upper/Back) | **Focus**: Strength | **Level**: Hybrid+

## Why This Program
The most comprehensive Hybrid strength template. 90 minutes provides the runway for low-rep heavy compounds (5-8 reps) plus high-volume accessory work to eliminate weak points.

## Core Principles
- **Heavier Than Last Time** — always aim for one more rep or slightly more weight
- **Explosive Concentric** — fire hard on the way up, control the way down
- **Compound Synergy** — alternating opposing muscle groups to maintain intensity
- **Partials on Finishers** — extra stimulation at end of accessory work

## Coach's Notes
> This is our peak Hybrid strength program. It demands 4 committed sessions/week and full recovery between them. Not for beginners — graduate from Hybrid I or II first.

## Equipment
Barbell, Dumbbells, Cable Machine, Lat Pull-down, Squat Rack, Leg Press
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
      { docId: "hayl-internal", note: "HAYL Hybrid IV — Day 1: Legs & Biceps. Author: Leul Tewodros Agonafer" },
      { docId: "hayl-internal", note: "HAYL Hybrid IV — Day 2: Upper Body & Back. Author: Leul Tewodros Agonafer" }
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
    changelog: "v1.0.0: Initial release. v2.0.0: HAYL Hybrid rebrand.",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
