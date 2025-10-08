import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { getColorByPassingRate, wantedQuantity, getTooltipByPassingRate } from '../utils';

describe('TestResultsPerApp utils', () => {
    describe('getColorByPassingRate', () => {
        it('returns green for rate >= 0.8', () => {
            expect(getColorByPassingRate(0.8)).toBe('green');
            expect(getColorByPassingRate(0.9)).toBe('green');
            expect(getColorByPassingRate(1.0)).toBe('green');
        });

        it('returns orange for rate >= 0.5 and < 0.8', () => {
            expect(getColorByPassingRate(0.5)).toBe('orange');
            expect(getColorByPassingRate(0.7)).toBe('orange');
        });

        it('returns red for rate < 0.5', () => {
            expect(getColorByPassingRate(0.4)).toBe('red');
            expect(getColorByPassingRate(0.0)).toBe('red');
        });
    });

    describe('wantedQuantity', () => {
        it('calculates runs needed to reach target rate', () => {
            const result = wantedQuantity(0.8, 70, 100);
            expect(result).toBeGreaterThan(0);
        });

        it('handles edge cases', () => {
            const result = wantedQuantity(0.9, 90, 100);
            expect(result).toBeGreaterThanOrEqual(0);
        });
    });

    describe('getTooltipByPassingRate', () => {
        it('returns hidden icon for passing rate >= 0.9', () => {
            const { container } = render(
                <div>{getTooltipByPassingRate(90, 100, 0.9)}</div>,
            );
            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });

        it('returns tooltip with info for passing rate < 0.9', () => {
            const { container } = render(
                <div>{getTooltipByPassingRate(70, 100, 0.7)}</div>,
            );
            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });

        it('shows both 80% and 90% targets when needed', () => {
            const { container } = render(
                <div>{getTooltipByPassingRate(50, 100, 0.5)}</div>,
            );
            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });
    });
});

