import { render, screen, fireEvent, act } from '@testing-library/react';
import { RestTimerOverlay } from './RestTimerOverlay';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('RestTimerOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should countdown and call onComplete', async () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();

    render(<RestTimerOverlay seconds={10} onComplete={onComplete} onSkip={onSkip} />);

    expect(screen.getByText('0:10')).toBeInTheDocument();

    // Fast-forward 10 seconds
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('should add 30 seconds when button clicked', async () => {
    render(<RestTimerOverlay seconds={10} onComplete={vi.fn()} onSkip={vi.fn()} />);

    const addButton = screen.getByText('+30 Seconds');
    fireEvent.click(addButton);

    expect(screen.getByText('0:40')).toBeInTheDocument();
  });

  it('should call onSkip when skip button clicked', () => {
    const onSkip = vi.fn();
    render(<RestTimerOverlay seconds={10} onComplete={vi.fn()} onSkip={onSkip} />);

    const skipButton = screen.getByText('Skip Rest');
    fireEvent.click(skipButton);

    expect(onSkip).toHaveBeenCalled();
  });
});
