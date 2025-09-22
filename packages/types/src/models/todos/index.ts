/**
 * To-Do List Entity Definitions
 * 
 * This module contains all interface definitions related to to-do list functionality,
 * including todo items, input structures, and response types.
 */

/**
 * To-do item with task details and completion status
 */
export interface Todo {
    id?: number;
    title: string;
    description: string;
    link: string;
    due_date: string; // ISO string
    is_completed: boolean;
}

/**
 * Input data for creating or updating a to-do item
 */
export interface TodoInput {
    title: string;
    description?: string;
    link?: string;
    due_date?: string; // ISO string, optional
    is_completed?: boolean;
}

/**
 * Response structure for todo creation
 */
export interface TodoCreateResponse {
    id: number;
    success: boolean;
    message: string;
}

/**
 * Client-side todo interface (used in React components)
 */
export interface ClientTodo {
    id: number;
    title: string;
    description: string;
    link: string;
    due_date: string;
    is_completed: boolean;
}
