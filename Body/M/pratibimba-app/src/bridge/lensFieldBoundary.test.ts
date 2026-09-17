// Coordinate: M' carrier lens-field boundary proof.
// Residency: Body/M/pratibimba-app/src/bridge.
// Position (#n): #3 process / boundary verification.
// Actualises: the strict `parseLensFieldProjection` boundary — generic
//             structure/activation consumption, honest-absence discipline,
//             and the pleroma-only symbolic-system law at the app edge.
// Public surface: test module only.
// Does NOT own: the kernel laws or the wire schema (Rust + Zod authorities).
// Contract: [[M3'-SPEC]] / 02-16-lenses "Generic Lens-Field Dynamic".

import { describe, expect, it } from 'vitest';
import { parseLensFieldProjection } from './types';

const ELEMENTS = ['fire', 'earth', 'air', 'water'] as const;

function element(slice: number, segment: number) {
    const sign = Math.floor((((2 * segment + 1) * slice) % 720) / 60) % 12;
    return ELEMENTS[sign % 4];
}

function packet(lensId: number, slice: number, sections: number) {
    const channels = sections > 1 && sections % 2 === 0 ? sections / 2 : 0;
    return {
        contract: 'kernelBridge.m3.lensField(lensId)',
        runtimeOwner: 'S0/S0\' kernel-bridge runtime',
        source: 'kernel-bridge',
        lensId,
        structure: {
            lensId,
            groundingLensId: 16,
            slice,
            sections,
            topology: sections === 1
                ? { kind: 'self-opposed' }
                : sections % 2 === 0
                    ? { kind: 'diameter-paired', channels }
                    : { kind: 'boundary-opposed' },
            groundQuantization: slice % 6 === 0
                ? { kind: 'integral', stepsPerSegment: slice / 6 }
                : { kind: 'fractional' },
            segments: Array.from({ length: sections }, (_, segment) => ({
                segment,
                startDegree: segment * slice,
                midpoint720: ((2 * segment + 1) * slice) % 720,
                element: element(slice, segment)
            }))
        },
        activation: {
            lensId,
            positionedOrbiters: 0,
            weightsTotal: { fire: 0, water: 0, air: 0, earth: 0 },
            landings: [],
            channelBalances: Array.from({ length: channels }, (_, channel) => ({
                channel,
                priorSegment: channel,
                consortSegment: channel + channels,
                priorElement: element(slice, channel),
                consortElement: element(slice, channel + channels),
                signedBalance: 0
            })),
            akashaPresence: 0,
            akashaEpsilon: 0.05,
            akashaCondition: null
        },
        balanceQuaternion: [1, 0, 0, 0],
        symbolicSystem: lensId === 6 ? pleroma() : null
    };
}

const DIAMETERS = [0, 4, 7, 12, 2, 5, 8, 11, 14, 1, 3, 6, 9, 10, 13];
const ARCS = ['ogdoad', 'ogdoad', 'ogdoad', 'ogdoad', 'decad', 'decad', 'decad',
    'decad', 'decad', 'dodecad', 'dodecad', 'dodecad', 'dodecad', 'dodecad', 'dodecad'] as const;

function pleroma() {
    return {
        kind: 'pleroma',
        layout: 'interleaved456',
        seats: Array.from({ length: 30 }, (_, segment) => ({
            segment,
            aeon: `Aeon${segment}`,
            meaning: 'Meaning',
            emanationIndex: (segment % 15) + 1,
            arc: ARCS[DIAMETERS.indexOf(segment % 15)],
            syzygy: DIAMETERS.indexOf(segment % 15),
            prior: segment < 15,
            element: element(12, segment),
            fibonacciPositions: [2 * segment, 2 * segment + 1],
            fibonacciDigits: [0, 1]
        })),
        syzygies: Array.from({ length: 15 }, (_, syzygy) => {
            const diameter = DIAMETERS[syzygy];
            const threshold = diameter === 0 || diameter === 7;
            return {
                syzygy,
                diameter,
                arc: ARCS[syzygy],
                priorAeon: `Aeon${diameter}`,
                consortAeon: `Aeon${diameter + 15}`,
                priorElement: element(12, diameter),
                consortElement: element(12, diameter + 15),
                digitSum: threshold ? 10 : 20,
                threshold
            };
        })
    };
}

describe('parseLensFieldProjection (generic lens-field boundary)', () => {
    it('parses the pleromatic lens 6 with its 30 seats and layout', () => {
        const parsed = parseLensFieldProjection(packet(6, 12, 30));
        expect(parsed.pleromaSeats).toHaveLength(30);
        expect(parsed.pleromaLayout).toBe('interleaved456');
        expect(parsed.topologyKind).toBe('diameter-paired');
        expect(parsed.channelBalances).toHaveLength(15);
    });

    it('parses generic lenses across all three parity topologies without a symbolic system', () => {
        expect(parseLensFieldProjection(packet(9, 30, 12)).pleromaSeats).toBeNull();
        expect(parseLensFieldProjection(packet(11, 40, 9)).topologyKind).toBe('boundary-opposed');
        expect(parseLensFieldProjection(packet(15, 360, 1)).topologyKind).toBe('self-opposed');
        expect(parseLensFieldProjection(packet(16, 6, 60)).sections).toBe(60);
    });

    it('enforces honest absence: no Akasha verdict without positioned orbiters', () => {
        const fabricated = packet(9, 30, 12);
        fabricated.activation.akashaCondition = true as unknown as null;
        expect(() => parseLensFieldProjection(fabricated)).toThrow(/fabricate/);
    });

    it('refuses a symbolic system seated off lens 6 and a missing one at lens 6', () => {
        const misplaced = { ...packet(9, 30, 12), symbolicSystem: pleroma() };
        expect(() => parseLensFieldProjection(misplaced)).toThrow(/seated only/);
        const missing = { ...packet(6, 12, 30), symbolicSystem: null };
        expect(() => parseLensFieldProjection(missing)).toThrow();
    });

    it('refuses a broken 280 digit decomposition', () => {
        const broken = packet(6, 12, 30);
        (broken.symbolicSystem as ReturnType<typeof pleroma>).syzygies[2].digitSum = 7;
        expect(() => parseLensFieldProjection(broken)).toThrow(/280/);
    });
});
