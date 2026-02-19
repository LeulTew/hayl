import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { LOCAL_INGREDIENTS } from "../packages/shared/nutrition";
// Bun automatically loads .env files
const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl) {
  console.error("Error: CONVEX_URL is not set. Make sure .env.local exists.");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

async function main() {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ ADMIN_SECRET is not set in environment.");
    process.exit(1);
  }

  console.log(`Checking Convex URL: ${convexUrl}`);
  try {
      await client.mutation(api.nutrition.seedIngredients, { ingredients: [...LOCAL_INGREDIENTS], adminSecret });
      console.log(`✅ Successfully seeded nutrition data (${LOCAL_INGREDIENTS.length} ingredients)!`);
  } catch(e) {
      console.error("❌ Failed to seed:", e);
  }
}

main();
