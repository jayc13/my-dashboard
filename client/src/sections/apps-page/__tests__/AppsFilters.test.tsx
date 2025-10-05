import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AppsFilters from '../components/AppsFilters';

describe('AppsFilters', () => {
    const mockOnSearchChange = vi.fn();
    const mockOnWatchingFilterChange = vi.fn();

    const defaultProps = {
        searchQuery: '',
        showOnlyWatching: true,
        onSearchChange: mockOnSearchChange,
        onWatchingFilterChange: mockOnWatchingFilterChange,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders search input and watching filter', () => {
        render(<AppsFilters {...defaultProps} />);

        expect(screen.getByTestId('apps-search-input')).toBeInTheDocument();
        expect(screen.getByTestId('apps-watching-filter')).toBeInTheDocument();
        expect(screen.getByText('Show only watching')).toBeInTheDocument();
    });

    it('displays current search query', () => {
        const propsWithQuery = {
            ...defaultProps,
            searchQuery: 'test query',
        };
        render(<AppsFilters {...propsWithQuery} />);

        const input = screen.getByTestId('apps-search-input').querySelector('input');
        expect(input).toHaveValue('test query');
    });

    it('calls onSearchChange when search input changes', () => {
        render(<AppsFilters {...defaultProps} />);

        const input = screen.getByTestId('apps-search-input').querySelector('input');
        fireEvent.change(input!, { target: { value: 'new search' } });

        expect(mockOnSearchChange).toHaveBeenCalledWith('new search');
    });

    it('calls onWatchingFilterChange when switch is toggled', () => {
        render(<AppsFilters {...defaultProps} />);

        const switchElement = screen.getByTestId('apps-watching-filter');
        fireEvent.click(switchElement);

        expect(mockOnWatchingFilterChange).toHaveBeenCalled();
    });

    it('reflects watching filter state', () => {
        const { rerender } = render(<AppsFilters {...defaultProps} showOnlyWatching={true} />);

        let switchElement = screen.getByTestId('apps-watching-filter').querySelector('input');
        expect(switchElement).toBeChecked();

        rerender(<AppsFilters {...defaultProps} showOnlyWatching={false} />);

        switchElement = screen.getByTestId('apps-watching-filter').querySelector('input');
        expect(switchElement).not.toBeChecked();
    });
});

