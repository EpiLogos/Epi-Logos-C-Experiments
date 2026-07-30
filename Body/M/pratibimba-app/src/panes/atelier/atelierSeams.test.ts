// @vitest-environment node
/**
 * Coordinate: M' M5-5' (the Atelier seam register held against the stack — 28.T28.7)
 * Residency: Body/M/pratibimba-app/src/panes/atelier
 * Actualises: the promise `atelierSeams.ts` makes in its own header — "THE
 *   CLAIMS ARE TESTED AGAINST THE SUBSTRATE … it fails if a named LIVE method
 *   stops being dispatched, and it fails the moment an ABSENT one lands."
 *   Without this file that header is a claim about a test that does not exist,
 *   which is the species of fiction the seam register was built to stop.
 *
 *   Both directions are load-bearing. A disclosure that outlives its gap is
 *   worse than no disclosure: it tells a reader a capability is missing after
 *   the substrate has grown it, and it keeps a working stage disabled.
 * Does NOT own: the S-layer method tables, the method-name registry
 *   (`Body/S/S3/gateway-contract/src/protocol.rs`), the target ledger
 *   (`src/commands/crossLayoutIntent.ts`), or the render.
 * Contract: [[CHROME-CONTRACT]] §2 + §4 · rerun tranche [[28.T28.7]].
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
    ATELIER_AGENT_ROUTE,
    ATELIER_AXIOM_CROSSLINK_COMPONENT,
    ATELIER_LIVE_METHODS,
    ATELIER_SEAMS,
    ATELIER_SPEC_AGENT_TOOLS,
    ATELIER_UNDISPATCHED_METHODS
} from './atelierSeams';

const REPO_ROOT = resolve(__dirname, '../../../../../..');

/**
 * Every place this stack turns a method NAME into a call. Track 53 moved the
 * handlers to their coordinates, so "is it dispatched?" is answered by the
 * union of the S-root port tables plus the S0 gate host's own match block —
 * never by a mention in a doc, a test fixture, or the contract registry.
 */
const DISPATCH_SOURCES = Object.freeze({
    's0 (epi-cli gate host)': 'Body/S/S0/epi-cli/src/gate/server/dispatch.rs',
    's1 (hen-compiler-core)': 'Body/S/S1/hen-compiler-core/src/s1_handlers.rs',
    's2 (graph-services)': 'Body/S/S2/graph-services/src/s2_handlers.rs',
    's3 (gateway)': 'Body/S/S3/gateway/src/s3_handlers.rs',
    's5 (epii-review-core)': 'Body/S/S5/epii-review-core/src/s5_handlers.rs'
});

/** The contract's method-name registry — declaration, NOT dispatch. */
const PROTOCOL = join(REPO_ROOT, 'Body/S/S3/gateway-contract/src/protocol.rs');
/** The gateway's own record of which declared methods have no S0 host arm. */
const DISPATCH_CONTRACT_TEST = join(REPO_ROOT, 'Body/S/S3/gateway/tests/dispatch_contract.rs');

const dispatchBodies = Object.fromEntries(
    Object.entries(DISPATCH_SOURCES).map(([label, relative]) => [
        label,
        readFileSync(join(REPO_ROOT, relative), 'utf8')
    ])
);

/** Which dispatch source, if any, really carries an arm for this method. */
function dispatchedBy(method: string): string[] {
    return Object.entries(dispatchBodies)
        .filter(([, body]) => body.includes(`"${method}"`))
        .map(([label]) => label);
}

describe('28.T28.7 — the Atelier seam register is held against the real S-stack', () => {
    it('reads the real dispatch sources, not empty files', () => {
        for (const [label, body] of Object.entries(dispatchBodies)) {
            expect(body.length, `${label} dispatch source is non-trivial`).toBeGreaterThan(2000);
        }
        // sanity on the probe itself: a method everyone agrees exists.
        expect(dispatchedBy('s2.graph.query').length).toBeGreaterThan(0);
    });

    it('every stage method the Atelier claims to invoke is really dispatched', () => {
        for (const method of ATELIER_LIVE_METHODS) {
            expect(
                dispatchedBy(method),
                `${method} has no dispatch arm in any S-layer table — the Atelier stage riding it is now a lie`
            ).not.toEqual([]);
        }
    });

    it("`s0'.anuttara.trace` is DECLARED but NOT DISPATCHED — the psychoid gap", () => {
        const protocol = readFileSync(PROTOCOL, 'utf8');
        for (const method of ATELIER_UNDISPATCHED_METHODS) {
            // declared: it is advertised on the wire, so the spec invented nothing
            expect(
                protocol.includes(`"${method}"`),
                `${method} left the gateway METHOD_NAMES registry — re-argue the seam`
            ).toBe(true);
            // …and NOT dispatched. The day an arm lands this goes red, which is
            // the point: the psychoid stage must be re-enabled, not left apologising.
            expect(
                dispatchedBy(method),
                `${method} now HAS a dispatch arm — withdraw the 28.7 (b) seam and re-enable the psychoid stage`
            ).toEqual([]);
        }
        // The gateway's own crosswalk says the same thing in its own words.
        expect(readFileSync(DISPATCH_CONTRACT_TEST, 'utf8')).toContain('"s0\'.anuttara.trace"');
    });

    it('no `aletheia_*` name is a gateway method anywhere — the CORRECTION, proven', () => {
        const protocol = readFileSync(PROTOCOL, 'utf8');
        for (const tool of ATELIER_SPEC_AGENT_TOOLS) {
            expect(
                dispatchedBy(tool),
                `${tool} became a dispatched gateway method — the 26.T26.3 CORRECTION needs re-reading`
            ).toEqual([]);
            expect(
                protocol.includes(tool),
                `${tool} entered the method-name registry — re-argue the agent-tool seam`
            ).toBe(false);
        }
        // …while the route an agent tool actually travels IS dispatched, which is
        // what makes "use the capability, don't fake the tool" a real alternative.
        expect(dispatchedBy(ATELIER_AGENT_ROUTE)).not.toEqual([]);
    });

    it('no CrossLayoutIntent target resolves to the axiom inspector — deliverable (e) gap', async () => {
        const { CROSS_LAYOUT_INTENT_TARGETS } = await import('../../commands/crossLayoutIntent');
        expect(
            CROSS_LAYOUT_INTENT_TARGETS.filter(
                target => target.component === ATELIER_AXIOM_CROSSLINK_COMPONENT
            ),
            `a target now resolves to ${ATELIER_AXIOM_CROSSLINK_COMPONENT} — withdraw the 28.7 (e) seam and wire the cross-link`
        ).toEqual([]);
    });

    it('every seam names a deliverable, a subject, an expectation and a real reason', () => {
        expect(ATELIER_SEAMS.length).toBe(3);
        for (const seam of ATELIER_SEAMS) {
            expect(seam.deliverable).toMatch(/^28\.7 \(/);
            expect(seam.name.length).toBeGreaterThan(0);
            expect(seam.expected.length).toBeGreaterThan(0);
            // A one-word excuse is not a disclosure.
            expect(seam.reason.length).toBeGreaterThan(120);
            expect(seam.available).toBe(false);
        }
    });
});
