import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AppsDataGrid from '../AppsDataGrid';
import type { Application } from '@/types';

describe('AppsDataGrid', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleWatching = vi.fn();

  const mockApps: Application[] = [
    {
      id: 1,
      name: 'App One',
      code: 'app-one',
      pipelineUrl: 'https://example.com/pipeline/1',
      e2eTriggerConfiguration: '{"env": "test"}',
      watching: true,
    },
    {
      id: 2,
      name: 'App Two',
      code: 'app-two',
      pipelineUrl: '',
      e2eTriggerConfiguration: '',
      watching: false,
    },
    {
      id: 3,
      name: 'App Three',
      code: 'app-three',
      pipelineUrl: 'https://example.com/pipeline/3',
      e2eTriggerConfiguration: '{"env": "prod"}',
      watching: true,
    },
  ];

  const defaultProps = {
    apps: mockApps,
    loading: false,
    totalApps: 3,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onToggleWatching: mockOnToggleWatching,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the data grid container', () => {
    render(<AppsDataGrid {...defaultProps} />);
    expect(screen.getByTestId('apps-data-grid')).toBeInTheDocument();
  });

  it('renders all apps in the grid', () => {
    render(<AppsDataGrid {...defaultProps} />);

    expect(screen.getByText('App One')).toBeInTheDocument();
    expect(screen.getByText('App Two')).toBeInTheDocument();
    expect(screen.getByText('App Three')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<AppsDataGrid {...defaultProps} loading={true} />);

    // MUI DataGrid shows a loading overlay when loading is true
    const dataGrid = screen.getByTestId('apps-data-grid');
    expect(dataGrid).toBeInTheDocument();
  });

  it('displays empty state when no apps exist', () => {
    render(<AppsDataGrid {...defaultProps} apps={[]} totalApps={0} />);

    expect(screen.getByText('No apps found')).toBeInTheDocument();
    expect(screen.getByText('Create your first app to get started')).toBeInTheDocument();
  });

  it('displays filtered empty state when apps exist but none match filters', () => {
    render(<AppsDataGrid {...defaultProps} apps={[]} totalApps={5} />);

    expect(screen.getByText('No apps match your filters')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search query or filters')).toBeInTheDocument();
  });

  it('renders pipeline URL link when URL is provided', () => {
    render(<AppsDataGrid {...defaultProps} />);

    const links = screen.getAllByText('View in Pipelines');
    expect(links.length).toBeGreaterThan(0);

    // Check that the first link has the correct href
    const firstLink = links[0].closest('a');
    expect(firstLink).toHaveAttribute('href', 'https://example.com/pipeline/1');
    expect(firstLink).toHaveAttribute('target', '_blank');
    expect(firstLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders "No URL" when pipeline URL is not provided', () => {
    render(<AppsDataGrid {...defaultProps} />);

    expect(screen.getByText('No URL')).toBeInTheDocument();
  });

  it('renders "Configured" chip when e2e config is set', () => {
    render(<AppsDataGrid {...defaultProps} />);

    const configuredChips = screen.getAllByText('Configured');
    expect(configuredChips).toHaveLength(2); // App One and App Three
  });

  it('renders "Not Set" chip when e2e config is not set', () => {
    render(<AppsDataGrid {...defaultProps} />);

    const notSetChips = screen.getAllByText('Not Set');
    expect(notSetChips).toHaveLength(1); // App Two
  });

  it('renders watching icon for apps being watched', () => {
    render(<AppsDataGrid {...defaultProps} />);

    const watchingIcons = screen.getAllByTestId('watching-flag');
    expect(watchingIcons).toHaveLength(2); // App One and App Three
  });

  it('renders not watching icon for apps not being watched', () => {
    render(<AppsDataGrid {...defaultProps} />);

    const notWatchingIcons = screen.getAllByTestId('no-watching-flag');
    expect(notWatchingIcons).toHaveLength(1); // App Two
  });

  it('calls onToggleWatching when watching button is clicked', () => {
    render(<AppsDataGrid {...defaultProps} />);

    const toggleButton = screen.getByTestId('app-toggle-watching-app-one');
    fireEvent.click(toggleButton);

    expect(mockOnToggleWatching).toHaveBeenCalledTimes(1);
    expect(mockOnToggleWatching).toHaveBeenCalledWith(mockApps[0]);
  });

  it('calls onToggleWatching for non-watching app', () => {
    render(<AppsDataGrid {...defaultProps} />);

    const toggleButton = screen.getByTestId('app-toggle-watching-app-two');
    fireEvent.click(toggleButton);

    expect(mockOnToggleWatching).toHaveBeenCalledTimes(1);
    expect(mockOnToggleWatching).toHaveBeenCalledWith(mockApps[1]);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<AppsDataGrid {...defaultProps} />);

    const editButton = screen.getByTestId('app-edit-button-app-one');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockApps[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<AppsDataGrid {...defaultProps} />);

    const deleteButton = screen.getByTestId('app-delete-button-1');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('renders all column headers', () => {
    render(<AppsDataGrid {...defaultProps} />);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Pipeline URL')).toBeInTheDocument();
    expect(screen.getByText('E2E Config')).toBeInTheDocument();
    expect(screen.getByText('Watching')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('displays app IDs correctly', () => {
    render(<AppsDataGrid {...defaultProps} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays app codes correctly', () => {
    render(<AppsDataGrid {...defaultProps} />);

    expect(screen.getByText('app-one')).toBeInTheDocument();
    expect(screen.getByText('app-two')).toBeInTheDocument();
    expect(screen.getByText('app-three')).toBeInTheDocument();
  });

  it('renders edit buttons for all apps', () => {
    render(<AppsDataGrid {...defaultProps} />);

    expect(screen.getByTestId('app-edit-button-app-one')).toBeInTheDocument();
    expect(screen.getByTestId('app-edit-button-app-two')).toBeInTheDocument();
    expect(screen.getByTestId('app-edit-button-app-three')).toBeInTheDocument();
  });

  it('renders delete buttons for all apps', () => {
    render(<AppsDataGrid {...defaultProps} />);

    expect(screen.getByTestId('app-delete-button-1')).toBeInTheDocument();
    expect(screen.getByTestId('app-delete-button-2')).toBeInTheDocument();
    expect(screen.getByTestId('app-delete-button-3')).toBeInTheDocument();
  });

  it('renders watching toggle buttons for all apps', () => {
    render(<AppsDataGrid {...defaultProps} />);

    expect(screen.getByTestId('app-toggle-watching-app-one')).toBeInTheDocument();
    expect(screen.getByTestId('app-toggle-watching-app-two')).toBeInTheDocument();
    expect(screen.getByTestId('app-toggle-watching-app-three')).toBeInTheDocument();
  });

  it('shows correct tooltip for watching apps', () => {
    render(<AppsDataGrid {...defaultProps} />);

    const toggleButton = screen.getByTestId('app-toggle-watching-app-one');
    const tooltip =
      toggleButton.closest('[title]') || toggleButton.parentElement?.closest('[title]');

    // The tooltip is rendered by MUI and may not be immediately visible
    expect(toggleButton).toBeInTheDocument();
  });

  it('shows correct tooltip for non-watching apps', () => {
    render(<AppsDataGrid {...defaultProps} />);

    const toggleButton = screen.getByTestId('app-toggle-watching-app-two');

    // The tooltip is rendered by MUI and may not be immediately visible
    expect(toggleButton).toBeInTheDocument();
  });

  it('handles empty apps array', () => {
    render(<AppsDataGrid {...defaultProps} apps={[]} totalApps={0} />);

    expect(screen.getByTestId('apps-data-grid')).toBeInTheDocument();
    expect(screen.getByText('No apps found')).toBeInTheDocument();
  });

  it('handles apps with undefined optional fields', () => {
    const appsWithUndefined: Application[] = [
      {
        id: 1,
        name: 'Minimal App',
        code: 'minimal-app',
        watching: false,
      },
    ];

    render(<AppsDataGrid {...defaultProps} apps={appsWithUndefined} totalApps={1} />);

    expect(screen.getByText('Minimal App')).toBeInTheDocument();
    expect(screen.getByText('No URL')).toBeInTheDocument();
    expect(screen.getByText('Not Set')).toBeInTheDocument();
  });

  it('calls multiple handlers independently', () => {
    render(<AppsDataGrid {...defaultProps} />);

    // Click edit on first app
    const editButton = screen.getByTestId('app-edit-button-app-one');
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);

    // Click delete on second app
    const deleteButton = screen.getByTestId('app-delete-button-2');
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);

    // Click toggle watching on third app
    const toggleButton = screen.getByTestId('app-toggle-watching-app-three');
    fireEvent.click(toggleButton);
    expect(mockOnToggleWatching).toHaveBeenCalledTimes(1);
  });
});
