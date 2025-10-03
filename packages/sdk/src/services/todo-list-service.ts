import { BaseClient } from '../base-client';
import { ToDoItem, ToDoItemInput } from '@my-dashboard/types';

/**
 * To-Do Lists service
 */
export class TodosService extends BaseClient {
  /**
   * Get all to-do items
   * @returns Promise resolving to array of to-do items
   */
  public async getTodos(): Promise<ToDoItem[]> {
    return this.request<ToDoItem[]>('/api/to_do_list', {
      method: 'GET',
    });
  }

  /**
   * Get to-do item by ID
   * @param id To-do item ID
   * @returns Promise resolving to to-do item
   */
  public async getTodo(id: number): Promise<ToDoItem> {
    return this.request<ToDoItem>(`/api/to_do_list/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Create a new to-do item
   * @param todo To-do item data
   * @returns Promise resolving to creation response
   */
  public async createTodo(todo: ToDoItemInput): Promise<ToDoItem> {
    return this.request<ToDoItem>('/api/to_do_list', {
      method: 'POST',
      body: JSON.stringify(todo),
    });
  }

  /**
   * Update a to-do item
   * @param id To-do item ID
   * @param updates To-do item updates
   * @returns Promise resolving to updated to-do item
   */
  public async updateTodo(id: number, updates: ToDoItemInput): Promise<ToDoItem> {
    return this.request<ToDoItem>(`/api/to_do_list/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a to-do item
   * @param id To-do item ID
   * @returns Promise resolving to deletion confirmation
   */
  public async deleteTodo(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/to_do_list/${id}`, {
      method: 'DELETE',
    });
  }
}