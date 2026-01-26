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
    <div className="bg-hayl-surface p-6 rounded-xl shadow-subtle border border-hayl-border">
      <h2 className="text-2xl font-heading font-bold mb-4 uppercase">Facts vs Myths</h2>
      <div className="space-y-4">
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
            className="bg-hayl-bg border border-hayl-border rounded overflow-hidden cursor-pointer hover:border-hayl-text transition-colors group"
        >
            <div className="p-4 flex justify-between items-center bg-hayl-bg">
                <h3 className="font-bold font-sans text-sm pr-4">{question}</h3>
                <span className={`transform transition-transform duration-300 text-hayl-muted group-hover:text-hayl-text font-bold ${isOpen ? 'rotate-180' : ''}`}>
                    ↓
                </span>
            </div>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 pt-0 text-sm text-hayl-muted border-t border-hayl-border/50">
                    <p className="mt-2">{answer}</p>
                </div>
            </div>
        </div>
    )
}
