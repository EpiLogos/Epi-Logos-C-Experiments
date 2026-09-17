// @vitest-environment node
/**
 * Coordinate: M' M5' (the Autoresearch seam register held against the stack — 26.T26.6)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the promise `autoresearchSeams.ts` makes in its own header — the
 *   claims are tested against the substrate, so the register fails if a named
 *   LIVE method stops being dispatched AND fails the moment the ABSENT
 *   recompose-pass producer lands. Both directions are load-bearing: a
 *   disclosure that outlives its gap tells the reader a capability is missing
 *   after the substrate grew it, and keeps the ribbon apologising for nothing.
 * Does NOT own: the S-layer method tables, the improvement law, the intent
 *   ledger (`src/commands/crossLayoutIntent.ts`), or the render.
 * Contract: [[M5'-SPEC]] · rerun tranche [[26.T26.6]].
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
    AUTORESEARCH_LIVE_METHODS,
    AUTORESEARCH_SEAMS,
    autoresearchSeam,
    RECOMPOSE_PASS_SEAM
} from './autoresearchSeams';

const REPO_ROOT = resolve(__dirname, '../../../../..');
const AUTORESEARCH_SRC = join(REPO_ROOT, 'Body/S/S5/epii-autoresearch-core/src');

/**
 * Every place this stack turns a method NAME into a call. Track 53 moved the
 * handlers to their coordinates, so "is it dispatched?" is the union of the
 * S-root port tables plus the S0 gate host's own match block.
 */
const DISPATCH_SOURCES = Object.freeze({
    's0 (epi-cli gate host)': 'Body/S/S0/epi-cli/src/gate/server/dispatch.rs',
    's1 (hen-compiler-core)': 'Body/S/S1/hen-compiler-core/src/s1_handlers.rs',
    's2 (graph-services)': 'Body/S/S2/graph-services/src/s2_handlers.rs',
    's3 (gateway)': 'Body/S/S3/gateway/src/s3_handlers.rs',
    's5 (epii-review-core)': 'Body/S/S5/epii-review-core/src/s5_handlers.rs',
    's5 (epii-agent-core)': 'Body/S/S5/epii-agent-core/src/s5_handlers/mod.rs',
    's5 (epii-autoresearch-core)': 'Body/S/S5/epii-autoresearch-core/src/s5_handlers/mod.rs'
});

const dispatchBodies = Object.fromEntries(
    Object.entries(DISPATCH_SOURCES).map(([label, relative]) => [
        label,
        readFileSync(join(REPO_ROOT, relative), 'utf8')
    ])
);

function dispatchedBy(method: string): string[] {
    return Object.entries(dispatchBodies)
        .filter(([, body]) => body.includes(`"${method}"`))
        .map(([label]) => label);
}

/** Every `.rs` file under the autoresearch crate's `src/`, path + body. */
function crateSources(dir: string = AUTORESEARCH_SRC): Array<[string, string]> {
    const out: Array<[string, string]> = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            out.push(...crateSources(full));
        } else if (entry.endsWith('.rs')) {
            out.push([full, readFileSync(full, 'utf8')]);
        }
    }
    return out;
}

describe('26.T26.6 — the Autoresearch seam register is held against the real S5 substrate', () => {
    it('every method the pane claims to invoke is really dispatched somewhere in Body/S', () => {
        for (const method of AUTORESEARCH_LIVE_METHODS) {
            expect(
                dispatchedBy(method),
                `${method} has no dispatch arm in any S-layer table — the Autoresearch surface riding it is now a lie`
            ).not.toEqual([]);
        }
        // sanity on the probe itself: a method everyone agrees exists.
        expect(dispatchedBy('s2.graph.query').length).toBeGreaterThan(0);
    });

    it('the recompose-pass producer exists but is CALLED BY NOTHING outside tests', () => {
        // The register's own claim, first — this is the seam under test.
        expect(RECOMPOSE_PASS_SEAM.available).toBe(false);
        expect(autoresearchSeam(RECOMPOSE_PASS_SEAM.name)).toBe(RECOMPOSE_PASS_SEAM);

        const sources = crateSources();
        const definition = sources.find(([path]) => path.endsWith('recompose.rs'));
        expect(definition?.[1], 'recompose.rs must still define the function the ribbon names').toContain(
            'pub fn recompose_pass('
        );

        // …and no OTHER file in the crate calls it. The day a handler does, this
        // goes red: the pass becomes projectable and the ribbon must count it.
        const callers = sources
            .filter(([path]) => !path.endsWith('recompose.rs'))
            .filter(([, body]) => /\brecompose_pass\s*\(/.test(body))
            .map(([path]) => path.slice(REPO_ROOT.length + 1));
        expect(
            callers,
            'recompose_pass now has a production caller — withdraw the 26.6 (b) seam and project the pass count'
        ).toEqual([]);
    });

    it('`ImproveStatus` — the struct `s5\'.improve.status` serialises — carries no pass ordinal', () => {
        expect(RECOMPOSE_PASS_SEAM.carrierName).toContain('ImproveStatus');

        const types = readFileSync(join(AUTORESEARCH_SRC, 'types.rs'), 'utf8');
        const start = types.indexOf('pub struct ImproveStatus {');
        expect(start, 'ImproveStatus left types.rs — re-argue the seam').toBeGreaterThan(-1);
        const body = types.slice(start, types.indexOf('}', start));
        // The seven fields the parser really consumes, and nothing pass-shaped.
        for (const field of [
            'loop_state',
            'active_vectors',
            'last_run',
            'total_runs',
            'keep_count',
            'discard_count',
            'kernel_evidence_count'
        ]) {
            expect(body, `ImproveStatus lost ${field} — the pane's parser is now wrong`).toContain(field);
        }
        expect(
            /recompose|\bpass\b/.test(body),
            'ImproveStatus grew a pass field — withdraw the 26.6 (b) seam and read it'
        ).toBe(false);
    });

    it('every seam names a deliverable, a subject, an expectation and a real reason', () => {
        expect(AUTORESEARCH_SEAMS.length).toBe(3);
        for (const seam of AUTORESEARCH_SEAMS) {
            expect(seam.deliverable).toMatch(/^26\.6 \(/);
            expect(seam.name.length).toBeGreaterThan(0);
            expect(seam.expected.length).toBeGreaterThan(0);
            // A one-word excuse is not a disclosure.
            expect(seam.reason.length).toBeGreaterThan(120);
        }
        // Exactly one absence — the register must not quietly grow apologies.
        expect(AUTORESEARCH_SEAMS.filter(seam => !seam.available)).toEqual([RECOMPOSE_PASS_SEAM]);
    });

    it('the capacity route the register calls LIVE really resolves onto this pane', async () => {
        const { intentTarget } = await import('../commands/crossLayoutIntent');
        const seam = autoresearchSeam('ide-shell-m0-m5/capacity:<id>');
        expect(seam?.available).toBe(true);

        const { capacityIntentContributionId, M5_OPERATIONAL_CAPACITIES } = await import(
            './autoresearchModel'
        );
        for (const capacity of M5_OPERATIONAL_CAPACITIES) {
            expect(
                intentTarget({
                    requestedExtensionId: 'ide-shell-m0-m5',
                    requestedContributionId: capacityIntentContributionId(capacity.id)
                })?.component,
                `capacity:${capacity.id} no longer resolves onto the Autoresearch pane`
            ).toBe('autoresearch');
        }
    });
});
