import { describe, expect, it } from 'vitest';
import { buildM3WheelSurface } from '../components/M3CosmicWheelRenderService';
import {
    buildM3CodonRotationProjectionForLensRing,
    M3_CODON_WHEEL_CONTRACT_VERSION
} from './M3CodonRotationProjectionForLensRing';

const PROFILE = Object.freeze({
    harmonicProfile: Object.freeze({
        codonRotationProjection: Object.freeze({
            codonId: 38,
            rotation: 2,
            rotationalStateCount: 7,
            surfaceIndex: 281
        }),
        mahamaya: Object.freeze({
            lineChangeOperatorAddress: 251,
            chargeQuaternion: Object.freeze({
                pp: 1,
                mm: 2,
                mp: 3,
                pm: 4,
                fourX: 10,
                chargeQuaternionInvariant: true
            })
        }),
        tick: 52,
        tick12: 4,
        degree720: 415
    })
});

describe('buildM3CodonRotationProjectionForLensRing', () => {
    it('projects the active bussed codon into the canonical read-only K2 cell descriptor', () => {
        const surface = buildM3WheelSurface({ payload: PROFILE, generation: 73 });

        expect(buildM3CodonRotationProjectionForLensRing(surface)).toEqual({
            contractVersion: M3_CODON_WHEEL_CONTRACT_VERSION,
            profileGeneration: 73,
            cells: [
                {
                    cellIndex: 281,
                    codonId: 38,
                    rotation: 2,
                    chargeQuaternion: [1, 2, 3, 4],
                    lineChangeOperator: '251',
                    tick: 52,
                    degree720: 415
                }
            ],
            readiness: { state: 'ready', blockers: [] }
        });
    });

    it('is deterministic, deeply immutable, and leaves the source surface untouched', () => {
        const surface = buildM3WheelSurface({ payload: PROFILE, generation: 73 });
        const before = structuredClone(surface);
        const first = buildM3CodonRotationProjectionForLensRing(surface);
        const second = buildM3CodonRotationProjectionForLensRing(surface);

        expect(first).toEqual(second);
        expect(surface).toEqual(before);
        expect(Object.isFrozen(first)).toBe(true);
        expect(Object.isFrozen(first.cells)).toBe(true);
        expect(Object.isFrozen(first.cells[0])).toBe(true);
        expect(Object.isFrozen(first.cells[0].chargeQuaternion)).toBe(true);
    });

    it('returns identical descriptors for daily and deep surfaces at the same profile generation', () => {
        const daily = buildM3WheelSurface({ payload: PROFILE, generation: 73 });
        const deep = buildM3WheelSurface({ payload: structuredClone(PROFILE), generation: 73 });

        expect(buildM3CodonRotationProjectionForLensRing(daily)).toEqual(
            buildM3CodonRotationProjectionForLensRing(deep)
        );
    });

    it('fails closed for an unready surface or an incomplete authority payload', () => {
        const unready = buildM3WheelSurface({ payload: {}, generation: 0 });
        expect(() => buildM3CodonRotationProjectionForLensRing(unready)).toThrow(
            'requires a ready M3 projection surface'
        );

        const incomplete = buildM3WheelSurface({
            payload: {
                harmonicProfile: {
                    codonRotationProjection: { codonId: 38, rotation: 2 },
                    tick12: 4,
                    degree720: 415
                }
            },
            generation: 73
        });
        expect(() => buildM3CodonRotationProjectionForLensRing(incomplete)).toThrow(
            'authority payload is incomplete'
        );
    });
});
