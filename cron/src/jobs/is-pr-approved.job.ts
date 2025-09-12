import { API_BASE_URL } from '../utils/constants';
import { apiFetch } from '../utils/helpers';

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
    // Create a notification
    const size = pullRequestsReadyToMerge.length;
    await apiFetch(`${API_BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'E2E Report',
        message: `There ${size > 1 ? 'is ' : 'are'} ${size} pull requests ready to Merge.`,
        link: '/pull_requests',
        type: 'info',
      }),
    });
  }
};

export default isPrApprovedJob;