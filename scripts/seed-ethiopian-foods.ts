import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import fs from "fs";
import path from "path";

// Simple env parser
function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf-8");
  const env: Record<string, string> = {};
  content.split("\n").forEach(line => {
    const [key, ...value] = line.split("=");
    if (key && value.length > 0) {
      env[key.trim()] = value.join("=").trim().replace(/^["']|["']$/g, "");
    }
  });
  return env;
}

const env = loadEnv("apps/web/.env.local");
const convexUrl = env.VITE_CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!convexUrl) {
  console.error("VITE_CONVEX_URL not found in apps/web/.env.local or process.env");
  process.exit(1);
}

const client = new ConvexClient(convexUrl);

async function seed() {
  const dataPath = path.join(process.cwd(), "scripts/ethiopian-food-data.json");
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const foods = JSON.parse(rawData);

  console.log(`Seeding ${foods.length} Ethiopian food items...`);

  try {
    const result = await client.mutation(api.food.seedEthiopianFoods, { foods });
    console.log(result);
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

seed().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
