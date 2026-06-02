// Track 05 T8 — evidence envelope.
//
// Verifies the load-bearing fields the M5 review surface + Track 04
// epii-review-core expect: candidate id, coordinate, source/graph/test
// anchors, review id, profile generation, bridge readiness, session key,
// DAY/NOW context.
//
// The plan body specifies: "Evidence tests prove source/graph/review/test/
// profile/DAY-NOW/session/bridge-readiness refs survive reload." T9 adds
// the persistence-survives-reload assertion; this test covers the
// composition + completeness check.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    buildEvidenceEnvelope,
    buildMediatedRunEvidencePacket,
    isMediationCapabilityAllowed,
    missingEvidenceFields,
    REQUIRED_EVIDENCE_FIELDS,
    REQUIRED_MEDIATED_EVIDENCE_FIELDS
} = require('../lib/common/run-model.js');

test('buildEvidenceEnvelope fills nulls for any missing field', () => {
    const env = buildEvidenceEnvelope({ candidateId: 'cand-1' });
    assert.equal(env.candidateId, 'cand-1');
    assert.equal(env.coordinate, null);
    assert.equal(env.sourceAnchor, null);
    assert.equal(env.graphAnchor, null);
    assert.equal(env.testAnchor, null);
    assert.equal(env.reviewId, null);
    assert.equal(env.profileGeneration, null);
    assert.equal(env.bridgeReadinessHandle, null);
    assert.equal(env.sessionKey, null);
    assert.equal(env.dayNowContext, null);
    assert.equal(env.privacyClass, 'safe-public-current-kernel-tick');
});

test('missingEvidenceFields lists every required field when envelope is empty', () => {
    const env = buildEvidenceEnvelope({ candidateId: 'cand-2' });
    const missing = missingEvidenceFields(env);
    // candidateId is always set; the other required fields should be missing.
    assert.ok(!missing.includes('candidateId'));
    for (const field of REQUIRED_EVIDENCE_FIELDS.filter(f => f !== 'candidateId')) {
        assert.ok(missing.includes(field), `${field} should be reported as missing`);
    }
});

test('fully populated envelope reports no missing fields', () => {
    const env = buildEvidenceEnvelope({
        candidateId: 'cand-3',
        coordinate: 'M5.epii.improve-1',
        artifactUri: 'file:///vault/Notes/M5/improve-1.md',
        sourceAnchor: 'Body/S/S5/epii-review-core/src/lib.rs#L42',
        specAnchor: 'docs/spec/review.md#L20',
        codeAnchor: 'src/improve.rs#L100',
        testAnchor: 'tests/improve_test.rs#L30',
        graphAnchor: 'M5.epii.improve-1',
        reviewId: 'rev-2026-06-01-001',
        profileGeneration: 42,
        bridgeReadinessHandle: 'bridge-ready-12',
        sessionKey: 'session-abc-xyz',
        dayNowContext: '2026-06-01/NOW-session-3'
    });
    const missing = missingEvidenceFields(env);
    assert.deepEqual(missing, []);
});

test('partially populated envelope reports only the missing fields', () => {
    const env = buildEvidenceEnvelope({
        candidateId: 'cand-4',
        coordinate: 'M5.epii',
        sourceAnchor: 'Body/S/S5/foo.rs',
        graphAnchor: 'M5.epii',
        reviewId: 'rev-4',
        testAnchor: 'tests/foo_test.rs',
        profileGeneration: 12,
        bridgeReadinessHandle: 'br-12'
        // session + day-now missing
    });
    const missing = missingEvidenceFields(env);
    assert.deepEqual(missing.sort(), ['dayNowContext', 'sessionKey']);
});

test('privacy class defaults are surfaced; explicit values pass through', () => {
    const a = buildEvidenceEnvelope({ candidateId: 'a' });
    const b = buildEvidenceEnvelope({ candidateId: 'b', privacyClass: 'public_current_with_graph_provenance' });
    assert.equal(a.privacyClass, 'safe-public-current-kernel-tick');
    assert.equal(b.privacyClass, 'public_current_with_graph_provenance');
});

test('mediated evidence packet assembles real S0/S1/S2/S3/S5 refs without protected bodies', () => {
    const packet = buildMediatedRunEvidencePacket({
        candidateId: 'cand-mediated-1',
        coordinate: 'M5-4.agentic-control-room',
        currentProfile: {
            source: 's0.current_profile',
            generation: 42,
            readiness: { bridge: 'ready', profile: 'live' },
            profileHandle: 's0://profile/42'
        },
        graphContext: {
            source: 's2.graph_services',
            namespace: 'bimba',
            coordinate: 'M5-4.agentic-control-room',
            graphAnchor: 's2://bimba/M5-4.agentic-control-room',
            relationRefs: ['s2://rel/source-spec-code-test/001']
        },
        sessionRuntime: {
            source: 's3.gateway',
            sessionKey: 'agentic-run-session',
            dayId: '2026-06-01',
            nowPath: 'Idea/Empty/Present/01-06-2026/20260601-235723-09T3/now.md',
            gatewayRunRef: 's3://runs/agentic-run-session',
            runtimeRefs: ['spacetimedb://session/agentic-run-session/world_clock/42']
        },
        graphitiProtectedHandles: [
            {
                handle: 'graphiti://protected/episode/abc',
                namespace: 'pratibimba',
                privacyClass: 'protected-private',
                summary: 'protected episode handle only'
            }
        ],
        vaultRefs: [
            {
                method: "s1.vault.read_file",
                uri: 'vault://Idea/Bimba/Seeds/M/M5%27/M5%27-SPEC.md',
                capability: "s1.vault.read_file",
                governance: 'read_only'
            }
        ],
        semanticCandidates: {
            source: 's1.semantic.suggest_links',
            responseType: 'LinkCandidateResponse',
            requestRef: 's1://semantic/request/m5-4',
            candidates: [
                {
                    target: '[[M5-4]]',
                    score: 0.91,
                    sourceBlock: 'block://m5-spec/evidence-panel',
                    reason: 'candidate returned by Smart Connections semantic index'
                }
            ]
        },
        s5Refs: {
            source: 's5.persisted_store',
            candidateRef: 's5://candidate/cand-mediated-1',
            reviewRef: 's5://review/rev-mediated-1',
            improvementRef: 's5://improve/run-mediated-1',
            persistedStoreDtoRef: 's5://fixtures/real-persisted-dto/run-mediated-1'
        }
    });

    assert.equal(packet.candidateId, 'cand-mediated-1');
    assert.equal(packet.profileGeneration, 42);
    assert.equal(packet.graphAnchor, 's2://bimba/M5-4.agentic-control-room');
    assert.equal(packet.sessionKey, 'agentic-run-session');
    assert.equal(packet.dayNowContext, '2026-06-01::Idea/Empty/Present/01-06-2026/20260601-235723-09T3/now.md');
    assert.equal(packet.semanticCandidates.responseType, 'LinkCandidateResponse');
    assert.deepEqual(packet.graphitiProtectedHandles.map(h => h.handle), ['graphiti://protected/episode/abc']);
    assert.deepEqual(missingEvidenceFields(packet), []);
    for (const field of REQUIRED_MEDIATED_EVIDENCE_FIELDS) {
        assert.notEqual(packet[field], undefined, `${field} should be present on mediated packets`);
    }
    assert.equal(JSON.stringify(packet).includes('protected episode body'), false);
});

test('mediated evidence packet rejects fabricated profile, semantic, and S5 sources', () => {
    const base = {
        candidateId: 'cand-mediated-2',
        currentProfile: { source: 's0.current_profile', generation: 1, readiness: {}, profileHandle: 's0://profile/1' },
        graphContext: { source: 's2.graph_services', namespace: 'bimba', coordinate: 'M5-4', graphAnchor: 's2://bimba/M5-4' },
        sessionRuntime: { source: 's3.gateway', sessionKey: 's', dayId: '2026-06-01', nowPath: 'Idea/Empty/Present/01-06-2026/now.md' },
        semanticCandidates: {
            source: 's1.semantic.suggest_links',
            responseType: 'LinkCandidateResponse',
            requestRef: 's1://semantic/request/ok',
            candidates: [{ target: '[[M5]]', score: 0.7, sourceBlock: 'block://ok' }]
        },
        s5Refs: {
            source: 's5.persisted_store',
            candidateRef: 's5://candidate/cand-mediated-2',
            persistedStoreDtoRef: 's5://dto/cand-mediated-2'
        }
    };

    assert.throws(
        () => buildMediatedRunEvidencePacket({ ...base, currentProfile: { ...base.currentProfile, source: 'hand-authored' } }),
        /currentProfile.source must be s0.current_profile/
    );
    assert.throws(
        () => buildMediatedRunEvidencePacket({
            ...base,
            semanticCandidates: { ...base.semanticCandidates, responseType: 'ArrayOfLinks' }
        }),
        /semanticCandidates.responseType must be LinkCandidateResponse/
    );
    assert.throws(
        () => buildMediatedRunEvidencePacket({ ...base, s5Refs: { ...base.s5Refs, source: 'fixture-only' } }),
        /s5Refs.source must be s5.persisted_store/
    );
});

test('mediated evidence packet rejects protected body payloads before dispatch', () => {
    assert.throws(
        () => buildMediatedRunEvidencePacket({
            candidateId: 'cand-mediated-3',
            currentProfile: { source: 's0.current_profile', generation: 1, readiness: {}, profileHandle: 's0://profile/1' },
            graphContext: { source: 's2.graph_services', namespace: 'bimba', coordinate: 'M5-4', graphAnchor: 's2://bimba/M5-4' },
            sessionRuntime: { source: 's3.gateway', sessionKey: 's', dayId: '2026-06-01', nowPath: 'Idea/Empty/Present/01-06-2026/now.md' },
            graphitiProtectedHandles: [{
                handle: 'graphiti://protected/episode/body-leak',
                namespace: 'pratibimba',
                privacyClass: 'protected-private',
                body: 'protected episode body must not enter evidence'
            }],
            semanticCandidates: {
                source: 's1.semantic.suggest_links',
                responseType: 'LinkCandidateResponse',
                requestRef: 's1://semantic/request/ok',
                candidates: [{ target: '[[M5]]', score: 0.7, sourceBlock: 'block://ok' }]
            },
            s5Refs: {
                source: 's5.persisted_store',
                candidateRef: 's5://candidate/cand-mediated-3',
                persistedStoreDtoRef: 's5://dto/cand-mediated-3'
            }
        }),
        /protected Graphiti\/Nara body fields are not permitted/
    );
});

test('mediation capability allowlist separates read-only, deposit, and user-final vault writes', () => {
    assert.equal(isMediationCapabilityAllowed('sophia', 's1.semantic.suggest_links').allowed, true);
    assert.equal(isMediationCapabilityAllowed('aletheia', 's1.vault.read_file').allowed, true);
    assert.equal(isMediationCapabilityAllowed('pi', 's1.vault.append_block').allowed, true);
    assert.equal(isMediationCapabilityAllowed('sophia', 's1.vault.append_block').allowed, false);
    assert.equal(isMediationCapabilityAllowed('pi', 's1.vault.write_file').allowed, false);
    assert.equal(
        isMediationCapabilityAllowed('human', 's1.vault.write_file', { userFinalValidated: true }).allowed,
        true
    );
    assert.equal(isMediationCapabilityAllowed('anima', 'invokeGatewayRpc').allowed, true);
    assert.equal(isMediationCapabilityAllowed('anima', 'directFsVaultWrite').allowed, false);
});
