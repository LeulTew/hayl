/**
 * Seed Script: HAYL Power-Builder I
 * Author: Leul Tewodros Agonafer
 * Slug: powerbuilder-4day-60min-hybrid
 *
 * Structure:
 * - 4-Day Upper/Lower Split | 60 Minutes | PowerBuilding
 * - Day 1: Upper Strength (Heavy Compounds)
 * - Day 2: Lower Strength (Squat + Deadlift Focus)
 * - Day 3: Upper Hypertrophy (Volume + Pump)
 * - Day 4: Lower Hypertrophy (Volume + Accessory)
 *
 * Design Philosophy:
 * - STRENGTH days use low reps, high intensity, long rest
 * - HYPERTROPHY days use moderate reps, moderate intensity, shorter rest
 * - Combines the best of Powerlifting and Bodybuilding
 * - Inspired by PHUL (Power Hypertrophy Upper Lower) methodology
 * - Evidence-based: Ogasawara et al. (2013) periodized strength + hypertrophy
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

/**
 * Exercises for PowerBuilding — a mix of barbell compounds and hypertrophy accessories.
 * Strength days lean on barbell. Hypertrophy days lean on dumbbells/cables.
 */
const EXERCISES = [
  { name: "Barbell Back Squat", muscleGroup: "Legs", instructions: "Bar on upper traps. Break at hips and knees simultaneously. Hit parallel or below. Drive through midfoot. Brace core hard." },
  { name: "Conventional Deadlift", muscleGroup: "Back", instructions: "Bar over midfoot. Grip outside knees. Flatten back, brace core, push floor away. Lock out with glutes — don't hyperextend." },
  { name: "Barbell Flat Bench Press", muscleGroup: "Chest", instructions: "Arch upper back, retract scapulae. Lower bar to mid-chest with control. Pause briefly. Press explosively to lockout." },
  { name: "Barbell Overhead Press", muscleGroup: "Shoulders", instructions: "Strict press from front rack position. Bar path should clear the head — lean torso slightly back, then forward under the bar at lockout." },
  { name: "Barbell Pendlay Row", muscleGroup: "Back", instructions: "From dead stop on floor each rep. Torso parallel to ground. Explosive pull to belly. Lower with control. Reset each rep." },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest", instructions: "Bench at 30°. Press dumbbells from chest to lockout. Focus on upper chest stretch. 3s negative for hypertrophy days." },
  { name: "Leg Press (PowerBuilder)", muscleGroup: "Legs", instructions: "Feet high and wide for glute/hamstring emphasis. Feet low and narrow for quads. Full ROM — don't short it." },
  { name: "Cable Lateral Raise", muscleGroup: "Shoulders", instructions: "Behind-body cable path for constant tension. Raise to shoulder height. Control descent for 3 seconds." },
  { name: "Cable Chest Fly", muscleGroup: "Chest", instructions: "Cables set at mid-height. Step forward for stretch. Bring handles together with slight elbow bend. Squeeze 1s at peak." },
  { name: "Cable Row (Seated)", muscleGroup: "Back", instructions: "V-grip or wide grip. Pull to abdomen. Squeeze shoulder blades for 1s. Control the return — don't let the stack slam." },
  { name: "Barbell Curl", muscleGroup: "Biceps", instructions: "Shoulder-width grip. Curl to chin without swinging. Control the negative for 3 seconds. Keep elbows pinned." },
  { name: "Weighted Dip", muscleGroup: "Triceps", instructions: "Add weight via belt or dumbbell between feet. Lean forward for chest, upright for triceps. Full ROM." },
  { name: "Leg Curl Machine", muscleGroup: "Hamstrings", instructions: "Seated or lying. Full contraction at peak. 3s eccentric. Don't let the weight stack slam." },
  { name: "Walking Dumbbell Lunge", muscleGroup: "Legs", instructions: "Step forward into lunge. Front knee tracks over toe. Drive through front heel. Alternate legs. Keep torso upright." },
];

const PROGRAM = {
  slug: "powerbuilder-4day-60min-hybrid",
  title: "HAYL Power-Builder I",
  canonicalVersion: "v1.0",
  difficulty: "intermediate" as const,
  splitType: "upper-lower" as const,
  isPremium: false,
  published: true,
};

/**
 * Seeds HAYL Power-Builder I — a 4-day Upper/Lower program
 * blending strength and hypertrophy training.
 */
async function main() {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ ADMIN_SECRET is not set in environment.");
    process.exit(1);
  }

  console.log("🌱 Seeding HAYL Power-Builder I (4-Day, 60min, PowerBuilding)...");

  // 1. Seed Exercises
  await client.mutation(api.exercises.seedExercises, { exercises: EXERCISES, adminSecret });
  console.log("✅ Exercises seeded.");

  // 2. Fetch Exercise IDs
  const exercises = (await client.query(api.exercises.listAll)) as Doc<"exercises">[];
  const exMap = new Map<string, Id<"exercises">>(
    exercises.map((e) => [e.name, e._id])
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
  const programIds = (await client.mutation(api.programs.seedPrograms, { programs: [PROGRAM], adminSecret })) as Record<string, Id<"programs">>;
  const programId = programIds[PROGRAM.slug];
  console.log(`✅ Program Created: ${programId}`);

  // 4. Seed Derived Plan
  const planId = await client.mutation(api.programs.seedDerivedPlan, {
    programId, adminSecret,
    version: "v1.0.0",
    author: "HAYL Performance Team",
    variant: {
      difficulty: "intermediate",
      splitFreq: "4-day",
      durationMinutes: 60,
      tags: ["upper-lower", "powerbuilding", "strength", "hypertrophy", "barbell"],
      equipment_needed: ["barbell", "dumbbells", "cables", "machines", "dip-station"],
    },
    description: "A 4-day Upper/Lower PowerBuilding split. Days 1 & 2 focus on heavy barbell compounds for strength. Days 3 & 4 focus on moderate-weight volume for hypertrophy. The best of both worlds.",
    overview_markdown: `
# HAYL Power-Builder I — Strength Meets Aesthetics

**Duration**: 60 min | **Split**: 4-Day Upper/Lower | **Focus**: PowerBuilding | **Level**: Intermediate+

## Why This Program

You don't have to choose between being strong and looking good. **HAYL Power-Builder** merges the best of powerlifting and bodybuilding into one coherent system.

Two days per week, you lift **heavy** — low reps, long rest, barbell compounds. The other two days, you chase **volume** — moderate weight, higher reps, controlled tempos. The result: strength that shows AND performs.

## Core Principles
- **Dual Periodization** — Strength days (3-6 reps) and Hypertrophy days (8-15 reps)
- **Big 3 Foundation** — Squat, Bench, Deadlift are the backbone
- **Intelligent Accessories** — Cable and dumbbell work targets weak points
- **Frequency** — Every muscle hit 2x/week across the 4 sessions

## Coach's Notes
> This program works best for lifters with 6+ months of training experience who know their way around the Big 3. If your Squat, Bench, or Deadlift form is shaky, fix that first with HAYL Essentials. Once you're here, respect the heavy days — they build the foundation. The volume days are where the physique gets polished.

## Equipment
Full Gym: Barbell, Power Rack, Plates, Dumbbells, Cable Machine, Dip Station, Leg Press, Leg Curl Machine

## Who Is This For?
- Intermediate lifters who want both strength and aesthetics
- Former powerlifters transitioning to physique goals
- Bodybuilders who want to get actually strong
- Athletes who want to look as good as they perform
    `,
    schedule_markdown: `
## Weekly Schedule

| Day | Focus | Intensity | Duration |
| :--- | :--- | :--- | :--- |
| **Monday** | Upper Strength | Heavy (RPE 8-10) | 60 min |
| **Tuesday** | Lower Strength | Heavy (RPE 8-10) | 60 min |
| **Wednesday** | Rest | — | — |
| **Thursday** | Upper Hypertrophy | Moderate (RPE 7-8) | 60 min |
| **Friday** | Lower Hypertrophy | Moderate (RPE 7-8) | 60 min |
| **Sat/Sun** | Rest | — | — |

## Session Structure
- **Strength Days**: 2-3 heavy compounds → 2 moderate accessories
- **Hypertrophy Days**: 4-5 exercises at moderate weight with higher reps and shorter rest
    `,
    philosophy_markdown: `
## The Science Behind HAYL Power-Builder I

**Dual Periodization**
Daily undulating periodization (DUP) — alternating between strength and hypertrophy rep ranges — has been shown to produce superior results compared to linear periodization for both strength and muscle growth (Rhea et al., 2002).

**The Size-Strength Relationship**
A larger muscle has greater force potential. By combining hypertrophy training (which increases cross-sectional area) with strength training (which improves neural efficiency), you maximize both pathways to performance.

**Why Upper/Lower?**
The 4-day Upper/Lower split is the gold standard for intermediate lifters. It provides 2x/week frequency per muscle group, adequate recovery between sessions, and enough training days to accumulate meaningful volume (Wernbom et al., 2007).

**Compound First, Isolate Last**
Strength days prioritize heavy barbell compounds when neuromuscular fatigue is lowest. Hypertrophy days start with moderate compounds and progress to isolation work for targeted muscle growth. This structure respects the fatigue hierarchy.
    `,
    source_refs: [
      { docId: "hayl-internal", note: "HAYL Power-Builder I — Original Design. Author: Leul Tewodros Agonafer" }
    ],
    requires_human_review: false,
    days: [
      // ===== DAY 1: UPPER STRENGTH =====
      {
        title: "Day 1 - Upper Strength",
        dayIndex: 0,
        phases: [
          {
            name: "warmup" as const,
            items: [
              { exerciseId: getEx("Barbell Flat Bench Press"), sets: 2, reps: "10, 5", restSeconds: 60, note: "Warm-up: Bar only → 50% working weight. Prime the groove." },
            ]
          },
          {
            name: "main" as const,
            items: [
              // Primary: Bench Press — STRENGTH
              { exerciseId: getEx("Barbell Flat Bench Press"), sets: 4, reps: "4-6", restSeconds: 180, rpe: 9, note: "HEAVY. Full pause at chest. 3 min rest between sets." },
              // Primary: Barbell Row — STRENGTH
              { exerciseId: getEx("Barbell Pendlay Row"), sets: 4, reps: "4-6", restSeconds: 180, rpe: 9, note: "HEAVY. Dead stop each rep. Explosive pull." },
              // Secondary: OHP — Moderate-Heavy
              { exerciseId: getEx("Barbell Overhead Press"), sets: 3, reps: "6-8", restSeconds: 120, rpe: 8, note: "Strict press. No leg drive." },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Weighted Dip"), sets: 3, reps: "6-8", restSeconds: 90, rpe: 8, note: "Add weight. Lean forward for chest, upright for triceps." },
              { exerciseId: getEx("Barbell Curl"), sets: 2, reps: "8-10", restSeconds: 60, rpe: 7, note: "Controlled curls. No swinging." },
            ]
          }
        ]
      },
      // ===== DAY 2: LOWER STRENGTH =====
      {
        title: "Day 2 - Lower Strength",
        dayIndex: 1,
        phases: [
          {
            name: "warmup" as const,
            items: [
              { exerciseId: getEx("Barbell Back Squat"), sets: 2, reps: "10, 5", restSeconds: 60, note: "Warm-up: Bar only → 50% working weight. Work the depth." },
            ]
          },
          {
            name: "main" as const,
            items: [
              // Primary: Squat — STRENGTH
              { exerciseId: getEx("Barbell Back Squat"), sets: 4, reps: "4-6", restSeconds: 180, rpe: 9, note: "HEAVY. Below parallel or it doesn't count. 3 min rest." },
              // Primary: Deadlift — STRENGTH
              { exerciseId: getEx("Conventional Deadlift"), sets: 3, reps: "3-5", restSeconds: 180, rpe: 9, note: "HEAVY. Reset each rep. No touch-and-go." },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Leg Press (PowerBuilder)"), sets: 3, reps: "8-10", restSeconds: 90, rpe: 7, note: "Moderate weight. Full ROM. Quad or glute focus based on foot placement." },
              { exerciseId: getEx("Leg Curl Machine"), sets: 3, reps: "10-12", restSeconds: 60, rpe: 7, note: "Full contraction. 3s eccentric." },
            ]
          }
        ]
      },
      // ===== DAY 3: UPPER HYPERTROPHY =====
      {
        title: "Day 3 - Upper Hypertrophy",
        dayIndex: 2,
        phases: [
          {
            name: "warmup" as const,
            items: [
              { exerciseId: getEx("Incline Dumbbell Press"), sets: 1, reps: "12", restSeconds: 30, note: "Light warm-up. Feel the chest stretch." },
            ]
          },
          {
            name: "main" as const,
            items: [
              // Primary: Incline DB Press — VOLUME
              { exerciseId: getEx("Incline Dumbbell Press"), sets: 4, reps: "8-12", restSeconds: 90, rpe: 8, note: "3s negative. Upper chest focus." },
              // Primary: Cable Row — VOLUME
              { exerciseId: getEx("Cable Row (Seated)"), sets: 4, reps: "10-12", restSeconds: 75, rpe: 8, note: "Squeeze shoulder blades 1s at peak. Controlled return." },
              // Secondary: Cable Fly — ISOLATION
              { exerciseId: getEx("Cable Chest Fly"), sets: 3, reps: "12-15", restSeconds: 60, rpe: 7, note: "Constant tension. Squeeze at peak for 1s." },
              // Secondary: Cable Lateral Raise
              { exerciseId: getEx("Cable Lateral Raise"), sets: 3, reps: "15-20", restSeconds: 45, rpe: 7, note: "Light weight, constant tension. Chase the pump." },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Barbell Curl"), sets: 3, reps: "10-12", restSeconds: 60, rpe: 7, note: "Higher reps than strength day. Control the negative." },
              { exerciseId: getEx("Weighted Dip"), sets: 3, reps: "10-12", restSeconds: 60, rpe: 7, note: "Bodyweight or light added weight. Volume focus." },
            ]
          }
        ]
      },
      // ===== DAY 4: LOWER HYPERTROPHY =====
      {
        title: "Day 4 - Lower Hypertrophy",
        dayIndex: 3,
        phases: [
          {
            name: "warmup" as const,
            items: [
              { exerciseId: getEx("Walking Dumbbell Lunge"), sets: 1, reps: "10/side", restSeconds: 30, note: "Light warm-up. Prime quads and glutes." },
            ]
          },
          {
            name: "main" as const,
            items: [
              // Primary: Squat — VOLUME (lighter than Day 2)
              { exerciseId: getEx("Barbell Back Squat"), sets: 3, reps: "8-10", restSeconds: 90, rpe: 7, note: "Lighter than strength day. Focus on depth and control." },
              // Primary: Leg Press — VOLUME
              { exerciseId: getEx("Leg Press (PowerBuilder)"), sets: 3, reps: "12-15", restSeconds: 75, rpe: 8, note: "High reps. Full ROM. Quad emphasis." },
              // Secondary: Walking Lunge
              { exerciseId: getEx("Walking Dumbbell Lunge"), sets: 3, reps: "10/side", restSeconds: 75, rpe: 8, note: "Maintain upright torso. Drive through front heel." },
              // Secondary: Leg Curl
              { exerciseId: getEx("Leg Curl Machine"), sets: 3, reps: "12-15", restSeconds: 60, rpe: 8, note: "Higher reps than strength day. Slow eccentric." },
            ]
          },
          {
            name: "accessory" as const,
            items: [
              { exerciseId: getEx("Romanian Deadlift"), sets: 3, reps: "10-12", restSeconds: 75, rpe: 7, note: "Moderate RDL for hamstring volume. Not max effort." },
            ]
          }
        ]
      },
    ],
    changelog: "v1.0.0: Initial HAYL Power-Builder release. Original design by HAYL Performance Team.",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
