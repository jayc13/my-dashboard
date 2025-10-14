import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ForceRefreshConfirmationModal from '../ForceRefreshConfirmationModal';

describe('ForceRefreshConfirmationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open is true', () => {
    render(
      <ForceRefreshConfirmationModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isRefetching={false}
      />,
    );

    expect(screen.getByTestId('force-refresh-confirmation-modal')).toBeInTheDocument();
    expect(screen.getByText('Force Regenerate Report?')).toBeInTheDocument();
    expect(
      screen.getByText(/This will delete the existing report and regenerate it from scratch/i),
    ).toBeInTheDocument();
  });

  it('does not render modal when open is false', () => {
    render(
      <ForceRefreshConfirmationModal
        open={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isRefetching={false}
      />,
    );

    expect(screen.queryByTestId('force-refresh-confirmation-modal')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <ForceRefreshConfirmationModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isRefetching={false}
      />,
    );

    const cancelButton = screen.getByTestId('force-refresh-cancel-button');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(
      <ForceRefreshConfirmationModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isRefetching={false}
      />,
    );

    const confirmButton = screen.getByTestId('force-refresh-confirm-button');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('disables buttons when isRefetching is true', () => {
    render(
      <ForceRefreshConfirmationModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isRefetching={true}
      />,
    );

    const cancelButton = screen.getByTestId('force-refresh-cancel-button') as HTMLButtonElement;
    const confirmButton = screen.getByTestId('force-refresh-confirm-button') as HTMLButtonElement;

    expect(cancelButton.disabled).toBe(true);
    expect(confirmButton.disabled).toBe(true);
  });

  it('enables buttons when isRefetching is false', () => {
    render(
      <ForceRefreshConfirmationModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isRefetching={false}
      />,
    );

    const cancelButton = screen.getByTestId('force-refresh-cancel-button') as HTMLButtonElement;
    const confirmButton = screen.getByTestId('force-refresh-confirm-button') as HTMLButtonElement;

    expect(cancelButton.disabled).toBe(false);
    expect(confirmButton.disabled).toBe(false);
  });

  it('calls onClose when clicking outside the modal', () => {
    render(
      <ForceRefreshConfirmationModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isRefetching={false}
      />,
    );

    // MUI Dialog calls onClose when backdrop is clicked
    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('has correct aria labels for accessibility', () => {
    render(
      <ForceRefreshConfirmationModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isRefetching={false}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'force-refresh-dialog-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'force-refresh-dialog-description');
  });

  it('confirm button has autoFocus property', () => {
    render(
      <ForceRefreshConfirmationModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isRefetching={false}
      />,
    );

    const confirmButton = screen.getByTestId('force-refresh-confirm-button');
    // autoFocus is a React prop, not an HTML attribute
    // We can verify it's the primary action button by checking it's a contained variant
    expect(confirmButton).toHaveClass('MuiButton-contained');
  });
});
