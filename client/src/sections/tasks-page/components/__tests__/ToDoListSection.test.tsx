import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ToDoListSection from '../ToDoListSection';

// Mock ToDoList component
vi.mock('../ToDoList', () => ({
  default: () => <div data-testid="todo-list-mock">ToDoList Component</div>,
}));

describe('ToDoListSection', () => {
  it('renders the ToDoList component', () => {
    render(<ToDoListSection />);
    expect(screen.getByTestId('todo-list-mock')).toBeInTheDocument();
    expect(screen.getByTestId('todo-list-mock')).toHaveTextContent('ToDoList Component');
  });
});

