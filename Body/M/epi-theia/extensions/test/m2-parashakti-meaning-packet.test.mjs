import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const baselineProfile = JSON.parse(
    readFileSync(
        '/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/portal-core/contract-inventory/baseline-profile.json',
        'utf8'
    )
);
const {
    buildM2PrimeMeaningPacket,
    renderM2CymaticFrame,
    M2_MEANING_PACKET_CONTRACT_VERSION,
    PROTECTED_PERSONAL_CYMATIC_SCOPE
} = require('../m2-parashakti/lib/common/index.js');

const SOURCE_FILE =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts';

function boundary(generation, payload = baselineProfile) {
    return Object.freeze({
        generation,
        pointerAnchor: 'profile:pointer:baseline',
        capabilities: Object.freeze(['profile.public-current']),
        payload
    });
}

function readiness(state = 'ready_public_current') {
    return Object.freeze({
        state,
        updatedAt: '2026-06-01T00:00:00.000Z',
        sources: Object.freeze([]),
        blockers: Object.freeze([])
    });
}

function coordinateContext() {
    return Object.freeze({
        canonicalMCoordinate: "M2'",
        pointerAnchor: 'pointer://s0-baseline',
        profileGeneration: 17
    });
}

function s2Payload(extra = {}) {
    return Object.freeze({
        provenanceHandle: Object.freeze({
            source: 's2',
            handle: 's2://contract/m2-correspondence/baseline',
            bodyAllowed: false,
            note: 'captured S2 provenance handle'
        }),
        tree72Handle: 's2://tree72/baseline',
        decanFace: Object.freeze({
            faceHandle: 's2://decan/00',
            configurable: true,
            source: 'S2 graph law'
        }),
        sacredSonic: Object.freeze({
            shemHandle: 's2://shem/00',
            asmaHandle: 's2://asma/00',
            mantra: Object.freeze({ status: 'pending', owner: 'S2 correspondence law' }),
            maqam: Object.freeze({ status: 'pending', owner: 'S2 correspondence law' })
        }),
        planetaryChakral: Object.freeze({
            body: 'Earth',
            chakraRole: 'Muladhara / grounding center',
            provenance: 'S2 governed correspondence payload'
        }),
        earthObserverHandle: 's2://observer/earth-baseline',
        ...extra
    });
}

function kerykeionPayload() {
    return Object.freeze({
        provenanceHandle: Object.freeze({
            source: 'kerykeion',
            handle: 's3://world-clock/kerykeion/baseline',
            bodyAllowed: false
        }),
        worldClockHandle: 's3://world-clock/2026-06-01T00:00:00Z',
        planetaryHourRuler: 'Earth-observer-pending',
        transitHandle: 's3://transit/baseline'
    });
}

function packet(overrides = {}) {
    return buildM2PrimeMeaningPacket({
        profile: boundary(17),
        readiness: readiness(),
        context: coordinateContext(),
        subject: 'tick',
        emittedAt: 1_771_000_000_000,
        s2: s2Payload(),
        kerykeion: kerykeionPayload(),
        ...overrides
    });
}

test('M2PrimeMeaningPacket is built from the real portal-core profile fixture plus S2/Kerykeion handles', () => {
    const model = packet();
    assert.equal(model.contractVersion, M2_MEANING_PACKET_CONTRACT_VERSION);
    assert.equal(model.profileGeneration, 17);
    assert.equal(model.address72, baselineProfile.resonance72.lensAnchorIndex);
    assert.equal(model.elementalFrame.values.pPositionElement, baselineProfile.elements.pPositionElement);
    assert.equal(model.planetaryChakralFrame.values.provenance, 'S2 governed correspondence payload');
    assert.deepEqual(
        model.provenance.map(handle => handle.handle),
        [
            'profile:generation:17',
            's2://contract/m2-correspondence/baseline',
            's3://world-clock/kerykeion/baseline'
        ]
    );
    assert.equal(model.readiness.packetReady, true);
});

test('every packet address view remains inside canonical 72-space', () => {
    const model = packet();
    assert.ok(model.addressViews.length >= 6);
    for (const view of model.addressViews) {
        assert.equal(Number.isInteger(view.address72), true);
        assert.ok(view.address72 >= 0 && view.address72 <= 71, `${view.name} address out of range`);
    }

    const shifted = structuredClone(baselineProfile);
    shifted.resonance72.lensAnchorIndex = 143;
    const shiftedPacket = packet({ profile: boundary(18, shifted) });
    assert.equal(shiftedPacket.address72, 71);
});

test('cymatic renderer consumes exact profile audioOctet and nodalQuartet without rewriting the bus', () => {
    const frame = renderM2CymaticFrame({ profile: boundary(17), address72: 0 });
    assert.deepEqual(frame.audioOctetHz, baselineProfile.audioOctet);
    assert.deepEqual(frame.nodalQuartet, baselineProfile.nodalQuartet);
    assert.equal(frame.exactProfileBus, true);
    assert.equal(frame.sampleCount, 72);

    const altered = structuredClone(baselineProfile);
    altered.audioOctet = altered.audioOctet.map((hz, index) => (index === 0 ? hz * 1.5 : hz));
    const alteredFrame = renderM2CymaticFrame({ profile: boundary(18, altered), address72: 0 });
    assert.notDeepEqual(alteredFrame.wavePoints, frame.wavePoints, 'wave must be computed from bus values');
});

test('correspondence values come from S2/profile payloads or stay pending, never renderer folklore', () => {
    const s2 = s2Payload({
        sacredSonic: Object.freeze({
            shemHandle: 's2://shem/custom',
            asmaHandle: 's2://asma/custom',
            maqam: Object.freeze({ status: 'pending', reason: 'policy-unresolved' })
        })
    });
    const model = packet({ s2 });
    assert.equal(model.sacredSonicFrame.values.shemHandle, 's2://shem/custom');
    assert.equal(model.sacredSonicFrame.values.maqam.status, 'pending');

    const pending = packet({ s2: s2Payload({ sacredSonic: undefined }) });
    assert.equal(pending.sacredSonicFrame.pending, true);
    assert.ok(pending.pendingFields.includes('s2.sacredSonic'));

    const source = readFileSync(SOURCE_FILE, 'utf8');
    assert.doesNotMatch(source, /M2_(?:MANTRA|MAQAM|PLANET|SHEM|ASMA)_LUT/);
    assert.doesNotMatch(source, /\[\s*(?:-?\d+(?:\.\d+)?\s*,\s*){8,}-?\d+(?:\.\d+)?\s*\]/);
});

test('M2 to M3 DET is emitted as evidence only and never final codon authority', () => {
    const model = packet();
    assert.equal(model.detEvidence.finalClassificationAuthority, 'M3/M3-prime');
    assert.equal(model.observabilityEvents.length, 2);
    for (const event of model.observabilityEvents) {
        assert.equal(event.payload.detEvidenceOnly, true);
        assert.equal(event.payload.finalCodonAuthority, 'M3/M3-prime');
        assert.equal('codonClassFinal' in event.payload, false);
    }
});

test('personal-Pratibimba cymatic rendering is blocked outside protected M4 surfaces', () => {
    const model = packet({ cymaticScope: 'personal-pratibimba' });
    assert.equal(model.cymaticSignature.personalScopeBlocked, true);
    assert.equal(model.readiness.packetReady, false);
    assert.ok(model.readiness.blockers.some(blocker => blocker.includes(PROTECTED_PERSONAL_CYMATIC_SCOPE)));

    const protectedModel = packet({ cymaticScope: 'protected-m4' });
    assert.equal(protectedModel.cymaticSignature.personalScopeBlocked, false);
    assert.equal(protectedModel.readiness.packetReady, true);
});
