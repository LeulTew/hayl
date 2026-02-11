/**
 * Seed Script: HAYL Minimalist I
 * Author: Leul Tewodros Agonafer
 * Slug: minimalist-4day-45min-dumbbell
 *
 * Structure:
 * - 4-Day Upper/Lower Split | 45 Minutes | Dumbbell-Only
 * - Day 1: Upper Push + Pull
 * - Day 2: Lower Quads + Glutes
 * - Day 3: Upper Push + Pull (Variation)
 * - Day 4: Lower Hamstrings + Posterior Chain
 *
 * Design Philosophy:
 * - Zero gym required — dumbbells + bench + floor
 * - Upper/Lower split for optimal frequency (2x/muscle/week)
 * - Progressive overload via rep ranges + tempo manipulation
 * - Evidence-based: Krieger (2010) multi-set superiority for hypertrophy
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Id } from "../convex/_generated/dataModel.js";

const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("❌ CONVEX_URL is not set.");
  process.exit(1);
}
const client = new ConvexHttpClient(convexUrl);

/**
 * Dumbbell-only exercises for home/minimal equipment training.
 * All exercises require only dumbbells and optionally a bench.
 */
const EXERCISES = [
  { name: "Dumbbell Floor Press", muscleGroup: "Chest", instructions: "Lie on floor. Press dumbbells up. Floor limits ROM for shoulder safety. Pause briefly at bottom (arms touch floor)." },
  { name: "Dumbbell Incline Press", muscleGroup: "Chest", instructions: "Set bench to 30-45°. Press dumbbells from chest to lockout. Control the descent. Focus on upper chest stretch at bottom." },
  { name: "Single-Arm Dumbbell Row", muscleGroup: "Back", instructions: "One hand/knee on bench. Row dumbbell to hip with elbow tracking close to body. Squeeze lat at top. 2s negative." },
  { name: "Dumbbell Pullover", muscleGroup: "Back", instructions: "Lie across bench. Lower dumbbell behind head with slight elbow bend until deep stretch. Pull back to start using lats, not arms." },
  { name: "Dumbbell Lateral Raise", muscleGroup: "Shoulders", instructions: "Slight bend in elbows. Raise to shoulder height with pinky leading. Control descent for 3 seconds. Don't swing." },
  { name: "Dumbbell Bulgarian Split Squat", muscleGroup: "Legs", instructions: "Rear foot on bench/chair. Lower until front thigh is parallel. Keep torso upright. Drive through front heel." },
  { name: "Dumbbell Step-Up", muscleGroup: "Legs", instructions: "Step onto bench/box holding dumbbells. Drive through the working leg — don't push off the back foot. Control the descent." },
  { name: "Dumbbell Stiff-Leg Deadlift", muscleGroup: "Hamstrings", instructions: "Stand on one leg or both. Hinge at hips, lower dumbbells along shins. Feel deep hamstring stretch. Squeeze glutes at top." },
  { name: "Dumbbell Hip Thrust", muscleGroup: "Glutes", instructions: "Upper back on bench. Place dumbbell on hips. Drive hips up and squeeze glutes at top for 2s. Lower with control." },
  { name: "Dumbbell Hammer Curl", muscleGroup: "Biceps", instructions: "Neutral grip (palms facing each other). Curl to shoulder. Squeeze brachialis at top. Control negative for 3 seconds." },
  { name: "Dumbbell Overhead Tricep Extension", muscleGroup: "Triceps", instructions: "Hold one dumbbell overhead with both hands. Lower behind head until deep stretch. Extend fully. Keep elbows tight." },
  { name: "Dumbbell Glute Bridge", muscleGroup: "Glutes", instructions: "Lie on floor. Place dumbbell on hips. Drive hips up, squeeze glutes at peak for 2 seconds. Lower with control." },
];

const PROGRAM = {
  slug: "minimalist-4day-45min-dumbbell",
  title: "HAYL Minimalist I",
  canonicalVersion: "v1.0",
  difficulty: "beginner" as const,
  splitType: "4-day" as const,
  isPremium: false,
  published: true,
};

/**
 * Seeds HAYL Minimalist I — a 4-day dumbbell-only program.
 * Designed for home gym athletes with minimal equipment.
 */
async function main() {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ ADMIN_SECRET is not set in environment.");
    process.exit(1);
  }

  console.log("🌱 Seeding HAYL Minimalist I (4-Day, 45min, Dumbbell-Only)...");

  // 1. Seed Exercises
  await client.mutation(api.exercises.seedExercises, { exercises: EXERCISES, adminSecret });
  console.log("✅ Exercises seeded.");

  // 2. Fetch Exercise IDs
  const exercises = await client.query(api.exercises.listAll);
  const exMap = new Map(
    exercises.map((e) => [e.name, e._id] as const)
  );

  /**
   * Helper to get exercise ID with debugging support.
   * Throws with similar name suggestions if exercise is not found.
   */
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

  // 3. Seed Program
  const programIds = await client.mutation(api.programs.seedPrograms, { programs: [PROGRAM], adminSecret });
  const programId = programIds[PROGRAM.slug];
  console.log(`✅ Program Created: ${programId}`);

  // 4. Seed Derived Plan
  const planId = await client.mutation(api.programs.seedDerivedPlan, {
    programId, adminSecret,
    version: "v1.0.0",
    author: "HAYL Performance Team",
    variant: {
      difficulty: "amateur",
      splitFreq: "4-day",
      durationMinutes: 45,
      tags: ["upper-lower", "dumbbell-only", "home-gym", "minimalist", "hypertrophy"],
      equipment_needed: ["dumbbells"],
    },
    description: "A 4-day Upper/Lower split using only dumbbells. Zero gym required. 45-minute sessions designed for home training with progressive overload through tempo and rep manipulation.",
    overview_markdown: `
# HAYL Minimalist I — Dumbbell-Only Upper/Lower

**Duration**: 45 min | **Split**: 4-Day Upper/Lower | **Focus**: Hypertrophy | **Level**: All Levels

## Why This Program

No gym? No problem. **HAYL Minimalist** proves that a pair of adjustable dumbbells is all you need to build a serious physique. No machines, no cables, no excuses.

This 4-day Upper/Lower split gives each muscle group **two training exposures per week** — the sweet spot for hypertrophy according to current research. Each session clocks in at 45 minutes.

## Core Principles
- **Dumbbell-Only** — every exercise uses dumbbells (and optionally a bench)
- **Upper/Lower Split** — 2x frequency per muscle group per week
- **Tempo Manipulation** — 3s negatives for time under tension when load plateaus
- **Unilateral Work** — split squats and single-arm rows fix imbalances

## Coach's Notes
> Adjustable dumbbells are non-negotiable for this program. You need the ability to progress load. If you're stuck with fixed weights, use tempo manipulation (slower negatives, pauses, 1.5 reps) to increase difficulty. A flat bench or sturdy chair opens up incline pressing and hip thrusts.

## Equipment
Adjustable Dumbbells (required), Flat Bench or Sturdy Chair (recommended)

## Who Is This For?
- Home gym athletes
- Travelers who train in hotel gyms
- Anyone avoiding crowded commercial gyms
- Budget-conscious lifters who want results without memberships
    `,
    schedule_markdown: `
## Weekly Schedule

| Day | Focus | Duration |
| :--- | :--- | :--- |
| **Monday** | Upper A (Push-dominant) | 45 min |
| **Tuesday** | Lower A (Quad-dominant) | 45 min |
| **Wednesday** | Rest or Active Recovery | — |
| **Thursday** | Upper B (Pull-dominant) | 45 min |
| **Friday** | Lower B (Hip-dominant) | 45 min |
| **Sat/Sun** | Rest | — |

## Session Structure (Each Day)
- **Warm-up**: 1 light set per exercise (5 min)
- **Main Work**: 3-4 working sets per exercise (30 min)
- **Finisher**: Isolation pump work (10 min)
    `,
    philosophy_markdown: `
## The Science Behind HAYL Minimalist I

**2x Frequency Per Muscle**
Meta-analysis by Schoenfeld et al. (2016) confirms that training each muscle group twice per week is superior to once per week for hypertrophy when volume is equated. The Upper/Lower split achieves this naturally.

**Dumbbell Superiority for Stabilization**
Free weights recruit more stabilizer muscles than machines (Saeterbakken & Fimland, 2013). Dumbbells specifically force unilateral balance, which corrects left-right imbalances over time.

**Tempo as a Progression Tool**
When load cannot increase (limited dumbbell range), extending the eccentric phase to 3-4 seconds increases time under tension — a primary driver of hypertrophy (Burd et al., 2012). This makes fixed dumbbells viable for months of progress.

**Unilateral Training**
Split squats and single-arm rows address the bilateral deficit — limbs working independently can produce more total force than working together (Howard & Enoka, 1991).
    `,
    source_refs: [
      { docId: "hayl-internal", note: "HAYL Minimalist I — Original Design. Author: Leul Tewodros Agonafer" }
    ],
    requires_human_review: false,
    days: [
      // ===== DAY 1: UPPER A (Push-Dominant) =====
      {
        title: "Day 1 - Upper A (Push-Dominant)",
        dayIndex: 0,
        phases: [
          {
            name: "warmup" as const,
            items: [
              { exerciseId: getEx("Dumbbell Incline Press"), sets: 1, reps: "12", restSeconds: 30, note: "Light warm-up. Feel the stretch at bottom." },
              { exerciseId: getEx("Single-Arm Dumbbell Row"), sets: 1, reps: "10/side", restSeconds: 30, note: "Light warm-up. Focus on lat engagement." },
            ]
          },
          {
            name: "main" as const,
            items: [
              // Primary: Incline Press
              { exerciseId: getEx("Dumbbell Incline Press"), sets: 3, reps: "8-10", restSeconds: 90, rpe: 8, note: "Main Press. 3s negative. Full stretch at bottom." },
              // Primary: Row
              { exerciseId: getEx("Single-Arm Dumbbell Row"), sets: 3, reps: "10-12/side", restSeconds: 90, rpe: 8, note: "Main Pull. Squeeze lat for 1s at top." },
              // Secondary: Floor Press
              { exerciseId: getEx("Dumbbell Floor Press"), sets: 3, reps: "10-12", restSeconds: 75, rpe: 8, note: "Floor limits ROM — focus on lockout strength." },
              // Secondary: Overhead Press
              { exerciseId: getEx("Dumbbell Overhead Press"), sets: 3, reps: "8-10", restSeconds: 75, rpe: 8, note: "Strict press. No leg drive." },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Dumbbell Lateral Raise"), sets: 3, reps: "15-20", restSeconds: 45, rpe: 7, note: "Light weight, high reps. Chase the burn." },
              { exerciseId: getEx("Dumbbell Hammer Curl"), sets: 2, reps: "12-15", restSeconds: 45, rpe: 7, note: "Controlled 3s negative. No swinging." },
              { exerciseId: getEx("Dumbbell Overhead Tricep Extension"), sets: 2, reps: "12-15", restSeconds: 45, rpe: 7, note: "Deep stretch at bottom. Full lockout at top." },
            ]
          }
        ]
      },
      // ===== DAY 2: LOWER A (Quad-Dominant) =====
      {
        title: "Day 2 - Lower A (Quad-Dominant)",
        dayIndex: 1,
        phases: [
          {
            name: "warmup" as const,
            items: [
              { exerciseId: getEx("Goblet Squat"), sets: 1, reps: "12", restSeconds: 30, note: "Light warm-up. Deep squat, elbows touch knees." },
            ]
          },
          {
            name: "main" as const,
            items: [
              // Primary: Bulgarian Split Squat
              { exerciseId: getEx("Dumbbell Bulgarian Split Squat"), sets: 3, reps: "10-12/side", restSeconds: 90, rpe: 8, note: "King of dumbbell leg exercises. Full depth." },
              // Primary: Goblet Squat
              { exerciseId: getEx("Goblet Squat"), sets: 3, reps: "12-15", restSeconds: 75, rpe: 8, note: "High reps for quads. 2s pause at bottom." },
              // Secondary: Step-Up
              { exerciseId: getEx("Dumbbell Step-Up"), sets: 3, reps: "10/side", restSeconds: 75, rpe: 7, note: "Drive through the working leg only. No push-off from back foot." },
              // Secondary: Hip Thrust
              { exerciseId: getEx("Dumbbell Hip Thrust"), sets: 3, reps: "12-15", restSeconds: 60, rpe: 8, note: "Squeeze glutes at top for 2 full seconds." },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Dumbbell Stiff-Leg Deadlift"), sets: 2, reps: "12-15", restSeconds: 60, rpe: 7, note: "Light RDL for hamstring balance. Not the focus today." },
              { exerciseId: getEx("Dumbbell Glute Bridge"), sets: 2, reps: "15-20", restSeconds: 45, rpe: 7, note: "High-rep pump finisher for glutes." },
            ]
          }
        ]
      },
      // ===== DAY 3: UPPER B (Pull-Dominant) =====
      {
        title: "Day 3 - Upper B (Pull-Dominant)",
        dayIndex: 2,
        phases: [
          {
            name: "warmup" as const,
            items: [
              { exerciseId: getEx("Single-Arm Dumbbell Row"), sets: 1, reps: "10/side", restSeconds: 30, note: "Light warm-up. Prime the lats." },
            ]
          },
          {
            name: "main" as const,
            items: [
              // Primary: Row (heavier than Day 1)
              { exerciseId: getEx("Single-Arm Dumbbell Row"), sets: 4, reps: "8-10/side", restSeconds: 90, rpe: 9, note: "Primary mover today. Heavier than Day 1. Pull to hip." },
              // Primary: Pullover
              { exerciseId: getEx("Dumbbell Pullover"), sets: 3, reps: "10-12", restSeconds: 75, rpe: 8, note: "Stretch the lats at the bottom. Use lats to pull, not arms." },
              // Secondary: Floor Press (lighter, more reps)
              { exerciseId: getEx("Dumbbell Floor Press"), sets: 3, reps: "12-15", restSeconds: 75, rpe: 7, note: "Higher reps than Day 1. Focus on chest squeeze at top." },
              // Secondary: Overhead Press
              { exerciseId: getEx("Dumbbell Overhead Press"), sets: 3, reps: "10-12", restSeconds: 75, rpe: 7, note: "Lighter than Day 1. More reps for shoulder volume." },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Dumbbell Lateral Raise"), sets: 3, reps: "15-20", restSeconds: 45, rpe: 7, note: "Same as Day 1. Consistent side delt stimulus." },
              { exerciseId: getEx("Dumbbell Hammer Curl"), sets: 3, reps: "10-12", restSeconds: 45, rpe: 8, note: "Slightly heavier than Day 1. Fewer reps." },
              { exerciseId: getEx("Dumbbell Overhead Tricep Extension"), sets: 3, reps: "10-12", restSeconds: 45, rpe: 8, note: "Slightly heavier than Day 1." },
            ]
          }
        ]
      },
      // ===== DAY 4: LOWER B (Hip-Dominant) =====
      {
        title: "Day 4 - Lower B (Hip-Dominant)",
        dayIndex: 3,
        phases: [
          {
            name: "warmup" as const,
            items: [
              { exerciseId: getEx("Dumbbell Glute Bridge"), sets: 1, reps: "15", restSeconds: 30, note: "Activate glutes. 2s squeeze at top." },
            ]
          },
          {
            name: "main" as const,
            items: [
              // Primary: Stiff-Leg Deadlift (main focus today)
              { exerciseId: getEx("Dumbbell Stiff-Leg Deadlift"), sets: 4, reps: "8-10", restSeconds: 90, rpe: 8, note: "Primary mover. Deep hamstring stretch. Slow eccentric." },
              // Primary: Hip Thrust (heavier than Day 2)
              { exerciseId: getEx("Dumbbell Hip Thrust"), sets: 3, reps: "10-12", restSeconds: 75, rpe: 9, note: "Heavier than Day 2. Squeeze 2s at top." },
              // Secondary: Reverse Lunge
              { exerciseId: getEx("Dumbbell Reverse Lunge"), sets: 3, reps: "10/side", restSeconds: 75, rpe: 8, note: "Drive through front heel. Control the step-back." },
              // Secondary: Bulgarian Split Squat (lighter volume)
              { exerciseId: getEx("Dumbbell Bulgarian Split Squat"), sets: 2, reps: "12/side", restSeconds: 75, rpe: 7, note: "Lighter than Day 2. More reps, less load. Quad balance." },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Goblet Squat"), sets: 2, reps: "15-20", restSeconds: 45, rpe: 7, note: "High-rep quad finisher. Slow tempo." },
              { exerciseId: getEx("Dumbbell Glute Bridge"), sets: 2, reps: "20", restSeconds: 45, rpe: 7, note: "Final glute pump. Make every rep count." },
            ]
          }
        ]
      },
    ],
    changelog: "v1.0.0: Initial HAYL Minimalist release. Original design by HAYL Performance Team.",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
