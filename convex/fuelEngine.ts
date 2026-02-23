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

/** Canonical list of supported fuel measurement units. */
export const FUEL_UNITS = [
  "grams", "kg", "ml", "cups", "tbsp", "tsp",
  "pieces", "rolls", "ladles", "slices", "patties", "bowls", "servings",
] as const;

/**
 * Derives recommended daily macronutrient targets based on calorie budget,
 * body weight, training experience, and goal phase.
 *
 * @param params.calories - Daily calorie target (kcal).
 * @param params.weightKg - Current body weight in kg.
 * @param params.experienceLevel - Training experience tier.
 * @param params.goal - Current nutrition phase (cut/maintain/bulk).
 * @returns A MacroVector with gram targets for each macronutrient.
 */
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

// ---------- ADAPTIVE HOOKS (Phase 4B) ----------

/**
 * Compares average recent daily calorie intake against a TDEE target
 * and suggests an adjustment direction.
 *
 * @param recentDailyTotals - Array of daily calorie totals (most recent first).
 * @param tdee - The user's target daily energy expenditure.
 * @returns An object with the average intake, the delta from TDEE,
 *          and a suggested action ("increase" | "decrease" | "maintain").
 */
export function suggestCalorieAdjustment(
  recentDailyTotals: number[],
  tdee: number,
): { averageIntake: number; delta: number; suggestion: "increase" | "decrease" | "maintain" } {
  if (recentDailyTotals.length === 0 || tdee <= 0) {
    return { averageIntake: 0, delta: 0, suggestion: "maintain" };
  }

  const sum = recentDailyTotals.reduce((a, b) => a + b, 0);
  const averageIntake = round1(sum / recentDailyTotals.length);
  const delta = round1(averageIntake - tdee);

  // ±10% tolerance band before suggesting changes
  const threshold = tdee * 0.1;

  let suggestion: "increase" | "decrease" | "maintain";
  if (delta > threshold) {
    suggestion = "decrease";
  } else if (delta < -threshold) {
    suggestion = "increase";
  } else {
    suggestion = "maintain";
  }

  return { averageIntake, delta, suggestion };
}

/**
 * Computes an adherence score (0–100) based on how closely recent
 * meal totals match a set of macro targets.
 *
 * Each macro (calories, protein, carbs, fats) is scored individually
 * as `100 - |actual - target| / target * 100`, clamped to [0, 100].
 * The final score is the average of all four macro scores.
 *
 * @param recentTotals - Array of daily macro snapshots.
 * @param target - The target MacroVector (from deriveMacroTargets).
 * @returns A score from 0 to 100 (higher is better), or 0 if no data.
 */
export function assessAdherence(
  recentTotals: MacroVector[],
  target: MacroVector,
): number {
  if (recentTotals.length === 0) return 0;

  const totals = sumMacros(recentTotals);
  const count = recentTotals.length;
  const avg: MacroVector = {
    calories: totals.calories / count,
    protein: totals.protein / count,
    carbs: totals.carbs / count,
    fats: totals.fats / count,
    fiber: totals.fiber / count,
  };

  const keys: (keyof MacroVector)[] = ["calories", "protein", "carbs", "fats"];
  const scores = keys.map((key) => {
    const t = target[key];
    if (t <= 0) return 100;
    const deviation = Math.abs(avg[key] - t) / t;
    return clamp(100 - deviation * 100, 0, 100);
  });

  return round1(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export type ProgressClassification =
  | "insufficient_data"
  | "muscle_gain_likely"
  | "fat_gain_likely"
  | "mixed_gain"
  | "fat_loss_likely"
  | "muscle_loss_risk"
  | "stable";

export function classifyWeightProgress(params: {
  goal: "cut" | "maintain" | "bulk";
  weightDeltaKg: number;
  daysBetweenLogs: number;
  calorieDeltaFromTdee: number;
  proteinAdequacyRatio: number;
}): {
  classification: ProgressClassification;
  weeklyRateKg: number;
  confidence: number;
  summary: string;
} {
  if (!Number.isFinite(params.daysBetweenLogs) || params.daysBetweenLogs < 5) {
    return {
      classification: "insufficient_data",
      weeklyRateKg: 0,
      confidence: 20,
      summary: "Need at least ~1 week between logs for a reliable signal.",
    };
  }

  const weeklyRateKg = round1(params.weightDeltaKg / (params.daysBetweenLogs / 7));
  const absWeeklyRate = Math.abs(weeklyRateKg);
  const calorieDelta = params.calorieDeltaFromTdee;
  const proteinRatio = params.proteinAdequacyRatio;

  // Small movements are mostly noise from hydration, glycogen, and sodium changes.
  if (absWeeklyRate < 0.15) {
    return {
      classification: "stable",
      weeklyRateKg,
      confidence: 70,
      summary: "Weight trend is stable. Keep current plan and monitor weekly.",
    };
  }

  if (weeklyRateKg > 0) {
    if (calorieDelta >= 250 && proteinRatio < 0.9) {
      return {
        classification: "fat_gain_likely",
        weeklyRateKg,
        confidence: 82,
        summary: "Gain trend likely includes excess fat. Reduce surplus and increase protein quality.",
      };
    }

    if (calorieDelta >= 50 && calorieDelta <= 320 && proteinRatio >= 1) {
      return {
        classification: "muscle_gain_likely",
        weeklyRateKg,
        confidence: 78,
        summary: "Gain trend aligns with lean mass accumulation.",
      };
    }

    return {
      classification: "mixed_gain",
      weeklyRateKg,
      confidence: 62,
      summary: "Weight is increasing with mixed composition. Tune calories and protein for cleaner gain.",
    };
  }

  if (calorieDelta <= -250 && proteinRatio >= 0.95) {
    return {
      classification: "fat_loss_likely",
      weeklyRateKg,
      confidence: params.goal === "cut" ? 84 : 72,
      summary: "Loss trend is likely fat-dominant. Keep lifting performance stable.",
    };
  }

  if (proteinRatio < 0.85 || calorieDelta <= -700) {
    return {
      classification: "muscle_loss_risk",
      weeklyRateKg,
      confidence: 80,
      summary: "Loss pace is aggressive for recovery capacity. Raise protein and reduce deficit.",
    };
  }

  return {
    classification: "fat_loss_likely",
    weeklyRateKg,
    confidence: 60,
    summary: "Loss trend is present but signal confidence is moderate.",
  };
}

