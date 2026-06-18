import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { compositionLoad } = require('../lib/common/composition-load.js');

function readyReadiness(extensionId) {
    return {
        fetchedAt: 1,
        state: 'ready_public_current',
        reason: `${extensionId} ready`,
        profileGeneration: 1,
        bridgeReachable: true,
        blockerIds: []
    };
}

function contributionContract(extensionId, overrides = {}) {
    return {
        extensionId,
        track08Exports: [],
        compactViews: [],
        selectionHandlers: [],
        currentStateSelectors: [],
        evidenceSerializers: [],
        miniModes: [],
        routeContracts: [],
        observabilityEvents: [],
        compositionBoundary: {
            track07Owns: [],
            track08Owns: [],
            forbiddenImports: [],
            bridgeAdapterSymbol: 'SHARED_BRIDGE_ADAPTER'
        },
        ...overrides
    };
}

function contributor(extensionId, overrides = {}) {
    return {
        extensionId,
        readiness: readyReadiness(extensionId),
        contribution: contributionContract(extensionId, overrides.contribution),
        claims: overrides.claims ?? [],
        geometricClaims: overrides.geometricClaims ?? []
    };
}

function layoutClaim(extensionId, slot, miniModeFallback = 'mini-view') {
    return {
        extensionId,
        slot,
        priority: 50,
        miniModeFallback,
        privacyClass: 'public',
        reason: `${extensionId} claims ${slot}`
    };
}

function geometricClaim(extensionId, geometricSlot, handleClass) {
    return {
        extensionId,
        geometricSlot,
        handleClass,
        priority: 50,
        privacyClass: 'protected_local_handle_only',
        reason: `${extensionId} claims ${geometricSlot}`
    };
}

test('compositionLoad rejects a side-by-side compact view at load with contributor name', () => {
    const result = compositionLoad('cosmic-engine.integrated', [
        contributor('m2-parashakti', {
            contribution: {
                compactViews: [
                    {
                        exportName: 'M2SideBySidePane',
                        viewId: 'm2.side-by-side',
                        slot: 'side-by-side',
                        miniModes: [],
                        requiredSelectors: []
                    }
                ]
            },
            claims: [layoutClaim('m2-parashakti', 'side-panel')]
        })
    ], null);

    assert.equal(result.ok, false);
    assert.equal(result.rejection.compositionId, 'cosmic-engine.integrated');
    assert.equal(result.rejection.rejections.length, 1);
    assert.equal(result.rejection.rejections[0].extensionId, 'm2-parashakti');
    assert.equal(
        result.rejection.rejections[0].reason,
        'contribution-declares-side-by-side-slot'
    );
    assert.match(result.rejection.rejections[0].humanReason, /side-by-side/);
});

test('compositionLoad rejects a widget-only contributor with no claim at load', () => {
    const result = compositionLoad('cosmic-engine.integrated', [
        contributor('m3-mahamaya', {
            contribution: {
                compactViews: [
                    {
                        exportName: 'M3WidgetOnlyPane',
                        viewId: 'm3.widget-only',
                        miniModes: [],
                        requiredSelectors: []
                    }
                ],
                miniModes: []
            }
        })
    ], null);

    assert.equal(result.ok, false);
    assert.equal(result.rejection.rejections.length, 1);
    assert.equal(result.rejection.rejections[0].extensionId, 'm3-mahamaya');
    assert.equal(result.rejection.rejections[0].reason, 'contribution-has-no-claim');
    assert.match(result.rejection.rejections[0].humanReason, /no layout or geometric claim/);
});

test('compositionLoad rejects raw-body handleClass on personal geometric slots', () => {
    const result = compositionLoad('jiva-siva.integrated', [
        contributor('m4-nara', {
            claims: [layoutClaim('m4-nara', 'center-stage')],
            geometricClaims: [
                geometricClaim('m4-nara', 'center-composition', 'plaintext-journal')
            ]
        })
    ], null);

    assert.equal(result.ok, false);
    assert.equal(result.rejection.compositionId, 'jiva-siva.integrated');
    assert.equal(result.rejection.rejections.length, 1);
    assert.equal(result.rejection.rejections[0].extensionId, 'm4-nara');
    assert.equal(
        result.rejection.rejections[0].reason,
        'contribution-declares-raw-body-on-geometric-slot'
    );
    assert.match(result.rejection.rejections[0].humanReason, /plaintext-journal/);
    assert.match(result.rejection.rejections[0].humanReason, /center-composition/);
});

test('compositionLoad mounts granted slots and leaves profile blockers as runtime degrade', () => {
    const result = compositionLoad('cosmic-engine.integrated', [
        contributor('m1-paramasiva', {
            claims: [layoutClaim('m1-paramasiva', 'side-panel')],
            geometricClaims: [
                geometricClaim('m1-paramasiva', 'surface', 'k2-surface-handle')
            ]
        }),
        contributor('m2-parashakti', {
            claims: [layoutClaim('m2-parashakti', 'evidence-panel')],
            geometricClaims: [
                geometricClaim('m2-parashakti', 'texture', 'cymatic-mount-point')
            ]
        }),
        contributor('m3-mahamaya', {
            claims: [layoutClaim('m3-mahamaya', 'center-stage')],
            geometricClaims: [
                geometricClaim('m3-mahamaya', 'cell-state', 'codon-rotation-export')
            ]
        })
    ], {
        generation: 7,
        pointerAnchor: null,
        capabilities: [],
        payload: {}
    });

    assert.equal(result.ok, true);
    assert.equal(result.mounted.compositionId, 'cosmic-engine.integrated');
    assert.deepEqual(
        result.mounted.grantedGeometricClaims.map(claim => claim.claim.geometricSlot),
        ['surface', 'texture', 'cell-state']
    );

    const textureReadiness = result.mounted.readiness.perGeometricSlot.find(
        slot => slot.geometricSlot === 'texture'
    );
    assert.equal(textureReadiness?.ownerId, 'm2-parashakti');
    assert.equal(textureReadiness?.slotState, 'pending-field');
    assert.ok(
        result.mounted.readiness.compositionBlockers.some(
            blocker => blocker.id === 'pending-cymatic-mount-point'
        )
    );
});
