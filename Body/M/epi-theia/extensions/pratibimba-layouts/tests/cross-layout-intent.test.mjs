import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
    intentTargetCommandId,
    intentTargetsExtensionContribution
} = require('../lib/common/cross-layout-intent.js');

const sixMExtensionTargets = [
    ['m0-anuttara', 'coordinate'],
    ['m1-paramasiva', 'walk'],
    ['m2-parashakti', 'meaning-packet'],
    ['m3-mahamaya', 'codon'],
    ['m4-nara', 'artifact'],
    ['m5-epii', 'review']
];

test('CrossLayoutIntent requested extension and contribution address each M-extension target', () => {
    for (const [requestedExtensionId, requestedContributionId] of sixMExtensionTargets) {
        const intent = buildIntent({ requestedExtensionId, requestedContributionId });

        assert.equal(
            intentTargetsExtensionContribution(intent, requestedExtensionId, requestedContributionId),
            true,
            `${requestedExtensionId}/${requestedContributionId} must accept its own intent`
        );
        assert.equal(
            intentTargetCommandId(intent),
            `pratibimba.${requestedExtensionId}.${requestedContributionId}.open`
        );
    }
});

test('CrossLayoutIntent target matching rejects cross-extension and cross-contribution drift', () => {
    const intent = buildIntent({
        requestedExtensionId: 'm3-mahamaya',
        requestedContributionId: 'codon'
    });

    assert.equal(
        intentTargetsExtensionContribution(intent, 'm3-mahamaya', 'codon'),
        true
    );
    assert.equal(
        intentTargetsExtensionContribution(intent, 'm3-mahamaya', 'wheel'),
        false
    );
    assert.equal(
        intentTargetsExtensionContribution(intent, 'm2-parashakti', 'codon'),
        false
    );
});

function buildIntent(overrides = {}) {
    return {
        coordinate: 'M3-1-0-13',
        artifactUri: null,
        reviewId: null,
        dayNow: '2026-06-17',
        sessionKey: 'agent:epii:main',
        profileGeneration: 472,
        privacyClass: 'public',
        requestedLayout: 'ide-deep',
        requestedExtensionId: null,
        requestedContributionId: null,
        ...overrides
    };
}
