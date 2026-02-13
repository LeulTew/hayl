import Dexie, { type Table } from 'dexie';
import type { TDEEResult } from '@hayl/shared';

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
  completedOnboarding: boolean;
  tdeeResult?: TDEEResult; // cached TDEE calculation
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
  }
}

export const db = new HaylDatabase();
