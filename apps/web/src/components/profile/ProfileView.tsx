import { useTheme } from '../../hooks/useTheme';
import type { NavigationState } from '../../types/navigation';
import { useUserProfile } from '../../hooks/useUserProfile';
import { Page } from '../ui/Page';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { StatBlock } from '../ui/StatBlock';
import { Settings, LogOut, History } from 'lucide-react';

interface ProfileViewProps {
   onNavigate?: (view: NavigationState) => void;
}

export function ProfileView({ onNavigate }: ProfileViewProps) {
  const { theme, setTheme } = useTheme();
  const { profile } = useUserProfile();

  const tdee = profile?.tdeeResult?.tdee || 2500;
   const isImperial = profile?.unitPreference === 'imperial';
   const displayWeight = profile?.weight === undefined ? '--' : Math.round(isImperial ? profile.weight * 2.20462 : profile.weight);
   const displayHeight = profile?.height === undefined ? '--' : Math.round(isImperial ? profile.height / 2.54 : profile.height);
   const genderCode = profile?.gender === 'male' ? 'M' : profile?.gender === 'female' ? 'F' : '--';
   const ageLabel = profile?.age ?? '--';

  return (
    <Page>
      <header className="mb-10 flex justify-between items-end">
        <SectionHeader title="PROFILE" subtitle="OPERATOR CARD" size="lg" />
            <Button variant="outline" size="icon" disabled aria-label="Settings unavailable">
          <Settings size={20} />
        </Button>
      </header>

      {/* Identity */}
      <Card className="p-6 mb-8 flex items-center gap-6 border-hayl-text/20">
        <div className="h-24 w-24 rounded-2xl bg-hayl-text text-hayl-bg flex items-center justify-center font-heading text-5xl font-bold shadow-lg">
           {profile?.name?.[0] || 'A'}
        </div>
        <div className="flex-1">
           <h2 className="font-heading text-4xl font-bold uppercase leading-none mb-2">{profile?.name || 'Unknown Athlete'}</h2>
           <div className="flex flex-wrap gap-2">
              <Badge variant="accent">{profile?.experience || 'ROOKIE'}</Badge>
              <Badge variant="outline">{profile?.goal?.toUpperCase() || 'MAINTAIN'}</Badge>
              <Badge variant="muted">{genderCode} / {ageLabel} YRS</Badge>
           </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-4">
           <StatBlock label="WEIGHT" value={displayWeight} unit={isImperial ? 'LBS' : 'KG'} />
        </Card>
        <Card className="p-4">
           <StatBlock label="HEIGHT" value={displayHeight} unit={isImperial ? 'IN' : 'CM'} />
        </Card>
        <Card className="p-4 col-span-2 flex justify-between items-center">
           <StatBlock label="DAILY TARGET" value={Math.round(tdee)} unit="KCAL" size="lg" />
           <div className="text-right">
              <p className="font-heading text-xs text-hayl-muted uppercase">MAINTENANCE</p>
              <p className="font-mono text-sm text-hayl-text">{(profile?.tdeeResult?.bmr || 0)} BMR</p>
           </div>
        </Card>
      </div>

      {/* Actions */}
      <section className="space-y-4 mb-12">
        <SectionHeader title="SYSTEM" subtitle="CONFIGURATION" size="sm" className="mb-4" />
        
        <Card className="divide-y divide-hayl-border/50">
          <div 
             className="p-5 flex justify-between items-center cursor-pointer hover:bg-hayl-bg/50 transition-colors"
             onClick={() => onNavigate?.({ type: 'history' })}
          >
             <div className="flex items-center gap-4">
                <History className="text-hayl-muted" />
                <span className="font-heading text-lg font-bold">MISSION LOGBOOK</span>
             </div>
             <Badge variant="outline">HISTORY</Badge>
          </div>

          <div className="p-5 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <Settings className="text-hayl-muted" />
                <span className="font-heading text-lg font-bold">INTERFACE THEME</span>
             </div>
             <ThemeToggle value={theme} onChange={setTheme} />
          </div>
        </Card>

        <Button variant="danger" fullWidth className="mt-8 justify-between px-6" disabled>
           <span>FACTORY RESET</span> <LogOut size={18} />
        </Button>
      </section>
    </Page>
  );
}
