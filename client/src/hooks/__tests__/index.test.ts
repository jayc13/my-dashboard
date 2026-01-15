import { describe, it, expect } from 'vitest';
import * as exports from '../index';

describe('hooks/index', () => {
  it('exports useSDKData hook', () => {
    expect(exports.useSDKData).toBeDefined();
  });

  it('exports useTodos hook', () => {
    expect(exports.useTodos).toBeDefined();
  });

  it('exports useApps hook', () => {
    expect(exports.useApps).toBeDefined();
  });

  it('exports usePullRequests hook', () => {
    expect(exports.usePullRequests).toBeDefined();
  });
  it('exports useNotifications hook', () => {
    expect(exports.useNotifications).toBeDefined();
  });
  it('exports useFCM hook', () => {
    expect(exports.useFCM).toBeDefined();
  });

  it('exports useKeyboardShortcuts hook', () => {
    expect(exports.useKeyboardShortcuts).toBeDefined();
  });
});
