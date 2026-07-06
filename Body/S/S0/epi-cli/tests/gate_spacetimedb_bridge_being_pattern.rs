use epi_logos::gate::spacetimedb_bridge::{
    being_pattern_acceptance_replay, being_pattern_bridge_handle_payload,
};

#[test]
fn s0_bridge_forwards_being_pattern_handles_only() {
    let replay = being_pattern_acceptance_replay();
    let payload = being_pattern_bridge_handle_payload(&replay.user_projection);

    assert_eq!(payload["liveState"]["streamGeneration"], replay.generation);
    assert!(payload.get("events").is_none());
    assert!(payload.pointer("/stableIdentity/graphAnchor").is_some());
    assert!(payload.pointer("/liveState/redisPsyche/presence").is_some());
    assert!(payload.pointer("/liveState/redisPsyche/state").is_some());
    assert!(payload.pointer("/liveState/streamDelta").is_some());
    // LensOrbiterRelationProjection carries typed aspect edges now (the old
    // scalar planetaryLensAspect string was retired with the aspect upgrade).
    assert!(payload
        .pointer("/m2M3Relation/planetPlanetEdges")
        .is_some());
    assert!(payload
        .pointer("/m2M3Relation/planetApertureEdges")
        .is_some());
}
