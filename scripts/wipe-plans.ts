import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const convexUrl = process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("❌ Error: CONVEX_URL is not defined in environment.");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

async function main() {
  console.log("🧹 Wiping all Derived Plans...");
  try {
    const count = await client.mutation(api.programs.wipeDerivedPlans, {});
    console.log(`✅ Deleted ${count} plans.`);
  } catch (err) {
    console.error("❌ Failed to wipe plans:", err);
  }
}

main();
