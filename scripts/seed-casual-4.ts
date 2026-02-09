/**
 * Seed Script: Casual Template IV
 * Source: HTLT_Greg.pdf (Pages 78-80)
 * Naming: casual-1day-90min-strength
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Doc, Id } from "../convex/_generated/dataModel.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

const EXERCISES = [
  { name: "Incline Chest Press of Choice", muscleGroup: "Chest", instructions: "Incline Dumbbell Press, Incline Barbell Press, or Incline Chest Machine. Focus on upper chest. Control the negative." },
];

const PROGRAM = {
  slug: "casual-1day-90min-strength",
  title: "Casual Template IV",
  canonicalVersion: "v1.0",
  difficulty: "beginner" as const,
  splitType: "2-day" as const, // Closest match for 1-day full body
  isPremium: false,
  published: true,
};

async function main() {
  console.log("🌱 Seeding Casual Template IV (1-Day, 90min, Strength)...");

  // Seed new exercises
  await client.mutation(api.exercises.seedExercises, { exercises: EXERCISES });

  // Fetch Exercise IDs
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
      durationMinutes: 90,
      tags: ["full-body", "strength", "powerbuilding", "casual"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 90-minute full-body strength session. Combines heavy main lifts with a robust accessory circuit. Ideal for building raw strength and dense muscle on a low-frequency schedule.",
    overview_markdown: `
# Casual Template IV - High Volume Full Body Strength

**Duration**: 90 Minutes  
**Split**: 1-Day (Full Body)  
**Focus**: Strength (Power Building)  
**Level**: Casual / Amateur

## The Philosophy
This is the ultimate strength template for the casual lifter. 90 minutes provides ample time for long rest periods (2-3+ minutes) necessary for heavy, high-intensity sets while still including a comprehensive accessory circuit for overall physique development.

## Key Principles
1. **Prioritize Performance** - Focus on moving the weight with perfect form
2. **Longer Rest** - Rest as long as needed to fully recover for the next heavy set
3. **Control the Negative** - Even on strength sets, don't drop the weight
4. **Pause on Bench** - Safety first, ego last
5. **RPE 10** - Push the final sets of compound lifts to the limit

## Equipment Needed
- Barbell + Plates
- Dumbbells
- Cable Machine
- Lat Pull-down / Pull-up Station
- Leg Press / Squat Rack
- Incline Bench / Machine
    `,
    schedule_markdown: `
## Daily Structure

### PART 1: Squat & Lat Strength Alternating (25 min)
- Ramping from 12 reps to 5-8 reps all-out sets
- 4 alternating cycles with 2-3 min rest

### PART 2: Deadlift & Bench Strength Alternating (30 min)
- Power focus: 12 reps to 5-8 reps
- Followed by Rows and Incline Chest Press
- 6 alternating cycles

### PART 3: Accessories Circuit (30 min)
- 2-3 rounds of full-body support work
- Shoulders → Biceps → Triceps → Calves
    `,
    philosophy_markdown: `
## The Strength Advantage

**Neural Efficiency**  
Lifting in the 5-8 rep range with 90 minutes of total time allows you to accumulate high-quality, high-intensity volume. This is the most efficient way to build strength for those who don't prioritize pure muscle size.

**Why Pause?**  
Pausing on the bench press removes the "stretch reflex" or bounce, making your muscles do all the work and drastically reducing the risk of shoulder/pectoral injury.

**The "Beast" Rounds**  
Part 3 is your chance to catch any muscle groups that need extra attention. If you feel like a beast, hit 3 rounds; otherwise, 2 is plenty after the heavy work in Parts 1 and 2.
    `,
    source_refs: [
      { docId: "HTLT_Greg.pdf", page: 79, note: "Casual Template IV - 1-Day Split, 90 min, Strength" }
    ],
    requires_human_review: false,
    days: [
      {
        title: "Day 1 - Full Body Strength (90 min)",
        dayIndex: 0,
        phases: [
          // PART 1: Squats & Lats
          {
            name: "warmup" as const,
            items: [
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "12", restSeconds: 60, note: "Light - Easy. Focus on form." },
            ]
          },
          {
            name: "main" as const,
            items: [
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "12", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: exMap.get("Pull-up / Lat Pull-down")!, sets: 1, reps: "12", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "10", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Pull-up / Lat Pull-down")!, sets: 1, reps: "10", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "6-8", restSeconds: 180, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: exMap.get("Chin-up / Supinated Lat Pull-down")!, sets: 1, reps: "6-8", restSeconds: 180, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "5-8", restSeconds: 180, rpe: 10, note: "Same weight - Hard. Push the limit." },
              { exerciseId: exMap.get("Chin-up / Supinated Lat Pull-down")!, sets: 1, reps: "5-8", restSeconds: 180, rpe: 10, note: "Same weight - Hard" },

              // PART 2: Deadlift/Row & Bench/Chest
              { exerciseId: exMap.get("Deadlift of Choice")!, sets: 1, reps: "12", restSeconds: 90, rpe: 5, note: "Light - Easy. No belt." },
              { exerciseId: exMap.get("Paused Bench Press")!, sets: 1, reps: "12", restSeconds: 90, rpe: 5, note: "Light - Easy. PAUSE on all sets." },
              { exerciseId: exMap.get("Deadlift of Choice")!, sets: 1, reps: "8-10", restSeconds: 180, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Paused Bench Press")!, sets: 1, reps: "8-10", restSeconds: 180, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Deadlift of Choice")!, sets: 1, reps: "6-8", restSeconds: 180, rpe: 9, note: "Heavy - Hard. Belt optional." },
              { exerciseId: exMap.get("Paused Bench Press")!, sets: 1, reps: "6-8", restSeconds: 180, rpe: 9, note: "Heavy - Hard" },
              
              { exerciseId: exMap.get("Row of Choice")!, sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Incline Chest Press of Choice")!, sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Row of Choice")!, sets: 1, reps: "6-9", restSeconds: 120, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: exMap.get("Incline Chest Press of Choice")!, sets: 1, reps: "6-9", restSeconds: 120, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: exMap.get("Row of Choice")!, sets: 1, reps: "5-8", restSeconds: 120, rpe: 10, note: "Same weight - Harder" },
              { exerciseId: exMap.get("Incline Chest Press of Choice")!, sets: 1, reps: "5-8", restSeconds: 120, rpe: 10, note: "Same weight - Harder" },
            ]
          },
          // PART 3: Accessories Circuit
          {
            name: "accessory" as const,
            items: [
              // Round 1
              { exerciseId: exMap.get("Shoulder Press of Choice")!, sets: 1, reps: "12", restSeconds: 45, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: exMap.get("Side Lateral Raises")!, sets: 1, reps: "12", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: exMap.get("Seated Incline Dumbbell Curls")!, sets: 1, reps: "12", restSeconds: 45, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: exMap.get("Bodyweight / Machine Dips")!, sets: 1, reps: "12", restSeconds: 45, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: exMap.get("Standing / Seated Calf Raise")!, sets: 1, reps: "12", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              // Round 2
              { exerciseId: exMap.get("Shoulder Press of Choice")!, sets: 1, reps: "8-10", restSeconds: 60, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: exMap.get("Side Lateral Raises")!, sets: 1, reps: "8-10", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: exMap.get("Seated Incline Dumbbell Curls")!, sets: 1, reps: "8-10", restSeconds: 60, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: exMap.get("Bodyweight / Machine Dips")!, sets: 1, reps: "8-10", restSeconds: 60, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: exMap.get("Standing / Seated Calf Raise")!, sets: 1, reps: "8-10", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              // Round 3 (Optional)
              { exerciseId: exMap.get("Shoulder Press of Choice")!, sets: 1, reps: "7-10", restSeconds: 90, rpe: 9, note: "Round 3 - Heavier/Harder" },
              { exerciseId: exMap.get("Side Lateral Raises")!, sets: 1, reps: "7-10", restSeconds: 60, rpe: 9, note: "Round 3 - Heavier/Harder" },
              { exerciseId: exMap.get("Seated Incline Dumbbell Curls")!, sets: 1, reps: "7-10", restSeconds: 90, rpe: 9, note: "Round 3 - Heavier/Harder" },
              { exerciseId: exMap.get("Bodyweight / Machine Dips")!, sets: 1, reps: "7-10", restSeconds: 90, rpe: 9, note: "Round 3 - Heavier/Harder" },
              { exerciseId: exMap.get("Standing / Seated Calf Raise")!, sets: 1, reps: "7-10", restSeconds: 60, rpe: 9, note: "Round 3 - Heavier/Harder" },
            ]
          }
        ]
      }
    ],
    changelog: "v1.0.0: Initial digitization from HTLT_Greg.pdf pages 78-80",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
