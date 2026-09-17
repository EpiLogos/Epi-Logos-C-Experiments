// @vitest-environment node
/**
 * Coordinate: M' shell (no-modal lint gate — 31.T31.8)
 * Residency: Body/M/pratibimba-app/scripts
 * Actualises: the two claims a lint has to earn. (a) It CATCHES — injected
 *   fixtures carrying each forbidden call produce a finding at the right line,
 *   on any receiver or none, including the spec's own example (MessageBox.show
 *   under a review/ path). (b) It does not cry wolf — comments, non-blocking
 *   overlays, and mere mentions are clean. The parser-desync cases are pinned
 *   explicitly: an earlier hand-rolled comment stripper mis-read regex literals
 *   and JSX apostrophes, blanking real code and un-blanking real comments, so
 *   those exact shapes are regression tests now. Then the real tree is scanned:
 *   zero findings, a claim about the LANDED carrier, not about fixtures.
 * Does NOT own: the rule content (lint-no-modal-discipline.mjs), the slot
 *   policy (src/ui/shellSlotPolicy.ts).
 */

import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BLOCKING_CALLS, THEIA_MODAL_CALLS, scanSource, scanTree } from './lint-no-modal-discipline.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const CARRIER_SRC = resolve(SCRIPT_DIR, '..', 'src');

let fixtureRoot;

beforeAll(() => {
    fixtureRoot = mkdtempSync(join(tmpdir(), 'no-modal-fixture-'));
});

afterAll(() => {
    rmSync(fixtureRoot, { recursive: true, force: true });
});

function fixture(relPath, contents) {
    const full = join(fixtureRoot, relPath);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, contents, 'utf8');
    return full;
}

describe('31.T31.8 — the lint catches what CCT-8 forbids', () => {
    it('flags every blocking native call, at the right line', () => {
        for (const call of BLOCKING_CALLS) {
            const source = ['export function go() {', `    window.${call}('really?');`, '}'].join('\n');
            const findings = scanSource(source, 'panes/Fixture.tsx');
            expect(findings, `window.${call} must be caught`).toHaveLength(1);
            expect(findings[0].line).toBe(2);
            expect(findings[0].kind).toBe('blocking-modal-call');
        }
    });

    it('is receiver-agnostic — a bare call or another global evades nothing', () => {
        for (const source of [
            "confirm('really?');",
            "globalThis.confirm('really?');",
            "self.confirm('really?');",
            "window.confirm('really?');",
            "dialogRef.current.showModal();"
        ]) {
            const findings = scanSource(source, 'panes/Fixture.tsx');
            expect(findings, `must be caught: ${source}`).toHaveLength(1);
            expect(findings[0].kind).toBe('blocking-modal-call');
        }
    });

    it('flags the Theia modal APIs named verbatim by CCT-8', () => {
        for (const call of THEIA_MODAL_CALLS) {
            const findings = scanSource(`await ${call}({ title: 'x' });`, 'review/Landing.ts');
            expect(findings, `${call} must be caught`).toHaveLength(1);
            expect(findings[0].kind).toBe('theia-modal-call');
        }
    });

    it("catches the spec's own example: MessageBox.show under a review/ path", () => {
        fixture(
            'review/GateLanding.ts',
            ['export async function land() {', "    await MessageBox.show('confirm the gate');", '}'].join('\n')
        );
        const report = scanTree(fixtureRoot);
        expect(report.findings.map(f => `${f.file}:${f.line}`)).toContain('review/GateLanding.ts:2');
    });

    it('honours a file that declares itself governed by the context marker', () => {
        const source = ['// @epi-logos:context=evidence', "window.confirm('drop this evidence?');"].join('\n');
        const findings = scanSource(source, 'panes/Evidence.tsx');
        expect(findings).toHaveLength(1);
        expect(findings[0].governed).toBe(true);
    });
});

describe('31.T31.8 — the lint does not cry wolf', () => {
    it('ignores prose about modals — comments are not in the parse tree', () => {
        const source = [
            '// never call window.confirm here; the tab IS the landing surface',
            '/* MessageBox.show(…) is prohibited by CCT-8 */',
            'export const ok = true;'
        ].join('\n');
        expect(scanSource(source, 'panes/Documented.tsx')).toEqual([]);
    });

    it('ignores non-blocking overlays — the law is about BLOCKING, not z-index', () => {
        const palette = [
            'export function Palette() {',
            '    return <div className="palette-overlay" onClick={() => setOpen(false)} />;',
            '}'
        ].join('\n');
        expect(scanSource(palette, 'panes/CommandPalette.tsx')).toEqual([]);
    });

    it('ignores a mention that is not a call site', () => {
        expect(scanSource('const banned = ["window.confirm"];', 'ui/rules.ts')).toEqual([]);
        expect(scanSource('type Dialog = { show: () => void };', 'ui/types.ts')).toEqual([]);
    });

    // Regression, from adversarial review of this tranche's first cut: a
    // hand-rolled comment stripper desynced its quote state on these exact
    // shapes and then mis-read the WHOLE REST of the file — blanking real code
    // (a modal there became invisible) and leaving real comments intact (a
    // comment about the rule became a violation). Both directions are pinned.
    describe('parser-desync regressions (why this reads the AST, not text)', () => {
        it('a regex literal containing a quote does not blind the rest of the file', () => {
            const source = [
                "export const encode = (c: string) => encodeURIComponent(c).replace(/'/g, '%27');",
                "export const uri = 'epi-logos://ide/m1-paramasiva-played-torus/k2';",
                "window.confirm('still visible?');"
            ].join('\n');
            const findings = scanSource(source, 'panes/m1CoordinateTreeContribution.ts');
            expect(findings, 'the call after a regex literal must still be seen').toHaveLength(1);
            expect(findings[0].line).toBe(3);
        });

        it('a JSX apostrophe does not turn a later comment into a violation', () => {
            const source = [
                'export function Pane() {',
                "    return <p>the M5' gate is open</p>;",
                '}',
                '// CCT-8: never window.confirm( ) here.'
            ].join('\n');
            expect(scanSource(source, 'panes/PratibimbaCoordinatePane.tsx')).toEqual([]);
        });

        it('backticks inside a regex do not desync the scan', () => {
            const source = [
                'const ROW = /^\\| `[^`]+` \\|/;',
                '// a comment mentioning window.confirm( ) after the regex',
                'export const ok = ROW;'
            ].join('\n');
            expect(scanSource(source, 'chromeContract.test.ts')).toEqual([]);
        });
    });
});

describe('31.T31.8 — the landed carrier is clean', () => {
    // Whole-tree scan: I/O-bound by design, and the 5s vitest default is a
    // load-sensitive boundary for it rather than a real budget — under parallel
    // disk contention this has been killed MID-SCAN, reporting RED while
    // proving nothing about the tree. Give the scan room to finish and be true.
    it('scans the REAL src tree and finds no blocking modal', { timeout: 30_000 }, () => {
        const report = scanTree(CARRIER_SRC);
        // guard against a vacuous pass from a mis-resolved root
        expect(report.scannedFiles).toBeGreaterThan(200);
        expect(
            report.findings.map(f => `${f.file}:${f.line} ${f.call}`),
            'a blocking modal reached the carrier — CCT-8: the tab IS the landing surface'
        ).toEqual([]);
    });
});
