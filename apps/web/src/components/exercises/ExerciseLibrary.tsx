import { useState } from "react";
import { useQuery } from "convex/react";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { Page } from "../ui/Page";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Skeleton } from "../ui/Skeleton";
import { Search, ArrowLeft } from "lucide-react";
import type { NavigationState } from "../../types/navigation";
import { ExerciseMediaPlayer } from "../workout/ExerciseMediaPlayer";

type ExerciseWithMedia = Doc<"exercises"> & {
  mediaResolved?: {
    aspectRatio: number;
    blurhash?: string;
    lqipBase64?: string;
    urls: {
      mp4: string | null;
      webm: string | null;
      poster: string | null;
    };
  };
};

interface ExerciseLibraryProps {
  view?: 'home' | 'list' | 'detail';
  filter?: { muscle?: string; equipment?: string };
  exerciseId?: string;
  onNavigate?: (newState: NavigationState) => void;
}

const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Chest', emoji: '🦍' },
  { id: 'back', label: 'Back', emoji: '🦅' },
  { id: 'shoulders', label: 'Shoulders', emoji: '🥥' },
  { id: 'legs', label: 'Legs', emoji: '🦖' },
  { id: 'arms', label: 'Arms', emoji: '💪' },
  { id: 'core', label: 'Core', emoji: '🧱' },
  { id: 'cardio', label: 'Cardio', emoji: '🫀' },
  { id: 'full_body', label: 'Full Body', emoji: '⚡' },
];

export function ExerciseLibrary({ view = 'home', filter, exerciseId, onNavigate }: ExerciseLibraryProps) {
  const allExercises = useQuery(api.exercises.listAll) as ExerciseWithMedia[] | undefined;
  const [search, setSearch] = useState("");

  const handleNavigate = (newState: NavigationState) => {
    if (onNavigate) onNavigate(newState);
  };

  // Detail View
  if (view === 'detail' && exerciseId) {
    const exercise = allExercises?.find((e) => e._id === exerciseId);
    
    if (!allExercises) return <Page><Skeleton className="h-96 w-full" /></Page>;
    if (!exercise) return <Page>Exercise not found</Page>;

    return (
      <Page className="pb-32 pt-4 animate-in slide-in-from-right duration-500">
        <div className="mb-6">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => handleNavigate({ type: 'exercises', view: 'list', filter })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO {filter?.muscle?.toUpperCase() ?? 'LIBRARY'}
            </Button>
        </div>

        <div className="rounded-xl border border-hayl-border relative overflow-hidden group mb-8">
            <ExerciseMediaPlayer media={exercise.mediaResolved} />
        </div>

        <header className="mb-8">
            <h1 className="text-5xl font-heading font-black italic tracking-tighter uppercase leading-none mb-4">{exercise.name}</h1>
            <span className="inline-block px-3 py-1 text-xs font-mono border border-hayl-text rounded-full uppercase tracking-widest text-hayl-muted">
                {exercise.muscleGroup}
            </span>
        </header>

        <section className="space-y-4">
            <h2 className="text-2xl font-heading font-bold uppercase italic border-b border-hayl-border pb-2">Coach's Cues</h2>
            <div className="prose prose-hayl text-hayl-text">
                <p className="whitespace-pre-wrap font-sans text-lg leading-relaxed">{exercise.instructions}</p>
            </div>
        </section>
      </Page>
    );
  }

  // List View
  if (view === 'list') {
    const filteredExercises = allExercises?.filter((e: Doc<"exercises">) => {
        const matchesMuscle = filter?.muscle ? e.muscleGroup.toLowerCase().includes(filter.muscle.toLowerCase()) : true;
        const matchesSearch = search ? e.name.toLowerCase().includes(search.toLowerCase()) : true;
        return matchesMuscle && matchesSearch;
    }) ?? [];

    return (
      <Page className="pb-24 pt-4 animate-in fade-in duration-300">
        <div className="mb-6 flex items-center gap-4">
            <Button variant="ghost" className="pl-0" onClick={() => handleNavigate({ type: 'exercises', view: 'home' })}>
                <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
            <h1 className="text-4xl font-heading font-black italic tracking-tighter uppercase leading-none">
                {filter?.muscle ?? 'ALL EXERCISES'}
            </h1>
        </div>

        <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hayl-muted" />
            <Input 
                className="pl-10" 
                placeholder="Search movement..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        {!allExercises ? (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        ) : (
            <div className="space-y-3">
                {filteredExercises.length === 0 && (
                    <div className="text-center py-12 text-hayl-muted font-mono text-sm uppercase">No exercises found</div>
                )}
                {filteredExercises.map((exercise: Doc<"exercises">) => (
                    <div 
                        key={exercise._id}
                        onClick={() => handleNavigate({ 
                            type: 'exercises', 
                            view: 'detail', 
                            exerciseId: exercise._id,
                            filter: filter // Keep filter context for back button
                        })}
                        className="p-4 border-b border-hayl-border hover:bg-hayl-surface hover:pl-6 transition-all cursor-pointer flex justify-between items-center group"
                    >
                        <span className="font-heading font-bold text-xl uppercase italic group-hover:text-hayl-accent transition-colors">{exercise.name}</span>
                        <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity -mr-2" />
                    </div>
                ))}
            </div>
        )}
      </Page>
    );
  }

  // Home View
  return (
    <Page className="pb-24 pt-4 space-y-8 animate-in fade-in duration-500">
      <header className="mb-8 px-1">
        <h1 className="text-6xl font-heading font-black italic tracking-tighter uppercase leading-none mb-2">Motion Lab</h1>
        <p className="text-xs font-sans font-bold text-hayl-muted uppercase tracking-[0.2em]">The complete library</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {MUSCLE_GROUPS.map((group) => (
            <div 
                key={group.id}
                onClick={() => handleNavigate({ type: 'exercises', view: 'list', filter: { muscle: group.id } })}
                className="aspect-square p-6 border border-hayl-border bg-hayl-surface rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-hayl-text hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
                <span className="text-4xl group-hover:scale-125 transition-transform duration-300">{group.emoji}</span>
                <span className="font-heading font-bold text-xl uppercase italic">{group.label}</span>
            </div>
        ))}
      </div>
    </Page>
  );
}
