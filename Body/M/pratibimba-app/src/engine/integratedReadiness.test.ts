/**
 * 07.T7.1 — Wave-A readiness gate tests. The contract fixtures mirror the
 * frozen wave-a-markers.ts LAW (marker names, blocker-id namespace, pinned
 * blocked state) and the kernel-bridge readiness ledger's real wire paths.
 */
import { describe, expect, it } from 'vitest';
import type { MathemeHarmonicProfileBoundary } from '../bridge/types';
import {
    evaluateIntegratedReadiness,
    integratedReadinessBlockedBy,
    WAVE_A_BLOCKER_ID_PREFIX,
    WAVE_A_PENDING_MARKERS,
    waveABlockerId
} from './integratedReadiness';

function profileWith(payload: Record<string, unknown>): MathemeHarmonicProfileBoundary {
    return { generation: 7, pointerAnchor: null, capabilities: [], payload };
}

describe('Wave-A marker table (LAW)', () => {
    it('declares exactly the five canonical markers in cosmic-spine order', () => {
        expect(WAVE_A_PENDING_MARKERS.map(m => m.marker)).toEqual([
            'klein_flip',
            'resonance72',
            'six-axes-of-72 decoding',
            'audio_octet[8]',
            'nodal_quartet[4]'
        ]);
    });

    it('builds stable greppable blocker ids under the wave-a.pending namespace', () => {
        expect(WAVE_A_BLOCKER_ID_PREFIX).toBe('wave-a.pending');
        expect(WAVE_A_PENDING_MARKERS.map(waveABlockerId)).toEqual([
            'wave-a.pending:klein_flip',
            'wave-a.pending:resonance72',
            'wave-a.pending:six-axes-of-72 decoding',
            'wave-a.pending:audio_octet[8]',
            'wave-a.pending:nodal_quartet[4]'
        ]);
    });

    it('marks only the M1\'-performance-event pockets as conditional', () => {
        const conditional = WAVE_A_PENDING_MARKERS.filter(m => m.conditional).map(m => m.marker);
        expect(conditional).toEqual(['audio_octet[8]', 'nodal_quartet[4]']);
    });

    it('declares the six-axes decode as a derivation with no pocket', () => {
        const sixAxes = WAVE_A_PENDING_MARKERS.find(m => m.marker === 'six-axes-of-72 decoding');
        expect(sixAxes?.profilePaths).toBeNull();
    });

    it('pins the blocked-state to profile_missing_field', () => {
        const blocked = integratedReadinessBlockedBy([WAVE_A_PENDING_MARKERS[0]]);
        expect(blocked.state).toBe('profile_missing_field');
        expect(blocked.blockerIds).toEqual(['wave-a.pending:klein_flip']);
    });
});

describe('evaluateIntegratedReadiness', () => {
    it('blocks on the unconditional markers when no profile exists at all', () => {
        const result = evaluateIntegratedReadiness(null);
        expect(result.state).toBe('profile_missing_field');
        expect(result.blockerIds).toEqual([
            'wave-a.pending:klein_flip',
            'wave-a.pending:resonance72'
        ]);
        // conditional markers are pending, not blocking, before the event is seen
        expect(result.conditionalPending.map(m => m.marker)).toEqual([
            'audio_octet[8]',
            'nodal_quartet[4]'
        ]);
    });

    it('is ready when the unconditional pockets are present under harmonicProfile', () => {
        const result = evaluateIntegratedReadiness(profileWith({
            harmonicProfile: {
                kleinFlip: { m1TritoneCrossing: { tick12: 6 } },
                resonance72Index: 41
            }
        }));
        expect(result.state).toBe('ready');
        expect(result.blockerIds).toEqual([]);
    });

    it('finds pockets at the payload root too (two-level resolution)', () => {
        const result = evaluateIntegratedReadiness(profileWith({
            klein_flip: { m2CymaticValenceInvert: {} },
            resonance72: { index: 3 }
        }));
        expect(result.state).toBe('ready');
    });

    it('finds klein_flip via the nested anandaVortex.kleinFlipAtThisTick pocket', () => {
        const result = evaluateIntegratedReadiness(profileWith({
            harmonicProfile: {
                anandaVortex: { kleinFlipAtThisTick: false },
                depositionAnchor: { resonance72Index: 12 }
            }
        }));
        expect(result.state).toBe('ready');
    });

    it('never reports the six-axes derivation as a missing-field blocker', () => {
        const result = evaluateIntegratedReadiness(null);
        expect(result.blockerIds).not.toContain('wave-a.pending:six-axes-of-72 decoding');
    });

    it('blocks conditional markers once the performance event is seen without its pockets', () => {
        const result = evaluateIntegratedReadiness(
            profileWith({ harmonicProfile: { kleinFlip: true, resonance72Index: 0 } }),
            { performanceEvent: { harmonic: {} } }
        );
        expect(result.state).toBe('profile_missing_field');
        expect(result.blockerIds).toEqual([
            'wave-a.pending:audio_octet[8]',
            'wave-a.pending:nodal_quartet[4]'
        ]);
        expect(result.conditionalPending).toEqual([]);
    });

    it('is ready when the performance event carries harmonic.audioOctet + nodalQuartet', () => {
        const result = evaluateIntegratedReadiness(
            profileWith({ harmonicProfile: { kleinFlip: true, resonance72Index: 0 } }),
            {
                performanceEvent: {
                    harmonic: {
                        audioOctet: [1, 2, 3, 4, 5, 6, 7, 8],
                        nodalQuartet: [{ qlPosition: 1, helix: 'a', m: 1, n: 2 }]
                    }
                }
            }
        );
        expect(result.state).toBe('ready');
    });

    it('treats an empty octet array as an absent pocket (no faked replay bus)', () => {
        const result = evaluateIntegratedReadiness(
            profileWith({ harmonicProfile: { kleinFlip: true, resonance72Index: 0 } }),
            { performanceEvent: { harmonic: { audioOctet: [], nodalQuartet: [] } } }
        );
        expect(result.state).toBe('profile_missing_field');
        expect(result.blockerIds).toContain('wave-a.pending:audio_octet[8]');
        expect(result.blockerIds).toContain('wave-a.pending:nodal_quartet[4]');
    });

    it('accepts profile-level audioOctet pockets even before the event is seen', () => {
        const result = evaluateIntegratedReadiness(profileWith({
            harmonicProfile: {
                kleinFlip: true,
                resonance72Index: 9,
                audioOctet: [220, 247, 262, 294, 330, 349, 392, 440],
                nodalQuartet: [{ qlPosition: 0, helix: 'b', m: 2, n: 3 }]
            }
        }));
        expect(result.state).toBe('ready');
        expect(result.conditionalPending).toEqual([]);
    });

    it('resolution never confuses zero/false with absence', () => {
        const result = evaluateIntegratedReadiness(profileWith({
            harmonicProfile: {
                anandaVortex: { kleinFlipAtThisTick: false },
                resonance72Index: 0
            }
        }));
        expect(result.state).toBe('ready');
    });
});
