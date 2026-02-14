import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SectionHeader } from '../ui/SectionHeader';
import { calculateTDEE, type TDEEInput } from '@hayl/shared';
import { useUserProfile } from '../../hooks/useUserProfile';
import type { UserProfile } from '../../lib/db';

const VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0
  })
};

const GOAL_OPTIONS = [
  { id: 'cut', label: 'CUT', desc: 'Maximize fat loss, retain muscle.' },
  { id: 'maintain', label: 'MAINTAIN', desc: 'Improve performance, recomp body.' },
  { id: 'bulk', label: 'BULK', desc: 'Maximize hypertrophy and strength.' },
] as const;

const EXPERIENCE_OPTIONS = [
  { id: 'beginner', label: 'ROOKIE', desc: '< 1 year training. Focus on form.' },
  { id: 'intermediate', label: 'ATHLETE', desc: '1-3 years. Consistent logs.' },
  { id: 'elite', label: 'ELITE', desc: '3+ years. Advanced periodization.' },
] as const;

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { updateProfile } = useUserProfile();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  
  const [data, setData] = useState<Partial<UserProfile>>({
    name: '',
    gender: 'male',
    goal: 'maintain',
    experience: 'intermediate',
    unitPreference: 'metric',
    age: 25,
    weight: 70, // kg
    height: 175, // cm
  });

  // Helper for step navigation
  const next = () => {
    if (step < 4) {
      setDirection(1);
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const back = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const finish = async () => {
    // Calculate TDEE
    const tdeeInput: TDEEInput = {
      weightKg: data.weight || 70,
      heightCm: data.height || 175,
      age: data.age || 25,
      gender: data.gender || 'male',
      activityLevel: 'moderate', // default for baseline
    };
    
    const result = calculateTDEE(tdeeInput);

    await updateProfile({
      ...data,
      tdeeResult: result,
      completedOnboarding: true,
    });
    onComplete();
  };

  // Step Renders
  const renderStep = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8 h-full">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="font-display text-[120px] leading-none text-hayl-text">HAYL</h1>
              <p className="font-heading text-xl tracking-[0.3em] text-hayl-accent font-bold">PERFORMANCE ENGINE</p>
            </motion.div>
            <p className="max-w-xs text-hayl-muted text-lg">
              Athletic programming designed for hybrid performance. Let's calibrate your profile.
            </p>
            <Button size="lg" onClick={next} className="w-full max-w-xs mt-8 group">
              INITIATE SEQUENCE <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        );

      case 1: // Identity
        return (
          <div className="space-y-8">
            <SectionHeader title="IDENTITY" subtitle="WHO ARE YOU?" />
            <div className="space-y-6">
              <div>
                <label className="font-heading text-sm text-hayl-muted uppercase">Name / Callsign</label>
                <Input 
                  value={data.name} 
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder="ENTER NAME"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="font-heading text-sm text-hayl-muted uppercase mb-3 block">Biological Sex</label>
                <div className="grid grid-cols-2 gap-4">
                  {(['male', 'female'] as const).map((g) => (
                    <Button
                      key={g}
                      variant={data.gender === g ? 'primary' : 'outline'}
                      onClick={() => setData({ ...data, gender: g })}
                      className="capitalize"
                    >
                      {g}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-hayl-muted mt-2 font-mono">*Used for metabolic calculations only.</p>
              </div>
            </div>
            <Button fullWidth onClick={next} disabled={!data.name}>NEXT</Button>
          </div>
        );

      case 2: // Goal
        return (
          <div className="space-y-8">
            <SectionHeader title="OBJECTIVE" subtitle="SELECT YOUR MISSION" />
            <div className="space-y-4">
              {GOAL_OPTIONS.map((option) => (
                <Card 
                  key={option.id}
                  onClick={() => setData({ ...data, goal: option.id })}
                  className={`p-6 cursor-pointer transition-all border-2 ${data.goal === option.id ? 'border-hayl-accent bg-hayl-surface' : 'border-transparent bg-hayl-surface/50 hover:bg-hayl-surface'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-heading text-2xl font-bold">{option.label}</h3>
                      <p className="text-sm text-hayl-muted">{option.desc}</p>
                    </div>
                    {data.goal === option.id && <Check className="text-hayl-accent" />}
                  </div>
                </Card>
              ))}
            </div>
            <Button fullWidth onClick={next}>CONFIRM OBJECTIVE</Button>
          </div>
        );

      case 3: // Experience
        return (
          <div className="space-y-8">
            <SectionHeader title="EXPERIENCE" subtitle="TRAINING HISTORY" />
            <div className="space-y-4">
              {EXPERIENCE_OPTIONS.map((option) => (
                <Card 
                  key={option.id}
                  onClick={() => setData({ ...data, experience: option.id })}
                  className={`p-6 cursor-pointer transition-all border-2 ${data.experience === option.id ? 'border-hayl-accent bg-hayl-surface' : 'border-transparent bg-hayl-surface/50 hover:bg-hayl-surface'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-heading text-2xl font-bold">{option.label}</h3>
                      <p className="text-sm text-hayl-muted">{option.desc}</p>
                    </div>
                    {data.experience === option.id && <Check className="text-hayl-accent" />}
                  </div>
                </Card>
              ))}
            </div>
            <Button fullWidth onClick={next}>CONFIRM LEVEL</Button>
          </div>
        );

      case 4: { // Stats
        // Helper for unit conversion UI
        const isMetric = data.unitPreference === 'metric';
        const heightDisplay = isMetric ? data.height : Math.round((data.height || 0) / 2.54); // cm to inches roughly for display? No, keep logic simple.
        
        return (
          <div className="space-y-8">
            <SectionHeader title="BIOMETRICS" subtitle="CALIBRATE ENGINE" />
            
            <div className="flex justify-center space-x-4 mb-6">
              <Badge 
                variant={isMetric ? 'accent' : 'outline'} 
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => setData({ ...data, unitPreference: 'metric' })}
              >
                METRIC (KG/CM)
              </Badge>
              <Badge 
                variant={!isMetric ? 'accent' : 'outline'} 
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => setData({ ...data, unitPreference: 'imperial' })}
              >
                IMPERIAL (LBS/IN)
              </Badge>
            </div>

            <div className="space-y-6">
              <div>
                <label className="font-heading text-sm text-hayl-muted uppercase">Age</label>
                <Input 
                  type="number" 
                  value={data.age} 
                  onChange={(e) => setData({ ...data, age: Number(e.target.value) })} 
                />
              </div>

              <div>
                <label className="font-heading text-sm text-hayl-muted uppercase">Weight ({isMetric ? 'kg' : 'lbs'})</label>
                <Input 
                  type="number" 
                  value={isMetric ? data.weight : Math.round((data.weight || 0) * 2.20462)} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setData({ ...data, weight: isMetric ? val : val / 2.20462 });
                  }} 
                />
              </div>

              <div>
                <label className="font-heading text-sm text-hayl-muted uppercase">Height ({isMetric ? 'cm' : 'inches'})</label>
                <Input 
                  type="number" 
                  value={heightDisplay}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setData({ ...data, height: isMetric ? val : val * 2.54 });
                  }} 
                />
              </div>
            </div>
            <Button fullWidth onClick={next} className="mt-8">CALCULATE & FINISH</Button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-hayl-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {step > 0 && (
          <div className="mb-8 flex items-center justify-between">
            <button onClick={back} className="p-2 -ml-2 text-hayl-muted hover:text-hayl-text transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={`h-1 w-8 rounded-full transition-colors ${i <= step ? 'bg-hayl-accent' : 'bg-hayl-border'}`} 
                />
              ))}
            </div>
            <div className="w-8" /> {/* spacer */}
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
