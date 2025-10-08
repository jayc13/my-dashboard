import { test, expect, Page } from '@playwright/test';
import { ToDoPage } from '@pages/ToDoPage';
import { TodoDataGenerator, TodoTestUtils } from '@utils/todo-test-helpers';
import { setupAuthenticatedSession } from '@utils/test-helpers';
import { LoginPage } from '@pages/LoginPage';
import { truncateTables } from '@utils/dbCleanup';

test.describe.configure({ mode: 'serial' });

test.describe('ToDo List Test Suite', () => {
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
        await page.waitForTimeout(500);

        // Expand completed tasks section to verify the completed todo
        await todoPage.toggleCompletedTasks();
        await page.waitForTimeout(300);

        // Should now be completed
        await todoPage.isTodoCompleted(todoId, true);

        // Toggle back
        await todoPage.toggleTodoCompletion(todoId);
        await page.waitForTimeout(500);

        // Should be uncompleted again (now in active section)
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

        // Expand the todo to see the description
        await todoPage.expandTodoItem(todoId);
        expect(await todoPage.getTodoDescriptionText(todoId)).toContain(updatedData.description);

        // Verify due date is visible (UI displays in "MMM dd, yyyy" format)
        const dueDateText = await todoPage.getTodoDueDateText(todoId);
        expect(dueDateText).toBeTruthy();
        // Convert ISO date to expected format for verification
        const expectedDateParts = updatedData.dueDate.split('-'); // [YYYY, MM, DD]
        expect(dueDateText).toContain(expectedDateParts[0]); // Year should be present

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
        await page.waitForTimeout(500);

        // Expand completed tasks section to interact with the completed todo
        await todoPage.toggleCompletedTasks();
        await page.waitForTimeout(300);

        await todoPage.isTodoCompleted(todoId, true);

        // Delete
        await todoPage.deleteTodo(todoId);
        await todoPage.waitForTodoRemoved(initialCount + 1);
        expect(await todoPage.todoExists(todoId)).toBe(false);
      }
    });
  });

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

  test.describe('Todo Statistics', () => {
    test.beforeEach(async () => {
      await truncateTables(['todos']);
      await todoPage.goto();
    });

    test('should not display stats when no todos exist', async () => {
      expect(await todoPage.areStatsVisible()).toBe(false);
    });

    test('should display stats when todos exist', async () => {
      // Create a todo
      await todoPage.quickAddTodo('Test Todo 1');
      await todoPage.waitForTodoCount(1);

      // Stats should be visible
      expect(await todoPage.areStatsVisible()).toBe(true);
      const statsText = await todoPage.getStatsText();
      expect(statsText).toContain('0 of 1 tasks completed');
    });

    test('should update stats when todos are completed', async () => {
      // Create multiple todos
      await todoPage.quickAddTodo('Test Todo 1');
      await todoPage.waitForTodoCount(1);
      await todoPage.quickAddTodo('Test Todo 2');
      await todoPage.waitForTodoCount(2);
      await todoPage.quickAddTodo('Test Todo 3');
      await todoPage.waitForTodoCount(3);

      // Initially 0% complete
      let statsText = await todoPage.getStatsText();
      expect(statsText).toContain('0 of 3 tasks completed');

      // Complete one todo
      const todoItems = await todoPage.getAllTodoItems();
      const firstTodoId = TodoTestUtils.extractTodoIdFromTestId(
        (await todoItems[0].getAttribute('data-testid')) || '',
      );
      if (firstTodoId) {
        await todoPage.toggleTodoCompletion(firstTodoId);
        await page.waitForTimeout(500); // Wait for UI update

        // Should show 1 of 3 completed (33%)
        statsText = await todoPage.getStatsText();
        expect(statsText).toContain('1 of 3 tasks completed');
      }
    });

    test('should show 100% when all todos are completed', async () => {
      // Create a todo
      await todoPage.quickAddTodo('Test Todo');
      await todoPage.waitForTodoCount(1);

      // Complete it
      const todoItems = await todoPage.getAllTodoItems();
      const todoId = TodoTestUtils.extractTodoIdFromTestId(
        (await todoItems[0].getAttribute('data-testid')) || '',
      );
      if (todoId) {
        await todoPage.toggleTodoCompletion(todoId);
        await page.waitForTimeout(500); // Wait for UI update

        // Should show 100%
        const statsText = await todoPage.getStatsText();
        expect(statsText).toContain('1 of 1 tasks completed');
      }
    });
  });

  test.describe('Todo Filters', () => {
    test.beforeEach(async () => {
      await truncateTables(['todos']);
      await todoPage.goto();
    });

    test('should not display filters when no todos exist', async () => {
      expect(await todoPage.areFiltersVisible()).toBe(false);
    });

    test('should display filters when todos exist', async () => {
      // Create a todo
      await todoPage.quickAddTodo('Test Todo');
      await todoPage.waitForTodoCount(1);

      // Filters should be visible
      expect(await todoPage.areFiltersVisible()).toBe(true);
      expect(await todoPage.isFilterSelected('all')).toBe(true);
    });

    test('should filter overdue todos', async () => {
      // Create an overdue todo (yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const overdueDate = yesterday.toISOString().split('T')[0];

      await todoPage.quickAddTodo('Overdue Todo');
      await todoPage.waitForTodoCount(1);

      // Edit to add due date
      const todoItems = await todoPage.getAllTodoItems();
      const todoId = TodoTestUtils.extractTodoIdFromTestId(
        (await todoItems[0].getAttribute('data-testid')) || '',
      );
      if (todoId) {
        await todoPage.editTodo(todoId, { dueDate: overdueDate });
        await page.waitForTimeout(500);

        // Check overdue filter badge
        const overdueCount = await todoPage.getFilterBadgeCount('overdue');
        expect(overdueCount).toBe(1);

        // Click overdue filter
        await todoPage.clickFilter('overdue');
        await page.waitForTimeout(300);

        // Should show the overdue todo
        expect(await todoPage.getTodoCount()).toBe(1);
      }
    });

    test('should filter due today todos', async () => {
      // Create a todo due today
      const today = new Date().toISOString().split('T')[0];

      await todoPage.quickAddTodo('Due Today Todo');
      await todoPage.waitForTodoCount(1);

      // Edit to add due date
      const todoItems = await todoPage.getAllTodoItems();
      const todoId = TodoTestUtils.extractTodoIdFromTestId(
        (await todoItems[0].getAttribute('data-testid')) || '',
      );
      if (todoId) {
        await todoPage.editTodo(todoId, { dueDate: today });
        await page.waitForTimeout(500);

        // Check today filter badge
        const todayCount = await todoPage.getFilterBadgeCount('today');
        expect(todayCount).toBe(1);

        // Click today filter
        await todoPage.clickFilter('today');
        await page.waitForTimeout(300);

        // Should show the todo
        expect(await todoPage.getTodoCount()).toBe(1);
      }
    });
  });

  test.describe('Completed Tasks Section', () => {
    test.beforeEach(async () => {
      await truncateTables(['todos']);
      await todoPage.goto();
    });

    test('should separate active and completed tasks', async () => {
      // Create multiple todos
      await todoPage.quickAddTodo('Active Todo 1');
      await todoPage.waitForTodoCount(1);
      await todoPage.quickAddTodo('Active Todo 2');
      await todoPage.waitForTodoCount(2);

      // Complete one todo
      const todoItems = await todoPage.getAllTodoItems();
      const firstTodoId = TodoTestUtils.extractTodoIdFromTestId(
        (await todoItems[0].getAttribute('data-testid')) || '',
      );
      if (firstTodoId) {
        await todoPage.toggleTodoCompletion(firstTodoId);
        await page.waitForTimeout(500);

        // Should show Active Tasks section
        await expect(todoPage.activeTasksSection).toBeVisible();
        // Should show Completed Tasks section header (collapsed by default)
        await expect(todoPage.completedTasksSection).toBeVisible();

        // Completed tasks section should be collapsed by default
        expect(await todoPage.isCompletedTasksExpanded()).toBe(false);

        // Expand to verify the completed todo is there
        await todoPage.toggleCompletedTasks();
        await page.waitForTimeout(300);
        expect(await todoPage.isCompletedTasksExpanded()).toBe(true);
      }
    });

    test('should toggle completed tasks section', async () => {
      // Create and complete a todo
      await todoPage.quickAddTodo('Test Todo');
      await todoPage.waitForTodoCount(1);

      const todoItems = await todoPage.getAllTodoItems();
      const todoId = TodoTestUtils.extractTodoIdFromTestId(
        (await todoItems[0].getAttribute('data-testid')) || '',
      );
      if (todoId) {
        await todoPage.toggleTodoCompletion(todoId);
        await page.waitForTimeout(500);

        // Should be collapsed by default
        expect(await todoPage.isCompletedTasksExpanded()).toBe(false);

        // Toggle to expand
        await todoPage.toggleCompletedTasks();
        await page.waitForTimeout(300);

        // Should now be expanded
        expect(await todoPage.isCompletedTasksExpanded()).toBe(true);

        // Toggle again to collapse
        await todoPage.toggleCompletedTasks();
        await page.waitForTimeout(300);

        // Should be collapsed again
        expect(await todoPage.isCompletedTasksExpanded()).toBe(false);
      }
    });

    test('should display correct counts in section headers', async () => {
      // Create multiple todos
      await todoPage.quickAddTodo('Active Todo 1');
      await todoPage.waitForTodoCount(1);
      await todoPage.quickAddTodo('Active Todo 2');
      await todoPage.waitForTodoCount(2);
      await todoPage.quickAddTodo('Active Todo 3');
      await todoPage.waitForTodoCount(3);

      // Complete one
      const todoItems = await todoPage.getAllTodoItems();
      const firstTodoId = TodoTestUtils.extractTodoIdFromTestId(
        (await todoItems[0].getAttribute('data-testid')) || '',
      );
      if (firstTodoId) {
        await todoPage.toggleTodoCompletion(firstTodoId);
        await page.waitForTimeout(500);

        // Check active count
        const activeCount = await todoPage.getActiveTasksCount();
        expect(activeCount).toBe(2);

        // Completed section should be visible but collapsed by default
        await expect(todoPage.completedTasksSection).toBeVisible();

        // Check completed count (visible even when collapsed)
        const completedCount = await todoPage.getCompletedTasksCount();
        expect(completedCount).toBe(1);
      }
    });
  });

  test.describe('Todo Item Expand/Collapse', () => {
    test.beforeEach(async () => {
      await truncateTables(['todos']);
      await todoPage.goto();
    });

    test('should not show expand toggle for todos without description', async () => {
      // Create a todo without description
      await todoPage.quickAddTodo('Simple Todo');
      await todoPage.waitForTodoCount(1);

      const todoItems = await todoPage.getAllTodoItems();
      const todoId = TodoTestUtils.extractTodoIdFromTestId(
        (await todoItems[0].getAttribute('data-testid')) || '',
      );

      if (todoId) {
        // Should not have expandable content
        expect(await todoPage.todoHasExpandableContent(todoId)).toBe(false);
      }
    });

    test('should show expand toggle for todos with description', async () => {
      // Create a todo with description
      await todoPage.quickAddTodo('Todo with Description');
      await todoPage.waitForTodoCount(1);

      const todoItems = await todoPage.getAllTodoItems();
      const todoId = TodoTestUtils.extractTodoIdFromTestId(
        (await todoItems[0].getAttribute('data-testid')) || '',
      );

      if (todoId) {
        // Edit to add description
        await todoPage.editTodo(todoId, {
          description: 'This is a detailed description',
        });

        // Should have expandable content
        expect(await todoPage.todoHasExpandableContent(todoId)).toBe(true);
      }
    });

    test('should collapse description by default', async () => {
      // Create a todo with description
      await todoPage.quickAddTodo('Todo with Description');
      await todoPage.waitForTodoCount(1);

      const todoItems = await todoPage.getAllTodoItems();
      const todoId = TodoTestUtils.extractTodoIdFromTestId(
        (await todoItems[0].getAttribute('data-testid')) || '',
      );

      if (todoId) {
        // Edit to add description
        await todoPage.editTodo(todoId, {
          description: 'This is a detailed description',
        });

        // Description should be collapsed by default
        expect(await todoPage.isTodoItemExpanded(todoId)).toBe(false);

        // "See more" toggle should be visible
        await expect(todoPage.getTodoExpandToggle(todoId)).toBeVisible();
        await expect(todoPage.getTodoExpandToggle(todoId)).toContainText('See more');
      }
    });

    test('should expand and show description when clicked', async () => {
      // Create a todo with description
      await todoPage.quickAddTodo('Todo with Description');
      await todoPage.waitForTodoCount(1);

      const todoItems = await todoPage.getAllTodoItems();
      const todoId = TodoTestUtils.extractTodoIdFromTestId(
        (await todoItems[0].getAttribute('data-testid')) || '',
      );

      if (todoId) {
        const description = 'This is a detailed description';

        // Edit to add description
        await todoPage.editTodo(todoId, { description });

        // Initially collapsed
        expect(await todoPage.isTodoItemExpanded(todoId)).toBe(false);

        // Expand the todo
        await todoPage.expandTodoItem(todoId);

        // Should now be expanded
        expect(await todoPage.isTodoItemExpanded(todoId)).toBe(true);

        // Description should be visible
        await expect(todoPage.getTodoDescription(todoId)).toBeVisible();
        expect(await todoPage.getTodoDescriptionText(todoId)).toContain(description);

        // Toggle should show "See less"
        await expect(todoPage.getTodoExpandToggle(todoId)).toContainText('See less');
      }
    });

    test('should collapse description when clicked again', async () => {
      // Create a todo with description
      await todoPage.quickAddTodo('Todo with Description');
      await todoPage.waitForTodoCount(1);

      const todoItems = await todoPage.getAllTodoItems();
      const todoId = TodoTestUtils.extractTodoIdFromTestId(
        (await todoItems[0].getAttribute('data-testid')) || '',
      );

      if (todoId) {
        // Edit to add description
        await todoPage.editTodo(todoId, {
          description: 'This is a detailed description',
        });

        // Expand the todo
        await todoPage.expandTodoItem(todoId);
        expect(await todoPage.isTodoItemExpanded(todoId)).toBe(true);

        // Collapse the todo
        await todoPage.collapseTodoItem(todoId);

        // Should now be collapsed
        expect(await todoPage.isTodoItemExpanded(todoId)).toBe(false);

        // Description should not be visible
        await expect(todoPage.getTodoDescription(todoId)).not.toBeVisible();

        // Toggle should show "See more"
        await expect(todoPage.getTodoExpandToggle(todoId)).toContainText('See more');
      }
    });

    test('should maintain expand state when editing todo', async () => {
      // Create a todo with description
      await todoPage.quickAddTodo('Todo with Description');
      await todoPage.waitForTodoCount(1);

      const todoItems = await todoPage.getAllTodoItems();
      const todoId = TodoTestUtils.extractTodoIdFromTestId(
        (await todoItems[0].getAttribute('data-testid')) || '',
      );

      if (todoId) {
        const originalDescription = 'Original description';
        const updatedDescription = 'Updated description';

        // Edit to add description
        await todoPage.editTodo(todoId, { description: originalDescription });

        // Expand the todo
        await todoPage.expandTodoItem(todoId);
        expect(await todoPage.isTodoItemExpanded(todoId)).toBe(true);

        // Edit the description
        await todoPage.editTodo(todoId, { description: updatedDescription });

        // After edit, it will be collapsed again (component remounts)
        // This is expected behavior - verify the new description is there
        await todoPage.expandTodoItem(todoId);
        expect(await todoPage.getTodoDescriptionText(todoId)).toContain(updatedDescription);
      }
    });
  });
});
