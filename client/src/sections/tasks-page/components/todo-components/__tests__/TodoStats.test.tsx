import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoStats } from '../TodoStats';
import type { ToDoItem } from '@my-dashboard/types/todos';

describe('TodoStats', () => {
  const createTodo = (id: number, isCompleted: boolean): ToDoItem => ({
    id,
    title: `Todo ${id}`,
    description: '',
    link: '',
    dueDate: '',
    isCompleted,
  });

  it('renders nothing when there are no todos', () => {
    const { container } = render(<TodoStats todos={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays correct stats for all incomplete todos', () => {
    const todos = [createTodo(1, false), createTodo(2, false), createTodo(3, false)];

    render(<TodoStats todos={todos} />);

    expect(screen.getByText('0 of 3 tasks completed')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('displays correct stats for all completed todos', () => {
    const todos = [createTodo(1, true), createTodo(2, true), createTodo(3, true)];

    render(<TodoStats todos={todos} />);

    expect(screen.getByText('3 of 3 tasks completed')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('displays correct stats for mixed completion', () => {
    const todos = [
      createTodo(1, true),
      createTodo(2, false),
      createTodo(3, true),
      createTodo(4, false),
    ];

    render(<TodoStats todos={todos} />);

    expect(screen.getByText('2 of 4 tasks completed')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays correct stats for single todo incomplete', () => {
    const todos = [createTodo(1, false)];

    render(<TodoStats todos={todos} />);

    expect(screen.getByText('0 of 1 tasks completed')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('displays correct stats for single todo completed', () => {
    const todos = [createTodo(1, true)];

    render(<TodoStats todos={todos} />);

    expect(screen.getByText('1 of 1 tasks completed')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('rounds completion percentage correctly', () => {
    const todos = [createTodo(1, true), createTodo(2, false), createTodo(3, false)];

    render(<TodoStats todos={todos} />);

    // 1/3 = 33.33%, should round to 33%
    expect(screen.getByText('33%')).toBeInTheDocument();
  });
});
