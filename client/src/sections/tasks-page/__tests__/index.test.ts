import { describe, it, expect } from 'vitest';
import TasksPageContainer from '../index';
import ActualTasksPageContainer from '../TasksPageContainer';

describe('tasks-page index', () => {
  it('exports TasksPageContainer as default', () => {
    expect(TasksPageContainer).toBe(ActualTasksPageContainer);
  });

  it('exports a valid component', () => {
    expect(TasksPageContainer).toBeDefined();
    expect(typeof TasksPageContainer).toBe('function');
  });
});
