import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ALLOWED_UNITS = new Set([
  "grams",
  "kg",
  "ml",
  "cups",
  "tbsp",
  "tsp",
  "pieces",
  "rolls",
  "ladles",
  "slices",
  "patties",
  "bowls",
  "servings",
]);

type SeedFood = {
  name: string;
  amharicName?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  category: "grain" | "legume" | "meat" | "vegetable" | "other";
  isLocal: boolean;
  nutritionBasis: "per_100g" | "per_serving";
  commonMeasures?: Array<{
    unit: string;
    grams: number;
    label?: string;
  }>;
};

function loadSeedFoods(): SeedFood[] {
  const dataPath = join(process.cwd(), "..", "..", "scripts", "ethiopian-food-data.json");
  return JSON.parse(readFileSync(dataPath, "utf8")) as SeedFood[];
}

describe("seed artifacts", () => {
  it("ethiopian-food-data.json contains valid, deduplicated records", () => {
    const foods = loadSeedFoods();

    expect(Array.isArray(foods)).toBe(true);
    expect(foods.length).toBeGreaterThan(0);

    const seenNames = new Set<string>();

    for (const food of foods) {
      expect(typeof food.name).toBe("string");
      expect(food.name.length).toBeGreaterThan(2);
      expect(seenNames.has(food.name)).toBe(false);
      seenNames.add(food.name);

      expect(["grain", "legume", "meat", "vegetable", "other"]).toContain(food.category);
      expect(typeof food.isLocal).toBe("boolean");
      expect(["per_100g", "per_serving"]).toContain(food.nutritionBasis);

      expect(food.calories).toBeGreaterThanOrEqual(0);
      expect(food.protein).toBeGreaterThanOrEqual(0);
      expect(food.carbs).toBeGreaterThanOrEqual(0);
      expect(food.fats).toBeGreaterThanOrEqual(0);
      expect(food.fiber).toBeGreaterThanOrEqual(0);

      for (const measure of food.commonMeasures ?? []) {
        expect(ALLOWED_UNITS.has(measure.unit)).toBe(true);
        expect(measure.grams).toBeGreaterThan(0);
      }
    }
  });

  it("contains key newly added layer foods", () => {
    const foods = loadSeedFoods();
    const names = new Set(foods.map((food) => food.name));

    expect(names.has("Doro Wat (Chicken Stew)")).toBe(true);
    expect(names.has("Shiro Wat")).toBe(true);
    expect(names.has("Misir Wat (Red Lentils)")).toBe(true);
  });
});
