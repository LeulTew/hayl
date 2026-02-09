import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

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
