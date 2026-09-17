/**
 * 51.T51.1 — the ACR's context-pack projection must fail closed.
 *
 * The tranche exists because the ta-onta spine injection was invisible, and had
 * silently been discarded for an unknown period. A surface that renders a
 * plausible-looking pack when the envelope is wrong would recreate exactly that
 * failure mode one layer up, so every parse defect below is an exception, not a
 * degraded render.
 */

import { describe, expect, it } from 'vitest';
import {
    contextPackTotals,
    loadContextPackSnapshot,
    parseContextPackEnvelope,
    S4_CONTEXT_ASSEMBLE_METHOD
} from './contextPack';

const RENDERED_S0 = "### [[S0/S0']]\n\n**s_0_day_id:** 25-07-2026";
const RENDERED_S1 = "### [[S1/S1']]\n\nvault index";
const INJECTION = `${RENDERED_S0}\n\n---\n\n${RENDERED_S1}`;

function block(overrides: Record<string, unknown> = {}) {
    return {
        coordinate: "S0/S0'",
        cost: 'hot',
        status: 'included',
        bytes: RENDERED_S0.length,
        charEstimate: RENDERED_S0.length,
        producedAtMs: 1_785_000_000_001,
        rendered: RENDERED_S0,
        vakToken: null,
        error: null,
        ...overrides
    };
}

function envelope(overrides: Record<string, unknown> = {}) {
    return {
        owner: "S4'",
        sessionKey: 'agent:anima:main',
        present: true,
        assembler: 'Body/S/S4/ta-onta/spine/compositor.ts::SpineCompositor.assembleContextPack',
        packPath: '/tmp/gate/s4/context-pack/agent_anima_main.json',
        pack: {
            version: 1,
            sessionKey: 'agent:anima:main',
            assembledAtMs: 1_785_000_000_000,
            budget: { limitChars: 18_000, usedChars: 64 },
            blocks: [
                block(),
                block({
                    coordinate: "S1/S1'",
                    cost: 'warm',
                    bytes: RENDERED_S1.length,
                    charEstimate: RENDERED_S1.length,
                    producedAtMs: 1_785_000_000_002,
                    rendered: RENDERED_S1
                })
            ],
            injection: INJECTION
        },
        ...overrides
    };
}

describe('parseContextPackEnvelope', () => {
    it('projects the served pack with its per-carrier provenance', () => {
        const snapshot = parseContextPackEnvelope(envelope());

        expect(snapshot.present).toBe(true);
        expect(snapshot.sessionKey).toBe('agent:anima:main');
        expect(snapshot.pack?.injection).toBe(INJECTION);
        expect(snapshot.pack?.blocks.map(b => b.coordinate)).toEqual(["S0/S0'", "S1/S1'"]);
        expect(snapshot.pack?.blocks[1].cost).toBe('warm');
    });

    it('carries absence as an answer rather than an empty pack', () => {
        const snapshot = parseContextPackEnvelope(
            envelope({
                present: false,
                reason: 'no context pack has been published for this session',
                pack: null
            })
        );

        expect(snapshot.present).toBe(false);
        expect(snapshot.pack).toBeNull();
        expect(snapshot.reason).toMatch(/no context pack/);
    });

    it('rejects an included block whose rendered text is absent from the injection', () => {
        const drifted = envelope();
        drifted.pack.blocks[0] = block({ rendered: "### [[S0/S0']]\n\nstale content" });

        // This is the drift alarm: a re-assembled pack would not contain the
        // blocks the published injection was built from.
        expect(() => parseContextPackEnvelope(drifted)).toThrow(/absent from the injection/);
    });

    it('rejects an included block with no rendered text', () => {
        const broken = envelope();
        broken.pack.blocks[0] = block({ rendered: null });
        expect(() => parseContextPackEnvelope(broken)).toThrow(/no rendered text/);
    });

    it('rejects a failed block that names no error', () => {
        const broken = envelope();
        broken.pack.blocks[0] = block({
            status: 'failed',
            rendered: null,
            error: null,
            bytes: 0,
            charEstimate: 0
        });
        expect(() => parseContextPackEnvelope(broken)).toThrow(/names no error/);
    });

    it('rejects an unknown block status rather than rendering it', () => {
        const broken = envelope();
        broken.pack.blocks[0] = block({ status: 'probably-fine' });
        expect(() => parseContextPackEnvelope(broken)).toThrow(/status must be one of/);
    });

    it('rejects an envelope owned by anything but S4', () => {
        expect(() => parseContextPackEnvelope(envelope({ owner: 'S0' }))).toThrow(/owned by S4/);
    });

    it('rejects a pack with a non-string injection', () => {
        const broken = envelope();
        (broken.pack as Record<string, unknown>).injection = null;
        expect(() => parseContextPackEnvelope(broken)).toThrow(/injection must be a string/);
    });
});

describe('contextPackTotals', () => {
    it('counts carriers by outcome and measures the injected bytes', () => {
        const snapshot = parseContextPackEnvelope(
            (() => {
                const e = envelope();
                e.pack.blocks = [
                    block(),
                    block({
                        coordinate: "S2/S3",
                        status: 'failed',
                        rendered: null,
                        error: 'matrix unreadable',
                        bytes: 0,
                        charEstimate: 0
                    }),
                    block({
                        coordinate: "S5/S5'",
                        status: 'overflowed',
                        rendered: null,
                        vakToken: "<vak: s5'.gnostic.resolve(S5')>"
                    })
                ];
                e.pack.injection = RENDERED_S0;
                return e;
            })()
        );

        const totals = contextPackTotals(snapshot.pack!);
        expect(totals).toEqual({
            carriers: 3,
            included: 1,
            overflowed: 1,
            failed: 1,
            injectedBytes: new TextEncoder().encode(RENDERED_S0).length
        });
    });
});

describe('loadContextPackSnapshot', () => {
    it('invokes the one live context-pack authority and strict-parses its artifact', async () => {
        const calls: { method: string; params: Record<string, unknown> }[] = [];
        const snapshot = await loadContextPackSnapshot({
            invoke: async (method: string, params: Record<string, unknown>) => {
                calls.push({ method, params });
                return { artifact: envelope() } as never;
            }
        });

        expect(calls).toEqual([{ method: S4_CONTEXT_ASSEMBLE_METHOD, params: {} }]);
        expect(snapshot.pack?.injection).toBe(INJECTION);
    });

    it('passes a session key through when one is requested', async () => {
        const calls: { method: string; params: Record<string, unknown> }[] = [];
        await loadContextPackSnapshot(
            {
                invoke: async (method: string, params: Record<string, unknown>) => {
                    calls.push({ method, params });
                    return { artifact: envelope() } as never;
                }
            },
            'agent:epii:main'
        );

        expect(calls[0].params).toEqual({ sessionKey: 'agent:epii:main' });
    });

    it('propagates a malformed artifact rather than yielding an empty context', async () => {
        await expect(
            loadContextPackSnapshot({
                invoke: async () => ({ artifact: { owner: "S4'" } }) as never
            })
        ).rejects.toThrow(/present must be a boolean/);
    });
});
