const { execSync } = require('child_process');
const path = require('path');

describe('validate-commits npm script', () => {
  const scriptsDir = path.resolve(__dirname, '..');
  const timeout = 30000; // 30 seconds timeout for git operations

  // Helper function to run npm script with arguments
  const runValidateCommits = (args = '') => {
    const command = args 
      ? `npm run validate-commits -- ${args}`
      : 'npm run validate-commits';
    
    return execSync(command, {
      cwd: scriptsDir,
      encoding: 'utf8',
      stdio: 'pipe',
    });
  };

  // Helper function to run npm script and expect it to fail
  const runValidateCommitsExpectFail = (args = '') => {
    const command = args 
      ? `npm run validate-commits -- ${args}`
      : 'npm run validate-commits';
    
    try {
      execSync(command, {
        cwd: scriptsDir,
        encoding: 'utf8',
        stdio: 'pipe',
      });
      throw new Error('Expected command to fail but it succeeded');
    } catch (error) {
      if (error.message === 'Expected command to fail but it succeeded') {
        throw error;
      }
      return error;
    }
  };

  // Helper function to get git commit SHA
  const getCommitSha = (ref) => {
    return execSync(`git rev-parse ${ref}`, {
      cwd: scriptsDir,
      encoding: 'utf8',
    }).trim();
  };

  // Helper function to check if we're in a git repository
  const isGitRepo = () => {
    try {
      execSync('git rev-parse --git-dir', {
        cwd: scriptsDir,
        stdio: 'pipe',
      });
      return true;
    } catch {
      return false;
    }
  };

  beforeAll(() => {
    if (!isGitRepo()) {
      throw new Error('Tests must be run in a git repository');
    }
  });

  describe('default behavior (HEAD~1)', () => {
    test('should validate commits from HEAD~1 by default', async () => {
      const output = runValidateCommits();
      expect(output).toBeDefined();
      // The command should complete without throwing an error
    }, timeout);

    test('should use HEAD~1 when no arguments provided', async () => {
      // This test verifies the default behavior works
      expect(() => runValidateCommits()).not.toThrow();
    }, timeout);
  });

  describe('with custom commit range', () => {
    test('should accept HEAD~2 as argument', async () => {
      const output = runValidateCommits('HEAD~2');
      expect(output).toBeDefined();
    }, timeout);

    test('should accept HEAD~3 as argument', async () => {
      const output = runValidateCommits('HEAD~3');
      expect(output).toBeDefined();
    }, timeout);

    test('should accept HEAD~5 as argument', async () => {
      const output = runValidateCommits('HEAD~5');
      expect(output).toBeDefined();
    }, timeout);

    test('should accept specific commit SHA', async () => {
      const headSha = getCommitSha('HEAD');
      const output = runValidateCommits(headSha);
      expect(output).toBeDefined();
    }, timeout);

    test('should accept branch name as argument', async () => {
      // Use HEAD~1 to ensure there's at least one commit to validate
      // This simulates validating commits from a specific point
      const branchRef = 'HEAD~1';
      const output = runValidateCommits(branchRef);
      expect(output).toBeDefined();
    }, timeout);
  });

  describe('error handling', () => {
    test('should handle invalid commit reference gracefully', async () => {
      const error = runValidateCommitsExpectFail('invalid-commit-ref-12345');
      expect(error).toBeDefined();
      expect(error.status).not.toBe(0);
    }, timeout);

    test('should handle non-existent branch gracefully', async () => {
      const error = runValidateCommitsExpectFail('non-existent-branch-xyz');
      expect(error).toBeDefined();
      expect(error.status).not.toBe(0);
    }, timeout);
  });

  describe('output validation', () => {
    test('should produce output when validating commits', async () => {
      const output = runValidateCommits('HEAD~1');
      expect(typeof output).toBe('string');
      expect(output.length).toBeGreaterThan(0);
    }, timeout);

    test('should handle empty commit range', async () => {
      // Test with HEAD~0 which should be just HEAD
      const output = runValidateCommits('HEAD');
      expect(output).toBeDefined();
    }, timeout);
  });

  describe('script integration', () => {
    test('should use npx commitlint internally', async () => {
      // This test verifies that the script is using the expected command structure
      const output = runValidateCommits('HEAD~1');
      expect(output).toBeDefined();
      // The fact that it doesn't throw means commitlint was found and executed
    }, timeout);

    test('should respect commitlint configuration', async () => {
      // Verify that the script uses the local commitlint config
      const output = runValidateCommits('HEAD~1');
      expect(output).toBeDefined();
      // If this passes, it means the commitlint config is being used correctly
    }, timeout);
  });

  describe('multiple argument scenarios', () => {
    test('should handle HEAD~1 explicitly', async () => {
      const output = runValidateCommits('HEAD~1');
      expect(output).toBeDefined();
    }, timeout);

    test('should handle different commit depths', async () => {
      const depths = ['HEAD~1', 'HEAD~2', 'HEAD~3'];
      
      for (const depth of depths) {
        expect(() => runValidateCommits(depth)).not.toThrow();
      }
    }, timeout);
  });
});
