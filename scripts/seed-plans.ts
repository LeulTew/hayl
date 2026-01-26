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
    days: [
      { title: "Day 1", blocks: [{ name: "Goblet Squat", sets: 3, reps: "10", restSeconds: 90 }] }
      // TODO: Populate full week from reference
    ],
    changelog: "Initial seed from provided starter doc (exact)",
    author: "seed-script",
    published: true
  },
  {
      title: "3-day mom/sis",
      source_refs: [{ docId: "starter-week-gf", note: "exact copy; authoritative" }],
      days: [], 
      changelog: "Initial seed",
      author: "seed-script",
      published: true
  }
];

// Placeholder for mutation call - will fail until mutation is defined in backend
// await client.mutation('mutations:createDerivedPlan', plan);
console.log('Seeding script ready. Define mutations:createDerivedPlan in Convex first.');
console.log('Plans to seed:', JSON.stringify(plans, null, 2));

// Place holder logic for now
console.log('seeded hayl foundations (simulation)');
