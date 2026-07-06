use epi_s3_gateway::dispatch::{classify_method, GatewayDispatchClass, GatewayDispatchOwner};
use epi_s3_gateway::spacetime::{
    being_pattern_acceptance_replay, being_pattern_bridge_handle_payload,
};
use epi_s3_gateway_contract::{
    BEING_PATTERN_OBSERVE_METHOD, BEING_PATTERN_PROJECT_METHOD,
    BEING_PATTERN_REVIEW_CANDIDATE_METHOD, BEING_PATTERN_SUBSCRIBE_METHOD,
};

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
        relation["pendingDatasetBadges"][0]["badge"],
        "track-23.10-pending"
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
