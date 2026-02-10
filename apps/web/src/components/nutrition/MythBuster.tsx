import { useState } from 'react';

const MYTHS = [
  {
    question: "Does eating Injera make you fat?",
    answer: "No. Injera is naturally low in fat and high in fiber. Weight gain comes from the *quantity* of stews (wats) and oils used, or simply eating too many calories total. A typical roll is ~150-170kcal. It's the Niter Kibbeh that adds up!"
  },
  {
    question: "Is fasting (Tsom) enough to lose weight?",
    answer: "Not automatically. Many vegan (fasting) foods like bread, pasta, and oil-heavy wats are calorie-dense. You can still gain weight while fasting if your Calories In > Calories Out. Focus on protein (lentils/chickpeas) and veggies."
  },
  {
    question: "Do I need protein powder to build muscle?",
    answer: "No. You need *sufficient protein* (approx 1.6-2.2g per kg of bodyweight). You can get this from beef tibs, eggs, shiro (in large amounts), and milk. Powder is just a convenient supplement."
  },
  {
    question: "Should I cut out carbs completely?",
    answer: "For an athlete? No. Teff and grains provide fuel for your workouts. Cutting refined sugar is great, but complex carbs like Injera are excellent energy sources. Time them around your training."
  }
];

export function MythBuster() {
  return (
    <div className="bg-hayl-surface p-10 rounded-[2.5rem] border border-hayl-border">
      <div className="mb-10">
        <h2 className="text-5xl font-heading font-black uppercase italic tracking-tighter leading-none mb-2">Truth engine.</h2>
        <p className="text-[10px] font-sans font-bold text-hayl-muted uppercase tracking-[0.4em] opacity-60 pl-1">Science-based nutrition clarity</p>
      </div>
      <div className="space-y-6">
        {MYTHS.map((myth, i) => (
            <MythCard key={i} question={myth.question} answer={myth.answer} />
        ))}
      </div>
    </div>
  );
}

function MythCard({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div 
            onClick={() => setIsOpen(!isOpen)}
            className="bg-hayl-bg rounded-4xl border border-hayl-border overflow-hidden cursor-pointer group transition-all"
        >
            <div className={`p-6 flex justify-between items-center bg-hayl-bg group-hover:bg-hayl-surface transition-colors ${isOpen ? 'bg-hayl-surface' : ''}`}>
                <h3 className="font-heading font-bold uppercase text-lg italic tracking-tight leading-tight pr-6">{question}</h3>
                <span className={`transform transition-transform duration-500 text-hayl-text opacity-30 font-heading font-bold text-xl ${isOpen ? 'rotate-180 opacity-100' : ''}`}>
                    ▲
                </span>
            </div>
            
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-8 pt-2 bg-hayl-text text-hayl-bg">
                    <p className="font-sans text-xs font-bold uppercase tracking-wide leading-relaxed italic opacity-80">{answer}</p>
                </div>
            </div>
        </div>
    )
}

