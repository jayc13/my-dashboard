import { Request, Response } from 'express';
import { FileSystemController } from '../controllers/file_system.controller';
import { FileSystemService } from '../services/file_system.service';

// Mock the FileSystemService
jest.mock('../services/file_system.service');
const mockFileSystemService = FileSystemService as jest.Mocked<typeof FileSystemService>;

describe('FileSystemController', () => {
  let controller: FileSystemController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    controller = new FileSystemController();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        
    mockRequest = {
      query: {},
    };
        
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  describe('listDataDirectory', () => {
    it('should return directory listing successfully', async () => {
      const mockListing = {
        path: '/',
        items: [
          { name: 'test.json', type: 'file' as const, path: 'test.json', size: 100, modified: new Date() },
        ],
        totalFiles: 1,
        totalDirectories: 0,
      };

      mockFileSystemService.listDataDirectory.mockResolvedValue(mockListing);

      await controller.listDataDirectory(mockRequest as Request, mockResponse as Response);

      expect(mockFileSystemService.listDataDirectory).toHaveBeenCalledWith('');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockListing,
      });
    });

    it('should handle path parameter', async () => {
      mockRequest.query = { path: 'subdir' };
      const mockListing = {
        path: 'subdir',
        items: [],
        totalFiles: 0,
        totalDirectories: 0,
      };

      mockFileSystemService.listDataDirectory.mockResolvedValue(mockListing);

      await controller.listDataDirectory(mockRequest as Request, mockResponse as Response);

      expect(mockFileSystemService.listDataDirectory).toHaveBeenCalledWith('subdir');
    });

    it('should handle access denied error', async () => {
      mockFileSystemService.listDataDirectory.mockRejectedValue(new Error('Access denied: Path is outside of DATA_DIR'));

      await controller.listDataDirectory(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied: Path is outside of allowed directory',
      });
    });

    it('should handle not found error', async () => {
      mockFileSystemService.listDataDirectory.mockRejectedValue(new Error('Path does not exist: /nonexistent'));

      await controller.listDataDirectory(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Path not found',
      });
    });

    it('should handle generic errors', async () => {
      mockFileSystemService.listDataDirectory.mockRejectedValue(new Error('Some other error'));

      await controller.listDataDirectory(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to list directory contents',
      });
    });
  });

  describe('deleteItem', () => {
    it('should delete item successfully', async () => {
      mockRequest.query = { path: 'test.json' };
      const mockResult = {
        success: true,
        path: 'test.json',
        type: 'file' as const,
        message: 'File deleted successfully',
      };

      mockFileSystemService.deleteItem.mockResolvedValue(mockResult);

      await controller.deleteItem(mockRequest as Request, mockResponse as Response);

      expect(mockFileSystemService.deleteItem).toHaveBeenCalledWith('test.json');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it('should require path parameter', async () => {
      mockRequest.query = {};

      await controller.deleteItem(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Path parameter is required',
      });
    });

    it('should handle access denied error', async () => {
      mockRequest.query = { path: '../test.txt' };
      const mockResult = {
        success: false,
        path: '../test.txt',
        type: 'file' as const,
        message: 'Access denied: Path is outside of DATA_DIR',
      };

      mockFileSystemService.deleteItem.mockResolvedValue(mockResult);

      await controller.deleteItem(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied: Path is outside of DATA_DIR',
      });
    });

    it('should handle protected file error', async () => {
      mockRequest.query = { path: 'database.db' };
      const mockResult = {
        success: false,
        path: 'database.db',
        type: 'file' as const,
        message: 'File is protected and cannot be deleted',
      };

      mockFileSystemService.deleteItem.mockResolvedValue(mockResult);

      await controller.deleteItem(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'File is protected and cannot be deleted',
      });
    });

    it('should handle not found error', async () => {
      mockRequest.query = { path: 'nonexistent.txt' };
      const mockResult = {
        success: false,
        path: 'nonexistent.txt',
        type: 'file' as const,
        message: 'Path does not exist',
      };

      mockFileSystemService.deleteItem.mockResolvedValue(mockResult);

      await controller.deleteItem(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Path does not exist',
      });
    });

    it('should handle generic errors', async () => {
      mockRequest.query = { path: 'test.json' };
      mockFileSystemService.deleteItem.mockRejectedValue(new Error('Unexpected error'));

      await controller.deleteItem(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to delete item',
      });
    });
  });

  describe('getDataDirInfo', () => {
    it('should return data directory info successfully', async () => {
      const mockInfo = {
        path: '/test/data',
        exists: true,
        isDirectory: true,
      };

      mockFileSystemService.getDataDirInfo.mockReturnValue(mockInfo);
      process.env.DATA_DIR = '/test/data';

      await controller.getDataDirInfo(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          dataDir: '/test/data',
          exists: true,
          isDirectory: true,
          envVar: '/test/data',
        },
      });
    });

    it('should handle errors', async () => {
      mockFileSystemService.getDataDirInfo.mockImplementation(() => {
        throw new Error('Test error');
      });

      await controller.getDataDirInfo(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to get data directory information',
      });
    });
  });
});
