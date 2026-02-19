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
  context: "base" | "topping" | "side";
  suggestions?: string[];
}

export function FoodSearch({ onSelect, context, suggestions = [] }: FoodSearchProps) {
  const PAGE_SIZE = 8;
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const DEFAULT_SUGGESTIONS: Record<"base" | "topping" | "side", string[]> = {
    base: ["Injera", "Nifro", "Kocho", "Rice"],
    topping: ["Shiro", "Misir Wat", "Doro Wat", "Tibs"],
    side: ["Gomen", "Ayib", "Avocado", "Banana"],
  };

  const mergedSuggestions = [
    ...new Set([...suggestions, ...DEFAULT_SUGGESTIONS[context]]),
  ].slice(0, 6);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const results = useQuery(api.food.searchFoods, {
    query: debouncedSearchTerm,
    page,
    pageSize: PAGE_SIZE,
    context,
  });

  const totalResults = results?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  const currentPage = Math.min(results?.page ?? page, totalPages);
  const rangeStart = totalResults === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalResults);

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-hayl-muted w-5 h-5 opacity-50" />
        <input
          type="text"
          placeholder="SEARCH WATS, INGREDIENTS..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full bg-hayl-surface border border-hayl-border rounded-xl pl-12 pr-4 py-4 font-heading font-bold uppercase text-lg focus:border-hayl-text outline-none transition-all placeholder:text-hayl-muted/30"
        />
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
        {!debouncedSearchTerm && (
            <div className="space-y-4">
               <div className="text-center py-2 text-hayl-muted/40 text-[10px] font-heading font-bold uppercase tracking-widest">
                  Suggested {context}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {mergedSuggestions.map((label) => (
                  <button
                    key={label}
                    onClick={() => setSearchTerm(label)}
                    className="px-3 py-1.5 rounded-full bg-hayl-surface border border-hayl-border text-[10px] font-heading font-bold uppercase hover:border-hayl-text transition-all"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="text-center pt-4 text-hayl-muted/20 text-[9px] font-heading font-bold uppercase tracking-widest">
                  OR START TYPING TO SEARCH
              </div>
            </div>
        )}
        
        {debouncedSearchTerm && !results && (
             <div className="text-center py-4 text-hayl-muted/40 text-xs font-heading font-bold uppercase tracking-widest animate-pulse">
                SCANNING DATABASE...
            </div>
        )}

        {results?.items?.map((item: FoodItem) => (
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
        
        {results && results.items.length === 0 && (
             <div className="text-center py-4 text-hayl-muted/40 text-xs font-heading font-bold uppercase tracking-widest">
                NO MATCHES FOUND
            </div>
        )}
      </div>

      {debouncedSearchTerm && totalResults > 0 && (
        <div className="mt-3 flex items-center justify-between border-t border-hayl-border pt-3">
          <p className="text-[10px] uppercase tracking-widest text-hayl-muted font-heading font-bold">
            Showing {rangeStart}-{rangeEnd} of {totalResults}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 text-[10px] font-heading font-bold uppercase tracking-widest border border-hayl-border rounded disabled:opacity-30 disabled:cursor-not-allowed hover:border-hayl-text transition-colors"
            >
              Prev
            </button>
            <span className="text-[10px] text-hayl-muted font-mono">
              {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 text-[10px] font-heading font-bold uppercase tracking-widest border border-hayl-border rounded disabled:opacity-30 disabled:cursor-not-allowed hover:border-hayl-text transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
