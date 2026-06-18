import { execFile } from 'node:child_process';
import { chmod, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

import { specRetrieveContentText } from '../src/tools/spec-retrieve.js';

const execFileAsync = promisify(execFile);

const COORDINATES = ['S0', 'S3', 'M4-3', 'M5', "P5'", 'cpf'] as const;
const DEPTHS = ['pithy', 'qv-detail', 'relational'] as const;

async function runCanonCli(coordinate: string, depth: string): Promise<string> {
  const { stdout } = await execFileAsync(
    process.env.EPI_CANON_BIN ?? 'epi',
    ['canon', 'coord', coordinate, '--depth', depth, '--json'],
    {
      cwd: process.env.EPILOGOS_ROOT ?? resolve(process.cwd(), '../../../../..'),
      maxBuffer: 16 * 1024 * 1024,
    }
  );
  return stdout.trimEnd();
}

describe('canon parity', () => {
  for (const coordinate of COORDINATES) {
    for (const depth of DEPTHS) {
      it(`returns byte-identical JSON for ${coordinate} at ${depth}`, async () => {
        const cli = await runCanonCli(coordinate, depth);
        const mcp = await specRetrieveContentText({ coordinate, depth });

        expect(mcp).toBe(cli);
      });
    }
  }
});

describe('backward compatibility', () => {
  it('defaults spec_retrieve depth to pithy when omitted', async () => {
    const originalEpiBin = process.env.EPI_CANON_BIN;
    const tempDir = await mkdtemp(join(tmpdir(), 'bimba-canon-adapter-'));
    const fakeEpi = join(tempDir, 'epi');

    await writeFile(
      fakeEpi,
      [
        '#!/bin/sh',
        'printf \'{"subcommand":"%s","surface":"%s","coordinate":"%s","depth":"%s","jsonFlag":"%s"}\' "$1" "$2" "$3" "$5" "$6"',
        '',
      ].join('\n'),
    );
    await chmod(fakeEpi, 0o755);

    try {
      process.env.EPI_CANON_BIN = fakeEpi;
      const withDefault = await specRetrieveContentText({ coordinate: 'S3' });
      const explicitPithy = await specRetrieveContentText({
        coordinate: 'S3',
        depth: 'pithy',
      });

      expect(withDefault).toBe(explicitPithy);
      expect(JSON.parse(withDefault)).toMatchObject({
        subcommand: 'canon',
        surface: 'coord',
        coordinate: 'S3',
        depth: 'pithy',
        jsonFlag: '--json',
      });
    } finally {
      if (originalEpiBin === undefined) {
        delete process.env.EPI_CANON_BIN;
      } else {
        process.env.EPI_CANON_BIN = originalEpiBin;
      }
    }
  });
});
