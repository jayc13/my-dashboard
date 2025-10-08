import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PRStatusBanner from '../PRStatusBanner';
import type { GithubPullRequestDetails } from '@/types';

describe('PRStatusBanner', () => {
  const baseDetails: GithubPullRequestDetails = {
    id: 123,
    number: 123,
    title: 'Test PR',
    state: 'open',
    isDraft: false,
    url: 'https://github.com/owner/repo/pull/123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    closedAt: null,
    mergedAt: null,
    merged: false,
    mergeableState: 'unknown',
    labels: [],
    author: {
      username: 'testuser',
      avatarUrl: 'https://github.com/testuser.png',
      htmlUrl: 'https://github.com/testuser',
    },
  };

  it('shows approved banner for clean mergeable state', () => {
    render(<PRStatusBanner details={{ ...baseDetails, mergeableState: 'clean' }} />);

    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Ready to merge')).toBeInTheDocument();
  });

  it('shows approved banner for unstable mergeable state', () => {
    render(<PRStatusBanner details={{ ...baseDetails, mergeableState: 'unstable' }} />);

    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Ready to merge')).toBeInTheDocument();
  });

  it('shows ready for review banner when label is present', () => {
    render(
      <PRStatusBanner
        details={{
          ...baseDetails,
          mergeableState: 'dirty',
          labels: [{ name: 'Ready For Review', color: 'green' }],
        }}
      />,
    );

    expect(screen.getByText('Ready for Review')).toBeInTheDocument();
    expect(screen.getByText('In Code Review')).toBeInTheDocument();
  });

  it('prioritizes approved over ready for review', () => {
    render(
      <PRStatusBanner
        details={{
          ...baseDetails,
          mergeableState: 'clean',
          labels: [
            {
              name: 'Ready For Review',
              color: 'red',
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.queryByText('Ready for Review')).not.toBeInTheDocument();
  });

  it('shows no banner for closed PRs', () => {
    const { container } = render(<PRStatusBanner details={{ ...baseDetails, state: 'closed' }} />);

    expect(container.firstChild).toBeNull();
  });

  it('shows no banner when no special conditions are met', () => {
    const { container } = render(
      <PRStatusBanner details={{ ...baseDetails, mergeableState: 'dirty' }} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
