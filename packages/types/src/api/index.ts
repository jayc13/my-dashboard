/**
 * API Request/Response Entity Definitions
 * 
 * This module contains all interface definitions for API requests, responses,
 * and common API structures used across the My Dashboard REST API.
 */

// ============================================================================
// Authentication API
// ============================================================================

/**
 * Request structure for API key validation
 */
export interface AuthValidationRequest {
    apiKey: string;
}

/**
 * Response structure for API key validation
 */
export interface AuthValidationResponse {
    valid: boolean;
    message: string;
}

// ============================================================================
// Common Response Types
// ============================================================================

/**
 * Standard success response wrapper
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SuccessResponse<T = any> {
    success: boolean;
    data: T;
}

/**
 * Standard error response
 */
export interface ErrorResponse {
    error: string;
}

/**
 * Validation error response with detailed field errors
 */
export interface ValidationError {
    error: string;
    details?: ValidationErrorDetail[];
}

/**
 * Individual validation error detail
 */
export interface ValidationErrorDetail {
    field: string;
    message: string;
    code: string;
}

/**
 * Rate limit exceeded response
 */
export interface RateLimitResponse {
    error: string;
    retryAfter: number; // Time in seconds
}

// ============================================================================
// Health Check API
// ============================================================================

/**
 * Health check response
 */
export interface HealthCheckResponse {
    status: 'ok' | 'error';
    timestamp?: string;
    uptime?: number;
    version?: string;
}

// ============================================================================
// Generic API Response Types
// ============================================================================

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

/**
 * API operation result
 */
export interface ApiOperationResult {
    success: boolean;
    message: string;
    id?: number | string;
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
    success: boolean;
    processed: number;
    failed: number;
    errors?: string[];
}
