use std::path::PathBuf;

use epi_s1_hen_compiler_core::{graph_sync_intent, GraphSyncMode};

#[test]
fn canonical_graph_sync_intent_targets_bimba_without_live_mutation() {
    let intent = graph_sync_intent(
        "S1'",
        PathBuf::from("/vault/Pratibimba/Self/Thought/T/T4/spine-smoke.md"),
        None,
    )
    .expect("canonical intent");

    assert_eq!(intent.mode, GraphSyncMode::CanonicalWrite);
    assert_eq!(intent.target_label, "Bimba");
    assert_eq!(intent.coordinate_property, "coordinate");
    assert_eq!(intent.coordinate, "S1'");
    assert!(!intent.touches_live_graph);
    assert!(intent.compatibility_source_label.is_none());
}

#[test]
fn legacy_graph_sync_intent_requests_bimba_coordinate_migration() {
    let intent = graph_sync_intent(
        "#4",
        PathBuf::from("/vault/legacy.md"),
        Some("BimbaCoordinate"),
    )
    .expect("migration intent");

    assert_eq!(intent.mode, GraphSyncMode::MigrateLegacyCoordinate);
    assert_eq!(intent.target_label, "Bimba");
    assert_eq!(intent.coordinate_property, "coordinate");
    assert_eq!(
        intent.compatibility_source_label.as_deref(),
        Some("BimbaCoordinate")
    );
    assert_eq!(
        intent.compatibility_source_property.as_deref(),
        Some("bimbaCoordinate")
    );
    assert!(!intent.touches_live_graph);
}

#[test]
fn graph_sync_intent_rejects_invalid_coordinate_before_s2() {
    let error = graph_sync_intent("X9", PathBuf::from("/vault/bad.md"), None).unwrap_err();
    assert_eq!(error, "invalid graph sync coordinate: X9");
}
