import { renderHook, act } from '@testing-library/react';
import { useActiveSession } from './useActiveSession';
import { db } from '../lib/db';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';

// Mock Dexie
vi.mock('../lib/db', () => ({
  db: {
    transaction: vi.fn(async (_mode: string, _table: unknown, callback: () => Promise<void>) => callback()),
    sessions: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      first: vi.fn(),
      get: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock dexie-react-hooks
let mockActiveSession: unknown = null;
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => {
    return mockActiveSession;
  },
}));

describe('useActiveSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveSession = null;
  });

  it('should start a new session when none exists', async () => {
    const mockChainStr = {
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(null)
      })
    };
    (db.sessions.where as Mock).mockReturnValue(mockChainStr); 

    (db.sessions.add as Mock).mockResolvedValue(1);

    const { result } = renderHook(() => useActiveSession());
    
    let sessionId;
    await act(async () => {
      sessionId = await result.current.startSession('prog_1', 'plan_1', 0);
    });

    expect(db.sessions.add).toHaveBeenCalledWith(expect.objectContaining({
      programId: 'prog_1',
      planId: 'plan_1',
      state: 'active',
    }));
    expect(sessionId).toBeDefined();
  });

  it('should not start a second session if one is active', async () => {
    const mockChainExisting = {
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue({ sessionId: 'existing_id' })
      })
    };
    (db.sessions.where as Mock).mockReturnValue(mockChainExisting);

    const { result } = renderHook(() => useActiveSession());
    
    let sessionId;
    await act(async () => {
      sessionId = await result.current.startSession('prog_2', 'plan_2', 0);
    });

    expect(db.sessions.add).not.toHaveBeenCalled();
    expect(sessionId).toBe('existing_id');
  });

  it('should log a set correctly', async () => {
    // 1. Set the mock state BEFORE rendering hook
    mockActiveSession = { 
        id: 1, 
        sessionId: 'test', 
        logs: [], 
        currentSetIndex: 0 
    };

    const { result } = renderHook(() => useActiveSession());
    (db.sessions.get as Mock).mockResolvedValue({
      id: 1,
      state: 'active',
      logs: [],
      currentSetIndex: 0,
    });
    
    await act(async () => {
        await result.current.logSet('ex_1', 10, 100, 8);
    });

    expect(db.sessions.update).toHaveBeenCalledWith(1, expect.objectContaining({
        currentSetIndex: 1,
        logs: expect.arrayContaining([
            expect.objectContaining({ exerciseId: 'ex_1', weight: 100 })
        ])
    }));
  });

  it('should finish a session', async () => {
    mockActiveSession = { id: 1, state: 'active' };

    const { result } = renderHook(() => useActiveSession());

    await act(async () => {
      await result.current.finishSession();
    });

    expect(db.sessions.update).toHaveBeenCalledWith(1, expect.objectContaining({
      state: 'completed',
    }));
  });
});
