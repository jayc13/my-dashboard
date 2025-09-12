import { FileSystemService } from '../services/file_system.service';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Mock environment variable
const originalDataDir = process.env.DATA_DIR;

describe('FileSystemService', () => {
  let testDataDir: string;

  beforeEach(() => {
    // Create a temporary test directory
    testDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-test-'));
    process.env.DATA_DIR = testDataDir;
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    // Restore original DATA_DIR
    process.env.DATA_DIR = originalDataDir;
  });

  describe('getDataDirInfo', () => {
    it('should return correct data directory information', () => {
      const info = FileSystemService.getDataDirInfo();
            
      expect(info).toHaveProperty('path');
      expect(info).toHaveProperty('exists');
      expect(info).toHaveProperty('isDirectory');
      expect(typeof info.path).toBe('string');
      expect(typeof info.exists).toBe('boolean');
      expect(typeof info.isDirectory).toBe('boolean');
      expect(info.exists).toBe(true);
      expect(info.isDirectory).toBe(true);
    });
  });

  describe('listDataDirectory', () => {
    beforeEach(() => {
      // Create test files and directories
      fs.writeFileSync(path.join(testDataDir, 'test.json'), '{"test": true}');
      fs.writeFileSync(path.join(testDataDir, 'data.txt'), 'test data');
      fs.mkdirSync(path.join(testDataDir, '2025-01-01'));
      fs.writeFileSync(path.join(testDataDir, '2025-01-01', 'summary.json'), '{}');
    });

    it('should reject paths outside DATA_DIR', async () => {
      await expect(FileSystemService.listDataDirectory('../')).rejects.toThrow('Access denied');
      await expect(FileSystemService.listDataDirectory('../../')).rejects.toThrow('Access denied');
    });

    it('should reject non-existent paths', async () => {
      await expect(FileSystemService.listDataDirectory('nonexistent')).rejects.toThrow('does not exist');
    });

    it('should return directory listing with correct structure', async () => {
      const listing = await FileSystemService.listDataDirectory();
            
      expect(listing).toHaveProperty('path');
      expect(listing).toHaveProperty('items');
      expect(listing).toHaveProperty('totalFiles');
      expect(listing).toHaveProperty('totalDirectories');
            
      expect(Array.isArray(listing.items)).toBe(true);
      expect(typeof listing.totalFiles).toBe('number');
      expect(typeof listing.totalDirectories).toBe('number');
            
      // Should have 2 files and 1 directory
      expect(listing.totalFiles).toBe(2);
      expect(listing.totalDirectories).toBe(1);
            
      // Check that each item has the correct structure
      listing.items.forEach(item => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('path');
        expect(item).toHaveProperty('modified');
        expect(['file', 'directory']).toContain(item.type);
                
        if (item.type === 'file') {
          expect(item).toHaveProperty('size');
          expect(typeof item.size).toBe('number');
        }
      });
    });
  });

  describe('deleteItem', () => {
    beforeEach(() => {
      // Create test files and directories
      fs.writeFileSync(path.join(testDataDir, 'test.json'), '{"test": true}');
      fs.writeFileSync(path.join(testDataDir, 'data.txt'), 'test data');
      fs.writeFileSync(path.join(testDataDir, '.env'), 'protected');
      fs.writeFileSync(path.join(testDataDir, 'config.exe'), 'executable');
      fs.mkdirSync(path.join(testDataDir, '2025-01-01'));
      fs.writeFileSync(path.join(testDataDir, '2025-01-01', 'summary.json'), '{}');
      fs.mkdirSync(path.join(testDataDir, 'protected-dir'));
      fs.writeFileSync(path.join(testDataDir, 'protected-dir', '.env'), 'protected');
    });

    it('should reject paths outside DATA_DIR', async () => {
      const result = await FileSystemService.deleteItem('../test.txt');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Access denied');
    });

    it('should reject non-existent paths', async () => {
      const result = await FileSystemService.deleteItem('nonexistent.txt');
      expect(result.success).toBe(false);
      expect(result.message).toContain('does not exist');
    });

    it('should reject protected files', async () => {
      const result = await FileSystemService.deleteItem('.env');
      expect(result.success).toBe(false);
      expect(result.message).toContain('protected');
    });

    it('should reject files with disallowed extensions', async () => {
      const result = await FileSystemService.deleteItem('config.exe');
      expect(result.success).toBe(false);
      expect(result.message).toContain('not allowed');
    });

    it('should successfully delete allowed files', async () => {
      const result = await FileSystemService.deleteItem('test.json');
      expect(result.success).toBe(true);
      expect(result.type).toBe('file');
      expect(result.message).toContain('deleted successfully');
      expect(fs.existsSync(path.join(testDataDir, 'test.json'))).toBe(false);
    });

    it('should successfully delete date-based directories', async () => {
      const result = await FileSystemService.deleteItem('2025-01-01');
      expect(result.success).toBe(true);
      expect(result.type).toBe('directory');
      expect(result.message).toContain('deleted successfully');
      expect(fs.existsSync(path.join(testDataDir, '2025-01-01'))).toBe(false);
    });

    it('should reject directories containing protected files', async () => {
      const result = await FileSystemService.deleteItem('protected-dir');
      expect(result.success).toBe(false);
      expect(result.message).toContain('contains protected files');
    });

    it('should return correct result structure', async () => {
      const result = await FileSystemService.deleteItem('test.json');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.path).toBe('string');
      expect(['file', 'directory']).toContain(result.type);
      expect(typeof result.message).toBe('string');
    });
  });
});
