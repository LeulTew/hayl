

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-hayl-bg flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden">
      <div className="relative z-10 max-w-md w-full space-y-24">
        {/* Branding */}
        <header className="space-y-6">
          <div className="inline-block bg-hayl-text text-hayl-bg px-5 py-1.5 text-[10px] font-heading font-bold uppercase tracking-[0.25em] rounded-full mb-6">
            SYSTEM ALPHA 1.0
          </div>
          <div className="relative">
            <h1 className="text-[10rem] md:text-[12rem] font-heading font-bold italic tracking-tighter leading-[0.75] text-hayl-text">
              HAYL
            </h1>
          </div>
          <p className="text-[10px] font-sans font-bold text-hayl-muted uppercase tracking-[0.5em] pt-4 px-2 translate-x-1">
            ADDIS ABABA • ETHIOPIA
          </p>
        </header>

        {/* Mission Statement */}
        <div className="space-y-8 px-4">
          <h2 className="text-xl font-heading font-bold uppercase italic tracking-tight leading-relaxed text-hayl-text">
            Scientific performance engine built for the <span className="underline underline-offset-8 decoration-hayl-muted/30">next generation</span> of athletes.
          </h2>
        </div>

        {/* Call to Action */}
        <footer className="w-full flex flex-col items-center gap-10">
          <button
            onClick={onEnter}
            className="w-full py-6 bg-hayl-text text-hayl-bg font-heading font-bold text-2xl uppercase tracking-[0.15em] rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Enter Engine
          </button>
          
          <div className="flex items-center justify-center gap-6 text-[9px] font-bold font-heading text-hayl-muted/50 uppercase tracking-[0.3em]">
            <span>NO WAITLIST</span>
            <span className="w-1 h-1 rounded-full bg-hayl-muted/30" />
            <span>OPEN BETA</span>
            <span className="w-1 h-1 rounded-full bg-hayl-muted/30" />
            <span>SCIENCE FIRST</span>
          </div>
        </footer>
      </div>

      {/* Decorative Subtle Background Text */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[20rem] font-heading font-black opacity-[0.02] pointer-events-none select-none tracking-tighter italic">
        HAYL
      </div>
    </div>

  );
}
