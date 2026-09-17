//! CCT-21 (16.T16.21) BeingPattern live-state producer.
//!
//! REPAIR NOTE (2026-08-01, `opus-mdev-bp`): this file previously proved only
//! that the four method NAMES classify to the S3' temporal route and that the
//! acceptance-replay fixture is self-consistent. The 16.T16.21 ledger cited it
//! as "the four methods are registered and gateway-handled" — which it never
//! showed, and which was FALSE: no handler existed at any coordinate, and a
//! live probe answered `unimplemented` for all four. The `registers_*` and
//! `dispatch_*` cases below are the missing proof: real `MethodRegistry`
//! dispatch through the S3 crate's own table, which is what actually reaches
//! the wire via the S-root port.

use std::path::{Path, PathBuf};

use epi_kernel_contract::{MethodRegistry, MethodRequest};
use epi_s3_gateway::dispatch::{classify_method, GatewayDispatchClass, GatewayDispatchOwner};
use epi_s3_gateway::session_store::SessionStore;
use epi_s3_gateway::spacetime::{
    being_pattern_acceptance_replay, being_pattern_bridge_handle_payload,
};
use epi_s3_gateway::temporal_session::TemporalSurfaces;
use epi_s3_gateway::{register_s3_handlers, TemporalContextEnv, S3_METHODS};
use epi_s3_gateway_contract::{
    BEING_PATTERN_OBSERVE_METHOD, BEING_PATTERN_PROJECT_METHOD,
    BEING_PATTERN_REVIEW_CANDIDATE_METHOD, BEING_PATTERN_SUBSCRIBE_METHOD, METHOD_NAMES,
};
use serde_json::{json, Value};

const BEING_PATTERN_METHODS: [&str; 4] = [
    BEING_PATTERN_OBSERVE_METHOD,
    BEING_PATTERN_PROJECT_METHOD,
    BEING_PATTERN_SUBSCRIBE_METHOD,
    BEING_PATTERN_REVIEW_CANDIDATE_METHOD,
];

struct TestEnv {
    state_root: PathBuf,
    store: SessionStore,
}

impl TemporalSurfaces for TestEnv {
    fn kairos_surface(&self, day_id: &str) -> Value {
        json!({ "available": false, "dayId": day_id })
    }

    fn pratibimba_surface(&self) -> Value {
        json!({ "available": false, "anchorId": Value::Null })
    }
}

impl TemporalContextEnv for TestEnv {
    fn state_root(&self) -> &Path {
        &self.state_root
    }

    fn session_store(&self) -> &SessionStore {
        &self.store
    }
}

fn env(name: &str) -> TestEnv {
    let mut root = std::env::temp_dir();
    root.push(format!("epi-being-pattern-{name}-{}", std::process::id()));
    if root.exists() {
        std::fs::remove_dir_all(&root).unwrap();
    }
    let store = SessionStore::new(&root).unwrap();
    TestEnv {
        state_root: root,
        store,
    }
}

fn registry() -> MethodRegistry<TestEnv> {
    let mut registry = MethodRegistry::new();
    register_s3_handlers(&mut registry).expect("s3' handlers register exactly once");
    registry
}

async fn call(
    registry: &MethodRegistry<TestEnv>,
    env: &TestEnv,
    method: &str,
    params: Value,
) -> Value {
    registry
        .dispatch(env, &MethodRequest::with_params(method, params))
        .await
        .unwrap_or_else(|| panic!("{method} is registered"))
        .unwrap_or_else(|err| panic!("{method} failed: {} {}", err.code, err.message))
        .result
}

#[test]
fn being_pattern_methods_route_to_s3_temporal_gateway() {
    for method in [
        BEING_PATTERN_OBSERVE_METHOD,
        BEING_PATTERN_PROJECT_METHOD,
        BEING_PATTERN_SUBSCRIBE_METHOD,
        BEING_PATTERN_REVIEW_CANDIDATE_METHOD,
    ] {
        let route = classify_method(method).expect("being pattern method should route");
        assert_eq!(route.owner, GatewayDispatchOwner::S3TemporalGateway);
        assert_eq!(route.class, GatewayDispatchClass::TemporalContext);
        assert_eq!(route.coordinate_owner, "S3'");
    }
}

#[test]
fn replay_drives_profile_consumers_from_one_generation() {
    let replay = being_pattern_acceptance_replay();
    let generation = replay.generation;

    assert_eq!(replay.user_projection.live_state.generation, generation);
    assert_eq!(replay.school_projection.live_state.generation, generation);
    assert_eq!(replay.relation_edges[0].generation, generation);
    assert_eq!(
        replay.user_projection.relation_edges[0].generation,
        generation
    );
    assert_eq!(
        replay.school_projection.relation_edges[0].generation,
        generation
    );
    assert_eq!(replay.clock_overlay_generation, generation);
    assert_eq!(replay.m4_consumer_generation, generation);
}

#[test]
fn bridge_payload_forwards_handles_without_reconstructing_stream() {
    let replay = being_pattern_acceptance_replay();
    let payload = being_pattern_bridge_handle_payload(&replay.user_projection);

    assert_eq!(payload["liveState"]["streamGeneration"], replay.generation);
    assert_eq!(
        payload["stableIdentity"]["graphAnchor"],
        "neo4j://s2/Bimba/user-being"
    );
    // 37.T37.9 (design-reconciliation 37-biological-quaternionic §37.9): the
    // flat planetaryLensAspect string was replaced by the typed
    // LensOrbiterRelationProjection edge classes. The edges stay
    // backend-supplied (kernel-computed, CCT-21 SpaceTimeDB replay) — the
    // bridge forwards them without recomputing aspects.
    let relation = &payload["m2M3Relation"];
    assert_eq!(
        relation["relationHandle"],
        "m2m3:edge:user-being:school-being:42"
    );
    assert_eq!(relation["planetPlanetEdges"][0]["aspectType"], 120);
    assert_eq!(relation["planetApertureEdges"][0]["aspectType"], 120);
    assert_eq!(
        relation["pendingDatasetBadges"].as_array().unwrap().len(),
        0,
        "DR-ENV-2 retires the outer-planet pending badge; bridge must forward the empty canonical list"
    );
    assert_eq!(relation["source"], "CCT-21 SpaceTimeDB replay");
    assert!(
        payload.get("events").is_none(),
        "bridge must not reconstruct event stream"
    );
    assert!(
        payload.pointer("/liveState/redisPsyche/state").is_some(),
        "bridge forwards Redis/Psyche state handle"
    );
    assert!(
        payload
            .pointer("/liveState/graphitiEpisodeRefs/0/episodeId")
            .is_some(),
        "bridge forwards Graphiti episode refs"
    );
}

// ===================== the repaired claim: real dispatch =====================

/// The claim the 16.T16.21 ledger made and did not have: the four methods are
/// on the S3 crate's OWN table (Track 53 residency — never an `epi-cli` arm)
/// and register into the registry the composition root builds.
#[test]
fn the_four_methods_are_registered_by_the_s3_table_itself() {
    let registry = registry();
    for method in BEING_PATTERN_METHODS {
        assert!(
            S3_METHODS.contains(&method),
            "{method} is missing from S3_METHODS — the table is the residency record"
        );
        assert!(
            registry.contains(method),
            "{method} did not register into the S-root port registry"
        );
        assert!(
            METHOD_NAMES.contains(&method),
            "{method} must stay advertised by the protocol contract"
        );
    }
    assert_eq!(registry.len(), S3_METHODS.len());
}

/// The CCT-21 acceptance scenario driven through REAL registry dispatch: two
/// entities, one FirstPerson/Mono and one ThirdPerson/Poly, one relation edge
/// carrying an elemental delta, and every consumer reading one generation.
#[tokio::test]
async fn the_acceptance_scenario_dispatches_end_to_end_through_the_registry() {
    let env = env("acceptance");
    let registry = registry();

    let user = call(
        &registry,
        &env,
        BEING_PATTERN_OBSERVE_METHOD,
        json!({
            "entityId": "user-being",
            "entityKind": "user-being",
            "perspectiveRole": "FirstPerson",
            "monopolyOperator": "Mono",
            "elementalWeights": {"fire": 0.30, "water": 0.20, "air": 0.40, "earth": 0.10},
            "clockAddress": {"degree360": 137, "tick12": 5, "hexagram": 42, "line": 3},
        }),
    )
    .await;
    assert_eq!(user["perspectiveRole"], "FirstPerson");
    assert_eq!(user["monopolyOperator"], "Mono");
    assert_eq!(user["reviewRisk"], "none");
    assert_eq!(
        user["events"],
        json!([
            "EntityObserved",
            "BeingPatternProjected",
            "PerspectiveRoleResolved",
            "MonoPolyOperatorResolved",
            "ClockAddressUpdated"
        ])
    );
    assert_eq!(user["coordinateOwner"], "S3'");
    assert_eq!(user["s2Mutated"], json!(false));

    let school = call(
        &registry,
        &env,
        BEING_PATTERN_OBSERVE_METHOD,
        json!({
            "entityId": "school-of-thought-being",
            "entityKind": "school-of-thought-being",
            "perspectiveRole": "ThirdPerson",
            "monopolyOperator": "Poly",
            "elementalWeights": {"fire": 0.40, "water": 0.15, "air": 0.35, "earth": 0.10},
            "clockAddress": {"degree360": 257, "tick12": 8},
        }),
    )
    .await;
    assert_eq!(school["perspectiveRole"], "ThirdPerson");
    assert_eq!(school["monopolyOperator"], "Poly");

    let projected = call(
        &registry,
        &env,
        BEING_PATTERN_PROJECT_METHOD,
        json!({
            "entityId": "user-being",
            "relatedEntityId": "school-of-thought-being",
        }),
    )
    .await;
    let generation = projected["generation"].as_u64().expect("a generation");
    assert_eq!(
        projected["events"],
        json!([
            "AspectEdgeComputed",
            "ElementalResonanceChanged",
            "PatternPacketFormed"
        ])
    );
    let edge = &projected["relationEdges"][0];
    assert_eq!(edge["sourceEntityId"], "user-being");
    assert_eq!(edge["targetEntityId"], "school-of-thought-being");
    assert_eq!(edge["canonStatus"], "live-only-review-required");
    // 257 - 137 = 120 degrees: the aspect-like separation is COMPUTED from the
    // two observed clock addresses, not asserted by the caller.
    assert_eq!(edge["aspectLabel"], "separation-120-degrees");
    // The elemental delta is target - source, per element.
    assert!((edge["elementalDelta"]["fire"].as_f64().unwrap() - 0.10).abs() < 1e-6);
    assert!((edge["elementalDelta"]["water"].as_f64().unwrap() + 0.05).abs() < 1e-6);
    assert_eq!(projected["s2Mutated"], json!(false));

    let subscribed = call(
        &registry,
        &env,
        BEING_PATTERN_SUBSCRIBE_METHOD,
        json!({
            "entityIds": ["user-being", "school-of-thought-being"],
            "includeAcceptanceReplay": true,
        }),
    )
    .await;
    assert_eq!(subscribed["generation"], json!(generation));
    assert_eq!(subscribed["entities"].as_array().unwrap().len(), 2);
    assert_eq!(
        subscribed["eventChain"],
        json!([
            "EntityObserved",
            "BeingPatternProjected",
            "PerspectiveRoleResolved",
            "MonoPolyOperatorResolved",
            "ClockAddressUpdated",
            "AspectEdgeComputed",
            "ElementalResonanceChanged",
            "PatternPacketFormed",
            "ReviewCandidateEmitted"
        ])
    );
    // The fixture is labelled a fixture; live observation is labelled live.
    assert_eq!(subscribed["source"], "live-producer");
    assert_eq!(
        subscribed["acceptanceReplay"]["source"],
        "acceptance-replay-fixture"
    );
    // One generation drives the 18.10 / 25.22 / 29.16 consumers.
    assert_eq!(
        subscribed["acceptanceReplay"]["m4ConsumerGeneration"],
        subscribed["acceptanceReplay"]["clockOverlayGeneration"]
    );
    assert_eq!(
        subscribed["acceptanceReplay"]["s2MutationAttempted"],
        json!(false)
    );

    // The forced-collapse hypothesis: emitted for review, S2 untouched.
    let emitted = call(
        &registry,
        &env,
        BEING_PATTERN_REVIEW_CANDIDATE_METHOD,
        json!({
            "candidateId": "candidate:actualising-one:acceptance",
            "entityIds": ["user-being", "school-of-thought-being"],
            "monopolyOperator": "ActualisingOne",
        }),
    )
    .await;
    assert_eq!(emitted["reviewRisk"], "forced-unification");
    assert_eq!(emitted["status"], "emitted-review-only");
    assert_eq!(emitted["s2Mutated"], json!(false));
    assert_eq!(emitted["events"], json!(["ReviewCandidateEmitted"]));
}

/// CCT-21 (f): only `ActualisingOne` becomes a review candidate, and the path
/// to canon is named rather than taken.
#[tokio::test]
async fn review_candidate_refuses_every_operator_but_actualising_one() {
    let env = env("review-refusal");
    let registry = registry();
    let entity_id = "review-refusal-user-being";
    call(
        &registry,
        &env,
        BEING_PATTERN_OBSERVE_METHOD,
        json!({"entityId": entity_id}),
    )
    .await;

    for operator in ["Mono", "Poly", "ActuallyMany", "PotentiallyOne", "MonoPoly"] {
        let error = registry
            .dispatch(
                &env,
                &MethodRequest::with_params(
                    BEING_PATTERN_REVIEW_CANDIDATE_METHOD,
                    json!({
                        "candidateId": "candidate:refused",
                        "entityIds": [entity_id],
                        "monopolyOperator": operator,
                    }),
                ),
            )
            .await
            .expect("the method is registered")
            .expect_err("only ActualisingOne is admitted");
        assert_eq!(error.code, "invalid-params");
        assert!(error.message.contains("ActualisingOne"), "{operator}");
    }
}

/// The producer refuses to manufacture inhabitants. An unobserved entity is a
/// `not-found`, and an empty stream says it is empty.
#[tokio::test]
async fn the_producer_never_invents_a_live_entity() {
    let env = env("no-invention");
    let registry = registry();

    let error = registry
        .dispatch(
            &env,
            &MethodRequest::with_params(
                BEING_PATTERN_PROJECT_METHOD,
                json!({"entityId": "never-observed"}),
            ),
        )
        .await
        .expect("the method is registered")
        .expect_err("an unobserved entity has no projection");
    assert_eq!(error.code, "not-found");
    assert!(error.message.contains("does not invent"));
}

/// The privacy law (kernel_bridge `ProtectedReferenceOnly`) holds on the way
/// IN as well as OUT: a protected body cannot enter the stream at all.
#[tokio::test]
async fn a_protected_body_is_refused_at_the_producer_door() {
    let env = env("privacy");
    let registry = registry();

    let error = registry
        .dispatch(
            &env,
            &MethodRequest::with_params(
                BEING_PATTERN_OBSERVE_METHOD,
                json!({
                    "entityId": "user-being",
                    "verifierRefs": [{
                        "episodeId": "episode:user-being:1",
                        "sourceRef": "graphiti:episode:user-being:1",
                        "episodeBody": "protected Nara journal text",
                    }],
                }),
            ),
        )
        .await
        .expect("the method is registered")
        .expect_err("a protected episode body is refused");
    assert_eq!(error.code, "invalid-params");
    assert!(error.message.contains("episodeBody"));
}
