// @vitest-environment node
/**
 * Coordinate: M' shell (e2e import-graph gate — Track 00 gate hygiene)
 * Residency: Body/M/pratibimba-app/scripts
 * Actualises: the two claims a lint has to earn. (a) It CATCHES — a fixture
 *   spec that reaches `import.meta.glob` through two hops is reported WITH the
 *   full chain, because the thrown frame names only the leaf and finding the
 *   edge by hand took a bisect. (b) It does not cry wolf — a spec that imports
 *   pure modules, and prose merely naming the API, are clean. Then the real
 *   tree is scanned: zero findings, a claim about the LANDED carrier.
 * Does NOT own: the rule content (lint-e2e-import-graph.mjs), the icon register,
 *   or the motion tokens.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { APP_ROOT, chainsToBuildOnlyApi, resolveImport } from './lint-e2e-import-graph.mjs';

let root;

function file(relPath, contents) {
    const full = join(root, relPath);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, contents, 'utf8');
    return full;
}

beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'e2e-graph-fixture-'));
});

afterAll(() => {
    rmSync(root, { recursive: true, force: true });
});

describe('the lint catches a build-only API reachable from a spec', () => {
    it('reports the FULL chain, not just the leaf', () => {
        file('tests/e2e/thing.spec.ts', "import { law } from '../../src/ui/law';\n");
        file('src/ui/law.ts', "export { thing } from './widget';\nexport const law = 1;\n");
        file('src/ui/widget.tsx', "import { url } from './assets';\nexport const thing = url;\n");
        file('src/ui/assets.ts', "const M = import.meta.glob('../a/*.svg', { eager: true });\nexport const url = M;\n");

        const findings = chainsToBuildOnlyApi(root);
        expect(findings).toHaveLength(1);
        expect(findings[0].api).toBe('import.meta.glob');
        expect(findings[0].chain).toEqual([
            'tests/e2e/thing.spec.ts',
            'src/ui/law.ts',
            'src/ui/widget.tsx',
            'src/ui/assets.ts'
        ]);
    });
});

describe('the lint does not cry wolf', () => {
    let cleanRoot;

    beforeAll(() => {
        cleanRoot = mkdtempSync(join(tmpdir(), 'e2e-graph-clean-'));
        const write = (rel, body) => {
            const full = join(cleanRoot, rel);
            mkdirSync(dirname(full), { recursive: true });
            writeFileSync(full, body, 'utf8');
        };
        write('tests/e2e/clean.spec.ts', "import { law } from '../../src/ui/law';\n");
        // Prose naming the API is not a call — and a pure module chain is fine.
        write('src/ui/law.ts', "// never reach import.meta.glob from here\nexport const law = 1;\n");
    });

    afterAll(() => rmSync(cleanRoot, { recursive: true, force: true }));

    it('passes a spec whose graph stays on pure modules', () => {
        expect(chainsToBuildOnlyApi(cleanRoot)).toEqual([]);
    });

    it('resolves .ts, .tsx and index files the way the bundler does', () => {
        const from = join(root, 'tests/e2e/thing.spec.ts');
        expect(resolveImport(from, '../../src/ui/law')).toBe(join(root, 'src/ui/law.ts'));
        expect(resolveImport(join(root, 'src/ui/law.ts'), './widget')).toBe(
            join(root, 'src/ui/widget.tsx')
        );
        // A bare package specifier is not this rule's business.
        expect(resolveImport(from, '@playwright/test')).toBeNull();
    });
});

describe('the landed carrier keeps its e2e suite loadable', () => {
    it('no spec in the real tree reaches a Vite build-only API', () => {
        expect(chainsToBuildOnlyApi(APP_ROOT)).toEqual([]);
    });
});
