use epi_s2_graph_services::seed::{coord_uuid, seed_coordinate_space};

#[test]
fn coordinate_uuid_generation_is_deterministic_s2_seed_law() {
    assert_eq!(coord_uuid("#4"), coord_uuid("#4"));
    assert_ne!(coord_uuid("#4"), coord_uuid("M4"));
    assert_eq!(coord_uuid("#4").len(), 36);
}

#[test]
fn coordinate_seed_entrypoint_is_owned_by_s2_graph_services() {
    let function_name = std::any::type_name_of_val(&seed_coordinate_space);

    assert!(function_name.contains("epi_s2_graph_services"));
}
