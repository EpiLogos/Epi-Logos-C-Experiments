/**
 * Coordinate: M' M5-5' (Atelier command tests — Track 16.T16.19 + 26.T26.3)
 * Actualises: the scent-following ACTIVATION as behaviour — six stages
 *   (root → cognate → drift → psychoid → pros-hen → Möbius write-back) each
 *   riding the REAL landed substrate, NEVER an `aletheia_*` gateway method
 *   (Aletheia is emergent via Anima dispatch, not routed). Root rides
 *   `s5'.gnostic.etymology`, drift rides `s5'.gnostic.query_with_layers`
 *   (6.1 landed); pros-hen is a LOCAL synthesis stage that invokes nothing
 *   (fabricates nothing); Möbius write-back stages a Hen candidate. Every
 *   command disables without an open file / live gateway.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
    ALETHEIA_LINEAGE,
    atelierCommands,
    ATELIER_MUTATES_GRAPH_CANON,
    etymologyProvenanceHandle,
    SCENT_FOLLOWING_STAGES
} from './atelier';

function deps(overrides: Partial<Parameters<typeof atelierCommands>[0]> = {}) {
    const invoke = vi.fn().mockResolvedValue({ ok: true });
    return {
        deps: {
            activeMarkdownPath: () => 'Idea/Empty/Present/11-07-2026/notes/Idea Sketch.md',
            activeCoordinate: () => 'M5-5',
            dayId: () => '11-07-2026',
            invoke,
            ready: () => true,
            ...overrides
        },
        invoke
    };
}

describe('Atelier scent-following commands (16.T16.19 + 26.T26.3)', () => {
    it('binds the six canonical scent-following command ids in sequence', () => {
        const { deps: d } = deps();
        expect(atelierCommands(d).map(command => command.id)).toEqual([
            'atelier.etymologyRoot',
            'atelier.cognateSearch',
            'atelier.semanticDrift',
            'atelier.psychoidTrace',
            'atelier.prosHen',
            'atelier.scentFollow'
        ]);
    });

    it('models the six scent-following stages and rides NO aletheia_* gateway method', () => {
        expect(SCENT_FOLLOWING_STAGES.map(stage => stage.id)).toEqual([
            'root',
            'cognate',
            'drift',
            'psychoid',
            'pros-hen',
            'mobius-write-back'
        ]);
        // Aletheia is emergent (Anima dispatch) — no stage may claim an aletheia_*
        // gateway method; the honest wiring rides gnostic / s1' / s0'.
        for (const stage of SCENT_FOLLOWING_STAGES) {
            expect(stage.gatewayMethod ?? '').not.toContain('aletheia_');
        }
        expect(SCENT_FOLLOWING_STAGES.find(s => s.id === 'root')?.gatewayMethod).toBe(
            "s5'.gnostic.etymology"
        );
        expect(SCENT_FOLLOWING_STAGES.find(s => s.id === 'drift')?.gatewayMethod).toBe(
            "s5'.gnostic.query_with_layers"
        );
        // pros-hen is a LOCAL synthesis stage — no substrate method.
        expect(SCENT_FOLLOWING_STAGES.find(s => s.id === 'pros-hen')?.gatewayMethod).toBeNull();
    });

    it('root traces the active coordinate through the landed gnostic etymology', async () => {
        const { deps: d, invoke } = deps();
        await atelierCommands(d).find(c => c.id === 'atelier.etymologyRoot')!.run();
        expect(invoke).toHaveBeenCalledTimes(1);
        expect(invoke.mock.calls[0]).toEqual(["s5'.gnostic.etymology", { coord: 'M5-5' }]);
    });

    it('drift rides the layered gnostic retrieval; cognate keeps its landed route', async () => {
        const { deps: d, invoke } = deps();
        const byId = new Map(atelierCommands(d).map(c => [c.id, c]));
        await byId.get('atelier.semanticDrift')!.run();
        await byId.get('atelier.cognateSearch')!.run();
        expect(invoke.mock.calls.map(([method]) => method)).toEqual([
            "s5'.gnostic.query_with_layers",
            "s1'.semantic.suggest_links"
        ]);
    });

    it('28.T28.7 (b): the psychoid stage is DISABLED and invokes nothing', async () => {
        // `s0'.anuttara.trace` is contract-declared and advertised on the wire
        // but has no dispatch arm in any S-layer table (see
        // panes/atelier/atelierSeams.ts and its substrate-held sibling suite).
        // Firing it would render a gateway error as though the stage had run.
        const { deps: d, invoke } = deps();
        const psychoid = atelierCommands(d).find(c => c.id === 'atelier.psychoidTrace')!;
        expect(psychoid.enabled?.()).toBe(false);
        await psychoid.run();
        expect(invoke).not.toHaveBeenCalled();
    });

    it('pros-hen is a LOCAL synthesis stage — it invokes nothing, fabricating nothing', async () => {
        const { deps: d, invoke } = deps();
        const prosHen = atelierCommands(d).find(c => c.id === 'atelier.prosHen')!;
        expect(prosHen.enabled?.()).toBe(true);
        await prosHen.run();
        expect(invoke).not.toHaveBeenCalled();
    });

    it('scent-follow stages the open note as a Hen candidate — capture, never canon-write', async () => {
        const { deps: d, invoke } = deps();
        await atelierCommands(d).find(c => c.id === 'atelier.scentFollow')!.run();
        expect(invoke).toHaveBeenCalledTimes(1);
        const [method, params] = invoke.mock.calls[0];
        expect(method).toBe("s1'.entity.capture");
        expect(params).toEqual({
            source: 'Idea/Empty/Present/11-07-2026/notes/Idea Sketch.md',
            dayId: '11-07-2026'
        });
        expect(method).not.toContain('vault.write');
        expect(method).not.toContain('promotion.commit');
    });

    it('28.T28.7 (d): the Möbius stage routes the staged candidate to Canon Studio', async () => {
        const dispatchIntent = vi.fn();
        const { deps: d, invoke } = deps({ dispatchIntent });
        invoke.mockResolvedValue({
            artifact: { candidatePath: 'Idea/Empty/Present/11-07-2026/entities/Idea Sketch.md' }
        });
        await atelierCommands(d).find(c => c.id === 'atelier.scentFollow')!.run();
        // capture FIRST, then the governed route — never the other way round.
        expect(invoke.mock.calls[0][0]).toBe("s1'.entity.capture");
        expect(dispatchIntent).toHaveBeenCalledTimes(1);
        const intent = dispatchIntent.mock.calls[0][0];
        expect(intent.requestedExtensionId).toBe('ide-shell-m0-m5');
        expect(intent.requestedContributionId).toBe('canon-studio');
        // the envelope carries the CANDIDATE Hen just wrote, not the source note
        expect(intent.artifactUri).toBe('Idea/Empty/Present/11-07-2026/entities/Idea Sketch.md');
        expect(intent.coordinate).toBe('M5-5');
        expect(intent.dayNow).toBe('11-07-2026');
        expect(ATELIER_MUTATES_GRAPH_CANON).toBe(false);
    });

    it('the Möbius route falls back to the source note when the receipt names no candidate', async () => {
        const dispatchIntent = vi.fn();
        const { deps: d, invoke } = deps({ dispatchIntent });
        invoke.mockResolvedValue({ artifact: {} });
        await atelierCommands(d).find(c => c.id === 'atelier.scentFollow')!.run();
        expect(dispatchIntent.mock.calls[0][0].artifactUri).toBe(
            'Idea/Empty/Present/11-07-2026/notes/Idea Sketch.md'
        );
    });

    it('an unwired shell still captures — the write-back degrades, it does not throw', async () => {
        const { deps: d, invoke } = deps();
        await atelierCommands(d).find(c => c.id === 'atelier.scentFollow')!.run();
        expect(invoke).toHaveBeenCalledTimes(1);
    });

    it('App.tsx really wires the write-back transport (an optional dep left unwired is a dead route)', () => {
        const app = readFileSync(resolve(__dirname, '../App.tsx'), 'utf8');
        expect(app).toContain('dispatchIntent: intent => commands.execute(CROSS_LAYOUT_INTENT_COMMAND, intent)');
    });

    it('surfaces the six Aletheia subagents as evidence lineage, never as invocable actors', () => {
        expect(ALETHEIA_LINEAGE.map(entry => entry.subagent)).toEqual([
            'Anansi',
            'Janus',
            'Moirai',
            'Mercurius',
            'Agora',
            'Zeithoven'
        ]);
    });

    it('builds etymology:// provenance handles for the scent-trail', () => {
        expect(etymologyProvenanceHandle('root', 'M5-5')).toBe('etymology://root/M5-5');
    });

    it('file-bound bindings disable without an open file; the whole set disables when offline', async () => {
        // etymology-root is coordinate-bound (tested below); the other five ride the open file.
        const fileBound = new Set([
            'atelier.cognateSearch',
            'atelier.semanticDrift',
            'atelier.psychoidTrace',
            'atelier.prosHen',
            'atelier.scentFollow'
        ]);
        const { deps: closed } = deps({ activeMarkdownPath: () => null });
        for (const command of atelierCommands(closed)) {
            if (fileBound.has(command.id)) {
                expect(command.enabled?.()).toBe(false);
            }
        }
        // Offline (no live gateway) disables every stage — each checks ready().
        const { deps: offline } = deps({ ready: () => false });
        for (const command of atelierCommands(offline)) {
            expect(command.enabled?.()).toBe(false);
        }
        // Running a file-bound command without a file is a no-op, not a crash.
        const { deps: d, invoke } = deps({ activeMarkdownPath: () => null });
        await atelierCommands(d).find(c => c.id === 'atelier.scentFollow')!.run();
        expect(invoke).not.toHaveBeenCalled();
    });

    it('the root stage stays disabled until a coordinate is wired (no invented coordinate)', () => {
        const { deps: noCoord } = deps({ activeCoordinate: () => null });
        const root = atelierCommands(noCoord).find(c => c.id === 'atelier.etymologyRoot')!;
        expect(root.enabled?.()).toBe(false);
        // A dep without activeCoordinate at all (App.tsx wiring deferred) also disables it.
        const { deps: unwired } = deps({ activeCoordinate: undefined });
        expect(atelierCommands(unwired).find(c => c.id === 'atelier.etymologyRoot')!.enabled?.()).toBe(
            false
        );
    });
});
