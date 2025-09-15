#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 *
 * This script analyzes the bundle size and provides detailed information
 * about the build output. It can be used locally for development.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatBytes(bytes) {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundle() {
  const distPath = path.join(__dirname, '..', 'dist');
  const assetsPath = path.join(distPath, 'assets');

  if (!fs.existsSync(distPath)) {
    console.error('❌ Build directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  console.log('📦 Bundle Size Analysis');
  console.log('='.repeat(50));

  let totalSize = 0;
  let jsSize = 0;
  let cssSize = 0;
  const files = [];

  if (fs.existsSync(assetsPath)) {
    const assetFiles = fs.readdirSync(assetsPath);
    
    assetFiles.forEach(file => {
      const filePath = path.join(assetsPath, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      
      totalSize += size;
      files.push({ name: file, size, path: filePath });
      
      if (file.endsWith('.js')) {
        jsSize += size;
      } else if (file.endsWith('.css')) {
        cssSize += size;
      }
    });
  }

  // Sort files by size (largest first)
  files.sort((a, b) => b.size - a.size);

  console.log('\n📊 Summary:');
  console.log(`  Total Size: ${formatBytes(totalSize)}`);
  console.log(`  JavaScript: ${formatBytes(jsSize)}`);
  console.log(`  CSS: ${formatBytes(cssSize)}`);
  console.log(`  Other: ${formatBytes(totalSize - jsSize - cssSize)}`);

  console.log('\n📋 File Breakdown:');
  files.forEach(file => {
    const percentage = ((file.size / totalSize) * 100).toFixed(1);
    console.log(`  ${file.name}: ${formatBytes(file.size)} (${percentage}%)`);
  });

  // Check for large files
  const largeFiles = files.filter(file => file.size > 1024 * 1024); // > 1MB
  if (largeFiles.length > 0) {
    console.log('\n⚠️  Large Files (>1MB):');
    largeFiles.forEach(file => {
      console.log(`  ${file.name}: ${formatBytes(file.size)}`);
    });
    console.log('\nConsider code splitting or lazy loading for these files.');
  }

  // Recommendations
  console.log('\n💡 Optimization Tips:');
  if (jsSize > 1024 * 1024) { // > 1MB
    console.log('  • Consider code splitting to reduce initial bundle size');
    console.log('  • Use dynamic imports for large libraries');
  }
  if (files.length > 10) {
    console.log('  • Consider combining smaller files to reduce HTTP requests');
  }
  console.log('  • Run "npm run build:analyze" to see detailed bundle composition');
  console.log('  • Use tree shaking to eliminate unused code');

  console.log('\n✅ Analysis complete!');
}

// Run the analysis if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeBundle();
}

export { analyzeBundle, formatBytes };
