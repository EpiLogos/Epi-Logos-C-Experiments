import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

import { resolveBimbaPackageRoot } from '../repo-paths.js';
import type { CanonCoordDepth } from '../schemas/graph.js';

const execFileAsync = promisify(execFile);

export interface SpecRetrieveCanonInput {
  coordinate?: string;
  entity_name?: string;
  depth?: CanonCoordDepth;
}

export async function specRetrieveContentText(input: SpecRetrieveCanonInput): Promise<string> {
  const coordinate = (input.coordinate ?? input.entity_name)?.trim();
  if (!coordinate) {
    throw new Error('spec_retrieve requires coordinate or entity_name');
  }

  const depth = input.depth ?? 'pithy';
  const packageRoot = resolveBimbaPackageRoot();
  const repoRoot = process.env.EPILOGOS_ROOT ?? resolve(packageRoot, '../../../../..');
  const epiBin = process.env.EPI_CANON_BIN ?? 'epi';

  try {
    const { stdout } = await execFileAsync(
      epiBin,
      ['canon', 'coord', coordinate, '--depth', depth, '--json'],
      {
        cwd: repoRoot,
        maxBuffer: 16 * 1024 * 1024,
      }
    );
    return stdout.trimEnd();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `spec_retrieve canon adapter failed for ${coordinate} at depth ${depth}: ${detail}`
    );
  }
}
