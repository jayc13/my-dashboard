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
    isRead: boolean;
    createdAt: string;
}

/**
 * Input data for creating notifications
 */
export interface NotificationInput {
    title: string;
    message: string;
    link?: string; // Optional, can be undefined
    type: NotificationType;
    isRead?: boolean;
    createdAt?: string;
}