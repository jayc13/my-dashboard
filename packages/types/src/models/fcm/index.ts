/**
 * Firebase Cloud Messaging Entity Definitions
 * 
 * This module contains all interface definitions related to Firebase Cloud Messaging,
 * including message structures, device tokens, and API request/response types.
 */

/**
 * FCM notification message structure
 */
export interface FCMMessage {
    title: string;
    body: string;
    data?: { [key: string]: string };
    link?: string;
}

/**
 * FCM device token information
 */
export interface DeviceToken {
    id?: number;
    token: string;
    created_at?: string;
    last_used?: string;
}

/**
 * Request structure for registering FCM tokens
 */
export interface FCMTokenRequest {
    token: string;
}

/**
 * Response structure for FCM token registration
 */
export interface FCMTokenResponse {
    success: boolean;
    message: string;
    tokenId?: number;
}

/**
 * Request structure for sending test notifications
 */
export interface FCMTestNotificationRequest {
    title: string;
    body: string;
    link?: string;
    data?: { [key: string]: string };
}

/**
 * Response structure for test notification sending
 */
export interface FCMTestNotificationResponse {
    success: boolean;
    message: string;
    successCount: number;
    failureCount: number;
}

/**
 * Response structure for getting all FCM tokens
 */
export interface FCMTokensResponse {
    tokens: DeviceToken[];
    total: number;
}
