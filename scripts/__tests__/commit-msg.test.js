const { testCommitMessage } = require('../test-commit-msg');

describe('Commit Message Validation', () => {
  test('should accept valid feat commit', async () => {
    const result = await testCommitMessage('feat: add user authentication');
    expect(result.valid).toBe(true);
  });

  test('should accept valid fix commit', async () => {
    const result = await testCommitMessage('fix: resolve login issue');
    expect(result.valid).toBe(true);
  });

  test('should accept commit with scope', async () => {
    const result = await testCommitMessage('feat(client): add login form');
    expect(result.valid).toBe(true);
  });

  test('should reject invalid commit without type', async () => {
    const result = await testCommitMessage('add user authentication');
    expect(result.valid).toBe(false);
  });

  test('should reject commit with invalid type', async () => {
    const result = await testCommitMessage('invalid: add user authentication');
    expect(result.valid).toBe(false);
  });

  test('should reject commit without description', async () => {
    const result = await testCommitMessage('feat:');
    expect(result.valid).toBe(false);
  });
});
