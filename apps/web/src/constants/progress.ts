import { AlertTriangle, Dumbbell, Flame, Minus, ShieldCheck, TrendingUp, type LucideIcon } from 'lucide-react';

export type ProgressClassification =
  | "insufficient_data"
  | "muscle_gain_likely"
  | "fat_gain_likely"
  | "mixed_gain"
  | "fat_loss_likely"
  | "muscle_loss_risk"
  | "stable";

export const PROGRESS_UI_CONFIG: Record<ProgressClassification, { bg: string, text: string, border: string, icon: LucideIcon, label: string }> = {
  insufficient_data: { bg: 'bg-hayl-muted/10', text: 'text-hayl-muted', border: 'border-hayl-border', icon: Minus, label: 'Needs More Data' },
  muscle_gain_likely: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', icon: Dumbbell, label: 'Muscle Gain' },
  fat_gain_likely: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20', icon: AlertTriangle, label: 'Fat Gain Likely' },
  mixed_gain: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', icon: TrendingUp, label: 'Mixed Gain' },
  fat_loss_likely: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', icon: Flame, label: 'Fat Loss' },
  muscle_loss_risk: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20', icon: AlertTriangle, label: 'Muscle Loss Risk' },
  stable: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', icon: ShieldCheck, label: 'Stable' },
};
