import { API_BASE_URL } from '../utils/constants';
import { apiFetch } from '../utils/helpers';
import { publishNotificationRequest } from './notification.job';

const isPrApprovedJob = async () => {
  const requestAllPullRequests = await apiFetch(`${API_BASE_URL}/api/pull_requests`);
  const pullRequests = await requestAllPullRequests.json();

  const pullRequestsReadyToMerge = [];
  const pullRequestsWithConflicts = [];

  for (const pr of pullRequests) {
    const requestPRDetailRequest = await apiFetch(`${API_BASE_URL}/api/pull_requests/` + pr.id);
    const details = await requestPRDetailRequest.json();
    if (['clean', 'unstable'].includes(details.mergeableState)) {
      pullRequestsReadyToMerge.push(details);
    } else if (details.mergeableState === 'dirty') {
      pullRequestsWithConflicts.push(details);
    }
  }

  if (pullRequestsReadyToMerge.length > 0) {
    const size = pullRequestsReadyToMerge.length;
    const prNumbers = pullRequestsReadyToMerge.map(pr => pr.pullRequestNumber || pr.number || pr.id).map(num => `#${num}`).join(', ');
    await publishNotificationRequest({
      title: 'Pull Requests Ready to Merge',
      message: `There ${size > 1 ? 'are' : 'is'} ${size} pull request${size > 1 ? 's' : ''} ready to merge: ${prNumbers}.`,
      type: 'info',
      link: '/pull_requests',
    });
  }

  if (pullRequestsWithConflicts.length > 0) {
    const size = pullRequestsWithConflicts.length;
    const prNumbers = pullRequestsWithConflicts.map(pr => pr.pullRequestNumber || pr.number || pr.id).map(num => `#${num}`).join(', ');
    await publishNotificationRequest({
      title: 'Pull Requests with Conflicts',
      message: `There ${size > 1 ? 'are' : 'is'} ${size} pull request${size > 1 ? 's' : ''} with merge conflicts: ${prNumbers}.`,
      type: 'warning',
      link: '/pull_requests',
    });
  }
};

export default isPrApprovedJob;