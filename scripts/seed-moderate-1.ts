/**
 * Seed Script: Moderate Template I
 * Source: HTLT_Greg.pdf (Pages 82-86)
 * Naming: moderate-2day-60min-hypertrophy
 * Split: 2 Days (Day 1: Legs & Biceps, Day 2: Upper Body & Back)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Doc, Id } from "../convex/_generated/dataModel.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

const EXERCISES = [
  { name: "Barbell Squat of Choice", muscleGroup: "Legs", instructions: "PAUSE ALL OF YOUR REPS at the bottom. Control the weight (30-45s sets). Options: Back Squat, Front Squat." },
  { name: "Machine Squat of Choice", muscleGroup: "Legs", instructions: "Hack Squat, V-Squat, Smith Machine, or Belt Squat. Control weight; focus on leg drive." },
  { name: "Neutral Grip Lat Pull-Down", muscleGroup: "Back", instructions: "Use the V-bar or parallel grips. Pull to upper chest, squeeze lats, control the negative." },
  { name: "Straight-Arm Push-Down", muscleGroup: "Back", instructions: "Target the lats without involving biceps. Slight bend in elbows, pull bar to thighs." },
  { name: "Dumbbell/Barbell Shrug", muscleGroup: "Traps", instructions: "Wear straps. Elevate shoulders straight up. Squeeze at top. Don't roll shoulders." },
  { name: "Adductor Machine", muscleGroup: "Legs", instructions: "Squeeze legs together. Control the return. Focus on the inner thigh." },
  { name: "Abductor Machine", muscleGroup: "Legs", instructions: "Push legs outward. Squeeze the gluteus medius/outer hip." },
  { name: "Hip Thrust of choice", muscleGroup: "Legs", instructions: "Barbell, machine, or bands. Squeeze glutes at peak contraction. Hold for 1s." },
  { name: "Barbell or Dumbbell Curl", muscleGroup: "Biceps", instructions: "General bicep curl. Use a weight you can control with no swinging." },
];

const PROGRAM = {
  slug: "moderate-2day-60min-hypertrophy",
  title: "Moderate Template I",
  canonicalVersion: "v1.0",
  difficulty: "intermediate" as const,
  splitType: "2-day" as const,
  isPremium: false,
  published: true,
};

async function main() {
  console.log("🌱 Seeding Moderate Template I (2-Day, 60min, Hypertrophy)...");

  // Seed new exercises
  await client.mutation(api.exercises.seedExercises, { exercises: EXERCISES });

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
      // List similar names for debugging
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
      durationMinutes: 60,
      tags: ["hypertrophy", "progressive-overload", "intermediate"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 60-minute intermediate hypertrophy program. Designed for those training 4 days per week (2-day split repeated). Features higher frequency for each muscle group for maximum growth.",
    overview_markdown: `
# Moderate Template I - 2-Day Split Hypertrophy

**Duration**: 60 Minutes  
**Split**: 2-Day (Legs/Biceps + Upper/Back)  
**Focus**: Hypertrophy (Muscle Building)  
**Level**: Intermediate / Trained

## The Philosophy
The Moderate Templates are designed for consistent 4-day-a-week training. By splitting the body into two days, you can hit every muscle group twice per week with high intensity and sufficient volume.

## Key Principles
1. **Compound Lifts First** - Always start with the hardest movement of the day.
2. **Frequency over Volume** - Hitting muscles twice a week is superior to once-a-week "bro splits."
3. **Controlled Eccentrics** - Every rep counts; don't let gravity do the work.
4. **Resets on Deadlift** - For hypertrophy and safety, pause and reset on the floor for the first 3 sets.

## Equipment Needed
- Barbell + Plates
- Dumbbells
- Cable Machine
- Lat Pull-down Station
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
- Heavy Straight Sets (Squats/Leg Press)
- Accessory Circuit (3 Rounds)
- Bicep Finisher focus

### Day 2: Upper Body & Back
- Deadlift Straight Sets (Resets focus)
- Bench/Back Alternating Sets
- Shoulder/Back/Trap Circuit
    `,
    philosophy_markdown: `
## Why the 2-Day Split?

**Muscle Protein Synthesis**  
Protein synthesis levels return to baseline after 36-48 hours. By training a muscle group every 3-4 days (frequency of 2x/week), you keep your body in an anabolic state for more of the week compared to a traditional split.

**Manageable Volume**  
Because you are training the same muscles again in a few days, you don't need to completely "destroy" them with 20 sets in one session, which improves recovery and session-to-session performance.

**Progressive Overload**  
The Moderate Tier is where you focus on truly "doing more than last time." Track every weight and every rep!
    `,
    source_refs: [
      { docId: "HTLT_Greg.pdf", page: 83, note: "Day 1 - Legs & Biceps" },
      { docId: "HTLT_Greg.pdf", page: 85, note: "Day 2 - Upper Body & Back" }
    ],
    requires_human_review: false,
    days: [
      {
        title: "Day 1 - Legs & Biceps",
        dayIndex: 0,
        phases: [
          // PART 1: LEGS (Straight Sets)
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy. PAUSE ALL REPS." },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "12", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "10-12", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Barbell Squat of Choice"), sets: 1, reps: "9-12", restSeconds: 240, rpe: 10, note: "Same Weight - ALL OUT. Do more than last time!" },
              
              // Option B or C as second exercise
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "15-20", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "12-15", restSeconds: 180, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "10-15", restSeconds: 240, rpe: 10, note: "Same Weight - ALL OUT + 5-10 partials." },
            ]
          },
          // PART 2: Accessories Circuit
          {
            name: "accessory" as const,
            items: [
              // Round 1
              { exerciseId: getEx("Adductor Machine"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Hip Thrust of choice"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Leg Extension"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Leg Curl (Seated or Lying)"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Seated Incline Dumbbell Curls"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "15-20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              // Round 2
              { exerciseId: getEx("Adductor Machine"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Hip Thrust of choice"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Leg Extension"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Leg Curl (Seated or Lying)"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Seated Incline Dumbbell Curls"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              // Round 3 (Finisher)
              { exerciseId: getEx("Barbell or Dumbbell Curl"), sets: 1, reps: "8-12", restSeconds: 60, rpe: 10, note: "Round 3 - ALL OUT + 5-10 partials" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "8-12", restSeconds: 60, rpe: 10, note: "Round 3 - ALL OUT + partials" },
              { exerciseId: getEx("Seated Incline Dumbbell Curls"), sets: 1, reps: "8-12", restSeconds: 60, rpe: 10, note: "Round 3 - ALL OUT + partials" },
            ]
          }
        ]
      },
      {
        title: "Day 2 - Upper Body & Back",
        dayIndex: 1,
        phases: [
          // PART 1: DEADLIFTS
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "20", restSeconds: 60, rpe: 5, note: "Light - Easy. FULL RESET on every rep." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate. FULL RESET." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "12", restSeconds: 180, rpe: 8, note: "Heavy - Hard. FULL RESET." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "10-15", restSeconds: 180, rpe: 10, note: "Heavier - ALL OUT. Touch-and-go style!" },

              // PART 2: BENCH & BACK
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Neutral Grip Lat Pull-Down"), sets: 1, reps: "15", restSeconds: 60, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "12", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Neutral Grip Lat Pull-Down"), sets: 1, reps: "12", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "10-12", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Neutral Grip Lat Pull-Down"), sets: 1, reps: "10-12", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "9-12", restSeconds: 120, rpe: 10, note: "Same weight - ALL OUT" },
              { exerciseId: getEx("Neutral Grip Lat Pull-Down"), sets: 1, reps: "9-12", restSeconds: 120, rpe: 10, note: "Same weight - ALL OUT" },
            ]
          },
          // PART 3: UPPER ACCESSORIES circuit
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "15-20", restSeconds: 75, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "15-20", restSeconds: 75, rpe: 6, note: "Moderate" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "15", restSeconds: 75, rpe: 7, note: "Moderate/Heavy" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "15", restSeconds: 75, rpe: 7, note: "Moderate/Heavy" },
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "12-15", restSeconds: 90, rpe: 9, note: "Heavy - Hard" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "12-15", restSeconds: 90, rpe: 9, note: "Heavy - Hard" },
              
              { exerciseId: getEx("Triceps Press-Down / Skullcrushers"), sets: 1, reps: "12-15", restSeconds: 75, rpe: 7, note: "Moderate/Heavy" },
              { exerciseId: getEx("Straight-Arm Push-Down"), sets: 1, reps: "12-15", restSeconds: 75, rpe: 7, note: "Moderate/Heavy" },
              { exerciseId: getEx("Triceps Press-Down / Skullcrushers"), sets: 1, reps: "10-12", restSeconds: 90, rpe: 10, note: "Heavy - ALL OUT" },
              { exerciseId: getEx("Straight-Arm Push-Down"), sets: 1, reps: "10-12", restSeconds: 90, rpe: 10, note: "Heavy - ALL OUT" },
              { exerciseId: getEx("Dumbbell/Barbell Shrug"), sets: 1, reps: "15-20", restSeconds: 120, rpe: 10, note: "+ 10 partials. Take your pumped neck home!" },
            ]
          }
        ]
      }
    ],
    changelog: "v1.0.0: Initial digitization from HTLT_Greg.pdf pages 82-86",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
