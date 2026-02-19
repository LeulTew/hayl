import { describe, expect, it } from "bun:test";
import {
  computeTdee,
  deriveMacroTargets,
  macrosFromIngredient,
  normalizeAmountToGrams,
  per100g,
  sumMacros,
} from "./fuelEngine";

describe("fuelEngine normalization", () => {
  it("uses custom measures over defaults", () => {
    const grams = normalizeAmountToGrams(2, "cups", {
      commonMeasures: [{ unit: "cups", grams: 180 }],
    });
    expect(grams).toBe(360);
  });

  it("handles per serving ingredients", () => {
    const result = macrosFromIngredient(
      {
        calories: 72,
        protein: 6.3,
        carbs: 0.4,
        fats: 4.8,
        fiber: 0,
        nutritionBasis: "per_serving",
        servingSizeGrams: 50,
      },
      2,
      "pieces",
    );

    expect(result.grams).toBe(100);
    expect(result.macros.calories).toBeCloseTo(144, 4);
    expect(result.macros.protein).toBeCloseTo(12.6, 4);
  });

  it("computes per100g safely", () => {
    expect(per100g({ calories: 100, protein: 10, carbs: 5, fats: 1, fiber: 2 }, 0)).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
    });
  });
});

describe("fuelEngine planning", () => {
  it("prefers Katch-McArdle when body fat is provided", () => {
    const result = computeTdee({
      weightKg: 80,
      heightCm: 180,
      age: 30,
      gender: "male",
      activityLevel: "moderate",
      bodyFatPercent: 15,
    });

    expect(result.formula).toBe("Katch-McArdle");
    expect(result.bmr).toBeGreaterThan(0);
    expect(result.tdee).toBeGreaterThan(result.bmr);
  });

  it("derives macro targets with non-negative carbs", () => {
    const macro = deriveMacroTargets({
      calories: 1600,
      weightKg: 95,
      goal: "cut",
      experienceLevel: "elite",
    });

    expect(macro.protein).toBe(Math.round(95 * 2.2));
    expect(macro.fiber).toBe(32);
    expect(macro.carbs).toBeGreaterThanOrEqual(0);
  });

  it("sums macro vectors", () => {
    const result = sumMacros([
      { calories: 100, protein: 10, carbs: 0, fats: 1, fiber: 0 },
      { calories: 250, protein: 20, carbs: 30, fats: 8, fiber: 4 },
    ]);

    expect(result).toEqual({ calories: 350, protein: 30, carbs: 30, fats: 9, fiber: 4 });
  });
});
