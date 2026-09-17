import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    CompositionCoordinator,
    compositionLoad
} = require('../lib/common/composition-coordinator.js');
const {
    ALLOWED_HANDLE_CLASSES_ON_GEOMETRIC,
    FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC,
    JIVA_SIVA_LAYOUT,
    PERSONAL_GEOMETRIC_SLOTS
} = require('../lib/common/layout-claim.js');

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

function contributorStub(extensionId, geometricClaims = []) {
    return {
        extensionId,
        readiness: readyReadiness(extensionId),
        claims: [],
        geometricClaims,
        contribution: {
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
            }
        }
    };
}

function geometricClaim(extensionId, geometricSlot, handleClass) {
    return {
        extensionId,
        geometricSlot,
        handleClass,
        priority: 50,
        privacyClass: 'protected_local_handle_only',
        reason: `${extensionId} declares ${handleClass} on ${geometricSlot}`
    };
}

test('forbidden handle classes are rejected on every personal geometric slot', () => {
    const coordinator = new CompositionCoordinator(JIVA_SIVA_LAYOUT);
    let cases = 0;

    for (const handleClass of FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC) {
        for (const geometricSlot of PERSONAL_GEOMETRIC_SLOTS) {
            cases += 1;
            const contributor = contributorStub('m5-epii', [
                geometricClaim('m5-epii', geometricSlot, handleClass)
            ]);
            const violations = coordinator.enforceProtectedLocalBoundary([contributor]);

            assert.equal(violations.length, 1, `${handleClass} on ${geometricSlot}`);
            assert.match(violations[0], /contribution-declares-raw-body-on-geometric-slot/);
            assert.match(violations[0], /contributor=m5-epii/);
            assert.match(violations[0], /claim\.extensionId=m5-epii/);
            assert.ok(
                violations[0].includes(`geometricSlot=${geometricSlot}`),
                `violation must name slot ${geometricSlot}`
            );
            assert.ok(
                violations[0].includes(`handleClass=${handleClass}`),
                `violation must name handleClass ${handleClass}`
            );
        }
    }

    assert.equal(cases, 30);
});

test('allowed handle classes pass through on personal geometric slots', () => {
    const coordinator = new CompositionCoordinator(JIVA_SIVA_LAYOUT);
    const contributor = contributorStub(
        'm0-anuttara',
        ALLOWED_HANDLE_CLASSES_ON_GEOMETRIC.map((handleClass, index) =>
            geometricClaim(
                'm0-anuttara',
                PERSONAL_GEOMETRIC_SLOTS[index % PERSONAL_GEOMETRIC_SLOTS.length],
                handleClass
            )
        )
    );

    assert.equal(ALLOWED_HANDLE_CLASSES_ON_GEOMETRIC.length, 8);
    assert.deepEqual(coordinator.enforceProtectedLocalBoundary([contributor]), []);
});

test('compositionLoad rejects the whole jiva-siva mount when a geometric raw body is declared', () => {
    const contributor = contributorStub('m4-nara', [
        geometricClaim('m4-nara', 'center-composition', 'raw-natal-chart')
    ]);

    const result = compositionLoad(JIVA_SIVA_LAYOUT, [contributor]);

    assert.equal(result.status, 'rejected');
    assert.equal(result.resolvedClaims.length, 0);
    assert.equal(result.rejectedReasons.length, 1);
    assert.match(
        result.rejectedReasons[0],
        /contribution-declares-raw-body-on-geometric-slot/
    );
    assert.ok(result.rejectedReasons[0].includes('contributor=m4-nara'));
    assert.ok(result.rejectedReasons[0].includes('geometricSlot=center-composition'));
    assert.ok(result.rejectedReasons[0].includes('handleClass=raw-natal-chart'));
});
