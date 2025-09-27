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
}
