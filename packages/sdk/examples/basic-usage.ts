/**
 * Basic usage example for @my-dashboard/sdk
 * 
 * This example demonstrates how to use the My Dashboard SDK to interact
 * with the API for common operations.
 */

import { MyDashboardAPI, APIError, NetworkError } from '../src';

// Initialize the SDK
const api = new MyDashboardAPI({
  baseUrl: process.env.MY_DASHBOARD_BASE_URL || 'http://localhost:3000',
  apiKey: process.env.MY_DASHBOARD_API_KEY || 'your-api-key-here',
  retries: 3,
  timeout: 30000
});

async function main() {
  try {
    console.log('🚀 My Dashboard SDK Example');
    console.log('============================\n');

    // 1. Health Check
    console.log('1. Checking API health...');
    const health = await api.health.getHealthStatus();
    console.log('✅ API Status:', health.status);

    // 2. Validate API Key
    console.log('\n2. Validating API key...');
    const authResult = await api.validateCurrentApiKey();
    console.log('✅ API Key valid:', authResult.valid);

    // 3. Get E2E Reports
    console.log('\n3. Fetching E2E reports...');
    const reports = await api.getE2EReports({ limit: 5 });
    console.log(`✅ Found ${reports.length} E2E reports`);
    
    if (reports.length > 0) {
      console.log('   First report:', {
        project: reports[0].projectName,
        totalRuns: reports[0].totalRuns,
        passedRuns: reports[0].passedRuns,
        failedRuns: reports[0].failedRuns
      });
    }

    // 4. Get Applications
    console.log('\n4. Fetching applications...');
    const applications = await api.getApplications();
    console.log(`✅ Found ${applications.length} applications`);
    
    if (applications.length > 0) {
      console.log('   First application:', {
        id: applications[0].id,
        name: applications[0].name,
        code: applications[0].code
      });
    }

    // 5. Get Notifications
    console.log('\n5. Fetching notifications...');
    const notifications = await api.getNotifications({ limit: 3 });
    console.log(`✅ Found ${notifications.length} notifications`);

    // 6. Get Pull Requests
    console.log('\n6. Fetching pull requests...');
    const pullRequests = await api.getPullRequests();
    console.log(`✅ Found ${pullRequests.length} pull requests`);

    // 7. Example of creating a notification
    console.log('\n7. Creating a test notification...');
    const newNotification = await api.createNotification({
      title: 'SDK Test',
      message: 'This notification was created using the My Dashboard SDK',
      type: 'info'
    });
    console.log('✅ Created notification with ID:', newNotification.id);

    console.log('\n🎉 All operations completed successfully!');

  } catch (error) {
    console.error('\n❌ Error occurred:');
    
    if (error instanceof APIError) {
      console.error(`API Error (${error.status}): ${error.message}`);
      if (error.response) {
        console.error('Error data:', error.response);
      }
    } else if (error instanceof NetworkError) {
      console.error(`Network Error: ${error.message}`);
      if (error.originalError) {
        console.error('Original error:', error.originalError.message);
      }
    } else {
      console.error('Unknown error:', error);
    }
    
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main };
