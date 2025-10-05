import { getSDK } from '../utils/sdk';
import { publishNotificationRequest } from '../services/notification.service';
import { GithubPullRequestDetails } from '@my-dashboard/types';

/**
 * Extended PR details with age information
 */
interface PRWithAge extends GithubPullRequestDetails {
  age: number;
  prNumber: number;
}

/**
 * Calculate the age of an item in days based on its creation date
 * @param createdAt ISO 8601 date string
 * @returns Age in days
 */
const calculateAgeInDays = (createdAt: string): number => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffInMs = now.getTime() - created.getTime();
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
};

/**
 * Job to check for old pull requests and send reminders
 * - Sends notification for pull requests older than 3 days
 * - Sends notification for pull requests older than 7 days
 */
const prReminderJob = async () => {
  console.log('='.repeat(60));
  console.log('Checking for old Pull Requests...');
  console.log('='.repeat(60));

  try {
    // Check for old pull requests (3 days and 7 days)
    await checkOldPullRequests();

    console.log('='.repeat(60));
    console.log('PR reminder job completed successfully');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Error running PR reminder job:', error);
  }
};

/**
 * Check for pull requests older than 3 days and 7 days
 */
const checkOldPullRequests = async () => {
  console.log('Checking for old pull requests...');

  try {
    const sdk = getSDK();

    // Fetch all pull requests
    const pullRequests = await sdk.pullRequests.getPullRequests();

    if (!pullRequests || pullRequests.length === 0) {
      console.log('No pull requests found');
      return;
    }

    // Fetch details for each PR to get creation date
    const prs3DaysOld: PRWithAge[] = [];
    const prs7DaysOld: PRWithAge[] = [];

    for (const pr of pullRequests) {
      try {
        const details = await sdk.pullRequests.getPullRequestDetails(pr.id);

        // Check if PR is still open and calculate age
        if (details.state === 'open' && !details.merged) {
          const age = calculateAgeInDays(details.createdAt);
          const prNumber = details.number || pr.pullRequestNumber;

          if (age >= 7) {
            prs7DaysOld.push({
              ...details,
              age,
              prNumber,
            });
          } else if (age >= 3) {
            prs3DaysOld.push({
              ...details,
              age,
              prNumber,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching details for PR ${pr.id}:`, error);
        // Continue with other PRs
      }
    }

    console.log(`Found ${prs3DaysOld.length} PR(s) 3+ days old and ${prs7DaysOld.length} PR(s) 7+ days old`);

    // Send notification for PRs 3+ days old
    if (prs3DaysOld.length > 0) {
      const prNumbers = prs3DaysOld.map((pr) => `#${pr.prNumber}`).join(', ');
      await publishNotificationRequest({
        title: 'Pull Requests Reminder (3+ days old)',
        message: `${prs3DaysOld.length} pull request${prs3DaysOld.length > 1 ? 's' : ''} ${prs3DaysOld.length > 1 ? 'have' : 'has'} been open for 3+ days: ${prNumbers}`,
        type: 'info',
        link: '/pull_requests',
      });
      console.log(`Sent notification for ${prs3DaysOld.length} PR(s) 3+ days old`);
    }

    // Send notification for PRs 7+ days old
    if (prs7DaysOld.length > 0) {
      const prNumbers = prs7DaysOld.map((pr) => `#${pr.prNumber}`).join(', ');
      await publishNotificationRequest({
        title: 'Pull Requests Reminder (7+ days old)',
        message: `${prs7DaysOld.length} pull request${prs7DaysOld.length > 1 ? 's' : ''} ${prs7DaysOld.length > 1 ? 'have' : 'has'} been open for 7+ days: ${prNumbers}. Please review!`,
        type: 'warning',
        link: '/pull_requests',
      });
      console.log(`Sent notification for ${prs7DaysOld.length} PR(s) 7+ days old`);
    }
  } catch (error) {
    console.error('Error checking old pull requests:', error);
    throw error;
  }
};

export default prReminderJob;

