import { IngredientSearch } from './IngredientSearch';
import { MacroCalculator } from './MacroCalculator';
import { MythBuster } from './MythBuster';

export function NutritionHub() {
  return (
    <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-2xl mx-auto pt-10 px-1">
      <header className="mb-12">
        <h1 className="text-6xl font-heading font-black italic tracking-tighter leading-none mb-2 lowercase">Fueling hub.</h1>
        <p className="text-[10px] font-sans font-bold text-hayl-muted uppercase tracking-[0.4em] opacity-60">baseline performance optimization</p>
      </header>

      <section className="animate-in slide-in-from-bottom-12 duration-700 delay-100">
        <MacroCalculator />
      </section>

      <section className="animate-in slide-in-from-bottom-12 duration-700 delay-200">
        <IngredientSearch />
      </section>

      <section className="animate-in slide-in-from-bottom-12 duration-700 delay-300">
        <MythBuster />
      </section>
    </div>
  );
}

