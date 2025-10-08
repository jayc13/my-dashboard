import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DeleteAppDialog from '../DeleteAppDialog';

describe('DeleteAppDialog', () => {
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders when open', () => {
        render(
            <DeleteAppDialog
                open={true}
                isDeleting={false}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );
        
        expect(screen.getByTestId('delete-app-dialog')).toBeInTheDocument();
        expect(screen.getByText('Delete App')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to delete this app?')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <DeleteAppDialog
                open={false}
                isDeleting={false}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );
        
        expect(screen.queryByTestId('delete-app-dialog')).not.toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(
            <DeleteAppDialog
                open={true}
                isDeleting={false}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );
        
        const cancelButton = screen.getByTestId('app-delete-cancel-button');
        fireEvent.click(cancelButton);
        
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when delete button is clicked', () => {
        render(
            <DeleteAppDialog
                open={true}
                isDeleting={false}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );
        
        const confirmButton = screen.getByTestId('app-delete-confirm-button');
        fireEvent.click(confirmButton);
        
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('disables buttons when deleting', () => {
        render(
            <DeleteAppDialog
                open={true}
                isDeleting={true}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );
        
        const cancelButton = screen.getByTestId('app-delete-cancel-button');
        const confirmButton = screen.getByTestId('app-delete-confirm-button');
        
        expect(cancelButton).toBeDisabled();
        expect(confirmButton).toBeDisabled();
    });
});

