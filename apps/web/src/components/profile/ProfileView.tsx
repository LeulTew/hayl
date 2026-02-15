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
import { BottomSheet } from '../ui/BottomSheet';
import { Input } from '../ui/Input';
import { Settings, LogOut, History, Loader2, AlertTriangle, Pencil } from 'lucide-react';

interface ProfileViewProps {
   onNavigate?: (view: NavigationState) => void;
}

export function ProfileView({ onNavigate }: ProfileViewProps) {
  const { theme, setTheme } = useTheme();
  const { profile, updateProfile } = useUserProfile();
  const { t } = useTranslation();
  const [isResetting, setIsResetting] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    weight: '',
    height: ''
  });

  const tdee = profile?.tdeeResult?.tdee || 2500;
  const isImperial = profile?.unitPreference === 'imperial';
  const displayWeight = profile?.weight === undefined ? '--' : Math.round(isImperial ? profile.weight * 2.20462 : profile.weight);
  const displayHeight = profile?.height === undefined ? '--' : Math.round(isImperial ? profile.height / 2.54 : profile.height);
  const genderCode = profile?.gender === 'male' ? 'M' : profile?.gender === 'female' ? 'F' : '--';
  const ageLabel = profile?.age ?? '--';

  const openEditModal = () => {
    setEditForm({
      name: profile?.name || '',
      weight: isImperial ? Math.round((profile?.weight || 0) * 2.20462).toString() : (profile?.weight?.toString() || ''),
      height: isImperial ? Math.round((profile?.height || 0) / 2.54).toString() : (profile?.height?.toString() || '')
    });
    setIsEditModalOpen(true);
  };

  const saveProfile = async () => {
    const weightVal = parseFloat(editForm.weight);
    const heightVal = parseFloat(editForm.height);
    
    await updateProfile({
      name: editForm.name,
      weight: isImperial ? weightVal / 2.20462 : weightVal,
      height: isImperial ? heightVal * 2.54 : heightVal
    });
    setIsEditModalOpen(false);
  };

  const handleFactoryReset = async () => {
    if (!isResetModalOpen) return; // Prevent accidental execution without modal
    setIsResetting(true);
    try {
      await db.delete();
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error(e);
      setIsResetting(false);
      setIsResetModalOpen(false);
    }
  };

  return (
    <Page>
      <header className="mb-10 flex justify-between items-end">
        <SectionHeader title={t('profile')} subtitle={t('operator_card')} size="lg" />
        <Button variant="outline" size="icon" onClick={openEditModal} aria-label="Edit Profile">
          <Pencil size={20} />
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
          onClick={() => setIsResetModalOpen(true)}
          disabled={isResetting}
        >
           {isResetting ? (
              <><span>RESETTING...</span> <Loader2 size={18} className="animate-spin" /></>
           ) : (
              <><span>{t('factory_reset')}</span> <LogOut size={18} /></>
           )}
        </Button>
      </section>

      {/* Edit Profile Modal */}
      <BottomSheet
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-heading text-hayl-muted uppercase">Name</label>
            <Input 
              value={editForm.name} 
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="YOUR NAME"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-heading text-hayl-muted uppercase">Weight ({isImperial ? 'LBS' : 'KG'})</label>
              <Input 
                type="number"
                value={editForm.weight} 
                onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-heading text-hayl-muted uppercase">Height ({isImperial ? 'IN' : 'CM'})</label>
              <Input 
                type="number"
                value={editForm.height} 
                onChange={(e) => setEditForm(prev => ({ ...prev, height: e.target.value }))}
              />
            </div>
          </div>

          <Button fullWidth onClick={saveProfile}>
            SAVE CHANGES
          </Button>
          <div className="h-4" /> 
        </div>
      </BottomSheet>

      {/* Custom Reset Confirmation */}
      <BottomSheet 
        isOpen={isResetModalOpen} 
        onClose={() => !isResetting && setIsResetModalOpen(false)}
        title={t('factory_reset')}
      >
        <div className="flex flex-col items-center text-center gap-6 py-4">
           <div className="w-16 h-16 rounded-3xl bg-hayl-danger/10 flex items-center justify-center text-hayl-danger">
              <AlertTriangle size={32} />
           </div>
           
           <div className="space-y-2">
             <h4 className="font-heading text-2xl font-bold uppercase">{t('reset_confirm')}</h4>
             <p className="font-body text-sm text-hayl-muted">
               This will purge all local workout history, profile data, and synchronization tokens. This process is irreversible.
             </p>
           </div>

           <div className="w-full flex flex-col gap-3 pt-4">
             <Button 
               variant="danger" 
               fullWidth 
               onClick={handleFactoryReset}
               disabled={isResetting}
               size="lg"
             >
               {isResetting ? 'PURGING DATA...' : 'YES, PURGE EVERYTHING'}
             </Button>
             <Button 
               variant="ghost" 
               fullWidth 
               onClick={() => setIsResetModalOpen(false)}
               disabled={isResetting}
             >
               CANCEL
             </Button>
           </div>
        </div>
      </BottomSheet>
    </Page>
  );
}
