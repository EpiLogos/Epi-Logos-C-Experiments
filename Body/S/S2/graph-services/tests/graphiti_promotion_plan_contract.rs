use epi_s2_graph_services::{GraphitiEpisodePlan, PromotionClass, SyncCoordinator};
use epi_s3_gateway_contract::{GRAPHITI_INVOCATION_OWNER, GRAPHITI_RUNTIME_AUTHORITY};

#[test]
fn day_now_paths_plan_graphiti_episode_not_neo4j_node() {
    let plan = SyncCoordinator::plan_graphiti_episode(
        "Idea/Empty/Present/22-05-2026/session/now.md",
        Some("C0/T5"),
    )
    .unwrap();

    assert_eq!(plan.class, PromotionClass::EpisodicTemporalTrace);
    assert_eq!(plan.target_surface, "graphiti_episode");
    assert_eq!(plan.runtime_authority, GRAPHITI_RUNTIME_AUTHORITY);
    assert_eq!(plan.invocation_owner, GRAPHITI_INVOCATION_OWNER);
    assert_eq!(plan.gateway_method, "s5.episodic.deposit");
    assert!(plan
        .adapter_required_capabilities
        .contains(&"add_episode".to_owned()));
    assert!(!plan.creates_neo4j_coordinate_node);
    assert_eq!(plan.source_coordinate.as_deref(), Some("C0/T5"));
}

#[test]
fn thought_paths_plan_graphiti_thought_episode() {
    let plan = SyncCoordinator::plan_graphiti_episode(
        "Idea/Pratibimba/Self/Thought/T3/T3-20260522.md",
        None,
    )
    .unwrap();

    assert_eq!(plan.class, PromotionClass::ThoughtEpisode);
    assert_eq!(plan.target_surface, "graphiti_episode");
    assert!(plan.episode_kind.contains("thought"));
}

#[test]
fn non_episodic_paths_are_rejected_for_graphiti_episode_plan() {
    let err = SyncCoordinator::plan_graphiti_episode("Idea/Bimba/Seeds/M/M2.md", None).unwrap_err();

    assert!(err.contains("does not route to Graphiti"));
}

#[allow(dead_code)]
fn assert_send_sync(_: GraphitiEpisodePlan) {}
