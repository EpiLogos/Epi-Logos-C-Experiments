// @vitest-environment node
/**
 * Coordinate: M' composition (single-clock lint gate — 29.T29.4, DR-WC-IP-4)
 * Residency: Body/M/pratibimba-app/scripts
 * Actualises: the two claims a lint has to earn — that it CATCHES a second
 *   clock, and that it does not cry wolf. Then the real tree is scanned: zero
 *   findings, a claim about the LANDED carrier, not about fixtures.
 * Does NOT own: the rule content (lint-single-clock.mjs), the seam
 *   (src/composition/profileTickSubscription.ts), the store (src/state/stores.ts).
 */

import { describe, expect, it } from 'vitest';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLOCK_WRITER_OWNERS, SOCKET_OWNERS, scanSource, scanTree } from './lint-single-clock.mjs';

const CARRIER_SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src');

describe('29.T29.4 — the lint catches a second clock', () => {
    it('flags a second GatewayClient outside the socket owner', () => {
        const findings = scanSource('const rogue = new GatewayClient();', 'panes/RoguePane.tsx');
        expect(findings).toHaveLength(1);
        expect(findings[0].kind).toBe('second-gateway-client');
        expect(findings[0].line).toBe(1);
    });

    it('flags the store mutator reached through getState()', () => {
        const findings = scanSource(
            'useTickStore.getState().setProfile(frame);',
            'panes/RoguePane.tsx'
        );
        expect(findings).toHaveLength(1);
        expect(findings[0].kind).toBe('second-clock-writer');
    });

    it('flags a direct setState on the tick store', () => {
        const findings = scanSource(
            'useTickStore.setState({ profile: frame, generation: 3 });',
            'panes/RoguePane.tsx'
        );
        expect(findings).toHaveLength(1);
        expect(findings[0].detail).toContain('setState');
    });

    it('flags a pane that opens the socket AND writes the clock', () => {
        const findings = scanSource(
            ['const c = new GatewayClient();', 'useTickStore.getState().setProfile(p);'].join('\n'),
            'engine/RogueEngine.tsx'
        );
        expect(findings.map(f => f.kind)).toEqual(['second-gateway-client', 'second-clock-writer']);
    });

    it('flags a TEST that reaches past the seam — the law is carrier-wide', () => {
        // No test carve-out: a test drives the clock through publishProfileTick
        // like the wire does, so reaching into the store is a finding here too.
        const findings = scanSource(
            'useTickStore.setState({ profile: null, generation: null });',
            'panes/SomePane.test.tsx'
        );
        expect(findings).toHaveLength(1);
    });
});

describe('29.T29.4 — the lint does not cry wolf', () => {
    it('permits App to own the socket, but App no longer writes the clock', () => {
        expect(SOCKET_OWNERS).toContain('App.tsx');
        expect(CLOCK_WRITER_OWNERS).not.toContain('App.tsx');
        expect(scanSource('const client = new GatewayClient(undefined, {});', 'App.tsx')).toEqual([]);
        // App publishes through the seam like everyone else.
        expect(scanSource('publishProfileTick(profile);', 'App.tsx')).toEqual([]);
    });

    it('permits the seam and the store to write the clock', () => {
        expect(CLOCK_WRITER_OWNERS).toEqual(
            expect.arrayContaining(['state/stores.ts', 'composition/profileTickSubscription.ts'])
        );
        expect(
            scanSource(
                'useTickStore.getState().setProfile(p); useTickStore.setState({ profile: null, generation: null });',
                'composition/profileTickSubscription.ts'
            )
        ).toEqual([]);
    });

    it("permits the client's own test to construct a client", () => {
        expect(scanSource('const c = new GatewayClient();', 'bridge/gatewayClient.test.ts')).toEqual([]);
    });

    it('does not flag a local test helper that happens to be named setProfile', () => {
        // Judged by RECEIVER, not by name: several suites define a local
        // `setProfile(...)` that already delegates to the seam.
        const findings = scanSource(
            ['function setProfile(p) { publishProfileTick(p); }', 'setProfile(frame);'].join('\n'),
            'panes/SomePane.test.tsx'
        );
        expect(findings).toEqual([]);
    });

    it('permits reading the clock — reading is not writing', () => {
        const findings = scanSource(
            [
                'const profile = useTickStore(s => s.profile);',
                'const { profile: cached, generation } = useCompositionProfile();',
                'const g = useTickStore.getState().generation;'
            ].join('\n'),
            'panes/ReaderPane.tsx'
        );
        expect(findings).toEqual([]);
    });

    it('does not report PROSE naming the forbidden symbols', () => {
        // A grep-based rule reports itself. The parser does not see comments or
        // string bodies as calls.
        const findings = scanSource(
            [
                '/** Never call useTickStore.getState().setProfile here. */',
                '// new GatewayClient() would be a second socket.',
                'const doc = "useTickStore.setState({}) drives the clock";',
                "const jsx = <p>the M5' gate forbids new GatewayClient()</p>;"
            ].join('\n'),
            'panes/DocumentedPane.tsx'
        );
        expect(findings).toEqual([]);
    });
});

describe('29.T29.4 — the landed carrier has one clock', () => {
    it('scans the real src tree and finds no second clock', () => {
        const report = scanTree(CARRIER_SRC);
        expect(report.findings).toEqual([]);
        // Guard against a rule that silently scoped itself to nothing.
        expect(report.scannedFiles).toBeGreaterThan(500);
    });
});
