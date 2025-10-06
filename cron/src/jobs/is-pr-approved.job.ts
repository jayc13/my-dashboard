import { getSDK } from '@/utils/sdk';
import { publishNotificationRequest } from '@/services/notification.service';

const isPrApprovedJob = async () => {
  const sdk = await getSDK();
  const pullRequests = await sdk.pullRequests.getPullRequests();

  const pullRequestsReadyToMerge = [];
  const pullRequestsWithConflicts = [];

  for (const pr of pullRequests) {
    const details = await sdk.pullRequests.getPullRequestDetails(pr.id);
    if (['clean', 'unstable'].includes(details.mergeableState)) {
      pullRequestsReadyToMerge.push(details);
    } else if (details.mergeableState === 'dirty') {
      pullRequestsWithConflicts.push(details);
    }
  }

  if (pullRequestsReadyToMerge.length > 0) {
    const size = pullRequestsReadyToMerge.length;
    const prNumbers = pullRequestsReadyToMerge.map(pr => pr.number).map(num => `#${num}`).join(', ');
    await publishNotificationRequest({
      title: 'Pull Requests Ready to Merge',
      message: `There ${size > 1 ? 'are' : 'is'} ${size} pull request${size > 1 ? 's' : ''} ready to merge: ${prNumbers}.`,
      type: 'info',
      link: '/pull_requests',
    });
  }

  if (pullRequestsWithConflicts.length > 0) {
    const size = pullRequestsWithConflicts.length;
    const prNumbers = pullRequestsWithConflicts.map(pr => pr.number).map(num => `#${num}`).join(', ');
    await publishNotificationRequest({
      title: 'Pull Requests with Conflicts',
      message: `There ${size > 1 ? 'are' : 'is'} ${size} pull request${size > 1 ? 's' : ''} with merge conflicts: ${prNumbers}.`,
      type: 'warning',
      link: '/pull_requests',
    });
  }
};

export default isPrApprovedJob;