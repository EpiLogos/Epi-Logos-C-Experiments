/**
 * Coordinate: M' shell (visual-regression baseline catalog — Track 30.T30.14)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the fixture-presence + catalog-completeness gate DR-WC-DL-5 asks
 *   for, re-homed to the carrier's real visual-regression set. It binds
 *   `tests/e2e/fixtures/visual-regression/CATALOG.md` to (a) the committed
 *   baseline PNGs in that directory (exact bijection — nothing undocumented,
 *   no phantom entry) and (b) the proving tests in `visual-regression.spec.ts`
 *   (every committed snapshot name is asserted by a real toHaveScreenshot call;
 *   every in-run proof names a real test). Same cross-file parity pattern as
 *   foundationPrinciples.test.ts.
 * Public surface: none (test-only).
 * Does NOT own: the visual-regression capture law (owned by
 *   tests/e2e/visual-regression.spec.ts) or the baseline pixels themselves.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const FIXTURES_DIR = resolve(__dirname, '../../tests/e2e/fixtures/visual-regression');
const CATALOG = resolve(FIXTURES_DIR, 'CATALOG.md');
const SPEC = resolve(__dirname, '../../tests/e2e/visual-regression.spec.ts');

interface CommittedEntry {
    readonly id: string;
    readonly baseline: string;
    readonly snapshot: string;
    readonly tag: string;
}

interface InRunEntry {
    readonly id: string;
    readonly tag: string;
}

/** Slice a `## <heading>` section up to the next `## ` sibling heading. */
function section(md: string, heading: string): string {
    const marker = `## ${heading}`;
    const start = md.indexOf(marker);
    if (start === -1) {
        throw new Error(`catalog is missing the "${heading}" section`);
    }
    const rest = md.slice(start + marker.length);
    const next = rest.indexOf('\n## ');
    return next === -1 ? rest : rest.slice(0, next);
}

function field(chunk: string, label: string): string {
    const match = new RegExp(`(?:^|\\n)- \\*\\*${label}:\\*\\* \`([^\`]+)\``).exec(chunk);
    return match ? match[1] : '';
}

/** The proving-test tag is the parenthesised id in the first backtick, e.g.
 *  "- **Proving test:** `(c.1)` in `visual-regression.spec.ts`" -> "c.1". */
function provingTag(chunk: string): string {
    const match = /(?:^|\n)- \*\*Proving test:\*\* `\(([^)]+)\)`/.exec(chunk);
    return match ? match[1] : '';
}

function entryChunks(sectionText: string): Array<{ id: string; chunk: string }> {
    return sectionText
        .split(/^### /m)
        .slice(1)
        .map(chunk => ({ id: chunk.split('\n', 1)[0].trim(), chunk }));
}

const catalogText = readFileSync(CATALOG, 'utf8');
const specText = readFileSync(SPEC, 'utf8');

const committed: CommittedEntry[] = entryChunks(section(catalogText, 'Committed baselines')).map(
    ({ id, chunk }) => ({
        id,
        baseline: field(chunk, 'Baseline'),
        snapshot: field(chunk, 'Snapshot name'),
        tag: provingTag(chunk)
    })
);

const inRun: InRunEntry[] = entryChunks(
    section(catalogText, 'In-run determinism proofs (no committed baseline by design)')
).map(({ id, chunk }) => ({ id, tag: provingTag(chunk) }));

const committedPngs = readdirSync(FIXTURES_DIR)
    .filter(name => name.endsWith('.png'))
    .sort();

describe('visual-regression baseline catalog (30.T30.14)', () => {
    it('parses every committed entry with all required fields', () => {
        expect(committed.length).toBeGreaterThanOrEqual(4);
        for (const entry of committed) {
            expect(entry.id, `id for ${JSON.stringify(entry)}`).not.toBe('');
            expect(entry.baseline, `baseline for ${entry.id}`).not.toBe('');
            expect(entry.snapshot, `snapshot for ${entry.id}`).not.toBe('');
            expect(entry.tag, `proving tag for ${entry.id}`).not.toBe('');
        }
    });

    it('the catalog is in exact bijection with the committed baseline PNGs', () => {
        const declared = committed.map(entry => entry.baseline).sort();
        // No committed baseline goes undocumented, and the catalog lists no
        // fixture whose PNG is not actually committed.
        expect(declared).toEqual(committedPngs);
    });

    it('every committed snapshot is asserted by a real toHaveScreenshot call', () => {
        for (const entry of committed) {
            expect(
                specText.includes(`toHaveScreenshot('${entry.snapshot}'`),
                `${entry.id}: snapshot ${entry.snapshot} must be produced by the proving suite`
            ).toBe(true);
        }
    });

    it('every proving-test tag names a real test in the proving suite', () => {
        for (const entry of [...committed, ...inRun]) {
            expect(
                specText.includes(`test('(${entry.tag})`),
                `${entry.id}: test (${entry.tag}) must exist in visual-regression.spec.ts`
            ).toBe(true);
        }
    });

    it('in-run proofs commit no baseline PNG (they compare pixels within the run)', () => {
        expect(inRun.length).toBeGreaterThanOrEqual(1);
        for (const entry of inRun) {
            expect(
                committedPngs.some(name => name.startsWith(`${entry.id}-`)),
                `${entry.id} is an in-run proof and must not commit a baseline`
            ).toBe(false);
        }
    });

    it('honestly records DR-WC-DL-5 as PROPOSED, not validated', () => {
        expect(catalogText).toContain('DR-WC-DL-5');
        expect(catalogText).toMatch(/DR-WC-DL-5[^\n]*PROPOSED/);
        expect(catalogText).not.toMatch(/DR-WC-DL-5[^\n]*VALIDATED/);
    });
});
