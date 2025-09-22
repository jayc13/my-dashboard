/**
 * @my-dashboard/types
 * 
 * Shared entity interfaces and types for My Dashboard server and client applications.
 * This package provides a centralized location for all TypeScript interface definitions
 * and type declarations used across the My Dashboard ecosystem.
 */

// E2E Testing Entities
export * from './models/e2e';

// Notification Entities
export * from './models/notifications';

// Application Entities
export * from './models/applications';

// Pull Request Entities
export * from './models/pull-requests';

// JIRA Integration Entities
export * from './models/jira';

// To-Do List Entities
export * from './models/todos';

// Firebase Cloud Messaging Entities
export * from './models/fcm';

// File System Entities
export * from './models/file-system';

// SDK Configuration and Request Types
export * from './models/sdk';

// API Request/Response Entities
export * from './api';

// Note: All types are already exported via the wildcard exports above
// Individual type exports are available through the module-specific exports
