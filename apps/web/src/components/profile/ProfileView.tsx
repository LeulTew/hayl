import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { NavigationState } from '../../types/navigation';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useTranslation } from '../../hooks/useTranslation';
import { db } from '../../lib/db';
import { Page } from '../ui/Page';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { StatBlock } from '../ui/StatBlock';
import { Settings, LogOut, History, Loader2 } from 'lucide-react';

interface ProfileViewProps {
   onNavigate?: (view: NavigationState) => void;
}

export function ProfileView({ onNavigate }: ProfileViewProps) {
  const { theme, setTheme } = useTheme();
  const { profile, updateProfile } = useUserProfile();
  const { t } = useTranslation();
  const [isResetting, setIsResetting] = useState(false);

  const tdee = profile?.tdeeResult?.tdee || 2500;
  const isImperial = profile?.unitPreference === 'imperial';
  const displayWeight = profile?.weight === undefined ? '--' : Math.round(isImperial ? profile.weight * 2.20462 : profile.weight);
  const displayHeight = profile?.height === undefined ? '--' : Math.round(isImperial ? profile.height / 2.54 : profile.height);
  const genderCode = profile?.gender === 'male' ? 'M' : profile?.gender === 'female' ? 'F' : '--';
  const ageLabel = profile?.age ?? '--';

  const handleFactoryReset = async () => {
     if (confirm(t('reset_confirm'))) {
        setIsResetting(true);
        try {
           await db.delete();
           localStorage.clear();
           window.location.reload();
        } catch (e) {
           console.error(e);
           setIsResetting(false);
        }
     }
  };

  return (
    <Page>
      <header className="mb-10 flex justify-between items-end">
        <SectionHeader title={t('profile')} subtitle={t('operator_card')} size="lg" />
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
           <h2 className="font-heading text-4xl font-bold uppercase leading-none mb-2">{profile?.name || t('athlete')}</h2>
           <div className="flex flex-wrap gap-2">
              <Badge variant="accent">{profile?.experience?.toUpperCase() || 'ROOKIE'}</Badge>
              <Badge variant="outline">{profile?.goal?.toUpperCase() || 'MAINTAIN'}</Badge>
              <Badge variant="muted">{genderCode} / {ageLabel} YRS</Badge>
           </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-4">
           <StatBlock label={t('weight')} value={displayWeight} unit={isImperial ? 'LBS' : 'KG'} />
        </Card>
        <Card className="p-4">
           <StatBlock label={t('height')} value={displayHeight} unit={isImperial ? 'IN' : 'CM'} />
        </Card>
        <Card className="p-4 col-span-2 flex justify-between items-center">
           <StatBlock label={t('daily_target')} value={Math.round(tdee)} unit="KCAL" size="lg" />
           <div className="text-right">
              <p className="font-heading text-xs text-hayl-muted uppercase">{t('maintenance')}</p>
              <p className="font-mono text-sm text-hayl-text">{(profile?.tdeeResult?.bmr || 0)} BMR</p>
           </div>
        </Card>
      </div>

      {/* Actions */}
      <section className="space-y-4 mb-12">
        <SectionHeader title={t('system')} subtitle={t('configuration')} size="sm" className="mb-4" />
        
        <Card className="divide-y divide-hayl-border/50">
          <div 
             className="p-5 flex justify-between items-center cursor-pointer hover:bg-hayl-bg/50 transition-colors"
             onClick={() => onNavigate?.({ type: 'history' })}
          >
             <div className="flex items-center gap-4">
                <History className="text-hayl-muted" />
                <span className="font-heading text-lg font-bold uppercase">{t('mission_logbook')}</span>
             </div>
             <Badge variant="outline">HISTORY</Badge>
          </div>

          <div className="p-5 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <Settings className="text-hayl-muted" />
                <span className="font-heading text-lg font-bold uppercase">{t('interface_theme')}</span>
             </div>
             <ThemeToggle value={theme} onChange={setTheme} />
          </div>

          <div className="p-5 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <Settings className="text-hayl-muted" />
                <span className="font-heading text-lg font-bold uppercase">{t('measurement_units')}</span>
             </div>
             <div className="flex bg-hayl-bg rounded-lg p-1 border border-hayl-border">
                <button 
                  onClick={() => updateProfile({ unitPreference: 'metric' })}
                  className={`px-3 py-1 rounded-md text-[10px] font-mono transition-all ${!isImperial ? 'bg-hayl-text text-hayl-bg' : 'text-hayl-muted'}`}
                >
                  METRIC
                </button>
                <button 
                  onClick={() => updateProfile({ unitPreference: 'imperial' })}
                  className={`px-3 py-1 rounded-md text-[10px] font-mono transition-all ${isImperial ? 'bg-hayl-text text-hayl-bg' : 'text-hayl-muted'}`}
                >
                  US
                </button>
             </div>
          </div>

          <div className="p-5 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <Settings className="text-hayl-muted" />
                <span className="font-heading text-lg font-bold uppercase">{t('language')}</span>
             </div>
             <div className="flex bg-hayl-bg rounded-lg p-1 border border-hayl-border">
                <button 
                  onClick={() => updateProfile({ languagePreference: 'en' })}
                  className={`px-3 py-1 rounded-md text-[10px] font-mono transition-all ${profile?.languagePreference !== 'am' ? 'bg-hayl-text text-hayl-bg' : 'text-hayl-muted'}`}
                >
                  ENG
                </button>
                <button 
                  onClick={() => updateProfile({ languagePreference: 'am' })}
                  className={`px-3 py-1 rounded-md text-[10px] font-mono transition-all ${profile?.languagePreference === 'am' ? 'bg-hayl-text text-hayl-bg' : 'text-hayl-muted'}`}
                >
                  አማርኛ
                </button>
             </div>
          </div>
        </Card>

        <Button 
          variant="danger" 
          fullWidth 
          className="mt-8 justify-between px-6" 
          onClick={handleFactoryReset}
          disabled={isResetting}
        >
           {isResetting ? (
              <><span>RESETTING...</span> <Loader2 size={18} className="animate-spin" /></>
           ) : (
              <><span>{t('factory_reset')}</span> <LogOut size={18} /></>
           )}
        </Button>
      </section>
    </Page>
  );
}
