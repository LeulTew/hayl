
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Doc, Id } from "../convex/_generated/dataModel.js";

const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("❌ CONVEX_URL is not set.");
  process.exit(1);
}
const client = new ConvexHttpClient(convexUrl);

// High-Quality Exercise Library (No generic stubs)
const EXERCISES = [
  // MECHANICS (Day 1)
  { name: "Bodyweight Squat", muscleGroup: "Legs", instructions: "Stand with feet shoulder-width apart. Hips back first, then knees. Keep chest proud. Depth is key, but form is king." },
  { name: "Push-up (Knees or Standard)", muscleGroup: "Chest", instructions: "Hands under shoulders. Core braced like you're about to be punched. Lower chest to floor, elbows at 45 degrees. Use knees if form breaks." },
  { name: "Glute Bridge", muscleGroup: "Glutes", instructions: "Lie on back, feet flat. Drive through heels to lift hips. Squeeze glutes at the top like you're cracking a walnut. Don't hyperextend lower back." },
  { name: "Dumbbell Row", muscleGroup: "Back", instructions: "Hinge at the hips, support on a bench/chair. Pull the weight to your HIP, not your shoulder. Imagine elbowing someone behind you." },
  { name: "Plank", muscleGroup: "Core", instructions: "Elbows under shoulders. Glutes squeezed. Pull your belly button to your spine. If your back sags, stop." },

  // VOLUME / ENDURANCE (Day 2)
  { name: "Walking Lunge", muscleGroup: "Legs", instructions: "Step forward, drop back knee to hover above ground. Keep torso upright. Drive up through the front heel." },
  { name: "Dumbbell Shoulder Press (Seated)", muscleGroup: "Shoulders", instructions: "Sit tall. Press weights overhead without arching your back. Lower until dumbbells touch shoulders. Control the descent." },
  { name: "Mountain Climbers", muscleGroup: "Cardio", instructions: "High plank position. Drive knees to chest alternating quickly. Keep hips low." },
  
  // STABILITY (Day 3)
  { name: "Single-Leg Deadlift (Bodyweight)", muscleGroup: "Hamstrings", instructions: "Stand on one leg. Hinge at hips, reaching opposite hand to floor. Keep back flat. Feel the stretch in hamstring." },
  { name: "Side Plank", muscleGroup: "Core", instructions: "Lie on side, elbow under shoulder. Lift hips to create straight line from head to heels. Hold." },
  { name: "Bird Dog", muscleGroup: "Core", instructions: "Hands and knees. Extend opposite arm and leg. Hold for 2s. Keep hips square to the floor (don't tilt)." },
  { name: "Cat-Cow", muscleGroup: "Back", instructions: "Hands and knees. Arch back like a cat (exhale), then drop belly and look up (inhale). Move with breath." },
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
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ ADMIN_SECRET is not set in environment.");
    process.exit(1);
  }
  // const adminSecret = ""; // Dummy

  console.log("🌱 Seeding Hayl Foundations (High Quality)...");

  // 1. Seed Exercises
  // 1. Seed Exercises
  await client.mutation(api.exercises.seedExercises, { exercises: EXERCISES, adminSecret: adminSecret });
  console.log("✅ Exercises seeded.");

  // 2. Fetch Exercise IDs
  const exercises = (await client.query(api.exercises.listAll)) as Doc<"exercises">[];
  const exMap = new Map<string, Id<"exercises">>(
    exercises.map((e) => [e.name, e._id])
  );

  const getEx = (name: string): Id<"exercises"> => {
    const id = exMap.get(name);
    if (!id) throw new Error(`Missing exercise: ${name}`);
    return id;
  };

  // 3. Seed Program Container
  // 3. Seed Program Container
  const programIds = (await client.mutation(api.programs.seedPrograms, { programs: [PROGRAM], adminSecret: adminSecret })) as Record<string, Id<"programs">>;
  const programId = programIds[PROGRAM.slug];
  console.log(`✅ Program Created: ${programId}`);

  // 4. Seed Derived Plan (Full Markdown, No TODOs)
  const planId = await client.mutation(api.programs.seedDerivedPlan, {
    programId, adminSecret: adminSecret,
    version: "v1.0.0",
    author: "Hayl Team",
    variant: {
      difficulty: "amateur",
      splitFreq: "3-day",
      durationMinutes: 45,
      tags: ["home-friendly", "dumbbells-only", "beginner", "rehab-friendly"],
      equipment_needed: ["dumbbells", "yoga-mat", "water-bottle"],
    },
    description: "The perfect starting point. Build functional strength, master your mechanics, and create a habit without burning out.",
    overview_markdown: `
# Welcome to the Foundation.

This program is designed for **consistency**, not intensity. If you are returning to the gym after a long break, or stepping in for the first time, strict "bodybuilding" splits will only leave you sore and discouraged.

**The Goal:**
1. **Master Mechanics**: Learn to move your body correctly before adding heavy load.
2. **Build Durability**: Strengthen tendons and joints to prevent future injury.
3. **Establish Rhythm**: training 3 days a week is sustainable.

**Equipment Needed:**
- 1 Pair of Dumbbells (Light - manageable for 15 reps)
- Yoga Mat
- Water Bottle
- 45 Minutes
    `,
    schedule_markdown: `
This is a **3-Day Full Body** split. You should rest at least one day between sessions.

- **Day 1: Mechanics** (Monday)
  - Focus: Form cues and slow tempo.
- **Day 2: Rest / Active Recovery** (Tuesday)
  - walk 30 mins or stretch.
- **Day 3: Volume** (Wednesday)
  - Focus: Slightly more reps, getting the heart rate up.
- **Day 4: Rest** (Thursday)
- **Day 5: Stability** (Friday)
  - Focus: Balance and core strength.
- **Weekend**: Rest / Hike / Fun Activity.
    `,
    philosophy_markdown: `
**Why Full Body?**
Beginners don't need "Splits" (isolating chest on Monday, back on Tuesday). You need frequency. Hitting muscles 2-3 times a week signals the body to adapt faster than hitting them once a week with high volume.

**The Science of "Neuromuscular Adaptation":**
Your initial gains aren't just muscle size; they are your brain learning to talk to your muscles. 
- **Week 1-4**: Your nervous system becomes more efficient at recruiting muscle fibers.
- **Week 5-8**: Structural changes (muscle growth) begin to accelerate.

Don't rush the weight. Rush the **form**.
    `,
    source_refs: [
        { docId: "hayl-internal-001", note: "Derived from standard rehab/beginner protocols" }
    ],
    requires_human_review: false,
    days: [
        {
            title: "Day 1: Mechanics Focus",
            dayIndex: 0,
            phases: [
                {
                    name: "warmup",
                    items: [
                        { exerciseId: getEx("Glute Bridge"), sets: 2, reps: "15", restSeconds: 60, note: "Wake up the hips." },
                        { exerciseId: getEx("Plank"), sets: 2, reps: "30s", restSeconds: 60, note: "Prime the core." },
                    ]
                },
                {
                    name: "main",
                    items: [
                        { exerciseId: getEx("Bodyweight Squat"), sets: 3, reps: "10-12", restSeconds: 90, rpe: 6, note: "Slow down. 3 seconds down, 1 second up." },
                        { exerciseId: getEx("Push-up (Knees or Standard)"), sets: 3, reps: "8-10", restSeconds: 90, rpe: 7, note: "Chest to floor every rep." },
                        { exerciseId: getEx("Dumbbell Row"), sets: 3, reps: "12", restSeconds: 90, rpe: 7, note: "Squeeze back at the top." },
                    ]
                },
                {
                    name: "accessory", 
                    items: [
                        { exerciseId: getEx("Bird Dog"), sets: 2, reps: "10 per side", restSeconds: 60, note: "Cooldown and stability." },
                    ]
                }
            ]
        },
        {
            title: "Day 2: Volume & Flow",
            dayIndex: 1, 
            phases: [
                 {
                    name: "warmup",
                    items: [
                        { exerciseId: getEx("Walking Lunge"), sets: 2, reps: "10 per leg", restSeconds: 60, note: "Open up hip flexors." },
                    ]
                },
                {
                    name: "main",
                    items: [
                        { exerciseId: getEx("Bodyweight Squat"), sets: 3, reps: "15-20", restSeconds: 60, rpe: 8, note: "Pick up the pace slightly." },
                        { exerciseId: getEx("Dumbbell Shoulder Press (Seated)"), sets: 3, reps: "12-15", restSeconds: 90, rpe: 8 },
                        { exerciseId: getEx("Mountain Climbers"), sets: 3, reps: "30s", restSeconds: 60, rpe: 9, note: "Heart rate spiker." },
                    ]
                }
            ]
        },
        {
            title: "Day 3: Stability & Core",
            dayIndex: 2,
            phases: [
                 {
                    name: "warmup",
                    items: [
                         { exerciseId: getEx("Cat-Cow"), sets: 2, reps: "1 min", restSeconds: 30, note: "Mobilize spine (if available) or plank." },
                    ]
                },
                {
                    name: "main",
                    items: [
                        { exerciseId: getEx("Single-Leg Deadlift (Bodyweight)"), sets: 3, reps: "8 per leg", restSeconds: 90, rpe: 7, note: "Isolate the hamstrings. Balance is key." },
                        { exerciseId: getEx("Side Plank"), sets: 3, reps: "30s per side", restSeconds: 60, rpe: 8, note: "Obliques on fire." },
                        { exerciseId: getEx("Bird Dog"), sets: 3, reps: "12 per side", restSeconds: 60, note: "Control > Speed." },
                    ]
                }
            ]
        }
    ],
    changelog: "v1.0.0: Initial digitization of Sister/Mom protocol with added markdown context.",
  });

  console.log(`✅ Plan Seeded: ${planId}`);
}

main().catch(console.error);
