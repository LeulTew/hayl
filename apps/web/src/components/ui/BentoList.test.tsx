import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BentoList, type BentoItem } from './BentoList';

// Mock items
const ITEMS: BentoItem[] = [
    { id: '1', title: 'Item One', subtitle: 'Sub 1' },
    { id: '2', title: 'Item Two', rightElement: <span>GO</span> }
];

describe('BentoList', () => {
    it('renders all items', () => {
        render(<BentoList items={ITEMS} />);
        expect(screen.getByText('Item One')).toBeTruthy();
        expect(screen.getByText('Item Two')).toBeTruthy();
        expect(screen.getByText('Sub 1')).toBeTruthy();
        expect(screen.getByText('GO')).toBeTruthy();
    });

    it('handles clicks', () => {
        const handleClick = vi.fn();
        render(<BentoList items={ITEMS} onItemClick={handleClick} />);
        
        fireEvent.click(screen.getByText('Item One'));
        expect(handleClick).toHaveBeenCalledWith('1');
    });

    it('renders empty list gracefully', () => {
        const { container } = render(<BentoList items={[]} />);
        expect(container.textContent).toBe('');
    });
});
