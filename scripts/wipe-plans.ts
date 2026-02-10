import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const convexUrl = process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("❌ Error: CONVEX_URL is not defined in environment.");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

async function main() {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ ADMIN_SECRET is not set in environment.");
    process.exit(1);
  }

  console.log("🧹 Wiping all Derived Plans...");
  try {
    const count = await client.mutation(api.programs.wipeDerivedPlans, { adminSecret: adminSecret });
    console.log(`✅ Deleted ${count} plans.`);
  } catch (err) {
    console.error("❌ Failed to wipe plans:", err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

