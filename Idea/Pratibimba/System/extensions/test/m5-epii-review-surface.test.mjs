import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    buildM5EpiiSurface,
    createImprovementRun,
    createS5ReviewItem,
    depositVakCompletionEvidence,
    parseArtifactUri,
    readS5ReviewSnapshot,
    requestDryRunPromotion,
    resolveReviewItem
} = require('../m5-epii/lib/common/index.js');

async function withStore(fn) {
    const storeRoot = await mkdtemp(join(tmpdir(), 'm5-epii-s5-store-'));
    try {
        return await fn(storeRoot);
    } finally {
        await rm(storeRoot, { recursive: true, force: true });
    }
}

function profile(snapshot) {
    return Object.freeze({
        generation: 55,
        pointerAnchor: 'pointer://m5-epii/test',
        capabilities: Object.freeze(['s5.review.read', 's5.improve.dry_run']),
        payload: Object.freeze({ m5EpiiReviewSnapshot: snapshot })
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
        canonicalMCoordinate: "M5'",
        pointerAnchor: 'pointer://m5-epii/test',
        profileGeneration: 55
    });
}

test('persisted S5 review item, improvement run, dry-run promotion, and snapshot render in M5 surface', async () => {
    await withStore(async storeRoot => {
        const item = await createS5ReviewItem({
            storeRoot,
            title: 'Recursive Epii review gate',
            governanceCategory: 'recursive-self-modification',
            promotionDestination: 'repo://Idea/Bimba/Seeds/M/M5%27/M5%27-SPEC.md',
            evidenceHandles: ['review://evidence/source-1'],
            artifactRefs: [
                'vault://Idea/Bimba/Seeds/M/M5%27/M5%27-SPEC.md',
                'graph://bimba/M5-4',
                'gnosis://dialogue/epii',
                'etymology://epilogos',
                'pratibimba://extension/m5-epii',
                'run://m-dev/07.T8',
                'review://queue/item',
                'improvement://run/source'
            ],
            protectedBodyHandles: ['graphiti://episode/protected-nara'],
            protectedBodySummary: 'protected Nara body present as handle-only summary',
            createdAt: '2026-06-01T13:00:00.000Z'
        });
        const run = await createImprovementRun({
            storeRoot,
            reviewItemHandle: item.reviewItemHandle,
            direction: 'dry-run recursive review route',
            evidenceHandles: ['review://evidence/source-1'],
            effectVerificationSchedule: ['effect://verify/after-human-final'],
            createdAt: '2026-06-01T13:05:00.000Z'
        });
        const plan = await requestDryRunPromotion({
            storeRoot,
            reviewItemHandle: item.reviewItemHandle,
            improvementRunHandle: run.improvementRunHandle,
            destination: 'repo://Idea/Bimba/Seeds/M/M5%27/M5%27-SPEC.md',
            compilePlanHandles: ['run://compile-plan/dry'],
            rollbackHandle: 'run://rollback/dry',
            dryRun: true
        });
        const snapshot = await readS5ReviewSnapshot({ storeRoot });
        const surface = buildM5EpiiSurface({
            profile: profile(snapshot),
            readiness: readiness(),
            context: context(),
            emittedAt: 1_771_000_000_000
        });

        assert.equal(plan.dryRun, true);
        assert.equal(plan.nonDryRunBlockedReason, 'compiler-mutation-law-not-wired');
        assert.equal(snapshot.reviewItems.length, 1);
        assert.equal(snapshot.improvementRuns.length, 1);
        assert.equal(snapshot.dryRunPlans.length, 1);
        assert.equal(surface.readiness.surfaceReady, true);
        assert.equal(surface.reviewWorkbench.open, 1);
        assert.equal(surface.reviewWorkbench.humanRequired, 1);
        assert.equal(surface.spineInspector.routingConfigurationHandle, 'review://spine/routing-configuration/current');
        assert.equal(surface.recursiveGateRows[0].userFinalValidationRequired, true);
        assert.equal(surface.recursiveGateRows[0].agentMayFinalize, false);
        assert.equal(surface.canonEvolutionBrowser.length >= 8, true);
        assert.equal(JSON.stringify(surface).includes('protected Nara body present as handle-only summary'), true);
        assert.equal(JSON.stringify(surface).includes('raw body'), false);
    });
});

test('agents cannot approve, reject, revise, promote, or weaken human-required recursive gates', async () => {
    await withStore(async storeRoot => {
        const item = await createS5ReviewItem({
            storeRoot,
            title: 'Human final validation',
            governanceCategory: 'human-required',
            recursiveModification: true,
            artifactRefs: ['review://human-required/item'],
            createdAt: '2026-06-01T14:00:00.000Z'
        });
        for (const disposition of ['approve', 'reject', 'revise', 'promote', 'weaken-gate']) {
            await assert.rejects(
                () =>
                    resolveReviewItem({
                        storeRoot,
                        reviewItemHandle: item.reviewItemHandle,
                        disposition,
                        actorKind: 'agent'
                    }),
                /agents cannot approve/
            );
        }
        const deferred = await resolveReviewItem({
            storeRoot,
            reviewItemHandle: item.reviewItemHandle,
            disposition: 'defer',
            actorKind: 'agent',
            resolvedAt: '2026-06-01T14:10:00.000Z'
        });
        assert.equal(deferred.status, 'deferred');
    });
});

test('non-dry-run promotion remains blocked until compiler mutation law exists', async () => {
    await withStore(async storeRoot => {
        const item = await createS5ReviewItem({
            storeRoot,
            title: 'Canon publication dry run',
            governanceCategory: 'canon-publication',
            promotionDestination: 'repo://canon/path.md',
            createdAt: '2026-06-01T15:00:00.000Z'
        });
        const run = await createImprovementRun({
            storeRoot,
            reviewItemHandle: item.reviewItemHandle,
            direction: 'canon dry run',
            createdAt: '2026-06-01T15:05:00.000Z'
        });
        await assert.rejects(
            () =>
                requestDryRunPromotion({
                    storeRoot,
                    reviewItemHandle: item.reviewItemHandle,
                    improvementRunHandle: run.improvementRunHandle,
                    destination: 'repo://canon/path.md',
                    compilePlanHandles: ['run://compile'],
                    rollbackHandle: 'run://rollback',
                    dryRun: false
                }),
            /non-dry-run promotion is blocked/
        );
    });
});

test('artifact URI parser rejects raw absolute paths and accepts required namespaces', () => {
    assert.throws(() => parseArtifactUri('/Users/admin/private.md'), /namespace URIs/);
    assert.throws(() => parseArtifactUri('graph://random/node'), /bimba, gnosis, or etymology/);
    for (const uri of [
        'vault://Idea/Bimba/file.md',
        'repo://Body/S/S5/file.rs',
        'graph://bimba/M5',
        'gnosis://claim/1',
        'etymology://logos',
        'pratibimba://extension/m5',
        'run://m-dev/05.T6',
        'review://item/1',
        'improvement://run/1'
    ]) {
        assert.equal(parseArtifactUri(uri).uri, uri);
    }
});

test('VAK completion evidence includes six coordinates, DAY/NOW/session, source refs, changes, and test handles', async () => {
    await withStore(async storeRoot => {
        const item = await createS5ReviewItem({
            storeRoot,
            title: 'VAK completion evidence',
            governanceCategory: 'routine',
            artifactRefs: ['run://m-dev/05.T6'],
            createdAt: '2026-06-01T16:00:00.000Z'
        });
        const evidence = await depositVakCompletionEvidence({
            storeRoot,
            reviewItemHandle: item.reviewItemHandle,
            cpf: 'C2',
            ct: 'CT4b',
            cp: 'CP4',
            cf: '(5/0)',
            cfp: 'CFP0',
            cs: 'Day',
            sessionHandle: 'session://codex/20260601',
            dayHandle: 'day://01-06-2026',
            nowHandle: 'now://20260601T160000Z',
            sourceRefs: ['vault://Idea/Bimba/Seeds/M/M5%27/M5%27-SPEC.md'],
            changedArtifactRefs: ['repo://Idea/Pratibimba/System/extensions/m5-epii/src/common/epii-surface.ts'],
            testOutputHandles: ['run://test/m5-epii-review-surface']
        });
        const snapshot = await readS5ReviewSnapshot({ storeRoot });
        assert.equal(evidence.cf, '(5/0)');
        assert.equal(evidence.sourceRefs[0].scheme, 'vault');
        assert.equal(evidence.changedArtifactRefs[0].scheme, 'repo');
        assert.equal(snapshot.evidenceDeposits.length, 1);
        assert.deepEqual(snapshot.evidenceDeposits[0].testOutputHandles, ['run://test/m5-epii-review-surface']);
    });
});
