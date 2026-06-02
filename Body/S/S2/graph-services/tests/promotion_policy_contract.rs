use epi_s2_graph_services::{PromotionClass, PromotionTargetSurface, SyncCoordinator};

#[test]
fn bimba_seed_coordinate_material_targets_neo4j_coordinate_graph() {
    let decision = SyncCoordinator::classify_promotion_path("Idea/Bimba/Seeds/M/M2.md");

    assert_eq!(decision.class, PromotionClass::CanonicalBimbaSeed);
    assert_eq!(
        decision.target_surface,
        PromotionTargetSurface::Neo4jCoordinateGraph
    );
    assert!(!decision.requires_intelligent_properties);
    assert_eq!(decision.leading_property_families, vec!["c"]);
    assert_eq!(
        decision.coordinate_property_families,
        vec!["c", "p", "l", "s", "t", "m", "q"]
    );
}

#[test]
fn bimba_world_templates_request_q_property_intelligence() {
    let decision = SyncCoordinator::classify_promotion_path("Idea/Bimba/World/NOW.md");

    assert_eq!(decision.class, PromotionClass::BimbaWorldTemplate);
    assert_eq!(
        decision.target_surface,
        PromotionTargetSurface::Neo4jCoordinateGraph
    );
    assert!(decision.requires_intelligent_properties);
    assert_eq!(decision.leading_property_families, vec!["q", "c"]);
    assert_eq!(
        decision.coordinate_property_families,
        vec!["c", "p", "l", "s", "t", "m", "q"]
    );
}

#[test]
fn day_now_material_routes_to_graphiti_episodic_surface() {
    let decision = SyncCoordinator::classify_promotion_path("Idea/Empty/Present/21-05-2026/now.md");

    assert_eq!(decision.class, PromotionClass::EpisodicTemporalTrace);
    assert_eq!(
        decision.target_surface,
        PromotionTargetSurface::GraphitiEpisode
    );
    assert_eq!(decision.leading_property_families, vec!["c", "t"]);
}

#[test]
fn thought_artifacts_route_to_thought_episode_surface() {
    let decision =
        SyncCoordinator::classify_promotion_path("Idea/Pratibimba/Self/Thought/T3/T3-20260521.md");

    assert_eq!(decision.class, PromotionClass::ThoughtEpisode);
    assert_eq!(
        decision.target_surface,
        PromotionTargetSurface::GraphitiEpisode
    );
}

#[test]
fn s_stack_docs_request_s_property_intelligence() {
    let decision = SyncCoordinator::classify_promotion_path("Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md");

    assert_eq!(decision.class, PromotionClass::TechnicalCoordinateDoc);
    assert_eq!(
        decision.target_surface,
        PromotionTargetSurface::Neo4jCoordinateGraph
    );
    assert!(decision.requires_intelligent_properties);
    assert_eq!(decision.leading_property_families, vec!["s", "c"]);
    assert!(decision
        .coordinate_property_families
        .contains(&"m".to_owned()));
    assert!(decision
        .coordinate_property_families
        .contains(&"q".to_owned()));
}

#[test]
fn m_prime_docs_request_m_property_intelligence() {
    let decision = SyncCoordinator::classify_promotion_path("docs/specs/M/M4-prime-runtime.md");

    assert_eq!(decision.class, PromotionClass::TechnicalCoordinateDoc);
    assert_eq!(
        decision.target_surface,
        PromotionTargetSurface::Neo4jCoordinateGraph
    );
    assert!(decision.requires_intelligent_properties);
    assert_eq!(decision.leading_property_families, vec!["m", "c"]);
    assert!(decision
        .coordinate_property_families
        .contains(&"s".to_owned()));
    assert!(decision
        .coordinate_property_families
        .contains(&"q".to_owned()));
}

#[test]
fn repo_source_files_are_code_provenance_evidence_not_canonical_nodes() {
    let decision = SyncCoordinator::classify_promotion_path(
        "Body/S/S2/graph-services/src/sync_coordinator.rs",
    );

    assert_eq!(decision.class, PromotionClass::CodeProvenanceEvidence);
    assert_eq!(
        decision.target_surface,
        PromotionTargetSurface::EvidenceOnly
    );
    assert_eq!(decision.leading_property_families, vec!["s", "c"]);
    assert_eq!(
        decision.coordinate_property_families,
        vec!["c", "p", "l", "s", "t", "m", "q"]
    );
}
