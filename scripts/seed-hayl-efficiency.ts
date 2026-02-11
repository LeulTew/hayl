/**
 * Seed Script: HAYL Efficiency I
 * Author: Leul Tewodros Agonafer
 * Slug: efficiency-1day-30min-density
 *
 * Structure:
 * - 1-Day Split | 30 Minutes | Density Training (Hypertrophy + Conditioning)
 * - BLOCK A: Lower Push/Pull Superset (8 min)
 * - BLOCK B: Upper Push/Pull Superset (8 min)
 * - BLOCK C: Full-Body Density Finisher (8 min)
 *
 * Design Philosophy:
 * - Antagonist supersets for zero wasted rest
 * - Compound movements only — no isolation
 * - RPE-driven intensity (no fixed %1RM)
 * - Evidence-based: Schoenfeld et al. (2016) low-volume high-frequency
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
 * Exercises specific to HAYL Efficiency.
 * These are compound-only movements optimized for density training.
 */
const EXERCISES = [
  { name: "Goblet Squat", muscleGroup: "Legs", instructions: "Hold dumbbell/kettlebell at chest. Squat deep with elbows inside knees. Drive through heels. Maintain upright torso throughout." },
  { name: "Romanian Deadlift", muscleGroup: "Hamstrings", instructions: "Hinge at hips with slight knee bend. Lower weight along shins until hamstring stretch. Squeeze glutes to return. Keep back neutral throughout." },
  { name: "Dumbbell Bench Press", muscleGroup: "Chest", instructions: "Flat bench. Lower dumbbells to chest level with elbows at 45°. Press up and slightly inward. Control the negative for 2-3 seconds." },
  { name: "Bent-Over Dumbbell Row", muscleGroup: "Back", instructions: "Hinge at 45°. Pull dumbbells to hip crease. Squeeze shoulder blades together at top. Control the descent — no momentum." },
  { name: "Dumbbell Overhead Press", muscleGroup: "Shoulders", instructions: "Standing or seated. Press dumbbells overhead without arching back. Lock out at top. Control descent to ear level." },
  { name: "Dumbbell Reverse Lunge", muscleGroup: "Legs", instructions: "Step back into lunge. Front knee tracks over toe. Drive through front heel to stand. Alternate legs each rep." },
  { name: "Push-up (Weighted or Bodyweight)", muscleGroup: "Chest", instructions: "Hands shoulder-width. Lower chest to floor with elbows at 45°. Full lockout at top. Add weight vest or plate for progression." },
  { name: "Renegade Row", muscleGroup: "Back", instructions: "Push-up position with dumbbells. Row one dumbbell to hip while stabilizing with the other arm. Minimize hip rotation. Alternate sides." },
  { name: "Dumbbell Thruster", muscleGroup: "Full Body", instructions: "Hold dumbbells at shoulders. Squat to parallel, then drive up explosively and press overhead in one fluid motion. This is the king of density moves." },

];

const PROGRAM = {
  slug: "efficiency-1day-30min-density",
  title: "HAYL Efficiency I",
  canonicalVersion: "v1.0",
  difficulty: "beginner" as const,
  splitType: "1-day" as const,
  isPremium: false,
  published: true,
};

/**
 * Seeds HAYL Efficiency I — a 30-minute density training session.
 * Designed for athletes who want maximum results in minimum time.
 */
async function main() {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ ADMIN_SECRET is not set in environment.");
    process.exit(1);
  }

  console.log("🌱 Seeding HAYL Efficiency I (1-Day, 30min, Density)...");

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
      splitFreq: "1-day",
      durationMinutes: 30,
      tags: ["full-body", "density", "efficiency", "time-saver", "supersets"],
      equipment_needed: ["dumbbells"],
    },
    description: "A 30-minute full-body density session. Antagonist supersets with zero wasted rest. Compound movements only. Train 3-5x/week for maximum frequency-driven gains.",
    overview_markdown: `
# HAYL Efficiency I — 30-Min Density Training

**Duration**: 30 min | **Split**: Full Body | **Focus**: Density (Hypertrophy + Conditioning) | **Level**: All Levels

## Why This Program

You don't need an hour. You don't even need 45 minutes. **30 minutes of intelligent, high-density training** can deliver serious results — if every second counts.

HAYL Efficiency is built on one principle: **antagonist supersets with zero wasted rest**. While your chest recovers, your back works. While your quads recover, your hamstrings fire. You're always moving, always working, always progressing.

## Core Principles
- **Antagonist Supersets** — Pair opposing muscle groups to eliminate rest periods
- **Compounds Only** — No curls, no calf raises. Big movements, big results
- **Density Over Volume** — Pack maximum work into minimum time
- **RPE-Driven** — Scale intensity by feel, not percentages

## Coach's Notes
> This program is deceptively brutal. 30 minutes of non-stop compound supersets will humble even experienced lifters. Start conservative with weights — you can always add more next session. The goal is **density**: more work in less time, not heavier weights with longer rest.

## Equipment
Dumbbells (adjustable preferred), Kettlebell (optional), Flat Bench

## Who Is This For?
- Busy professionals with 30-min windows
- Athletes training 4-6x/week who want frequency over volume
- Anyone who hates long gym sessions but loves results
    `,
    schedule_markdown: `
## Session Structure (30 Minutes Total)

### BLOCK A: Lower Push/Pull Superset (8 min)
- A1: Goblet Squat → A2: Romanian Deadlift
- 3 supersets, 45s rest between pairs

### BLOCK B: Upper Push/Pull Superset (8 min)
- B1: Dumbbell Bench Press → B2: Bent-Over Dumbbell Row
- 3 supersets, 45s rest between pairs

### BLOCK C: Density Finisher (8 min)
- C1: Dumbbell Thruster → C2: Renegade Row
- AMRAP style: as many quality rounds as possible in 8 minutes
- Rest only when form breaks

### Optional Cooldown (5 min)
- Light stretching, breathing exercises
    `,
    philosophy_markdown: `
## The Science Behind HAYL Efficiency I

**Frequency > Volume (Per Session)**
Research by Schoenfeld et al. (2016) demonstrates that distributing training volume across more frequent, shorter sessions can match or exceed the hypertrophy of fewer, longer sessions. HAYL Efficiency leverages this by keeping sessions short enough to train 4-6x/week.

**Antagonist Supersets**
Studies show antagonist paired sets maintain force output while reducing total session time by 33-40% (Robbins et al., 2010). By pairing chest/back and quads/hamstrings, you get full recovery between sets of the same muscle group — without sitting idle.

**Density Training**
The AMRAP finisher drives metabolic stress — a key hypertrophy mechanism alongside mechanical tension. The combination of compounds + density creates a potent stimulus for both muscle growth and cardiovascular conditioning.

**Compound Economy**
Every exercise in this program hits multiple joints and muscle groups. A single Dumbbell Thruster trains quads, glutes, shoulders, and triceps simultaneously. This is how you fit a full workout into 30 minutes.
    `,
    source_refs: [
      { docId: "hayl-internal", note: "HAYL Efficiency I — Original Design. Author: Leul Tewodros Agonafer" }
    ],
    requires_human_review: false,
    days: [
      {
        title: "Day 1 - Full Body Density",
        dayIndex: 0,
        phases: [
          // BLOCK A: Lower Push/Pull Superset
          {
            name: "warmup" as const,
            items: [
              { exerciseId: getEx("Goblet Squat"), sets: 1, reps: "10", restSeconds: 0, note: "Warm-up set. Light weight, controlled tempo. Flow directly into RDL." },
              { exerciseId: getEx("Romanian Deadlift"), sets: 1, reps: "10", restSeconds: 45, note: "Warm-up set. Light weight, feel the hamstring stretch." },
            ]
          },
          {
            name: "main" as const,
            items: [
              // Superset A — Round 1
              { exerciseId: getEx("Goblet Squat"), sets: 1, reps: "10-12", restSeconds: 0, rpe: 7, note: "Superset A1 — Round 1. Moderate weight. Go directly to RDL." },
              { exerciseId: getEx("Romanian Deadlift"), sets: 1, reps: "10-12", restSeconds: 45, rpe: 7, note: "Superset A2 — Round 1. Moderate. Rest 45s then repeat." },
              // Superset A — Round 2
              { exerciseId: getEx("Goblet Squat"), sets: 1, reps: "10-12", restSeconds: 0, rpe: 8, note: "Superset A1 — Round 2. Same or heavier weight." },
              { exerciseId: getEx("Romanian Deadlift"), sets: 1, reps: "10-12", restSeconds: 45, rpe: 8, note: "Superset A2 — Round 2." },
              // Superset A — Round 3
              { exerciseId: getEx("Goblet Squat"), sets: 1, reps: "8-10", restSeconds: 0, rpe: 9, note: "Superset A1 — Round 3. Push it. Last lower body set." },
              { exerciseId: getEx("Romanian Deadlift"), sets: 1, reps: "8-10", restSeconds: 60, rpe: 9, note: "Superset A2 — Round 3. Full effort. 60s rest before Block B." },

              // Superset B — Round 1
              { exerciseId: getEx("Dumbbell Bench Press"), sets: 1, reps: "10-12", restSeconds: 0, rpe: 7, note: "Superset B1 — Round 1. Chest. Go directly to Row." },
              { exerciseId: getEx("Bent-Over Dumbbell Row"), sets: 1, reps: "10-12", restSeconds: 45, rpe: 7, note: "Superset B2 — Round 1. Back. Rest 45s." },
              // Superset B — Round 2
              { exerciseId: getEx("Dumbbell Bench Press"), sets: 1, reps: "10-12", restSeconds: 0, rpe: 8, note: "Superset B1 — Round 2." },
              { exerciseId: getEx("Bent-Over Dumbbell Row"), sets: 1, reps: "10-12", restSeconds: 45, rpe: 8, note: "Superset B2 — Round 2." },
              // Superset B — Round 3
              { exerciseId: getEx("Dumbbell Bench Press"), sets: 1, reps: "8-10", restSeconds: 0, rpe: 9, note: "Superset B1 — Round 3. Push to near failure." },
              { exerciseId: getEx("Bent-Over Dumbbell Row"), sets: 1, reps: "8-10", restSeconds: 60, rpe: 9, note: "Superset B2 — Round 3. Squeeze hard. 60s rest before Block C." },
            ]
          },
          // BLOCK C: Density Finisher (AMRAP)
          {
            name: "accessory" as const,
            items: [
              // Round 1
              { exerciseId: getEx("Dumbbell Thruster"), sets: 1, reps: "8", restSeconds: 0, rpe: 8, note: "AMRAP Block — Round 1. Explosive. Go right into Renegade Row." },
              { exerciseId: getEx("Renegade Row"), sets: 1, reps: "6/side", restSeconds: 30, rpe: 8, note: "AMRAP Block — Round 1. 6 per arm. Minimize hip rotation." },
              // Round 2
              { exerciseId: getEx("Dumbbell Thruster"), sets: 1, reps: "8", restSeconds: 0, rpe: 8, note: "AMRAP Block — Round 2. Maintain form — speed is secondary." },
              { exerciseId: getEx("Renegade Row"), sets: 1, reps: "6/side", restSeconds: 30, rpe: 8, note: "AMRAP Block — Round 2." },
              // Round 3
              { exerciseId: getEx("Dumbbell Thruster"), sets: 1, reps: "8", restSeconds: 0, rpe: 9, note: "AMRAP Block — Final Round. Empty the tank." },
              { exerciseId: getEx("Renegade Row"), sets: 1, reps: "6/side", restSeconds: 0, rpe: 9, note: "AMRAP Block — Final Round. Done. Breathe." },
            ]
          }
        ]
      }
    ],
    changelog: "v1.0.0: Initial HAYL Efficiency release. Original design by HAYL Performance Team.",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
