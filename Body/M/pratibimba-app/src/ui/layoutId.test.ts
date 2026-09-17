// @vitest-environment node
/**
 * Coordinate: M' shell (layout-id authority guard — Track 52.T1)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the enforcement half of the one-layout-id-authority law. Two
 *   things are proven here. (1) The authority's own behaviour — the canon
 *   two-layout domain and the total parse whose daily fallback the persisted
 *   `epi-logos.layout.active` preference has always relied on. (2) The
 *   NO-REDECLARATION guard: a TypeScript AST walk of the real `src` tree that
 *   fails when a layout id appears in TYPE position anywhere outside
 *   `layoutId.ts`. Type position is the whole point — the walk distinguishes a
 *   re-declared union (`readonly layoutId: 'daily-0-1' | 'ide-deep'`) from the
 *   ordinary VALUES the shell is full of (`activeLayout === 'daily-0-1'`,
 *   `switchLayout('ide-deep')`, `availableInLayouts: ['daily-0-1']`), which stay
 *   legal. It is an AST walk and not a regex over prose for exactly that
 *   reason; the house pattern is `src/chromeContract.test.ts`.
 *   The guard is proven in both directions on synthetic sources — RED on an
 *   injected duplicate union, GREEN once that union imports the authority —
 *   so a green tree scan means the walk works, not that it looked nowhere.
 * Does NOT own: layout selection/persistence (App.tsx), or which surfaces
 *   inhabit which layout (leftSidebarModes / omnipanelRuntime / layoutClaims).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { DEFAULT_LAYOUT_ID, LAYOUT_IDS, isLayoutId, parseLayoutId } from './layoutId';
import type { LayoutId } from './layoutId';
import type { ActiveLayoutId } from './layoutClaims';
import type { LeftSidebarLayoutId } from './leftSidebarModes';
import type { OmniPanelLayoutId } from '../panes/omni/omnipanelRuntime';
import type { CrossLayoutId } from '../commands/crossLayoutIntent';

const SRC_ROOT = resolve(__dirname, '..');
/** The ONE module permitted to name the layout ids in type position. */
const AUTHORITY_FILE = resolve(__dirname, 'layoutId.ts');
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);
const LAYOUT_ID_VALUES: readonly string[] = LAYOUT_IDS;

interface LiteralFinding {
    readonly file: string;
    readonly line: number;
    readonly text: string;
}

/**
 * Every layout id used in TYPE position in one source unit. A `LiteralTypeNode`
 * is only produced by the parser where a type is expected, so value literals
 * and comments are excluded by construction rather than by filtering.
 */
export function findLayoutIdTypeLiterals(source: string, filePath: string): LiteralFinding[] {
    const sourceFile = ts.createSourceFile(
        filePath,
        source,
        ts.ScriptTarget.Latest,
        true,
        filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
    const findings: LiteralFinding[] = [];
    const visit = (node: ts.Node) => {
        if (
            ts.isLiteralTypeNode(node) &&
            ts.isStringLiteral(node.literal) &&
            LAYOUT_ID_VALUES.includes(node.literal.text)
        ) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            findings.push({ file: filePath, line: line + 1, text: node.literal.text });
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return findings;
}

function sourceFiles(root: string): string[] {
    const files: string[] = [];
    const walk = (directory: string) => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'test-results') {
                continue;
            }
            const path = join(directory, entry.name);
            if (entry.isDirectory()) {
                walk(path);
            } else if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
                files.push(path);
            }
        }
    };
    walk(root);
    return files;
}

function scanTree(): { scanned: number; findings: LiteralFinding[] } {
    const files = sourceFiles(SRC_ROOT).filter(path => path !== AUTHORITY_FILE);
    const findings = files.flatMap(path =>
        findLayoutIdTypeLiterals(readFileSync(path, 'utf8'), path).map(finding => ({
            ...finding,
            file: relative(SRC_ROOT, finding.file)
        }))
    );
    return { scanned: files.length, findings };
}

describe('layout-id authority (52.T1)', () => {
    it('declares exactly the canon two-layout domain, in canon order', () => {
        expect(LAYOUT_IDS).toEqual(['daily-0-1', 'ide-deep']);
        expect(DEFAULT_LAYOUT_ID).toBe('daily-0-1');
    });

    it('isLayoutId admits both layouts and refuses everything else', () => {
        expect(isLayoutId('daily-0-1')).toBe(true);
        expect(isLayoutId('ide-deep')).toBe(true);
        for (const value of ['', 'IDE-DEEP', 'daily', 'ide_deep', undefined, null, 0, 1, {}, []]) {
            expect(isLayoutId(value), `isLayoutId(${JSON.stringify(value)})`).toBe(false);
        }
    });

    it('parseLayoutId preserves the daily fallback for every untrusted value', () => {
        expect(parseLayoutId('ide-deep')).toBe('ide-deep');
        expect(parseLayoutId('daily-0-1')).toBe('daily-0-1');
        // the pre-52.T1 law: anything that is not 'ide-deep' lands in daily
        for (const value of ['unknown', '', 'Ide-Deep', undefined, null, 7, {}, ['ide-deep']]) {
            expect(parseLayoutId(value), `parseLayoutId(${JSON.stringify(value)})`).toBe('daily-0-1');
        }
    });
});

describe('the four historical aliases ARE the one type (52.T1)', () => {
    // Mutual assignability, checked by `tsc --noEmit`: widening any alias back
    // to its own union — or narrowing one to a single layout — makes these
    // false and fails typecheck before the assertion below ever runs.
    type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

    it('OmniPanelLayoutId · ActiveLayoutId · LeftSidebarLayoutId · CrossLayoutId', () => {
        const omni: Exact<OmniPanelLayoutId, LayoutId> = true;
        const active: Exact<ActiveLayoutId, LayoutId> = true;
        const sidebar: Exact<LeftSidebarLayoutId, LayoutId> = true;
        const cross: Exact<CrossLayoutId, LayoutId> = true;
        expect([omni, active, sidebar, cross]).toEqual([true, true, true, true]);
    });
});

describe('no-redeclaration guard — AST walk (52.T1)', () => {
    const DUPLICATE = [
        "export interface SomePaneProps {",
        "    readonly layoutId: 'daily-0-1' | 'ide-deep';",
        "}"
    ].join('\n');

    const VIA_AUTHORITY = [
        "import type { LayoutId } from '../ui/layoutId';",
        "export interface SomePaneProps {",
        "    readonly layoutId: LayoutId;",
        "}"
    ].join('\n');

    it('FAILS on an injected duplicate union', () => {
        const findings = findLayoutIdTypeLiterals(DUPLICATE, join(SRC_ROOT, 'panes', 'injected.tsx'));
        expect(findings.map(f => f.text)).toEqual(['daily-0-1', 'ide-deep']);
        expect(findings[0].line).toBe(2);
    });

    it('FAILS on a single re-declared layout literal, not only the full union', () => {
        const narrowed = "export type DeepOnly = 'ide-deep';";
        expect(findLayoutIdTypeLiterals(narrowed, join(SRC_ROOT, 'narrowed.ts'))).toHaveLength(1);
    });

    it('PASSES once the duplicate imports the authority instead', () => {
        expect(findLayoutIdTypeLiterals(VIA_AUTHORITY, join(SRC_ROOT, 'panes', 'injected.tsx'))).toEqual([]);
    });

    it('leaves ordinary VALUE uses of the layout ids legal', () => {
        const values = [
            "const a = activeLayout === 'daily-0-1';",
            "store.switchLayout('ide-deep');",
            "const tab = { availableInLayouts: ['daily-0-1', 'ide-deep'] as const };",
            "const owner = 'daily-0-1 | ide-deep';"
        ].join('\n');
        expect(findLayoutIdTypeLiterals(values, join(SRC_ROOT, 'values.ts'))).toEqual([]);
    });

    // This guard AST-walks the ENTIRE carrier source tree (500+ files), so it is
    // I/O-bound by design and runs for seconds even on a quiet machine. The 5s
    // vitest default is a load-sensitive boundary for that walk, not a real
    // budget: under parallel disk contention it has timed out mid-walk, which
    // reports as a guard failure while proving nothing about the tree. The walk
    // gets room to finish and say something true.
    it('no source unit outside the authority declares a layout id in type position', { timeout: 30_000 }, () => {
        const { scanned, findings } = scanTree();
        // an empty walk must not be able to fake a pass
        expect(scanned).toBeGreaterThanOrEqual(100);
        expect(
            findings.map(f => `${f.file}:${f.line} '${f.text}'`),
            'layout ids re-declared in type position — import LayoutId from ui/layoutId instead'
        ).toEqual([]);
    });
});
