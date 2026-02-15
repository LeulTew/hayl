import { useState, useMemo } from 'react';
import { Search, RotateCcw, X } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import type { Doc } from "../../../../../convex/_generated/dataModel";

export interface FilterState {
    search: string;
    difficulty: string[];
    splitType: string[];
    duration: string[];
}

// Type matching backend response
type ProgramWithMetadata = Doc<"programs"> & { durations: number[] };

interface ProgramFilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    onApply: (newFilters: FilterState) => void;
    allPrograms: ProgramWithMetadata[];
}

const SPLIT_OPTIONS = ['1-day', '2-day', '3-day', '4-day', 'upper-lower', 'ppl'];
const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'elite'];
const DURATION_OPTIONS = ['30', '45', '60', '90'];

export function ProgramFilterSheet({ isOpen, onClose, filters, onApply, allPrograms }: ProgramFilterSheetProps) {
    // Sync local state when prop changes (e.g. smart default applied, or sheet re-opens)
    const [prevFilters, setPrevFilters] = useState(filters);
    const [localFilters, setLocalFilters] = useState(filters);

    if (filters !== prevFilters) {
        setPrevFilters(filters);
        setLocalFilters(filters);
    }

     // Calculate count based on local filters
    const previewCount = useMemo(() => {
        return allPrograms.filter(p => {
             // 1. Search
            if (localFilters.search) {
                const query = localFilters.search.toLowerCase();
                if (!p.title.toLowerCase().includes(query)) return false;
            }
            // 2. Difficulty
            if (localFilters.difficulty.length > 0) {
                if (!localFilters.difficulty.includes(p.difficulty)) return false;
            }
            // 3. Split Type
            if (localFilters.splitType.length > 0) {
                if (!localFilters.splitType.includes(p.splitType)) return false;
            }
             // 4. Duration
            if (localFilters.duration.length > 0) {
                 const hasDuration = p.durations.some(d => localFilters.duration.includes(d.toString()));
                 if (!hasDuration) return false;
            }
            return true;
        }).length;
    }, [allPrograms, localFilters]);

    const toggleFilter = (category: keyof FilterState, value: string) => {
        setLocalFilters(prev => {
            const current = (prev[category] as string[]) || [];
            const isSelected = current.includes(value);
            
            return {
                ...prev,
                [category]: isSelected 
                    ? current.filter(item => item !== value)
                    : [...current, value]
            };
        });
    };

    const handleReset = () => {
        setLocalFilters({
            search: '',
            difficulty: [],
            splitType: [],
            duration: []
        });
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    return (
        <BottomSheet 
            isOpen={isOpen} 
            onClose={onClose}
            title="Filter Protocols"
            className="pb-safe"
        >
            <div className="space-y-8 pb-24">
                
                {/* Search */}
                <div className="space-y-3">
                    <label className="text-xs font-mono text-hayl-muted uppercase tracking-widest pl-1">Search Keywords</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-hayl-muted" size={16} />
                        <input 
                            type="text"
                            value={localFilters.search}
                            onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                            placeholder="e.g. 'Dumbbell', 'Hypertrophy', 'Chest'"
                            className="w-full bg-hayl-surface border border-hayl-border rounded-xl px-10 py-3 text-sm font-sans placeholder:text-hayl-muted/50 focus:outline-none focus:border-hayl-text transition-colors"
                        />
                         {localFilters.search && (
                            <button 
                                onClick={() => setLocalFilters(prev => ({ ...prev, search: '' }))}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-hayl-muted hover:text-hayl-text"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                    <label className="text-xs font-mono text-hayl-muted uppercase tracking-widest pl-1">Experience Level</label>
                    <div className="flex flex-wrap gap-2">
                        {DIFFICULTY_OPTIONS.map(opt => (
                            <button
                                key={opt}
                                onClick={() => toggleFilter('difficulty', opt)}
                                className={`
                                    px-4 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-wider border transition-all
                                    ${localFilters.difficulty.includes(opt)
                                        ? 'bg-hayl-text text-hayl-bg border-hayl-text'
                                        : 'bg-hayl-surface text-hayl-muted border-hayl-border hover:border-hayl-text/50'
                                    }
                                `}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Split Type */}
                <div className="space-y-3">
                    <label className="text-xs font-mono text-hayl-muted uppercase tracking-widest pl-1">Split Structure</label>
                    <div className="grid grid-cols-3 gap-2">
                        {SPLIT_OPTIONS.map(opt => (
                            <button
                                key={opt}
                                onClick={() => toggleFilter('splitType', opt)}
                                className={`
                                    py-3 rounded-xl text-xs font-sans font-medium uppercase border transition-all
                                    ${localFilters.splitType.includes(opt)
                                        ? 'bg-hayl-text text-hayl-bg border-hayl-text'
                                        : 'bg-hayl-surface text-hayl-muted border-hayl-border hover:border-hayl-text/50'
                                    }
                                `}
                            >
                                {opt.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration */}
                <div className="space-y-3">
                    <label className="text-xs font-mono text-hayl-muted uppercase tracking-widest pl-1">Duration (Min)</label>
                    <div className="flex flex-wrap gap-2">
                        {DURATION_OPTIONS.map(opt => (
                            <button
                                key={opt}
                                onClick={() => toggleFilter('duration', opt)}
                                className={`
                                    w-12 h-12 rounded-full flex items-center justify-center text-xs font-heading font-bold border transition-all
                                    ${localFilters.duration.includes(opt)
                                        ? 'bg-hayl-text text-hayl-bg border-hayl-text scale-110'
                                        : 'bg-hayl-surface text-hayl-muted border-hayl-border hover:border-hayl-text/50'
                                    }
                                `}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

             {/* Sticky Footer */}
             <div className="fixed bottom-0 left-0 right-0 p-4 bg-hayl-bg/80 backdrop-blur-xl border-t border-hayl-border flex gap-3 z-20">
                <button 
                    onClick={handleReset}
                    className="p-4 rounded-xl border border-hayl-border text-hayl-muted hover:text-hayl-text hover:bg-hayl-surface transition-colors"
                >
                    <RotateCcw size={20} />
                </button>
                <button 
                    onClick={handleApply}
                    className="flex-1 bg-hayl-text text-hayl-bg font-heading font-black italic uppercase text-lg tracking-wider rounded-xl py-4 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    Show {previewCount} Results
                </button>
            </div>
        </BottomSheet>
    );
}
