import { describe, it, expect } from 'vitest';
import PullRequestsPageContainer from '../index';
import ActualPullRequestsPageContainer from '../PullRequestsPageContainer';

describe('pull-requests-page index', () => {
  it('exports PullRequestsPageContainer as default', () => {
    expect(PullRequestsPageContainer).toBe(ActualPullRequestsPageContainer);
  });

  it('exports a valid component', () => {
    expect(PullRequestsPageContainer).toBeDefined();
    expect(typeof PullRequestsPageContainer).toBe('function');
  });
});
