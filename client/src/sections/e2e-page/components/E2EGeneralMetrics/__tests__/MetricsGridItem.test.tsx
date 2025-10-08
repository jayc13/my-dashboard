import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MetricsGridItem from '../MetricsGridItem';

describe('MetricsGridItem', () => {
    it('renders children', () => {
        render(
            <MetricsGridItem>
                <div>Test Content</div>
            </MetricsGridItem>,
        );
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
        render(
            <MetricsGridItem>
                <div>First</div>
                <div>Second</div>
            </MetricsGridItem>,
        );
        expect(screen.getByText('First')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
    });
});

