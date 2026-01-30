

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-hayl-bg flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-hayl-accent/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-hayl-accent/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-2xl space-y-12">
        {/* Branding */}
        <div className="space-y-4">
          <div className="inline-block bg-hayl-accent text-hayl-bg px-3 py-1 text-xs font-bold font-heading uppercase tracking-tighter rounded-sm mb-4">
            ALPHA ACCESS
          </div>
          <h1 className="text-8xl md:text-9xl font-heading font-bold italic tracking-tighter leading-[0.8] uppercase text-hayl-text">
            HAYL
          </h1>
          <p className="text-sm md:text-base font-sans font-bold text-hayl-muted uppercase tracking-[0.3em] pl-2">
            Addis Ababa • Ethiopia
          </p>
        </div>

        {/* Mission Statement */}
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-heading font-bold uppercase italic leading-tight max-w-md mx-auto">
            Ethiopia's Premier <span className="text-hayl-accent border-b-4 border-hayl-accent">Fitness Engine</span>
          </h2>
          <p className="font-sans text-hayl-muted max-w-sm mx-auto text-sm leading-relaxed">
            Scientific workout protocols, expert-derived nutrition, and high-performance timers built for the elite. 
          </p>
        </div>

        {/* Call to Action */}
        <div className="pt-8">
          <button
            onClick={onEnter}
            className="group relative w-full md:w-auto px-12 py-5 bg-hayl-text text-hayl-bg font-heading font-bold uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-glow"
          >
            <span className="relative z-10">Enter Active Mode</span>
            <div className="absolute inset-0 bg-hayl-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-bold font-heading text-hayl-muted uppercase tracking-widest">
            <span>No Waitlist</span>
            <span className="w-1 h-1 bg-hayl-muted rounded-full" />
            <span>Open Beta</span>
            <span className="w-1 h-1 bg-hayl-muted rounded-full" />
            <span>Science First</span>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <footer className="absolute bottom-10 left-0 right-0 px-6 text-[10px] font-heading font-bold text-hayl-muted/50 uppercase tracking-tighter">
        "TRANSFORMING ADDIS, ONE REP AT A TIME."
      </footer>
    </div>
  );
}
