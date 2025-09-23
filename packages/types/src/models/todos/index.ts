/**
 * To-Do List Entity Definitions
 * 
 * This module contains all interface definitions related to to-do list functionality,
 * including todo items, input structures, and response types.
 */

/**
 * To-do item with task details and completion status
 */
export interface ToDoItem {
    id?: number;
    title: string;
    description: string;
    link: string;
    dueDate: string; // ISO string
    isCompleted: boolean;
}

/**
 * Input data for creating or updating a to-do item
 */
export interface TodoRequest {
    title: string;
    description?: string;
    link?: string;
    dueDate?: string; // ISO string, optional
    isCompleted?: boolean;
}