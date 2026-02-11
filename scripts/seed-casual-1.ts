/**
 * Seed Script: HAYL Essentials I
 * Author: Leul Tewodros Agonafer
 * Slug: casual-1day-60min-hypertrophy
 * 
 * Structure:
 * - 1-Day Split | 60 Minutes | Hypertrophy
 * - PART 1: Squat & Lat Alternating Sets
 * - PART 2: Deadlift/Row & Bench/Chest Alternating Sets
 * - PART 3: Accessories Circuit (3 rounds)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Doc, Id } from "../convex/_generated/dataModel.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

const EXERCISES = [
  { name: "Squat of Choice", muscleGroup: "Legs", instructions: "Control the weight. Focus on slow eccentric (3-4 seconds down). Each set should take 30-40 seconds. Options: Barbell Back Squat, Front Squat, Hack Squat, Leg Press." },
  { name: "Leg Press", muscleGroup: "Legs", instructions: "Feet shoulder-width apart on platform. Lower with control until 90 degrees. Drive through heels. Do NOT lock knees at top." },
  { name: "Pull-up / Lat Pull-down", muscleGroup: "Back", instructions: "Focus on controlling the weight with a slow eccentric. Pull to upper chest. Squeeze lats at bottom. Full extension at top." },
  { name: "Chin-up / Supinated Lat Pull-down", muscleGroup: "Back", instructions: "Palms facing you. Pull to upper chest. Squeeze biceps and lats. Control the negative." },
  { name: "Deadlift of Choice", muscleGroup: "Back", instructions: "Conventional is hardest on lower back. Consider sumo or trap bar as safer options. No belt for light/moderate sets. Belt optional for heavy sets." },
  { name: "Paused Bench Press", muscleGroup: "Chest", instructions: "PAUSE on ALL sets to avoid injury. Lower bar to chest, pause 1 second, then press. Leave ego at the door!" },
  { name: "Row of Choice", muscleGroup: "Back", instructions: "Seated, Bent-Over, Chest-Supported, Barbell - it doesn't matter! Pull to hip, squeeze back, control the negative." },
  { name: "Chest Machine of Choice", muscleGroup: "Chest", instructions: "Pec Deck, Cable Crossover, Chest Press Machine. Focus on TUT (time under tension) and slow eccentric." },
  { name: "Shoulder Press of Choice", muscleGroup: "Shoulders", instructions: "Seated or standing. Press overhead without arching back. Control descent." },
  { name: "Side Lateral Raises", muscleGroup: "Shoulders", instructions: "Slight bend in elbows. Raise to shoulder height. Control the negative. Don't use momentum." },
  { name: "Reverse Pec Deck / Face Pull", muscleGroup: "Shoulders", instructions: "Target rear delts. Squeeze at contraction. Keep elbows high for face pulls." },
  { name: "Seated Incline Dumbbell Curls", muscleGroup: "Biceps", instructions: "Incline bench at 45-60 degrees. Full stretch at bottom. Squeeze at top. No swinging." },
  { name: "Triceps Press-Down / Skullcrushers", muscleGroup: "Triceps", instructions: "Keep elbows pinned. Full extension. Squeeze triceps at bottom of press-down." },
  { name: "Bodyweight / Machine Dips", muscleGroup: "Triceps", instructions: "Lean forward slightly for chest emphasis. Upright for triceps. Full range of motion." },
  { name: "Leg Extension", muscleGroup: "Legs", instructions: "Squeeze quads at top. Control the negative. Don't jerk the weight." },
  { name: "Leg Curl (Seated or Lying)", muscleGroup: "Hamstrings", instructions: "Full contraction. Slow negative. Don't let the weight stack slam." },
  { name: "Standing / Seated Calf Raise", muscleGroup: "Calves", instructions: "Full stretch at bottom. Full contraction at top. Pause briefly at peak." },
];

const PROGRAM = {
  slug: "casual-1day-60min-hypertrophy",
  title: "HAYL Essentials I",
  canonicalVersion: "v2.0",
  difficulty: "beginner" as const,
  splitType: "1-day" as const,
  isPremium: false,
  published: true,
};

async function main() {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ ADMIN_SECRET is not set in environment.");
    process.exit(1);
  }

  console.log("🌱 Seeding HAYL Essentials I (1-Day, 60min, Hypertrophy)...");

  // 1. Seed Exercises
  await client.mutation(api.exercises.seedExercises, { exercises: EXERCISES, adminSecret: adminSecret });
  console.log("✅ Exercises seeded.");

  // 2. Fetch Exercise IDs
  const exercises = (await client.query(api.exercises.listAll)) as Doc<"exercises">[];
  const exMap = new Map<string, Id<"exercises">>(
    exercises.map((e) => [e.name, e._id])
  );

  // 3. Seed Program
  const programIds = (await client.mutation(api.programs.seedPrograms, { programs: [PROGRAM], adminSecret: adminSecret })) as Record<string, Id<"programs">>;
  const programId = programIds[PROGRAM.slug];
  console.log(`✅ Program Created: ${programId}`);

  // 4. Seed Derived Plan
  const planId = await client.mutation(api.programs.seedDerivedPlan, {
    programId, adminSecret: adminSecret,
    version: "v2.0.0",
    author: "HAYL Performance Team",
    variant: {
      difficulty: "amateur",
      splitFreq: "1-day",
      durationMinutes: 60,
      tags: ["full-body", "hypertrophy", "essentials"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 60-minute full-body hypertrophy session designed for busy schedules. Train 1-2x per week with controlled reps, time under tension, and progressive overload.",
    overview_markdown: `
# HAYL Essentials I — Full Body Hypertrophy

**Duration**: 60 min | **Split**: Full Body | **Focus**: Hypertrophy | **Level**: Essentials

## Why This Program
Maximum results from minimum frequency. One session covers every muscle group through intelligent alternating supersets — resting one muscle while training another.

## Core Principles
- **Controlled Eccentrics** — 3-4 seconds on the way down, every rep
- **Time Under Tension** — 30-40s per set for optimal hypertrophy stimulus
- **Paused Bench** — mandatory pause at chest to protect shoulders
- **Progressive Overload** — hit top of rep range → add weight next session

## Coach's Notes
> Perfect for athletes training 1-2x/week. Don't let the "Essentials" label fool you — this session is dense, efficient, and highly effective when executed with discipline.

## Equipment
Barbell, Dumbbells, Cable Machine, Lat Pull-down, Leg Press / Squat Rack
    `,
    schedule_markdown: `
## Daily Structure

### PART 1: Squat & Lat Alternating Sets (12-15 min)
- Alternate between squat and lat exercises
- 4 sets each, ascending intensity

### PART 2: Deadlift & Bench Alternating Sets (15-20 min)
- Alternate between deadlift/row and bench/chest
- 6 sets each, ascending intensity

### PART 3: Accessories Circuit (20-25 min)
- 3 rounds of full-body circuit
- Shoulders → Biceps → Triceps → Quads → Hamstrings → Calves
    `,
    philosophy_markdown: `
## The Science Behind HAYL Essentials I

**Frequency Matching**
Full-body sessions 1-2x/week are optimal for building a strength foundation. Research shows beginners respond well to full-body frequency when volume per session is managed.

**Alternating Supersets**
Pairing opposing muscle groups (squat/lats, bench/rows) doubles training density without compromising recovery between sets.

**Ascending Intensity**
Every exercise ramps from light to heavy. This is deliberate — it primes the nervous system and protects joints while reserving peak effort for the final sets.
    `,
    source_refs: [
      { docId: "hayl-internal", note: "HAYL Essentials I — 1-Day, 60 min, Hypertrophy. Author: Leul Tewodros Agonafer" }
    ],
    requires_human_review: false,
    days: [
      {
        title: "Day 1 - Full Body Hypertrophy",
        dayIndex: 0,
        phases: [
          // PART 1: Squat & Lat Alternating Sets
          {
            name: "warmup" as const,
            items: [
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "12", restSeconds: 60, note: "Light weight, Easy intensity. Focus on slow eccentric." },
            ]
          },
          {
            name: "main" as const,
            items: [
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "12", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: exMap.get("Pull-up / Lat Pull-down")!, sets: 1, reps: "12", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "10", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Pull-up / Lat Pull-down")!, sets: 1, reps: "10", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "10-12", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: exMap.get("Chin-up / Supinated Lat Pull-down")!, sets: 1, reps: "10-12", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "8-10", restSeconds: 120, rpe: 9, note: "Same weight - Harder (go to failure if needed)" },
              { exerciseId: exMap.get("Chin-up / Supinated Lat Pull-down")!, sets: 1, reps: "8-10", restSeconds: 120, rpe: 9, note: "Same weight - Harder" },
              // PART 2: Deadlift & Bench
              { exerciseId: exMap.get("Deadlift of Choice")!, sets: 1, reps: "15", restSeconds: 90, rpe: 5, note: "Moderate - Moderate. No belt." },
              { exerciseId: exMap.get("Paused Bench Press")!, sets: 1, reps: "15", restSeconds: 90, rpe: 5, note: "Moderate - Moderate. PAUSE every rep!" },
              { exerciseId: exMap.get("Deadlift of Choice")!, sets: 1, reps: "12-15", restSeconds: 120, rpe: 8, note: "Heavy - Hard. Belt optional." },
              { exerciseId: exMap.get("Paused Bench Press")!, sets: 1, reps: "12-15", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: exMap.get("Row of Choice")!, sets: 1, reps: "15", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Chest Machine of Choice")!, sets: 1, reps: "15", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Row of Choice")!, sets: 1, reps: "12", restSeconds: 90, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: exMap.get("Chest Machine of Choice")!, sets: 1, reps: "12", restSeconds: 90, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: exMap.get("Row of Choice")!, sets: 1, reps: "10-12", restSeconds: 90, rpe: 9, note: "Same weight - Harder" },
              { exerciseId: exMap.get("Chest Machine of Choice")!, sets: 1, reps: "10-12", restSeconds: 90, rpe: 9, note: "Same weight - Harder" },
            ]
          },
          // PART 3: Accessories Circuit
          {
            name: "accessory" as const,
            items: [
              // Round 1
              { exerciseId: exMap.get("Shoulder Press of Choice")!, sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: exMap.get("Side Lateral Raises")!, sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: exMap.get("Seated Incline Dumbbell Curls")!, sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: exMap.get("Triceps Press-Down / Skullcrushers")!, sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: exMap.get("Leg Extension")!, sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: exMap.get("Leg Curl (Seated or Lying)")!, sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: exMap.get("Standing / Seated Calf Raise")!, sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              // Round 2
              { exerciseId: exMap.get("Shoulder Press of Choice")!, sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: exMap.get("Side Lateral Raises")!, sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: exMap.get("Seated Incline Dumbbell Curls")!, sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: exMap.get("Triceps Press-Down / Skullcrushers")!, sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: exMap.get("Standing / Seated Calf Raise")!, sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              // Round 3
              { exerciseId: exMap.get("Shoulder Press of Choice")!, sets: 1, reps: "10-15", restSeconds: 60, rpe: 9, note: "Round 3 - Same weight/Harder" },
              { exerciseId: exMap.get("Side Lateral Raises")!, sets: 1, reps: "10-15", restSeconds: 60, rpe: 9, note: "Round 3 - Same weight/Harder" },
              { exerciseId: exMap.get("Seated Incline Dumbbell Curls")!, sets: 1, reps: "10-15", restSeconds: 60, rpe: 9, note: "Round 3 - Same weight/Harder" },
              { exerciseId: exMap.get("Triceps Press-Down / Skullcrushers")!, sets: 1, reps: "10-15", restSeconds: 60, rpe: 9, note: "Round 3 - Same weight/Harder" },
              { exerciseId: exMap.get("Standing / Seated Calf Raise")!, sets: 1, reps: "10-15", restSeconds: 60, rpe: 9, note: "Round 3 - Same weight/Harder" },
            ]
          }
        ]
      }
    ],
    changelog: "v1.0.0: Initial digitization. v2.0.0: HAYL Essentials rebrand.",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
