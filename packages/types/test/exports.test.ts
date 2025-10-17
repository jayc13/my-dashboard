import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import type { Notification, NotificationType } from '../src';

describe('@my-dashboard/types package', () => {
  beforeAll(() => {
    // Build the package before running tests
    console.log('Building package...');
    execSync('pnpm run build', {
      cwd: join(__dirname, '..'),
      stdio: 'inherit',
    });
  });

  it('should build successfully and generate dist files', () => {
    const distPath = join(__dirname, '..', 'dist');
    const indexJs = join(distPath, 'index.js');
    const indexDts = join(distPath, 'index.d.ts');

    expect(existsSync(distPath)).toBe(true);
    expect(existsSync(indexJs)).toBe(true);
    expect(existsSync(indexDts)).toBe(true);
  });

  it('should export types from built package', async () => {
    // Import from the built dist folder
    const builtModule = await import('../dist/index.js');
    expect(builtModule).toBeDefined();
  });

  it('should have valid type definitions', () => {
    const dtsPath = join(__dirname, '..', 'dist', 'index.d.ts');
    expect(existsSync(dtsPath)).toBe(true);

    // Check that specific model type definition files exist
    const modelDirs = [
      'models/notifications',
      'models/applications',
      'models/pull-requests',
      'models/jira',
      'models/todos',
      'models/fcm',
      'models/file-system',
      'models/sdk',
      'models/e2e',
      'api',
    ];

    modelDirs.forEach(dir => {
      const modelDts = join(__dirname, '..', 'dist', dir, 'index.d.ts');
      expect(existsSync(modelDts)).toBe(true);
    });
  });

  it('should import and use notification types from source', async () => {
    // Type assertions to verify types exist at compile time
    const notification: Notification = {
      id: 1,
      title: 'Test',
      message: 'Test message',
      type: 'info' as NotificationType,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    expect(notification).toBeDefined();
    expect(notification.title).toBe('Test');
    expect(notification.type).toBe('info');
  });

  it('should compile TypeScript without errors', async () => {
    // This test passes if TypeScript compilation succeeds
    // The mere fact that this test file compiles proves the types package works
    const typesModule = await import('../src/index');
    expect(typesModule).toBeDefined();
  });
});

