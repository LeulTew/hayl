import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Plus, Save, X } from "lucide-react";
import { Button } from "../ui/Button";
import { FoodSearch, type FoodItem } from "./FoodSearch";

type FoodUnit =
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

interface MealComponent {
  id: string;
  foodId: string;
  type: "base" | "topping" | "side";
  foodType: "ingredient" | "dish";
  name: string;
  amount: number;
  unit: FoodUnit;
  measures: Array<{ unit: FoodUnit; grams: number; label?: string }>;
  servingSizeGrams?: number;
  calories100g: number;
  protein100g: number;
  carbs100g: number;
  fats100g: number;
}

type MealHistoryItem = {
  components?: Array<{ type: "base" | "topping" | "side" }>;
  normalizedComponents?: Array<{ name?: string }>;
};

const UNIT_CONVERSIONS: Record<FoodUnit, number> = {
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

const UNIT_STEPS: Record<FoodUnit, number> = {
  grams: 10,
  kg: 0.05,
  ml: 25,
  cups: 0.25,
  tbsp: 0.5,
  tsp: 0.25,
  pieces: 0.5,
  rolls: 0.25,
  ladles: 0.5,
  slices: 0.5,
  patties: 0.5,
  bowls: 0.25,
  servings: 0.5,
};

function roundToStep(value: number, step: number): number {
  if (!Number.isFinite(value)) return step;
  return Number((Math.round(value / step) * step).toFixed(2));
}

function getDefaultAmount(foodName: string, unit: FoodUnit): number {
  if (unit === "grams") {
    if (/oil|kibbeh|spice|berbere|mitmita|salt|sugar|butter/i.test(foodName)) return 10;
    if (/tib|beef|lamb|kitfo|steak|chicken|fish/i.test(foodName)) return 150;
    if (/wat|stew|shiro|misir|gomen|lentil|vegetable/i.test(foodName)) return 120;
    return 100;
  }

  if (unit === "kg") return 0.1;
  if (unit === "ml") return 120;
  if (unit === "cups") return 0.5;
  return 1;
}

function formatAmount(value: number): string {
  if (value >= 10) return String(Math.round(value));
  return value.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function convertToGrams(component: MealComponent): number {
  const customMeasure = component.measures.find((measure) => measure.unit === component.unit);
  if (customMeasure) return component.amount * customMeasure.grams;

  if (component.unit === "servings" && component.servingSizeGrams && component.servingSizeGrams > 0) {
    return component.amount * component.servingSizeGrams;
  }

  return component.amount * UNIT_CONVERSIONS[component.unit];
}

function buildTopSuggestionsByType(meals: MealHistoryItem[] | undefined): Record<"base" | "topping" | "side", string[]> {
  const counts: Record<"base" | "topping" | "side", Record<string, number>> = {
    base: {},
    topping: {},
    side: {},
  };

  for (const meal of meals ?? []) {
    const components = meal.components ?? [];
    const normalized = meal.normalizedComponents ?? [];

    for (let i = 0; i < components.length; i++) {
      const type = components[i]?.type;
      const name = normalized[i]?.name;
      if (!type || !name) continue;
      counts[type][name] = (counts[type][name] ?? 0) + 1;
    }
  }

  return {
    base: Object.entries(counts.base).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name),
    topping: Object.entries(counts.topping).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name),
    side: Object.entries(counts.side).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name),
  };
}

export function MealBuilder() {
  const logMeal = useMutation(api.food.logMeal);
  const token = typeof window !== "undefined" ? localStorage.getItem("hayl-token") || "" : "";
  const mealsHistory = useQuery(
    api.food.listMeals,
    token ? { tokenIdentifier: token, limit: 20 } : "skip",
  ) as MealHistoryItem[] | undefined;

  const [mealName, setMealName] = useState("Lunch");
  const [components, setComponents] = useState<MealComponent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTargetType, setSearchTargetType] = useState<"base" | "topping" | "side">("base");
  const [isSideExpanded, setIsSideExpanded] = useState(false);

  const topSuggestionsByType = useMemo(() => buildTopSuggestionsByType(mealsHistory), [mealsHistory]);
  const hasComponents = components.length > 0;
  const baseCount = components.filter((item) => item.type === "base").length;
  const toppingCount = components.filter((item) => item.type === "topping").length;
  const sideCount = components.filter((item) => item.type === "side").length;

  const totals = useMemo(() => {
    return components.reduce(
      (acc, component) => {
        const grams = convertToGrams(component);
        const ratio = grams / 100;
        return {
          calories: acc.calories + component.calories100g * ratio,
          protein: acc.protein + component.protein100g * ratio,
          carbs: acc.carbs + component.carbs100g * ratio,
          fats: acc.fats + component.fats100g * ratio,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );
  }, [components]);

  const handleAddComponent = (foodItem: FoodItem) => {
    const preferredUnit = foodItem.measures?.[0]?.unit ?? (foodItem.servingSizeGrams ? "servings" : "grams");
    const initialAmount = getDefaultAmount(foodItem.name, preferredUnit);

    const nextComponent: MealComponent = {
      id: crypto.randomUUID(),
      foodId: foodItem._id,
      type: searchTargetType,
      foodType: foodItem.type,
      name: foodItem.name,
      amount: initialAmount,
      unit: preferredUnit,
      measures: foodItem.measures ?? [],
      servingSizeGrams: foodItem.servingSizeGrams,
      calories100g: foodItem.calories,
      protein100g: foodItem.protein,
      carbs100g: foodItem.carbs,
      fats100g: foodItem.fats,
    };

    setComponents((prev) => [...prev, nextComponent]);
    setIsSearching(false);
  };

  const handleUpdateAmount = (id: string, amount: number) => {
    setComponents((prev) =>
      prev.map((component) => {
        if (component.id !== id) return component;
        const step = UNIT_STEPS[component.unit];
        return {
          ...component,
          amount: Math.max(step, roundToStep(amount, step)),
        };
      }),
    );
  };

  const handleUpdateUnit = (id: string, unit: FoodUnit) => {
    setComponents((prev) =>
      prev.map((component) =>
        component.id === id
          ? {
              ...component,
              unit,
              amount: getDefaultAmount(component.name, unit),
            }
          : component,
      ),
    );
  };

  const handleRemoveComponent = (id: string) => {
    setComponents((prev) => prev.filter((component) => component.id !== id));
  };

  const handleSave = async () => {
    if (components.length === 0) return;

    const userToken = localStorage.getItem("hayl-token") || `guest_${Date.now()}`;
    if (!localStorage.getItem("hayl-token")) {
      localStorage.setItem("hayl-token", userToken);
    }

    await logMeal({
      tokenIdentifier: userToken,
      name: mealName,
      timestamp: Date.now(),
      components: components.map((component) => ({
        type: component.type,
        itemId: component.foodId as Id<"ingredients"> | Id<"dishes">,
        itemType: component.foodType,
        amount: component.amount,
        unit: component.unit,
      })),
    });

    setComponents([]);
    setIsSideExpanded(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-hayl-surface border border-hayl-border rounded-[2.5rem] p-8 relative overflow-hidden">
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <input
              value={mealName}
              onChange={(event) => setMealName(event.target.value)}
              className="bg-transparent text-4xl font-heading font-black italic uppercase tracking-tighter leading-none outline-none border-b border-transparent focus:border-hayl-text transition-all w-full md:w-auto"
            />
            <p className="text-xs font-sans font-bold text-hayl-muted uppercase tracking-[0.2em] mt-1">Composite Meal Builder</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-heading font-black italic leading-none">
              {Math.round(totals.calories)} <span className="text-sm not-italic text-hayl-muted opacity-50">KCAL</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 h-2 rounded-full overflow-hidden bg-hayl-bg/50 relative z-10">
          <div style={{ width: `${(totals.protein * 4 / (totals.calories || 1)) * 100}%` }} className="bg-hayl-accent" />
          <div style={{ width: `${(totals.carbs * 4 / (totals.calories || 1)) * 100}%` }} className="bg-hayl-text" />
          <div style={{ width: `${(totals.fats * 9 / (totals.calories || 1)) * 100}%` }} className="bg-hayl-muted" />
        </div>
        <div className="flex justify-between text-[10px] font-heading font-bold uppercase tracking-widest mt-2 text-hayl-muted relative z-10">
          <span>P: {Math.round(totals.protein)}g</span>
          <span>C: {Math.round(totals.carbs)}g</span>
          <span>F: {Math.round(totals.fats)}g</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className={`bg-hayl-bg border border-hayl-border rounded-3xl p-6 flex flex-col relative transition-all duration-500 ease-out ${hasComponents ? "min-h-85" : "min-h-30"}`}>
          <h3 className="font-heading font-bold uppercase italic text-xl mb-4 text-hayl-muted/50 text-center">Your Plate</h3>

          <div className={`flex-1 flex flex-col gap-2 p-4 relative transition-all duration-500 ${hasComponents ? "justify-end" : "justify-center"}`}>
            {!hasComponents ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-hayl-muted/40 font-heading font-bold uppercase tracking-widest text-xs text-center px-8 animate-in fade-in duration-300">
                <span>Plate Empty</span>
                <span className="mt-2 text-hayl-muted/30">Add base, layer, or side to start building</span>
              </div>
            ) : null}

            {[...components].sort((left) => (left.type === "base" ? -1 : 1)).map((component, index) => {
              const availableUnits: FoodUnit[] = Array.from(
                new Set<FoodUnit>([
                  ...component.measures.map((measure) => measure.unit),
                  "grams",
                  ...(component.servingSizeGrams ? (["servings"] as FoodUnit[]) : []),
                ]),
              );

              const selectedMeasure = component.measures.find((measure) => measure.unit === component.unit);
              const step = UNIT_STEPS[component.unit];

              return (
                <div
                  key={component.id}
                  className={`p-4 rounded-xl border flex justify-between items-center group relative overflow-hidden transition-all hover:scale-[1.02] ${
                    component.type === "base"
                      ? "bg-amber-100/10 border-amber-500/20 text-amber-500"
                      : "bg-hayl-surface border-hayl-border text-hayl-text"
                  }`}
                  style={{ zIndex: components.length - index }}
                >
                  <div>
                    <div className="font-heading font-bold uppercase italic">{component.name}</div>
                    <div className="text-[10px] font-mono opacity-60">
                      {formatAmount(component.amount)} {component.unit.toUpperCase()} ≈ {Math.round(convertToGrams(component))}g
                    </div>
                    <div className="mt-2">
                      <select
                        value={component.unit}
                        onChange={(event) => handleUpdateUnit(component.id, event.target.value as FoodUnit)}
                        className="bg-hayl-bg border border-hayl-border rounded px-2 py-1 text-[10px] font-mono uppercase"
                      >
                        {availableUnits.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                      {selectedMeasure?.label ? <p className="text-[10px] text-hayl-muted mt-1">{selectedMeasure.label}</p> : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {component.unit === "grams" ? (
                        <button
                          onClick={() => handleUpdateAmount(component.id, component.amount - 50)}
                          className="w-8 h-6 flex items-center justify-center rounded-full bg-hayl-muted/10 hover:bg-hayl-muted/20 text-[10px] text-hayl-muted"
                          title="-50g"
                        >
                          -50
                        </button>
                      ) : null}

                      <div className="flex items-center gap-2 bg-black/10 rounded-full px-2 py-1">
                        <button onClick={() => handleUpdateAmount(component.id, component.amount - step)} className="hover:text-white">
                          -
                        </button>
                        <input
                          type="number"
                          step={step}
                          min={step}
                          value={component.amount}
                          onChange={(event) => handleUpdateAmount(component.id, Number(event.target.value || 0))}
                          className="font-mono text-xs w-14 text-center bg-transparent outline-none"
                        />
                        <button onClick={() => handleUpdateAmount(component.id, component.amount + step)} className="hover:text-white">
                          +
                        </button>
                      </div>

                      {component.unit === "grams" ? (
                        <button
                          onClick={() => handleUpdateAmount(component.id, component.amount + 50)}
                          className="w-8 h-6 flex items-center justify-center rounded-full bg-hayl-muted/10 hover:bg-hayl-muted/20 text-[10px] text-hayl-muted"
                          title="+50g"
                        >
                          +50
                        </button>
                      ) : null}
                    </div>

                    <button
                      onClick={() => handleRemoveComponent(component.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {isSearching ? (
            <div className="bg-hayl-surface border border-hayl-border rounded-3xl p-6 h-full animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading font-bold uppercase italic text-lg">Add {searchTargetType}</h3>
                <button onClick={() => setIsSearching(false)}>
                  <X size={20} />
                </button>
              </div>
              <FoodSearch
                onSelect={handleAddComponent}
                context={searchTargetType}
                suggestions={topSuggestionsByType[searchTargetType]}
              />
            </div>
          ) : (
            <div className="grid gap-4 max-w-sm mx-auto w-full md:max-w-none">
              <Button
                variant="outline"
                className={`h-16 text-base justify-between px-6 border-dashed hover:border-solid hover:bg-hayl-surface hover:text-hayl-text group w-full ${baseCount > 0 ? "border-hayl-text/50 bg-hayl-surface/60" : ""}`}
                onClick={() => {
                  setSearchTargetType("base");
                  setIsSearching(true);
                }}
              >
                <span className="font-heading font-black italic uppercase">Add Base {baseCount > 0 ? `(${baseCount})` : ""}</span>
                <span className="text-xs font-sans font-bold text-hayl-muted opacity-50 group-hover:opacity-100 transition-opacity">INJERA, RICE, BREAD</span>
              </Button>

              <Button
                variant="outline"
                className={`h-16 text-base justify-between px-6 border-dashed hover:border-solid hover:bg-hayl-surface hover:text-hayl-text group w-full ${toppingCount > 0 ? "border-hayl-text/50 bg-hayl-surface/60" : ""}`}
                onClick={() => {
                  setSearchTargetType("topping");
                  setIsSearching(true);
                }}
              >
                <span className="font-heading font-black italic uppercase">Add Layer {toppingCount > 0 ? `(${toppingCount})` : ""}</span>
                <span className="text-xs font-sans font-bold text-hayl-muted opacity-50 group-hover:opacity-100 transition-opacity">WATS, TIB, VEG</span>
              </Button>

              <div className="space-y-2">
                {!isSideExpanded ? (
                  <Button
                    variant="ghost"
                    className={`w-full h-10 text-hayl-muted/60 hover:text-hayl-text hover:bg-hayl-surface border border-dashed ${sideCount > 0 ? "border-hayl-text/50 bg-hayl-surface/60" : "border-hayl-border"}`}
                    onClick={() => setIsSideExpanded(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> ADD SIDE? {sideCount > 0 ? `(${sideCount})` : ""}
                  </Button>
                ) : (
                  <div className="relative">
                    <Button
                      variant="outline"
                      className={`h-14 text-base justify-between px-6 border-dashed hover:border-solid hover:bg-hayl-surface hover:text-hayl-text group w-full ${sideCount > 0 ? "border-hayl-text/50 bg-hayl-surface/60" : ""}`}
                      onClick={() => {
                        setSearchTargetType("side");
                        setIsSearching(true);
                      }}
                    >
                      <span className="font-heading font-black italic uppercase">Add Side {sideCount > 0 ? `(${sideCount})` : ""}</span>
                      <span className="text-xs font-sans font-bold text-hayl-muted opacity-50 group-hover:opacity-100 transition-opacity">SALAD, FRUIT, SAUCE</span>
                    </Button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsSideExpanded(false);
                      }}
                      className="absolute -top-2 -right-2 bg-hayl-bg border border-hayl-border rounded-full p-1 text-hayl-muted hover:text-hayl-text z-20"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-hayl-border mt-2 w-full">
                <Button
                  className="w-full h-14 text-xl bg-hayl-text text-hayl-bg hover:bg-hayl-text/90 hover:text-hayl-bg active:scale-[0.98] transition-all"
                  disabled={components.length === 0}
                  onClick={handleSave}
                >
                  <Save className="mr-3" /> LOG MEAL
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
