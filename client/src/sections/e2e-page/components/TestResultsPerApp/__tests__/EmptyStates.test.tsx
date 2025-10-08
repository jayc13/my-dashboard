import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NoTestResults, AllTestsPassing } from '../EmptyStates';

describe('EmptyStates', () => {
    describe('NoTestResults', () => {
        it('renders no test results message', () => {
            render(<NoTestResults />);
            expect(screen.getByText('No test results available.')).toBeInTheDocument();
        });

        it('renders as info alert', () => {
            render(<NoTestResults />);
            const alert = screen.getByRole('alert');
            expect(alert).toBeInTheDocument();
        });
    });

    describe('AllTestsPassing', () => {
        it('renders all tests passing message', () => {
            render(<AllTestsPassing />);
            expect(screen.getByText('All apps are passing! No failures to display.')).toBeInTheDocument();
        });

        it('renders as success alert', () => {
            render(<AllTestsPassing />);
            const alert = screen.getByRole('alert');
            expect(alert).toBeInTheDocument();
        });
    });
});

