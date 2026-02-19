import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Search, Plus } from "lucide-react";

export interface FoodItem {
  _id: string;
  type: "ingredient" | "dish";
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  servingSizeGrams?: number;
  measures?: Array<{
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
  description?: string;
}

interface FoodSearchProps {
  onSelect: (item: FoodItem) => void;
}

export function FoodSearch({ onSelect }: FoodSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // We only enable the query if there's a search term
  const results = useQuery(api.food.searchFoods, { query: debouncedSearchTerm });

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-hayl-muted w-5 h-5 opacity-50" />
        <input
          type="text"
          placeholder="SEARCH WATS, INGREDIENTS..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-hayl-surface border border-hayl-border rounded-xl pl-12 pr-4 py-4 font-heading font-bold uppercase text-lg focus:border-hayl-text outline-none transition-all placeholder:text-hayl-muted/30"
        />
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
        {!debouncedSearchTerm && (
            <div className="text-center py-4 text-hayl-muted/40 text-xs font-heading font-bold uppercase tracking-widest">
                START TYPING TO SEARCH
            </div>
        )}
        
        {debouncedSearchTerm && !results && (
             <div className="text-center py-4 text-hayl-muted/40 text-xs font-heading font-bold uppercase tracking-widest animate-pulse">
                SCANNING DATABASE...
            </div>
        )}

        {results?.map((item: FoodItem) => (
          <button
            key={item._id}
            onClick={() => onSelect(item)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-hayl-surface border border-transparent hover:border-hayl-border transition-all group text-left"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold uppercase italic text-sm">{item.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-bold ${
                    item.type === 'dish' 
                        ? 'bg-hayl-accent/10 text-hayl-accent border-hayl-accent/20' 
                        : 'bg-hayl-muted/10 text-hayl-muted border-hayl-muted/20'
                }`}>
                    {item.type}
                </span>
              </div>
              <div className="text-[10px] text-hayl-muted font-mono mt-1">
                {item.calories} KCAL / 100G • P:{item.protein} C:{item.carbs} F:{item.fats}
              </div>
              {item.description ? (
                <div className="text-[10px] text-hayl-muted/70 mt-1 line-clamp-1">{item.description}</div>
              ) : null}
            </div>
            <Plus className="w-4 h-4 text-hayl-text opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
        
        {results && results.length === 0 && (
             <div className="text-center py-4 text-hayl-muted/40 text-xs font-heading font-bold uppercase tracking-widest">
                NO MATCHES FOUND
            </div>
        )}
      </div>
    </div>
  );
}
