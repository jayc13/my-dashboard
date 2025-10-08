import { expect, Locator, Page } from '@playwright/test';
import { TodoTestUtils } from '@utils/todo-test-helpers';

/**
 * Page Object Model for the ToDo Widget
 * Encapsulates all selectors and actions related to ToDo functionality
 */
export class ToDoPage {
  readonly page: Page;

  // Main container
  readonly todoWidget: Locator;
  readonly todoList: Locator;
  readonly errorAlert: Locator;
  readonly loadingIndicator: Locator;
  readonly emptyState: Locator;

  // Quick add form
  readonly quickAddForm: Locator;
  readonly quickAddInput: Locator;
  readonly quickAddButton: Locator;

  // Form dialog
  readonly formDialog: Locator;
  readonly formDialogTitle: Locator;
  readonly todoForm: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly linkInput: Locator;
  readonly dueDateInput: Locator;
  readonly formCancelButton: Locator;
  readonly formSubmitButton: Locator;

  // Delete dialog
  readonly deleteDialog: Locator;
  readonly deleteDialogTitle: Locator;
  readonly deleteDialogMessage: Locator;
  readonly deleteCancelButton: Locator;
  readonly deleteConfirmButton: Locator;

  // Filters
  readonly filterAllButton: Locator;
  readonly filterOverdueButton: Locator;
  readonly filterTodayButton: Locator;
  readonly filterDueSoonButton: Locator;

  // Stats
  readonly todoStats: Locator;

  // Sections
  readonly activeTasksSection: Locator;
  readonly completedTasksSection: Locator;
  readonly completedTasksToggle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main container
    this.todoWidget = page.locator('[data-testid="todo-widget"]');
    this.todoList = page.locator('[data-testid="todo-list"]');
    this.errorAlert = page.locator('[data-testid="todo-error-alert"]');
    this.loadingIndicator = page.locator('[data-testid="todo-loading"]');
    this.emptyState = page.locator('[data-testid="todo-empty-state"]');

    // Quick add form
    this.quickAddForm = page.locator('[data-testid="todo-quick-add-form"]');
    this.quickAddInput = page.locator('[data-testid="todo-quick-add-input"] input');
    this.quickAddButton = page.locator('[data-testid="todo-quick-add-button"]');

    // Filters
    this.filterAllButton = page.locator('button[value="all"][aria-label="all tasks"]');
    this.filterOverdueButton = page.locator('button[value="overdue"][aria-label="overdue tasks"]');
    this.filterTodayButton = page.locator('button[value="today"][aria-label="due today"]');
    this.filterDueSoonButton = page.locator('button[value="due-soon"][aria-label="due soon"]');

    // Stats
    this.todoStats = page.locator('text=/\\d+ of \\d+ tasks completed/');

    // Sections
    this.activeTasksSection = page.locator('text=Active Tasks');
    this.completedTasksSection = page.locator('text=Completed Tasks');
    this.completedTasksToggle = page.locator('[data-testid="completed-tasks-toggle"]');

    // Form dialog
    this.formDialog = page.locator('[data-testid="todo-form-dialog"]');
    this.formDialogTitle = page.locator('[data-testid="todo-form-dialog-title"]');
    this.todoForm = page.locator('[data-testid="todo-form"]');
    this.titleInput = page.locator('[data-testid="todo-form-title-input"] input');
    this.descriptionInput = page.locator('[data-testid="todo-form-description-input"] textarea[name="description"]');
    this.linkInput = page.locator('[data-testid="todo-form-link-input"] input');
    this.dueDateInput = page.locator('[data-testid="todo-form-due-date-input"] input');
    this.formCancelButton = page.locator('[data-testid="todo-form-cancel-button"]');
    this.formSubmitButton = page.locator('[data-testid="todo-form-submit-button"]');

    // Delete dialog
    this.deleteDialog = page.locator('[data-testid="todo-delete-dialog"]');
    this.deleteDialogTitle = page.locator('[data-testid="todo-delete-dialog-title"]');
    this.deleteDialogMessage = page.locator('[data-testid="todo-delete-dialog-message"]');
    this.deleteCancelButton = page.locator('[data-testid="todo-delete-cancel-button"]');
    this.deleteConfirmButton = page.locator('[data-testid="todo-delete-confirm-button"]');
  }

  /**
     * Navigate to the dashboard page where the ToDo widget is located
     */
  async goto(): Promise<void> {
    const getToDoListRequest = TodoTestUtils.interceptGetAllToDoLists(this.page);
    await this.page.goto('/');
    await getToDoListRequest;
  }

  /**
     * Get a todo item by ID
     */
  getTodoItem(id: number): Locator {
    return this.page.locator(`[data-testid="todo-item-${id}"]`);
  }

  /**
     * Get todo title by ID
     */
  getTodoTitle(id: number): Locator {
    return this.page.locator(`[data-testid="todo-title-${id}"]`);
  }

  /**
     * Get todo description by ID
     */
  getTodoDescription(id: number): Locator {
    return this.page.locator(`[data-testid="todo-description-${id}"]`);
  }

  /**
     * Get todo due date by ID
     */
  getTodoDueDate(id: number): Locator {
    return this.page.locator(`[data-testid="todo-due-date-${id}"]`);
  }

  /**
     * Get todo checkbox by ID
     */
  getTodoCheckbox(id: number): Locator {
    return this.page.locator(`[data-testid="todo-checkbox-${id}"] input[type="checkbox"]`);
  }

  /**
     * Get todo edit button by ID
     */
  getTodoEditButton(id: number): Locator {
    return this.page.locator(`[data-testid="todo-edit-button-${id}"]`);
  }

  /**
     * Get todo delete button by ID
     */
  getTodoDeleteButton(id: number): Locator {
    return this.page.locator(`[data-testid="todo-delete-button-${id}"]`);
  }

  /**
     * Get todo link button by ID
     */
  getTodoLinkButton(id: number): Locator {
    return this.page.locator(`[data-testid="todo-link-button-${id}"]`);
  }

  /**
     * Get todo expand/collapse toggle by ID
     */
  getTodoExpandToggle(id: number): Locator {
    return this.page.locator(`[data-testid="todo-expand-toggle-${id}"]`);
  }

  /**
     * Get todo content area (clickable to expand/collapse) by ID
     */
  getTodoContent(id: number): Locator {
    return this.page.locator(`[data-testid="todo-content-${id}"]`);
  }

  /**
     * Quick add a todo with just a title
     */
  async quickAddTodo(title: string): Promise<void> {
    await this.quickAddInput.fill(title);
    const createTodoItemRequest = TodoTestUtils.interceptCreateToDoItem(this.page);
    const getAllTodoListsRequest = TodoTestUtils.interceptGetAllToDoLists(this.page);
    await this.quickAddButton.click();
    await Promise.all([
      createTodoItemRequest,
      getAllTodoListsRequest,
    ]);
  }

  /**
     * Fill the todo form with provided data
     */
  async fillTodoForm(data: {
        title?: string;
        description?: string;
        link?: string;
        dueDate?: string;
    }): Promise<void> {
    if (data.title !== undefined) {
      await this.titleInput.fill(data.title);
    }
    if (data.description !== undefined) {
      await this.descriptionInput.fill(data.description);
    }
    if (data.link !== undefined) {
      await this.linkInput.fill(data.link);
    }
    if (data.dueDate !== undefined) {
      await this.dueDateInput.fill(data.dueDate);
    }
  }

  /**
     * Submit the todo form
     */
  async submitTodoForm(): Promise<void> {
    await this.formSubmitButton.click();
  }

  /**
     * Cancel the todo form
     */
  async cancelTodoForm(): Promise<void> {
    await this.formCancelButton.click();
    await expect(this.formDialog).not.toBeVisible();
  }

  /**
     * Edit a todo by ID
     */
  async editTodo(id: number, data: {
        title?: string;
        description?: string;
        link?: string;
        dueDate?: string;
    }): Promise<void> {
    await this.getTodoEditButton(id).click();
    await expect(this.formDialog).toBeVisible();
    await this.fillTodoForm(data);
    const updateTodoItemRequest = TodoTestUtils.interceptUpdateToDoItem(this.page, id);
    const getAllTodoListsRequest = TodoTestUtils.interceptGetAllToDoLists(this.page);
    await this.submitTodoForm();
    await Promise.all([
      updateTodoItemRequest,
      getAllTodoListsRequest,
    ]);
    // Wait for the dialog to close and todo to be added
    await expect(this.formDialog).not.toBeVisible();
  }

  /**
     * Delete a todo by ID
     */
  async deleteTodo(id: number): Promise<void> {
    await this.getTodoDeleteButton(id).click();
    await expect(this.deleteDialog).toBeVisible();
    const deleteTodoItemRequest = TodoTestUtils.interceptDeleteToDoItem(this.page, id);
    const getAllTodoListsRequest = TodoTestUtils.interceptGetAllToDoLists(this.page);
    await this.deleteConfirmButton.click();
    await Promise.all([
      deleteTodoItemRequest,
      getAllTodoListsRequest,
    ]);
    await expect(this.deleteDialog).not.toBeVisible();
  }

  /**
     * Cancel delete operation
     */
  async cancelDeleteTodo(id: number): Promise<void> {
    await this.getTodoDeleteButton(id).click();
    await expect(this.deleteDialog).toBeVisible();
    await this.deleteCancelButton.click();
    await expect(this.deleteDialog).not.toBeVisible();
  }

  /**
     * Toggle todo completion status by ID
     */
  async toggleTodoCompletion(id: number): Promise<void> {
    const getAllTodoListsRequest = TodoTestUtils.interceptGetAllToDoLists(this.page);
    const updateTodoItemRequest = TodoTestUtils.interceptUpdateToDoItem(this.page, id);
    await this.getTodoCheckbox(id).click();
    await Promise.all([
      getAllTodoListsRequest,
      updateTodoItemRequest,
    ]);
  }

  /**
     * Get all visible todo items
     */
  async getAllTodoItems(): Promise<Locator[]> {
    return await this.todoList.locator('[data-testid^="todo-item-"]').all();
  }

  /**
     * Get the count of visible todo items
     */
  async getTodoCount(): Promise<number> {
    return await this.todoList.locator('[data-testid^="todo-item-"]').count();
  }

  /**
     * Check if a todo exists by ID
     */
  async todoExists(id: number): Promise<boolean> {
    try {
      await this.getTodoItem(id).waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
     * Check if todo is completed by ID
     */
  async isTodoCompleted(id: number, expected: boolean): Promise<void> {
    if (!expected) {
      await expect(this.getTodoCheckbox(id)).not.toBeChecked();
    } else {
      await expect(this.getTodoCheckbox(id)).toBeChecked();
    }
  }

  /**
     * Get todo title text by ID
     */
  async getTodoTitleText(id: number): Promise<string> {
    return await this.getTodoTitle(id).textContent() || '';
  }

  /**
     * Get todo description text by ID
     */
  async getTodoDescriptionText(id: number): Promise<string> {
    const description = this.getTodoDescription(id);
    if (await description.isVisible()) {
      return await description.textContent() || '';
    }
    return '';
  }

  /**
     * Get todo due date text by ID
     */
  async getTodoDueDateText(id: number): Promise<string> {
    const dueDate = this.getTodoDueDate(id);
    if (await dueDate.isVisible()) {
      return await dueDate.textContent() || '';
    }
    return '';
  }

  /**
     * Check if todo has a link by ID
     */
  async todoHasLink(id: number): Promise<boolean> {
    return await this.getTodoLinkButton(id).isVisible();
  }

  /**
     * Check if empty state is visible
     */
  async isEmptyStateVisible(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  /**
     * Wait for a specific number of todos to be visible
     */
  async waitForTodoCount(expectedCount: number, timeout: number = 5000): Promise<void> {
    await this.page.waitForFunction(
      (count) => {
        const items = document.querySelectorAll('[data-testid^="todo-item-"]');
        return items.length === count;
      },
      expectedCount,
      { timeout },
    );
  }

  /**
     * Wait for a todo to be added (count to increase)
     */
  async waitForTodoAdded(previousCount: number): Promise<void> {
    await this.waitForTodoCount(previousCount + 1);
  }

  /**
     * Wait for a todo to be removed (count to decrease)
     */
  async waitForTodoRemoved(previousCount: number): Promise<void> {
    await this.waitForTodoCount(previousCount - 1);
  }

  /**
     * Click a filter button
     */
  async clickFilter(filter: 'all' | 'overdue' | 'today' | 'due-soon'): Promise<void> {
    const filterMap = {
      all: this.filterAllButton,
      overdue: this.filterOverdueButton,
      today: this.filterTodayButton,
      'due-soon': this.filterDueSoonButton,
    };
    await filterMap[filter].click();
  }

  /**
     * Get the badge count for a filter
     */
  async getFilterBadgeCount(filter: 'overdue' | 'today' | 'due-soon'): Promise<number> {
    const filterMap = {
      overdue: this.filterOverdueButton,
      today: this.filterTodayButton,
      'due-soon': this.filterDueSoonButton,
    };
    const badge = filterMap[filter].locator('span').filter({ hasText: /^\d+$/ });
    const isVisible = await badge.isVisible();
    if (!isVisible) {
      return 0;
    }
    const text = await badge.textContent();
    return parseInt(text || '0', 10);
  }

  /**
     * Check if a filter is selected
     */
  async isFilterSelected(filter: 'all' | 'overdue' | 'today' | 'due-soon'): Promise<boolean> {
    const filterMap = {
      all: this.filterAllButton,
      overdue: this.filterOverdueButton,
      today: this.filterTodayButton,
      'due-soon': this.filterDueSoonButton,
    };
    const classes = await filterMap[filter].getAttribute('class');
    return classes?.includes('Mui-selected') || false;
  }

  /**
     * Get stats text (e.g., "2 of 5 tasks completed")
     */
  async getStatsText(): Promise<string> {
    return (await this.todoStats.textContent()) || '';
  }

  /**
     * Get completion percentage from stats
     */
  async getCompletionPercentage(): Promise<number> {
    const percentText = await this.page
      .locator('text=/\\d+%/')
      .filter({ has: this.todoStats })
      .textContent();
    return parseInt(percentText?.replace('%', '') || '0', 10);
  }

  /**
     * Toggle completed tasks section
     */
  async toggleCompletedTasks(): Promise<void> {
    await this.completedTasksToggle.click();
  }

  /**
     * Check if completed tasks section is expanded
     */
  async isCompletedTasksExpanded(): Promise<boolean> {
    const completedTasksList = this.page.locator('[data-testid="completed-tasks-list"]');
    try {
      await completedTasksList.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
     * Get count of active tasks from section header
     */
  async getActiveTasksCount(): Promise<number> {
    const badge = this.activeTasksSection.locator('..').locator('text=/^\\d+$/');
    const text = await badge.textContent();
    return parseInt(text || '0', 10);
  }

  /**
     * Get count of completed tasks from section header
     */
  async getCompletedTasksCount(): Promise<number> {
    const badge = this.completedTasksSection.locator('..').locator('text=/^\\d+$/');
    const text = await badge.textContent();
    return parseInt(text || '0', 10);
  }

  /**
     * Check if stats are visible
     */
  async areStatsVisible(): Promise<boolean> {
    return await this.todoStats.isVisible();
  }

  /**
     * Check if filters are visible
     */
  async areFiltersVisible(): Promise<boolean> {
    return await this.filterAllButton.isVisible();
  }

  /**
     * Expand a todo item to show its description
     */
  async expandTodoItem(id: number): Promise<void> {
    const isExpanded = await this.isTodoItemExpanded(id);
    if (!isExpanded) {
      await this.getTodoContent(id).click();
      // Wait for the expand animation
      await this.page.waitForTimeout(300);
    }
  }

  /**
     * Collapse a todo item to hide its description
     */
  async collapseTodoItem(id: number): Promise<void> {
    const isExpanded = await this.isTodoItemExpanded(id);
    if (isExpanded) {
      await this.getTodoContent(id).click();
      // Wait for the collapse animation
      await this.page.waitForTimeout(300);
    }
  }

  /**
     * Check if a todo item is expanded (description visible)
     */
  async isTodoItemExpanded(id: number): Promise<boolean> {
    const description = this.getTodoDescription(id);
    try {
      await description.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
     * Check if a todo item has expandable content (has "See more" button)
     */
  async todoHasExpandableContent(id: number): Promise<boolean> {
    const expandToggle = this.getTodoExpandToggle(id);
    return await expandToggle.isVisible();
  }
}
