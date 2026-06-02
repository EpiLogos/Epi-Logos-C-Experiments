// 08.T7 verification suite. Proves:
//
//   (1) Deep-link format → parse round-trips selectedCoordinate / profile
//       generation / session / DAY-NOW / privacy scope / intended inspector
//       for both plugin routes (cosmic-engine + jiva-siva).
//   (2) Invalid deep links throw a typed error rather than silently
//       producing a default.
//   (3) Workspace snapshot scrubbing strips known protected-body field
//       patterns from the extras bag at serialize time; clean fields
//       pass through unchanged. detectProtectedKeysInSnapshot catches
//       any leak BEFORE persistence.
//   (4) Round-trip serialize → deserialize preserves layout + active plugin
//       + selected coordinate + mini-inspector owners + intended inspector
//       + privacy scope without leaking protected bodies.
//   (5) Omni-panel routing maps shell-0 → cosmic-engine and shell-1 → jiva-siva;
//       M1-M3 alerts → cosmic-engine; M0/M4/M5 alerts → jiva-siva.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    EMPTY_WORKSPACE_SNAPSHOT,
    InvalidIntegratedDeepLinkError,
    deepLinkForPlugin,
    deserializeSnapshot,
    detectProtectedKeysInSnapshot,
    formatIntegratedDeepLink,
    omniPanelTargetFor,
    parseIntegratedDeepLink,
    scrubProtectedFromSnapshot,
    serializeSnapshot
} = require('../integrated-composition/lib/common/index.js');

// ---- deep links ----------------------------------------------------------

test('cosmic-engine deep link format → parse round-trips all 5 typed fields', () => {
    const original = {
        routeName: 'cosmic-engine',
        pluginId: 'plugin-integrated-1-2-3',
        selectedCoordinate: 'M3.2',
        profileGeneration: 7,
        s3SessionHandle: 's.abc',
        s3DayNowHandle: 'dn.42',
        privacyScope: 'public_current_with_pending_private_projection_blocks',
        intendedInspector: 'm3-codon'
    };
    const url = formatIntegratedDeepLink(original);
    assert.ok(url.startsWith('epi-logos://ide/integrated/cosmic-engine?'));
    const parsed = parseIntegratedDeepLink(url);
    assert.equal(parsed.routeName, 'cosmic-engine');
    assert.equal(parsed.pluginId, 'plugin-integrated-1-2-3');
    assert.equal(parsed.selectedCoordinate, 'M3.2');
    assert.equal(parsed.profileGeneration, 7);
    assert.equal(parsed.s3SessionHandle, 's.abc');
    assert.equal(parsed.s3DayNowHandle, 'dn.42');
    assert.equal(parsed.intendedInspector, 'm3-codon');
});

test('jiva-siva deep link format → parse round-trips and is frozen', () => {
    const original = {
        routeName: 'jiva-siva',
        pluginId: 'plugin-integrated-4-5-0',
        selectedCoordinate: 'M4.0',
        profileGeneration: 99,
        s3SessionHandle: 's.beta',
        s3DayNowHandle: 'dn.99',
        privacyScope: 'protected_local_handle_only',
        intendedInspector: 'm4-field-foreground'
    };
    const url = formatIntegratedDeepLink(original);
    const parsed = parseIntegratedDeepLink(url);
    assert.equal(parsed.pluginId, 'plugin-integrated-4-5-0');
    assert.equal(parsed.privacyScope, 'protected_local_handle_only');
    assert.equal(Object.isFrozen(parsed), true);
});

test('deep link with no query params parses to null fields', () => {
    const url = formatIntegratedDeepLink({
        routeName: 'cosmic-engine',
        selectedCoordinate: null,
        profileGeneration: null,
        s3SessionHandle: null,
        s3DayNowHandle: null,
        privacyScope: null,
        intendedInspector: null
    });
    assert.equal(url, 'epi-logos://ide/integrated/cosmic-engine');
    const parsed = parseIntegratedDeepLink(url);
    assert.equal(parsed.selectedCoordinate, null);
    assert.equal(parsed.profileGeneration, null);
});

test('invalid scheme throws InvalidIntegratedDeepLinkError', () => {
    assert.throws(
        () => parseIntegratedDeepLink('https://example.com/x'),
        InvalidIntegratedDeepLinkError
    );
});

test('invalid route name throws', () => {
    assert.throws(
        () => parseIntegratedDeepLink('epi-logos://ide/integrated/unknown'),
        InvalidIntegratedDeepLinkError
    );
});

test('invalid inspector throws', () => {
    assert.throws(
        () =>
            parseIntegratedDeepLink(
                'epi-logos://ide/integrated/cosmic-engine?inspector=invalid'
            ),
        InvalidIntegratedDeepLinkError
    );
});

test('invalid profile_generation throws', () => {
    assert.throws(
        () =>
            parseIntegratedDeepLink(
                'epi-logos://ide/integrated/cosmic-engine?profile_generation=abc'
            ),
        InvalidIntegratedDeepLinkError
    );
});

test('deepLinkForPlugin picks the correct route name for the plugin id', () => {
    const ce = deepLinkForPlugin('plugin-integrated-1-2-3', {
        selectedCoordinate: null,
        profileGeneration: null,
        s3SessionHandle: null,
        s3DayNowHandle: null,
        privacyScope: null,
        intendedInspector: null
    });
    assert.equal(ce.routeName, 'cosmic-engine');
    const js = deepLinkForPlugin('plugin-integrated-4-5-0', {
        selectedCoordinate: null,
        profileGeneration: null,
        s3SessionHandle: null,
        s3DayNowHandle: null,
        privacyScope: null,
        intendedInspector: null
    });
    assert.equal(js.routeName, 'jiva-siva');
});

// ---- workspace persistence ----------------------------------------------

test('workspace snapshot scrubs known protected body fields from extras', () => {
    const dirty = Object.freeze({
        ...EMPTY_WORKSPACE_SNAPSHOT,
        extras: Object.freeze({
            bioquaternion_raw: [0.1, 0.2, 0.3, 0.4],
            nara_journal_text: 'this should be stripped',
            graphiti_body: 'episode body bytes',
            q_personal: { v: 1 },
            identity_quaternion_internals: { x: 1 },
            keep_this: 'safe value',
            kept_layout_hint: { open: true }
        })
    });
    const scrubbed = scrubProtectedFromSnapshot(dirty);
    const extras = scrubbed.extras;
    assert.equal('bioquaternion_raw' in extras, false);
    assert.equal('nara_journal_text' in extras, false);
    assert.equal('graphiti_body' in extras, false);
    assert.equal('q_personal' in extras, false);
    assert.equal('identity_quaternion_internals' in extras, false);
    assert.equal(extras.keep_this, 'safe value');
    assert.deepEqual(extras.kept_layout_hint, { open: true });
});

test('detectProtectedKeysInSnapshot lists every forbidden key without mutating', () => {
    const dirty = Object.freeze({
        ...EMPTY_WORKSPACE_SNAPSHOT,
        extras: Object.freeze({
            bioquaternion_raw: 'x',
            normal: 'safe',
            nested: { q_nara: 'y' }
        })
    });
    const violations = detectProtectedKeysInSnapshot(dirty);
    assert.ok(violations.length >= 2);
    assert.ok(violations.some(v => v.includes('bioquaternion_raw')));
    assert.ok(violations.some(v => v.includes('q_nara')));
});

test('serialize → deserialize round-trip preserves clean snapshot', () => {
    const snapshot = Object.freeze({
        ...EMPTY_WORKSPACE_SNAPSHOT,
        activePluginId: 'plugin-integrated-1-2-3',
        layoutId: 'cosmic-engine.integrated',
        miniInspectorOwners: Object.freeze(['m2-parashakti', 'm1-paramasiva']),
        selectedCoordinate: 'M3.4',
        visibleEvidencePanelIds: Object.freeze(['cosmic-engine-snapshot']),
        lastEpiiReviewMode: 'closed',
        lastIntendedInspector: 'm3-codon',
        lastPrivacyScope: 'public_current',
        lastUpdatedAt: 1000,
        extras: Object.freeze({ ui_zoom: 1.2, kept_layout_hint: { open: true } })
    });
    const serialized = serializeSnapshot(snapshot);
    const restored = deserializeSnapshot(serialized);
    assert.equal(restored.activePluginId, snapshot.activePluginId);
    assert.equal(restored.layoutId, snapshot.layoutId);
    assert.deepEqual([...restored.miniInspectorOwners], [...snapshot.miniInspectorOwners]);
    assert.equal(restored.selectedCoordinate, 'M3.4');
    assert.equal(restored.lastIntendedInspector, 'm3-codon');
    assert.equal(restored.extras.ui_zoom, 1.2);
});

test('serialize never persists protected fields even when present in extras', () => {
    const dirty = Object.freeze({
        ...EMPTY_WORKSPACE_SNAPSHOT,
        extras: Object.freeze({
            bioquaternion_raw: [0.1, 0.2],
            normal_field: 'safe'
        })
    });
    const serialized = serializeSnapshot(dirty);
    assert.equal(serialized.includes('bioquaternion_raw'), false);
    assert.ok(serialized.includes('normal_field'));
});

// ---- omni panel ---------------------------------------------------------

test('shell-0 routes to cosmic-engine plugin', () => {
    const target = omniPanelTargetFor({ kind: 'shell', shellId: 'shell-0' });
    assert.equal(target.pluginId, 'plugin-integrated-1-2-3');
    assert.equal(target.deepLink.routeName, 'cosmic-engine');
    assert.ok(target.deepLinkUrl.includes('cosmic-engine'));
});

test('shell-1 routes to jiva-siva plugin', () => {
    const target = omniPanelTargetFor({ kind: 'shell', shellId: 'shell-1' });
    assert.equal(target.pluginId, 'plugin-integrated-4-5-0');
    assert.equal(target.deepLink.routeName, 'jiva-siva');
});

test('M1/M2/M3 alerts route to cosmic-engine', () => {
    for (const alertKind of ['m1.walk.step', 'm2.meaning_packet', 'm3.codon_projection']) {
        const target = omniPanelTargetFor({ kind: 'alert', alertKind });
        assert.equal(target.pluginId, 'plugin-integrated-1-2-3',
            `${alertKind} must map to cosmic-engine`);
    }
});

test('M0/M4/M5 alerts route to jiva-siva', () => {
    for (const alertKind of [
        'm0.graph.provenance', 'm0.review.requested',
        'm4.artifact.created', 'm4.privacy.blocked',
        'm5.review.transition', 'm5.spine.event'
    ]) {
        const target = omniPanelTargetFor({ kind: 'alert', alertKind });
        assert.equal(target.pluginId, 'plugin-integrated-4-5-0',
            `${alertKind} must map to jiva-siva`);
    }
});

test('omni-panel target carries selected coordinate + profile generation through to deep link', () => {
    const target = omniPanelTargetFor(
        { kind: 'shell', shellId: 'shell-0' },
        { selectedCoordinate: 'M2.3', profileGeneration: 11, s3SessionHandle: 's', s3DayNowHandle: 'd' }
    );
    assert.equal(target.deepLink.selectedCoordinate, 'M2.3');
    assert.equal(target.deepLink.profileGeneration, 11);
    assert.ok(target.deepLinkUrl.includes('coordinate=M2.3'));
});
