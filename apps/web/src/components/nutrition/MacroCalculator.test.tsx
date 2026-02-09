import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MacroCalculator } from './MacroCalculator';

describe('MacroCalculator', () => {
    it('renders initial state correctly', () => {
        render(<MacroCalculator />);
        expect(screen.getByText(/macro engine/i)).toBeInTheDocument();
        expect(screen.getByText('Run Diagnostics →')).toBeInTheDocument();
    });

    it('calculates TDEE and displays results', () => {
        render(<MacroCalculator />);
        
        // Find inputs (using getByDisplayValue or role might be better, but assuming defaults here)
        // Let's just click calculate with default values
        fireEvent.click(screen.getByText('Run Diagnostics →'));

        // Expect results to appear
        expect(screen.getByText('Maintenance Load')).toBeInTheDocument();
        expect(screen.getByText('Mifflin-St Jeor')).toBeInTheDocument();
        expect(screen.getAllByText(/kcal/i).length).toBeGreaterThan(0);
    });

    it('updates inputs and recalculates', () => {
        render(<MacroCalculator />);
        
        const weightInput = screen.getByDisplayValue('70'); // Default
        fireEvent.change(weightInput, { target: { value: '80' } });
        
        fireEvent.click(screen.getByText('Run Diagnostics →'));
        
        // TDEE should be higher for heavier person. 
        // 80kg, 175cm, 25, Male, Moderate(1.55)
        // BMR = (10*80) + (6.25*175) - (5*25) + 5 = 800 + 1093.75 - 125 + 5 = 1773.75
        // TDEE = 1773.75 * 1.55 = 2749
        
        const results = screen.getAllByText(/2749/);
        expect(results.length).toBeGreaterThan(0);
    });
});
