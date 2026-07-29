// @vitest-environment node
/**
 * Coordinate: M' shell (empty-state registry lint gate — 32.T32.6)
 * Residency: Body/M/pratibimba-app/scripts
 * Actualises: the two claims a lint has to earn — that it CATCHES each way a
 *   registry can go incomplete, and that it does not cry wolf. Then the real
 *   tree is scanned: zero findings, a claim about the LANDED carrier rather
 *   than about fixtures.
 *
 *   Each red case is the same corpus as the green one with exactly one thing
 *   removed, so a green result cannot be an artefact of a rule that scoped
 *   itself to nothing.
 * Does NOT own: the rule content (lint-empty-state-registry.mjs), the copy
 *   (src/ui/emptyStateGrammar.ts), the target ledger
 *   (src/commands/crossLayoutIntent.ts).
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    GRAMMAR_MODULE,
    M_FAMILY_PATTERN,
    TARGET_LEDGER,
    TEST_PATTERN,
    readMounts,
    readRegistrations,
    readTargets,
    scanCarrier,
    scanTree
} from './lint-empty-state-registry.mjs';

const CARRIER_SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const read = relPath => readFileSync(join(CARRIER_SRC, ...relPath.split('/')), 'utf8');

/** A minimal but REAL-SHAPED corpus: the same constructs the carrier uses. */
const LEDGER = `
const target = (extensionId, contributionId, label, face, component, preferredLayout = 'ide-deep') =>
    Object.freeze({ extensionId, contributionId, label, face, component, preferredLayout });
export const CROSS_LAYOUT_INTENT_TARGETS = Object.freeze([
    target('ide-shell-m0-m5', 'canon-studio', 'Canon Studio', 0, 'bimbaGraph'),
    target('m0-anuttara', 'language', 'M0 language layer', 0, 'bimbaGraph'),
    target('m1-paramasiva', 'playedTorus', 'M1 played torus', 0, 'm1PlayedTorus')
]);
`;

const GRAMMAR = `
export const M_EMPTY_STATE_GRAMMAR = Object.freeze([
    Object.freeze({ extensionId: 'm0-anuttara', viewId: 'language', mount: 'panes/A.tsx' }),
    Object.freeze({ extensionId: 'm1-paramasiva', viewId: 'playedTorus', mount: 'panes/B.tsx' })
]);
`;

const MOUNTS = () =>
    new Map([
        ['panes/A.tsx', `export const A = () => <MExtensionEmptyState extensionId="m0-anuttara" viewId="language" />;`],
        [
            'panes/B.tsx',
            `export const B = () => (<div><MExtensionEmptyState extensionId="m1-paramasiva" viewId="playedTorus" /></div>);`
        ]
    ]);

const green = () => ({ ledger: LEDGER, grammar: GRAMMAR, mounts: MOUNTS() });

describe('32.T32.6 — the lint catches an incomplete registry', () => {
    it('is GREEN on the complete fixture (the baseline the reds are measured from)', () => {
        expect(scanCarrier(green()).findings).toEqual([]);
    });

    it('flags an M-family extension the ledger declares with no copy block', () => {
        const corpus = green();
        corpus.grammar = GRAMMAR.replace(
            /\s*Object\.freeze\(\{ extensionId: 'm1-paramasiva'[^)]*\}\),?/,
            ''
        );
        corpus.mounts.delete('panes/B.tsx');
        const findings = scanCarrier(corpus).findings;
        expect(findings.map(f => f.kind)).toEqual(['unregistered-extension']);
        expect(findings[0].detail).toContain('m1-paramasiva');
    });

    it('flags a copy block naming a contribution the ledger never declared', () => {
        const corpus = green();
        corpus.grammar = GRAMMAR.replace("viewId: 'playedTorus'", "viewId: 'not-a-contribution'");
        corpus.mounts.set(
            'panes/B.tsx',
            `<MExtensionEmptyState extensionId="m1-paramasiva" viewId="not-a-contribution" />`
        );
        const findings = scanCarrier(corpus).findings;
        expect(findings.map(f => f.kind)).toEqual(['unknown-target']);
        expect(findings[0].detail).toContain(TARGET_LEDGER);
    });

    it('flags a registration whose declared mount renders nothing — registered, never fired', () => {
        const corpus = green();
        corpus.mounts.delete('panes/B.tsx');
        const findings = scanCarrier(corpus).findings;
        expect(findings.map(f => f.kind)).toEqual(['unmounted-registration']);
        expect(findings[0].detail).toContain('panes/B.tsx');
    });

    it('flags a mount whose registration was retargeted to another view', () => {
        // The registration still exists, so a presence-only rule would pass;
        // the mount now points at a view nothing registers.
        const corpus = green();
        corpus.mounts.set(
            'panes/B.tsx',
            `<MExtensionEmptyState extensionId="m1-paramasiva" viewId="schema" />`
        );
        const kinds = scanCarrier(corpus).findings.map(f => f.kind);
        expect(kinds).toContain('unregistered-mount');
        expect(kinds).toContain('unmounted-registration');
    });

    it('flags a mount for an extension with no copy block at all', () => {
        const corpus = green();
        corpus.mounts.set(
            'panes/C.tsx',
            `<MExtensionEmptyState extensionId="m5-epii" viewId="review" />`
        );
        const findings = scanCarrier(corpus).findings;
        expect(findings.map(f => f.kind)).toEqual(['unregistered-mount']);
    });

    it('flags two copy blocks for one extension', () => {
        const corpus = green();
        corpus.grammar = GRAMMAR.replace(
            "Object.freeze({ extensionId: 'm1-paramasiva', viewId: 'playedTorus', mount: 'panes/B.tsx' })",
            "Object.freeze({ extensionId: 'm1-paramasiva', viewId: 'playedTorus', mount: 'panes/B.tsx' }),\n    Object.freeze({ extensionId: 'm1-paramasiva', viewId: 'schema', mount: 'panes/B.tsx' })"
        );
        const kinds = scanCarrier(corpus).findings.map(f => f.kind);
        expect(kinds).toContain('duplicate-registration');
    });
});

describe('32.T32.6 — the lint does not cry wolf', () => {
    it('ignores non-M-family extensions on the ledger', () => {
        // `ide-shell-m0-m5` and the composition shells are not M-family
        // surfaces; demanding empty states from them would be a false red.
        expect(M_FAMILY_PATTERN.test('ide-shell-m0-m5')).toBe(false);
        expect(M_FAMILY_PATTERN.test('plugin-integrated-1-2-3')).toBe(false);
        expect(M_FAMILY_PATTERN.test('m3-mahamaya')).toBe(true);
        expect(scanCarrier(green()).findings).toEqual([]);
    });

    it('does not read PROSE naming a contribution as a declaration', () => {
        const corpus = green();
        corpus.mounts.set(
            'panes/D.tsx',
            [
                '// <MExtensionEmptyState extensionId="m9-nowhere" viewId="ghost" /> in a comment',
                'const doc = `<MExtensionEmptyState extensionId="m9-nowhere" viewId="ghost" />`;'
            ].join('\n')
        );
        expect(scanCarrier(corpus).findings).toEqual([]);
    });

    it('flags a PRODUCTION mount whose props it cannot read, rather than passing it', () => {
        const corpus = green();
        corpus.mounts.set(
            'panes/E.tsx',
            `<MExtensionEmptyState extensionId={entry.extensionId} viewId={entry.viewId} />`
        );
        const findings = scanCarrier(corpus).findings;
        expect(findings.map(f => f.kind)).toEqual(['unverifiable-mount']);
    });

    it('excludes test files from the MOUNT scan, and only from it', () => {
        expect(TEST_PATTERN.test('ui/mExtensionEmptyStates.test.tsx')).toBe(true);
        expect(TEST_PATTERN.test('panes/JournalTimelinePane.tsx')).toBe(false);
        // The real tree carries deliberate negatives inside specs (an
        // unregistered key, computed props); a green scan proves they are not
        // read as production gaps.
        const report = scanTree(CARRIER_SRC);
        expect(report.findings).toEqual([]);
    });

    it('accepts a mount nested arbitrarily deep in a surface', () => {
        const corpus = green();
        corpus.mounts.set(
            'panes/B.tsx',
            `export const B = () => (<section><ul><li>{cond ? <MExtensionEmptyState extensionId="m1-paramasiva" viewId="playedTorus" /> : null}</li></ul></section>);`
        );
        expect(scanCarrier(corpus).findings).toEqual([]);
    });
});

describe('32.T32.6 — the readers see the real carrier', () => {
    it('reads every M-family extension off the live target ledger', () => {
        const targets = readTargets(read(TARGET_LEDGER));
        const families = new Set(
            [...targets.values()].map(t => t.extensionId).filter(id => M_FAMILY_PATTERN.test(id))
        );
        expect([...families].sort()).toEqual([
            'm0-anuttara',
            'm1-paramasiva',
            'm2-parashakti',
            'm3-mahamaya',
            'm4-nara',
            'm5-epii'
        ]);
    });

    it('reads the six live copy blocks, each keyed to a declared contribution', () => {
        const targets = readTargets(read(TARGET_LEDGER));
        const registrations = readRegistrations(read(GRAMMAR_MODULE));
        expect(registrations).toHaveLength(6);
        for (const registration of registrations) {
            expect(targets.has(`${registration.extensionId}\u0000${registration.viewId}`)).toBe(true);
            expect(registration.mount).toMatch(/\.tsx$/);
        }
    });

    it('finds the live mount site inside its declared surface', () => {
        const mounts = readMounts(read('panes/JournalTimelinePane.tsx'), 'panes/JournalTimelinePane.tsx');
        expect(mounts).toEqual([
            expect.objectContaining({ extensionId: 'm4-nara', viewId: 'journal' })
        ]);
    });
});

describe('32.T32.6 — the landed carrier has a complete registry', () => {
    it('scans the real src tree and finds no gap', () => {
        const report = scanTree(CARRIER_SRC);
        expect(report.findings).toEqual([]);
        expect(report.registrations).toBe(6);
        // Guard against a rule that silently scoped itself to nothing.
        expect(report.scannedFiles).toBeGreaterThan(500);
        expect(report.targets).toBeGreaterThan(20);
    });
});
