import { describe, expect, it } from 'vitest';
import { join, resolve } from 'node:path';
import {
  resolveBimbaPackageRoot,
  resolvePresentRoot,
  resolveVaultRoot,
} from './repo-paths.js';

describe('repo path resolution', () => {
  const packageRoot = resolve(process.cwd());
  const repoRoot = resolve(packageRoot, '../../../..');

  it('derives the package root from nested compiled directories', () => {
    expect(resolveBimbaPackageRoot(join(packageRoot, 'dist/api'))).toBe(packageRoot);
  });

  it('defaults the vault root to the new repository root', () => {
    expect(resolveVaultRoot({}, packageRoot)).toBe(repoRoot);
  });

  it('honors OBSIDIAN_VAULT_PATH when provided', () => {
    expect(resolveVaultRoot({ OBSIDIAN_VAULT_PATH: '/tmp/custom-vault' }, packageRoot)).toBe(
      '/tmp/custom-vault'
    );
  });

  it('builds the present root relative to the new repository copy', () => {
    expect(resolvePresentRoot({}, packageRoot)).toBe(join(repoRoot, 'Idea/Empty/Present'));
  });
});
