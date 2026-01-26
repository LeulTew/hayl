import { useState } from 'react';
import { calculateTDEE, ACTIVITIES, type ActivityLevel, type TDEEResult } from '@hayl/shared';

export function MacroCalculator() {
  const [stats, setStats] = useState<{
      weightKg: number;
      heightCm: number;
      age: number;
      gender: 'male' | 'female';
      activityLevel: ActivityLevel;
      bodyFatPercent: number;
  }>({
    weightKg: 70,
    heightCm: 175,
    age: 25,
    gender: 'male',
    activityLevel: 'moderate',
    bodyFatPercent: 0, 
  });

  const [result, setResult] = useState<TDEEResult | null>(null);

  const handleCalculate = () => {
    // If bodyFatPercent is 0 or empty, pass undefined to use Mifflin
    const bodyFat = stats.bodyFatPercent > 0 ? stats.bodyFatPercent : undefined;
    
    const res = calculateTDEE({
      ...stats,
      bodyFatPercent: bodyFat
    });
    setResult(res);
  };

  return (
    <div className="bg-hayl-surface p-6 rounded-xl shadow-subtle border border-hayl-border">
      <h2 className="text-2xl font-heading font-bold mb-4 uppercase">Macro Engine</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold uppercase mb-1 text-hayl-muted">Weight (kg)</label>
          <input 
            type="number" 
            value={stats.weightKg} 
            onChange={e => setStats({...stats, weightKg: Number(e.target.value)})}
            className="w-full bg-hayl-bg border border-hayl-border rounded p-2 text-hayl-text"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase mb-1 text-hayl-muted">Height (cm)</label>
          <input 
            type="number" 
            value={stats.heightCm} 
            onChange={e => setStats({...stats, heightCm: Number(e.target.value)})}
            className="w-full bg-hayl-bg border border-hayl-border rounded p-2 text-hayl-text"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase mb-1 text-hayl-muted">Age</label>
          <input 
            type="number" 
            value={stats.age} 
            onChange={e => setStats({...stats, age: Number(e.target.value)})}
            className="w-full bg-hayl-bg border border-hayl-border rounded p-2 text-hayl-text"
          />
        </div>
        <div>
             <label className="block text-xs font-bold uppercase mb-1 text-hayl-muted">BF % (Optional)</label>
            <input 
                type="number" 
                placeholder="Ex. 15"
                value={stats.bodyFatPercent || ''}
                onChange={e => setStats({...stats, bodyFatPercent: Number(e.target.value)})}
                className="w-full bg-hayl-bg border border-hayl-border rounded p-2 text-hayl-text"
            />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-bold uppercase mb-1 text-hayl-muted">Activity</label>
        <select 
            value={stats.activityLevel} 
            onChange={(e) => setStats({...stats, activityLevel: e.target.value as ActivityLevel})}
            className="w-full bg-hayl-bg border border-hayl-border rounded p-2 text-hayl-text"
        >
            {Object.entries(ACTIVITIES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
            ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold uppercase mb-1 text-hayl-muted">Gender</label>
        <div className="flex gap-4">
            <button 
                onClick={() => setStats({...stats, gender: 'male'})}
                className={`flex-1 py-2 rounded font-bold uppercase text-sm ${stats.gender === 'male' ? 'bg-hayl-text text-hayl-bg' : 'bg-hayl-bg text-hayl-muted border border-hayl-border'}`}
            >
                Male
            </button>
            <button 
                onClick={() => setStats({...stats, gender: 'female'})}
                className={`flex-1 py-2 rounded font-bold uppercase text-sm ${stats.gender === 'female' ? 'bg-hayl-text text-hayl-bg' : 'bg-hayl-bg text-hayl-muted border border-hayl-border'}`}
            >
                Female
            </button>
        </div>
      </div>

      <button 
        onClick={handleCalculate}
        className="w-full bg-hayl-accent text-hayl-bg py-3 rounded font-heading font-bold uppercase text-lg hover:opacity-90 transition-opacity mb-6"
      >
        Calculate TDEE
      </button>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-baseline mb-4 border-b border-hayl-border pb-2">
                <span className="text-hayl-muted font-heading uppercase text-sm">Mainenance Calories</span>
                <span className="text-3xl font-heading font-bold">{result.tdee} <span className="text-sm font-sans text-hayl-muted">kcal</span></span>
            </div>
            
            <p className="text-xs text-hayl-muted mb-4">
                Based on <span className="font-bold">{result.formula}</span> formula
                {result.formula === 'Katch-McArdle' && ' (using Body Fat %)'}.
            </p>

            <div className="space-y-4">
                <MacroCard title="🔪 Cut (Fat Loss)" data={result.macros.cut} />
                <MacroCard title="🧱 Maintain" data={result.macros.maintain} />
                <MacroCard title="🦍 Bulk (Muscle)" data={result.macros.bulk} />
            </div>
        </div>
      )}
    </div>
  );
}

function MacroCard({ title, data }: { title: string, data: TDEEResult['macros']['cut'] }) {
    return (
        <div className="bg-hayl-bg p-3 rounded border border-hayl-border">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-heading font-bold uppercase">{title}</h4>
                <div className="font-mono font-bold text-lg">{data.calories} kcal</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                    <div className="font-bold text-blue-700 dark:text-blue-300">{data.protein}g</div>
                    <div className="text-[10px] text-hayl-muted uppercase">Protein</div>
                </div>
                <div className="p-1 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                    <div className="font-bold text-yellow-700 dark:text-yellow-300">{data.fats}g</div>
                    <div className="text-[10px] text-hayl-muted uppercase">Fats</div>
                </div>
                <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                    <div className="font-bold text-green-700 dark:text-green-300">{data.carbs}g</div>
                    <div className="text-[10px] text-hayl-muted uppercase">Carbs</div>
                </div>
            </div>
        </div>
    )
}
