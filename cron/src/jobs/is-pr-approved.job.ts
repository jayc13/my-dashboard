import { API_BASE_URL } from '../utils/constants';
import { apiFetch } from '../utils/helpers';
import { publishNotificationRequest } from './notification.job';

const isPrApprovedJob = async () => {
  const requestAllPullRequests = await apiFetch(`${API_BASE_URL}/api/pull_requests`);
  const pullRequests = await requestAllPullRequests.json();

  const pullRequestsReadyToMerge = [];

  for (const pr of pullRequests) {
    const requestPRDetailRequest = await apiFetch(`${API_BASE_URL}/api/pull_requests/` + pr.id);
    const details = await requestPRDetailRequest.json();
    if (['clean', 'unstable', 'dirty'].includes(details.mergeableState)) {
      pullRequestsReadyToMerge.push(details);
    }
  }

  if (pullRequestsReadyToMerge.length > 0) {
    // Create a notification using Redis producer
    const size = pullRequestsReadyToMerge.length;
    await publishNotificationRequest({
      title: 'Pull Requests Ready to Merge',
      message: `There ${size > 1 ? 'are' : 'is'} ${size} pull request${size > 1 ? 's' : ''} ready to merge.`,
      type: 'info',
      link: '/pull_requests',
    });
  }
};

export default isPrApprovedJob;