import { publishNotificationRequest } from '@/services/notification.service';
import { PullRequestService, PRWithDetails } from '@/services/pull-request.service';
import { getRedisClient } from '@/utils/redis';

/**
 * Pull Request Deletion Request
 */
interface PullRequestDeletionRequest {
  id: string;
  pullRequestNumber: number;
  repository: string;
  reason?: string;
}

/**
 * Publish a pull request deletion request to Redis
 */
async function publishPRDeletionRequest(request: PullRequestDeletionRequest): Promise<void> {
  const client = getRedisClient();
  await client.publish('pull-request:delete', JSON.stringify(request));
  console.log(`  - Published deletion request for PR #${request.pullRequestNumber} (${request.repository})`);
}

/**
 * Unified Pull Requests Management Job
 * 
 * This job consolidates all PR-related operations into a single job to minimize API calls:
 * 1. Check for PRs ready to merge (is-pr-approved functionality)
 * 2. Send reminders for old PRs (pr-reminder functionality)
 * 3. Delete merged PRs from database (delete-merged-prs functionality)
 * 
 * By fetching all PRs once, we reduce API calls from 3 separate jobs to 1 unified job.
 */
const pullRequestsManagementJob = async () => {
  console.log('='.repeat(60));
  console.log('Running Pull Requests Management Job...');
  console.log('='.repeat(60));

  try {
    // Fetch all PRs with their details using the unified service (SINGLE API CALL)
    console.log('\n[1/4] Fetching all pull requests...');
    const { allPRs, errors } = await PullRequestService.fetchAllPRsWithDetails();

    if (errors.length > 0) {
      console.warn(`⚠️  Failed to fetch details for ${errors.length} PR(s)`);
    }

    if (allPRs.length === 0) {
      console.log('ℹ️  No pull requests found in database');
      console.log('='.repeat(60));
      return;
    }

    console.log(`✓ Successfully fetched ${allPRs.length} PR(s) with details`);

    // Separate PRs by state for different operations
    const openPRs = PullRequestService.filterByState(allPRs, 'open');
    const openNonMergedPRs = PullRequestService.filterByMerged(openPRs, false);
    const mergedPRs = PullRequestService.filterByMerged(allPRs, true);

    console.log(`  - Open PRs: ${openPRs.length}`);
    console.log(`  - Merged PRs: ${mergedPRs.length}`);

    // ========================================================================
    // OPERATION 1: Check for PRs ready to merge or with conflicts
    // ========================================================================
    console.log('\n[2/4] Checking PR merge status...');
    await checkPRMergeStatus(openNonMergedPRs);

    // ========================================================================
    // OPERATION 2: Send reminders for old PRs
    // ========================================================================
    console.log('\n[3/4] Checking for old PRs...');
    await checkOldPullRequests(openNonMergedPRs);

    // ========================================================================
    // OPERATION 3: Delete merged PRs from database
    // ========================================================================
    console.log('\n[4/4] Cleaning up merged PRs...');
    await deleteMergedPullRequests(mergedPRs);

    console.log('\n' + '='.repeat(60));
    console.log('✓ Pull Requests Management Job completed successfully');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Error running Pull Requests Management Job:', error);
    console.log('='.repeat(60));
  }
};

/**
 * Check for PRs ready to merge or with conflicts
 * (Previously: is-pr-approved.job.ts)
 */
async function checkPRMergeStatus(openPRs: PRWithDetails[]): Promise<void> {
  // Filter PRs ready to merge (clean or unstable mergeable state)
  const pullRequestsReadyToMerge = PullRequestService.filterByMergeableState(
    openPRs,
    ['clean', 'unstable'],
  );

  // Filter PRs with conflicts (dirty mergeable state)
  const pullRequestsWithConflicts = PullRequestService.filterByMergeableState(
    openPRs,
    ['dirty'],
  );

  console.log(`  - PRs ready to merge: ${pullRequestsReadyToMerge.length}`);
  console.log(`  - PRs with conflicts: ${pullRequestsWithConflicts.length}`);

  // Send notification for PRs ready to merge
  if (pullRequestsReadyToMerge.length > 0) {
    const size = pullRequestsReadyToMerge.length;
    const prNumbers = pullRequestsReadyToMerge.map(pr => pr.number).map(num => `#${num}`).join(', ');
    await publishNotificationRequest({
      title: 'Pull Requests Ready to Merge',
      message: `There ${size > 1 ? 'are' : 'is'} ${size} pull request${size > 1 ? 's' : ''} ready to merge: ${prNumbers}.`,
      type: 'info',
      link: '/pull_requests',
    });
    console.log(`  ✓ Sent notification for ${size} PR(s) ready to merge`);
  }

  // Send notification for PRs with conflicts
  if (pullRequestsWithConflicts.length > 0) {
    const size = pullRequestsWithConflicts.length;
    const prNumbers = pullRequestsWithConflicts.map(pr => pr.number).map(num => `#${num}`).join(', ');
    await publishNotificationRequest({
      title: 'Pull Requests with Conflicts',
      message: `There ${size > 1 ? 'are' : 'is'} ${size} pull request${size > 1 ? 's' : ''} with merge conflicts: ${prNumbers}.`,
      type: 'warning',
      link: '/pull_requests',
    });
    console.log(`  ✓ Sent notification for ${size} PR(s) with conflicts`);
  }

  if (pullRequestsReadyToMerge.length === 0 && pullRequestsWithConflicts.length === 0) {
    console.log('  ℹ️  No PRs requiring merge status notifications');
  }
}

/**
 * Check for old pull requests and send reminders
 * (Previously: pr-reminder.job.ts)
 */
async function checkOldPullRequests(openNonMergedPRs: PRWithDetails[]): Promise<void> {
  // Categorize by age
  const prs3DaysOld: PRWithDetails[] = [];
  const prs7DaysOld: PRWithDetails[] = [];

  for (const pr of openNonMergedPRs) {
    const age = PullRequestService.calculateAgeInDays(pr.createdAt);

    if (age >= 7) {
      prs7DaysOld.push(pr);
    } else if (age >= 3) {
      prs3DaysOld.push(pr);
    }
  }

  console.log(`  - PRs 3+ days old: ${prs3DaysOld.length}`);
  console.log(`  - PRs 7+ days old: ${prs7DaysOld.length}`);

  // Send notification for PRs 3+ days old
  if (prs3DaysOld.length > 0) {
    const prNumbers = prs3DaysOld.map((pr) => `#${pr.number}`).join(', ');
    await publishNotificationRequest({
      title: 'Pull Requests Reminder (3+ days old)',
      message: `${prs3DaysOld.length} pull request${prs3DaysOld.length > 1 ? 's' : ''} ${prs3DaysOld.length > 1 ? 'have' : 'has'} been open for 3+ days: ${prNumbers}`,
      type: 'info',
      link: '/pull_requests',
    });
    console.log(`  ✓ Sent notification for ${prs3DaysOld.length} PR(s) 3+ days old`);
  }

  // Send notification for PRs 7+ days old
  if (prs7DaysOld.length > 0) {
    const prNumbers = prs7DaysOld.map((pr) => `#${pr.number}`).join(', ');
    await publishNotificationRequest({
      title: 'Pull Requests Reminder (7+ days old)',
      message: `${prs7DaysOld.length} pull request${prs7DaysOld.length > 1 ? 's' : ''} ${prs7DaysOld.length > 1 ? 'have' : 'has'} been open for 7+ days: ${prNumbers}. Please review!`,
      type: 'warning',
      link: '/pull_requests',
    });
    console.log(`  ✓ Sent notification for ${prs7DaysOld.length} PR(s) 7+ days old`);
  }

  if (prs3DaysOld.length === 0 && prs7DaysOld.length === 0) {
    console.log('  ℹ️  No old PRs requiring reminders');
  }
}

/**
 * Delete merged pull requests from database
 * (Previously: delete-merged-prs.job.ts)
 */
async function deleteMergedPullRequests(mergedPRs: PRWithDetails[]): Promise<void> {
  console.log(`  - Merged PRs to delete: ${mergedPRs.length}`);

  if (mergedPRs.length === 0) {
    console.log('  ℹ️  No merged PRs to delete');
    return;
  }

  // Publish deletion requests for each merged PR
  let successCount = 0;
  let failureCount = 0;

  for (const pr of mergedPRs) {
    try {
      await publishPRDeletionRequest({
        id: pr.dbId,
        pullRequestNumber: pr.number,
        repository: pr.dbRepository,
        reason: `Merged at ${pr.mergedAt}`,
      });
      successCount++;
    } catch (error) {
      console.error(`  ❌ Error publishing deletion request for PR #${pr.number}:`, error);
      failureCount++;
    }
  }

  console.log(`  ✓ Deletion requests published: ${successCount}`);
  if (failureCount > 0) {
    console.log(`  ❌ Failed to publish: ${failureCount}`);
  }
}

export default pullRequestsManagementJob;

