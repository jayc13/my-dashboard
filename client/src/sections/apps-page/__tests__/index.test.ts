import { describe, it, expect } from 'vitest';
import AppsPageContainer from '../index';
import ActualAppsPageContainer from '../AppsPageContainer';

describe('apps-page index', () => {
  it('exports AppsPageContainer as default', () => {
    expect(AppsPageContainer).toBe(ActualAppsPageContainer);
  });

  it('exports a valid component', () => {
    expect(AppsPageContainer).toBeDefined();
    expect(typeof AppsPageContainer).toBe('function');
  });
});
