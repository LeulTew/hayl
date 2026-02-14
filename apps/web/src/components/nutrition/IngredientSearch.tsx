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
    <div className="bg-hayl-surface p-10 rounded-[2.5rem] border border-hayl-border">
       <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-12">
        <div>
          <h2 className="text-5xl font-heading font-black uppercase italic tracking-tighter leading-none mb-2 lowercase">Engine search.</h2>
          <p className="text-[10px] font-sans font-bold text-hayl-muted uppercase tracking-[0.3em] opacity-60">Addis performance nutrition</p>
        </div>
        <button 
           onClick={() => setAddisMode(!addisMode)}
           className={`px-8 py-2.5 rounded-full font-heading font-bold uppercase text-[10px] tracking-[0.2em] transition-all flex items-center gap-2 ${addisMode ? 'bg-hayl-text text-hayl-bg shadow-premium' : 'bg-hayl-bg text-hayl-muted border border-hayl-border'}`}
        >
            Addis Only Mode
            {addisMode ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
              </svg>
            )}
        </button>
      </div>

      <div className="relative mb-12">
        <input 
          type="text" 
          placeholder="SEARCH FOODS (TEFF, SHIRO, TIBS)..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-hayl-bg rounded-2xl border border-hayl-border p-5 text-xl font-heading font-bold uppercase italic focus:border-hayl-text outline-none transition-all placeholder:text-hayl-muted/30"
        />
        <div className="absolute right-6 top-5 text-hayl-muted opacity-30 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
      </div>

      <div className="space-y-4">
        {filteredIngredients.length === 0 ? (
            <div className="text-center py-16 text-hayl-muted italic font-heading font-bold uppercase tracking-widest opacity-40 text-xs">
                Data Stream Empty. {addisMode && 'Check Global Mode.'}
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
        <div className="bg-hayl-bg p-6 rounded-2xl border border-hayl-border flex justify-between items-center group hover:border-hayl-text transition-all cursor-default">
            <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-baseline gap-4 flex-wrap">
                    <h3 className="font-heading font-bold text-xl md:text-2xl uppercase italic tracking-tighter leading-none break-words">{ingredient.name}</h3>
                    {ingredient.amharicName && <span className="text-[10px] text-hayl-muted font-heading font-bold uppercase tracking-[0.3em] opacity-40 whitespace-nowrap">[{ingredient.amharicName}]</span>}
                </div>
                <div className="text-[10px] font-heading font-bold text-hayl-muted uppercase tracking-[0.2em] mt-3 flex items-center gap-3">
                    <span className="bg-hayl-surface px-2 py-0.5 rounded-full border border-hayl-border">{ingredient.category}</span>
                    <span className="opacity-30">/</span>
                    <span className="opacity-50">100G SERVING</span>
                </div>
            </div>
            
            <div className="text-right">
                <div className="font-heading font-black text-3xl italic leading-none">{ingredient.calories} <span className="text-[10px] not-italic opacity-40">KCAL</span></div>
                <div className="text-[9px] font-heading font-bold space-x-4 mt-2 uppercase tracking-widest opacity-60">
                    <span className="text-hayl-text">P:{ingredient.protein}g</span>
                    <span className="text-hayl-text">C:{ingredient.carbs}g</span>
                    <span className="text-hayl-text">F:{ingredient.fats}g</span>
                </div>
            </div>
        </div>
    )
}

