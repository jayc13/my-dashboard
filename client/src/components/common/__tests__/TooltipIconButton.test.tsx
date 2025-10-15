import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import TooltipIconButton from '../TooltipIconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

describe('TooltipIconButton', () => {
  it('renders icon button with children', () => {
    render(
      <TooltipIconButton aria-label="Delete">
        <DeleteIcon />
      </TooltipIconButton>,
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('renders button without tooltip when tooltip prop is not provided', () => {
    render(
      <TooltipIconButton aria-label="No Tooltip">
        <EditIcon />
      </TooltipIconButton>,
    );
    const button = screen.getByRole('button', { name: 'No Tooltip' });
    expect(button).toBeInTheDocument();
  });

  it('renders button with tooltip when tooltip prop is provided', () => {
    render(
      <TooltipIconButton tooltip="Delete item" aria-label="Delete">
        <DeleteIcon />
      </TooltipIconButton>,
    );
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when button is clicked', () => {
    const mockOnClick = vi.fn();
    render(
      <TooltipIconButton onClick={mockOnClick} aria-label="Clickable">
        <DeleteIcon />
      </TooltipIconButton>,
    );

    const button = screen.getByRole('button', { name: 'Clickable' });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('passes icon button props correctly', () => {
    render(
      <TooltipIconButton color="primary" disabled aria-label="Disabled Button">
        <DeleteIcon />
      </TooltipIconButton>,
    );

    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
  });

  it('renders with custom tooltip props', () => {
    render(
      <TooltipIconButton
        tooltip="Custom tooltip"
        tooltipProps={{ placement: 'top' }}
        aria-label="Custom"
      >
        <DeleteIcon />
      </TooltipIconButton>,
    );

    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();
  });

  it('renders as link when href is provided', () => {
    render(
      <TooltipIconButton href="https://example.com" aria-label="Link Button">
        <EditIcon />
      </TooltipIconButton>,
    );

    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders link with target and rel attributes', () => {
    render(
      <TooltipIconButton
        href="https://example.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="External Link"
      >
        <EditIcon />
      </TooltipIconButton>,
    );

    const link = screen.getByRole('link', { name: 'External Link' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('uses default component "a" when href is provided without component prop', () => {
    const { container } = render(
      <TooltipIconButton href="https://example.com" aria-label="Link">
        <EditIcon />
      </TooltipIconButton>,
    );

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('uses custom component when provided with href', () => {
    const CustomComponent = ({ children, ...props }: any) => (
      <div data-testid="custom-component" {...props}>
        {children}
      </div>
    );

    render(
      <TooltipIconButton
        href="https://example.com"
        component={CustomComponent}
        aria-label="Custom Component"
      >
        <EditIcon />
      </TooltipIconButton>,
    );

    expect(screen.getByTestId('custom-component')).toBeInTheDocument();
  });

  it('does not add link props when href is not provided', () => {
    const { container } = render(
      <TooltipIconButton aria-label="Regular Button">
        <DeleteIcon />
      </TooltipIconButton>,
    );

    const button = screen.getByRole('button', { name: 'Regular Button' });
    expect(button).not.toHaveAttribute('href');
    expect(button).not.toHaveAttribute('target');
    expect(button).not.toHaveAttribute('rel');
  });

  it('renders with different icon sizes', () => {
    render(
      <TooltipIconButton size="small" aria-label="Small Button">
        <DeleteIcon />
      </TooltipIconButton>,
    );

    const button = screen.getByRole('button', { name: 'Small Button' });
    expect(button).toBeInTheDocument();
  });

  it('renders with different colors', () => {
    render(
      <TooltipIconButton color="secondary" aria-label="Secondary Button">
        <DeleteIcon />
      </TooltipIconButton>,
    );

    const button = screen.getByRole('button', { name: 'Secondary Button' });
    expect(button).toBeInTheDocument();
  });

  it('renders with edge prop', () => {
    render(
      <TooltipIconButton edge="end" aria-label="Edge Button">
        <DeleteIcon />
      </TooltipIconButton>,
    );

    const button = screen.getByRole('button', { name: 'Edge Button' });
    expect(button).toBeInTheDocument();
  });

  it('combines tooltip with link functionality', () => {
    render(
      <TooltipIconButton
        tooltip="Visit external site"
        href="https://example.com"
        target="_blank"
        rel="noopener"
        aria-label="External Link with Tooltip"
      >
        <EditIcon />
      </TooltipIconButton>,
    );

    const link = screen.getByRole('link', { name: 'External Link with Tooltip' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('handles onClick with link functionality', () => {
    const mockOnClick = vi.fn();
    render(
      <TooltipIconButton
        onClick={mockOnClick}
        href="https://example.com"
        aria-label="Clickable Link"
      >
        <EditIcon />
      </TooltipIconButton>,
    );

    const link = screen.getByRole('link', { name: 'Clickable Link' });
    fireEvent.click(link);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});

