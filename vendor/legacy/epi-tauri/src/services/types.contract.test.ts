import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      return filesUnder(path);
    }
    return path.endsWith('.ts') || path.endsWith('.tsx') ? [path] : [];
  });
}

describe('shared profile contract locality', () => {
  it('keeps MathemeHarmonicProfile declared only at the renderer boundary mirror', () => {
    const srcRoot = join(process.cwd(), 'src');
    const declarations = filesUnder(srcRoot)
      .filter((path) => !path.endsWith('.test.ts') && !path.endsWith('.spec.ts'))
      .filter((path) => readFileSync(path, 'utf8').includes('interface MathemeHarmonicProfile'))
      .map((path) => relative(process.cwd(), path));

    expect(declarations).toEqual(['src/services/types.ts']);
  });

  it('keeps kernel profile observation contract types declared only at the renderer boundary mirror', () => {
    const srcRoot = join(process.cwd(), 'src');
    const contractNames = [
      'interface KernelProfileCoordinateAnchor',
      'interface KernelProfileObservationParams',
      'interface KernelProfileObservationRequest',
    ];

    for (const contractName of contractNames) {
      const declarations = filesUnder(srcRoot)
        .filter((path) => !path.endsWith('.test.ts') && !path.endsWith('.spec.ts'))
        .filter((path) => readFileSync(path, 'utf8').includes(contractName))
        .map((path) => relative(process.cwd(), path));

      expect(declarations).toEqual(['src/services/types.ts']);
    }
  });

  it('keeps Nara activity and symbolic observation contract types declared only at the renderer boundary mirror', () => {
    const srcRoot = join(process.cwd(), 'src');
    const contractNames = [
      'type EventPrivacyClass',
      'type NaraActivityKind',
      'type NaraObservationKind',
      'type NaraEmotionalValenceHint',
      'interface NaraSymbolicObservation',
      'interface NaraActivityEvent',
      'interface KernelProfileObservationEvent',
    ];

    for (const contractName of contractNames) {
      const declarations = filesUnder(srcRoot)
        .filter((path) => !path.endsWith('.test.ts') && !path.endsWith('.spec.ts'))
        .filter((path) => readFileSync(path, 'utf8').includes(contractName))
        .map((path) => relative(process.cwd(), path));

      expect(declarations).toEqual(['src/services/types.ts']);
    }
  });
});
