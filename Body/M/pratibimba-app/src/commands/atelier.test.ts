/**
 * Coordinate: M' M5-5' (Atelier command tests — Track 16.T16.19)
 * Actualises: the CCT-19 activation contract as behavior — scent-follow
 *   stages a Hen-promotion CANDIDATE (s1'.entity.capture, never a canon
 *   write), the three bindings carry the canonical ids, and every command
 *   disables without an open file / live gateway. No workspace opens; the
 *   commands operate on the file the user is already in.
 */

import { describe, expect, it, vi } from 'vitest';
import { atelierCommands } from './atelier';

function deps(overrides: Partial<Parameters<typeof atelierCommands>[0]> = {}) {
    const invoke = vi.fn().mockResolvedValue({ ok: true });
    return {
        deps: {
            activeMarkdownPath: () => 'Idea/Empty/Present/11-07-2026/notes/Idea Sketch.md',
            dayId: () => '11-07-2026',
            invoke,
            ready: () => true,
            ...overrides
        },
        invoke
    };
}

describe('Atelier scent-following commands (CCT-19 activation)', () => {
    it('binds exactly the three canonical command ids', () => {
        const { deps: d } = deps();
        expect(atelierCommands(d).map(command => command.id)).toEqual([
            'atelier.scentFollow',
            'atelier.cognateSearch',
            'atelier.psychoidTrace'
        ]);
    });

    it('scent-follow stages the open note as a Hen candidate — capture, never canon-write', async () => {
        const { deps: d, invoke } = deps();
        const scentFollow = atelierCommands(d).find(c => c.id === 'atelier.scentFollow')!;
        await scentFollow.run();
        expect(invoke).toHaveBeenCalledTimes(1);
        const [method, params] = invoke.mock.calls[0];
        expect(method).toBe("s1'.entity.capture");
        expect(params).toEqual({
            source: 'Idea/Empty/Present/11-07-2026/notes/Idea Sketch.md',
            dayId: '11-07-2026'
        });
        // The staging path is the CCT-14 candidate lifecycle — no vault
        // write method, no graph promotion commit, from this command.
        expect(method).not.toContain('vault.write');
        expect(method).not.toContain('promotion.commit');
    });

    it('cognate-search and psychoid-trace ride their landed routes on the open file', async () => {
        const { deps: d, invoke } = deps();
        const byId = new Map(atelierCommands(d).map(c => [c.id, c]));
        await byId.get('atelier.cognateSearch')!.run();
        await byId.get('atelier.psychoidTrace')!.run();
        expect(invoke.mock.calls.map(([method]) => method)).toEqual([
            "s1'.semantic.suggest_links",
            "s0'.anuttara.trace"
        ]);
        expect(invoke.mock.calls[1][1]).toMatchObject({ sensitivity: 'public' });
    });

    it('every binding disables without an open markdown file or a live gateway', async () => {
        const { deps: closed } = deps({ activeMarkdownPath: () => null });
        for (const command of atelierCommands(closed)) {
            expect(command.enabled?.()).toBe(false);
        }
        const { deps: offline } = deps({ ready: () => false });
        for (const command of atelierCommands(offline)) {
            expect(command.enabled?.()).toBe(false);
        }
        // Running without an active file is a no-op, not a crash.
        const { deps: d, invoke } = deps({ activeMarkdownPath: () => null });
        await atelierCommands(d).find(c => c.id === 'atelier.scentFollow')!.run();
        expect(invoke).not.toHaveBeenCalled();
    });
});
