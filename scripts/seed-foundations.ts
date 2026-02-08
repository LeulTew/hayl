
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

const EXERCISES = [
  { name: "Bodyweight Squat", muscleGroup: "Legs", instructions: "Stand with feet shoulder-width apart. Lower your hips back and down as if sitting in a chair. Keep chest up." },
  { name: "Push-up (Knees)", muscleGroup: "Chest", instructions: "Start on knees. Lower chest to floor. Push back up. Keep core tight." },
  { name: "Glute Bridge", muscleGroup: "Glutes", instructions: "Lie on back, knees bent. Lift hips toward ceiling. Squeeze glutes at top." },
  { name: "Dumbbell Row", muscleGroup: "Back", instructions: "Hinge at hips. Pull weight to hip. Squeeze back muscles." },
  { name: "Plank", muscleGroup: "Core", instructions: "Hold push-up position on elbows. Keep body in straight line." },
];

const PROGRAM = {
  slug: "foundations-1",
  title: "Hayl Foundations",
  canonicalVersion: "v1.0",
  difficulty: "beginner" as const,
  splitType: "3-day" as const,
  isPremium: false,
  published: true,
};

async function main() {
  console.log("🌱 Seeding Hayl Foundations...");

  // 1. Seed Exercises
  await client.mutation(api.exercises.seedExercises, { exercises: EXERCISES });
  console.log("✅ Exercises seeded.");

  // 2. Fetch Exercise IDs
  // We need to fetch them to link in the plan. 
  // Optimization: In a real script we might return IDs from seed, but this works.
  const exercises = await client.query(api.exercises.listAll);
  const exMap = new Map(exercises.map((e: any) => [e.name, e._id]));

  // 3. Seed Program
  const programIds = await client.mutation(api.programs.seedPrograms, { programs: [PROGRAM] });
  const programId = programIds[PROGRAM.slug];
  console.log(`✅ Program Created: ${programId}`);

  // 4. Seed Derived Plan (The Guide)
  const planId = await client.mutation(api.programs.seedDerivedPlan, {
    programId: programId as any,
    version: "v1.0.0",
    author: "Leul T.",
    variant: {
      difficulty: "amateur",
      splitFreq: "3-day",
      durationMinutes: 45,
      tags: ["home-friendly", "dumbbells-only"],
    },
    description: "The perfect starting point. Build functional strength and confidence with this 3-day foundation protocol.",
    overview_markdown: `
## Welcome to the Foundation.

This program is designed for **consistency**, not intensity. 

**The Goal:**
1. Master fundamental movement patterns.
2. Build daily habits.
3. Prepare your joints/tendons for heavier loads later.

**Equipment Needed:**
- 1 Pair of Dumbbells (Light)
- Yoga Mat
- Water Bottle
    `,
    schedule_markdown: `
- **Day 1**: Full Body Strength (Focus: Mechanics)
- **Day 2**: Rest / Light Walk (Review instructions)
- **Day 3**: Full Body Volume (Focus: Endurance)
    `,
    philosophy_markdown: `
**Why this works?**
Beginners don't need "Splits" (isolating muscle groups). You need frequency. Hitting muscles 2-3 times a week signals the body to adapt faster than hitting them once a week with high volume.

**The Science:**
Neuromuscular adaptation handles 80% of your initial "gains". You aren't just building muscle; you are teaching your brain to fire the muscle fibers you already have.
    `,
    source_refs: [],
    requires_human_review: false,
    days: [
        {
            title: "Day 1: Mechanics",
            dayIndex: 0,
            phases: [
                {
                    name: "warmup",
                    items: [
                        { exerciseId: exMap.get("Bodyweight Squat") as any, sets: 2, reps: "15", restSeconds: 60 },
                    ]
                },
                {
                    name: "main",
                    items: [
                        { exerciseId: exMap.get("Push-up (Knees)") as any, sets: 3, reps: "10-12", restSeconds: 90 },
                        { exerciseId: exMap.get("Dumbbell Row") as any, sets: 3, reps: "12", restSeconds: 90 },
                        { exerciseId: exMap.get("Glute Bridge") as any, sets: 3, reps: "15", restSeconds: 60 },
                    ]
                }
            ]
        },
        {
            title: "Day 2: Endurance",
            dayIndex: 1, // Actually Day 3 logic usually, but index 1 for 2nd workout
            phases: [
                 {
                    name: "main",
                    items: [
                        { exerciseId: exMap.get("Plank") as any, sets: 3, reps: "30s", restSeconds: 60 },
                        { exerciseId: exMap.get("Bodyweight Squat") as any, sets: 4, reps: "20", restSeconds: 90 },
                    ]
                }
            ]
        }
    ],
    changelog: "Initial digitized release",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
