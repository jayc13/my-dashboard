import { Page } from '@playwright/test';
import { DateTime } from 'luxon';
import { ToDoItem } from '@my-dashboard/types';

/**
 * Generate random test data for todos
 */
export class TodoDataGenerator {
  private static counter = 0;

  /**
   * Generate a unique counter for test data
   */
  private static getCounter(): number {
    return ++this.counter;
  }

  /**
   * Generate a simple todo with just a title
   */
  static simpleTodo(title?: string): ToDoItem {
    const counter = this.getCounter();
    return {
      description: '', dueDate: '', isCompleted: false, link: '',
      title: title || `Test Todo ${counter}`,
    };
  }

  /**
   * Generate a complete todo with all fields
   */
  static completeTodo(overrides?: Partial<ToDoItem>): ToDoItem {
    const counter = this.getCounter();
    const baseData: ToDoItem = {
      title: `Complete Todo ${counter}`,
      description: `This is a detailed description for todo ${counter}. It includes **markdown** formatting.`,
      link: `https://example.com/todo/${counter}`,
      dueDate: DateTime.now().plus({ days: counter }).toISODate(),
      isCompleted: false,
    };

    return { ...baseData, ...overrides };
  }


}
/**
 * Utility functions for todo testing
 */
export class TodoTestUtils {
  /**
   * Wait for API request to complete
   */

  static async interceptGetAllToDoLists(page: Page) {
    return page.waitForResponse(
      response => response.url().includes('/api/to_do_list') && response.request().method() === 'GET',
    );
  }

  static async interceptCreateToDoItem(page: Page) {
    return page.waitForResponse(
      response => response.url().includes('/api/to_do_list') && response.request().method() === 'POST',
    );
  }

  static async interceptUpdateToDoItem(page: Page, id: number) {
    return page.waitForResponse(
      response => response.url().includes(`/api/to_do_list/${id}`) && response.request().method() === 'PUT',
    );
  }

  static async interceptDeleteToDoItem(page: Page, id: number) {
    return page.waitForResponse(
      response => response.url().includes(`/api/to_do_list/${id}`) && response.request().method() === 'DELETE',
    );
  }

  /**
   * Generate a future date string for testing
   */
  static getFutureDate(daysFromNow: number = 7): string {
    return DateTime.now().plus({ days: daysFromNow }).toISODate();
  }




  /**
   * Extract todo ID from element data-testid
   */
  static extractTodoIdFromTestId(testId: string): number | null {
    const match = testId.match(/todo-item-(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

}