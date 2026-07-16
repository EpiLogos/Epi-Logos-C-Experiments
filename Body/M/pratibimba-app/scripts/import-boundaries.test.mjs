/**
 * Coordinate: M' shell (07-t0 import-boundary behavior - 11.T11.5)
 * Residency: Body/M/pratibimba-app/scripts
 * Position (#n): #4 - active carrier contract gate
 * Actualises: behavioral proof that the frozen six-extension authority is
 *   consumed without rebuilding its source trees and that real module edges,
 *   including relative S-stack paths, fail closed.
 * Public surface: Vitest import-boundary suite.
 * Does NOT own: the 07-t0 authority or module ownership policy.
 * Contract: [[M'-SYSTEM-SPEC]] carrier decision and
 *   Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json.
 */

import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
    DEFAULT_AUTHORITY_PATH,
    DEFAULT_REPO_ROOT,
    DEFAULT_SRC_ROOT,
    inspectSourceImports,
    loadBoundaryAuthority,
    scanCarrierImports
} from './lint-import-boundaries.mjs';

const temporaryRoots = [];

afterEach(() => {
    for (const root of temporaryRoots.splice(0)) {
        rmSync(root, { recursive: true, force: true });
    }
});

describe('07-t0 active-carrier import boundary', () => {
    it('loads all six frozen extension rows and their shared forbidden authority', () => {
        const authority = loadBoundaryAuthority(DEFAULT_AUTHORITY_PATH);

        expect(authority.extensionIds).toEqual([
            'm0-anuttara',
            'm1-paramasiva',
            'm2-parashakti',
            'm3-mahamaya',
            'm4-nara',
            'm5-epii'
        ]);
        expect(authority.forbiddenImports).toEqual(
            expect.arrayContaining([
                'Body/S/S0',
                'Body/S/S2',
                'Body/S/S3',
                'Body/S/S5',
                '@clockworklabs/spacetimedb-sdk',
                'neo4j-driver',
                'redis',
                'portal-core',
                'epii-review-core',
                'epii-agent-core'
            ])
        );
    });

    it('detects static, re-export, dynamic, require, and resolved-relative forbidden edges', () => {
        const { forbiddenImports } = loadBoundaryAuthority(DEFAULT_AUTHORITY_PATH);
        const filePath = join(DEFAULT_SRC_ROOT, 'panes', 'boundary-probe.ts');
        const source = [
            "import neo4j from 'neo4j-driver';",
            "export { Kernel } from 'portal-core/kernel';",
            "const sdk = import('@clockworklabs/spacetimedb-sdk');",
            "const cache = require('redis/client');",
            "import profile from '../../../../S/S0/portal-core';",
            "const harmless = 'neo4j-driver is named in documentation';"
        ].join('\n');

        const findings = inspectSourceImports({
            source,
            filePath,
            repoRoot: DEFAULT_REPO_ROOT,
            forbiddenImports
        });

        expect(findings.map(({ line, specifier, forbiddenImport }) => ({
            line,
            specifier,
            forbiddenImport
        }))).toEqual([
            { line: 1, specifier: 'neo4j-driver', forbiddenImport: 'neo4j-driver' },
            { line: 2, specifier: 'portal-core/kernel', forbiddenImport: 'portal-core' },
            {
                line: 3,
                specifier: '@clockworklabs/spacetimedb-sdk',
                forbiddenImport: '@clockworklabs/spacetimedb-sdk'
            },
            { line: 4, specifier: 'redis/client', forbiddenImport: 'redis' },
            {
                line: 5,
                specifier: '../../../../S/S0/portal-core',
                forbiddenImport: 'Body/S/S0'
            }
        ]);
    });

    it('walks real files and reports an injected violation without matching prose', () => {
        const root = mkdtempSync(join(tmpdir(), 'pratibimba-import-boundary-'));
        temporaryRoots.push(root);
        const srcRoot = join(root, 'src');
        mkdirSync(join(srcRoot, 'panes'), { recursive: true });
        writeFileSync(
            join(srcRoot, 'safe.ts'),
            "import { gateway } from './bridge/gatewayHolder';\nconst note = 'portal-core';\n"
        );
        writeFileSync(
            join(srcRoot, 'panes', 'unsafe.tsx'),
            "export { Driver } from 'neo4j-driver/lib/driver';\n"
        );

        const report = scanCarrierImports({
            repoRoot: DEFAULT_REPO_ROOT,
            srcRoot,
            authorityPath: DEFAULT_AUTHORITY_PATH
        });

        expect(report.scannedFiles).toBe(2);
        expect(report.findings).toEqual([
            expect.objectContaining({
                file: 'panes/unsafe.tsx',
                line: 1,
                specifier: 'neo4j-driver/lib/driver',
                forbiddenImport: 'neo4j-driver'
            })
        ]);
    });

    it('keeps the current active carrier free of direct forbidden imports', () => {
        const report = scanCarrierImports();

        expect(report.scannedFiles).toBeGreaterThan(100);
        expect(report.findings).toEqual([]);
    });
});
