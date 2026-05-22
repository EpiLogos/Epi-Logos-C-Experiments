use epi_s2_graph_services::{CodeProvenanceEvidence, SyncCoordinator};

#[test]
fn plans_s_stack_code_provenance_as_evidence_properties() {
    let evidence = CodeProvenanceEvidence {
        repo_path: "Body/S/S2/graph-services/src/sync_coordinator.rs".to_owned(),
        repo_root: "/repo".to_owned(),
        file_kind: "rust_source".to_owned(),
        component: "graph-services".to_owned(),
        symbol_refs: vec!["SyncCoordinator::validate_property_proposals".to_owned()],
        execution_flow_refs: vec!["Hen -> S2 property proposal validation".to_owned()],
        depends_on_paths: vec!["Body/S/S2/graph-schema/src/lib.rs".to_owned()],
        owned_by_coordinate: "S2".to_owned(),
    };

    let properties = SyncCoordinator::plan_code_provenance_properties("S2", &evidence).unwrap();

    assert_eq!(
        properties
            .get("s_0_repo_path")
            .and_then(|value| value.as_str()),
        Some("Body/S/S2/graph-services/src/sync_coordinator.rs")
    );
    assert_eq!(
        properties
            .get("s_0_owned_by_coordinate")
            .and_then(|value| value.as_str()),
        Some("S2")
    );
    assert_eq!(
        properties
            .get("s_0_symbol_refs")
            .and_then(|value| value.as_array())
            .unwrap()
            .len(),
        1
    );
}

#[test]
fn plans_m_prime_code_provenance_without_reusing_s_keys() {
    let evidence = CodeProvenanceEvidence {
        repo_path: "Body/M/M0/runtime.rs".to_owned(),
        repo_root: "/repo".to_owned(),
        file_kind: "rust_source".to_owned(),
        component: "m-prime-runtime".to_owned(),
        symbol_refs: vec!["MPrimeRuntime".to_owned()],
        execution_flow_refs: vec![],
        depends_on_paths: vec![],
        owned_by_coordinate: "M0'".to_owned(),
    };

    let properties = SyncCoordinator::plan_code_provenance_properties("M0'", &evidence).unwrap();

    assert!(properties.contains_key("m_0_repo_path"));
    assert!(properties.contains_key("m_0_component"));
    assert!(properties.contains_key("m_0_symbol_refs"));
    assert!(!properties.contains_key("s_0_repo_path"));
}
