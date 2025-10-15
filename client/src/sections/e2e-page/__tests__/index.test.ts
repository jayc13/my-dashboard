import { describe, it, expect } from 'vitest';
import E2EPageContainer from '../index';
import ActualE2EPageContainer from '../E2EPageContainer';

describe('e2e-page index', () => {
  it('exports E2EPageContainer as default', () => {
    expect(E2EPageContainer).toBe(ActualE2EPageContainer);
  });

  it('exports a valid component', () => {
    expect(E2EPageContainer).toBeDefined();
    expect(typeof E2EPageContainer).toBe('function');
  });
});
