use epi_s3_gateway_contract::{
    assert_being_pattern_public_safe, being_pattern_acceptance_replay, BeingPatternStreamEventKind,
    SpacetimeProjectionDelta, SpacetimeTableDelta, BEING_PATTERN_OBSERVE_METHOD,
    BEING_PATTERN_PROJECT_METHOD, BEING_PATTERN_REVIEW_CANDIDATE_METHOD,
    BEING_PATTERN_SUBSCRIBE_METHOD, BEING_PATTERN_TABLES, METHOD_NAMES,
};
use serde_json::json;

#[test]
fn being_pattern_methods_and_tables_are_contract_public() {
    for method in [
        BEING_PATTERN_OBSERVE_METHOD,
        BEING_PATTERN_PROJECT_METHOD,
        BEING_PATTERN_SUBSCRIBE_METHOD,
        BEING_PATTERN_REVIEW_CANDIDATE_METHOD,
    ] {
        assert!(
            METHOD_NAMES.contains(&method),
            "{method} missing from METHOD_NAMES"
        );
    }

    assert_eq!(
        BEING_PATTERN_TABLES,
        [
            "being_pattern_presence",
            "being_pattern_relation_edge",
            "being_pattern_review_candidate"
        ]
    );
}

#[test]
fn replay_emits_ordered_stream_and_projection_payload() {
    let replay = being_pattern_acceptance_replay();
    let kinds = replay
        .events
        .iter()
        .map(|event| event.kind)
        .collect::<Vec<_>>();

    assert_eq!(
        kinds,
        [
            BeingPatternStreamEventKind::EntityObserved,
            BeingPatternStreamEventKind::BeingPatternProjected,
            BeingPatternStreamEventKind::PerspectiveRoleResolved,
            BeingPatternStreamEventKind::MonoPolyOperatorResolved,
            BeingPatternStreamEventKind::ClockAddressUpdated,
            BeingPatternStreamEventKind::AspectEdgeComputed,
            BeingPatternStreamEventKind::ElementalResonanceChanged,
            BeingPatternStreamEventKind::PatternPacketFormed,
            BeingPatternStreamEventKind::ReviewCandidateEmitted,
        ]
    );

    assert_eq!(
        serde_json::to_value(replay.user_projection.perspective_role).unwrap(),
        "FirstPerson"
    );
    assert_eq!(
        serde_json::to_value(replay.user_projection.monopoly_operator).unwrap(),
        "Mono"
    );
    assert_eq!(
        serde_json::to_value(replay.school_projection.perspective_role).unwrap(),
        "ThirdPerson"
    );
    assert_eq!(
        serde_json::to_value(replay.school_projection.monopoly_operator).unwrap(),
        "Poly"
    );
    assert_eq!(
        serde_json::to_value(replay.review_candidate.review_risk).unwrap(),
        "forced-unification"
    );
    assert!(!replay.s2_mutation_attempted);
    assert_eq!(
        replay.user_projection.stable_identity.graph_anchor,
        "neo4j://s2/Bimba/user-being"
    );
    let relation_projection = &replay.user_projection.relation_edges[0].m2_m3_relation;
    assert_eq!(
        relation_projection.relation_handle,
        "m2m3:edge:user-being:school-being:42"
    );
    assert_eq!(relation_projection.planet_planet_edges.len(), 1);
    assert_eq!(relation_projection.planet_planet_edges[0].aspect_type, 120);
    assert_eq!(relation_projection.planet_aperture_edges.len(), 1);
    assert!(
        relation_projection.pending_dataset_badges.is_empty(),
        "DR-ENV-2 retires the outer-planet pending badge; outer planets are canonical ambient-condition edges"
    );
}

#[test]
fn being_pattern_delta_variants_decode_from_spacetimedb_tables() {
    let message = json!({
        "TransactionUpdate": {
            "status": {
                "Committed": {
                    "tables": [
                        {
                            "table_name": "being_pattern_presence",
                            "updates": [{"inserts": [{"entity_id": "user-being"}]}]
                        },
                        {
                            "table_name": "being_pattern_relation_edge",
                            "updates": [{"inserts": [{"edge_id": "edge:user:school"}]}]
                        },
                        {
                            "table_name": "being_pattern_review_candidate",
                            "updates": [{"inserts": [{"candidate_id": "candidate:forced"}]}]
                        }
                    ]
                }
            }
        }
    });

    let delta = SpacetimeProjectionDelta::from_subscription_message(&message).unwrap();

    assert!(matches!(
        &delta.inserts[0],
        SpacetimeTableDelta::BeingPatternPresence { row } if row["entity_id"] == "user-being"
    ));
    assert!(matches!(
        &delta.inserts[1],
        SpacetimeTableDelta::BeingPatternRelationEdge { row } if row["edge_id"] == "edge:user:school"
    ));
    assert!(matches!(
        &delta.inserts[2],
        SpacetimeTableDelta::BeingPatternReviewCandidate { row } if row["candidate_id"] == "candidate:forced"
    ));
}

#[test]
fn public_safety_guard_refuses_graphiti_bodies_and_raw_quaternions() {
    let safe = json!({
        "episodeRefs": [{"episodeId": "ep-1", "sourceRef": "graphiti:ep-1", "publicSummary": "safe"}],
        "liveState": {"generation": 42}
    });
    assert_being_pattern_public_safe(&safe).unwrap();

    let leaked_body = json!({"episodeBody": "protected journal text"});
    assert!(assert_being_pattern_public_safe(&leaked_body)
        .unwrap_err()
        .contains("episodeBody"));

    let leaked_quaternion = json!({"qB": [0.0, 1.0, 0.0, 0.0]});
    assert!(assert_being_pattern_public_safe(&leaked_quaternion)
        .unwrap_err()
        .contains("qB"));
}
