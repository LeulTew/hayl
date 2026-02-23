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
    <div className="bg-hayl-surface p-10 rounded-[2.5rem] border border-hayl-border">
      <h2 className="text-5xl font-heading font-black mb-12 uppercase italic tracking-tighter lowercase">Macro Engine.</h2>
      
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <label className="block text-[10px] font-bold uppercase mb-3 text-hayl-muted tracking-[0.2em] pl-1">Weight (kg)</label>
          <input 
            type="number" 
            value={stats.weightKg} 
            onChange={e => setStats({...stats, weightKg: Number(e.target.value)})}
            className="w-full bg-hayl-bg rounded-2xl border border-hayl-border p-5 text-xl font-heading font-bold focus:border-hayl-text outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase mb-3 text-hayl-muted tracking-[0.2em] pl-1">Height (cm)</label>
          <input 
            type="number" 
            value={stats.heightCm} 
            onChange={e => setStats({...stats, heightCm: Number(e.target.value)})}
            className="w-full bg-hayl-bg rounded-2xl border border-hayl-border p-5 text-xl font-heading font-bold focus:border-hayl-text outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase mb-3 text-hayl-muted tracking-[0.2em] pl-1">Age</label>
          <input 
            type="number" 
            value={stats.age} 
            onChange={e => setStats({...stats, age: Number(e.target.value)})}
            className="w-full bg-hayl-bg rounded-2xl border border-hayl-border p-5 text-xl font-heading font-bold focus:border-hayl-text outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase mb-3 text-hayl-muted tracking-[0.2em] pl-1">Body Fat % <span className="opacity-40 text-[9px]">(OPT)</span></label>
          <input 
            type="number" 
            placeholder="EX. 15"
            value={stats.bodyFatPercent || ''}
            onChange={e => setStats({...stats, bodyFatPercent: Number(e.target.value)})}
            className="w-full bg-hayl-bg rounded-2xl border border-hayl-border p-5 text-xl font-heading font-bold focus:border-hayl-text outline-none transition-all placeholder:text-hayl-muted/30"
          />
        </div>
      </div>

      <div className="mb-10 relative">
        <label className="block text-[10px] font-bold uppercase mb-3 text-hayl-muted tracking-[0.2em] pl-1">Activity Level</label>
        <select 
            value={stats.activityLevel} 
            onChange={(e) => {
              const val = e.target.value;
              if (val in ACTIVITIES) setStats({...stats, activityLevel: val as ActivityLevel});
            }}
            className="w-full bg-hayl-bg rounded-2xl border border-hayl-border p-5 text-sm font-heading font-bold uppercase focus:border-hayl-text outline-none transition-all cursor-pointer appearance-none"
        >
            {Object.entries(ACTIVITIES).map(([key, val]) => (
                <option key={key} value={key} className="bg-hayl-surface text-hayl-text">{val.label}</option>
            ))}
        </select>
        <div className="absolute right-6 bottom-5 pointer-events-none opacity-30 italic font-heading font-bold">SELECT</div>
      </div>

      <div className="mb-12">
        <label className="block text-[10px] font-bold uppercase mb-3 text-hayl-muted tracking-[0.2em] pl-1">Biological Gender</label>
        <div className="flex gap-6">
            <button 
                onClick={() => setStats({...stats, gender: 'male'})}
                className={`flex-1 py-5 rounded-2xl font-heading font-bold uppercase text-lg transition-all ${stats.gender === 'male' ? 'bg-hayl-text text-hayl-bg' : 'bg-hayl-bg text-hayl-muted border border-hayl-border hover:border-hayl-text'}`}
            >
                Male
            </button>
            <button 
                onClick={() => setStats({...stats, gender: 'female'})}
                className={`flex-1 py-5 rounded-2xl font-heading font-bold uppercase text-lg transition-all ${stats.gender === 'female' ? 'bg-hayl-text text-hayl-bg' : 'bg-hayl-bg text-hayl-muted border border-hayl-border hover:border-hayl-text'}`}
            >
                Female
            </button>
        </div>
      </div>

      <button 
        onClick={handleCalculate}
        className="w-full bg-hayl-text text-hayl-bg py-6 rounded-full font-heading font-bold uppercase text-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mb-12 italic"
      >
        Run Diagnostics →
      </button>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-baseline mb-8 border-b border-hayl-border pb-6">
                <span className="text-hayl-muted font-heading font-bold uppercase text-[10px] tracking-[0.3em]">Maintenance Load</span>
                <span className="text-6xl font-heading font-black italic">{result.tdee} <span className="text-sm font-heading not-italic opacity-40 uppercase">kcal</span></span>
            </div>
            
            <p className="text-[9px] text-hayl-muted/50 mb-10 font-bold uppercase tracking-[0.4em] text-center">
                Baseline calculated via <span className="text-hayl-text opacity-100">{result.formula}</span> engine
            </p>

            <div className="space-y-8">
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
        <div className="bg-hayl-bg p-8 rounded-[2rem] border border-hayl-border hover:border-hayl-text transition-all group">
            <div className="flex justify-between items-center mb-6">
                <h4 className="font-heading font-bold uppercase italic text-xl">{title}</h4>
                <div className="font-heading font-black text-3xl italic">{data.calories} <span className="text-xs font-bold not-italic opacity-40 uppercase">kcal</span></div>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-hayl-surface rounded-2xl border border-transparent group-hover:border-hayl-border transition-all">
                    <div className="font-heading font-bold text-2xl italic leading-none">{data.protein}g</div>
                    <div className="text-[9px] text-hayl-muted uppercase font-bold tracking-[0.2em] mt-1">Protein</div>
                </div>
                <div className="p-4 bg-hayl-surface rounded-2xl border border-transparent group-hover:border-hayl-border transition-all">
                    <div className="font-heading font-bold text-2xl italic leading-none">{data.fats}g</div>
                    <div className="text-[9px] text-hayl-muted uppercase font-bold tracking-[0.2em] mt-1">Fats</div>
                </div>
                <div className="p-4 bg-hayl-surface rounded-2xl border border-transparent group-hover:border-hayl-border transition-all">
                    <div className="font-heading font-bold text-2xl italic leading-none">{data.carbs}g</div>
                    <div className="text-[9px] text-hayl-muted uppercase font-bold tracking-[0.2em] mt-1">Carbs</div>
                </div>
            </div>
        </div>
    )
}

