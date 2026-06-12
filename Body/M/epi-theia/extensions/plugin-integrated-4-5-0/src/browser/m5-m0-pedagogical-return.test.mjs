// 08.T8.4 verification suite — M5 → M0 pedagogical return (Möbius write-back).
//
// Proves:
//   (1) A recognized M5 claim crystallizes through the Logos Atelier and
//       surfaces in an M0-5' deep-link (jiva-siva route, m0-graph-backdrop
//       inspector, M0-5 coordinate).
//   (2) The return is a read-only contemplative offering: canonMutation=false,
//       readOnly=true, and the M0 canon node count is unchanged before/after.
//   (3) The offering grounds in the canonical BEDROCK link, never the M4
//       protected-local source handle (no protected body crosses the boundary).
//   (4) A non-archetypal (graphiti-memory) recognition is refused.
//   (5) An anchor that names a non-existent M0 node is refused rather than
//       fabricating canon.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    ATELIER_RETURN_ROUTE,
    M0_5_PRIME_RECOGNITION_CLOSURE_COORDINATE,
    M0_PEDAGOGY_PROVENANCE_EVENT_TYPE,
    PEDAGOGY_DEEP_LINK_INSPECTOR,
    crystallizeRecognitionThroughAtelier,
    freezeM0CanonView,
    offerPedagogicalReturn
} = require('../../lib/browser/m5-m0-pedagogical-return.js');
const {
    buildJivaSivaRecognitionClaim,
    parseIntegratedDeepLink
} = require('../../../integrated-composition/lib/common/index.js');

function recognizedClaim(overrides = {}) {
    return buildJivaSivaRecognitionClaim({
        claimId: 'claim-pedagogy-1',
        emittedAt: 100,
        privacyBoundary: 'protected_local_handle_only',
        m4ProtectedSourceHandle: 'm4://protected.handle.SHOULD_NOT_LEAK',
        bedrockLinkHandle: 'bedrock://anchor.M0-5.archetype',
        activityResonanceTraces: ['ar://trace.1'],
        s2EvidenceHandles: ['s2.bimba.handle.7'],
        s3SessionHandle: 's3.session.alpha',
        s3DayNowHandle: 's3.day.now.alpha',
        s5TargetRoute: {
            targetKind: 's5.review.target.routine',
            targetId: 's5.review.routine.jiva-recognition',
            reason: 'fixture'
        },
        sourceClass: 'm4-protected',
        sourceSpecAnchors: ["Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md#canon-recognition"],
        ...overrides
    });
}

const CANON = freezeM0CanonView([
    { coordinate: 'M0-0', label: 'Anuttara ground' },
    { coordinate: 'M0-4', label: 'archetypal number language' },
    { coordinate: 'M0-5', label: 'pratyabhijna recognition closure' }
]);

test("recognized pattern surfaces in an M0-5' deep-link without mutating canon", () => {
    const before = CANON.nodeCount;
    const result = offerPedagogicalReturn(recognizedClaim(), CANON, {
        recognizedArchetype: 'jiva-is-siva',
        profileGeneration: 9,
        offeredAt: 202
    });

    assert.equal(result.status, 'offered');

    // (1) M0-5' deep-link.
    const link = parseIntegratedDeepLink(result.offering.deepLink);
    assert.equal(link.routeName, 'jiva-siva');
    assert.equal(link.pluginId, 'plugin-integrated-4-5-0');
    assert.equal(link.intendedInspector, PEDAGOGY_DEEP_LINK_INSPECTOR);
    assert.equal(link.intendedInspector, 'm0-graph-backdrop');
    assert.equal(link.selectedCoordinate, M0_5_PRIME_RECOGNITION_CLOSURE_COORDINATE);
    assert.equal(link.selectedCoordinate, 'M0-5');
    assert.equal(result.offering.pedagogyLayerCoordinate, 'M0-5');

    // (2) Read-only, no canon mutation.
    assert.equal(result.offering.readOnly, true);
    assert.equal(result.offering.canonMutation, false);
    assert.equal(result.canonNodeCountBefore, before);
    assert.equal(result.canonNodeCountAfter, before);
    assert.equal(CANON.nodeCount, before);

    // Event is the read-only M0 provenance event, not a mutation request.
    assert.equal(result.event.type, M0_PEDAGOGY_PROVENANCE_EVENT_TYPE);
    assert.equal(result.event.type, 'm0.graph.provenance');
    assert.equal(result.event.extensionId, 'm0-anuttara');
    assert.equal(result.event.payload.canonMutation, false);
    assert.equal(result.event.payload.atelierRoute, ATELIER_RETURN_ROUTE);
});

test('pedagogical return grounds in BEDROCK link, never the M4 protected handle', () => {
    const result = offerPedagogicalReturn(recognizedClaim(), CANON, { offeredAt: 1 });
    assert.equal(result.status, 'offered');
    assert.equal(result.offering.provenanceHandle, 'bedrock://anchor.M0-5.archetype');

    // The protected-local source handle must not appear anywhere in the
    // offering or its emitted event.
    const serialized = JSON.stringify({ offering: result.offering, event: result.event });
    assert.ok(
        !serialized.includes('SHOULD_NOT_LEAK'),
        'M4 protected-local handle must not cross into the M0 pedagogy offering'
    );
});

test('crystallization refuses a non-archetypal graphiti-memory recognition', () => {
    assert.throws(
        () => crystallizeRecognitionThroughAtelier(recognizedClaim({ sourceClass: 'graphiti-memory' })),
        /graphiti-memory.*not archetypally grounded|not archetypally grounded/
    );
    const result = offerPedagogicalReturn(
        recognizedClaim({ sourceClass: 'graphiti-memory' }),
        CANON,
        { offeredAt: 7 }
    );
    assert.equal(result.status, 'rejected');
    assert.match(result.reason, /not archetypally grounded/);
    assert.equal(result.event.payload.canonMutation, false);
});

test('pedagogical return refuses to fabricate a non-existent M0 canon node', () => {
    const result = offerPedagogicalReturn(recognizedClaim(), CANON, {
        m0AnchorCoordinate: 'M0-99',
        offeredAt: 3
    });
    assert.equal(result.status, 'rejected');
    assert.match(result.reason, /not an existing canon node|may not fabricate canon/);
    // Canon untouched.
    assert.equal(CANON.nodeCount, 3);
});

test('frozen M0 canon view exposes no mutation surface', () => {
    assert.equal(typeof CANON.add, 'undefined');
    assert.equal(typeof CANON.set, 'undefined');
    assert.equal(typeof CANON.delete, 'undefined');
    assert.ok(Object.isFrozen(CANON));
    assert.ok(Object.isFrozen(CANON.nodes));
});
