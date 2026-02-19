import { describe, expect, it } from "vitest";
import { LOCAL_INGREDIENTS } from "@hayl/shared";

describe("nutrition dataset integrity", () => {
  it("has unique ingredient names", () => {
    const names = LOCAL_INGREDIENTS.map((item) => item.name.trim().toLowerCase());
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("keeps macro fields non-negative", () => {
    for (const item of LOCAL_INGREDIENTS) {
      expect(item.calories).toBeGreaterThanOrEqual(0);
      expect(item.protein).toBeGreaterThanOrEqual(0);
      expect(item.carbs).toBeGreaterThanOrEqual(0);
      expect(item.fats).toBeGreaterThanOrEqual(0);
      expect(item.fiber).toBeGreaterThanOrEqual(0);
    }
  });

  it("ensures serving basis rows have serving sizes", () => {
    for (const item of LOCAL_INGREDIENTS) {
      if (item.nutritionBasis === "per_serving") {
        expect(item.servingSizeGrams).toBeDefined();
        expect(item.servingSizeGrams).toBeGreaterThan(0);
      }
    }
  });

  it("ensures custom measure grams are positive", () => {
    for (const item of LOCAL_INGREDIENTS) {
      for (const measure of item.commonMeasures ?? []) {
        expect(measure.grams).toBeGreaterThan(0);
      }
    }
  });

  it("requires source refs when locale tags are present", () => {
    for (const item of LOCAL_INGREDIENTS) {
      if (item.localeTags && item.localeTags.length > 0) {
        expect(item.sourceRefs && item.sourceRefs.length > 0).toBe(true);
      }
    }
  });
});
