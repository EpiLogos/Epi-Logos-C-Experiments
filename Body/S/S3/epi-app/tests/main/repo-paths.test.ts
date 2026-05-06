import { describe, expect, it } from 'vitest';
import { join, resolve } from 'node:path';
import {
  formatIdeaDisplayPath,
  resolveEpiAppPackageRoot,
  resolveIdeaRoot,
  resolvePresentRoot,
} from '../../main/repo-paths';

describe('epi-app repo path helpers', () => {
  const packageRoot = resolve(process.cwd());
  const repoRoot = resolve(packageRoot, '../../../..');

  it('derives the package root from dist output paths', () => {
    expect(resolveEpiAppPackageRoot(join(packageRoot, 'dist/main'))).toBe(packageRoot);
  });

  it('defaults the idea root to the new repository tree', () => {
    expect(resolveIdeaRoot({}, packageRoot)).toBe(join(repoRoot, 'Idea'));
  });

  it('builds the present root from the localized idea root', () => {
    expect(resolvePresentRoot({}, packageRoot)).toBe(join(repoRoot, 'Idea/Empty/Present'));
  });

  it('formats localized idea paths for display', () => {
    expect(formatIdeaDisplayPath(join(repoRoot, 'Idea/Empty/Present/FLOW-2026-03-10.md'), {}, packageRoot)).toBe(
      '/Idea/Empty/Present/FLOW-2026-03-10.md'
    );
  });
});
