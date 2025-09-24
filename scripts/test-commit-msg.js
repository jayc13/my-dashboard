#!/usr/bin/env node

/**
 * Test utility for commit message validation
 * This script can be used to test commit messages against commitlint rules
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Test a commit message against commitlint rules
 * @param {string} message - The commit message to test
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function testCommitMessage(message) {
  try {
    // Create a temporary file with the commit message
    const tempFile = path.join(os.tmpdir(), `commit-msg-test-${Date.now()}.txt`);
    fs.writeFileSync(tempFile, message);

    try {
      // Run commitlint on the temporary file
      execSync(`npx commitlint --config="./commitlint.config.js" --edit "${tempFile}"`, {
        stdio: 'pipe',
        cwd: __dirname,
      });
      
      // Clean up
      fs.unlinkSync(tempFile);
      
      return { valid: true };
    } catch (error) {
      // Clean up
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      
      return { 
        valid: false, 
        error: error.stdout ? error.stdout.toString() : error.message, 
      };
    }
  } catch (error) {
    return { 
      valid: false, 
      error: `Failed to create test file: ${error.message}`, 
    };
  }
}

/**
 * Run interactive commit message testing
 */
async function runInteractiveTest() {
  const testMessages = [
    'feat: add user authentication',
    'fix(client): resolve login button styling',
    'docs: update API documentation',
    'test(server): add unit tests for auth middleware',
    'invalid commit message',
    'feat!: breaking change in API',
    'chore: update dependencies',
    'refactor(utils): improve error handling',
  ];

  console.log('🧪 Testing commit messages...\n');

  for (const message of testMessages) {
    console.log(`Testing: "${message}"`);
    const result = await testCommitMessage(message);
    
    if (result.valid) {
      console.log('✅ Valid\n');
    } else {
      console.log('❌ Invalid');
      console.log(`Error: ${result.error}\n`);
    }
  }
}

// If called directly, run interactive test
if (require.main === module) {
  runInteractiveTest().catch(console.error);
}

module.exports = { testCommitMessage };
