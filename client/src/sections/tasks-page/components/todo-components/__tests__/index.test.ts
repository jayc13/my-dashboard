import { describe, it, expect } from 'vitest';
import {
  TodoItem,
  TodoFormDialog,
  TodoDeleteDialog,
  TodoQuickAdd,
  TodoStats,
  TodoEmptyState,
  TodoFilters,
} from '../index';
import { TodoItem as ActualTodoItem } from '../TodoItem';
import { TodoFormDialog as ActualTodoFormDialog } from '../TodoFormDialog';
import { TodoDeleteDialog as ActualTodoDeleteDialog } from '../TodoDeleteDialog';
import { TodoQuickAdd as ActualTodoQuickAdd } from '../TodoQuickAdd';
import { TodoStats as ActualTodoStats } from '../TodoStats';
import { TodoEmptyState as ActualTodoEmptyState } from '../TodoEmptyState';
import { TodoFilters as ActualTodoFilters } from '../TodoFilters';

describe('todo-components index', () => {
  it('exports TodoItem', () => {
    expect(TodoItem).toBe(ActualTodoItem);
    expect(TodoItem).toBeDefined();
    expect(typeof TodoItem).toBe('function');
  });

  it('exports TodoFormDialog', () => {
    expect(TodoFormDialog).toBe(ActualTodoFormDialog);
    expect(TodoFormDialog).toBeDefined();
    expect(typeof TodoFormDialog).toBe('function');
  });

  it('exports TodoDeleteDialog', () => {
    expect(TodoDeleteDialog).toBe(ActualTodoDeleteDialog);
    expect(TodoDeleteDialog).toBeDefined();
    expect(typeof TodoDeleteDialog).toBe('function');
  });

  it('exports TodoQuickAdd', () => {
    expect(TodoQuickAdd).toBe(ActualTodoQuickAdd);
    expect(TodoQuickAdd).toBeDefined();
    expect(typeof TodoQuickAdd).toBe('function');
  });

  it('exports TodoStats', () => {
    expect(TodoStats).toBe(ActualTodoStats);
    expect(TodoStats).toBeDefined();
    expect(typeof TodoStats).toBe('function');
  });

  it('exports TodoEmptyState', () => {
    expect(TodoEmptyState).toBe(ActualTodoEmptyState);
    expect(TodoEmptyState).toBeDefined();
    expect(typeof TodoEmptyState).toBe('function');
  });

  it('exports TodoFilters', () => {
    expect(TodoFilters).toBe(ActualTodoFilters);
    expect(TodoFilters).toBeDefined();
    expect(typeof TodoFilters).toBe('function');
  });

  it('exports all components', () => {
    const exports = {
      TodoItem,
      TodoFormDialog,
      TodoDeleteDialog,
      TodoQuickAdd,
      TodoStats,
      TodoEmptyState,
      TodoFilters,
    };

    Object.values(exports).forEach(component => {
      expect(component).toBeDefined();
      expect(typeof component).toBe('function');
    });
  });
});
