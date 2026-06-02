import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    buildM4NaraSurface,
    buildPublicProfilePayload,
    buildS2CanonicalProjection,
    buildSpaceTimeRows,
    buildTemporalReading,
    createGraphitiEpisode,
    createNaraArtifact,
    evaluateVoiceCorpusAdmission,
    inspectOracleArtifact,
    readNaraDayContainer,
    renderProtectedPersonalField
} = require('../m4-nara/lib/common/index.js');

async function withVault(fn) {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'm4-nara-vault-'));
    try {
        return await fn(vaultRoot);
    } finally {
        await rm(vaultRoot, { recursive: true, force: true });
    }
}

function profile(dayContainer) {
    return Object.freeze({
        generation: 44,
        pointerAnchor: 'pointer://m4-nara/test',
        capabilities: Object.freeze(['profile.public-current', 'nara.handle-surface']),
        payload: Object.freeze({ m4NaraDayContainer: dayContainer })
    });
}

function readiness() {
    return Object.freeze({
        state: 'ready_public_current',
        updatedAt: '2026-06-01T00:00:00.000Z',
        sources: Object.freeze([]),
        blockers: Object.freeze([])
    });
}

function context() {
    return Object.freeze({
        canonicalMCoordinate: "M4'",
        pointerAnchor: 'pointer://m4-nara/test',
        profileGeneration: 44
    });
}

test('creates real Nara artifact files and renders DayContainer tree from persisted store', async () => {
    await withVault(async vaultRoot => {
        const journal = await createNaraArtifact({
            vaultRoot,
            dayId: '2026-06-01',
            kind: 'journal',
            title: 'Morning flow',
            body: 'private journal body: do not project',
            nowPath: 'Idea/Empty/Present/01-06-2026/20260601-090000-test/now.md',
            sessionKey: 'session://m4-nara/day/1',
            createdAt: '2026-06-01T09:00:00.000Z',
            scalarRefs: [
                { refKind: 'chronos', scalarRef: 'chronos://2026-06-01T09:00:00Z', sourceHandle: 's3://chronos/1' }
            ]
        });
        const oracle = await createNaraArtifact({
            vaultRoot,
            dayId: '2026-06-01',
            kind: 'oracle',
            title: 'Quaternal Tarot reading',
            body: 'private oracle body: do not project',
            nowPath: 'Idea/Empty/Present/01-06-2026/20260601-090000-test/now.md',
            sessionKey: 'session://m4-nara/day/1',
            createdAt: '2026-06-01T09:05:00.000Z',
            scalarRefs: [
                { refKind: 'tarot', scalarRef: 'm3://tarot/minor/nine-of-wands', sourceHandle: 's2://m3/scalar/tarot/9w' },
                { refKind: 'i-ching', scalarRef: 'm3://iching/hexagram/01', sourceHandle: 's2://m3/scalar/iching/1' },
                { refKind: 'kairos', scalarRef: 'kairos://threshold/2026-06-01', sourceHandle: 's3://kairos/1' }
            ],
            qActivityPolicy: {
                provenanceHandle: 's3://q-activity/provenance/1',
                decayWindowOpen: true,
                updateAllowed: true,
                reason: 'fresh-reading-with-provenance'
            },
            payload: {
                lensApplications: ['M3-4 lens from persisted scalar refs'],
                oracleKind: 'quaternal-tarot'
            }
        });
        const episode = await createGraphitiEpisode({
            vaultRoot,
            dayId: '2026-06-01',
            artifactHandle: oracle.artifactHandle,
            relation: 'PART_OF_DAY',
            sagaHandle: 'graphiti://saga/nara-test',
            communityHandle: 'graphiti://community/protected-local',
            crossArtifactLinks: [journal.artifactHandle]
        });

        const day = await readNaraDayContainer({ vaultRoot, dayId: '2026-06-01' });
        const surface = buildM4NaraSurface({
            profile: profile(day),
            readiness: readiness(),
            context: context(),
            emittedAt: 1_771_000_000_000
        });

        assert.equal(day.artifactCounts.journal, 1);
        assert.equal(day.artifactCounts.oracle, 1);
        assert.equal(day.artifactTree.length, 2);
        assert.equal(day.graphitiEpisodes[0].episodeHandle, episode.episodeHandle);
        assert.equal(surface.readiness.surfaceReady, true);
        assert.equal(surface.artifactTree.length, 2);
        assert.equal(surface.artifactTree.every(row => row.bodyRendered === false), true);

        const markdown = await readFile(oracle.artifactPath, 'utf8');
        assert.match(markdown, /artifact_handle/);
        assert.match(markdown, /private oracle body/);
    });
});

test('protected bodies never enter S2 projection, public profile payload, or SpaceTimeDB rows', async () => {
    await withVault(async vaultRoot => {
        await createNaraArtifact({
            vaultRoot,
            dayId: '2026-06-01',
            kind: 'dream',
            title: 'Dream fragment',
            body: 'very private dream body',
            nowPath: 'Idea/Empty/Present/01-06-2026/now.md',
            sessionKey: 'session://m4-nara/privacy',
            createdAt: '2026-06-01T10:00:00.000Z'
        });
        const day = await readNaraDayContainer({ vaultRoot, dayId: '2026-06-01' });
        const projections = [
            buildS2CanonicalProjection(day),
            buildPublicProfilePayload(day),
            ...buildSpaceTimeRows(day)
        ];
        const serialized = JSON.stringify(projections);
        assert.doesNotMatch(serialized, /very private dream body/);
        assert.doesNotMatch(serialized, /bodySha256/);
        assert.match(serialized, /nara:\/\/day\/2026-06-01\/artifact\//);
    });
});

test('oracle inspector carries scalar refs and gates Q_activity by provenance policy', async () => {
    await withVault(async vaultRoot => {
        const oracle = await createNaraArtifact({
            vaultRoot,
            dayId: '2026-06-01',
            kind: 'oracle',
            title: 'I-Ching temporal reading',
            body: 'private i-ching body',
            nowPath: 'Idea/Empty/Present/01-06-2026/now.md',
            sessionKey: 'session://m4-nara/oracle',
            createdAt: '2026-06-01T11:00:00.000Z',
            scalarRefs: [
                { refKind: 'i-ching', scalarRef: 'm3://iching/hexagram/02', sourceHandle: 's2://m3/scalar/iching/2' }
            ],
            qActivityPolicy: {
                provenanceHandle: null,
                decayWindowOpen: true,
                updateAllowed: true,
                reason: 'blocked-without-provenance'
            },
            payload: { lensApplications: ['M3-2 receptive lens'] }
        });
        const inspected = inspectOracleArtifact(oracle);
        assert.equal(inspected.protectedBodyLoaded, false);
        assert.equal(inspected.scalarRefs.length, 1);
        assert.equal(inspected.qActivityUpdate.allowed, false);
        assert.equal(inspected.qActivityUpdate.reason, 'blocked-without-provenance');
    });
});

test('personal field is protected-local and temporal reading reconstructs from persisted handles', async () => {
    await withVault(async vaultRoot => {
        const artifact = await createNaraArtifact({
            vaultRoot,
            dayId: '2026-06-01',
            kind: 'contemplative',
            title: 'Transit reflection',
            body: 'private transit reflection',
            nowPath: 'Idea/Empty/Present/01-06-2026/now.md',
            sessionKey: 'session://m4-nara/field',
            createdAt: '2026-06-01T12:00:00.000Z',
            scalarRefs: [
                { refKind: 'chronos', scalarRef: 'chronos://2026-06-01T12:00:00Z', sourceHandle: 's3://chronos/2' },
                { refKind: 'kairos', scalarRef: 'kairos://opening/2026-06-01', sourceHandle: 's3://kairos/2' }
            ]
        });
        await createGraphitiEpisode({
            vaultRoot,
            dayId: '2026-06-01',
            artifactHandle: artifact.artifactHandle,
            relation: 'NEXT_IN_ARC'
        });
        const day = await readNaraDayContainer({ vaultRoot, dayId: '2026-06-01' });
        const field = renderProtectedPersonalField({
            surfaceId: 'm4-nara',
            qIdentityHandle: 'q://identity/local',
            qTransitHandle: 'q://transit/local',
            qActivityHandle: 'q://activity/local',
            qComposedHandle: 'q://composed/local',
            audioBusHandle: 'audio://bus/protected',
            planetaryChakralStateHandle: 'planetary-chakral://state/protected'
        });
        const reading = buildTemporalReading(day);
        assert.equal(field.protectedLocalOnly, true);
        assert.equal(field.bodyRendered, false);
        assert.equal(field.readiness, 'deterministic-lower-fidelity');
        assert.equal(reading.reconstructedFromPersistedHandles, true);
        assert.equal(reading.protectedBodiesLoaded, false);
        assert.deepEqual(reading.chronosRefs, ['chronos://2026-06-01T12:00:00Z']);
        assert.deepEqual(reading.kairosRefs, ['kairos://opening/2026-06-01']);
    });
});

test('voice corpus admission requires explicit consent, PII stripping, Anima admission, provenance, and rollback', () => {
    const denied = evaluateVoiceCorpusAdmission({
        consentRecords: [],
        piiStripped: true,
        animaAdmission: 'approved',
        adapterProvenanceHandle: 'adapter://prov/1',
        rollbackDeploymentHandle: 'deploy://rollback/1'
    });
    assert.equal(denied.admitted, false);

    const admitted = evaluateVoiceCorpusAdmission({
        consentRecords: [
            {
                subjectHandle: 'nara://day/2026-06-01/artifact/a',
                action: 'nara.voice-corpus.include',
                consented: true,
                consentedAt: '2026-06-01T12:30:00.000Z',
                scope: 'adapter-corpus',
                pressureFree: true,
                inspectable: true
            }
        ],
        piiStripped: true,
        animaAdmission: 'approved',
        adapterProvenanceHandle: 'adapter://prov/1',
        rollbackDeploymentHandle: 'deploy://rollback/1'
    });
    assert.equal(admitted.admitted, true);
    assert.equal(admitted.ordinaryDialogueSeparated, true);
});
