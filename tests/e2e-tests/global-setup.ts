import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup that runs before all tests
 * This can be used for authentication, database setup, etc.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  console.log('🚀 Starting global setup...');
  
  // Example: Check if the application is running
  const baseURL = config.projects[0].use.baseURL;
  
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Try to access the application
    await page.goto(baseURL, { timeout: 10000 });
    
    // Check if the page loads successfully
    const title = await page.title();
    console.log(`✅ Application is running at ${baseURL} - Title: ${title}`);
    
    await browser.close();
  } catch (error) {
    console.error(`❌ Failed to connect to application at ${baseURL}`);
    console.error('Make sure your development server is running');
    throw error;
  }
  
  console.log('✅ Global setup completed');
}

export default globalSetup;
