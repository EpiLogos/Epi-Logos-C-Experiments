// 07.T10 acceptance suite. Drives one real first-slice route through all six
// individual extension packages, including persisted M4 Nara and M5 review
// stores, then assembles the cross-extension observability/readiness report.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildM0InspectorModel } = require('../m0-anuttara/lib/common/index.js');
const {
    buildM1ProfileClockModel,
    buildM1RelationWalkStep
} = require('../m1-paramasiva/lib/common/clock-instrument.js');
const {
    TRACK_08_CONTRIBUTION: M1_CONTRIBUTION
} = require('../m1-paramasiva/lib/common/index.js');
const { buildM2PrimeMeaningPacket } = require('../m2-parashakti/lib/common/index.js');
const { buildM3ProjectionSurface } = require('../m3-mahamaya/lib/common/index.js');
const {
    buildM4NaraSurface,
    createGraphitiEpisode,
    createNaraArtifact,
    readNaraDayContainer
} = require('../m4-nara/lib/common/index.js');
const {
    buildM5EpiiSurface,
    createImprovementRun,
    createS5ReviewItem,
    depositVakCompletionEvidence,
    readS5ReviewSnapshot
} = require('../m5-epii/lib/common/index.js');

const baselineProfile = JSON.parse(
    readFileSync(
        '/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/portal-core/contract-inventory/baseline-profile.json',
        'utf8'
    )
);

const readiness = Object.freeze({
    fetchedAt: 1,
    state: 'ready',
    reason: 'acceptance harness',
    profileGeneration: 88,
    bridgeReachable: true,
    blockerIds: []
});

const context = Object.freeze({
    selectedCoordinate: 'M4.0',
    canonicalMCoordinate: 'M4',
    hashInput: '#4',
    dayNowSessionHandle: 's3://session/day-now-acceptance',
    privacyClass: 'protected_local_handle_only'
});

// One self-consistent kernel frame, shared by profile() and worldClock() so the
// two can never drift (a drift between them was the original M3 surface blocker).
// Derived per portal-core kernel.rs MathemeHarmonicProfile::from_tick for
// KernelTick { cycle: 0, sub_tick: 4 }: tick12 = 4, degree720 = tick12 * 60 = 240,
// degree360 = degree720 % 360 = 240, absoluteTick = cycle * 12 + tick12 = 4, and
// tick = absoluteTick = 4. position6 (= tick12 % 6 = 4) and su2Layer (degree720 < 360
// => double-cover) below already match this frame.
const kernelFrame = Object.freeze({
    tick: 4,
    tick12: 4,
    cycle: 0,
    degree720: 240,
    degree360: 240,
    tickAddress: Object.freeze({ cycle: 0, subTick: 4, tick12: 4, absoluteTick: 4, phase: 'Descent' })
});

function profile(generation, payload = {}) {
    return Object.freeze({
        generation,
        pointerAnchor: 'pointer://acceptance/current',
        capabilities: ['readCurrentProfile', 'readReadiness', 'depositKernelObservation'],
        payload: Object.freeze({
            ...baselineProfile,
            pointerAnchor: { lensRingSize: 12 },
            contextFrames: { frameCount: 7, activeFrame: 'CF-acceptance', activeAgent: 'anima' },
            ...kernelFrame,
            su2Layer: 'double-cover',
            phase: 'waxing',
            helix: 'right',
            position6: 4,
            ratioRole: 'dominant',
            diatonic: { vakRegister: 'madhyama' },
            audioOctet: [110, 123.47, 130.81, 146.83, 164.81, 174.61, 196, 220],
            audio_octet: { f0: 220, bins: [110, 123.47, 130.81, 146.83] },
            nodalQuartet: [{ node: 'N0' }, { node: 'N1' }, { node: 'N2' }, { node: 'N3' }],
            nodal_quartet: [0, 1, 2, 3],
            relationDescriptors: [
                {
                    edgeId: 'edge://m1-m2/acceptance',
                    fromCoordinate: 'M1',
                    toCoordinate: 'M2',
                    reasonCode: 'harmonic-walk',
                    relationLaw: 'captured S2 harmonic descriptor',
                    sourceHz: 220,
                    privacyPolicy: 'public-current',
                    depositionPolicy: 's5-evidence-handle',
                    kleinFlip: true
                }
            ],
            resonance72: { ...baselineProfile.resonance72, handle: 's2://resonance72/18' },
            planetaryChakral: { sun: 'heart', earthObserver: 'ground' },
            kleinFlipState: 'L-to-L-prime',
            correspondence72: { handle: 's2://m2/correspondence/18' },
            cymaticFrame: { frameHandle: 's3://world-clock/frame/3', audioBusHandle: 's0://audio-bus/88' },
            codon_rotation_projection: { codon: 42, rotation: 3, scalarRef: 'm3://codon/42#r3' },
            mahamaya: { codon: 42, rotation: 3, projectionHandle: 'm3://projection/42-3' },
            codec_lut: { version: 'captured-m3-lut' },
            s2_provenance: { handles: ['s2://bimba/M0', 's2://bimba/M3'] },
            kernel_trace_handle: 'run://kernel-trace/acceptance',
            ...payload
        })
    });
}

function s2Payload() {
    return Object.freeze({
        provenanceHandle: Object.freeze({
            source: 's2',
            handle: 's2://contract/m2-correspondence/acceptance',
            bodyAllowed: false
        }),
        tree72Handle: 's2://tree72/acceptance',
        decanFace: Object.freeze({
            faceHandle: 's2://decan/acceptance',
            configurable: true,
            source: 'S2 graph law'
        }),
        sacredSonic: Object.freeze({
            shemHandle: 's2://shem/acceptance',
            asmaHandle: 's2://asma/acceptance'
        }),
        planetaryChakral: Object.freeze({
            body: 'Earth',
            chakraRole: 'Muladhara / grounding center',
            provenance: 'S2 governed correspondence payload'
        }),
        earthObserverHandle: 's2://observer/earth-acceptance'
    });
}

function kerykeionPayload() {
    return Object.freeze({
        provenanceHandle: Object.freeze({
            source: 'kerykeion',
            handle: 's3://world-clock/kerykeion/acceptance',
            bodyAllowed: false
        }),
        worldClockHandle: 's3://world-clock/2026-06-01T00:00:00Z',
        planetaryHourRuler: 'Earth-observer-pending',
        transitHandle: 's3://transit/acceptance'
    });
}

function m3LibrarySummary() {
    return Object.freeze({
        provenanceHandle: Object.freeze({
            source: 's2',
            handle: 's2://m3-library/summary/acceptance',
            bodyAllowed: false
        }),
        nonDualCodonCount: 40,
        dualCodonCount: 24,
        nonDualRotationalSlots: 7,
        dualRotationalSlots: 8,
        scalarRefDetails: Object.freeze({
            'codon:AAA': Object.freeze({
                codon: 'AAA',
                hexagram: 'H01',
                detailSource: 'S2 canonical M3 library'
            }),
            'tarot:minor:00': Object.freeze({
                tarotRef: 'tarot:minor:00',
                detailSource: 'S2 canonical M3 library'
            })
        })
    });
}

function worldClock() {
    return Object.freeze({
        provenanceHandle: Object.freeze({
            source: 's3',
            handle: 's3://world-clock/acceptance',
            bodyAllowed: false
        }),
        worldClockHandle: 's3://world-clock/2026-06-01T00:00:00Z',
        // Same kernel frame as profile(): buildM3ProjectionSurface blocks the surface
        // unless world_clock tick/degree720 equal the current profile's.
        tick: kernelFrame.tick,
        degree720: kernelFrame.degree720
    });
}

function graphNode() {
    return Object.freeze({
        canonicalCoordinate: 'M0',
        label: 'Anuttara root',
        namespace: 'bimba',
        properties: Object.freeze({
            symbol: '#',
            formulation_type: 'prior-ground',
            complete_formulation: 'captured S2 Anuttara provenance',
            pointer_web: { summary: 'S2 pointer web handle summary' },
            anchors: {
                source: 'Idea/Bimba/Seeds/M/M0',
                spec: 'M0-SPEC',
                code: 'm0-anuttara',
                test: 'six-extension-acceptance'
            },
            relation_family: 'M0->M1'
        })
    });
}

function collectForbidden(value, path = 'root', out = []) {
    if (value === null || value === undefined) return out;
    if (typeof value === 'string') {
        if (/<protected:body>|<protected:journal>|<bioquaternion:raw:/i.test(value)) {
            out.push(path);
        }
        return out;
    }
    if (typeof value !== 'object') return out;
    if (Array.isArray(value)) {
        value.forEach((child, i) => collectForbidden(child, `${path}[${i}]`, out));
        return out;
    }
    for (const [key, child] of Object.entries(value)) {
        if (/^(q_b|q_p|q_personal|q_nara|journal_body|dream_text|oracle_interpretation_body|graphiti_body|private_identity_data)$/i.test(key)) {
            out.push(`${path}.${key}`);
        }
        collectForbidden(child, `${path}.${key}`, out);
    }
    return out;
}

test('six extensions consume one profile generation and produce a privacy-safe acceptance report', async () => {
    const root = await mkdtemp(join(tmpdir(), 'pratibimba-six-extension-'));
    try {
        const generation = 88;
        const baseProfile = profile(generation);
        const previousProfile = profile(generation - 1);
        const m0 = buildM0InspectorModel({
            selectedInput: '#0',
            graphNode: graphNode(),
            profile: baseProfile,
            readiness,
            context
        });
        const m1 = buildM1ProfileClockModel({
            profile: baseProfile,
            readiness,
            context,
            relationDescriptors: baseProfile.payload.relationDescriptors
        });
        const m1Walk = buildM1RelationWalkStep({
            previousProfile,
            currentProfile: baseProfile,
            descriptor: baseProfile.payload.relationDescriptors[0],
            emittedAt: 1
        });
        const m2 = buildM2PrimeMeaningPacket({
            profile: baseProfile,
            readiness,
            context,
            subject: 'acceptance',
            s2: s2Payload(),
            kerykeion: kerykeionPayload(),
            emittedAt: 2
        });
        const m3 = buildM3ProjectionSurface({
            profile: baseProfile,
            readiness,
            context,
            library: m3LibrarySummary(),
            worldClock: worldClock(),
            kernelTraceHandle: {
                source: 'profile',
                handle: 'profile://kernel-trace/acceptance',
                bodyAllowed: true
            },
            emittedAt: 3
        });

        const vaultRoot = join(root, 'vault');
        const artifact = await createNaraArtifact({
            vaultRoot,
            dayId: '2026-06-01',
            kind: 'oracle',
            title: 'Acceptance oracle handle',
            body: 'protected local oracle body that must stay in the markdown file only',
            nowPath: 'Idea/Empty/Present/01-06-2026/now.md',
            sessionKey: 'session-acceptance',
            scalarRefs: [
                { refKind: 'tarot', scalarRef: 'tarot://major/17', sourceHandle: 'oracle://draw/17' },
                { refKind: 'i-ching', scalarRef: 'iching://hexagram/61', sourceHandle: 'oracle://cast/61' },
                { refKind: 'chronos', scalarRef: 'chronos://2026-06-01', sourceHandle: 's3://world-clock/3' }
            ],
            graphitiEpisodeHandles: ['graphiti://episode/prelinked'],
            payload: { lensApplications: ['P0', 'P4'] },
            createdAt: '2026-06-01T00:00:00.000Z'
        });
        await createGraphitiEpisode({
            vaultRoot,
            dayId: '2026-06-01',
            artifactHandle: artifact.artifactHandle,
            relation: 'CONTAINS_DAILY_NOTE',
            crossArtifactLinks: [artifact.artifactHandle]
        });
        const dayContainer = await readNaraDayContainer({ vaultRoot, dayId: '2026-06-01' });
        const profileWithM4 = profile(generation, { m4NaraDayContainer: dayContainer });
        const m4 = buildM4NaraSurface({
            profile: profileWithM4,
            readiness,
            context,
            emittedAt: 4,
            dayContainer
        });

        const storeRoot = join(root, 's5');
        const review = await createS5ReviewItem({
            storeRoot,
            title: 'Acceptance review item',
            governanceCategory: 'routine',
            evidenceHandles: [artifact.artifactHandle],
            artifactRefs: ['vault://Pratibimba/Nara/2026-06-01'],
            protectedBodyHandles: [artifact.artifactHandle],
            protectedBodySummary: 'protected-local body available only by handle',
            createdAt: '2026-06-01T00:01:00.000Z'
        });
        const improvement = await createImprovementRun({
            storeRoot,
            reviewItemHandle: review.reviewItemHandle,
            direction: 'acceptance route verification',
            evidenceHandles: [artifact.artifactHandle],
            effectVerificationSchedule: ['after-six-extension-contracts'],
            createdAt: '2026-06-01T00:02:00.000Z'
        });
        await depositVakCompletionEvidence({
            storeRoot,
            reviewItemHandle: review.reviewItemHandle,
            cpf: 'C2',
            ct: 'CT4b',
            cp: 'CP4',
            cf: '(4.0/1-4.4/5)',
            cfp: 'CFP0',
            cs: 'Day',
            sessionHandle: 's3://session/day-now-acceptance',
            dayHandle: 's3://day/2026-06-01',
            nowHandle: 's3://now/acceptance',
            sourceRefs: ['repo://Body/M/epi-theia/extensions'],
            changedArtifactRefs: ['vault://Pratibimba/Nara/2026-06-01'],
            testOutputHandles: ['run://node-test/six-extension-acceptance']
        });
        const s5Snapshot = await readS5ReviewSnapshot({ storeRoot });
        const m5 = buildM5EpiiSurface({
            profile: profile(generation, { m5EpiiReviewSnapshot: s5Snapshot }),
            readiness,
            context,
            emittedAt: 5,
            snapshot: s5Snapshot
        });

        const generations = [
            m1.generation,
            m1Walk.currentProfileGeneration,
            m2.profileGeneration,
            m3.profileGeneration,
            m4.profileGeneration,
            m5.profileGeneration
        ];
        assert.deepEqual(generations, Array(6).fill(generation));
        assert.equal(m0.node.coordinate, 'M0');
        assert.equal(m0.pointerSummary.state, 'derived');
        assert.equal(m1.readiness.relationWalkReady, true);
        assert.equal(m2.readiness.packetReady, true);
        assert.equal(m3.readiness.surfaceReady, true);
        assert.equal(m4.readiness.surfaceReady, true);
        assert.equal(m5.readiness.surfaceReady, true);
        assert.equal(M1_CONTRIBUTION.currentStateSelectors[0].source, 'shared-bridge');
        assert.equal(dayContainer.artifactTree.length, 1);
        assert.equal(s5Snapshot.evidenceDeposits.length, 1);

        const report = Object.freeze({
            profileGeneration: generation,
            readinessStates: Object.freeze({
                m0: readiness.state,
                m1: m1.readiness.state,
                m2: m2.readiness.state,
                m3: m3.readiness.state,
                m4: m4.readiness.state,
                m5: m5.readiness.state
            }),
            eventCounts: Object.freeze({
                m1: m1Walk.observabilityEvents.length,
                m2: m2.observabilityEvents.length,
                m3: m3.observabilityEvents.length,
                m4: m4.observabilityEvents.length,
                m5: m5.observabilityEvents.length
            }),
            privacyBlocks: Object.freeze({
                m4ProtectedBodiesRendered: m4.artifactTree.some(row => row.bodyRendered === true),
                m5ProtectedBodiesRendered: m5.reviewWorkbench.reviewItems.some(row => row.protectedBodiesRendered === true)
            }),
            s5EvidenceDeposits: s5Snapshot.evidenceDeposits.map(e => e.evidenceHandle),
            persistedHandles: Object.freeze({
                naraArtifact: artifact.artifactHandle,
                graphitiEpisodes: dayContainer.graphitiEpisodeHandles,
                reviewItem: review.reviewItemHandle,
                improvementRun: improvement.improvementRunHandle
            })
        });

        assert.equal(report.privacyBlocks.m4ProtectedBodiesRendered, false);
        assert.equal(report.privacyBlocks.m5ProtectedBodiesRendered, false);
        assert.equal(report.s5EvidenceDeposits.length, 1);
        assert.equal(report.eventCounts.m1 >= 1, true);
        assert.equal(report.eventCounts.m5 >= 2, true);
        assert.deepEqual(collectForbidden(report), []);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});
