use epi_s2_graph_services::{
    ananda_vortex_property_mappings, blocked_overlay_payload, option1_projection_plan,
    PromotionPlan,
};
use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};

#[test]
fn ontology_declares_ananda_vortex_profile_handle_mapping() {
    let mappings = ananda_vortex_property_mappings();

    assert!(mappings
        .iter()
        .any(|mapping| mapping.alias == "ananda_vortex_handle"
            && mapping.neo4j_property == "m_1_2_ananda_vortex_handle"
            && mapping.ontology_property == "epi:hasAnandaVortexHandle"
            && mapping.disclosure == "public-profile-bus-typed-handle"));
    assert!(mappings
        .iter()
        .any(|mapping| mapping.alias == "ananda_vortex_cell"
            && mapping.neo4j_property == "m_1_2_ananda_vortex_cell"));
}

#[test]
fn gds_projection_advertises_ananda_vortex_handle_without_writing_canonical_graph() {
    let plan = option1_projection_plan();

    assert!(plan
        .profile_handles
        .iter()
        .any(|handle| handle == "profile.ananda_vortex"));
    assert!(plan
        .profile_handles
        .iter()
        .any(|handle| handle == "profile.ananda_vortex.active_cell_value"));

    let payload = blocked_overlay_payload("M1-2", "gds unavailable");
    assert!(payload
        .profile_handles
        .iter()
        .any(|handle| handle == "profile.ananda_vortex"));
    assert!(!payload.canonical_write_performed);
}

#[test]
fn promotion_plan_consumes_profile_ananda_vortex_as_typed_handle() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(2, 9));
    let mut plan = PromotionPlan::new("M1-2", "profile-projection").unwrap();

    plan.attach_ananda_vortex(&profile.ananda_vortex);

    assert_eq!(
        plan.properties.get("m_1_2_ananda_vortex_handle"),
        Some(&serde_json::json!("profile.ananda_vortex"))
    );
    assert_eq!(
        plan.properties.get("m_1_2_ananda_vortex_cell"),
        Some(&serde_json::json!([9, 3]))
    );
    assert_eq!(
        plan.properties.get("m_1_2_ananda_vortex_active_op"),
        Some(&serde_json::json!("diff-a"))
    );
    assert_eq!(
        plan.properties.get("m_1_2_ananda_vortex_payload"),
        Some(&serde_json::to_value(&profile.ananda_vortex).unwrap())
    );
}
