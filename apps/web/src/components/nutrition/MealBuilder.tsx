import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Save, X } from "lucide-react";
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

  // Per 100g view for preview math
  calories100g: number;
  protein100g: number;
  carbs100g: number;
  fats100g: number;
}

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

function convertToGrams(component: MealComponent): number {
  const customMeasure = component.measures.find((measure) => measure.unit === component.unit);
  if (customMeasure) {
    return component.amount * customMeasure.grams;
  }

  if (component.unit === "servings" && component.servingSizeGrams && component.servingSizeGrams > 0) {
    return component.amount * component.servingSizeGrams;
  }

  return component.amount * UNIT_CONVERSIONS[component.unit];
}

export function MealBuilder() {
  const logMeal = useMutation(api.food.logMeal);
  const [mealName, setMealName] = useState("Lunch");
  const [components, setComponents] = useState<MealComponent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTargetType, setSearchTargetType] = useState<"base" | "topping" | "side">("base");

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
    const preferredUnit = foodItem.measures?.[0]?.unit
      ?? (foodItem.servingSizeGrams ? "servings" : "grams");

    const nextComponent: MealComponent = {
      id: crypto.randomUUID(),
      foodId: foodItem._id,
      type: searchTargetType,
      foodType: foodItem.type,
      name: foodItem.name,
      amount: 1,
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
      prev.map((component) =>
        component.id === id ? { ...component, amount: Math.max(0.1, amount) } : component,
      ),
    );
  };

  const handleUpdateUnit = (id: string, unit: FoodUnit) => {
    setComponents((prev) =>
      prev.map((component) => (component.id === id ? { ...component, unit } : component)),
    );
  };

  const handleRemoveComponent = (id: string) => {
    setComponents((prev) => prev.filter((component) => component.id !== id));
  };

  const handleSave = async () => {
    if (components.length === 0) return;

    const token = localStorage.getItem("hayl-token") || `guest_${Date.now()}`;
    if (!localStorage.getItem("hayl-token")) {
      localStorage.setItem("hayl-token", token);
    }

    await logMeal({
      tokenIdentifier: token,
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
            <p className="text-xs font-sans font-bold text-hayl-muted uppercase tracking-[0.2em] mt-1">
              Composite Meal Builder
            </p>
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
        <div className="bg-hayl-bg border border-hayl-border rounded-3xl p-6 min-h-100 flex flex-col relative">
          <h3 className="font-heading font-bold uppercase italic text-xl mb-4 text-hayl-muted/50 text-center">Your Plate</h3>

          <div className="flex-1 flex flex-col justify-end gap-2 p-4 relative">
            {components.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-hayl-muted/20 font-heading font-bold uppercase tracking-widest text-sm">
                Empty Plate
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
                      {component.amount} {component.unit.toUpperCase()} ≈ {Math.round(convertToGrams(component))}g
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
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-black/10 rounded-full px-2 py-1">
                      <button onClick={() => handleUpdateAmount(component.id, component.amount - 0.25)} className="hover:text-white">-</button>
                      <span className="font-mono text-xs w-8 text-center">{component.amount.toFixed(2)}</span>
                      <button onClick={() => handleUpdateAmount(component.id, component.amount + 0.25)} className="hover:text-white">+</button>
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
                <button onClick={() => setIsSearching(false)}><X size={20} /></button>
              </div>
              <FoodSearch onSelect={handleAddComponent} />
            </div>
          ) : (
            <div className="grid gap-4">
              <Button
                variant="outline"
                className="h-24 text-xl justify-between px-8 border-dashed hover:border-solid hover:bg-hayl-surface group"
                onClick={() => {
                  setSearchTargetType("base");
                  setIsSearching(true);
                }}
              >
                <span className="font-heading font-black italic uppercase">Add Base</span>
                <span className="text-xs font-sans font-bold text-hayl-muted opacity-50 group-hover:opacity-100 transition-opacity">INJERA, RICE, BREAD</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 text-xl justify-between px-8 border-dashed hover:border-solid hover:bg-hayl-surface group"
                onClick={() => {
                  setSearchTargetType("topping");
                  setIsSearching(true);
                }}
              >
                <span className="font-heading font-black italic uppercase">Add Layer</span>
                <span className="text-xs font-sans font-bold text-hayl-muted opacity-50 group-hover:opacity-100 transition-opacity">WATS, TIB, VEG</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 text-xl justify-between px-8 border-dashed hover:border-solid hover:bg-hayl-surface group"
                onClick={() => {
                  setSearchTargetType("side");
                  setIsSearching(true);
                }}
              >
                <span className="font-heading font-black italic uppercase">Add Side</span>
                <span className="text-xs font-sans font-bold text-hayl-muted opacity-50 group-hover:opacity-100 transition-opacity">SALAD, FRUIT, SAUCE</span>
              </Button>

              <div className="pt-8 border-t border-hayl-border mt-4">
                <Button className="w-full h-16 text-2xl" disabled={components.length === 0} onClick={handleSave}>
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
