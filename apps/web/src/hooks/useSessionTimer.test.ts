import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionTimer } from './useSessionTimer';

describe('useSessionTimer', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes correctly', () => {
        const { result } = renderHook(() => useSessionTimer());
        expect(result.current.formatted).toBe('00:00');
        expect(result.current.isRunning).toBe(false);
    });

    it('starts counting', () => {
        const { result } = renderHook(() => useSessionTimer());
        
        act(() => {
            result.current.start();
        });

        expect(result.current.isRunning).toBe(true);

        // Advance 61 seconds
        act(() => {
            vi.advanceTimersByTime(61000);
        });

        expect(result.current.formatted).toBe('01:01');
    });

    it('pauses counting', () => {
        const { result } = renderHook(() => useSessionTimer());
        
        act(() => {
            result.current.start();
            vi.advanceTimersByTime(5000);
        });
        
        // 5s elapsed
        
        act(() => {
            result.current.pause();
            vi.advanceTimersByTime(5000);
        });

        // Should still be 5s
        expect(result.current.formatted).toBe('00:05');
        expect(result.current.isRunning).toBe(false);
    });

    it('stops and resets', () => {
        const { result } = renderHook(() => useSessionTimer());
        
        act(() => {
            result.current.start();
        });

        act(() => {
            vi.advanceTimersByTime(5000);
            result.current.stop();
        });

        expect(result.current.formatted).toBe('00:00');
        expect(result.current.isRunning).toBe(false);
    });
});
