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
  nutritionBasis?: 'per_100g' | 'per_serving';
  servingSizeGrams?: number;
  servingLabel?: string;
  densityGPerMl?: number;
  commonMeasures?: Array<{
    unit:
      | 'grams'
      | 'kg'
      | 'ml'
      | 'cups'
      | 'tbsp'
      | 'tsp'
      | 'pieces'
      | 'rolls'
      | 'ladles'
      | 'slices'
      | 'patties'
      | 'bowls'
      | 'servings';
    grams: number;
    label?: string;
  }>;
  category: "grain" | "legume" | "meat" | "vegetable" | "other";
  isLocal: boolean;
  localeTags?: string[];
  sourceRefs?: string[];
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
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'cups', grams: 130, label: '1 cup flour' }],
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
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'rolls', grams: 150, label: '1 qurt (quarter injera)' }],
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
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'rolls', grams: 150, label: '1 qurt (quarter injera)' }],
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
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 180, label: '1 ladle cooked' }],
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
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 200, label: '1 ladle stew' }],
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
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'pieces', grams: 120, label: '1 serving spooned' }],
    category: "meat",
    isLocal: true,
  },
  {
    name: "Misir Wat",
    calories: 142,
    protein: 8.9,
    carbs: 20.3,
    fats: 3.4,
    fiber: 7.1,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 180, label: '1 ladle stew' }],
    category: "legume",
    isLocal: true,
  },
  {
    name: "Gomen (Collard Greens)",
    calories: 58,
    protein: 3.7,
    carbs: 8.4,
    fats: 1.5,
    fiber: 4.2,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 140, label: '1 ladle cooked greens' }],
    category: "vegetable",
    isLocal: true,
  },
  {
    name: "Ayib (Cottage Cheese)",
    calories: 103,
    protein: 11.1,
    carbs: 3.4,
    fats: 4.6,
    fiber: 0,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'servings', grams: 80, label: 'small side serving' }],
    category: "other",
    isLocal: true,
  },
  {
    name: "Chicken Breast (Raw)",
    calories: 120,
    protein: 23,
    carbs: 0,
    fats: 2.5,
    fiber: 0,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'pieces', grams: 170, label: '1 breast' }],
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
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'cups', grams: 160, label: '1 cup cooked' }],
    category: "grain",
    isLocal: false
  },
  {
    name: "Egg (Whole)",
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fats: 4.8,
    fiber: 0,
    nutritionBasis: 'per_serving',
    servingSizeGrams: 50,
    servingLabel: '1 large egg',
    commonMeasures: [{ unit: 'pieces', grams: 50, label: '1 egg' }],
    category: "other",
    isLocal: false,
  },
  {
    name: "Greek Yogurt (Plain)",
    calories: 59,
    protein: 10.3,
    carbs: 3.6,
    fats: 0.4,
    fiber: 0,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'cups', grams: 245, label: '1 cup' }],
    category: "other",
    isLocal: false,
  },
  {
    name: "Oats (Dry)",
    calories: 389,
    protein: 16.9,
    carbs: 66.3,
    fats: 6.9,
    fiber: 10.6,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'cups', grams: 80, label: '1 cup dry' }],
    category: "grain",
    isLocal: false,
  },
  {
    name: "Banana",
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fats: 0.3,
    fiber: 2.6,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'pieces', grams: 118, label: '1 medium banana' }],
    category: "other",
    isLocal: false,
  },
  {
    name: "Avocado",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fats: 14.7,
    fiber: 6.7,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'pieces', grams: 150, label: '1 medium avocado' }],
    category: "other",
    isLocal: false,
  },
  {
    name: "Olive Oil",
    calories: 884,
    protein: 0,
    carbs: 0,
    fats: 100,
    fiber: 0,
    nutritionBasis: 'per_100g',
    densityGPerMl: 0.91,
    commonMeasures: [{ unit: 'tbsp', grams: 13.6, label: '1 tablespoon' }],
    category: "other",
    isLocal: false,
  },
  {
    name: "Tomato Pasta Sauce",
    calories: 60,
    protein: 1.6,
    carbs: 11,
    fats: 1.2,
    fiber: 2.1,
    nutritionBasis: 'per_100g',
    densityGPerMl: 1.04,
    commonMeasures: [{ unit: 'cups', grams: 245, label: '1 cup sauce' }],
    category: "vegetable",
    isLocal: false,
  },
  {
    name: "Ground Beef Patty (90/10)",
    calories: 217,
    protein: 26,
    carbs: 0,
    fats: 12,
    fiber: 0,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'patties', grams: 113, label: '1 patty (4oz)' }],
    category: "meat",
    isLocal: false,
  },
  {
    name: "Mozzarella Cheese",
    calories: 280,
    protein: 28,
    carbs: 3.1,
    fats: 17,
    fiber: 0,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'slices', grams: 21, label: '1 slice' }],
    category: "other",
    isLocal: false,
  },
  {
    name: "Nifro (Boiled Wheat)",
    calories: 133,
    protein: 4.5,
    carbs: 28.1,
    fats: 0.6,
    fiber: 4.3,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'cups', grams: 170, label: '1 cup cooked' }],
    category: "grain",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["USDA FDC boiled wheat equivalent", "FAO INFOODS Africa index (updated 2022)"]
  },
  {
    name: "Kinche (Cracked Wheat Porridge)",
    calories: 118,
    protein: 3.9,
    carbs: 24.2,
    fats: 0.7,
    fiber: 3.6,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'bowls', grams: 240, label: '1 bowl' }],
    category: "grain",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["USDA cracked wheat cooked equivalent", "FAO INFOODS Africa index (updated 2022)"]
  },
  {
    name: "Genfo (Barley Porridge)",
    calories: 123,
    protein: 3.5,
    carbs: 25.7,
    fats: 0.8,
    fiber: 3.9,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'bowls', grams: 250, label: '1 bowl' }],
    category: "grain",
    isLocal: true,
    localeTags: ["ethiopian"],
    sourceRefs: ["USDA barley porridge equivalent", "FAO INFOODS Africa index (updated 2022)"]
  },
  {
    name: "Firfir (Injera with Berbere, fasting)",
    calories: 170,
    protein: 4.9,
    carbs: 31.5,
    fats: 3.4,
    fiber: 2.9,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'bowls', grams: 220, label: '1 medium bowl' }],
    category: "grain",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["Recipe-derived from injera and oil composition", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Chechebsa (Kita Firfir)",
    calories: 286,
    protein: 7.4,
    carbs: 42.7,
    fats: 9.2,
    fiber: 2.8,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'bowls', grams: 210, label: '1 plate' }],
    category: "grain",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["Recipe-derived from wheat flatbread and niter kibbeh equivalents", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Ambasha Bread",
    calories: 289,
    protein: 8.4,
    carbs: 55.1,
    fats: 3.7,
    fiber: 2.4,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'slices', grams: 35, label: '1 slice' }],
    category: "grain",
    isLocal: true,
    localeTags: ["ethiopian"],
    sourceRefs: ["USDA enriched bread equivalent", "FAO food composition methodology"]
  },
  {
    name: "Kolo (Roasted Barley Snack)",
    calories: 358,
    protein: 11.5,
    carbs: 71.4,
    fats: 2.2,
    fiber: 12.1,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'cups', grams: 65, label: '1 cup roasted mix' }],
    category: "grain",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["USDA roasted barley equivalent", "FAO INFOODS Africa index (updated 2022)"]
  },
  {
    name: "Boiled Lentils",
    calories: 116,
    protein: 9.0,
    carbs: 20.1,
    fats: 0.4,
    fiber: 7.9,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'cups', grams: 198, label: '1 cup cooked' }],
    category: "legume",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["USDA FDC lentils cooked"]
  },
  {
    name: "Kik Alicha (Split Pea Stew)",
    calories: 142,
    protein: 8.4,
    carbs: 22.6,
    fats: 2.6,
    fiber: 7.2,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 185, label: '1 ladle stew' }],
    category: "legume",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["Recipe-derived from split peas and onion/oil", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Azifa (Lentil Salad)",
    calories: 139,
    protein: 8.5,
    carbs: 21.7,
    fats: 2.7,
    fiber: 8.0,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'servings', grams: 150, label: '1 side serving' }],
    category: "legume",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["USDA cooked lentil salad equivalent"]
  },
  {
    name: "Fosolia (Green Bean and Carrot Stew)",
    calories: 92,
    protein: 2.6,
    carbs: 11.2,
    fats: 4.3,
    fiber: 3.9,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 170, label: '1 ladle' }],
    category: "vegetable",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["Recipe-derived from cooked green beans/carrots with oil", "USDA FDC equivalents"]
  },
  {
    name: "Atkilt Wat (Cabbage Potato Carrot)",
    calories: 83,
    protein: 2.1,
    carbs: 13.6,
    fats: 2.6,
    fiber: 3.4,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 180, label: '1 ladle' }],
    category: "vegetable",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["Recipe-derived from boiled vegetables with oil", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Tikil Gomen",
    calories: 72,
    protein: 2.3,
    carbs: 10.7,
    fats: 2.5,
    fiber: 3.2,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 170, label: '1 ladle' }],
    category: "vegetable",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["USDA cabbage and carrot cooked equivalents"]
  },
  {
    name: "Dinich Wat (Potato Stew)",
    calories: 97,
    protein: 2.0,
    carbs: 15.9,
    fats: 3.3,
    fiber: 2.5,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 185, label: '1 ladle' }],
    category: "vegetable",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["USDA potato stew equivalent"]
  },
  {
    name: "Suf Fitfit (Roasted Flax Mix)",
    calories: 442,
    protein: 15.8,
    carbs: 24.3,
    fats: 32.1,
    fiber: 20.8,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'tbsp', grams: 10, label: '1 tbsp topping' }],
    category: "other",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["USDA flaxseed and spice equivalents"]
  },
  {
    name: "Roasted Chickpeas",
    calories: 364,
    protein: 19.3,
    carbs: 60.7,
    fats: 6.0,
    fiber: 17.4,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'cups', grams: 60, label: '1 cup roasted' }],
    category: "legume",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["USDA dry roasted chickpeas equivalent"]
  },
  {
    name: "Ful (Fava Bean Stew)",
    calories: 122,
    protein: 7.8,
    carbs: 18.9,
    fats: 2.3,
    fiber: 7.4,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'bowls', grams: 230, label: '1 bowl' }],
    category: "legume",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["USDA cooked fava bean equivalents"]
  },
  {
    name: "Bula (Enset Porridge)",
    calories: 109,
    protein: 1.3,
    carbs: 25.1,
    fats: 0.4,
    fiber: 1.2,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'bowls', grams: 250, label: '1 bowl' }],
    category: "grain",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["Regional enset composition references", "FAO INFOODS Africa index (updated 2022)"]
  },
  {
    name: "Kocho (Enset Bread)",
    calories: 172,
    protein: 2.1,
    carbs: 39.4,
    fats: 0.8,
    fiber: 2.5,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'pieces', grams: 120, label: '1 wedge' }],
    category: "grain",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["Regional enset composition references", "FAO INFOODS Africa index (updated 2022)"]
  },
  {
    name: "Kitfo (Lean, Light Butter)",
    calories: 247,
    protein: 24.8,
    carbs: 1.1,
    fats: 16.2,
    fiber: 0,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'servings', grams: 140, label: '1 serving' }],
    category: "meat",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["USDA raw lean beef + clarified butter weighted estimate"]
  },
  {
    name: "Gored Gored",
    calories: 206,
    protein: 26.4,
    carbs: 0,
    fats: 10.7,
    fiber: 0,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'servings', grams: 130, label: '1 serving' }],
    category: "meat",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["USDA lean beef cubes equivalent"]
  },
  {
    name: "Dulet",
    calories: 221,
    protein: 19.4,
    carbs: 4.5,
    fats: 13.2,
    fiber: 0.8,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'servings', grams: 120, label: '1 serving' }],
    category: "meat",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["USDA mixed organ and lean meat composition equivalents"]
  },
  {
    name: "Sega Wat (Beef Stew)",
    calories: 182,
    protein: 17.1,
    carbs: 6.9,
    fats: 9.8,
    fiber: 1.3,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 190, label: '1 ladle' }],
    category: "meat",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["Recipe-derived from beef, onion, berbere, oil", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Alicha Sega Wat",
    calories: 171,
    protein: 16.3,
    carbs: 5.6,
    fats: 9.3,
    fiber: 0.9,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 190, label: '1 ladle' }],
    category: "meat",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["Recipe-derived mild beef stew", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Minchet Abish (Ground Beef Stew)",
    calories: 198,
    protein: 17.7,
    carbs: 4.4,
    fats: 12.4,
    fiber: 0.8,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 185, label: '1 ladle' }],
    category: "meat",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["USDA ground beef cooked and spiced stew equivalent"]
  },
  {
    name: "Key Wat (Hot Beef Stew)",
    calories: 188,
    protein: 17.5,
    carbs: 7.1,
    fats: 10.0,
    fiber: 1.2,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 190, label: '1 ladle' }],
    category: "meat",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["Recipe-derived spicy beef stew", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Gomen Besiga",
    calories: 118,
    protein: 8.6,
    carbs: 5.9,
    fats: 6.3,
    fiber: 2.7,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 170, label: '1 ladle' }],
    category: "meat",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["Recipe-derived greens with beef mix", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Derek Tibs",
    calories: 239,
    protein: 24.2,
    carbs: 1.5,
    fats: 15.2,
    fiber: 0.2,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'pieces', grams: 140, label: '1 serving plate' }],
    category: "meat",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["USDA pan-fried beef with added fat equivalent"]
  },
  {
    name: "Fish Tibs",
    calories: 165,
    protein: 22.9,
    carbs: 2.3,
    fats: 6.8,
    fiber: 0.3,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'pieces', grams: 150, label: '1 serving' }],
    category: "meat",
    isLocal: true,
    localeTags: ["ethiopian", "fasting", "non-fasting"],
    sourceRefs: ["USDA tilapia cooked with oil/spices equivalent"]
  },
  {
    name: "Bozena Shiro",
    calories: 205,
    protein: 13.6,
    carbs: 16.2,
    fats: 9.1,
    fiber: 5.2,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 190, label: '1 ladle' }],
    category: "meat",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["Recipe-derived shiro and beef blend", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Tibs Firfir",
    calories: 214,
    protein: 13.8,
    carbs: 20.7,
    fats: 8.6,
    fiber: 2.1,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'bowls', grams: 230, label: '1 bowl' }],
    category: "meat",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["Recipe-derived injera and beef tibs composition", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Doro Wat (With Egg)",
    calories: 175,
    protein: 12.8,
    carbs: 6.2,
    fats: 11.1,
    fiber: 1.0,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 220, label: '1 serving ladle' }],
    category: "meat",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["USDA chicken stew + egg weighted estimate"]
  },
  {
    name: "Boiled Egg",
    calories: 155,
    protein: 12.6,
    carbs: 1.1,
    fats: 10.6,
    fiber: 0,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'pieces', grams: 50, label: '1 large egg' }],
    category: "other",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["USDA FDC boiled egg"]
  },
  {
    name: "Niter Kibbeh",
    calories: 884,
    protein: 0,
    carbs: 0,
    fats: 100,
    fiber: 0,
    nutritionBasis: 'per_100g',
    densityGPerMl: 0.91,
    commonMeasures: [{ unit: 'tbsp', grams: 13, label: '1 tbsp' }],
    category: "other",
    isLocal: true,
    localeTags: ["ethiopian", "non-fasting"],
    sourceRefs: ["USDA clarified butter equivalent"]
  },
  {
    name: "Berbere Spice Blend",
    calories: 282,
    protein: 12.4,
    carbs: 50.1,
    fats: 6.3,
    fiber: 31.2,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'tbsp', grams: 7, label: '1 tbsp' }],
    category: "other",
    isLocal: true,
    localeTags: ["ethiopian", "fasting", "non-fasting"],
    sourceRefs: ["USDA dry spice blend equivalent"]
  },
  {
    name: "Mitmita Spice Blend",
    calories: 318,
    protein: 13.7,
    carbs: 56.9,
    fats: 8.1,
    fiber: 28.6,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'tsp', grams: 2.3, label: '1 tsp' }],
    category: "other",
    isLocal: true,
    localeTags: ["ethiopian", "fasting", "non-fasting"],
    sourceRefs: ["USDA dry chili spice equivalent"]
  },
  {
    name: "Roasted Peanuts",
    calories: 585,
    protein: 24.4,
    carbs: 21.5,
    fats: 49.7,
    fiber: 8.4,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'servings', grams: 28, label: '1 oz handful' }],
    category: "other",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["USDA dry roasted peanuts"]
  },
  {
    name: "Sesame Seeds",
    calories: 573,
    protein: 17.7,
    carbs: 23.4,
    fats: 49.7,
    fiber: 11.8,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'tbsp', grams: 9, label: '1 tbsp' }],
    category: "other",
    isLocal: true,
    localeTags: ["ethiopian", "fasting", "non-fasting"],
    sourceRefs: ["USDA sesame seed reference"]
  },
  {
    name: "Shimbra Asa (Chickpea Dumplings in Sauce)",
    calories: 168,
    protein: 7.9,
    carbs: 24.8,
    fats: 4.7,
    fiber: 5.8,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 180, label: '1 ladle' }],
    category: "legume",
    isLocal: true,
    localeTags: ["ethiopian", "fasting"],
    sourceRefs: ["Recipe-derived chickpea and sauce estimate", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Bolognese Sauce",
    calories: 118,
    protein: 6.8,
    carbs: 8.3,
    fats: 6.2,
    fiber: 1.7,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'cups', grams: 240, label: '1 cup sauce' }],
    category: "meat",
    isLocal: false,
    localeTags: ["global", "layer"],
    sourceRefs: ["USDA meat sauce equivalent"]
  },
  {
    name: "Alfredo Sauce",
    calories: 153,
    protein: 3.6,
    carbs: 6.8,
    fats: 12.1,
    fiber: 0.4,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'cups', grams: 240, label: '1 cup sauce' }],
    category: "other",
    isLocal: false,
    localeTags: ["global", "layer"],
    sourceRefs: ["USDA cream sauce equivalent"]
  },
  {
    name: "Arrabbiata Sauce",
    calories: 71,
    protein: 1.9,
    carbs: 11.2,
    fats: 2.1,
    fiber: 2.4,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'cups', grams: 245, label: '1 cup sauce' }],
    category: "vegetable",
    isLocal: false,
    localeTags: ["global", "layer"],
    sourceRefs: ["USDA spicy tomato sauce equivalent"]
  },
  {
    name: "Pesto Sauce",
    calories: 294,
    protein: 4.4,
    carbs: 6.6,
    fats: 28.2,
    fiber: 1.6,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'tbsp', grams: 16, label: '1 tbsp sauce' }],
    category: "other",
    isLocal: false,
    localeTags: ["global", "layer"],
    sourceRefs: ["USDA pesto equivalent"]
  },
  {
    name: "Kik Wat (Spicy Split Pea)",
    calories: 151,
    protein: 8.7,
    carbs: 23.1,
    fats: 2.8,
    fiber: 7.6,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 185, label: '1 ladle stew' }],
    category: "legume",
    isLocal: true,
    localeTags: ["ethiopian", "fasting", "layer"],
    sourceRefs: ["Recipe-derived split pea berbere stew", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Alicha Kik Wat",
    calories: 138,
    protein: 8.1,
    carbs: 21.9,
    fats: 2.3,
    fiber: 7.2,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 185, label: '1 ladle stew' }],
    category: "legume",
    isLocal: true,
    localeTags: ["ethiopian", "fasting", "layer"],
    sourceRefs: ["Recipe-derived mild split pea stew", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Duba Wat (Pumpkin Stew)",
    calories: 89,
    protein: 2.1,
    carbs: 12.4,
    fats: 3.4,
    fiber: 3.1,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 180, label: '1 ladle stew' }],
    category: "vegetable",
    isLocal: true,
    localeTags: ["ethiopian", "fasting", "layer"],
    sourceRefs: ["Recipe-derived pumpkin stew", "USDA FDC ingredient equivalents"]
  },
  {
    name: "Dinish Alicha (Mild Potato Stew)",
    calories: 94,
    protein: 2.0,
    carbs: 15.3,
    fats: 2.9,
    fiber: 2.4,
    nutritionBasis: 'per_100g',
    commonMeasures: [{ unit: 'ladles', grams: 185, label: '1 ladle stew' }],
    category: "vegetable",
    isLocal: true,
    localeTags: ["ethiopian", "fasting", "layer"],
    sourceRefs: ["Recipe-derived mild potato stew", "USDA FDC ingredient equivalents"]
  }
];
