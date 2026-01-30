import { useState } from 'react';
import { BentoList, type BentoItem } from '../ui/BentoList';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useSessionTimer } from '../../hooks/useSessionTimer';

const PROGRAMS: BentoItem[] = [
  { id: 'prog_1', title: 'Hayl Foundations', subtitle: 'Beginner • 3 Days', rightElement: 'START' },
  { id: 'prog_2', title: 'Power Builder', subtitle: 'Intermediate • 4 Days', rightElement: 'LOCKED' },
  { id: 'prog_3', title: 'Elite Shred', subtitle: 'Elite • 6 Days', rightElement: 'LOCKED' },
];

interface DashboardProps {
  onSelectProgram: (id: string) => void;
}

export function Dashboard({ onSelectProgram }: DashboardProps) {
  const { isLocked, requestLock, releaseLock } = useWakeLock();
  const timer = useSessionTimer();
  const [activeTab, setActiveTab] = useState<'programs' | 'history'>('programs');

  return (
    <div className="animate-in fade-in duration-700 max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-12 pt-10 px-1">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-6xl font-heading font-bold italic tracking-tighter leading-none mb-1">HAYL</h1>
            <p className="font-sans text-hayl-muted font-bold text-[10px] tracking-[0.25em] uppercase">Addis Performance Engine</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="bg-hayl-text text-hayl-bg px-2 py-0.5 text-[9px] font-bold font-heading uppercase rounded-full">EST. 2026</span>
          </div>
        </div>
      </header>

      {/* Stats Board */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        <div className="p-7 bg-hayl-surface rounded-[2rem] border border-hayl-border flex flex-col justify-between h-40 group hover:border-hayl-text transition-all">
            <p className="font-heading text-[11px] text-hayl-muted font-bold uppercase tracking-widest pl-1">Session Timer</p>
            <div className="flex flex-col">
              <p className="text-5xl font-heading font-bold text-hayl-text tabular-nums italic leading-none">{timer.formatted}</p>
              <div className="mt-4 flex gap-3">
                  {!timer.isRunning ? (
                      <button onClick={timer.start} className="bg-hayl-text text-hayl-bg px-5 py-2 text-[10px] font-bold font-heading uppercase rounded-full hover:scale-105 transition-all">Start</button>
                  ) : (
                      <button onClick={timer.pause} className="bg-hayl-muted/10 text-hayl-text px-5 py-2 text-[10px] font-bold font-heading uppercase rounded-full hover:bg-hayl-muted/20 transition-colors">Pause</button>
                  )}
                  <button onClick={timer.reset} className="text-hayl-muted hover:text-hayl-text text-[10px] font-bold font-heading uppercase transition-colors">Reset</button>
              </div>
            </div>
        </div>

        <div className="p-7 bg-hayl-surface rounded-[2rem] border border-hayl-border flex flex-col justify-between h-40 group hover:border-hayl-text transition-all">
            <div className="flex justify-between items-start">
                <p className="font-heading text-[11px] text-hayl-muted font-bold uppercase tracking-widest pl-1">Wake Lock</p>
                <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-hayl-muted'}`} />
            </div>
            
            <div className="flex flex-col items-start gap-1">
                 <span className="font-heading font-bold text-4xl italic leading-none">{isLocked ? 'ACTIVE' : 'READY'}</span>
                 <button 
                    onClick={isLocked ? releaseLock : requestLock}
                    className="mt-4 text-[10px] font-heading font-bold uppercase underline text-hayl-muted hover:text-hayl-text tracking-widest transition-colors"
                >
                    {isLocked ? 'Release' : 'Engage'}
                 </button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main>
        <div className="flex gap-10 mb-8 px-4">
            <button 
                onClick={() => setActiveTab('programs')}
                className={`pb-1 text-sm font-heading font-bold tracking-[0.2em] transition-all relative ${activeTab === 'programs' ? 'text-hayl-text' : 'text-hayl-muted hover:text-hayl-text'}`}
            >
                PROGRAMS
                {activeTab === 'programs' && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-hayl-text rounded-full" />}
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`pb-1 text-sm font-heading font-bold tracking-[0.2em] transition-all relative ${activeTab === 'history' ? 'text-hayl-text' : 'text-hayl-muted hover:text-hayl-text'}`}
            >
                HISTORY
                {activeTab === 'history' && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-hayl-text rounded-full" />}
            </button>
        </div>

        <div className="px-1">
          {activeTab === 'programs' && (
              <BentoList 
                  items={PROGRAMS} 
                  onItemClick={onSelectProgram} 
              />
          )}
          
          {activeTab === 'history' && (
              <div className="p-20 text-center text-hayl-muted font-heading font-bold uppercase tracking-[0.3em] bg-hayl-bg rounded-[2rem] border-2 border-dashed border-hayl-border italic text-sm">
                  Access History Comming Soon
              </div>
          )}
        </div>
      </main>
    </div>

  );
}
