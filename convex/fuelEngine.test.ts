import { describe, expect, it } from "bun:test";
import {
  assessAdherence,
  clamp,
  computeTdee,
  deriveMacroTargets,
  FUEL_UNITS,
  macrosFromDish,
  macrosFromIngredient,
  normalizeAmountToGrams,
  per100g,
  round1,
  suggestCalorieAdjustment,
  sumMacros,
  type MacroVector,
} from "./fuelEngine";

// ──── EDGE-CASE HELPERS ────

const ZERO_MACROS: MacroVector = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };

// ──── normalizeAmountToGrams ────

describe("normalizeAmountToGrams", () => {
  it("converts grams 1:1", () => {
    expect(normalizeAmountToGrams(100, "grams")).toBe(100);
  });

  it("converts kg to grams", () => {
    expect(normalizeAmountToGrams(2, "kg")).toBe(2000);
  });

  it("uses custom measures over defaults", () => {
    const grams = normalizeAmountToGrams(2, "cups", {
      commonMeasures: [{ unit: "cups", grams: 180 }],
    });
    expect(grams).toBe(360);
  });

  it("uses servingSizeGrams for 'servings' unit", () => {
    expect(normalizeAmountToGrams(2, "servings", { servingSizeGrams: 150 })).toBe(300);
  });

  it("falls back to default when servingSizeGrams is 0", () => {
    expect(normalizeAmountToGrams(2, "servings", { servingSizeGrams: 0 })).toBe(200);
  });

  it("uses density for ml", () => {
    expect(normalizeAmountToGrams(100, "ml", { densityGPerMl: 1.03 })).toBe(103);
  });

  it("returns 0 for non-finite input", () => {
    expect(normalizeAmountToGrams(NaN, "grams")).toBe(0);
    expect(normalizeAmountToGrams(Infinity, "grams")).toBe(0);
  });

  it("returns 0 for negative input", () => {
    expect(normalizeAmountToGrams(-50, "grams")).toBe(0);
  });

  it("returns 0 for zero input", () => {
    expect(normalizeAmountToGrams(0, "grams")).toBe(0);
  });
});

// ──── macrosFromIngredient ────

describe("macrosFromIngredient", () => {
  const egg = {
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fats: 4.8,
    fiber: 0,
    nutritionBasis: "per_serving" as const,
    servingSizeGrams: 50,
  };

  const rice = {
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fats: 0.3,
    fiber: 0.4,
    nutritionBasis: "per_100g" as const,
  };

  it("handles per-serving ingredients", () => {
    const result = macrosFromIngredient(egg, 2, "pieces");
    expect(result.grams).toBe(100);
    expect(result.macros.calories).toBeCloseTo(144, 4);
    expect(result.macros.protein).toBeCloseTo(12.6, 4);
  });

  it("handles per-100g ingredients", () => {
    const result = macrosFromIngredient(rice, 200, "grams");
    expect(result.grams).toBe(200);
    expect(result.macros.calories).toBeCloseTo(260, 4);
    expect(result.macros.carbs).toBeCloseTo(56, 4);
  });

  it("returns zero macros for zero amount", () => {
    const result = macrosFromIngredient(rice, 0, "grams");
    expect(result.grams).toBe(0);
    expect(result.macros.calories).toBe(0);
  });

  it("defaults to per_100g when nutritionBasis is undefined", () => {
    const plain = { calories: 100, protein: 10, carbs: 20, fats: 5, fiber: 2 };
    const result = macrosFromIngredient(plain, 200, "grams");
    expect(result.macros.calories).toBeCloseTo(200, 4);
  });
});

// ──── macrosFromDish ────

describe("macrosFromDish", () => {
  const shiroWat = {
    defaultServingGrams: 150,
    cachedNutritionPer100g: { calories: 180, protein: 12, carbs: 20, fats: 6, fiber: 5 },
  };

  it("scales dish macros by gram weight", () => {
    const result = macrosFromDish(shiroWat, 300, "grams");
    expect(result.grams).toBe(300);
    expect(result.macros.calories).toBeCloseTo(540, 4);
    expect(result.macros.protein).toBeCloseTo(36, 4);
  });

  it("uses servingSizeGrams for 'servings' unit", () => {
    const result = macrosFromDish(shiroWat, 1, "servings");
    expect(result.grams).toBe(150);
    expect(result.macros.calories).toBeCloseTo(270, 4);
  });

  it("uses custom measures when available", () => {
    const dish = {
      ...shiroWat,
      commonMeasures: [{ unit: "ladles" as const, grams: 200 }],
    };
    const result = macrosFromDish(dish, 2, "ladles");
    expect(result.grams).toBe(400);
    expect(result.macros.calories).toBeCloseTo(720, 4);
  });
});

// ──── sumMacros ────

describe("sumMacros", () => {
  it("sums multiple vectors", () => {
    const result = sumMacros([
      { calories: 100, protein: 10, carbs: 0, fats: 1, fiber: 0 },
      { calories: 250, protein: 20, carbs: 30, fats: 8, fiber: 4 },
    ]);
    expect(result).toEqual({ calories: 350, protein: 30, carbs: 30, fats: 9, fiber: 4 });
  });

  it("returns zero vector for empty array", () => {
    expect(sumMacros([])).toEqual(ZERO_MACROS);
  });

  it("handles single element", () => {
    const v = { calories: 42, protein: 3, carbs: 5, fats: 1, fiber: 0 };
    expect(sumMacros([v])).toEqual(v);
  });
});

// ──── per100g ────

describe("per100g", () => {
  it("normalizes to per-100g", () => {
    const result = per100g({ calories: 200, protein: 20, carbs: 10, fats: 5, fiber: 2 }, 200);
    expect(result.calories).toBe(100);
    expect(result.protein).toBe(10);
  });

  it("returns zeros for zero totalGrams", () => {
    expect(per100g({ calories: 100, protein: 10, carbs: 5, fats: 1, fiber: 2 }, 0)).toEqual(ZERO_MACROS);
  });

  it("returns zeros for negative totalGrams", () => {
    expect(per100g({ calories: 100, protein: 10, carbs: 5, fats: 1, fiber: 2 }, -100)).toEqual(ZERO_MACROS);
  });
});

// ──── round1 ────

describe("round1", () => {
  it("rounds to 1 decimal place", () => {
    expect(round1(3.14159)).toBe(3.1);
    expect(round1(3.15)).toBe(3.2);
    expect(round1(0)).toBe(0);
  });
});

// ──── clamp ────

describe("clamp", () => {
  it("clamps below minimum", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it("clamps above maximum", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it("passes through values in range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("handles edge: value equals min", () => {
    expect(clamp(0, 0, 100)).toBe(0);
  });

  it("handles edge: value equals max", () => {
    expect(clamp(100, 0, 100)).toBe(100);
  });
});

// ──── computeTdee ────

describe("computeTdee", () => {
  it("uses Mifflin-St Jeor by default", () => {
    const result = computeTdee({
      weightKg: 80,
      heightCm: 180,
      age: 30,
      gender: "male",
      activityLevel: "moderate",
    });
    expect(result.formula).toBe("Mifflin-St Jeor");
    expect(result.bmr).toBeGreaterThan(0);
    expect(result.tdee).toBeGreaterThan(result.bmr);
  });

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

  it("applies sex offset for female", () => {
    const male = computeTdee({ weightKg: 70, heightCm: 165, age: 25, gender: "male", activityLevel: "sedentary" });
    const female = computeTdee({ weightKg: 70, heightCm: 165, age: 25, gender: "female", activityLevel: "sedentary" });
    expect(male.bmr).toBeGreaterThan(female.bmr);
  });

  it("scales with activity level", () => {
    const sed = computeTdee({ weightKg: 80, heightCm: 180, age: 30, gender: "male", activityLevel: "sedentary" });
    const ath = computeTdee({ weightKg: 80, heightCm: 180, age: 30, gender: "male", activityLevel: "athlete" });
    expect(ath.tdee).toBeGreaterThan(sed.tdee);
  });
});

// ──── deriveMacroTargets ────

describe("deriveMacroTargets", () => {
  it("derives targets with non-negative carbs", () => {
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

  it("clamps carbs to 0 when protein + fats exceed budget", () => {
    const macro = deriveMacroTargets({
      calories: 500,
      weightKg: 100,
      goal: "cut",
      experienceLevel: "elite",
    });
    expect(macro.carbs).toBe(0);
  });

  it("uses intermediate defaults", () => {
    const macro = deriveMacroTargets({ calories: 2500, weightKg: 75 });
    expect(macro.protein).toBe(Math.round(75 * 2.0));
    expect(macro.fiber).toBe(28);
  });
});

// ──── FUEL_UNITS ────

describe("FUEL_UNITS", () => {
  it("contains all 13 supported units", () => {
    expect(FUEL_UNITS.length).toBe(13);
    expect(FUEL_UNITS).toContain("grams");
    expect(FUEL_UNITS).toContain("servings");
    expect(FUEL_UNITS).toContain("ladles");
  });
});

// ──── suggestCalorieAdjustment (Adaptive Hook) ────

describe("suggestCalorieAdjustment", () => {
  it("suggests maintain when within 10% of TDEE", () => {
    const result = suggestCalorieAdjustment([2000, 2100, 1950], 2000);
    expect(result.suggestion).toBe("maintain");
    expect(result.averageIntake).toBeCloseTo(2016.7, 0);
  });

  it("suggests decrease when significantly above TDEE", () => {
    const result = suggestCalorieAdjustment([3000, 3200, 2800], 2000);
    expect(result.suggestion).toBe("decrease");
    expect(result.delta).toBeGreaterThan(0);
  });

  it("suggests increase when significantly below TDEE", () => {
    const result = suggestCalorieAdjustment([1500, 1400, 1300], 2500);
    expect(result.suggestion).toBe("increase");
    expect(result.delta).toBeLessThan(0);
  });

  it("returns maintain for empty input", () => {
    const result = suggestCalorieAdjustment([], 2000);
    expect(result.suggestion).toBe("maintain");
    expect(result.averageIntake).toBe(0);
    expect(result.delta).toBe(0);
  });

  it("returns maintain for zero TDEE", () => {
    const result = suggestCalorieAdjustment([2000], 0);
    expect(result.suggestion).toBe("maintain");
  });

  it("handles single-day input", () => {
    const result = suggestCalorieAdjustment([1000], 2000);
    expect(result.suggestion).toBe("increase");
    expect(result.averageIntake).toBe(1000);
  });
});

// ──── assessAdherence (Adaptive Hook) ────

describe("assessAdherence", () => {
  const target: MacroVector = { calories: 2000, protein: 150, carbs: 250, fats: 70, fiber: 30 };

  it("returns 100 for perfect adherence", () => {
    const score = assessAdherence([target, target, target], target);
    expect(score).toBe(100);
  });

  it("returns 0 for empty input", () => {
    expect(assessAdherence([], target)).toBe(0);
  });

  it("returns high score for close adherence", () => {
    const close: MacroVector = { calories: 1950, protein: 145, carbs: 245, fats: 68, fiber: 28 };
    const score = assessAdherence([close], target);
    expect(score).toBeGreaterThan(90);
  });

  it("returns low score for poor adherence", () => {
    const poor: MacroVector = { calories: 4000, protein: 50, carbs: 500, fats: 150, fiber: 10 };
    const score = assessAdherence([poor], target);
    expect(score).toBeLessThan(40);
  });

  it("handles target with zero macros gracefully", () => {
    const zeroTarget: MacroVector = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
    const score = assessAdherence([target], zeroTarget);
    expect(score).toBe(100);
  });
});
