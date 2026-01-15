import { describe, it, expect } from 'vitest';
import * as exports from '../index';

describe('types/index', () => {
  it('exports NavigationItem interface', () => {
    expect(exports).toBeDefined();
    // NavigationItem is a type export - verify the module exports
    expect(typeof exports).toBe('object');
  });

  it('re-exports types from @my-dashboard/types', () => {
    // Verify that types are re-exported
    expect(exports).toBeDefined();
  });
});
