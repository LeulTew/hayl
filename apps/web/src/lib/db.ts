import Dexie, { type Table } from 'dexie';

// Define strict types for our Local DB
export interface LocalSession {
  id?: number; // local auto-inc
  sessionId: string; // UUID for sync
  programId: string;
  startTime: number;
  endTime?: number;
  state: 'active' | 'completed' | 'discarded'; 
  logs: LogEntry[]; 
  lastModifiedTs: number;
}

export interface LogEntry {
  exerciseId: string;
  setId: string;
  weight?: number;
  reps?: number;
  rpe?: number;
  timestamp: number;
}

export class HaylDatabase extends Dexie {
  // typed table
  sessions!: Table<LocalSession>; 

  constructor() {
    super('HaylDB');
    
    // Schema definition
    // 'sessions' table with 'sessionId' as a unique index for syncing
    this.version(1).stores({
      sessions: '++id, &sessionId, state, lastModifiedTs' 
    });
  }
}

export const db = new HaylDatabase();
