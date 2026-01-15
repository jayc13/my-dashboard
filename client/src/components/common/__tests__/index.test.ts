import { describe, it, expect } from 'vitest';
import * as exports from '../index';
import TooltipIconButton from '../TooltipIconButton';
import TooltipButton from '../TooltipButton';
import JiraCard from '../JiraCard';

describe('components/common/index', () => {
  it('exports TooltipIconButton as default', () => {
    expect(exports.TooltipIconButton).toBeDefined();
    expect(exports.TooltipIconButton).toBe(TooltipIconButton);
  });

  it('exports TooltipButton as default', () => {
    expect(exports.TooltipButton).toBeDefined();
    expect(exports.TooltipButton).toBe(TooltipButton);
  });

  it('exports JiraCard as default', () => {
    expect(exports.JiraCard).toBeDefined();
    expect(exports.JiraCard).toBe(JiraCard);
  });

  it('has all expected exports', () => {
    const expectedExports = ['TooltipIconButton', 'TooltipButton', 'JiraCard'];
    const actualExports = Object.keys(exports);
    expectedExports.forEach(exportName => {
      expect(actualExports).toContain(exportName);
    });
  });

  it('does not have unexpected exports', () => {
    const expectedExports = ['TooltipIconButton', 'TooltipButton', 'JiraCard'];
    const actualExports = Object.keys(exports);
    expect(actualExports).toEqual(expectedExports);
  });
});
