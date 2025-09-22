/**
 * File System Entity Definitions
 * 
 * This module contains all interface definitions related to file system operations,
 * including file/directory information and operation results.
 */

/**
 * File system item (file or directory) information
 */
export interface FileSystemItem {
    name: string;
    type: 'file' | 'directory';
    path: string;
    size?: number;
    modified?: Date;
}

/**
 * Directory contents listing
 */
export interface DirectoryListing {
    path: string;
    items: FileSystemItem[];
    totalFiles: number;
    totalDirectories: number;
}

/**
 * Result of file/directory deletion operations
 */
export interface DeletionResult {
    success: boolean;
    path: string;
    type: 'file' | 'directory';
    message: string;
}
