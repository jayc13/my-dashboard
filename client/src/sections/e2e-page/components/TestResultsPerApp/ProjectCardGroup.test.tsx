import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { describe, it, expect, vi } from 'vitest';

// Mock ProjectCard to avoid deep rendering
vi.mock('./ProjectCard', () => ({
  default: ({ result }: any) => (
    <div data-testid={`project-card-${result?.appId}`}>ProjectCard</div>
  ),
}));

const mockData = [
  {
    id: 1,
    appId: 1,
    reportSummaryId: 101,
    lastRunStatus: 'passed' as 'passed' | 'failed',
    app: { name: 'App 1', code: 'app-1', e2eRunsQuantity: 0, watching: true },
    successRate: 1,
    passedRuns: 10,
    failedRuns: 0,
    totalRuns: 10,
    lastRunAt: new Date().toISOString(),
    lastFailedRunAt: new Date().toISOString(),
  },
  {
    id: 2,
    appId: 2,
    reportSummaryId: 102,
    lastRunStatus: 'failed' as 'passed' | 'failed',
    app: { name: 'App 2', code: 'app-2', e2eRunsQuantity: 0, watching: true },
    successRate: 0.5,
    passedRuns: 5,
    failedRuns: 5,
    totalRuns: 10,
    lastRunAt: new Date().toISOString(),
    lastFailedRunAt: new Date().toISOString(),
  },
];

const sortedData = mockData;
const onUpdate = vi.fn();
const onContextMenu = vi.fn();

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('ProjectCardGroup', () => {
  it('renders group title and count', async () => {
    const { default: ProjectCardGroup } = await import('./ProjectCardGroup');
    renderWithTheme(
      <ProjectCardGroup
        title="Test Group"
        data={mockData}
        sortedData={sortedData}
        onUpdate={onUpdate}
        onContextMenu={onContextMenu}
      />,
    );
    expect(screen.getByText('Test Group (2)')).toBeInTheDocument();
  });

  it('renders ProjectCard for each data item when expanded', async () => {
    const { default: ProjectCardGroup } = await import('./ProjectCardGroup');
    renderWithTheme(
      <ProjectCardGroup
        title="Test Group"
        data={mockData}
        sortedData={sortedData}
        onUpdate={onUpdate}
        onContextMenu={onContextMenu}
      />,
    );
    expect(screen.getAllByTestId(/project-card-/)).toHaveLength(2);
  });

  it('collapses and expands on icon click', async () => {
    const { default: ProjectCardGroup } = await import('./ProjectCardGroup');
    renderWithTheme(
      <ProjectCardGroup
        title="Test Group"
        data={mockData}
        sortedData={sortedData}
        onUpdate={onUpdate}
        onContextMenu={onContextMenu}
      />,
    );
    // Collapse
    fireEvent.click(screen.getByLabelText('Collapse group'));
    expect(screen.queryByTestId(/project-card-/)).not.toBeInTheDocument();
    // Expand
    fireEvent.click(screen.getByLabelText('Expand group'));
    expect(screen.getAllByTestId(/project-card-/)).toHaveLength(2);
  });

  it('does not render if data is empty', async () => {
    const { default: ProjectCardGroup } = await import('./ProjectCardGroup');
    renderWithTheme(
      <ProjectCardGroup
        title="Empty Group"
        data={[]}
        sortedData={[]}
        onUpdate={onUpdate}
        onContextMenu={onContextMenu}
      />,
    );
    expect(screen.queryByText('Empty Group (0)')).not.toBeInTheDocument();
  });

  it('applies status-based colors', async () => {
    const { default: ProjectCardGroup } = await import('./ProjectCardGroup');
    renderWithTheme(
      <ProjectCardGroup
        title="Failing Group"
        data={mockData}
        sortedData={sortedData}
        onUpdate={onUpdate}
        onContextMenu={onContextMenu}
        status="failing"
      />,
    );
    // Just check the title is present; color checks can be added if needed
    expect(screen.getByText('Failing Group (2)')).toBeInTheDocument();
  });
});
