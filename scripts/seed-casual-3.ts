/**
 * Seed Script: Casual Template III
 * Source: HTLT_Greg.pdf (Pages 75-77)
 * Naming: casual-1day-90min-hypertrophy
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Doc, Id } from "../convex/_generated/dataModel.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

const PROGRAM = {
  slug: "casual-1day-90min-hypertrophy",
  title: "Casual Template III",
  canonicalVersion: "v1.0",
  difficulty: "beginner" as const,
  splitType: "2-day" as const, // Closest match for 1-day full body
  isPremium: false,
  published: true,
};

async function main() {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ ADMIN_SECRET is not set in environment.");
    process.exit(1);
  }

  console.log("🌱 Seeding Casual Template III (1-Day, 90min, Hypertrophy)...");

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
  const programIds = (await client.mutation(api.programs.seedPrograms, { programs: [PROGRAM], adminSecret: adminSecret })) as Record<string, Id<"programs">>;
  const programId = programIds[PROGRAM.slug];
  console.log(`✅ Program Created: ${programId}`);

  // Seed Derived Plan
  const planId = await client.mutation(api.programs.seedDerivedPlan, {
    programId, adminSecret: adminSecret,
    version: "v1.0.0",
    author: "Coach Greg / Hayl Adaptation",
    variant: {
      difficulty: "amateur",
      splitFreq: "1-day",
      durationMinutes: 90,
      tags: ["full-body", "hypertrophy", "high-volume", "casual"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 90-minute full-body hypertrophy session. Higher volume and more accessories than the 60-minute version. Perfect for those who can train intensely once or twice a week and want maximum muscle stimulation.",
    overview_markdown: `
# Casual Template III - High Volume Full Body

**Duration**: 90 Minutes  
**Split**: 1-Day (Full Body)  
**Focus**: Hypertrophy (Muscle Building)  
**Level**: Casual / Amateur

## The Philosophy
This is the high-volume version of the casual 1-day split. With 90 minutes available, we can afford more sets on the main compound lifts and a much more extensive accessory circuit to hit every muscle group from multiple angles.

## Key Principles
1. **Time Under Tension (TUT)** - Focus on slow eccentrics (30-40s per set)
2. **Alternating Efficiency** - Pausing muscle groups while working others
3. **Ascending Intensity** - Starting light and ramping to hard/all-out sets
4. **Complete Coverage** - No muscle group left behind in the 3-round circuit

## Equipment Needed
- Barbell + Plates
- Dumbbells
- Cable Machine
- Lat Pull-down / Pull-up Station
- Leg Press / Squat Machine
- Leg Extension / Leg Curl Machines
    `,
    schedule_markdown: `
## Daily Structure

### PART 1: Squats & Lats Alternating Sets (20-25 min)
- Ramping from 15 reps to 10-15 reps hard sets
- 4 alternating cycles

### PART 2: Deadlift/Row & Bench/Chest Alternating Sets (30 min)
- Ramping sets for core strength and chest/back volume
- 6 alternating cycles

### PART 3: High Volume Accessories Circuit (30-35 min)
- 3 intensive rounds
- Shoulders → Biceps → Triceps → Quads → Hamstrings → Calves
    `,
    philosophy_markdown: `
## The Value of Volume

**Volume as a Driver of Hypertrophy**  
While intensity (weight) is important, total volume (sets x reps) is one of the primary drivers of muscle growth. 90 minutes allows for the volume necessary to see significant changes even on a low-frequency split.

**TUT for Joint Safety**  
By focusing on Time Under Tension and slow negatives, we can achieve high muscle stimulation without needing extreme weights that might stress joints, making this perfect for casual trainees.

**The "Beast" Rounds**  
The accessory circuit is where the real work happens. If you still have energy after 2 rounds, the 3rd round is where you push to the limit to signal for adaptation.
    `,
    source_refs: [
      { docId: "HTLT_Greg.pdf", page: 76, note: "Casual Template III - 1-Day Split, 90 min, Hypertrophy" }
    ],
    requires_human_review: false,
    days: [
      {
        title: "Day 1 - High Volume Full Body",
        dayIndex: 0,
        phases: [
          // PART 1: Squats & Lats
          {
            name: "warmup" as const,
            items: [
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "15", restSeconds: 60, note: "Light - Easy. Slow eccentric/TUT focus." },
            ]
          },
          {
            name: "main" as const,
            items: [
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "15", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: exMap.get("Pull-up / Lat Pull-down")!, sets: 1, reps: "15", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "12-15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Pull-up / Lat Pull-down")!, sets: 1, reps: "12-15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "11-15", restSeconds: 150, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: exMap.get("Chin-up / Supinated Lat Pull-down")!, sets: 1, reps: "11-15", restSeconds: 150, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: exMap.get("Squat of Choice")!, sets: 1, reps: "10-15", restSeconds: 150, rpe: 9, note: "Same weight - Hard. Push the limit." },
              { exerciseId: exMap.get("Chin-up / Supinated Lat Pull-down")!, sets: 1, reps: "10-15", restSeconds: 150, rpe: 9, note: "Same weight - Hard" },

              // PART 2: Deadlift/Row & Bench/Chest
              { exerciseId: exMap.get("Deadlift of Choice")!, sets: 1, reps: "15", restSeconds: 90, rpe: 5, note: "Light - Easy. No belt." },
              { exerciseId: exMap.get("Paused Bench Press")!, sets: 1, reps: "15", restSeconds: 90, rpe: 5, note: "Light - Easy. PAUSE on all sets." },
              { exerciseId: exMap.get("Deadlift of Choice")!, sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Paused Bench Press")!, sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Deadlift of Choice")!, sets: 1, reps: "12-15", restSeconds: 120, rpe: 8, note: "Heavy - Hard. Belt optional." },
              { exerciseId: exMap.get("Paused Bench Press")!, sets: 1, reps: "12-15", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              
              { exerciseId: exMap.get("Row of Choice")!, sets: 1, reps: "15", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Chest Machine of Choice")!, sets: 1, reps: "15", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: exMap.get("Row of Choice")!, sets: 1, reps: "12", restSeconds: 90, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: exMap.get("Chest Machine of Choice")!, sets: 1, reps: "12", restSeconds: 90, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: exMap.get("Row of Choice")!, sets: 1, reps: "10-12", restSeconds: 120, rpe: 9, note: "Same weight - Harder" },
              { exerciseId: exMap.get("Chest Machine of Choice")!, sets: 1, reps: "10-12", restSeconds: 120, rpe: 9, note: "Same weight - Harder" },
            ]
          },
          // PART 3: Accessories Circuit (3 Rounds)
          {
            name: "accessory" as const,
            items: [
              // Round 1
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Seated Incline Dumbbell Curls"), sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Triceps Press-Down / Skullcrushers"), sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Leg Press"), sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Leg Curl (Seated or Lying)"), sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "20", restSeconds: 30, rpe: 6, note: "Round 1 - Moderate" },
              // Round 2
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Seated Incline Dumbbell Curls"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Triceps Press-Down / Skullcrushers"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "12-15", restSeconds: 45, rpe: 8, note: "Round 2 - Heavy/Hard" },
              // Round 3
              { exerciseId: getEx("Shoulder Press of Choice"), sets: 1, reps: "10-15", restSeconds: 60, rpe: 9, note: "Round 3 - Same weight/Harder" },
              { exerciseId: getEx("Side Lateral Raises"), sets: 1, reps: "10-15", restSeconds: 60, rpe: 9, note: "Round 3 - Same weight/Harder" },
              { exerciseId: getEx("Seated Incline Dumbbell Curls"), sets: 1, reps: "10-15", restSeconds: 60, rpe: 9, note: "Round 3 - Same weight/Harder" },
              { exerciseId: getEx("Triceps Press-Down / Skullcrushers"), sets: 1, reps: "10-15", restSeconds: 60, rpe: 9, note: "Round 3 - Same weight/Harder" },
              { exerciseId: getEx("Standing / Seated Calf Raise"), sets: 1, reps: "10-15", restSeconds: 60, rpe: 9, note: "Round 3 - Same weight/Harder" },
            ]
          }
        ]
      }
    ],
    changelog: "v1.0.0: Initial digitization from HTLT_Greg.pdf pages 75-77",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
