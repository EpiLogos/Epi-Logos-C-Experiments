use portal_core::{
    build_psychoid_cymatic_renderer_handle, dr_ig_6_geometry, kernel_tick_from_epogdoon,
    MathemeHarmonicProfile, PsychoidCymaticGeometryRole, PsychoidCymaticSolverStrategy,
};

#[test]
fn renderer_handle_consumes_profile_bus_without_exposing_field_body() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 8));
    let handle =
        build_psychoid_cymatic_renderer_handle(&profile, PsychoidCymaticSolverStrategy::OptionF);
    let json = serde_json::to_value(&handle).expect("handle serializes");

    assert_eq!(handle.geometry_law, "DR-IG-6");
    assert_eq!(handle.privacy_class, "protected-local-handle-only");
    assert_eq!(handle.tick, profile.tick);
    assert_eq!(handle.tick12, profile.tick12);
    assert_eq!(handle.solver_strategy, PsychoidCymaticSolverStrategy::OptionF);
    assert!(handle
        .renderer_handle
        .starts_with("psychoid-cymatic://renderer/dr-ig-6/"));
    assert_eq!(handle.audio_bus_digest.len(), 64);
    assert_eq!(handle.nodal_digest.len(), 64);

    let encoded = serde_json::to_string(&json).expect("json encodes");
    assert!(!encoded.contains("audioOctet"));
    assert!(!encoded.contains("nodalQuartet"));
    assert!(!encoded.contains("fieldBody"));
    assert!(!encoded.contains("rawField"));
}

#[test]
fn renderer_handle_changes_when_audio_or_nodal_bus_changes() {
    let mut first = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(2, 1));
    let mut second = first.clone();
    second.audio_octet[0] += 0.25;
    let first_handle =
        build_psychoid_cymatic_renderer_handle(&first, PsychoidCymaticSolverStrategy::OptionS);
    let second_handle =
        build_psychoid_cymatic_renderer_handle(&second, PsychoidCymaticSolverStrategy::OptionS);

    assert_ne!(first_handle.renderer_handle, second_handle.renderer_handle);
    assert_ne!(first_handle.audio_bus_digest, second_handle.audio_bus_digest);

    first.nodal_quartet[0].m = first.nodal_quartet[0].m.saturating_add(1);
    let nodal_handle =
        build_psychoid_cymatic_renderer_handle(&first, PsychoidCymaticSolverStrategy::OptionS);
    assert_ne!(first_handle.nodal_digest, nodal_handle.nodal_digest);
}

#[test]
fn dr_ig_6_geometry_uses_apex_poles_interleaved_base_and_axis_points() {
    let geometry = dr_ig_6_geometry();
    let ids: Vec<&str> = geometry.vertices.iter().map(|vertex| vertex.id).collect();

    assert_eq!(
        ids,
        vec![
            "P5", "P5'", "P1", "P1'", "P2", "P2'", "P3", "P3'", "P4", "P4'", "P0", "P0'"
        ]
    );
    assert_eq!(geometry.vertices.len(), 12);
    assert_eq!(geometry.vertices[0].role, PsychoidCymaticGeometryRole::ApexPole);
    assert_eq!(geometry.vertices[1].role, PsychoidCymaticGeometryRole::ApexPole);
    assert_eq!(geometry.vertices[10].role, PsychoidCymaticGeometryRole::CentralAxisPoint);
    assert_eq!(geometry.vertices[11].role, PsychoidCymaticGeometryRole::CentralAxisPoint);
    assert_eq!(geometry.contract_note, "apex-poles + interleaved-base + central-axis");
}
