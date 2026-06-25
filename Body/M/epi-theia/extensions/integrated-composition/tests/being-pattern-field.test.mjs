import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    COMPOSITION_EVENT_TYPES,
    beingPatternCompositionEventTypeFromStreamKind
} = require('../lib/common/composition-events.js');
const {
    assertGraphitiLiveStateProvenanceProtected
} = require('../lib/common/graphiti-source-guard.js');
const {
    BEING_PATTERN_READINESS_BLOCKERS,
    readCurrentInhabitedBimbaField
} = require('../lib/common/integrated-readiness.js');

const cct21Kinds = Object.freeze([
    'EntityObserved',
    'BeingPatternProjected',
    'PerspectiveRoleResolved',
    'MonoPolyOperatorResolved',
    'ClockAddressUpdated',
    'AspectEdgeComputed',
    'ElementalResonanceChanged',
    'PatternPacketFormed',
    'ReviewCandidateEmitted'
]);

function projection(entityId, generation, monopolyOperator = 'Mono') {
    const m2M3Relation = Object.freeze({
        relationHandle: `m2m3:${entityId}:${generation}`,
        planetaryLensAspect: 'backend-supplied-trine',
        source: 'CCT-21 SpaceTimeDB replay'
    });
    return Object.freeze({
        entityRef: Object.freeze({
            entityId,
            entityKind: 'user-being',
            graphAnchor: `neo4j://s2/Bimba/${entityId}`
        }),
        stableIdentity: Object.freeze({
            graphAnchor: `neo4j://s2/Bimba/${entityId}`,
            identityHandle: `s2:identity:${entityId}`,
            source: 'S2 Neo4j canonical graph'
        }),
        liveState: Object.freeze({
            spacetimeRowId: `being_pattern_presence:${entityId}`,
            streamGeneration: generation,
            redisPsyche: Object.freeze({
                presence: `cache:live:s3:being_pattern:${entityId}:presence`,
                state: `cache:active:s3:being_pattern:${entityId}:state`
            }),
            dayRef: '[[02-06-2026]]',
            nowRef: '[[20260602-120000-being-pattern]]',
            streamDelta: `cache:stream:s3:being_pattern:${generation}:delta`,
            graphitiEpisodeRefs: Object.freeze([
                Object.freeze({
                    episodeId: `episode:${entityId}:${generation}`,
                    sourceRef: `graphiti:episode:${entityId}:${generation}`,
                    publicSummary: `${entityId} public summary`
                })
            ])
        }),
        relationEdges: Object.freeze([
            Object.freeze({
                edgeId: `edge:${entityId}:m2m3:${generation}`,
                sourceEntityId: entityId,
                targetEntityId: 'school-of-thought-being',
                edgeKind: 'aspect-like',
                aspectLabel: 'trine-like-resonance',
                generation,
                elementalDelta: Object.freeze({ fire: 0.1 }),
                m2M3Relation,
                verifierRefs: Object.freeze([])
            })
        ]),
        observerAnchor: Object.freeze({
            observerEntityId: entityId,
            observerRole: 'FirstPerson',
            anchorRef: `observer:${entityId}`
        }),
        m2M3Relation,
        bioquaternionHandles: Object.freeze([
            Object.freeze({
                handle: `protected-local://bioquaternion/${entityId}/current`,
                privacy: 'protected-local-body',
                source: 'M4 protected handle only'
            })
        ]),
        elementalWeights: Object.freeze({ fire: 0.3, water: 0.2, air: 0.4, earth: 0.1 }),
        clockAddress: Object.freeze({ degree360: 137, hexagram: 42, line: 3 }),
        monopolyOperator,
        perspectiveRole: 'FirstPerson',
        verifierRefs: Object.freeze([]),
        reviewRisk: monopolyOperator === 'ActualisingOne' ? 'forced-unification' : null
    });
}

function profile(generation, projections) {
    return Object.freeze({
        generation,
        pointerAnchor: 'graph://bimba/current',
        capabilities: Object.freeze([]),
        payload: Object.freeze({
            pasuBeingPatternProjections: Object.freeze(projections)
        })
    });
}

test('being-pattern composition event vocabulary includes CCT-21 public stream events', () => {
    assert.ok(COMPOSITION_EVENT_TYPES.includes('composition.being_pattern.observed'));
    assert.ok(COMPOSITION_EVENT_TYPES.includes('composition.being_pattern.projected'));
    assert.ok(COMPOSITION_EVENT_TYPES.includes('composition.being_pattern.relation_edge'));
    assert.ok(COMPOSITION_EVENT_TYPES.includes('composition.being_pattern.review_candidate'));
});

test('CCT-21 replay kinds map to composition event phases without reconstructing the stream', () => {
    const mapped = cct21Kinds.map(beingPatternCompositionEventTypeFromStreamKind);

    assert.deepEqual(mapped, [
        'composition.being_pattern.observed',
        'composition.being_pattern.projected',
        'composition.being_pattern.projected',
        'composition.being_pattern.projected',
        'composition.being_pattern.projected',
        'composition.being_pattern.relation_edge',
        'composition.being_pattern.relation_edge',
        'composition.being_pattern.projected',
        'composition.being_pattern.review_candidate'
    ]);
});

test('current inhabited Bimba field drops stale SpaceTimeDB generations', () => {
    const field = readCurrentInhabitedBimbaField(
        profile(42, [projection('stale-being', 41), projection('current-being', 42, 'Poly')])
    );

    assert.equal(field.generation, 42);
    assert.deepEqual(field.entities.map(entity => entity.entityRef.entityId), ['current-being']);
    assert.equal(field.entities[0].stableIdentity.graphAnchor, 'neo4j://s2/Bimba/current-being');
    assert.equal(field.entities[0].liveState.streamDelta, 'cache:stream:s3:being_pattern:42:delta');
    assert.equal(field.entities[0].liveState.redisPsyche.state, 'cache:active:s3:being_pattern:current-being:state');
    assert.equal(field.entities[0].monopolyOperator, 'Poly');
    assert.equal(field.entities[0].perspectiveRole, 'FirstPerson');
    assert.equal(field.entities[0].m2M3Relation.planetaryLensAspect, 'backend-supplied-trine');
    assert.equal(field.relationEdges[0].m2M3Relation.planetaryLensAspect, 'backend-supplied-trine');
});

test('being-pattern typed unions keep all monopoly and perspective variants intact', () => {
    const operators = ['Mono', 'Poly', 'ActuallyMany', 'PotentiallyOne', 'ActualisingOne', 'PotentiatingMany', 'MonoPoly'];
    const perspectives = ['FirstPerson', 'SecondPerson', 'FirstPersonPlural', 'ThirdPerson', 'CollectiveWe', 'IntegralWeI'];

    const field = readCurrentInhabitedBimbaField(
        profile(42, operators.map((operator, index) =>
            Object.freeze({
                ...projection(`being-${index}`, 42, operator),
                perspectiveRole: perspectives[index % perspectives.length]
            })
        ))
    );

    assert.deepEqual(field.entities.map(entity => entity.monopolyOperator), operators);
    assert.deepEqual(field.entities.map(entity => entity.perspectiveRole), [
        'FirstPerson',
        'SecondPerson',
        'FirstPersonPlural',
        'ThirdPerson',
        'CollectiveWe',
        'IntegralWeI',
        'FirstPerson'
    ]);
    assert.equal(
        field.entities.find(entity => entity.monopolyOperator === 'ActualisingOne').reviewRisk,
        'forced-unification'
    );
});

test('being-pattern readiness blockers name every pending live-field dependency', () => {
    assert.deepEqual(BEING_PATTERN_READINESS_BLOCKERS, [
        'pending-pasu-being-pattern',
        'pending-spacetime-live-state',
        'pending-monopoly-operator',
        'pending-perspective-role'
    ]);
});

test('Graphiti live-state provenance accepts handles and rejects bodies or raw quaternions', () => {
    assert.doesNotThrow(() =>
        assertGraphitiLiveStateProvenanceProtected(projection('safe-being', 42))
    );

    assert.throws(
        () =>
            assertGraphitiLiveStateProvenanceProtected({
                ...projection('leaky-body', 42),
                liveState: {
                    ...projection('leaky-body', 42).liveState,
                    graphitiEpisodeRefs: [
                        {
                            episodeId: 'ep-1',
                            sourceRef: 'graphiti:episode:ep-1',
                            publicSummary: 'summary',
                            episodeBody: 'protected body'
                        }
                    ]
                }
            }),
        /episodeBody/
    );

    assert.throws(
        () =>
            assertGraphitiLiveStateProvenanceProtected({
                ...projection('leaky-quaternion', 42),
                rawQuaternion: [1, 0, 0, 0]
            }),
        /rawQuaternion/
    );

    assert.throws(
        () =>
            assertGraphitiLiveStateProvenanceProtected({
                ...projection('leaky-q-partition', 45),
                liveState: {
                    ...projection('leaky-q-partition', 45).liveState,
                    q_identity_hash: 'private q partition derivative'
                }
            }),
        /q_identity_hash/
    );
});
