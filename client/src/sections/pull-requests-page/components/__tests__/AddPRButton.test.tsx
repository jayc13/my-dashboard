import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import AddPRButton from '../AddPRButton';

describe('AddPRButton', () => {
    it('renders the button', () => {
        const mockOnClick = vi.fn();
        render(<AddPRButton onClick={mockOnClick} />);
        
        expect(screen.getByTestId('add-pr-button')).toBeInTheDocument();
        expect(screen.getByText('Add Pull Request')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const mockOnClick = vi.fn();
        render(<AddPRButton onClick={mockOnClick} />);
        
        const button = screen.getByTestId('add-pr-button');
        fireEvent.click(button);
        
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
});

