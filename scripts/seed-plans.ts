// bun run seed-plans.ts
import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("Error: CONVEX_URL is not set.");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

const plans = [
  {
    title: "Hayl Foundations",
    source_refs: [{ docId: "starter-week-gf", note: "exact copy; authoritative" }],
    // derivedPlans.days is v.any(), but we structure it to match our 'workouts' logic
    days: [
        {
            dayIndex: 1,
            title: "Legs & Core",
            phases: [
                {
                    phaseType: "workout",
                    items: [
                        { exerciseName: "Goblet Squat", sets: 3, reps: "10", notes: "Deep stretch" }
                    ]
                }
            ]
        }
    ], 
    changelog: "Initial seed from provided starter doc (exact)",
    author: "seed-script",
    published: true,
    requires_human_review: false // Authoritative plan
  },
  {
      title: "3-day mom/sis",
      source_refs: [{ docId: "mom-sis-pdf", note: "derived" }],
      days: [], 
      changelog: "Derived from PDF",
      author: "seed-script",
      published: false,
      requires_human_review: true // Derived plan requires review
  }
];

// Placeholder for mutation call
// await client.mutation('mutations:createDerivedPlan', plan);
console.log('Seeding script ready. Ensure mutations:createDerivedPlan accepts this structure.');
console.log('Plans to seed:', JSON.stringify(plans, null, 2));
