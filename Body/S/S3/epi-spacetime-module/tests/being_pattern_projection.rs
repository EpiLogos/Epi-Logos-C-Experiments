const MODULE_SOURCE: &str = include_str!("../src/lib.rs");

#[test]
fn spacetime_module_declares_being_pattern_tables_and_reducers() {
    for table in [
        "being_pattern_presence",
        "being_pattern_relation_edge",
        "being_pattern_review_candidate",
    ] {
        assert!(
            MODULE_SOURCE.contains(table),
            "SpaceTimeDB module missing table {table}"
        );
    }

    for reducer in [
        "observe_being_pattern_entity",
        "project_being_pattern_relation",
        "emit_being_pattern_review_candidate",
    ] {
        assert!(
            MODULE_SOURCE.contains(reducer),
            "SpaceTimeDB module missing reducer {reducer}"
        );
    }
}

#[test]
fn spacetime_module_names_ordered_stream_without_protected_body_fields() {
    for event in [
        "EntityObserved",
        "BeingPatternProjected",
        "PerspectiveRoleResolved",
        "MonoPolyOperatorResolved",
        "ClockAddressUpdated",
        "AspectEdgeComputed",
        "ElementalResonanceChanged",
        "PatternPacketFormed",
        "ReviewCandidateEmitted",
    ] {
        assert!(MODULE_SOURCE.contains(event), "missing event {event}");
    }

    for forbidden in ["episode_body", "protected_nara_body", "raw_quaternion"] {
        assert!(
            !MODULE_SOURCE.contains(forbidden),
            "SpaceTimeDB live projection must not carry {forbidden}"
        );
    }
}
