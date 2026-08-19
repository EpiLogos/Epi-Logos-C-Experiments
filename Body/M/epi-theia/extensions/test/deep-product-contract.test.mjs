import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtime = require('../m-extension-runtime/lib/common/index.js');

const productIds = [
    'epi.deep.m0',
    'epi.deep.m1',
    'epi.deep.m2',
    'epi.deep.m3',
    'epi.deep.m4',
    'epi.deep.m5'
];

const parentByProduct = {
    'epi.deep.m0': 'epi.personal.450',
    'epi.deep.m1': 'epi.cosmic.123',
    'epi.deep.m2': 'epi.cosmic.123',
    'epi.deep.m3': 'epi.cosmic.123',
    'epi.deep.m4': 'epi.personal.450',
    'epi.deep.m5': 'epi.personal.450'
};

test('the eightfold E contract names exactly six deep products with distinct source-derived boundaries', () => {
    assert.deepEqual(Object.keys(runtime.DEEP_PRODUCT_DESCRIPTORS), productIds);

    for (const [index, productId] of productIds.entries()) {
        const descriptor = runtime.deepProductDescriptor(productId);
        assert.equal(descriptor.productId, productId);
        assert.equal(descriptor.parentProductId, parentByProduct[productId]);
        assert.equal(descriptor.coordinate, `M${index}'`);
        assert.match(descriptor.boundaryGround.coordinate, new RegExp(`^M${index}-0'`));
        assert.match(descriptor.boundaryReturn.coordinate, new RegExp(`^M${index}-5'`));
        assert.notEqual(descriptor.boundaryGround.meaning, descriptor.boundaryReturn.meaning);
        assert.equal(descriptor.currentStatus, 'PARTIAL');
        assert.ok(descriptor.nativeBodies.length > 0);
        assert.ok(descriptor.deepOnly.length > 0);
        assert.deepEqual(descriptor.actions, [
            'epi.action.deep.open',
            'epi.action.deep.focus',
            'epi.action.deep.return'
        ]);

        for (const inner of [1, 2, 3, 4]) {
            assert.ok(
                descriptor.parentSummonable.some(item =>
                    item.coordinate.startsWith(`M${index}-${inner}'`)
                ),
                `${productId} must state the parent-summonable M${index}-${inner}' capability`
            );
        }
    }

    assert.notEqual(
        runtime.deepProductDescriptor('epi.deep.m1').boundaryGround.meaning,
        runtime.deepProductDescriptor('epi.deep.m2').boundaryGround.meaning
    );
    assert.notEqual(
        runtime.deepProductDescriptor('epi.deep.m4').boundaryReturn.meaning,
        runtime.deepProductDescriptor('epi.deep.m5').boundaryReturn.meaning
    );
});

test('parent to deep to parent preserves exact event identity and provenance object', () => {
    const anchor = {
        parentProductId: 'epi.cosmic.123',
        eventRef: 'epi:event:current:example',
        subjectRef: 'epi:subject:current:example',
        coordinate: "M1'",
        selectedRef: 'epi:selection:example',
        provenanceRefs: ['epi:provenance:parent'],
        privacyClass: 'public_current_audio_metadata_only'
    };

    const resolution = runtime.resolveDeepOpen({
        actionRef: runtime.DEEP_OPEN_ACTION,
        requestedProductId: 'epi.deep.m1',
        anchor
    });

    assert.equal(resolution.anchor, anchor);
    assert.equal(resolution.anchor.eventRef, anchor.eventRef);
    assert.equal(resolution.anchor.subjectRef, anchor.subjectRef);
    assert.equal(resolution.anchor.coordinate, "M1'");
    assert.equal(resolution.anchor.provenanceRefs, anchor.provenanceRefs);

    const bodyRef = resolution.availableBodyRefs[0];
    const binding = runtime.bindDeepSurface(
        resolution,
        'oi:surface:presentation-only:m1-example',
        bodyRef
    );
    assert.equal(binding.anchor, anchor);
    assert.equal(binding.bodyRef, bodyRef);

    const focused = runtime.focusDeepSurface({
        actionRef: runtime.DEEP_FOCUS_ACTION,
        binding
    });
    assert.equal(focused, binding);

    const returned = runtime.returnFromDeepSurface({
        actionRef: runtime.DEEP_RETURN_ACTION,
        binding
    });
    assert.equal(returned, anchor);
    assert.equal(returned.eventRef, 'epi:event:current:example');
});

test('subject-only parents remain subject-only; the deep protocol does not mint a parallel event', () => {
    const anchor = {
        parentProductId: 'epi.personal.450',
        subjectRef: 'epi:personal:subject:example',
        coordinate: "M5'",
        provenanceRefs: ['epi:provenance:personal'],
        privacyClass: 'governed_review_metadata_only'
    };

    const resolution = runtime.resolveDeepOpen({
        actionRef: runtime.DEEP_OPEN_ACTION,
        requestedProductId: 'epi.deep.m5',
        anchor
    });

    assert.equal(resolution.anchor, anchor);
    assert.equal(resolution.anchor.eventRef, undefined);
    assert.equal(resolution.anchor.subjectRef, 'epi:personal:subject:example');
});

test('deep open rejects parent drift, coordinate drift, missing provenance and undeclared bodies', () => {
    const validAnchor = {
        parentProductId: 'epi.cosmic.123',
        eventRef: 'epi:event:current:example',
        coordinate: "M3'",
        provenanceRefs: ['epi:provenance:cosmic'],
        privacyClass: 'public_current_with_scalar_oracle_refs_only'
    };

    assert.throws(
        () => runtime.resolveDeepOpen({
            actionRef: runtime.DEEP_OPEN_ACTION,
            requestedProductId: 'epi.deep.m3',
            anchor: { ...validAnchor, parentProductId: 'epi.personal.450' }
        }),
        /belongs to epi\.cosmic\.123/
    );

    assert.throws(
        () => runtime.resolveDeepOpen({
            actionRef: runtime.DEEP_OPEN_ACTION,
            requestedProductId: 'epi.deep.m3',
            anchor: { ...validAnchor, coordinate: "M2'" }
        }),
        /requires coordinate M3'/
    );

    assert.throws(
        () => runtime.resolveDeepOpen({
            actionRef: runtime.DEEP_OPEN_ACTION,
            requestedProductId: 'epi.deep.m3',
            anchor: { ...validAnchor, provenanceRefs: [] }
        }),
        /requires parent provenance/
    );

    assert.throws(
        () => runtime.resolveDeepOpen({
            actionRef: runtime.DEEP_OPEN_ACTION,
            requestedProductId: 'epi.deep.m3',
            anchor: validAnchor,
            requestedBodyRef: 'shadow:renderer:that-does-not-exist'
        }),
        /not a declared native body/
    );
});

test('deep M4 fails closed unless the existing parent authority is protected-local', () => {
    const base = {
        parentProductId: 'epi.personal.450',
        subjectRef: 'epi:personal:protected:example',
        coordinate: "M4'",
        provenanceRefs: ['epi:provenance:protected']
    };

    assert.throws(
        () => runtime.resolveDeepOpen({
            actionRef: runtime.DEEP_OPEN_ACTION,
            requestedProductId: 'epi.deep.m4',
            anchor: { ...base, privacyClass: 'public_current' }
        }),
        /selection is not disclosure/
    );

    const protectedAnchor = {
        ...base,
        privacyClass: 'protected_local_handle_only'
    };
    const resolution = runtime.resolveDeepOpen({
        actionRef: runtime.DEEP_OPEN_ACTION,
        requestedProductId: 'epi.deep.m4',
        anchor: protectedAnchor
    });
    assert.equal(resolution.anchor, protectedAnchor);
    assert.equal(resolution.descriptor.requiredCapability, 'epi.capability.deep.m4.protected');
});

test('human and Agent projections share one semantic/action field without DOM scraping', () => {
    const protocol = runtime.DEEP_AGENT_NATIVE_PROTOCOL;
    assert.deepEqual(protocol.canonicalActions, [
        runtime.DEEP_OPEN_ACTION,
        runtime.DEEP_FOCUS_ACTION,
        runtime.DEEP_RETURN_ACTION
    ]);
    assert.equal(protocol.humanProjection, 'native-surface');
    assert.equal(protocol.agentProjection, 'structured-native-action');
    assert.equal(protocol.domScrapingRequired, false);
    assert.equal(protocol.selectionConfersDisclosure, false);
    assert.equal(protocol.hostMayMintSemanticSubject, false);
    assert.equal(protocol.readinessAndProvenanceShared, true);

    const anchor = {
        parentProductId: 'epi.cosmic.123',
        eventRef: 'epi:event:agent-parity',
        coordinate: "M2'",
        provenanceRefs: ['epi:provenance:agent-parity'],
        privacyClass: 'public_current_with_pending_private_projection_blocks'
    };
    const address = runtime.addressDeepProductForAgent(
        'epi.deep.m2',
        anchor,
        runtime.DEEP_OPEN_ACTION
    );
    assert.equal(address.anchor, anchor);
    assert.equal(address.productId, 'epi.deep.m2');
    assert.equal(address.actionRef, runtime.DEEP_OPEN_ACTION);
});
