/**
 * Delete Completed Todos Job Tests
 *
 * Tests for the delete completed todos job including:
 * - Job execution
 * - Basic functionality
 * - Error handling
 * - SDK mocking
 * - Todo deletion logic
 */

// Mock SDK
const mockGetTodos = jest.fn();
const mockDeleteTodo = jest.fn();

jest.mock('../src/utils/sdk', () => ({
  getSDK: jest.fn(() => ({
    todos: {
      getTodos: mockGetTodos,
      deleteTodo: mockDeleteTodo,
    },
  })),
}));

describe('Delete Completed Todos Job', () => {
  let deleteCompletedTodosJob: () => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    const jobModule = require('../src/jobs/delete-completed-todos.job');
    deleteCompletedTodosJob = jobModule.default;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Job Execution', () => {
    it('should execute without errors when no todos found', async () => {
      mockGetTodos.mockResolvedValueOnce([]);

      await expect(deleteCompletedTodosJob()).resolves.not.toThrow();
    });

    it('should log starting message', async () => {
      mockGetTodos.mockResolvedValueOnce([]);

      const consoleSpy = jest.spyOn(console, 'log');

      await deleteCompletedTodosJob();

      expect(consoleSpy).toHaveBeenCalledWith('='.repeat(60));
      expect(consoleSpy).toHaveBeenCalledWith('Running Delete Completed Todos Job...');
    });

    it('should complete successfully', async () => {
      mockGetTodos.mockResolvedValueOnce([]);

      const result = await deleteCompletedTodosJob();

      expect(result).toBeUndefined();
    });

    it('should log completion message', async () => {
      mockGetTodos.mockResolvedValueOnce([]);

      const consoleSpy = jest.spyOn(console, 'log');

      await deleteCompletedTodosJob();

      expect(consoleSpy).toHaveBeenCalledWith('✓ Delete Completed Todos Job completed successfully');
    });
  });

  describe('Job Behavior', () => {
    it('should be a function', () => {
      expect(typeof deleteCompletedTodosJob).toBe('function');
    });

    it('should return a promise', () => {
      mockGetTodos.mockResolvedValueOnce([]);

      const result = deleteCompletedTodosJob();

      expect(result).toBeInstanceOf(Promise);
    });

    it('should be callable multiple times', async () => {
      mockGetTodos.mockResolvedValue([]);

      await expect(deleteCompletedTodosJob()).resolves.not.toThrow();
      await expect(deleteCompletedTodosJob()).resolves.not.toThrow();
      await expect(deleteCompletedTodosJob()).resolves.not.toThrow();
    });
  });

  describe('SDK Fetch', () => {
    it('should fetch todos from SDK', async () => {
      mockGetTodos.mockResolvedValueOnce([]);

      await deleteCompletedTodosJob();

      expect(mockGetTodos).toHaveBeenCalled();
    });

    it('should handle SDK response with todos', async () => {
      const mockTodos = [
        { id: 1, title: 'Test todo 1', isCompleted: false },
        { id: 2, title: 'Test todo 2', isCompleted: true },
      ];

      mockGetTodos.mockResolvedValueOnce(mockTodos);
      mockDeleteTodo.mockResolvedValue({ success: true });

      await deleteCompletedTodosJob();

      expect(mockGetTodos).toHaveBeenCalledTimes(1);
    });

    it('should log fetched todos count', async () => {
      const mockTodos = [
        { id: 1, title: 'Test todo 1', isCompleted: false },
        { id: 2, title: 'Test todo 2', isCompleted: true },
        { id: 3, title: 'Test todo 3', isCompleted: true },
      ];

      mockGetTodos.mockResolvedValueOnce(mockTodos);
      mockDeleteTodo.mockResolvedValue({ success: true });

      const consoleSpy = jest.spyOn(console, 'log');

      await deleteCompletedTodosJob();

      expect(consoleSpy).toHaveBeenCalledWith('✓ Successfully fetched 3 to-do item(s)');
    });
  });

  describe('Todo Filtering', () => {
    it('should filter completed todos correctly', async () => {
      const mockTodos = [
        { id: 1, title: 'Active todo', isCompleted: false },
        { id: 2, title: 'Completed todo 1', isCompleted: true },
        { id: 3, title: 'Completed todo 2', isCompleted: true },
      ];

      mockGetTodos.mockResolvedValueOnce(mockTodos);
      mockDeleteTodo.mockResolvedValue({ success: true });

      const consoleSpy = jest.spyOn(console, 'log');

      await deleteCompletedTodosJob();

      expect(consoleSpy).toHaveBeenCalledWith('  - Completed todos: 2');
      expect(mockDeleteTodo).toHaveBeenCalledTimes(2);
    });

    it('should not delete any todos when none are completed', async () => {
      const mockTodos = [
        { id: 1, title: 'Active todo 1', isCompleted: false },
        { id: 2, title: 'Active todo 2', isCompleted: false },
      ];

      mockGetTodos.mockResolvedValueOnce(mockTodos);

      const consoleSpy = jest.spyOn(console, 'log');

      await deleteCompletedTodosJob();

      expect(consoleSpy).toHaveBeenCalledWith('  - Completed todos: 0');
      expect(consoleSpy).toHaveBeenCalledWith('  ℹ️  No completed todos to delete');
      expect(mockDeleteTodo).not.toHaveBeenCalled();
    });

    it('should handle all todos being completed', async () => {
      const mockTodos = [
        { id: 1, title: 'Completed todo 1', isCompleted: true },
        { id: 2, title: 'Completed todo 2', isCompleted: true },
        { id: 3, title: 'Completed todo 3', isCompleted: true },
      ];

      mockGetTodos.mockResolvedValueOnce(mockTodos);
      mockDeleteTodo.mockResolvedValue({ success: true });

      await deleteCompletedTodosJob();

      expect(mockDeleteTodo).toHaveBeenCalledTimes(3);
    });
  });

  describe('Todo Deletion', () => {
    it('should delete completed todos', async () => {
      const mockTodos = [
        { id: 1, title: 'Completed todo', isCompleted: true },
      ];

      mockGetTodos.mockResolvedValueOnce(mockTodos);
      mockDeleteTodo.mockResolvedValue({ success: true });

      await deleteCompletedTodosJob();

      expect(mockDeleteTodo).toHaveBeenCalledWith(1);
    });

    it('should delete multiple completed todos', async () => {
      const mockTodos = [
        { id: 1, title: 'Completed todo 1', isCompleted: true },
        { id: 2, title: 'Active todo', isCompleted: false },
        { id: 3, title: 'Completed todo 2', isCompleted: true },
        { id: 4, title: 'Completed todo 3', isCompleted: true },
      ];

      mockGetTodos.mockResolvedValueOnce(mockTodos);
      mockDeleteTodo.mockResolvedValue({ success: true });

      await deleteCompletedTodosJob();

      expect(mockDeleteTodo).toHaveBeenCalledTimes(3);
      expect(mockDeleteTodo).toHaveBeenCalledWith(1);
      expect(mockDeleteTodo).toHaveBeenCalledWith(3);
      expect(mockDeleteTodo).toHaveBeenCalledWith(4);
    });

    it('should log deletion success for each todo', async () => {
      const mockTodos = [
        { id: 1, title: 'Completed todo 1', isCompleted: true },
        { id: 2, title: 'Completed todo 2', isCompleted: true },
      ];

      mockGetTodos.mockResolvedValueOnce(mockTodos);
      mockDeleteTodo.mockResolvedValue({ success: true });

      const consoleSpy = jest.spyOn(console, 'log');

      await deleteCompletedTodosJob();

      expect(consoleSpy).toHaveBeenCalledWith('  ✓ Deleted todo #1: "Completed todo 1"');
      expect(consoleSpy).toHaveBeenCalledWith('  ✓ Deleted todo #2: "Completed todo 2"');
    });

    it('should skip todos without id', async () => {
      const mockTodos = [
        { title: 'Completed todo without id', isCompleted: true },
        { id: 2, title: 'Completed todo with id', isCompleted: true },
      ];

      mockGetTodos.mockResolvedValueOnce(mockTodos);
      mockDeleteTodo.mockResolvedValue({ success: true });

      await deleteCompletedTodosJob();

      expect(mockDeleteTodo).toHaveBeenCalledTimes(1);
      expect(mockDeleteTodo).toHaveBeenCalledWith(2);
    });
  });

  describe('Deletion Summary', () => {
    it('should log summary with success count', async () => {
      const mockTodos = [
        { id: 1, title: 'Completed todo 1', isCompleted: true },
        { id: 2, title: 'Completed todo 2', isCompleted: true },
      ];

      mockGetTodos.mockResolvedValueOnce(mockTodos);
      mockDeleteTodo.mockResolvedValue({ success: true });

      const consoleSpy = jest.spyOn(console, 'log');

      await deleteCompletedTodosJob();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Deletion Summary'));
      expect(consoleSpy).toHaveBeenCalledWith('  - Successfully deleted: 2');
      expect(consoleSpy).toHaveBeenCalledWith('  - Failed to delete: 0');
    });
  });

  describe('Error Handling', () => {
    it('should handle SDK fetch errors', async () => {
      mockGetTodos.mockRejectedValueOnce(new Error('Network error'));

      const consoleErrorSpy = jest.spyOn(console, 'error');

      await deleteCompletedTodosJob();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '\n❌ Error running Delete Completed Todos Job:',
        expect.any(Error),
      );
    });

    it('should handle deletion errors for individual todos', async () => {
      const mockTodos = [
        { id: 1, title: 'Completed todo 1', isCompleted: true },
        { id: 2, title: 'Completed todo 2', isCompleted: true },
      ];

      mockGetTodos.mockResolvedValueOnce(mockTodos);
      mockDeleteTodo
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce(new Error('Deletion failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error');
      const consoleSpy = jest.spyOn(console, 'log');

      await deleteCompletedTodosJob();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '  ❌ Error deleting todo #2:',
        expect.any(Error),
      );
      expect(consoleSpy).toHaveBeenCalledWith('  - Successfully deleted: 1');
      expect(consoleSpy).toHaveBeenCalledWith('  - Failed to delete: 1');
    });

    it('should continue deleting after individual failures', async () => {
      const mockTodos = [
        { id: 1, title: 'Completed todo 1', isCompleted: true },
        { id: 2, title: 'Completed todo 2', isCompleted: true },
        { id: 3, title: 'Completed todo 3', isCompleted: true },
      ];

      mockGetTodos.mockResolvedValueOnce(mockTodos);
      mockDeleteTodo
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce(new Error('Deletion failed'))
        .mockResolvedValueOnce({ success: true });

      await deleteCompletedTodosJob();

      expect(mockDeleteTodo).toHaveBeenCalledTimes(3);
    });

    it('should handle all deletions failing', async () => {
      const mockTodos = [
        { id: 1, title: 'Completed todo 1', isCompleted: true },
        { id: 2, title: 'Completed todo 2', isCompleted: true },
      ];

      mockGetTodos.mockResolvedValueOnce(mockTodos);
      mockDeleteTodo.mockRejectedValue(new Error('Deletion failed'));

      const consoleSpy = jest.spyOn(console, 'log');

      await deleteCompletedTodosJob();

      expect(consoleSpy).toHaveBeenCalledWith('  - Successfully deleted: 0');
      expect(consoleSpy).toHaveBeenCalledWith('  - Failed to delete: 2');
    });
  });
});

export {};

