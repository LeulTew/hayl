import { render, screen, fireEvent } from '@testing-library/react';
import { SplitSelector } from './SplitSelector';
import { describe, it, expect, vi } from 'vitest';
import { useQuery } from 'convex/react';

// Mock Convex
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}));

// Mock the generated API
vi.mock('../../../../../convex/_generated/api', () => ({
  api: {
    programs: {
      getDerivedPlans: 'programs:getDerivedPlans',
    },
  },
}));

describe('SplitSelector', () => {
  it('should show loading spinner when data is undefined', () => {
    // @ts-expect-error - Mocking useQuery
    useQuery.mockReturnValue(undefined);
    render(<SplitSelector programId="p1" onSelect={vi.fn()} onCancel={vi.fn()} />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render splits when data arrives', () => {
    const mockPlans = [
      {
        _id: 'plan_1',
        variant: { difficulty: 'intermediate', splitFreq: '4', durationMinutes: 60, tags: ['Strength'] }
      }
    ];
    // @ts-expect-error - Mocking useQuery
    useQuery.mockReturnValue(mockPlans);

    render(<SplitSelector programId="p1" onSelect={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('4 Frequency')).toBeInTheDocument();
    expect(screen.getByText('~60')).toBeInTheDocument();
    expect(screen.getByText('Strength')).toBeInTheDocument();
  });

  it('should call onSelect with planId', () => {
    const onSelect = vi.fn();
    const mockPlans = [
      {
        _id: 'plan_1',
        variant: { difficulty: 'intermediate', splitFreq: '4', durationMinutes: 60 }
      }
    ];
    // @ts-expect-error - Mocking useQuery
    useQuery.mockReturnValue(mockPlans);

    render(<SplitSelector programId="p1" onSelect={onSelect} onCancel={vi.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: /4 Frequency/i }));
    expect(onSelect).toHaveBeenCalledWith('plan_1', 0);
  });
});
