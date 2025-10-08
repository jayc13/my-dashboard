import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import TooltipButton from '../TooltipButton';

describe('TooltipButton', () => {
    it('renders button with children', () => {
        render(<TooltipButton>Click me</TooltipButton>);
        expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders button without tooltip when tooltip prop is not provided', () => {
        render(<TooltipButton>No Tooltip</TooltipButton>);
        const button = screen.getByRole('button', { name: 'No Tooltip' });
        expect(button).toBeInTheDocument();
    });

    it('renders button with tooltip when tooltip prop is provided', () => {
        render(<TooltipButton tooltip="This is a tooltip">With Tooltip</TooltipButton>);
        const button = screen.getByRole('button', { name: 'With Tooltip' });
        expect(button).toBeInTheDocument();
    });

    it('calls onClick when button is clicked', () => {
        const mockOnClick = vi.fn();
        render(<TooltipButton onClick={mockOnClick}>Clickable</TooltipButton>);
        
        const button = screen.getByRole('button', { name: 'Clickable' });
        fireEvent.click(button);
        
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('passes button props correctly', () => {
        render(
            <TooltipButton variant="contained" color="primary" disabled>
                Styled Button
            </TooltipButton>
        );
        
        const button = screen.getByRole('button', { name: 'Styled Button' });
        expect(button).toBeDisabled();
    });

    it('renders with custom tooltip props', () => {
        render(
            <TooltipButton 
                tooltip="Custom tooltip" 
                tooltipProps={{ placement: 'top' }}
            >
                Custom
            </TooltipButton>
        );
        
        expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();
    });
});

