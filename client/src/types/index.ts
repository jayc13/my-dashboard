// Re-export all entity types from the shared entity package
export * from '@my-dashboard/types';

// Client-specific type aliases for backward compatibility
export type { ClientNotification as Notification } from '@my-dashboard/entity/notifications';
export type { ClientTodo as ToDo } from '@my-dashboard/entity/todos';