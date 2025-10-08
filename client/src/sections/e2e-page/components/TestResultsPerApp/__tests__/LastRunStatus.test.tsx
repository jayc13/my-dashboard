import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LastRunStatus from '../LastRunStatus';

describe('LastRunStatus', () => {
    it('renders success status', () => {
        render(<LastRunStatus status="success" />);
        expect(screen.getByText('Passed')).toBeInTheDocument();
    });

    it('renders failed status', () => {
        render(<LastRunStatus status="failed" />);
        expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('renders running status for unknown status', () => {
        render(<LastRunStatus status="unknown" />);
        expect(screen.getByText('Running')).toBeInTheDocument();
    });

    it('renders running status for pending', () => {
        render(<LastRunStatus status="pending" />);
        expect(screen.getByText('Running')).toBeInTheDocument();
    });
});

