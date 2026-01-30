export function ExerciseLibrary() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 pl-1">
        <h1 className="text-4xl font-heading font-bold italic tracking-tighter uppercase leading-none mb-2">Exercise Lab</h1>
        <p className="text-sm font-sans font-bold text-hayl-muted uppercase tracking-[0.2em]">The complete motion library</p>
      </header>

      <div className="p-20 text-center neo-border-thick border-dashed bg-hayl-surface">
        <div className="text-6xl mb-6">🧪</div>
        <h2 className="text-2xl font-heading font-bold uppercase italic italic tracking-tight mb-2">Laboratory Calibration</h2>
        <p className="text-hayl-muted font-heading font-bold uppercase text-xs tracking-widest">Compiling Ethiopian Performance Data...</p>
        <div className="mt-8 text-xs font-mono opacity-50">PHASE 3.5 // NAVIGATION ACTIVE</div>
      </div>

      <div className="grid grid-cols-1 gap-6 opacity-30 pointer-events-none">
        <div className="p-8 neo-border bg-hayl-surface">
            <h3 className="text-xl font-heading font-bold uppercase italic">Barbell Back Squat</h3>
            <p className="text-xs text-hayl-muted uppercase font-bold mt-2">Legs / Compound</p>
        </div>
        <div className="p-8 neo-border bg-hayl-surface">
            <h3 className="text-xl font-heading font-bold uppercase italic">Military Press</h3>
            <p className="text-xs text-hayl-muted uppercase font-bold mt-2">Shoulders / Compound</p>
        </div>
      </div>
    </div>
  );
}
