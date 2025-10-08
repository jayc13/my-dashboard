import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotificationMenuHeader from '../NotificationMenuHeader';

describe('NotificationMenuHeader', () => {
  it('renders the header text', () => {
    render(<NotificationMenuHeader />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });
});
