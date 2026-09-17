// @vitest-environment node
/**
 * Coordinate: M' M0' chrome (the seam register held against S2 — 28.T28.6)
 * Residency: Body/M/pratibimba-app/src/panes/coordinateTree
 * Actualises: the promise `coordinateTreeSeams.ts` makes in its own header —
 *   "THE CLAIMS ARE TESTED AGAINST THE SUBSTRATE … it fails if a named LIVE
 *   method stops being registered, and it fails if an ABSENT field ever lands."
 *   Without this file that header is a claim about a test that does not exist,
 *   which is exactly the species of fiction the seam register was built to stop.
 *
 *   Both directions are load-bearing. A disclosure that outlives its gap is
 *   worse than no disclosure: it tells a reader a capability is missing when the
 *   substrate has since grown it.
 * Does NOT own: the S2 method table (`Body/S/S2/graph-services`), the graph
 *   schema (`Body/S/S2/graph-schema`), the privacy verdict (`ui/privacyGate.ts`),
 *   or the render (`CoordinateTreePane.test.tsx`).
 * Contract: [[CHROME-CONTRACT]] §2 + §7 · rerun tranche [[28.T28.6]].
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
    COORDINATE_TREE_LIVE_METHODS,
    COORDINATE_TREE_SEAMS,
    COORDINATE_TREE_SPEC_METHODS
} from './coordinateTreeSeams';

const REPO_ROOT = resolve(__dirname, '../../../../../..');
const S2_HANDLERS = join(REPO_ROOT, 'Body/S/S2/graph-services/src/s2_handlers.rs');
const GRAPH_API = join(REPO_ROOT, 'Body/S/S2/graph-services/src/graph_api.rs');
const GRAPH_SCHEMA_SRC = join(REPO_ROOT, 'Body/S/S2/graph-schema/src');

const handlers = readFileSync(S2_HANDLERS, 'utf8');

/** The `S2_METHODS` table is the registration — a mention anywhere else is not. */
function registeredMethods(): string[] {
    const table = /pub const S2_METHODS: &\[\(&str, S2HandlerFn\)\] = &\[([\s\S]*?)\n\];/.exec(
        handlers
    );
    expect(table, 'the S2_METHODS table could not be located — the probe, not S2, is broken').not
        .toBeNull();
    return [...(table as RegExpExecArray)[1].matchAll(/\("([^"]+)",/g)].map(match => match[1]);
}

function schemaSources(dir: string): string[] {
    return readdirSync(dir).flatMap(name => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? schemaSources(path) : path.endsWith('.rs') ? [path] : [];
    });
}

describe('28.T28.6 — the seam register is held against the real S2 substrate', () => {
    const registered = registeredMethods();

    it('every method this pane claims to invoke is really registered in S2_METHODS', () => {
        expect(registered.length).toBeGreaterThan(10);
        for (const method of COORDINATE_TREE_LIVE_METHODS) {
            expect(registered, `${method} is not in the S2_METHODS table`).toContain(method);
        }
        expect([...COORDINATE_TREE_LIVE_METHODS]).toEqual(['s2.graph.query']);
    });

    it('the method the 28.6 spec named for deliverable (e) exists — the spec invented nothing', () => {
        for (const method of COORDINATE_TREE_SPEC_METHODS) {
            expect(registered, `${method} should exist; the seam claims it does`).toContain(method);
        }
        // …and the register says so, rather than dismissing the spec's method
        // as fictional. The gap is the PAYLOAD, not the method.
        for (const seam of COORDINATE_TREE_SEAMS) {
            expect(registered.includes(seam.method)).toBe(seam.registered);
        }
    });

    it("`s2'.coordinate.resolve` really is a pure string resolver that cannot carry privacy", () => {
        // The whole justification for deliverable (e)'s honest partial. If this
        // handler ever opens a connection, the seam must be re-argued.
        const body = /fn coordinate_resolve\(params: &Value\)[\s\S]*?\n}\n/.exec(handlers);
        expect(body).not.toBeNull();
        const text = (body as RegExpExecArray)[0];
        expect(text).toContain('GraphMethodService::resolve_coordinate_string');
        expect(text, 'the resolver opened a Neo4j connection — deliverable (e) can now be real').not.toContain(
            'connect_client'
        );
        // The module header names it as one of the two arms that touch no graph.
        expect(handlers).toContain("`s2'.coordinate.resolve`");
    });

    it('no per-node privacy class exists anywhere in the read path — the ABSENT half', () => {
        // If any of these flips, the disclosure has outlived its gap and the
        // per-node grey-out the spec asked for becomes buildable. Better a red
        // test than a surface that keeps apologising for a solved problem.
        const nodeRow = /fn bimba_node_row\(row: &neo4rs::Row\) -> Value \{[\s\S]*?\n}\n/.exec(
            readFileSync(GRAPH_API, 'utf8')
        );
        expect(nodeRow).not.toBeNull();
        expect((nodeRow as RegExpExecArray)[0].toLowerCase()).not.toContain('privacy');

        for (const file of schemaSources(GRAPH_SCHEMA_SRC)) {
            expect(
                readFileSync(file, 'utf8').toLowerCase().includes('privacy'),
                `${file} now declares a privacy property — withdraw the 28.6 (e) seam`
            ).toBe(false);
        }
    });

    it('every seam names a deliverable, a method, an expectation and a real reason', () => {
        expect(COORDINATE_TREE_SEAMS.length).toBeGreaterThan(0);
        for (const seam of COORDINATE_TREE_SEAMS) {
            expect(seam.deliverable).toMatch(/^28\.6 \(/);
            expect(seam.method.length).toBeGreaterThan(0);
            expect(seam.expected.length).toBeGreaterThan(0);
            // A one-word excuse is not a disclosure.
            expect(seam.reason.length).toBeGreaterThan(80);
        }
    });
});
