import { useTheme, type Theme } from '../../hooks/useTheme';

export function ProfileView() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-2xl mx-auto pt-6">
      <header className="mb-10 pl-1">
        <h1 className="text-5xl font-heading font-black italic tracking-tighter uppercase leading-none mb-2 lowercase">Operator Profile.</h1>
        <p className="text-[10px] font-sans font-bold text-hayl-muted uppercase tracking-[0.4em] opacity-60">System ID: HYL-ALPHA-01 / Addis Engine</p>
      </header>

      <div className="bg-hayl-text text-hayl-bg p-10 rounded-[2.5rem] shadow-premium relative overflow-hidden group transition-all duration-700">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-700">
           <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
           </svg>
        </div>

        <div className="flex items-center gap-8 relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-hayl-bg text-hayl-text flex items-center justify-center text-5xl font-heading font-black italic shadow-inner">H</div>
            <div>
                <h2 className="text-4xl font-heading font-black uppercase italic tracking-tighter leading-none lowercase">Leul Tewoldemedhin</h2>
                <p className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-60 mt-2">Status: Performance Engine Active</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-8 bg-hayl-surface rounded-[2rem] border border-hayl-border hover:border-hayl-text transition-all group">
            <p className="text-[10px] font-heading font-bold uppercase text-hayl-muted mb-2 tracking-[0.2em] opacity-60">Rank</p>
            <p className="text-3xl font-heading font-black italic group-hover:scale-105 transition-transform origin-left">PIONEER</p>
        </div>
        <div className="p-8 bg-hayl-surface rounded-[2rem] border border-hayl-border hover:border-hayl-text transition-all group">
            <p className="text-[10px] font-heading font-bold uppercase text-hayl-muted mb-2 tracking-[0.2em] opacity-60">Session XP</p>
            <p className="text-3xl font-heading font-black italic group-hover:scale-105 transition-transform origin-left">1,240</p>
        </div>
      </div>

      {/* Theme Settings */}
      <section className="bg-hayl-surface p-10 rounded-[2.5rem] border border-hayl-border space-y-8">
        <div>
          <h3 className="text-2xl font-heading font-black italic tracking-tighter mb-1 lowercase">Platform appearance.</h3>
          <p className="text-[10px] font-sans font-bold text-hayl-muted uppercase tracking-[0.3em] opacity-60">Visual interface optimization</p>
        </div>

        <div className="flex bg-hayl-bg p-2 rounded-full border border-hayl-border">
          {(['light', 'system', 'dark'] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`
                flex-1 py-3 px-4 rounded-full font-heading font-bold uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2
                ${theme === t 
                  ? 'bg-hayl-text text-hayl-bg shadow-premium' 
                  : 'text-hayl-muted hover:text-hayl-text'
                }
              `}
            >
              {t === 'light' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 17.05l.707.707M7.05 6.95l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
              )}
              {t === 'dark' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              {t === 'system' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              {t}
            </button>
          ))}
        </div>
      </section>

      <div className="py-12 px-6 text-center rounded-[2rem] border border-hayl-border border-dashed bg-hayl-bg/50 italic font-heading font-black uppercase text-xs tracking-[0.3em] text-hayl-muted opacity-40 lowercase">
        Extended system settings encrypted / offline
      </div>
    </div>
  );
}

