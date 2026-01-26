import { useState, useMemo } from 'react';
import { LOCAL_INGREDIENTS, type Ingredient } from '@hayl/shared';

export function IngredientSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addisMode, setAddisMode] = useState(true);

  const filteredIngredients = useMemo(() => {
    return LOCAL_INGREDIENTS.filter(ing => {
      // If Addis Mode is strictly local:
      if (addisMode && !ing.isLocal) return false;

      const term = searchTerm.toLowerCase();
      return (
        ing.name.toLowerCase().includes(term) ||
        (ing.amharicName && ing.amharicName.toLowerCase().includes(term))
      );
    });
  }, [searchTerm, addisMode]);

  return (
    <div className="bg-hayl-surface p-6 rounded-xl shadow-subtle border border-hayl-border">
       <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-heading font-bold uppercase">Food Search</h2>
        <button 
           onClick={() => setAddisMode(!addisMode)}
           className={`px-3 py-1 rounded-full text-xs font-bold uppercase border transition-colors ${addisMode ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-hayl-bg text-hayl-muted border-hayl-border'}`}
        >
            Addis Only {addisMode ? '🇪🇹' : '🌍'}
        </button>
      </div>

      <input 
        type="text" 
        placeholder="Search foods (e.g. Teff, Shiro)..." 
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full bg-hayl-bg border border-hayl-border rounded p-3 text-lg text-hayl-text mb-4 focus:ring-2 focus:ring-hayl-text outline-none"
      />

      <div className="space-y-3">
        {filteredIngredients.length === 0 ? (
            <div className="text-center py-8 text-hayl-muted italic">
                No ingredients found. {addisMode && 'Try turning off "Addis Only" mode.'}
            </div>
        ) : (
            filteredIngredients.map((ing, i) => (
                <IngredientCard key={i} ingredient={ing} />
            ))
        )}
      </div>
    </div>
  );
}

function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
    return (
        <div className="bg-hayl-bg p-4 rounded border border-hayl-border flex justify-between items-center group hover:border-hayl-text transition-colors cursor-default">
            <div>
                <div className="flex items-baseline gap-2">
                    <h3 className="font-bold font-sans">{ingredient.name}</h3>
                    {ingredient.amharicName && <span className="text-xs text-hayl-muted font-heading uppercase tracking-wide">({ingredient.amharicName})</span>}
                </div>
                <div className="text-xs text-hayl-muted capitalize mt-1">
                    {ingredient.category} • 100g
                </div>
            </div>
            
            <div className="text-right">
                <div className="font-heading font-bold text-xl">{ingredient.calories} <span className="text-xs text-hayl-muted">kcal</span></div>
                <div className="text-[10px] text-hayl-muted space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{ingredient.protein}p</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">{ingredient.carbs}c</span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-bold">{ingredient.fats}f</span>
                </div>
            </div>
        </div>
    )
}
