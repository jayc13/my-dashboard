import { useCallback } from 'react';
import { useSDKData, useSDKMutation } from './useSDKData';
import { useSDK } from '../contexts/useSDK';
import type { 
  ToDoItem, 
  ToDoItemInput,
} from '@my-dashboard/types';

/**
 * Hook for todos data
 */
export function useTodos(options?: { enabled?: boolean; refetchInterval?: number }) {
  const { api } = useSDK();

  const fetcher = useCallback(async (): Promise<ToDoItem[]> => {
    if (!api) {
      throw new Error('API not available');
    }
    return api.todos.getTodos();
  }, [api]);

  return useSDKData(fetcher, options);
}

/**
 * Hook for single todo data
 */
export function useTodo(id: number, options?: { enabled?: boolean; refetchInterval?: number }) {
  const { api } = useSDK();

  const fetcher = useCallback(async (): Promise<ToDoItem> => {
    if (!api) {
throw new Error('API not available');
}
    return api.todos.getTodo(id);
  }, [api, id]);

  return useSDKData(fetcher, { ...options, enabled: options?.enabled !== false && !!id });
}

/**
 * Hook for creating todos
 */
export function useCreateTodo() {
  const { api } = useSDK();

  const mutationFn = useCallback(async (data: ToDoItemInput): Promise<ToDoItem> => {
    if (!api) {
throw new Error('API not available');
}
    return api.todos.createTodo(data);
  }, [api]);

  return useSDKMutation(mutationFn);
}

/**
 * Hook for updating todos
 */
export function useUpdateTodo() {
  const { api } = useSDK();

  const mutationFn = useCallback(async ({ id, data }: { id: number; data: ToDoItemInput }): Promise<ToDoItem> => {
    if (!api) {
throw new Error('API not available');
}
    return api.todos.updateTodo(id, data);
  }, [api]);

  return useSDKMutation(mutationFn);
}

/**
 * Hook for deleting todos
 */
export function useDeleteTodo() {
  const { api } = useSDK();

  const mutationFn = useCallback(async (id: number): Promise<{ success: boolean }> => {
    if (!api) {
throw new Error('API not available');
}
    return api.todos.deleteTodo(id);
  }, [api]);

  return useSDKMutation(mutationFn);
}

/**
 * Hook for toggling todo completion status
 */
export function useToggleTodo() {
  const { api } = useSDK();

  const mutationFn = useCallback(async ({ id, isCompleted }: { id: number; isCompleted: boolean }): Promise<ToDoItem> => {
    if (!api) {
throw new Error('API not available');
}
    
    // Get the current todo to preserve other fields
    const currentTodo = await api.todos.getTodo(id);
    
    // Update with the new completion status
    return api.todos.updateTodo(id, {
      title: currentTodo.title,
      description: currentTodo.description,
      link: currentTodo.link,
      dueDate: currentTodo.dueDate,
      isCompleted,
    });
  }, [api]);

  return useSDKMutation(mutationFn);
}
