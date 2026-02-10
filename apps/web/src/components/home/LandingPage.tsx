

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-hayl-bg flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden selection:bg-hayl-accent selection:text-white">
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-hayl-accent/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-hayl-accent/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 max-w-md w-full space-y-20">
        {/* Branding */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-hayl-accent/10 border border-hayl-accent/20 text-hayl-accent px-4 py-1.5 text-[10px] font-heading font-bold uppercase tracking-[0.25em] rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-hayl-accent animate-pulse" />
            SYSTEM ALPHA 1.0
          </div>
          <div className="relative group">
            <h1 className="text-[10rem] md:text-[12rem] font-heading font-bold italic tracking-tighter leading-[0.75] text-hayl-text transition-all duration-700">
              HAYL
            </h1>
            <div className="absolute -top-4 -right-2 text-hayl-accent font-mono text-[10px] font-bold tracking-widest opacity-40">ET_AA</div>
          </div>
          <p className="text-[10px] font-sans font-black text-hayl-muted uppercase tracking-[0.6em] pt-6 px-2 opacity-50">
            ADDIS ABABA • ETHIOPIA
          </p>
        </header>

        {/* Mission Statement */}
        <div className="space-y-8 px-4">
          <h2 className="text-2xl font-heading font-bold uppercase italic tracking-tight leading-[1.1] text-hayl-text">
            Scientific performance <span className="text-hayl-accent underline underline-offset-8 decoration-hayl-accent/30">engine</span> built for elite athletics.
          </h2>
        </div>

        {/* Call to Action */}
        <footer className="w-full flex flex-col items-center gap-12 pt-4">
          <button
            onClick={onEnter}
            className="group relative w-full py-6 flex items-center justify-center bg-hayl-text text-hayl-bg font-heading font-bold text-2xl uppercase tracking-[0.2em] rounded-full transition-all hover:bg-hayl-accent hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
          >
            <span className="relative z-10">Enter Engine</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-[9px] font-bold font-heading text-hayl-muted/60 uppercase tracking-[0.35em]">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-hayl-accent/40" />
              <span>NO WAITLIST</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-hayl-accent/40" />
              <span>OPEN BETA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-hayl-accent/40" />
              <span>SCIENCE FIRST</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Decorative Subtle Background Text */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-[24rem] font-heading font-black opacity-[0.03] pointer-events-none select-none tracking-tighter italic whitespace-nowrap">
        PERFORMANCE
      </div>
    </div>
  );
}
