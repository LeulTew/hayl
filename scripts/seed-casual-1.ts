/**
 * Seed Script: Casual Template I
 * Source: HTLT_Greg.pdf (Pages 68-70)
 * Naming: casual-1day-60min-hypertrophy
 * 
 * Structure from book:
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
  title: "Casual Template I",
  canonicalVersion: "v1.0",
  difficulty: "beginner" as const,
  splitType: "2-day" as const, // Using 2-day as closest match for 1-day full body
  isPremium: false,
  published: true,
};

async function main() {
  console.log("🌱 Seeding Casual Template I (1-Day, 60min, Hypertrophy)...");

  // 1. Seed Exercises
  await client.mutation(api.exercises.seedExercises, { exercises: EXERCISES });
  console.log("✅ Exercises seeded.");

  // 2. Fetch Exercise IDs
  const exercises = (await client.query(api.exercises.listAll)) as Doc<"exercises">[];
  const exMap = new Map<string, Id<"exercises">>(
    exercises.map((e) => [e.name, e._id])
  );

  // 3. Seed Program
  const programIds = (await client.mutation(api.programs.seedPrograms, { programs: [PROGRAM] })) as Record<string, Id<"programs">>;
  const programId = programIds[PROGRAM.slug];
  console.log(`✅ Program Created: ${programId}`);

  // 4. Seed Derived Plan
  const planId = await client.mutation(api.programs.seedDerivedPlan, {
    programId,
    version: "v1.0.0",
    author: "Coach Greg / Hayl Adaptation",
    variant: {
      difficulty: "amateur",
      splitFreq: "1-day",
      durationMinutes: 60,
      tags: ["full-body", "hypertrophy", "casual"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 60-minute full-body hypertrophy session. Perfect for busy schedules or those who can only train 1-2 times per week. Focus on controlled reps and time under tension.",
    overview_markdown: `
# Casual Template I - Full Body Hypertrophy

**Duration**: 60 Minutes  
**Split**: 1-Day (Full Body)  
**Focus**: Hypertrophy (Muscle Building)  
**Level**: Casual / Beginner-Friendly

## The Philosophy
This template is designed for those who want to train once or twice per week and still make progress. 
Every session is a full-body workout hitting all major muscle groups with alternating sets to maximize efficiency.

## Key Principles
1. **Control the weight** - Focus on slow eccentrics (3-4 seconds down)
2. **Time Under Tension (TUT)** - Each set should take 30-40 seconds
3. **Pause on Bench** - Always pause at the bottom to avoid injury
4. **Progressive Overload** - If you hit the top of the rep range, increase weight next session

## Equipment Needed
- Barbell + Plates
- Dumbbells
- Cable Machine
- Lat Pull-down / Pull-up Station
- Leg Press or Squat Rack
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
## Why This Works

**Frequency over Volume for Beginners**  
Training muscles 1-2x per week with full-body sessions is optimal for those new to lifting or with limited time.

**Alternating Sets = Efficiency**  
By alternating between muscle groups (squat/lats, bench/rows), you can rest one while training the other, cutting workout time in half.

**Intensity Ramping**  
Each exercise starts "Easy/Light" and progresses to "Hard/Heavy". This warms you up properly and saves the hardest sets for when you're primed.
    `,
    source_refs: [
      { docId: "HTLT_Greg.pdf", page: 68, note: "Casual Template I - 1-Day Split, 60 min, Hypertrophy" }
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
    changelog: "v1.0.0: Initial digitization from HTLT_Greg.pdf pages 68-70",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
