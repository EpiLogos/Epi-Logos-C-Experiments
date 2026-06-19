use epi_s2_graph_schema::{
    relationship_property_spec, relationship_required_evidence_property_keys, relationship_spec,
    GraphPropertyType, ARENA_DIALOGUE_OF, CLASS_PAIR_PROPERTY, DIALOGICAL_RESONANCE_AT,
    VAMA_SHAKTI_CLASS_PROPERTY,
};

#[test]
fn canonical_relationship_types_are_registered_and_ad_hoc_types_rejected() {
    for rel_type in [
        "REFERENCES",
        "SOURCES",
        "CONTAINS",
        "PART_OF",
        "ELABORATES",
        "CONTRASTS",
        "IMPLEMENTS",
        "OPERATES_IN",
        "REFLECTS_AS",
        "INVERTS_TO",
        "SUPPORTS",
        "CRITIQUES",
        "DERIVES_FROM",
        "PROMOTES_TO",
        "SYNCED_FROM",
        ARENA_DIALOGUE_OF,
        DIALOGICAL_RESONANCE_AT,
    ] {
        assert!(relationship_spec(rel_type).is_ok(), "{rel_type} missing");
    }

    assert!(relationship_spec("references").is_err());
    assert!(relationship_spec("RELATES_TO").is_err());
    assert!(relationship_spec("POS0_LINKS_TO").is_err());
}

#[test]
fn relationship_evidence_properties_are_registered() {
    for key in [
        "evidence_kind",
        "evidence_text",
        "source_path",
        "source_line",
        "target_text",
        "confidence",
        "inferred_by",
        "prompt_hash",
        "created_by_sync_version",
        "last_verified_at",
        VAMA_SHAKTI_CLASS_PROPERTY,
        CLASS_PAIR_PROPERTY,
        "scene_key",
        "kairos_anchor",
        "edge_pattern",
        "edge_weight",
    ] {
        assert!(relationship_property_spec(key).is_some(), "{key} missing");
    }

    assert_eq!(
        relationship_property_spec(VAMA_SHAKTI_CLASS_PROPERTY)
            .unwrap()
            .value_type,
        GraphPropertyType::String
    );
    assert_eq!(
        relationship_property_spec(CLASS_PAIR_PROPERTY)
            .unwrap()
            .value_type,
        GraphPropertyType::String
    );
    assert_eq!(
        relationship_property_spec("edge_weight").unwrap().value_type,
        GraphPropertyType::Float
    );

    assert_eq!(
        relationship_required_evidence_property_keys(),
        &["evidence_kind", "evidence_text"]
    );
}
