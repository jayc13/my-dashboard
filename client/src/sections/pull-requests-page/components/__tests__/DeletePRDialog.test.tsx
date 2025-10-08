import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DeletePRDialog from '../DeletePRDialog';

describe('DeletePRDialog', () => {
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders when open', () => {
        render(
            <DeletePRDialog
                open={true}
                isDeleting={false}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );
        
        expect(screen.getByTestId('delete-pr-dialog')).toBeInTheDocument();
        expect(screen.getByText('Delete Pull Request')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to delete this pull request?')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <DeletePRDialog
                open={false}
                isDeleting={false}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );
        
        expect(screen.queryByTestId('delete-pr-dialog')).not.toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(
            <DeletePRDialog
                open={true}
                isDeleting={false}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );
        
        const cancelButton = screen.getByTestId('pr-delete-cancel-button');
        fireEvent.click(cancelButton);
        
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when delete button is clicked', () => {
        render(
            <DeletePRDialog
                open={true}
                isDeleting={false}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );
        
        const confirmButton = screen.getByTestId('pr-delete-confirm-button');
        fireEvent.click(confirmButton);
        
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('disables buttons when deleting', () => {
        render(
            <DeletePRDialog
                open={true}
                isDeleting={true}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );
        
        const cancelButton = screen.getByTestId('pr-delete-cancel-button');
        const confirmButton = screen.getByTestId('pr-delete-confirm-button');
        
        expect(cancelButton).toBeDisabled();
        expect(confirmButton).toBeDisabled();
    });
});

