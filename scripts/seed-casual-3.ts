/**
 * Seed Script: HAYL Essentials III
 * Author: Leul Tewodros Agonafer
 * Slug: casual-1day-90min-hypertrophy
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
  slug: "casual-1day-90min-hypertrophy",
  title: "HAYL Essentials III",
  canonicalVersion: "v1.0",
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

  console.log("🌱 Seeding HAYL Essentials III (1-Day, 90min, Hypertrophy)...");

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
    author: "HAYL Performance Team",
    variant: {
      difficulty: "amateur",
      splitFreq: "1-day",
      durationMinutes: 90,
      tags: ["full-body", "hypertrophy", "high-volume", "essentials"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines"],
    },
    description: "A 90-minute high-volume full-body hypertrophy session. More sets, more accessories, more growth stimulus — for athletes who want maximum results from 1-2 weekly sessions.",
    overview_markdown: `
# HAYL Essentials III — High Volume Full Body

**Duration**: 90 min | **Split**: Full Body | **Focus**: Hypertrophy | **Level**: Essentials+

## Why This Program
The extended version of Essentials I. With 90 minutes, you unlock more volume on compound lifts and a comprehensive 3-round accessory circuit that leaves no muscle group untrained.

## Core Principles
- **Time Under Tension** — slow eccentrics (30-40s per set) for maximum hypertrophy
- **Alternating Supersets** — rest one group while training another
- **Ascending Intensity** — ramp from light to all-out across each exercise
- **Complete Coverage** — the 3-round circuit ensures total-body stimulation

## Coach's Notes
> This is our highest-volume Essentials template. If you finish all 3 accessory rounds with energy to spare, increase the weight — you're underloading.

## Equipment
Barbell, Dumbbells, Cable Machine, Lat Pull-down, Leg Press, Leg Extension, Leg Curl
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
## The Science Behind HAYL Essentials III

**Volume Drives Growth**
Total training volume (sets × reps) is a primary driver of hypertrophy. 90 minutes provides the runway for the high-volume stimulus that accelerates muscle adaptation, even at 1-2x/week frequency.

**TUT Protects Joints**
Slow eccentrics achieve high muscle stimulation without requiring extreme loads that stress joints — critical for sustainable, long-term progress.

**The Final Round**
If you still have energy after Round 2 of the accessory circuit, Round 3 is where real adaptation begins. Push to the limit here.
    `,
    source_refs: [
      { docId: "hayl-internal", note: "HAYL Essentials III — 1-Day, 90 min, Hypertrophy. Author: Leul Tewodros Agonafer" }
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
              { exerciseId: getEx("Squat of Choice"), sets: 1, reps: "15", restSeconds: 60, note: "Light - Easy. Slow eccentric/TUT focus." },
            ]
          },
          {
            name: "main" as const,
            items: [
              { exerciseId: getEx("Squat of Choice"), sets: 1, reps: "15", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "15", restSeconds: 90, rpe: 5, note: "Light - Easy" },
              { exerciseId: getEx("Squat of Choice"), sets: 1, reps: "12-15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Pull-up / Lat Pull-down"), sets: 1, reps: "12-15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Squat of Choice"), sets: 1, reps: "11-15", restSeconds: 150, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Chin-up / Supinated Lat Pull-down"), sets: 1, reps: "11-15", restSeconds: 150, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Squat of Choice"), sets: 1, reps: "10-15", restSeconds: 150, rpe: 9, note: "Same weight - Hard. Push the limit." },
              { exerciseId: getEx("Chin-up / Supinated Lat Pull-down"), sets: 1, reps: "10-15", restSeconds: 150, rpe: 9, note: "Same weight - Hard" },

              // PART 2: Deadlift/Row & Bench/Chest
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "15", restSeconds: 90, rpe: 5, note: "Light - Easy. No belt." },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "15", restSeconds: 90, rpe: 5, note: "Light - Easy. PAUSE on all sets." },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "15", restSeconds: 120, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Deadlift of Choice"), sets: 1, reps: "12-15", restSeconds: 120, rpe: 8, note: "Heavy - Hard. Belt optional." },
              { exerciseId: getEx("Paused Bench Press"), sets: 1, reps: "12-15", restSeconds: 120, rpe: 8, note: "Heavy - Hard" },
              
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "15", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "15", restSeconds: 90, rpe: 7, note: "Moderate - Moderate" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "12", restSeconds: 90, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "12", restSeconds: 90, rpe: 8, note: "Heavy - Hard" },
              { exerciseId: getEx("Row of Choice"), sets: 1, reps: "10-12", restSeconds: 120, rpe: 9, note: "Same weight - Harder" },
              { exerciseId: getEx("Chest Machine of Choice"), sets: 1, reps: "10-12", restSeconds: 120, rpe: 9, note: "Same weight - Harder" },
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
    changelog: "v1.0.0: Initial release. v2.0.0: HAYL Essentials rebrand.",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
