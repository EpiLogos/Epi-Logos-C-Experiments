// @vitest-environment node
/**
 * Coordinate: M2' meaning-packet reading — gate (rerun 51.T51.4)
 * Residency: Body/M/pratibimba-app/src/panes/m2MeaningPacket/meaningPacket.test.ts
 * Actualises: the two laws that make this inspector worth having.
 *   (a) ABSENCE IS REPORTED, NEVER FILLED — [[M2'-SPEC]] :118 makes a missing
 *       field an error, so a reading that quietly defaulted would be the exact
 *       failure the packet exists to prevent.
 *   (b) ELEMENTS ROUTE THROUGH THE L2' REGISTER — the alchemical ordering is
 *       `m_canonical.h`'s, imported from `engine/elementRegisters.ts`, and an
 *       out-of-register value is unnameable rather than coerced to Aether.
 * Does NOT own: the register (`elementRegisters.test.ts`), the axis decoders
 *   (`axisViews.test.ts`), the surface.
 * Contract: [[M2'-SPEC]] §2 / :118 · [[DR-L2-ELEM-2]] · rerun tranche [[51.T51.4]].
 */

import { describe, expect, it } from 'vitest';
import {
    address72Views,
    elementalMediumFrame,
    M2_MEANING_PACKET_FIELDS,
    readMeaningPacket,
    type MeaningPacketFieldId
} from './meaningPacket';
import { AXIS_ORDER, decodeAxisAt } from '../../engine/axisViews';
import { ALCHEMICAL_ELEMENT_NAMES } from '../../engine/elementRegisters';
import type { KernelBridgeCachedProfile } from '../../bridge/types';

function cached(profile: unknown, generation = 11): KernelBridgeCachedProfile {
    return {
        generation,
        cachedAtMs: 1,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public',
        profile
    } as KernelBridgeCachedProfile;
}

describe('51.T51.4 — the declared field set is canon’s twelve', () => {
    it('names exactly the fields M2’-SPEC :118 accepts, in the spec’s order', () => {
        expect(M2_MEANING_PACKET_FIELDS.map(field => field.id)).toEqual([
            'profileId',
            'resonance72',
            'elements',
            'planetaryChakral',
            'diatonic',
            'harmonic.audio_octet',
            'harmonic.nodal_quartet',
            'lensMode',
            'kleinFlipState',
            'sacredSonic',
            'maqamMode',
            'm3Projection'
        ] satisfies MeaningPacketFieldId[]);
    });
});

describe('51.T51.4 — absence is reported, never filled', () => {
    it('reports every field pending on an empty payload, and invents no address', () => {
        const packet = readMeaningPacket(cached({}));
        expect(packet.pending).toHaveLength(M2_MEANING_PACKET_FIELDS.length);
        expect(packet.fields.every(field => field.present === false)).toBe(true);
        expect(packet.fields.every(field => field.value === null)).toBe(true);
        expect(packet.address72).toBeNull();
        expect(packet.mefSemanticFrame).toBeNull();
        // …and the six axis views exist as views with nothing to decode, rather
        // than silently decoding address 0.
        expect(packet.address72Views.map(view => view.axis)).toEqual([...AXIS_ORDER]);
        expect(packet.address72Views.every(view => view.decode === null)).toBe(true);
    });

    it('distinguishes a field that is ABSENT from one carrying null on the wire', () => {
        const packet = readMeaningPacket(cached({ harmonicProfile: { maqamMode: null } }));
        const maqam = packet.fields.find(field => field.id === 'maqamMode')!;
        expect(maqam.present, 'a wire null is a PRESENT field').toBe(true);
        expect(maqam.value).toBeNull();
        expect(packet.pending).not.toContain('maqamMode');
    });

    it('reads a populated packet and marks only the genuinely absent as pending', () => {
        const packet = readMeaningPacket(
            cached({
                harmonicProfile: {
                    profileId: 'p-1',
                    resonance72: { lensAnchorIndex: 37 },
                    elements: [1, 4],
                    lensMode: { lens: 3, mode: 2 }
                }
            })
        );
        expect(packet.generation).toBe(11);
        expect(packet.address72).toBe(37);
        expect(packet.pending).toEqual([
            'planetaryChakral',
            'diatonic',
            'harmonic.audio_octet',
            'harmonic.nodal_quartet',
            'kleinFlipState',
            'sacredSonic',
            'maqamMode',
            'm3Projection'
        ]);
    });

    it('refuses an out-of-range address rather than decoding it', () => {
        expect(readMeaningPacket(cached({ resonance72: { lensAnchorIndex: 72 } })).address72).toBeNull();
        expect(readMeaningPacket(cached({ resonance72: { lensAnchorIndex: -1 } })).address72).toBeNull();
        expect(
            readMeaningPacket(cached({ resonance72: { lensAnchorIndex: 3.5 } })).address72
        ).toBeNull();
    });

    it('always names the three provenance authorities the spec requires', () => {
        const provenance = readMeaningPacket(cached({})).provenance;
        expect(provenance).toHaveLength(3);
        expect(provenance[1]).toContain('S2 graph-law authority');
        expect(provenance[2]).toContain('Kerykeion/Kairos');
    });
});

describe('51.T51.4 — the 72-address views are the six axes of ONE address', () => {
    it('decodes each axis with its own decoder, not six copies of MEF', () => {
        const views = address72Views(37);
        expect(views.map(view => view.axis)).toEqual([...AXIS_ORDER]);
        for (const view of views) {
            expect(view.decode).toEqual(decodeAxisAt(37, view.axis));
            expect(view.sourceField).toContain('routingTrace.axisViews.');
        }
        // the decodes really differ — a MEF/tattva collision would mean the
        // "six views" were one view rendered six times
        expect(views.find(v => v.axis === 'mef')!.decode!.parts).not.toEqual(
            views.find(v => v.axis === 'tattva')!.decode!.parts
        );
    });

    it('names the kernel-owned (LUT) fields an axis may not derive locally', () => {
        const decan = address72Views(0).find(view => view.axis === 'decan')!;
        expect(decan.decode!.kernelSourced).toContain('rulingPlanet');
    });
});

describe('51.T51.4 — the elemental-medium frame routes through the L2′ register', () => {
    it('carries the m_canonical.h alchemical ordering verbatim', () => {
        expect(elementalMediumFrame([]).register).toEqual(ALCHEMICAL_ELEMENT_NAMES);
        expect(ALCHEMICAL_ELEMENT_NAMES[0]).toMatch(/aether/i);
        expect(ALCHEMICAL_ELEMENT_NAMES[1]).toMatch(/earth/i);
        expect(ALCHEMICAL_ELEMENT_NAMES[2]).toMatch(/water/i);
        expect(ALCHEMICAL_ELEMENT_NAMES[3]).toMatch(/air/i);
        expect(ALCHEMICAL_ELEMENT_NAMES[4]).toMatch(/fire/i);
        expect(ALCHEMICAL_ELEMENT_NAMES[5]).toMatch(/salt/i);
    });

    it('names bare ids and object-borne elementIds through the register', () => {
        const frame = elementalMediumFrame([2, { elementId: 4 }]);
        expect(frame.elements.map(entry => entry.name)).toEqual([
            ALCHEMICAL_ELEMENT_NAMES[2],
            ALCHEMICAL_ELEMENT_NAMES[4]
        ]);
    });

    it('marks Aether and Salt NON-operative and the quartet operative', () => {
        const frame = elementalMediumFrame([0, 1, 2, 3, 4, 5]);
        expect(frame.elements.map(entry => entry.operative)).toEqual([
            false,
            true,
            true,
            true,
            true,
            false
        ]);
    });

    it('leaves an out-of-register value UNNAMEABLE rather than coercing it to Aether', () => {
        const frame = elementalMediumFrame([6, -1, 'fire', null]);
        expect(frame.elements.map(entry => entry.element)).toEqual([null, null, null, null]);
        expect(frame.elements.map(entry => entry.name)).toEqual([null, null, null, null]);
        expect(frame.elements.map(entry => entry.operative)).toEqual([null, null, null, null]);
    });

    it('reports an absent `elements` field as pending, not as an empty register', () => {
        expect(elementalMediumFrame(undefined).present).toBe(false);
        expect(elementalMediumFrame([]).present).toBe(true);
    });
});
