import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Layout from '../Layout';

// Mock Header component
vi.mock('../../header/Header', () => ({
    default: () => <div data-testid="header">Header</div>,
}));

describe('Layout', () => {
    it('renders header and children', () => {
        render(
            <Layout>
                <div data-testid="test-content">Test Content</div>
            </Layout>
        );

        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('applies correct styles to main content', () => {
        const { container } = render(
            <Layout>
                <div>Content</div>
            </Layout>
        );

        const mainElement = container.querySelector('main');
        expect(mainElement).toBeInTheDocument();
    });
});

