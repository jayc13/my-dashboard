/**
 * Notification Entity Definitions
 * 
 * This module contains all interface definitions related to system notifications,
 * including notification types, input structures, and notification entities.
 */

/**
 * Available notification types
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * System notification entity
 */
export interface Notification {
    id?: number;
    title: string;
    message: string;
    link?: string;
    type: NotificationType;
    is_read: boolean;
    created_at: string;
}

/**
 * Input data for creating notifications
 */
export interface NotificationInput {
    title: string;
    message: string;
    link?: string; // Optional, can be undefined
    type: NotificationType;
    is_read?: boolean;
    created_at?: string;
}

/**
 * Client-side notification interface (with different property names for compatibility)
 */
export interface ClientNotification {
    id: number;
    title: string;
    message: string;
    link?: string;
    type: string; // e.g., "info", "warning", "error"
    read: boolean;
    created_at: string;
}
