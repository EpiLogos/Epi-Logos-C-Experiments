import { describe, expect, it } from 'vitest';
import {
    buildM2MeaningPacket,
    buildModalResonatorDigest,
    extractModalLabels,
    PENDING_MODAL_LABELS,
    PROTECTED_BODY_KEYS,
    type M2ModalLabels
} from './m2MeaningPacket';
import { cymaticDigest } from './cymaticField';
import type { ModalResonatorBoundary } from '../bridge/types';

const OCTET = [146.8, 167.5, 191.2, 216.4, 174.6, 199.3, 227.4, 233.1];
const QUARTET = [
    { m: 1, n: 1 },
    { m: 2, n: 1 },
    { m: 3, n: 2 },
    { m: 1, n: 3 }
];

const BELL_ROLES = ['hum', 'prime', 'tierce', 'quint', 'nominal', 'upper', 'warble', 'residue'];

function modalBoundary(overrides: Partial<ModalResonatorBoundary> = {}): ModalResonatorBoundary {
    return {
        schemaVersion: 1,
        tick12: 3,
        liveOctet: OCTET.map((hz, octetIndex) => ({ octetIndex, hz })),
        bellPartials: BELL_ROLES.map((role, octetIndex) => ({ octetIndex, role })),
        m2Address72: { address72: 17 },
        lensMode: { lens: 2, mode: 3, lensModeIndex: 2 * 7 + 3 },
        silentComplement: [
            { pitchClass: 1, silentIndex: 0, note: 'C#' },
            { pitchClass: 3, silentIndex: 1, note: 'D#' },
            { pitchClass: 6, silentIndex: 2, note: 'F#' },
            { pitchClass: 8, silentIndex: 3, note: 'G#' },
            { pitchClass: 10, silentIndex: 4, note: 'A#' }
        ],
        ...overrides
    };
}

function harmonicProfile(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        audioOctet: OCTET,
        nodalQuartet: QUARTET,
        resonance72: { lensAnchorIndex: 17 },
        modalResonator: modalBoundary(),
        ...overrides
    };
}

const RAST: M2ModalLabels = Object.freeze({
    maqam: 'Rast',
    maqamSpiritualFunction: 'protection of thought',
    planetaryMode: 'The E-E octave',
    source: 'graph'
});

describe('buildModalResonatorDigest (verbatim modal ref — never a recompute)', () => {
    it('copies the kernel bus, lens-mode, bell roles, and silent complement verbatim', () => {
        const digest = buildModalResonatorDigest(modalBoundary());
        expect(digest).not.toBeNull();
        expect(digest?.liveOctetHz).toEqual(OCTET);
        expect(digest?.bellPartialRoles).toEqual(BELL_ROLES);
        expect(digest?.lensModeIndex).toBe(17);
        expect(digest?.m2Address72).toBe(17);
        expect(digest?.silentPitchClasses).toEqual([1, 3, 6, 8, 10]);
        expect(typeof digest?.digestHash).toBe('string');
    });

    it('returns null for an absent / malformed contract (legacy gateway) — never invents one', () => {
        expect(buildModalResonatorDigest(null)).toBeNull();
        expect(buildModalResonatorDigest(modalBoundary({ liveOctet: [] }))).toBeNull();
    });
});

describe('extractModalLabels (graph-sourced maqam / mode via s2 — never synthesised)', () => {
    it('reads maqam and planetary mode verbatim from an s2.parashaktiCorrespondences artifact', () => {
        const labels = extractModalLabels({
            sacredSonic: { maqam: { name: 'Rast', spiritualFunction: 'protection of thought' } },
            planetaryChakral: { planetaryMode: 'The E-E octave' }
        });
        expect(labels.source).toBe('graph');
        expect(labels.maqam).toBe('Rast');
        expect(labels.maqamSpiritualFunction).toBe('protection of thought');
        expect(labels.planetaryMode).toBe('The E-E octave');
    });

    it('is pending (null, never fabricated) when the graph carries no modal descriptor', () => {
        expect(extractModalLabels({})).toEqual(PENDING_MODAL_LABELS);
        expect(extractModalLabels(null)).toEqual(PENDING_MODAL_LABELS);
        expect(extractModalLabels({ sacredSonic: { maqam: null } })).toEqual(PENDING_MODAL_LABELS);
    });
});

describe('buildM2MeaningPacket (49.4 — exact bus + modal digest + cymatic digest + labels)', () => {
    it('carries the exact 8+4 profile bus and marks it authoritative', () => {
        const packet = buildM2MeaningPacket({ generation: 4, harmonicProfile: harmonicProfile() });
        expect(packet.audioOctetHz).toEqual(OCTET);
        expect(packet.nodalQuartet).toEqual(QUARTET);
        expect(packet.exactProfileBus).toBe(true);
        expect(packet.address72).toBe(17);
    });

    it('carries the modal resonator digest (a ref) AND the cymatic digest (the summary)', () => {
        const packet = buildM2MeaningPacket({ generation: 4, harmonicProfile: harmonicProfile() });
        expect(packet.modalResonatorDigest?.bellPartialRoles).toEqual(BELL_ROLES);
        expect(packet.cymaticDigest).toEqual(cymaticDigest(OCTET, QUARTET, 0, 32));
    });

    it('throws rather than synthesise pitch/nodal state when the bus is not exactly 8+4', () => {
        expect(() =>
            buildM2MeaningPacket({
                generation: 1,
                harmonicProfile: harmonicProfile({ audioOctet: OCTET.slice(0, 7) })
            })
        ).toThrow(/audioOctet\[8\] and nodalQuartet\[4\]/);
        expect(() =>
            buildM2MeaningPacket({
                generation: 1,
                harmonicProfile: harmonicProfile({ nodalQuartet: QUARTET.slice(0, 3) })
            })
        ).toThrow();
    });

    it('does NOT synthesise modal labels — an unlabelled packet is pending, never fabricated', () => {
        const packet = buildM2MeaningPacket({ generation: 4, harmonicProfile: harmonicProfile() });
        expect(packet.modalLabels).toEqual(PENDING_MODAL_LABELS);
        expect(packet.modalLabels.maqam).toBeNull();
        expect(packet.pendingFields).toContain('s2.parashaktiCorrespondences.modalLabels');
        expect(packet.packetReady).toBe(false);
    });

    it('is ready once the graph labels and modal digest are both present', () => {
        const packet = buildM2MeaningPacket({
            generation: 4,
            harmonicProfile: harmonicProfile(),
            modalLabels: RAST
        });
        expect(packet.modalLabels.maqam).toBe('Rast');
        expect(packet.pendingFields).toHaveLength(0);
        expect(packet.packetReady).toBe(true);
    });

    it('reports modalResonator pending when the profile carries no modal contract (bus still authority)', () => {
        const packet = buildM2MeaningPacket({
            generation: 4,
            harmonicProfile: harmonicProfile({ modalResonator: undefined })
        });
        expect(packet.modalResonatorDigest).toBeNull();
        expect(packet.audioOctetHz).toEqual(OCTET);
        expect(packet.pendingFields).toContain('profile.modalResonator');
    });

    describe('the packet byte-hash moves iff the bus or the modal digest moves — labels never move it', () => {
        it('is deterministic under identical bus + modal digest', () => {
            const a = buildM2MeaningPacket({ generation: 4, harmonicProfile: harmonicProfile() });
            const b = buildM2MeaningPacket({ generation: 9, harmonicProfile: harmonicProfile() });
            expect(b.packetHash).toBe(a.packetHash);
        });

        it('does NOT move when only the descriptive maqam / mode labels change', () => {
            const base = buildM2MeaningPacket({
                generation: 4,
                harmonicProfile: harmonicProfile(),
                modalLabels: RAST
            });
            const relabelled = buildM2MeaningPacket({
                generation: 4,
                harmonicProfile: harmonicProfile(),
                modalLabels: { ...RAST, maqam: 'Bayati', planetaryMode: 'A different octave' }
            });
            expect(relabelled.packetHash).toBe(base.packetHash);
        });

        it('DOES move when the 8+4 bus changes', () => {
            const base = buildM2MeaningPacket({ generation: 4, harmonicProfile: harmonicProfile() });
            const shifted = buildM2MeaningPacket({
                generation: 4,
                harmonicProfile: harmonicProfile({ audioOctet: [180, ...OCTET.slice(1)] })
            });
            expect(shifted.packetHash).not.toBe(base.packetHash);
        });

        it('DOES move when the declared modal digest changes (lens-mode)', () => {
            const base = buildM2MeaningPacket({ generation: 4, harmonicProfile: harmonicProfile() });
            const remoded = buildM2MeaningPacket({
                generation: 4,
                harmonicProfile: harmonicProfile({
                    modalResonator: modalBoundary({ lensMode: { lens: 5, mode: 1, lensModeIndex: 36 } })
                })
            });
            expect(remoded.packetHash).not.toBe(base.packetHash);
        });
    });

    it('serialises no protected M4 personal field body — even when the profile smuggles one', () => {
        const packet = buildM2MeaningPacket({
            generation: 4,
            harmonicProfile: harmonicProfile({
                fieldBody: { secret: 'protected personal cymatic body' },
                personalCymatic: [1, 2, 3]
            }),
            modalLabels: RAST
        });
        const serialised = JSON.stringify(packet);
        for (const key of PROTECTED_BODY_KEYS) {
            expect(serialised).not.toContain(key);
        }
        expect(serialised).not.toContain('protected personal cymatic body');
    });
});
