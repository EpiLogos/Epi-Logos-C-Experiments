// 08.T5 verification suite. Proves:
//
//   (1) Default 4/5/0 rendering contains only handles, summaries, readiness,
//       and visual state — protected bodies live behind the consent gate
//       and never appear in the default field list.
//   (2) Missing consent record blocks shared-archetype publishing AND raw
//       Graphiti body inspection.
//   (3) Missing GDS overlay marks blocked rather than fabricating clusters.
//   (4) No-local-tables: plugin source contains no q_personal / q_nara /
//       bioquaternion / planet / pitch / chakra / tarot tables.
//   (5) 4/5/0 envelopes route through the privacy scrubber with the correct
//       forbidden field set (different from 1-2-3 — opaque handles are OK).

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    ALL_CONSENT_ACTIONS,
    ConsentExpiredError,
    ConsentGate,
    ConsentMissingError,
    JIVA_SIVA_DEEP_ACTIONS,
    JIVA_SIVA_PANE_FIELD_GROUPS,
    PENDING_INTEGRATED_VIEW_STATE,
    checkJivaSivaPanes,
    JIVA_SIVA_LAYOUT,
    PrivacyViolationError,
    produceAllAvailableEnvelopes,
    validateEvidenceEnvelopeForRange
} = require('../integrated-composition/lib/common/index.js');

const PLUGIN_SOURCE_ROOT =
    '/Users/admin/Documents/Epi-Logos C Experiments/Idea/Pratibimba/System/extensions/plugin-integrated-4-5-0/src';

function readyProfile(generation, overrides = {}) {
    return {
        generation,
        pointerAnchor: 'pointer://test',
        capabilities: [],
        payload: {
            bedrock_link: 'bedrock://m4.handle.abc',
            selected_coordinate: 'M4.0',
            activity_resonance_dots: { dots: 3 },
            field_state_summary: 'incubating',
            gds_clusters: { count: 7 },
            m0_coordinate_provenance: { source: 'bimba' },
            review_queue_count: 4,
            continuity_handle: 'continuity://h.42',
            last_canon_recognition_event: { kind: 'jiva-is-siva', at: 1 },
            ...overrides
        }
    };
}

// ---- pane availability and default-only fields ---------------------------

test('all 9 public-safe fields visible to default render are handle/summary names — never raw body names', () => {
    // Sanity guard: the field list itself doesn't carry forbidden names. If
    // a future edit accidentally lists `nara_body` or `q_personal` as a
    // public-safe field, this test fails loudly.
    const allFields = [
        ...JIVA_SIVA_PANE_FIELD_GROUPS['m4-field-foreground'],
        ...JIVA_SIVA_PANE_FIELD_GROUPS['m0-graph-backdrop'],
        ...JIVA_SIVA_PANE_FIELD_GROUPS['m5-review-side']
    ];
    const forbiddenSubstrings = [
        'body', 'raw', 'plaintext', 'q_personal', 'q_nara', 'bioquaternion',
        'journal'
    ];
    for (const field of allFields) {
        for (const bad of forbiddenSubstrings) {
            assert.ok(
                !field.includes(bad),
                `public-safe field name ${field} must not contain forbidden substring ${bad}`
            );
        }
    }
    assert.equal(allFields.length, 9);
});

test('all three jiva-siva panes share one profile generation when rendered', () => {
    const profile = readyProfile(33);
    const panes = checkJivaSivaPanes(profile);
    assert.equal(panes.m4Foreground.profileGeneration, 33);
    assert.equal(panes.m0Backdrop.profileGeneration, 33);
    assert.equal(panes.m5Side.profileGeneration, 33);
    assert.equal(panes.m4Foreground.allFieldsPresent, true);
    assert.equal(panes.m0Backdrop.allFieldsPresent, true);
    assert.equal(panes.m5Side.allFieldsPresent, true);
});

test('missing GDS overlay marks M0 backdrop blocked, not fabricated', () => {
    const profile = readyProfile(1);
    delete profile.payload.gds_clusters;
    const panes = checkJivaSivaPanes(profile);
    assert.equal(panes.m0Backdrop.allFieldsPresent, false);
    assert.deepEqual(panes.m0Backdrop.missingFields, ['gds_clusters']);
    const gds = panes.m0Backdrop.fields.find(f => f.field === 'gds_clusters');
    assert.equal(gds.present, false);
    assert.match(gds.ownerTrack, /Track 02 S2 GDS overlay/);
    // Other panes unaffected.
    assert.equal(panes.m4Foreground.allFieldsPresent, true);
    assert.equal(panes.m5Side.allFieldsPresent, true);
});

test('jiva-siva layout names M4 center, M5 side, M0 mini-inspector', () => {
    assert.equal(JIVA_SIVA_LAYOUT.centerStageOwner, 'm4-nara');
    assert.equal(JIVA_SIVA_LAYOUT.sidePanelOwner, 'm5-epii');
    assert.equal(JIVA_SIVA_LAYOUT.audioBusOwner, null);
    assert.deepEqual(
        [...JIVA_SIVA_LAYOUT.miniInspectorOwners].sort(),
        ['m0-anuttara', 'm5-epii']
    );
});

// ---- ConsentGate ---------------------------------------------------------

test('ConsentGate.require throws ConsentMissingError when no record on file', () => {
    const gate = new ConsentGate({ nowProvider: () => 1000 });
    assert.throws(() => gate.require('open-graphiti-body'), ConsentMissingError);
    assert.throws(() => gate.require('publish-shared-archetype'), ConsentMissingError);
});

test('ConsentGate.require throws ConsentExpiredError after expiresAt', () => {
    const gate = new ConsentGate({ nowProvider: () => 2000 });
    gate.recordConsent({
        action: 'open-graphiti-body',
        consentedAt: 1000,
        scope: 'this-session',
        expiresAt: 1500,
        justification: 'fixture'
    });
    assert.throws(() => gate.require('open-graphiti-body'), ConsentExpiredError);
});

test('ConsentGate accepts unexpired records and rejects revoked', () => {
    const gate = new ConsentGate({ nowProvider: () => 1000 });
    gate.recordConsent({
        action: 'publish-shared-archetype',
        consentedAt: 999,
        scope: 'this-day',
        expiresAt: 5000,
        justification: 'fixture'
    });
    assert.doesNotThrow(() => gate.require('publish-shared-archetype'));
    assert.equal(gate.isPermitted('publish-shared-archetype'), true);
    gate.revoke('publish-shared-archetype');
    assert.equal(gate.isPermitted('publish-shared-archetype'), false);
    assert.throws(() => gate.require('publish-shared-archetype'), ConsentMissingError);
});

test('all 5 named consent actions match JIVA_SIVA_DEEP_ACTIONS', () => {
    assert.deepEqual([...ALL_CONSENT_ACTIONS].sort(), [...JIVA_SIVA_DEEP_ACTIONS].sort());
});

// ---- Privacy scrubber for 4/5/0 -----------------------------------------

test('4/5/0 envelope with bioquaternion_raw still fails the scrubber', () => {
    // The producer module only ships 1-2-3 envelopes (rangeId='1-2-3').
    // The scrubber test must construct a 4/5/0-shaped envelope directly so
    // we can exercise the range-specific forbidden set.
    const fourFiveZeroEnvelope = Object.freeze({
        envelopeId: 'env-450-1',
        emittedAt: 1,
        producerId: 'cosmic-engine-snapshot',
        rangeId: '4-5-0',
        pluginId: 'plugin-integrated-4-5-0',
        profileGeneration: 1,
        worldClockGeneration: 1,
        s2ProvenanceHandles: ['h1'],
        s3SessionHandle: null,
        s3DayNowHandle: null,
        s5ReviewTarget: {
            targetKind: 's5.review.target.routine',
            targetId: 's5.review.routine.fixture',
            reason: 'fixture'
        },
        privacyClass: 'protected_local_handle_only',
        sourceSpecAnchors: [],
        requiresHumanFinalValidation: false,
        payload: Object.freeze({ bioquaternion_raw: [0.1, 0.2, 0.3, 0.4] })
    });
    assert.throws(
        () => validateEvidenceEnvelopeForRange(fourFiveZeroEnvelope),
        /bioquaternion_raw/
    );
});

test('4/5/0 envelope with opaque protected handle passes the scrubber', () => {
    // Opaque handles (Graphiti episode IDs etc.) are LEGAL in 4/5/0 — only
    // raw body content is forbidden. This is what distinguishes 4/5/0 from
    // 1-2-3 in the privacy contract.
    const safe450 = Object.freeze({
        envelopeId: 'env-450-2',
        emittedAt: 1,
        producerId: 'cosmic-engine-snapshot',
        rangeId: '4-5-0',
        pluginId: 'plugin-integrated-4-5-0',
        profileGeneration: 1,
        worldClockGeneration: 1,
        s2ProvenanceHandles: ['h1'],
        s3SessionHandle: 's-1',
        s3DayNowHandle: 'd-1',
        s5ReviewTarget: {
            targetKind: 's5.review.target.routine',
            targetId: 's5.review.routine.fixture',
            reason: 'fixture'
        },
        privacyClass: 'protected_local_handle_only',
        sourceSpecAnchors: [],
        requiresHumanFinalValidation: false,
        payload: Object.freeze({
            graphiti_handle: 'graphiti://episode.42',
            review_target_handle: 's5.review.handle.abc'
        })
    });
    assert.doesNotThrow(() => validateEvidenceEnvelopeForRange(safe450));
});

// ---- No-local-tables discipline -----------------------------------------

const FORBIDDEN_LITERAL_PATTERNS = [
    /\[\s*(?:-?\d+(?:\.\d+)?\s*,\s*){7,}-?\d+(?:\.\d+)?\s*\]/,
    /(q_personal|q_nara|bioquaternion|naraJournal|graphitiBody)[A-Z_a-z]*\s*[:=]\s*\[/,
    /(naraJournalTable|graphitiEpisodeTable|identityQuaternionTable)\b/
];

function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        if (entry === 'lib' || entry === 'node_modules') continue;
        const full = join(dir, entry);
        const stats = statSync(full);
        if (stats.isDirectory()) out.push(...walk(full));
        else if (['.ts', '.tsx', '.mjs', '.js'].includes(extname(entry))) out.push(full);
    }
    return out;
}

test('plugin-integrated-4-5-0 source contains no q_personal / q_nara / bioquaternion local tables', () => {
    const files = walk(PLUGIN_SOURCE_ROOT);
    assert.ok(files.length >= 3);
    const offenses = [];
    for (const file of files) {
        const content = readFileSync(file, 'utf8');
        for (const pattern of FORBIDDEN_LITERAL_PATTERNS) {
            if (pattern.test(content)) offenses.push({ file, pattern: pattern.source });
        }
    }
    assert.deepEqual(offenses, [], `local-table offenses: ${JSON.stringify(offenses, null, 2)}`);
});
