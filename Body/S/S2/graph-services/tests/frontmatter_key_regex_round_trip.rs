//! CCT-16 (i) — the `{family}_{n}_{i?}_{semantic}` shape law (DR-S1-6):
//! codified families survive verbatim, the vault prime form canonicalises
//! to the graph `_i_` form (both survive as DISTINCT keys), the DR-M4-4
//! private q-partition is rejected, and an unknown coordinate-key family
//! is a lint ERROR — never a silent drop.

use epi_s2_graph_services::{
    plan_frontmatter_properties, resolve_frontmatter_key, FrontmatterKeyResolution,
};

#[test]
fn codified_families_survive_verbatim_by_shape() {
    for (key, expected) in [
        ("q_5_integration_template", "q_5_integration_template"),
        ("qm_2_carrier_signal", "qm_2_carrier_signal"),
        ("c_5_birth_codon", "c_5_birth_codon"),
        ("p_3_pattern_structure", "p_3_pattern_structure"),
        ("s_1_vault_path", "s_1_vault_path"),
        ("t_0_thought_type", "t_0_thought_type"),
        ("m_4_nara_domain", "m_4_nara_domain"),
        ("l_2_breath_pattern", "l_2_breath_pattern"),
    ] {
        assert_eq!(
            resolve_frontmatter_key(key),
            FrontmatterKeyResolution::Canonical(expected.to_owned()),
            "{key} must survive by shape"
        );
    }
}

#[test]
fn inverted_prime_form_canonicalises_and_both_forms_stay_distinct() {
    assert_eq!(
        resolve_frontmatter_key("q_5'_integration_template"),
        FrontmatterKeyResolution::Canonical("q_5_i_integration_template".to_owned())
    );
    assert_eq!(
        resolve_frontmatter_key("q_5_i_integration_template"),
        FrontmatterKeyResolution::Canonical("q_5_i_integration_template".to_owned())
    );
    // DR-S1-6: canonical + inverted are DISTINCT properties on one node.
    let yaml: serde_yaml::Value = serde_yaml::from_str(
        "coordinate: S3\nq_5_integration_template: canonical-side\n\"q_5'_integration_template\": inverted-side\n",
    )
    .unwrap();
    let properties = plan_frontmatter_properties(yaml).unwrap();
    assert_eq!(
        properties.get("q_5_integration_template").map(String::as_str),
        Some("canonical-side")
    );
    assert_eq!(
        properties
            .get("q_5_i_integration_template")
            .map(String::as_str),
        Some("inverted-side")
    );
}

#[test]
fn dr_m4_4_private_q_partition_is_rejected() {
    for key in [
        "q_personal",
        "q_identity",
        "q_activity",
        "q_composed",
        "q_personal_vector",
        "q_composed_snapshot",
    ] {
        assert_eq!(
            resolve_frontmatter_key(key),
            FrontmatterKeyResolution::RejectedPrivacy,
            "{key} must never cross the sync boundary"
        );
    }
    let yaml: serde_yaml::Value =
        serde_yaml::from_str("coordinate: S3\nq_personal_vector: SECRET\nq_5_ok: fine\n").unwrap();
    let properties = plan_frontmatter_properties(yaml).unwrap();
    assert!(!properties.values().any(|value| value == "SECRET"));
    assert_eq!(properties.get("q_5_ok").map(String::as_str), Some("fine"));
}

#[test]
fn unknown_family_is_a_lint_error_not_a_silent_drop() {
    match resolve_frontmatter_key("z_3_mystery") {
        FrontmatterKeyResolution::UnknownFamily(error) => {
            assert!(error.contains("unknown coordinate-key family"), "{error}");
            assert!(error.contains("z_3_mystery"));
        }
        other => panic!("z_3_mystery must be an UnknownFamily lint error, got {other:?}"),
    }
    let yaml: serde_yaml::Value =
        serde_yaml::from_str("coordinate: S3\nz_3_mystery: value\n").unwrap();
    assert!(plan_frontmatter_properties(yaml).is_err());
}

#[test]
fn plain_metadata_keys_keep_alias_or_skip_behaviour() {
    assert_eq!(
        resolve_frontmatter_key("essence"),
        FrontmatterKeyResolution::Alias("c_0_essence")
    );
    assert_eq!(
        resolve_frontmatter_key("aliases"),
        FrontmatterKeyResolution::NotCoordinate
    );
    assert_eq!(
        resolve_frontmatter_key("created_at"),
        FrontmatterKeyResolution::NotCoordinate
    );
    // Malformed coordinate-ish shapes are metadata, not errors.
    assert_eq!(
        resolve_frontmatter_key("q_9_out_of_range"),
        FrontmatterKeyResolution::NotCoordinate
    );
    assert_eq!(
        resolve_frontmatter_key("c_5_"),
        FrontmatterKeyResolution::NotCoordinate
    );
    assert_eq!(
        resolve_frontmatter_key("c_5_UPPER"),
        FrontmatterKeyResolution::NotCoordinate
    );
}
