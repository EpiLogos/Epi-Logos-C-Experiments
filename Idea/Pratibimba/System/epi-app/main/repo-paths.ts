import { existsSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';

type RepoEnv = Record<string, string | undefined>;

export function resolveEpiAppPackageRoot(startDir = __dirname): string {
  let currentDir = resolve(startDir);

  while (true) {
    if (existsSync(join(currentDir, 'package.json'))) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error(`Unable to locate epi-app package root from ${startDir}`);
    }
    currentDir = parentDir;
  }
}

export function resolveIdeaRoot(
  env: RepoEnv = process.env,
  packageRoot = resolveEpiAppPackageRoot()
): string {
  return env.EPILOGOS_IDEA_PATH ?? join(env.EPILOGOS_ROOT ?? resolve(packageRoot, '../../../..'), 'Idea');
}

export function resolvePresentRoot(
  env: RepoEnv = process.env,
  packageRoot = resolveEpiAppPackageRoot()
): string {
  return env.EPILOGOS_PRESENT_PATH ?? join(resolveIdeaRoot(env, packageRoot), 'Empty', 'Present');
}

export function formatIdeaDisplayPath(
  fullPath: string,
  env: RepoEnv = process.env,
  packageRoot = resolveEpiAppPackageRoot()
): string {
  const normalizedIdeaRoot = normalizePath(resolveIdeaRoot(env, packageRoot), sep).replace(/\/+$/, '');
  const normalizedFullPath = normalizePath(fullPath, sep);

  if (
    normalizedFullPath === normalizedIdeaRoot ||
    normalizedFullPath.startsWith(`${normalizedIdeaRoot}/`)
  ) {
    const suffix = normalizedFullPath.slice(normalizedIdeaRoot.length);
    return suffix ? `/Idea${suffix}` : '/Idea';
  }

  return normalizedFullPath;
}

function normalizePath(value: string, pathSeparator: string): string {
  const escapedSeparator = pathSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return value.replace(new RegExp(escapedSeparator, 'g'), '/');
}
