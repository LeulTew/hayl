export type FuelUnit =
  | "grams"
  | "kg"
  | "ml"
  | "cups"
  | "tbsp"
  | "tsp"
  | "pieces"
  | "rolls"
  | "ladles"
  | "slices"
  | "patties"
  | "bowls"
  | "servings";

export type NutritionBasis = "per_100g" | "per_serving";

export interface MacroVector {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface MeasureDef {
  unit: FuelUnit;
  grams: number;
  label?: string;
}

export interface IngredientLike {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  nutritionBasis?: NutritionBasis;
  servingSizeGrams?: number;
  densityGPerMl?: number;
  commonMeasures?: MeasureDef[];
}

export interface DishLike {
  defaultServingGrams: number;
  densityGPerMl?: number;
  commonMeasures?: MeasureDef[];
  cachedNutritionPer100g: MacroVector;
}

const DEFAULT_UNIT_GRAMS: Record<FuelUnit, number> = {
  grams: 1,
  kg: 1000,
  ml: 1,
  cups: 240,
  tbsp: 15,
  tsp: 5,
  pieces: 50,
  rolls: 150,
  ladles: 180,
  slices: 30,
  patties: 90,
  bowls: 320,
  servings: 100,
};

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function normalizeAmountToGrams(
  amount: number,
  unit: FuelUnit,
  options?: {
    densityGPerMl?: number;
    servingSizeGrams?: number;
    commonMeasures?: MeasureDef[];
  },
): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;

  const customMeasure = options?.commonMeasures?.find((measure) => measure.unit === unit);
  if (customMeasure) {
    return amount * customMeasure.grams;
  }

  if (unit === "servings" && options?.servingSizeGrams && options.servingSizeGrams > 0) {
    return amount * options.servingSizeGrams;
  }

  if (unit === "ml") {
    const density = options?.densityGPerMl ?? DEFAULT_UNIT_GRAMS.ml;
    return amount * density;
  }

  return amount * DEFAULT_UNIT_GRAMS[unit];
}

export function macrosFromIngredient(
  ingredient: IngredientLike,
  amount: number,
  unit: FuelUnit,
): { grams: number; macros: MacroVector } {
  const grams = normalizeAmountToGrams(amount, unit, {
    densityGPerMl: ingredient.densityGPerMl,
    servingSizeGrams: ingredient.servingSizeGrams,
    commonMeasures: ingredient.commonMeasures,
  });

  const basis = ingredient.nutritionBasis ?? "per_100g";
  const divisor = basis === "per_serving"
    ? ingredient.servingSizeGrams && ingredient.servingSizeGrams > 0
      ? ingredient.servingSizeGrams
      : 100
    : 100;

  const ratio = grams / divisor;
  return {
    grams,
    macros: {
      calories: ingredient.calories * ratio,
      protein: ingredient.protein * ratio,
      carbs: ingredient.carbs * ratio,
      fats: ingredient.fats * ratio,
      fiber: ingredient.fiber * ratio,
    },
  };
}

export function macrosFromDish(
  dish: DishLike,
  amount: number,
  unit: FuelUnit,
): { grams: number; macros: MacroVector } {
  const grams = normalizeAmountToGrams(amount, unit, {
    densityGPerMl: dish.densityGPerMl,
    servingSizeGrams: dish.defaultServingGrams,
    commonMeasures: dish.commonMeasures,
  });

  const ratio = grams / 100;
  return {
    grams,
    macros: {
      calories: dish.cachedNutritionPer100g.calories * ratio,
      protein: dish.cachedNutritionPer100g.protein * ratio,
      carbs: dish.cachedNutritionPer100g.carbs * ratio,
      fats: dish.cachedNutritionPer100g.fats * ratio,
      fiber: dish.cachedNutritionPer100g.fiber * ratio,
    },
  };
}

export function sumMacros(vectors: MacroVector[]): MacroVector {
  return vectors.reduce(
    (acc, current) => ({
      calories: acc.calories + current.calories,
      protein: acc.protein + current.protein,
      carbs: acc.carbs + current.carbs,
      fats: acc.fats + current.fats,
      fiber: acc.fiber + current.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
  );
}

export function per100g(macros: MacroVector, totalGrams: number): MacroVector {
  if (totalGrams <= 0) return { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
  const ratio = 100 / totalGrams;
  return {
    calories: round1(macros.calories * ratio),
    protein: round1(macros.protein * ratio),
    carbs: round1(macros.carbs * ratio),
    fats: round1(macros.fats * ratio),
    fiber: round1(macros.fiber * ratio),
  };
}

export function computeTdee(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "athlete";
  bodyFatPercent?: number;
}): { bmr: number; tdee: number; formula: "Mifflin-St Jeor" | "Katch-McArdle" } {
  const activityMap = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  } as const;

  let bmr: number;
  let formula: "Mifflin-St Jeor" | "Katch-McArdle" = "Mifflin-St Jeor";

  if (params.bodyFatPercent && params.bodyFatPercent > 0) {
    const leanMass = params.weightKg * (1 - params.bodyFatPercent / 100);
    bmr = 370 + 21.6 * leanMass;
    formula = "Katch-McArdle";
  } else {
    const sexOffset = params.gender === "male" ? 5 : -161;
    bmr = 10 * params.weightKg + 6.25 * params.heightCm - 5 * params.age + sexOffset;
  }

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(bmr * activityMap[params.activityLevel]),
    formula,
  };
}

export function deriveMacroTargets(params: {
  calories: number;
  weightKg: number;
  experienceLevel?: "beginner" | "intermediate" | "elite";
  goal?: "cut" | "maintain" | "bulk";
}): MacroVector {
  const experienceProtein = {
    beginner: 1.8,
    intermediate: 2.0,
    elite: 2.2,
  } as const;

  const goalFatFloor = {
    cut: 0.8,
    maintain: 0.9,
    bulk: 0.9,
  } as const;

  const proteinPerKg = experienceProtein[params.experienceLevel ?? "intermediate"];
  const fatPerKg = goalFatFloor[params.goal ?? "maintain"];

  const protein = Math.round(params.weightKg * proteinPerKg);
  const fats = Math.round(params.weightKg * fatPerKg);

  const usedCalories = protein * 4 + fats * 9;
  const carbs = Math.max(0, Math.round((params.calories - usedCalories) / 4));

  return {
    calories: Math.round(params.calories),
    protein,
    carbs,
    fats,
    fiber: params.goal === "cut" ? 32 : 28,
  };
}
