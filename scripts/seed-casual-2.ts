/**
 * Seed Script: Casual Template II
 * Source: HTLT_Greg.pdf (Pages 71-73)
 * Naming: casual-1day-60min-strength
 * 
 * Structure from book:
 * - 1-Day Split | 60 Minutes | Strength
 * - PART 1: Squat & Lat Alternating Sets (lower reps, heavier weights)
 * - PART 2: Deadlift/Row & Bench/Chest Alternating Sets
 * - PART 3: Accessories Circuit (2-3 rounds, lower reps)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Doc, Id } from "../convex/_generated/dataModel.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

// Exercises already seeded from Casual I, just reference them

const PROGRAM = {
  slug: "casual-1day-60min-strength",
  title: "Casual Template II",
  canonicalVersion: "v1.0",
  difficulty: "beginner" as const,
  splitType: "2-day" as const,
  isPremium: false,
  published: true,
};

async function main() {
  console.log("🌱 Seeding Casual Template II (1-Day, 60min, Strength)...");

  // Fetch Exercise IDs (already seeded from Casual I)
  const exercises = (await client.query(api.exercises.listAll)) as Doc<"exercises">[];
  const exMap = new Map<string, Id<"exercises">>(
    exercises.map((e) => [e.name, e._id])
  );

  const getEx = (name: string): Id<"exercises"> => {
    const id = exMap.get(name);
    if (!id) throw new Error(`Missing exercise: ${name}`);
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
      difficulty: "amateur",
      splitFreq: "1-day",
      durationMinutes: 60,
      tags: ["full-body", "strength", "casual", "powerbuilding"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 60-minute full-body strength session. Lower reps, heavier weights, focused on building raw power. For those who want to get STRONG while training just 1-2 times per week.",
    overview_markdown: `
# Casual Template II - Full Body Strength

**Duration**: 60 Minutes  
**Split**: 1-Day (Full Body)  
**Focus**: Strength (Power Building)  
**Level**: Casual / Beginner-Friendly

## The Philosophy
This template is the STRENGTH version of the casual 1-day split. Same efficient alternating set structure, but with lower rep ranges and heavier weights to build raw power.

## Key Differences from Hypertrophy Template
1. **Lower Rep Ranges** - 5-8 reps for main lifts instead of 10-15
2. **Longer Rest** - 2-3 minutes between heavy sets
3. **Fewer Accessories** - Focus on compound movements
4. **Progressive Overload Priority** - Add weight when you hit top of rep range

## Equipment Needed
- Barbell + Plates
- Dumbbells
- Cable Machine
- Lat Pull-down / Pull-up Station
- Leg Press or Squat Rack
    `,
    schedule_markdown: `
## Daily Structure

### PART 1: Squat & Lat Alternating Sets (15 min)
- Alternate between squat and lat exercises
- 4 sets each, ascending intensity
- Rep range: 8-12 → 5-8

### PART 2: Deadlift & Bench Alternating Sets (20 min)
- Alternate between deadlift/row and bench/chest
- 6 sets each, ascending intensity
- Rep range: 10-12 → 5-8

### PART 3: Accessories Circuit (20 min)
- 2-3 rounds of full-body circuit
- Lower reps, heavier weights
    `,
    philosophy_markdown: `
## Why Strength Training Works

**Neural Adaptations**  
Heavy lifting trains your nervous system to recruit more muscle fibers. This is why beginners can get stronger without adding much muscle mass initially.

**The 5-8 Rep Range**  
Research shows 5-8 reps with heavy weight is optimal for building strength while still accumulating enough volume for muscle growth.

**Compound Focus**  
Squats, Deadlifts, Bench, Rows - these multi-joint movements give you the most bang for your buck when time is limited.
    `,
    source_refs: [
      { docId: "HTLT_Greg.pdf", page: 71, note: "Casual Template II - 1-Day Split, 60 min, Strength" }
    ],
    requires_human_review: false,
    days: [
      {
        title: "Day 1 - Full Body Strength",
        dayIndex: 0,
        phases: [
          // PART 1: Squat & Lat Alternating Sets (Strength Focus)
          {
            name: "warmup" as const,
            items: [
              { exerciseId: getEx("Squat of Choice"), sets: 1, reps: "12", restSeconds: 60, note: "Light weight, warm up. Focus on mobility." },
            ]
          },
          {
            name: "main" as const,
            items: [
              // Squat/Lat Alternating - ramping up
              { exerciseId: getEx("Squat of Choice"), sets: 1, reps: "10", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "10", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Squat of Choice"), sets: 1, reps: "8", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "8", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Squat of Choice"), sets: 1, reps: "5-6", restSeconds: 180, rpe: 9, note: "Heavy - Hard. This is your working weight!" },
              { exerciseId: getEx("Chin-up / Supinated Lat Pull-down"), sets: 1, reps: "5-6", restSeconds: 180, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: getEx("Squat of Choice"), sets: 1, reps: "5-8", restSeconds: 180, rpe: 10, note: "Same weight - ALL OUT. Push to near failure." },
              { exerciseId: getEx("Chin-up / Supinated Lat Pull-down"), sets: 1, reps: "5-8", restSeconds: 180, rpe: 10, note: "Same weight - ALL OUT" },
              
              // PART 2: Deadlift & Bench
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "10", restSeconds: 90, rpe: 5, note: "Light - Easy. No belt." },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "10", restSeconds: 90, rpe: 5, note: "Light - Easy. PAUSE every rep!" },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "6-8", restSeconds: 150, rpe: 8, note: "Heavy - Hard. Belt optional." },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "6-8", restSeconds: 150, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "5-8", restSeconds: 180, rpe: 10, note: "Heavier - ALL OUT. Belt + straps OK." },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "5-8", restSeconds: 180, rpe: 10, note: "Heavier - ALL OUT" },
              
              // Rows & Chest
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "10", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "10", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "6-8", restSeconds: 120, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "6-8", restSeconds: 120, rpe: 9, note: "Heavy - Hard" },
            ]
          },
          // PART 3: Accessories Circuit (Strength Focus - 2 rounds)
          {
            name: "accessory" as const,
            items: [
              // Round 1
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "10", restSeconds: 45, rpe: 7, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "12", restSeconds: 30, rpe: 7, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Seated Incline Dumbbell Curls"), sets: 1, reps: "10", restSeconds: 45, rpe: 7, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Bodyweight / Machine Dips"), sets: 1, reps: "10", restSeconds: 45, rpe: 7, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "12", restSeconds: 30, rpe: 7, note: "Round 1 - Moderate" },
              // Round 2
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "6-8", restSeconds: 60, rpe: 9, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "10-12", restSeconds: 45, rpe: 9, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Seated Incline Dumbbell Curls"), sets: 1, reps: "8-10", restSeconds: 60, rpe: 9, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Bodyweight / Machine Dips"), sets: 1, reps: "8-10", restSeconds: 60, rpe: 9, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "10-12", restSeconds: 45, rpe: 9, note: "Round 2 - Heavy/Hard" },
            ]
          }
        ]
      }
    ],
    changelog: "v1.0.0: Initial digitization from HTLT_Greg.pdf pages 71-73",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
