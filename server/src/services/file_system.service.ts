import * as fs from 'fs';
import * as path from 'path';

export interface FileSystemItem {
    name: string;
    type: 'file' | 'directory';
    path: string;
    size?: number;
    modified?: Date;
}

export interface DirectoryListing {
    path: string;
    items: FileSystemItem[];
    totalFiles: number;
    totalDirectories: number;
}

export interface DeletionResult {
    success: boolean;
    path: string;
    type: 'file' | 'directory';
    message: string;
}

export class FileSystemService {
  private static getDataDir(): string {
    const dataDir = process.env.DATA_DIR || './data';
    return path.resolve(dataDir);
  }

  /**
     * Protected files that should never be deleted
     */
  private static readonly PROTECTED_FILES = [
    '.env',
    'config.json',
    'package.json',
  ];

  /**
     * Allowed file extensions for deletion
     */
  private static readonly ALLOWED_EXTENSIONS = [
    '.json',
    '.txt',
    '.log',
    '.tmp',
    '.cache',
  ];

  /**
     * Checks if a file or directory is safe to delete
     */
  private static isSafeToDelete(itemPath: string, itemName: string): { safe: boolean; reason?: string } {
    // Check if it's a protected file
    if (this.PROTECTED_FILES.includes(itemName.toLowerCase())) {
      return { safe: false, reason: 'File is protected and cannot be deleted' };
    }

    // For files, check extension
    const ext = path.extname(itemName).toLowerCase();
    if (ext && !this.ALLOWED_EXTENSIONS.includes(ext)) {
      return { safe: false, reason: `File extension '${ext}' is not allowed for deletion` };
    }

    // Date-based directories are generally safe to delete (cache/temp data)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (datePattern.test(itemName)) {
      return { safe: true };
    }

    // Allow deletion of JSON files (except protected ones)
    if (ext === '.json') {
      return { safe: true };
    }

    // Allow deletion of directories that don't contain protected files
    return { safe: true };
  }

  /**
     * Lists all directories and files under the DATA_DIR
     * @param relativePath - Optional relative path within DATA_DIR to list (defaults to root)
     * @returns DirectoryListing with all items
     */
  static async listDataDirectory(relativePath: string = ''): Promise<DirectoryListing> {
    const dataDir = this.getDataDir();
    const targetPath = path.join(dataDir, relativePath);
        
    // Security check: ensure the target path is within DATA_DIR
    const resolvedTarget = path.resolve(targetPath);
    const resolvedDataDir = path.resolve(dataDir);
        
    if (!resolvedTarget.startsWith(resolvedDataDir)) {
      throw new Error('Access denied: Path is outside of DATA_DIR');
    }

    if (!fs.existsSync(resolvedTarget)) {
      throw new Error(`Path does not exist: ${relativePath || '/'}`);
    }

    const stat = fs.statSync(resolvedTarget);
    if (!stat.isDirectory()) {
      throw new Error(`Path is not a directory: ${relativePath || '/'}`);
    }

    const items: FileSystemItem[] = [];
    const entries = fs.readdirSync(resolvedTarget);

    for (const entry of entries) {
      const entryPath = path.join(resolvedTarget, entry);
      const entryStat = fs.statSync(entryPath);
      const relativeEntryPath = path.join(relativePath, entry);

      items.push({
        name: entry,
        type: entryStat.isDirectory() ? 'directory' : 'file',
        path: relativeEntryPath,
        size: entryStat.isFile() ? entryStat.size : undefined,
        modified: entryStat.mtime,
      });
    }

    // Sort items: directories first, then files, both alphabetically
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    const totalDirectories = items.filter(item => item.type === 'directory').length;
    const totalFiles = items.filter(item => item.type === 'file').length;

    return {
      path: relativePath || '/',
      items,
      totalFiles,
      totalDirectories,
    };
  }

  /**
     * Deletes a file or directory within DATA_DIR
     * @param relativePath - Relative path within DATA_DIR to delete
     * @returns DeletionResult with success status and details
     */
  static async deleteItem(relativePath: string): Promise<DeletionResult> {
    const dataDir = this.getDataDir();
    const targetPath = path.join(dataDir, relativePath);

    // Security check: ensure the target path is within DATA_DIR
    const resolvedTarget = path.resolve(targetPath);
    const resolvedDataDir = path.resolve(dataDir);

    if (!resolvedTarget.startsWith(resolvedDataDir)) {
      return {
        success: false,
        path: relativePath,
        type: 'file',
        message: 'Access denied: Path is outside of DATA_DIR',
      };
    }

    if (!fs.existsSync(resolvedTarget)) {
      return {
        success: false,
        path: relativePath,
        type: 'file',
        message: 'Path does not exist',
      };
    }

    const stat = fs.statSync(resolvedTarget);
    const itemType = stat.isDirectory() ? 'directory' : 'file';
    const itemName = path.basename(resolvedTarget);

    // Check if item is safe to delete
    const safetyCheck = this.isSafeToDelete(relativePath, itemName);
    if (!safetyCheck.safe) {
      return {
        success: false,
        path: relativePath,
        type: itemType,
        message: safetyCheck.reason || 'Item cannot be deleted',
      };
    }

    try {
      if (stat.isDirectory()) {
        // For directories, check if they contain protected files
        const containsProtected = await this.containsProtectedFiles(resolvedTarget);
        if (containsProtected.hasProtected) {
          return {
            success: false,
            path: relativePath,
            type: 'directory',
            message: `Directory contains protected files: ${containsProtected.protectedFiles.join(', ')}`,
          };
        }

        // Remove directory recursively
        fs.rmSync(resolvedTarget, { recursive: true, force: true });
      } else {
        // Remove file
        fs.unlinkSync(resolvedTarget);
      }

      return {
        success: true,
        path: relativePath,
        type: itemType,
        message: `${itemType === 'directory' ? 'Directory' : 'File'} deleted successfully`,
      };
    } catch (error) {
      return {
        success: false,
        path: relativePath,
        type: itemType,
        message: `Failed to delete ${itemType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
     * Recursively checks if a directory contains protected files
     */
  private static async containsProtectedFiles(dirPath: string): Promise<{ hasProtected: boolean; protectedFiles: string[] }> {
    const protectedFiles: string[] = [];

    const checkDirectory = (currentPath: string) => {
      const entries = fs.readdirSync(currentPath);

      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry);
        const entryStat = fs.statSync(entryPath);

        if (entryStat.isDirectory()) {
          checkDirectory(entryPath);
        } else {
          if (this.PROTECTED_FILES.includes(entry.toLowerCase())) {
            protectedFiles.push(path.relative(dirPath, entryPath));
          }
        }
      }
    };

    checkDirectory(dirPath);

    return {
      hasProtected: protectedFiles.length > 0,
      protectedFiles,
    };
  }

  /**
     * Gets information about the DATA_DIR itself
     */
  static getDataDirInfo(): { path: string; exists: boolean; isDirectory: boolean } {
    const dataDir = this.getDataDir();
    const exists = fs.existsSync(dataDir);
    const isDirectory = exists ? fs.statSync(dataDir).isDirectory() : false;

    return {
      path: dataDir,
      exists,
      isDirectory,
    };
  }
}
