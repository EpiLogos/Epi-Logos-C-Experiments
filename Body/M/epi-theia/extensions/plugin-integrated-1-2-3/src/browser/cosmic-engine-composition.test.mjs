import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
    CosmicEngineComposition,
    deriveCosmicBeingPatternOverlay
} = require('../../lib/browser/cosmic-engine-composition.js');

function projection(entityId, monopolyOperator, degree360, reviewRisk = null) {
    const m2M3Relation = Object.freeze({
        relationHandle: `m2m3:${entityId}`,
        planetaryLensAspect: 'backend-supplied-trine',
        source: 'CCT-21 replay'
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
            streamGeneration: 42,
            redisPsyche: Object.freeze({ presence: 'handle:presence', state: 'handle:state' }),
            dayRef: '[[02-06-2026]]',
            nowRef: '[[20260602-120000-being-pattern]]',
            streamDelta: 'handle:stream-delta',
            graphitiEpisodeRefs: Object.freeze([
                Object.freeze({
                    episodeId: `episode:${entityId}`,
                    sourceRef: `graphiti:episode:${entityId}`,
                    publicSummary: `${entityId} summary`
                })
            ])
        }),
        relationEdges: Object.freeze([
            Object.freeze({
                edgeId: `edge:${entityId}`,
                sourceEntityId: entityId,
                targetEntityId: 'school-being',
                edgeKind: 'aspect-like',
                aspectLabel: 'trine-like-resonance',
                generation: 42,
                elementalDelta: Object.freeze({ fire: 0.1 }),
                m2M3Relation,
                verifierRefs: Object.freeze([])
            })
        ]),
        observerAnchor: Object.freeze({
            observerEntityId: entityId,
            observerRole: 'ThirdPerson',
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
        elementalWeights: Object.freeze({ fire: 0.3 }),
        clockAddress: Object.freeze({ degree360 }),
        monopolyOperator,
        perspectiveRole: 'ThirdPerson',
        verifierRefs: Object.freeze([]),
        reviewRisk
    });
}

function profile() {
    return Object.freeze({
        generation: 42,
        pointerAnchor: null,
        capabilities: Object.freeze([]),
        payload: Object.freeze({
            pasuBeingPattern: projection('mono-being', 'Mono', 10),
            pasuBeingPatternProjections: Object.freeze([
                projection('poly-being', 'Poly', 137),
                projection('actualising-being', 'ActualisingOne', 220, 'forced-unification'),
                projection('potentiating-being', 'PotentiatingMany', 270),
                projection('monopoly-being', 'MonoPoly', 310)
            ]),
            m2EarthCentredOrbiterProjection: Object.freeze({
                observer: 'Earth',
                orbiterCount: 9,
                source: 'm2-lut-handle'
            })
        })
    });
}

test('cosmic overlay renders many live beings as distinct public-safe markers', () => {
    const overlay = deriveCosmicBeingPatternOverlay(profile());

    assert.equal(overlay.observer, 'Earth');
    assert.equal(overlay.orbiterCount, 9);
    assert.deepEqual(
        overlay.markers.map(marker => marker.entityId),
        ['mono-being', 'poly-being', 'actualising-being', 'potentiating-being', 'monopoly-being']
    );
    assert.equal(overlay.markers[2].visualState, 'review-warning');
    assert.equal(overlay.markers[3].visualState, 'distinct-many');
    assert.equal(overlay.markers[4].visualState, 'held-many-in-one');
    assert.equal(overlay.relationAspects[0].planetaryLensAspect, 'backend-supplied-trine');
});

test('cosmic overlay markup contains handles and no protected bodies', () => {
    const html = renderToStaticMarkup(
        React.createElement(CosmicEngineComposition, { profile: profile() })
    );

    assert.match(html, /data-observer="Earth"/);
    assert.match(html, /data-entity-id="poly-being"/);
    assert.match(html, /data-monopoly-operator="ActualisingOne"/);
    assert.match(html, /backend-supplied-trine/);
    assert.doesNotMatch(html, /episodeBody|rawQuaternion|protected body/);
});
