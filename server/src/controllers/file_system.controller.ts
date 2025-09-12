import { Request, Response } from 'express';
import { FileSystemService } from '../services/file_system.service';

export class FileSystemController {
  /**
     * Lists all directories and files under the DATA_DIR
     * GET /api/internal/files
     * Optional query parameter: path - relative path within DATA_DIR to list
     */
  async listDataDirectory(req: Request, res: Response) {
    try {
      const relativePath = req.query.path as string || '';
            
      const listing = await FileSystemService.listDataDirectory(relativePath);
            
      res.json({
        success: true,
        data: listing,
      });
    } catch (error) {
      console.error('Error listing data directory:', error);
            
      if (error instanceof Error) {
        if (error.message.includes('Access denied')) {
          return res.status(403).json({ 
            success: false, 
            error: 'Access denied: Path is outside of allowed directory', 
          });
        }
                
        if (error.message.includes('does not exist')) {
          return res.status(404).json({ 
            success: false, 
            error: 'Path not found', 
          });
        }
                
        if (error.message.includes('not a directory')) {
          return res.status(400).json({ 
            success: false, 
            error: 'Path is not a directory', 
          });
        }
      }
            
      res.status(500).json({ 
        success: false, 
        error: 'Failed to list directory contents', 
      });
    }
  }

  /**
     * Deletes a file or directory within DATA_DIR
     * DELETE /api/internal/files
     * Required query parameter: path - relative path within DATA_DIR to delete
     */
  async deleteItem(req: Request, res: Response) {
    try {
      const relativePath = req.query.path as string;

      if (!relativePath) {
        return res.status(400).json({
          success: false,
          error: 'Path parameter is required',
        });
      }

      const result = await FileSystemService.deleteItem(relativePath);

      if (result.success) {
        res.json({
          success: true,
          data: result,
        });
      } else {
        // Determine appropriate status code based on error message
        let statusCode = 500;
        if (result.message.includes('Access denied')) {
          statusCode = 403;
        } else if (result.message.includes('does not exist')) {
          statusCode = 404;
        } else if (result.message.includes('protected') || result.message.includes('not allowed')) {
          statusCode = 403;
        }

        res.status(statusCode).json({
          success: false,
          error: result.message,
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete item',
      });
    }
  }

  /**
     * Gets information about the DATA_DIR configuration
     * GET /api/internal/files/info
     */
  async getDataDirInfo(req: Request, res: Response) {
    try {
      const info = FileSystemService.getDataDirInfo();

      res.json({
        success: true,
        data: {
          dataDir: info.path,
          exists: info.exists,
          isDirectory: info.isDirectory,
          envVar: process.env.DATA_DIR || 'not set (using default: ./data)',
        },
      });
    } catch (error) {
      console.error('Error getting data directory info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get data directory information',
      });
    }
  }
}
