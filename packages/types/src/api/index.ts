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
// E2E Manual Runs API
// ============================================================================

/**
 * E2E manual test run record with CircleCI pipeline information
 */
export interface E2EManualRun {
    id?: number; // Auto-generated, read-only
    app_id: number;
    pipeline_id: string;
    created_at?: string; // Auto-generated, read-only
}

/**
 * Input data for creating an E2E manual run
 */
export interface E2EManualRunInput {
    app_id: number;
}

/**
 * Response after successfully updating or deleting an E2E manual run
 */
export interface E2EManualRunUpdateResponse {
    success: boolean;
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
