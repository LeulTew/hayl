import { Page } from "../ui/Page";
import { Button } from "../ui/Button";
import { ArrowLeft, BookOpen, Utensils, Apple } from "lucide-react";
import type { NavigationState } from "../../types/navigation";
import { IngredientSearch } from './IngredientSearch';
import { MacroCalculator } from './MacroCalculator';
import { MythBuster } from './MythBuster';
import { MarkdownText } from "../ui/MarkdownText";

interface NutritionHubProps {
  view?: 'home' | 'article' | 'plan-list' | 'plan-detail';
  contentId?: string;
  onNavigate?: (newState: NavigationState) => void;
}

// Static Content Data
const ARTICLES: Record<string, { title: string; subtitle: string; content: string }> = {
  'protein': {
    title: "Protein Mastery",
    subtitle: "The Building Blocks of Hypertrophy",
    content: `
      ## Why It Matters
      Protein is the essential macronutrient for muscle repair and growth. Without adequate protein, your training stimulus is wasted.
      
      ## How Much?
      Aim for **1.6g to 2.2g per kg** of bodyweight. For a 70kg individual, that's roughly 110g to 150g daily.
      
      ## Timing
      Total daily intake matters more than timing, but consuming 20-40g every 3-4 hours optimizes muscle protein synthesis (MPS).
    `
  },
  'creatine': {
    title: "Creatine Monohydrate",
    subtitle: "The Most Researched Supplement",
    content: `
      ## What It Does
      Increases phosphocreatine stores in muscles, allowing for more ATP production during high-intensity exercise.
      
      ## Dosage
      Take **5g daily**, anytime. No loading phase needed. Consistent daily intake is key.
      
      ## Myths
      It does not cause baldness or kidney damage in healthy individuals. It does cause water retention, but that's intra-muscular (good thing).
    `
  },
  'hydration': {
    title: "Hydration Protocol",
    subtitle: "Performance Fluid Dynamics",
    content: `
      ## The baseline
      Drink 3-4 liters daily. Urine should be pale yellow.
      
      ## Training
      Consume 500ml 1-2 hours before training. Sip throughout.
      
      ## Electrolytes
      Water isn't enough if you sweat heavily. Sodium is critical. Add a pinch of salt to your pre-workout meal.
    `
  }
};

const MEAL_PLANS = [
  { 
    id: 'budget-bulk', 
    title: "Budget Bulk", 
    calories: 3000, 
    tags: ["High Carb", "Cheap"], 
    description: "Maximum calories per birr. Rice, lentils, eggs, and bananas." 
  },
  { 
    id: 'lean-cut', 
    title: "Lean Cut", 
    calories: 2000, 
    tags: ["High Protein", "Low Fat"], 
    description: "Satiety focused. Chicken breast, leafy greens, and potatoes." 
  }
];

export function NutritionHub({ view = 'home', contentId, onNavigate }: NutritionHubProps) {
  const handleNavigate = (newState: NavigationState) => {
    if (onNavigate) onNavigate(newState);
  };

  // Article View
  if (view === 'article' && contentId && ARTICLES[contentId]) {
    const article = ARTICLES[contentId];
    return (
      <Page className="pb-32 pt-4 animate-in slide-in-from-right duration-500">
        <div className="mb-6">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => handleNavigate({ type: 'nutrition', view: 'home' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO HUB
            </Button>
        </div>
        
        <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-heading font-black italic tracking-tighter uppercase leading-none mb-2 break-words">{article.title}</h1>
            <p className="text-lg font-sans text-hayl-muted uppercase tracking-widest text-xs font-bold">{article.subtitle}</p>
        </header>

        <div className="prose prose-hayl text-hayl-text whitespace-pre-line font-sans leading-relaxed">
            <MarkdownText content={article.content} />
        </div>
      </Page>
    );
  }

  // Meal Plan List
  if (view === 'plan-list') {
    return (
      <Page className="pb-32 pt-4 animate-in slide-in-from-right duration-500">
        <div className="mb-6">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => handleNavigate({ type: 'nutrition', view: 'home' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO HUB
            </Button>
        </div>

        <header className="mb-8">
            <h1 className="text-5xl font-heading font-black italic tracking-tighter uppercase leading-none mb-2">HAYL Fuel</h1>
            <p className="text-xs font-sans text-hayl-muted uppercase tracking-widest font-bold">Curated Nutrition Plans</p>
        </header>

        <div className="grid gap-4">
            {MEAL_PLANS.map(plan => (
                <div 
                    key={plan.id}
                    className="p-6 border border-hayl-border bg-hayl-surface rounded-xl hover:border-hayl-text cursor-pointer transition-all group"
                    onClick={() => handleNavigate({ type: 'nutrition', view: 'plan-detail', contentId: plan.id })}
                >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                        <h3 className="text-xl md:text-2xl font-heading font-bold uppercase italic break-words leading-tight">{plan.title}</h3>
                        <span className="font-mono text-sm border border-hayl-text px-2 py-0.5 rounded-full self-start shrink-0">{plan.calories} kcal</span>
                    </div>
                    <p className="text-hayl-muted text-sm mb-4 line-clamp-2">{plan.description}</p>
                    <div className="flex gap-2 flex-wrap">
                        {plan.tags.map(tag => (
                            <span key={tag} className="text-[10px] uppercase font-bold text-hayl-muted bg-hayl-bg px-2 py-1 rounded">{tag}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </Page>
    );
  }

  // Meal Plan Detail (Placeholder for now)
  if (view === 'plan-detail' && contentId) {
    const plan = MEAL_PLANS.find(p => p.id === contentId);
    if (!plan) return <Page>Plan not found</Page>;
    
    return (
       <Page className="pb-32 pt-4 animate-in slide-in-from-right duration-500">
        <div className="mb-6">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => handleNavigate({ type: 'nutrition', view: 'plan-list' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO PLANS
            </Button>
        </div>

        <header className="mb-8 border-b border-hayl-border pb-8">
            <h1 className="text-5xl font-heading font-black italic tracking-tighter uppercase leading-none mb-2">{plan.title}</h1>
            <div className="flex gap-4 font-mono text-sm">
                <span>{plan.calories} KCAL</span>
                <span>•</span>
                <span>{plan.tags.join(" / ")}</span>
            </div>
        </header>

        <div className="p-8 border border-dashed border-hayl-border rounded-xl text-center text-hayl-muted">
            <p className="font-heading font-bold uppercase text-xl mb-2">Full Breakdown Coming Soon</p>
            <p className="text-xs">Phase 6 Implementation</p>
        </div>
       </Page>
    );
  }

  // Home View
  return (
    <Page className="pb-24 pt-4 space-y-12 animate-in fade-in duration-500">
      <header className="mb-8 px-1">
        <h1 className="text-6xl font-heading font-black italic tracking-tighter uppercase leading-none mb-2">Fueling Hub</h1>
        <p className="text-xs font-sans font-bold text-hayl-muted uppercase tracking-[0.2em]">Optimization Engine</p>
      </header>

      {/* Quick Access Grid */}
      <section className="grid grid-cols-2 gap-4">
         <div 
            onClick={() => handleNavigate({ type: 'nutrition', view: 'plan-list' })}
            className="p-6 bg-hayl-surface border border-hayl-border rounded-xl aspect-[4/3] flex flex-col justify-between hover:border-hayl-text cursor-pointer transition-all group"
         >
            <Utensils className="w-8 h-8 text-hayl-muted group-hover:text-hayl-accent transition-colors" />
            <span className="font-heading font-bold text-2xl uppercase italic leading-none">Meal<br/>Plans</span>
         </div>
         <div 
             className="p-6 bg-hayl-surface border border-hayl-border rounded-xl aspect-[4/3] flex flex-col justify-between opacity-50 cursor-not-allowed"
         >
            <Apple className="w-8 h-8 text-hayl-muted" />
            <span className="font-heading font-bold text-2xl uppercase italic leading-none">Food<br/>Log</span>
         </div>
      </section>

      {/* Knowledge Base */}
      <section>
        <h2 className="text-xl font-heading font-bold uppercase italic border-b border-hayl-border pb-2 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Knowledge Base
        </h2>
        <div className="space-y-3">
            {Object.entries(ARTICLES).map(([id, article]) => (
                <div 
                    key={id}
                    onClick={() => handleNavigate({ type: 'nutrition', view: 'article', contentId: id })}
                    className="flex justify-between items-center p-4 border-b border-hayl-border hover:bg-hayl-surface hover:pl-6 transition-all cursor-pointer group"
                >
                    <div>
                        <h3 className="font-heading font-bold text-xl uppercase italic mb-1 group-hover:text-hayl-accent transition-colors">{article.title}</h3>
                        <p className="text-xs text-hayl-muted font-bold uppercase tracking-wide">{article.subtitle}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            ))}
        </div>
      </section>

      {/* Tools */}
      <section className="space-y-8">
        <div>
            <h2 className="text-xl font-heading font-bold uppercase italic border-b border-hayl-border pb-2 mb-4">Macro Calculator</h2>
            <MacroCalculator />
        </div>

        <div>
            <h2 className="text-xl font-heading font-bold uppercase italic border-b border-hayl-border pb-2 mb-4">Ingredient Search</h2>
            <IngredientSearch />
        </div>
      </section>

      <section className="opacity-50 hover:opacity-100 transition-opacity">
        <MythBuster />
      </section>

    </Page>
  );
}
