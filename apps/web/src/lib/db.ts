import Dexie, { type Table } from 'dexie';
import type { TDEEResult } from '@hayl/shared';
import type { SessionKpis } from './sessionMetrics';

// Define strict types for our Local DB
export interface LocalSession {
  id?: number; // local auto-inc
  sessionId: string; // UUID for sync
  programId: string;
  planId: string; // The specific derivedPlan ID
  startTime: number;
  endTime?: number;
  state: 'active' | 'completed' | 'discarded'; 
  
  // RESUME-ABILITY: Track where the user is
  currentDayIndex: number;
  currentExerciseIndex: number;
  currentSetIndex: number;

  logs: LogEntry[]; 
  kpis?: SessionKpis;
  lastModifiedTs: number;
}

export interface LogEntry {
  exerciseId: string;
  setId: string;
  setIndex: number;
  weight?: number;
  reps: number;
  rpe?: number;
  timestamp: number;
}

export interface UserProfile {
  id?: number;
  name: string;
  gender: 'male' | 'female';
  goal: 'cut' | 'maintain' | 'bulk';
  experience: 'beginner' | 'intermediate' | 'elite';
  weight: number; // kg
  height: number; // cm
  age: number;
  unitPreference: 'metric' | 'imperial';
  languagePreference: 'en' | 'am';
  completedOnboarding: boolean;
  tdeeResult?: TDEEResult; // cached TDEE calculation
  
  // Phase 6: Routine Management
  activePlanId?: string; // The specific derivedPlan ID (e.g. "casual-1-4day")
  programStartDate?: number; // Timestamp when they started this block

  // Phase 5: Progress Tracker
  lastWeightLogAt?: number;
  weightReminderSnoozedUntil?: number;
}

export class HaylDatabase extends Dexie {
  // typed table
  sessions!: Table<LocalSession>;
  userProfile!: Table<UserProfile>; 

  constructor() {
    super('HaylDB');
    
    // Schema definition
    this.version(1).stores({
      sessions: '++id, &sessionId, state, lastModifiedTs'
    });

    this.version(2).stores({
      sessions: '++id, &sessionId, state, lastModifiedTs',
      userProfile: '++id' // easy single record access
    });

    // Version 3: Routine Management
    this.version(3).stores({
      userProfile: '++id' // Implicit upgrade to add fields (activePlanId, programStartDate)
    });

    // Version 4: Localization
    this.version(4).stores({
      userProfile: '++id'
    });
  }
}

export const db = new HaylDatabase();
