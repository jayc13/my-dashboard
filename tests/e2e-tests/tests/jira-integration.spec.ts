import { test, expect, Page } from '@playwright/test';
import { JiraPage } from '@pages/JiraPage';
import { setupAuthenticatedSession } from '@utils/test-helpers';
import { LoginPage } from '@pages/LoginPage';

test.describe('Jira Integration Test Suite', () => {
  let page: Page;
  let jiraPage: JiraPage;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await setupAuthenticatedSession(page);
    jiraPage = new JiraPage(page);
  });

  test.beforeEach(async () => {
    await jiraPage.goto();
  });

  test('should refresh Manual Testing tickets', async () => {
    let requestCount = 0;

    await page.route('**/api/jira/manual_qa', async route => {
      requestCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          issues: [
            {
              key: `REFRESH-${requestCount}`,
              summary: `Refresh test ${requestCount}`,
              status: 'Open',
              priority: 'Medium',
              url: 'https://jira.example.com/browse/REFRESH-1',
            },
          ],
        }),
      });
    });

    await page.reload();
    await jiraPage.waitForJiraListLoaded('Manual Testing');

    const initialRequestCount = requestCount;

    // Click refresh button
    await jiraPage.refreshJiraList('Manual Testing');
    await jiraPage.waitForJiraListLoaded('Manual Testing');

    // Should have made another request
    expect(requestCount).toBe(initialRequestCount + 1);

    await page.unroute('**/api/jira/manual_qa');
  });

  test('should refresh My Tickets', async () => {
    let requestCount = 0;

    await page.route('**/api/jira/my_tickets', async route => {
      requestCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          issues: [
            {
              key: `MY-${requestCount}`,
              summary: `My ticket ${requestCount}`,
              status: 'In Review',
              priority: 'Low',
              url: 'https://jira.example.com/browse/MY-1',
            },
          ],
        }),
      });
    });

    await page.reload();
    await jiraPage.waitForJiraListLoaded('My Tickets');

    const initialRequestCount = requestCount;

    // Click refresh button
    await jiraPage.refreshJiraList('My Tickets');
    await jiraPage.waitForJiraListLoaded('My Tickets');

    // Should have made another request
    expect(requestCount).toBe(initialRequestCount + 1);

    await page.unroute('**/api/jira/my_tickets');
  });
  test('should open ticket in new tab when clicked', async () => {
    const mockTicket = {
      key: 'CLICK-TEST',
      summary: 'Click test ticket',
      status: 'Open',
      priority: 'Medium',
      url: 'https://jira.example.com/browse/CLICK-TEST',
    };

    await page.route('**/api/jira/manual_qa', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ issues: [mockTicket] }),
      });
    });

    await page.reload();
    await jiraPage.waitForJiraListLoaded('Manual Testing');

    // Listen for new page creation
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      jiraPage.clickJiraCard(mockTicket.key),
    ]);

    // Verify new page opened with correct URL
    expect(newPage.url()).toBe(mockTicket.url);

    await newPage.close();
    await page.unroute('**/api/jira/manual_qa');
  });
});
