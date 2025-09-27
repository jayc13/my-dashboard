import { test, expect, Page } from '@playwright/test';
import { ToDoPage } from '@pages/ToDoPage';
import { TodoDataGenerator, TodoTestUtils } from '@utils/todo-test-helpers';
import { setupAuthenticatedSession } from '@utils/test-helpers';
import { LoginPage } from '@pages/LoginPage';
import { truncateTables } from '@utils/dbCleanup';

test.describe.configure({ mode: 'serial' });

test.describe('ToDo Complete Test Suite - Sequential Execution', () => {
  let todoPage: ToDoPage;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    await truncateTables(['todos']);
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await setupAuthenticatedSession(page);
  });

  test.beforeEach(async () => {
    todoPage = new ToDoPage(page);
    await todoPage.goto();
  });

  // ========================================
  // CRUD OPERATIONS TESTS
  // ========================================

  test.describe('Create ToDo Operations', () => {
    test('should create a simple todo using quick add', async () => {
      const todoData = TodoDataGenerator.simpleTodo('Test Quick Add Todo');
      const initialCount = await todoPage.getTodoCount();

      await todoPage.quickAddTodo(todoData.title);

      // Verify todo was added
      await todoPage.waitForTodoAdded(initialCount);
      const newCount = await todoPage.getTodoCount();
      expect(newCount).toBe(initialCount + 1);

      // Verify the todo appears in the list
      const todoItems = await todoPage.getAllTodoItems();
      const lastTodo = todoItems[todoItems.length - 1];
      const todoText = await lastTodo.textContent();
      expect(todoText).toContain(todoData.title);
    });
  });

  test.describe('Read ToDo', () => {
    test('should display empty state when no todos exist', async () => {
      // Assuming we start with no todos
      const todoCount = await todoPage.getTodoCount();
      
      if (todoCount === 0) {
        await expect(todoPage.emptyState).toBeVisible();
        expect(await todoPage.isEmptyStateVisible()).toBe(true);
      }
    });

    test('should display todo list when todos exist', async () => {
      // Create a test todo first
      const todoData = TodoDataGenerator.simpleTodo('Display Test Todo');
      await todoPage.quickAddTodo(todoData.title);

      // Verify the todo list is visible and contains the todo
      await expect(todoPage.todoList).toBeVisible();
      const todoCount = await todoPage.getTodoCount();
      expect(todoCount).toBeGreaterThan(0);

      // Verify empty state is not visible
      expect(await todoPage.isEmptyStateVisible()).toBe(false);
    });
  });

  test.describe('Update ToDo', () => {
    test('should toggle todo completion status', async () => {
      // Create a test todo
      const todoData = TodoDataGenerator.simpleTodo('Toggle Test Todo');
      await todoPage.quickAddTodo(todoData.title);

      // Find the created todo
      const todoItems = await todoPage.getAllTodoItems();
      const lastTodo = todoItems[todoItems.length - 1];
      const todoId = TodoTestUtils.extractTodoIdFromTestId(await lastTodo.getAttribute('data-testid') || '');
      
      if (todoId) {
        // Initially should not be completed
        await todoPage.isTodoCompleted(todoId, false);

        // Toggle completion
        await todoPage.toggleTodoCompletion(todoId);

        // Should now be completed
        await todoPage.isTodoCompleted(todoId, true);

        // Toggle back
        await todoPage.toggleTodoCompletion(todoId);

        // Should be uncompleted again
        await todoPage.isTodoCompleted(todoId, false);
      }
    });

    test('should edit todo using the edit dialog', async () => {
      // Create a test todo
      const originalData = TodoDataGenerator.completeTodo({
        title: 'Original Title',
      });
      await todoPage.quickAddTodo(originalData.title);

      // Find the created todo
      const todoItems = await todoPage.getAllTodoItems();
      const lastTodo = todoItems[todoItems.length - 1];
      const todoId = TodoTestUtils.extractTodoIdFromTestId(await lastTodo.getAttribute('data-testid') || '');

      if (todoId) {
        // Edit the todo
        const updatedData = {
          title: 'Updated Title',
          description: 'Updated description',
          link: 'https://example.com/updated',
          dueDate: TodoTestUtils.getFutureDate(10),
        };

        await todoPage.editTodo(todoId, updatedData);

        // Verify the changes
        expect(await todoPage.getTodoTitleText(todoId)).toContain(updatedData.title);
        expect(await todoPage.getTodoDescriptionText(todoId)).toContain(updatedData.description);
        expect(await todoPage.getTodoDueDateText(todoId)).toContain(updatedData.dueDate);
        expect(await todoPage.todoHasLink(todoId)).toBe(true);
      }
    });

    test('should cancel edit operation', async () => {
      // Create a test todo
      const originalData = TodoDataGenerator.simpleTodo('Cancel Edit Test');
      await todoPage.quickAddTodo(originalData.title);

      // Find the created todo
      const todoItems = await todoPage.getAllTodoItems();
      const lastTodo = todoItems[todoItems.length - 1];
      const todoId = TodoTestUtils.extractTodoIdFromTestId(await lastTodo.getAttribute('data-testid') || '');

      if (todoId) {
        const originalTitle = await todoPage.getTodoTitleText(todoId);

        // Open edit dialog
        await todoPage.getTodoEditButton(todoId).click();
        await expect(todoPage.formDialog).toBeVisible();

        // Make changes but cancel
        await todoPage.fillTodoForm({ title: 'Should Not Save' });
        await todoPage.cancelTodoForm();

        // Verify original title is unchanged
        expect(await todoPage.getTodoTitleText(todoId)).toBe(originalTitle);
      }
    });
  });

  test.describe('Delete ToDo', () => {
    test('should delete todo using delete button', async () => {
      // Create a test todo
      const todoData = TodoDataGenerator.simpleTodo('Delete Test Todo');
      await todoPage.quickAddTodo(todoData.title);

      const initialCount = await todoPage.getTodoCount();

      // Find the created todo
      const todoItems = await todoPage.getAllTodoItems();
      const lastTodo = todoItems[todoItems.length - 1];
      const todoId = TodoTestUtils.extractTodoIdFromTestId(await lastTodo.getAttribute('data-testid') || '');

      if (todoId) {
        // Delete the todo
        await todoPage.deleteTodo(todoId);

        // Verify todo was deleted
        await todoPage.waitForTodoRemoved(initialCount);
        const finalCount = await todoPage.getTodoCount();
        expect(finalCount).toBe(initialCount - 1);

        // Verify todo no longer exists
        expect(await todoPage.todoExists(todoId)).toBe(false);
      }
    });

    test('should cancel delete operation', async () => {
      // Create a test todo
      const todoData = TodoDataGenerator.simpleTodo('Cancel Delete Test');
      await todoPage.quickAddTodo(todoData.title);

      const initialCount = await todoPage.getTodoCount();

      // Find the created todo
      const todoItems = await todoPage.getAllTodoItems();
      const lastTodo = todoItems[todoItems.length - 1];
      const todoId = TodoTestUtils.extractTodoIdFromTestId(await lastTodo.getAttribute('data-testid') || '');

      if (todoId) {
        // Cancel delete operation
        await todoPage.cancelDeleteTodo(todoId);

        // Verify todo still exists
        const finalCount = await todoPage.getTodoCount();
        expect(finalCount).toBe(initialCount);
        expect(await todoPage.todoExists(todoId)).toBe(true);
      }
    });
  });

  test.describe('Complex CRUD Scenarios', () => {
    test('should handle complete CRUD workflow', async () => {
      const initialCount = await todoPage.getTodoCount();

      // Create
      const todoData = TodoDataGenerator.completeTodo({
        title: 'CRUD Workflow Test',
      });
      await todoPage.quickAddTodo(todoData.title);
      await todoPage.waitForTodoAdded(initialCount);

      // Read - verify creation
      const todoItems = await todoPage.getAllTodoItems();
      const createdTodo = todoItems[todoItems.length - 1];
      const todoId = TodoTestUtils.extractTodoIdFromTestId(await createdTodo.getAttribute('data-testid') || '');

      expect(todoId).toBeTruthy();
      if (todoId) {
        expect(await todoPage.getTodoTitleText(todoId)).toContain(todoData.title);

        // Update
        const updatedData = {
          title: 'Updated CRUD Test',
          description: 'Updated description',
        };
        await todoPage.editTodo(todoId, updatedData);
        expect(await todoPage.getTodoTitleText(todoId)).toContain(updatedData.title);

        // Toggle completion
        await todoPage.toggleTodoCompletion(todoId);
        await todoPage.isTodoCompleted(todoId, true);

        // Delete
        await todoPage.deleteTodo(todoId);
        await todoPage.waitForTodoRemoved(initialCount + 1);
        expect(await todoPage.todoExists(todoId)).toBe(false);
      }
    });
  });

  // ========================================
  // EDGE CASES AND BOUNDARY CONDITIONS
  // ========================================

  test.describe('Empty States and Boundary Conditions', () => {
    test.beforeAll(async () => {
      await truncateTables(['todos']);
    });

    test('should handle transition from empty to non-empty state', async () => {
      // Start with empty state (if applicable)
      const initialCount = await todoPage.getTodoCount();

      if (initialCount === 0) {
        await expect(todoPage.emptyState).toBeVisible();
      }

      // Add first todo
      const todoData = TodoDataGenerator.simpleTodo('First todo');
      await todoPage.quickAddTodo(todoData.title);

      // Empty state should disappear
      await expect(todoPage.emptyState).not.toBeVisible();

      // Todo should be visible
      await todoPage.waitForTodoCount(1);
      expect(await todoPage.getTodoCount()).toBe(1);
    });

    test('should handle transition from non-empty to empty state', async () => {
      // Create a todo first
      const todoData = TodoDataGenerator.simpleTodo('Last todo');
      await todoPage.quickAddTodo(todoData.title);

      // Delete the todo
      const todoItems = await todoPage.getAllTodoItems();

      const todoItemIds = [];

      for (const item of todoItems) {
        const id = TodoTestUtils.extractTodoIdFromTestId(await item.getAttribute('data-testid') || '');
        if (id) {
          todoItemIds.push(id);
        }
      }

      for (const id of todoItemIds) {
        await todoPage.deleteTodo(id);
      }

      // Should return to empty state
      await todoPage.waitForTodoCount(0);
      await expect(todoPage.emptyState).toBeVisible();
    });
  });
});
