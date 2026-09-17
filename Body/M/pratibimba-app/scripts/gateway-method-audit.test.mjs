// @vitest-environment node
/**
 * Unit tests for the Track-00.T5 gateway method audit: the corpus scanner and
 * the response classifier. The live probe itself is exercised by running
 * `node scripts/gateway-method-audit.mjs` against a real spawned gateway.
 */

import { describe, expect, it } from 'vitest';
import {
    extractMethodNames,
    classifyResponse,
    annotateFamilyLiveness,
    CYCLE3_FAMILY_PREFIXES
} from './gateway-method-audit.mjs';

describe('extractMethodNames', () => {
    it('collects cycle-3 method tokens from plan prose and code fences', () => {
        const text = `
The tranche lands \`s5'.gnostic.query\` and "s1'.base.ensure" plus
\`m4.arena.session.open\` — while chat.send already exists. Also
\`s2.graph.promotion.dry_run\` and \`contemplate_begin\` route via
\`s3.world_clock.subscribe\`. Not a method: file.md, 4.5, e.g.
`;
        const names = extractMethodNames(text);
        expect(names).toContain("s5'.gnostic.query");
        expect(names).toContain("s1'.base.ensure");
        expect(names).toContain('m4.arena.session.open');
        expect(names).toContain('s2.graph.promotion.dry_run');
        expect(names).toContain('contemplate_begin');
        expect(names).toContain('s3.world_clock.subscribe');
        expect(names).toContain('chat.send');
        expect(names).not.toContain('file.md');
        expect(names).not.toContain('4.5');
    });

    it('normalizes quoted method names without emitting quote artifacts', () => {
        const names = extractMethodNames(`
Single quoted: 'nara.kairos.probe_kerykeion'.
Call expression: SharedBridgeAdapter.invokeGatewayRpc('nara.lens.apply').
Double quoted: "nara.oracle.cast".
`);

        expect(names).toContain('nara.kairos.probe_kerykeion');
        expect(names).toContain('nara.lens.apply');
        expect(names).toContain('nara.oracle.cast');
        expect(names.every(name => !name.startsWith("'") && !name.endsWith("'"))).toBe(true);
    });

    it('preserves parameterized kernel-bridge RPC names for the live ratchet', () => {
        const names = extractMethodNames(`
The M3 bridge exposes \`kernelBridge.m3.lensCodonBinary(lensId)\`.
`);

        expect(names).toContain('kernelBridge.m3.lensCodonBinary(lensId)');
    });

    it('covers every family the tranche names', () => {
        for (const prefix of [
            "s5'.gnostic.",
            "s1'.entity.",
            "s5'.tune.",
            "s5'.canon_update.",
            'm4.arena.',
            's2.graph.',
            "s0'.verifier.",
            "s0'.settings.",
            "s4'.mediation.",
            's3.world_clock.',
            's2.codon.',
            'kernelBridge.m3.',
            'contemplate_',
            'sessions.',
            'cron.',
        ]) {
            expect(
                CYCLE3_FAMILY_PREFIXES.some(p => prefix.startsWith(p) || p.startsWith(prefix)),
                `family ${prefix} must be scannable`
            ).toBe(true);
        }
    });
});

describe('classifyResponse', () => {
    it('classifies an unknown-method error as not existing', () => {
        const row = classifyResponse({ type: 'res', id: 3, error: { message: 'unknown method: s5\'.tune.get' } });
        expect(row.exists).toBe(false);
        expect(row.responds).toBe(true);
        expect(row.errorClass).toMatch(/unknown-method/);
    });

    it("classifies the live gateway's unimplemented shape as not existing", () => {
        const row = classifyResponse({
            type: 'res',
            id: 7,
            error: { code: 'unimplemented', message: "s5'.tune.get is not implemented yet" }
        });
        expect(row.exists).toBe(false);
        expect(row.responds).toBe(true);
        expect(row.errorClass).toBe('unimplemented');
    });

    it('classifies a successful result as existing and responding', () => {
        const row = classifyResponse({ type: 'res', id: 4, result: { ok: true } });
        expect(row).toEqual({ exists: true, responds: true, errorClass: null });
    });

    it('classifies a domain error as existing (the handler answered)', () => {
        const row = classifyResponse({ type: 'res', id: 5, error: { message: 'invalid params: sessionKey required' } });
        expect(row.exists).toBe(true);
        expect(row.responds).toBe(true);
        expect(row.errorClass).toMatch(/invalid|domain/);
    });

    it('classifies a timeout as unknown existence', () => {
        const row = classifyResponse(null);
        expect(row.exists).toBe(null);
        expect(row.responds).toBe(false);
        expect(row.errorClass).toBe('timeout');
    });
});

describe('annotateFamilyLiveness', () => {
    // The real misreading this closes: `nara.session.psyche_anchor` is plan
    // prose, the gateway prefix-routes `nara.*`, and the unknown member comes
    // back `unimplemented` — identical on the page to a family nothing serves.
    const rows = [
        { method: 'nara.session_close.contemplation.read', exists: true },
        { method: 'nara.oracle.cast', exists: true },
        { method: 'nara.session.psyche_anchor', exists: false },
        { method: 'wibble.nothing.here', exists: false },
        { method: 'some.timeout', exists: null }
    ];

    it('tells an absent name in a LIVE family apart from a genuinely dark one', () => {
        const annotated = annotateFamilyLiveness(rows);
        const prose = annotated.find(r => r.method === 'nara.session.psyche_anchor');
        const dark = annotated.find(r => r.method === 'wibble.nothing.here');

        expect(prose.familyServed).toBe(2);
        expect(prose.hint).toMatch(/family is LIVE/);
        expect(prose.servedSiblings).toContain('nara.session_close.contemplation.read');

        // a dark family gets NO hint — that is the row that deserves attention
        expect(dark.familyServed).toBe(0);
        expect(dark.hint).toBeUndefined();
        expect(dark.servedSiblings).toBeUndefined();
    });

    it('leaves present and timed-out rows untouched', () => {
        const annotated = annotateFamilyLiveness(rows);
        expect(annotated.find(r => r.method === 'nara.oracle.cast')).toEqual({
            method: 'nara.oracle.cast',
            exists: true
        });
        expect(annotated.find(r => r.method === 'some.timeout')).toEqual({
            method: 'some.timeout',
            exists: null
        });
    });

    it('strips an argument list before deriving the family', () => {
        const annotated = annotateFamilyLiveness([
            { method: 's2.graph.node', exists: true },
            { method: 's2.graph.node(coord)', exists: false }
        ]);
        // the parenthesised form is prose for a method that IS served
        expect(annotated[1].familyServed).toBe(1);
        expect(annotated[1].servedSiblings).toEqual(['s2.graph.node']);
    });
});
