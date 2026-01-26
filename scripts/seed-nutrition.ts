import { ConvexHttpClient } from "convex/browser";
// Bun automatically loads .env files
const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl) {
  console.error("Error: CONVEX_URL is not set. Make sure .env.local exists.");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

const INGREDIENTS = [
  {
    name: "Teff Flour",
    amharicName: "Teff",
    calories: 366,
    protein: 12.2,
    carbs: 70.7,
    fats: 3.7,
    fiber: 12.2,
    category: "grain",
    isLocal: true,
  },
  {
    name: "Injera (Pure Teff)",
    amharicName: "Injera",
    calories: 165,
    protein: 5.0,
    carbs: 35.0,
    fats: 1.0,
    fiber: 2.5,
    category: "grain",
    isLocal: true,
  },
  {
    name: "Injera (House/Mixed)",
    calories: 140,
    protein: 3.5,
    carbs: 30.0,
    fats: 0.8,
    fiber: 1.5,
    category: "grain",
    isLocal: true,
  },
  {
    name: "Shiro Powder (Chickpea/Spiced)",
    amharicName: "Shiro",
    calories: 360,
    protein: 20.0,
    carbs: 55.0,
    fats: 6.0,
    fiber: 10.0,
    category: "legume",
    isLocal: true,
  },
  {
    name: "Doro Wat (Chicken Stew)",
    amharicName: "Doro Wat",
    calories: 150,
    protein: 11.0,
    carbs: 6.0,
    fats: 9.0,
    fiber: 1.0,
    category: "meat",
    isLocal: true,
  },
  {
    name: "Beef Tibs (Lean)",
    amharicName: "Tibbs",
    calories: 150,
    protein: 22.0,
    carbs: 0.0,
    fats: 7.0,
    fiber: 0.0,
    category: "meat",
    isLocal: true,
  },
  // Global staples for comparison
  {
      name: "Chicken Breast (Raw)",
      calories: 120,
      protein: 23,
      carbs: 0,
      fats: 2.5,
      fiber: 0,
      category: "meat",
      isLocal: false
  },
  {
      name: "White Rice (Raw)",
      calories: 360,
      protein: 7,
      carbs: 80,
      fats: 0.6,
      fiber: 1,
      category: "grain",
      isLocal: false
  }
] as const;

async function main() {
  console.log(`Checking Convex URL: ${convexUrl}`);
  try {
      // @ts-ignore - Dynamic dispatch
      await client.mutation("nutrition:seedIngredients", { ingredients: INGREDIENTS });
      console.log("✅ Successfully seeded nutrition data!");
  } catch(e) {
      console.error("❌ Failed to seed:", e);
  }
}

main();
