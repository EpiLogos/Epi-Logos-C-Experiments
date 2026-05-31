//! Track 02 T1 — Schema and relation-law convergence contract test.
//!
//! Locks three convergences:
//!
//! 1. **Seed-emitted topology**: every relationship type emitted by
//!    `Body/S/S2/graph-services/src/seed.rs` is either a canonical
//!    `GraphRelationshipTypeSpec` (compatibility: false) or an explicitly
//!    listed compatibility entry. Drift fails.
//! 2. **Deep-dataset class**: the convention used for relation types in
//!    `docs/datasets/{*}-deep/relations.json` is recognised by
//!    `is_deep_dataset_relation_type` and classified as
//!    `RelationshipTypeClass::DeepDataset` without per-instance registration.
//! 3. **Anuttara node property contract**: `c_1_symbol`,
//!    `c_1_formulation_type`, and `c_1_complete_formulation` are all present
//!    as canonical node specs on `C1` with public disclosure.

use epi_s2_graph_schema::{
    classify_relationship_type, is_deep_dataset_relation_type, node_property_spec,
    relationship_spec, GraphPropertyDisclosure, GraphPropertyOwner, RelationshipTypeClass,
};

const SEED_EMITTED_TOPOLOGY: &[&str] = &[
    "GENERATES",
    "ENTANGLES",
    "INTERLEAVES",
    "MANIFESTS",
    "BEDROCK",
    "INVERTS_TO",
    "FAMILY_CONTAINS",
    "REFLECTS_AS",
    "OPERATES_IN",
    "MOBIUS_RETURN",
    "ANCHORED_TO",
];

#[test]
fn every_seed_emitted_relation_is_a_canonical_registry_entry() {
    for rel_type in SEED_EMITTED_TOPOLOGY {
        let spec = relationship_spec(rel_type).unwrap_or_else(|err| {
            panic!("seed-emitted {rel_type} is not canonical: {err}")
        });
        assert_eq!(spec.rel_type, *rel_type);
        assert!(
            !spec.compatibility,
            "seed-emitted topology relation {rel_type} must be canonical (compatibility=false), not a compatibility entry"
        );
        assert_eq!(
            classify_relationship_type(rel_type),
            RelationshipTypeClass::Canonical
        );
    }
}

#[test]
fn deep_dataset_relation_convention_is_recognised_without_per_instance_registration() {
    // Representative sample drawn from the docs/datasets/*-deep/relations.json corpus.
    let samples = [
        "ARCHETYPAL_RESONANCE_ACTIVE_AGENCY",
        "ARCHETYPAL_RESONANCE_BLISSFUL_DANCE",
        "ARCHETYPAL_RESONANCE_FOUNDATIONAL_LOGIC",
        "MIRRORS_SVATANTRYA",
        "ABHINAVAGUPTA_RESONANCE_07",
        "ACHIEVES_SIVA_SHAKTI_UNITY",
        "ARCHETYPAL_NUMBER_FOUNDATION_ORIGINAL",
    ];
    for rel_type in samples {
        assert!(
            is_deep_dataset_relation_type(rel_type),
            "{rel_type} should be deep-dataset"
        );
        assert_eq!(
            classify_relationship_type(rel_type),
            RelationshipTypeClass::DeepDataset
        );
    }
}

#[test]
fn deep_dataset_classifier_does_not_capture_registered_or_lowercase_or_malformed() {
    // Canonical names in the registry must NOT classify as deep-dataset.
    for canonical in ["REFERENCES", "GENERATES", "MOBIUS_RETURN"] {
        assert!(!is_deep_dataset_relation_type(canonical));
        assert_eq!(
            classify_relationship_type(canonical),
            RelationshipTypeClass::Canonical
        );
    }
    // Compatibility entries also don't classify as deep-dataset.
    for compat in ["POS0_LINKS_TO", "POS5_INTEGRATES_INTO"] {
        assert!(!is_deep_dataset_relation_type(compat));
        assert_eq!(
            classify_relationship_type(compat),
            RelationshipTypeClass::Compatibility
        );
    }
    // Malformed strings classify as drift.
    for bad in [
        "lowercase_relation",
        "Mixed_Case",
        "DOUBLE__UNDERSCORE",
        "TRAILING_",
        "1NUMERIC_FIRST",
        "WITH-DASH",
        "",
    ] {
        assert!(
            !is_deep_dataset_relation_type(bad),
            "{bad} should NOT classify as deep-dataset"
        );
        assert_eq!(
            classify_relationship_type(bad),
            RelationshipTypeClass::Drift,
            "{bad} should classify as Drift"
        );
    }
}

#[test]
fn anuttara_language_node_properties_are_canonical_on_c1() {
    for key in ["c_1_symbol", "c_1_formulation_type", "c_1_complete_formulation"] {
        let spec = node_property_spec(key)
            .unwrap_or_else(|| panic!("Anuttara field {key} missing from node property registry"));
        assert_eq!(spec.key, key, "property key mismatch");
        assert_eq!(spec.coordinate_home, "C1", "{key} must live at C1");
        assert!(matches!(spec.owner, GraphPropertyOwner::Node));
        assert!(
            matches!(spec.disclosure, GraphPropertyDisclosure::Public),
            "{key} must be Public disclosure (S2 owns the storage contract)"
        );
        assert!(!spec.compatibility, "{key} must not be a compatibility entry");
    }
}

#[test]
fn drift_class_catches_unregistered_non_deep_dataset_strings() {
    // The plan body explicitly rejects ad-hoc relationship drift. Confirm the
    // classifier returns Drift (not silently DeepDataset) for plausible-but-
    // unregistered casing patterns.
    assert_eq!(
        classify_relationship_type("AdHocRelation"),
        RelationshipTypeClass::Drift
    );
    assert_eq!(
        classify_relationship_type("relates_to"),
        RelationshipTypeClass::Drift
    );
}
