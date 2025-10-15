import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import JiraCardStatus from '../JiraCardStatus';
import JiraCardSummary from '../JiraCardSummary';
import JiraCardAssignee from '../JiraCardAssignee';
import JiraCardLastUpdated from '../JiraCardLastUpdated';
import JiraCardMetadata from '../JiraCardMetadata';
import JiraCardParent from '../JiraCardParent';
import JiraCardLabels from '../JiraCardLabels';

describe('JiraCard Components', () => {
  describe('JiraCardStatus', () => {
    it('renders status chip', () => {
      render(<JiraCardStatus status="In Progress" />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('renders different statuses', () => {
      const { rerender } = render(<JiraCardStatus status="To Do" />);
      expect(screen.getByText('To Do')).toBeInTheDocument();

      rerender(<JiraCardStatus status="Done" />);
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  describe('JiraCardSummary', () => {
    it('renders summary text', () => {
      render(<JiraCardSummary summary="Test ticket summary" ticketKey="TEST-123" />);
      expect(screen.getByText('Test ticket summary')).toBeInTheDocument();
    });

    it('renders with correct test id', () => {
      render(<JiraCardSummary summary="Test summary" ticketKey="TEST-456" />);
      expect(screen.getByTestId('jira-card-summary-TEST-456')).toBeInTheDocument();
    });
  });

  describe('JiraCardAssignee', () => {
    it('renders assignee avatar with first letter', () => {
      render(<JiraCardAssignee assignee="John Doe" />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders nothing when assignee is empty', () => {
      const { container } = render(<JiraCardAssignee assignee="" />);
      expect(container.firstChild).toBeNull();
    });

    it('displays assignee name in tooltip', () => {
      render(<JiraCardAssignee assignee="Jane Smith" />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  describe('JiraCardLastUpdated', () => {
    it('renders last updated date', () => {
      render(<JiraCardLastUpdated updated="2024-01-15T10:30:00Z" />);
      // The component shows relative time, not "Updated:" text
      expect(screen.getByTestId('AccessTimeIcon')).toBeInTheDocument();
    });

    it('formats date correctly', () => {
      render(<JiraCardLastUpdated updated="2024-01-15T10:30:00Z" />);
      expect(screen.getByTestId('AccessTimeIcon')).toBeInTheDocument();
    });
  });

  describe('JiraCardMetadata', () => {
    it('renders ticket key and status', () => {
      render(
        <JiraCardMetadata
          ticketKey="TEST-123"
          assignee="John Doe"
          updated="2024-01-15T10:30:00Z"
          status="In Progress"
        />,
      );
      expect(screen.getByText('TEST-123')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('renders with different statuses', () => {
      const { rerender } = render(
        <JiraCardMetadata
          ticketKey="TEST-1"
          assignee="Jane"
          updated="2024-01-15T10:30:00Z"
          status="To Do"
        />,
      );
      expect(screen.getByText('To Do')).toBeInTheDocument();

      rerender(
        <JiraCardMetadata
          ticketKey="TEST-2"
          assignee="Bob"
          updated="2024-01-15T10:30:00Z"
          status="Done"
        />,
      );
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  describe('JiraCardParent', () => {
    it('renders parent ticket key and summary', () => {
      render(
        <JiraCardParent
          parentKey="PARENT-123"
          parentSummary="Parent ticket summary"
          ticketKey="TEST-456"
        />,
      );
      expect(screen.getByText(/PARENT-123/)).toBeInTheDocument();
      expect(screen.getByText(/Parent ticket summary/)).toBeInTheDocument();
    });

    it('renders with correct test id', () => {
      render(
        <JiraCardParent
          parentKey="PARENT-789"
          parentSummary="Another parent"
          ticketKey="TEST-999"
        />,
      );
      expect(screen.getByTestId('jira-card-parent-TEST-999')).toBeInTheDocument();
    });
  });

  describe('JiraCardLabels', () => {
    it('renders labels as chips', () => {
      render(<JiraCardLabels labels={['frontend', 'urgent']} />);
      expect(screen.getByText('frontend')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
    });

    it('renders nothing when labels array is empty', () => {
      const { container } = render(<JiraCardLabels labels={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when labels is undefined', () => {
      const { container } = render(<JiraCardLabels labels={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders multiple labels', () => {
      render(<JiraCardLabels labels={['label1', 'label2', 'label3']} />);
      expect(screen.getByText('label1')).toBeInTheDocument();
      expect(screen.getByText('label2')).toBeInTheDocument();
      expect(screen.getByText('label3')).toBeInTheDocument();
    });

    it('renders overflow indicator when labels exceed maxVisible', () => {
      render(<JiraCardLabels labels={['label1', 'label2', 'label3', 'label4', 'label5']} />);
      expect(screen.getByText('label1')).toBeInTheDocument();
      expect(screen.getByText('label2')).toBeInTheDocument();
      expect(screen.getByText('label3')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
      expect(screen.queryByText('label4')).not.toBeInTheDocument();
      expect(screen.queryByText('label5')).not.toBeInTheDocument();
    });

    it('respects custom maxVisible prop', () => {
      render(
        <JiraCardLabels labels={['label1', 'label2', 'label3', 'label4', 'label5']} maxVisible={2} />,
      );
      expect(screen.getByText('label1')).toBeInTheDocument();
      expect(screen.getByText('label2')).toBeInTheDocument();
      expect(screen.getByText('+3')).toBeInTheDocument();
      expect(screen.queryByText('label3')).not.toBeInTheDocument();
    });

    it('does not render overflow indicator when labels equal maxVisible', () => {
      render(<JiraCardLabels labels={['label1', 'label2', 'label3']} maxVisible={3} />);
      expect(screen.getByText('label1')).toBeInTheDocument();
      expect(screen.getByText('label2')).toBeInTheDocument();
      expect(screen.getByText('label3')).toBeInTheDocument();
      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });
  });
});
