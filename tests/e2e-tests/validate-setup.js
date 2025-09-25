#!/usr/bin/env node

/**
 * Setup Validation Script
 * Validates that the test environment is properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Validating E2E Test Setup');
console.log('============================\n');

let hasErrors = false;

function checkError(message) {
  console.log(`❌ ${message}`);
  hasErrors = true;
}

function checkSuccess(message) {
  console.log(`✅ ${message}`);
}

function checkWarning(message) {
  console.log(`⚠️  ${message}`);
}

// Check if .env file exists
if (fs.existsSync('.env')) {
  checkSuccess('.env file exists');
  
  // Check if API_SECURITY_KEY is set
  const envContent = fs.readFileSync('.env', 'utf8');
  if (envContent.includes('API_SECURITY_KEY=') && !envContent.includes('API_SECURITY_KEY=your-api-security-key')) {
    checkSuccess('API_SECURITY_KEY is configured');
  } else {
    checkError('API_SECURITY_KEY is not properly configured in .env file');
  }
  
  // Check BASE_URL
  if (envContent.includes('BASE_URL=')) {
    checkSuccess('BASE_URL is configured');
  } else {
    checkWarning('BASE_URL not set, will use default (http://localhost:4000)');
  }
} else {
  checkError('.env file not found. Copy .env.example to .env and configure it.');
}

// Check if node_modules exists
if (fs.existsSync('node_modules')) {
  checkSuccess('Dependencies are installed');
} else {
  checkError('Dependencies not installed. Run: npm install');
}

// Check if Playwright is installed
if (fs.existsSync('node_modules/@playwright/test')) {
  checkSuccess('Playwright is installed');
} else {
  checkError('Playwright not installed. Run: npm install');
}

// Check if browsers are installed
try {
  execSync('npx playwright --version', { stdio: 'pipe' });
  checkSuccess('Playwright CLI is available');
} catch (error) {
  checkError('Playwright CLI not available. Run: npm run install-browsers');
}

// Check TypeScript configuration
if (fs.existsSync('tsconfig.json')) {
  checkSuccess('TypeScript configuration exists');
} else {
  checkWarning('tsconfig.json not found');
}

// Check Playwright configuration
if (fs.existsSync('playwright.config.ts')) {
  checkSuccess('Playwright configuration exists');
} else {
  checkError('playwright.config.ts not found');
}

console.log('\n' + '='.repeat(40));

if (hasErrors) {
  console.log('❌ Setup validation failed. Please fix the errors above.');
  console.log('\nQuick setup commands:');
  console.log('1. cp .env.example .env');
  console.log('2. Edit .env with your API_SECURITY_KEY');
  console.log('3. npm install');
  console.log('4. npm run install-browsers');
  process.exit(1);
} else {
  console.log('✅ Setup validation passed! You can run the tests.');
  console.log('\nTo run authentication tests:');
  console.log('• npm test authentication');
  console.log('• ./run-auth-tests.sh');
  console.log('• npm run test:headed (to see browser)');
  process.exit(0);
}
