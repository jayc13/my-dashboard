#!/usr/bin/env node

/**
 * Helper script to show commit message format examples
 */

console.log('\n🎯 Conventional Commit Format Guide\n');

console.log('Format: <type>(<scope>): <subject>\n');

console.log('📝 Valid Types:');
const types = [
  { type: 'feat', desc: 'A new feature', example: 'feat: add user authentication' },
  { type: 'fix', desc: 'A bug fix', example: 'fix(client): resolve login button styling' },
  { type: 'docs', desc: 'Documentation only changes', example: 'docs: update API documentation' },
  { type: 'style', desc: 'Code style changes (formatting, etc.)', example: 'style: fix indentation in server.js' },
  { type: 'refactor', desc: 'Code refactoring', example: 'refactor(server): simplify auth middleware' },
  { type: 'perf', desc: 'Performance improvements', example: 'perf: optimize database queries' },
  { type: 'test', desc: 'Adding or updating tests', example: 'test(client): add unit tests for components' },
  { type: 'build', desc: 'Build system or dependency changes', example: 'build: update webpack configuration' },
  { type: 'ci', desc: 'CI configuration changes', example: 'ci: add GitHub Actions workflow' },
  { type: 'chore', desc: 'Other changes (maintenance, etc.)', example: 'chore: update dependencies' },
  { type: 'revert', desc: 'Revert a previous commit', example: 'revert: revert commit abc123' },
];

types.forEach(({ type, desc, example }) => {
  console.log(`  ${type.padEnd(8)} - ${desc}`);
  console.log(`  ${' '.repeat(10)} Example: ${example}\n`);
});

console.log('📋 Rules:');
console.log('  • Subject should be lowercase and not end with a period');
console.log('  • Subject should be 100 characters or less');
console.log('  • Use imperative mood ("add" not "added" or "adds")');
console.log('  • Scope is optional but recommended (e.g., client, server, docs)');

console.log('\n✅ Good Examples:');
console.log('  feat(auth): add OAuth2 integration');
console.log('  fix: resolve memory leak in data processing');
console.log('  docs(api): update endpoint documentation');
console.log('  test: add integration tests for user service');

console.log('\n❌ Bad Examples:');
console.log('  Added new feature (missing type)');
console.log('  fix: Fixed the bug. (should not end with period)');
console.log('  FEAT: ADD USER AUTH (should be lowercase)');
console.log('  update stuff (too vague, missing type)');

console.log('\n💡 Pro Tips:');
console.log('  • Use "npm run commit-help" to see this guide anytime');
console.log('  • Breaking changes should include "BREAKING CHANGE:" in the footer');
console.log('  • Reference issues with "Closes #123" in the footer');

console.log('\n🔗 More info: https://www.conventionalcommits.org/\n');
