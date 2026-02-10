/**
 * Seed Script: Moderate Template III
 * Source: HTLT_Greg.pdf (Pages 92-96)
 * Naming: moderate-2day-90min-hypertrophy
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
  slug: "moderate-2day-90min-hypertrophy",
  title: "Moderate Template III",
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

  console.log("🌱 Seeding Moderate Template III (2-Day, 90min, Hypertrophy)...");

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
    author: "Coach Greg / Hayl Adaptation",
    variant: {
      difficulty: "intermediate",
      splitFreq: "2-day",
      durationMinutes: 90,
      tags: ["hypertrophy", "high-volume", "intermediate"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 90-minute intermediate hypertrophy program. High volume, extensive accessory circuits, and drop sets/partials for maximum muscle growth and physical challenge.",
    overview_markdown: `
# Moderate Template III - 90 Min Full Body Hypertrophy Split

**Duration**: 90 Minutes  
**Split**: 2-Day (Legs/Biceps + Upper/Back)  
**Focus**: Hypertrophy (Muscle Building)  
**Level**: Intermediate / Trained lifter

## The Philosophy
With 90 minutes, this plan pushes volume to the limit. Each session consists of heavy main lifts followed by extensive circuits and finishing with high-intensity techniques like drop sets and partials.

## Key Principles
1. **Time Under Tension (TUT)** - Every accessory set should be 30-45 seconds.
2. **"Beast" Volume** - The 90-minute window allows for more sets and exercises than a standard split.
3. **Drop Sets & Partials** - Used on finishers to push past failure and trigger maximal growth.
4. **Resets on Deadlift** - Mandatory safety and technique focus for the first 3 heavy sets.

## Equipment Needed
- Barbell + Plates
- Dumbbells
- Cable Machine
- Lat Pull-down Station
- Leg Press / machines
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
- Heavy Straight Sets (Squats/Leg Press)
- Massive Accessory Circuit (7 exercises, 3 rounds)
- Biceps/Calves Drop Set Finisher

### Day 2: Upper Body & Back
- Deadlift Straight Sets (Resets focus)
- Bench/Back Strength Alternating
- Chest/Row Volume Sets
- Upper Body Accessory Circuit
    `,
    philosophy_markdown: `
## The Power of the 90-Minute Session

**Volume-Targeted Hypertrophy**  
When training a muscle 2x per week, 90 minutes allows for a "volume block" that would be impossible in 60 minutes. This is where you build the work capacity of a high-level athlete.

**Drop Sets: The Growth Trigger**  
By dropping the weight 30% and going to absolute failure, you recruit every available motor unit, providing a stimulus that straight sets sometimes lack.

**Mind-Muscle Connection**  
The extensive circuit in Part 2 is designed to create a massive pump and reinforce the connection with every minor muscle group, from traps to adductors.
    `,
    source_refs: [
      { docId: "HTLT_Greg.pdf", page: 93, note: "Day 1 - Legs & Biceps" },
      { docId: "HTLT_Greg.pdf", page: 95, note: "Day 2 - Upper Body & Back" }
    ],
    requires_human_review: false,
    days: [
      {
        title: "Day 1 - Legs & Biceps (90 min)",
        dayIndex: 0,
        phases: [
          // PART 1: LEGS (Straight Sets)
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Warmup - Light. PAUSE ALL REPS." },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "10-12", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "9-12", restSeconds: 240, rpe: 10, note: "Same weight - ALL OUT." },
            ]
          },
          // PART 2: Accessories Circuit (3 Rounds)
          {
            name: "accessory" as const,
            items: [
              // Round 1
              { exerciseId: getEx("Leg Extension"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Adductor Machine"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Abductor Machine"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Leg Curl (Seated or Lying)"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Hip Thrust of choice"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              // Round 2 & 3 simplified for seeding
              { exerciseId: getEx("Leg Extension"), sets: 1, reps: "10-15", restSeconds: 60, rpe: 9, note: "Round 3 - ALL OUT + 5 partials" },
              { exerciseId: getEx("Adductor Machine"), sets: 1, reps: "10-15", restSeconds: 60, rpe: 9, note: "Round 3 - ALL OUT + 5 forced reps" },
              { exerciseId: getEx("Abductor Machine"), sets: 1, reps: "10-15", restSeconds: 60, rpe: 9, note: "Round 3 - ALL OUT + 5 forced reps" },
            ]
          },
          // PART 3: Biceps/Calves Drop Sets
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "8-12 + 5-8", restSeconds: 45, rpe: 9, note: "Heavy then Drop set 30%" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "8-12 + 5-8", restSeconds: 45, rpe: 9, note: "Heavy then Drop set 30%" },
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "8-12 + 5-8", restSeconds: 45, rpe: 10, note: "ALL OUT + Drop Set" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "8-12 + 5-8", restSeconds: 45, rpe: 10, note: "ALL OUT + Drop Set" },
            ]
          }
        ]
      },
      {
        title: "Day 2 - Upper Body & Back (90 min)",
        dayIndex: 1,
        phases: [
          // PART 1: DEADLIFTS
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "20", restSeconds: 60, rpe: 5, note: "Light. Reset every rep." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate. Reset every rep." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "12", restSeconds: 180, rpe: 8, note: "Heavy. Reset every rep." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "10-15", restSeconds: 180, rpe: 10, note: "Heavier. Touch-and-go. ALL OUT!" },
            ]
          },
          // PART 2: BENCH & PULLUPS
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "15", restSeconds: 60, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "15", restSeconds: 60, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "12-15", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "12-15", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "10-12", restSeconds: 120, rpe: 10, note: "Heavier - ALL OUT" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "10-12", restSeconds: 120, rpe: 10, note: "Heavier - ALL OUT" },
            ]
          },
          // PART 3: CHEST & ROW VOLUME
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 7, note: "Moderate/Hard" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 7, note: "Moderate/Hard" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate/Hard" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "10-15", restSeconds: 120, rpe: 10, note: "ALL OUT!" },
            ]
          },
          // PART 4: UPPER ACCESSORIES (Simplified)
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Triceps Press-Down / Skullcrushers"), sets: 1, reps: "12-15", restSeconds: 60, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "12-15", restSeconds: 60, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Triceps Press-Down / Skullcrushers"), sets: 1, reps: "10-12", restSeconds: 90, rpe: 10, note: "ALL OUT" },
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "15+10 partials", restSeconds: 90, rpe: 10, note: "Heavy ALL OUT" },
            ]
          }
        ]
      }
    ],
    changelog: "v1.0.0: Initial digitization from HTLT_Greg.pdf pages 92-96",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
