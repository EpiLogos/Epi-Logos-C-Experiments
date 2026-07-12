import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type RepoEnv = Record<string, string | undefined>;

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));

export function resolveBimbaPackageRoot(startDir = MODULE_DIR): string {
  let currentDir = resolve(startDir);

  while (true) {
    if (existsSync(join(currentDir, 'package.json'))) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error(`Unable to locate bimba-mcp package root from ${startDir}`);
    }
    currentDir = parentDir;
  }
}

export function resolveVaultRoot(
  env: RepoEnv = process.env,
  packageRoot = resolveBimbaPackageRoot()
): string {
  return env.OBSIDIAN_VAULT_PATH ?? env.EPILOGOS_ROOT ?? resolve(packageRoot, '../../../..');
}

export function resolvePresentRoot(
  env: RepoEnv = process.env,
  packageRoot = resolveBimbaPackageRoot()
): string {
  return env.EPILOGOS_PRESENT_PATH ?? join(resolveVaultRoot(env, packageRoot), 'Idea', 'Empty', 'Present');
}

/**
 * Resolve the `/map` projection root — the downward (Neo4j -> repo) reflection tree.
 *
 * `Idea/Bimba/Map/` is where the `map-index` projection artifacts live (Track 45). Overridable
 * via EPILOGOS_MAP_PATH; otherwise anchored under the resolved vault root.
 */
export function resolveMapRoot(
  env: RepoEnv = process.env,
  packageRoot = resolveBimbaPackageRoot()
): string {
  return env.EPILOGOS_MAP_PATH ?? join(resolveVaultRoot(env, packageRoot), 'Idea', 'Bimba', 'Map');
}
