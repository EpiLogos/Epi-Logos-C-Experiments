use epi_s2_graph_schema::{
    relationship_property_spec, relationship_required_evidence_property_keys, relationship_spec,
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
    ] {
        assert!(relationship_property_spec(key).is_some(), "{key} missing");
    }

    assert_eq!(
        relationship_required_evidence_property_keys(),
        &["evidence_kind", "evidence_text"]
    );
}
