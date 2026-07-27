/**
 * Coordinate: M' M4' (session-close ceremony projection law — 25.T25.19)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the three laws the ceremony rests on — the Arch 3/5/7/9 seeds are
 *   READ from the live prompt LUT (never a carrier copy), the persisted
 *   contemplation projection is parsed deny-unknown (a payload that grew a field
 *   is a changed privacy boundary and must block, not render), and the
 *   quintessence hash is truncated to a handle BEFORE it can reach a renderer.
 * Does NOT own: the close bundle parse (m1SessionCloseReader) or the pane.
 */

import { describe, expect, it } from 'vitest';
import type { KernelBridgeCachedProfile } from '../bridge/types';
import {
    contemplationSeedsFromProfile,
    M4_CONTEMPLATION_SEED_REGISTERS,
    QUINTESSENCE_HANDLE_LENGTH,
    readNaraContemplationObject,
    readQuintessenceHandle
} from './m4SessionCloseCeremony';

function profileWithLut(lut: unknown): KernelBridgeCachedProfile {
    return {
        profile: { harmonicProfile: { tick12: 3, contemplationPromptLut: lut } }
    } as unknown as KernelBridgeCachedProfile;
}

function contemplationProjection(overrides: Record<string, unknown> = {}) {
    return {
        session_id: 'e2e-session',
        close_ref: 'close-1234',
        contemplation_ref: 'contemplation-abcd',
        triplet: {
            llm: {
                position: "4'",
                loaded_agent_count: 4,
                psyche_anchor_coherent: true,
                matched_anchor_codon_count: 1
            },
            ebm: {
                position: "5'",
                gradient_magnitude: 0.25,
                gauge_trio_coherent: true,
                coherence_scores: { square_0_5: 1, square_1_4: 0.97, square_2_3: 0.94 }
            },
            verifier: {
                position: "0'",
                virtue_witness_vector: [true, true, false, true, false, true, true, false, true],
                coherence_score: 0.82,
                arch9_wholeness: true,
                syntax_layers_witnessed: false
            }
        },
        provenance: {
            privacy_class: 'protected_local',
            source_method: 'nara.session_close',
            persisted_at: '2026-07-27T10:00:00Z',
            persisted_at_ms: 1_785_000_000_000,
            pasu_scoped: true
        },
        ...overrides
    };
}

describe('25.T25.19 — the four Arch seeds', () => {
    it('names the 19.9 registers at their Arch positions', () => {
        expect(M4_CONTEMPLATION_SEED_REGISTERS.map(seed => [seed.archetype, seed.register])).toEqual([
            [3, 'speech'],
            [5, 'relationship'],
            [7, 'action'],
            [9, 'completion']
        ]);
    });

    it('reads each seed out of the live 12-slot LUT at its own position', () => {
        const lut = Array.from({ length: 12 }, (_, index) => `prompt ${index}`);
        const seeds = contemplationSeedsFromProfile(profileWithLut(lut));
        expect(seeds.map(seed => seed.prompt)).toEqual([
            'prompt 3',
            'prompt 5',
            'prompt 7',
            'prompt 9'
        ]);
        expect(seeds.every(seed => seed.state === 'canonical')).toBe(true);
    });

    it('distinguishes an empty slot from an absent LUT', () => {
        const holed = Array.from({ length: 12 }, (_, index) => (index === 7 ? '' : `prompt ${index}`));
        const seeds = contemplationSeedsFromProfile(profileWithLut(holed));
        expect(seeds.find(seed => seed.archetype === 7)?.state).toBe('canonical_absent');
        expect(seeds.find(seed => seed.archetype === 3)?.state).toBe('canonical');

        const noLut = contemplationSeedsFromProfile(profileWithLut(undefined));
        expect(noLut.every(seed => seed.state === 'blocked')).toBe(true);
        expect(contemplationSeedsFromProfile(null).every(seed => seed.state === 'blocked')).toBe(true);
    });
});

describe('25.T25.19 — the persisted contemplation projection', () => {
    it('reads the 4′-5′-0′ triplet with its witness vector', () => {
        const read = readNaraContemplationObject(contemplationProjection());
        expect(read.state).toBe('ready');
        if (read.state !== 'ready') return;
        expect(read.contemplationRef).toBe('contemplation-abcd');
        expect(read.llm.position).toBe("4'");
        expect(read.ebm.coherenceSquares.map(square => square.label)).toEqual([
            'square_0_5',
            'square_1_4',
            'square_2_3'
        ]);
        expect(read.verifier.witnessBits).toEqual([
            true,
            true,
            false,
            true,
            false,
            true,
            true,
            false,
            true
        ]);
        expect(read.verifier.witnessCount).toBe(6);
    });

    it('BLOCKS a payload that grew a field — a wider payload is a wider privacy boundary', () => {
        const grown = readNaraContemplationObject(
            contemplationProjection({ wisdom_delta: '4′-5′-0′ contemplation closed for q_Nara…' })
        );
        expect(grown.state).toBe('blocked');
        if (grown.state !== 'blocked') return;
        expect(grown.reason).toContain('wisdom_delta');
    });

    it('BLOCKS a session body that tried to ride along', () => {
        const withBody = contemplationProjection();
        (withBody.triplet as Record<string, unknown>).llm = {
            ...contemplationProjection().triplet.llm,
            loaded_agents: ['Nous']
        };
        const read = readNaraContemplationObject(withBody);
        expect(read.state).toBe('blocked');
        if (read.state !== 'blocked') return;
        expect(read.reason).toContain('forbidden');
    });

    it('refuses a witness vector that is not nine booleans', () => {
        const short = contemplationProjection();
        (short.triplet.verifier as Record<string, unknown>).virtue_witness_vector = [true, false];
        expect(readNaraContemplationObject(short).state).toBe('blocked');
    });

    it('refuses coherence outside 0..1 and a non-opaque close reference', () => {
        const wild = contemplationProjection();
        (wild.triplet.verifier as Record<string, unknown>).coherence_score = 1.4;
        expect(readNaraContemplationObject(wild).state).toBe('blocked');
        expect(readNaraContemplationObject(contemplationProjection({ close_ref: 'nope' })).state).toBe(
            'blocked'
        );
    });
});

describe('25.T25.19 — the quintessence handle', () => {
    it('truncates to a handle in the projection, never in the renderer', () => {
        const read = readQuintessenceHandle({
            c_5_quintessence_hash: '0123456789abcdef0123456789abcdef',
            c_5_quintessence_clock: '187.5'
        });
        expect(read.state).toBe('ready');
        if (read.state !== 'ready') return;
        expect(read.handle).toBe('01234567');
        expect(read.handle).toHaveLength(QUINTESSENCE_HANDLE_LENGTH);
        expect(read.clock).toBe('187.5');
    });

    it('reports absence rather than an empty handle', () => {
        expect(readQuintessenceHandle({ c_5_quintessence_hash: '' }).state).toBe('absent');
        expect(readQuintessenceHandle(null).state).toBe('absent');
    });
});
