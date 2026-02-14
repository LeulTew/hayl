export type TopLevelView = 'dashboard' | 'programs' | 'exercises' | 'nutrition' | 'profile';

/**
 * Global Navigation State
 * Replaces the simple union type in App.tsx with a comprehensive Discriminated Union.
 */

export type NavigationState = 
  // 1. Landing (Auth/Guest Entry)
  | { type: 'landing' }
  
  // 2. Onboarding Flow
  | { type: 'onboarding' }
  
  // 3. Core Dashboard
  | { type: 'dashboard' }
  
  // 4. Content Modules (Nested Navigation)
  | { 
      type: 'programs'; 
      view: 'home' | 'detail'; 
      planId?: string; // Required if view === 'detail'
      programId?: string; // For context
    }
  | { 
      type: 'exercises'; 
      view: 'home' | 'list' | 'detail'; 
      filter?: { muscle?: string; equipment?: string };
      exerciseId?: string; // Required if view === 'detail'
    }
  | { 
      type: 'nutrition'; 
      view: 'home' | 'article' | 'plan-list' | 'plan-detail'; 
      contentId?: string; // Article ID or Plan ID
    }
  
  // 5. User Profile
  | { type: 'profile' }
  
  // 6. Active Workflow (Modal/Overlay)
  | { type: 'workout'; data: { planId: string } }
  | { type: 'split-selector'; data: { programId: string } } // Legacy? Keeping for compatibility if needed
  | { type: 'guide'; data: { planId: string; programId: string } } // Legacy Program Guide
  
  // 7. History
  | { type: 'history' }
  | { type: 'session-detail'; sessionId: string };

// Helper to determine active tab for BottomBar
export function getActiveTab(state: NavigationState): TopLevelView | null {
  switch (state.type) {
    case 'dashboard': return 'dashboard';
    case 'programs': return 'programs';
    
    case 'exercises': return 'exercises';
    case 'nutrition': return 'nutrition';
    case 'profile': return 'profile';
    default: return null;
  }
}
