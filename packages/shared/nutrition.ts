/**
 * Shared Nutrition Logic for Hayl
 * 
 * Implements standard metabolic formulas with a hierarchical fallback strategy.
 * 1. Katch-McArdle (If Body Fat % is known) - Best for athletes.
 * 2. Mifflin-St Jeor (Default) - Best standard accuracy.
 */

export const ACTIVITIES = {
  sedentary: { label: "Sedentary (Office job)", multiplier: 1.2 },
  light: { label: "Light Activity (1-2 days/week)", multiplier: 1.375 },
  moderate: { label: "Moderate Activity (3-5 days/week)", multiplier: 1.55 },
  active: { label: "Active (6-7 days/week)", multiplier: 1.725 },
  athlete: { label: "Very Active (Physical job + training)", multiplier: 1.9 },
} as const;

export type ActivityLevel = keyof typeof ACTIVITIES;

export interface TDEEInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
  bodyFatPercent?: number; // Optional, triggers Katch-McArdle if present
}

export interface MacroSplit {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

export interface TDEEResult {
  tdee: number;
  bmr: number;
  formula: 'Mifflin-St Jeor' | 'Katch-McArdle';
  macros: {
    cut: MacroSplit;
    maintain: MacroSplit;
    bulk: MacroSplit;
  };
}

/**
 * Calculates BMR and TDEE using the best available formula.
 * Prioritizes Katch-McArdle if body fat is provided, otherwise falls back to Mifflin-St Jeor.
 */
export function calculateTDEE(input: TDEEInput): TDEEResult {
  let bmr = 0;
  let formula: TDEEResult['formula'] = 'Mifflin-St Jeor';

  if (input.bodyFatPercent !== undefined && input.bodyFatPercent > 0) {
    // Katch-McArdle Formula: BMR = 370 + (21.6 * LBM)
    const leanBodyMass = input.weightKg * (1 - (input.bodyFatPercent / 100));
    bmr = 370 + (21.6 * leanBodyMass);
    formula = 'Katch-McArdle';
  } else {
    // Mifflin-St Jeor Formula
    const s = input.gender === 'male' ? 5 : -161;
    bmr = (10 * input.weightKg) + (6.25 * input.heightCm) - (5 * input.age) + s;
  }

  const multiplier = ACTIVITIES[input.activityLevel].multiplier;
  const tdee = Math.round(bmr * multiplier);

  return {
    tdee,
    bmr: Math.round(bmr),
    formula,
    macros: {
      cut: calculateMacros(tdee - 500, input.weightKg),
      maintain: calculateMacros(tdee, input.weightKg),
      bulk: calculateMacros(tdee + 300, input.weightKg), // Mild/Lean bulk
    }
  };
}

/**
 * Calculate macro splits (Protein focused for aesthetics/strength)
 * - Protein: 2.2g per kg (approx 1g/lb) - High setting for muscle retention/growth
 * - Fats: 0.9g per kg - Healthy hormonal baseline
 * - Carbs: Remainder (Fuel for training)
 */
function calculateMacros(calories: number, weightKg: number): MacroSplit {
  // 1. Prioritize Protein
  const proteinGrams = Math.round(weightKg * 2.2); 
  const proteinCals = proteinGrams * 4;

  // 2. Set Fats
  const fatGrams = Math.round(weightKg * 0.9);
  const fatCals = fatGrams * 9;

  // 3. Fill with Carbs
  let remainingCals = calories - proteinCals - fatCals;
  
  // Safety floor
  if (remainingCals < 0) {
      remainingCals = 0;
      // In extreme deficits, we might verify if protein/fats are too high for the caloric target, 
      // but for this app's "Healthy" approach, we assume reasonable input.
  }

  const carbGrams = Math.round(remainingCals / 4);

  return {
    calories: Math.round(calories),
    protein: proteinGrams,
    fats: fatGrams,
    carbs: carbGrams
  };
}

/**
 * Addis Context Helpers
 */
export const LOCAL_UNITS = {
    "Tassa (Cup-ish)": 200, // g (estimated for grains)
    "Sinig (Cup)": 85,     // Coffee cup size, often used for spices/seeds
} as const;

export interface Ingredient {
  name: string;
  amharicName?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  category: "grain" | "legume" | "meat" | "vegetable" | "other";
  isLocal: boolean;
}

export const LOCAL_INGREDIENTS: Ingredient[] = [
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
];
