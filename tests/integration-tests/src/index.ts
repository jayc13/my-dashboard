// Main entry point for integration tests
// This file can be used to run tests programmatically or set up test environment

import { TestHelpers } from './utils/test-helpers';

async function main() {
  console.log('Integration Tests Setup');
  console.log('======================');
  
  const testHelpers = new TestHelpers();
  
  try {
    console.log('Checking server connectivity...');
    await testHelpers.waitForServer();
    console.log('✅ Server is ready!');
    
    console.log('\nTo run tests, use:');
    console.log('npm test                 - Run all tests');
    console.log('npm run test:watch       - Run tests in watch mode');
    console.log('npm run test:coverage    - Run tests with coverage');
    console.log('npm run test:verbose     - Run tests with verbose output');
    
  } catch (error) {
    console.error('❌ Server connectivity check failed:', error);
    process.exit(1);
  }
}

// Run main function if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
