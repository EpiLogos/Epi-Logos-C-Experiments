use epi_s2_graph_schema::{
    coordinate_position_semantics, coordinate_prefix_families, coordinate_prefix_family_spec,
    coordinate_prefix_property_key, coordinate_prefix_property_key_for_axis,
    coordinate_property_construction_law, coordinate_semantic_family_specs,
    coordinate_semantic_registry, coordinate_semantic_registry_authority_paths,
    validate_coordinate_prefix_property,
};

#[test]
fn coordinate_prefix_registry_covers_all_required_families() {
    for family in ["c", "p", "l", "s", "t", "m", "q"] {
        let spec =
            coordinate_prefix_family_spec(family).unwrap_or_else(|| panic!("{family} missing"));
        assert_eq!(spec.prefix, family);

        let key = coordinate_prefix_property_key(family, 3, "queryable_detail").unwrap();
        assert_eq!(key, format!("{family}_3_queryable_detail"));
        assert!(validate_coordinate_prefix_property(&key).is_ok());
    }

    assert_eq!(
        coordinate_prefix_families(),
        &["c", "p", "l", "s", "t", "m", "q"]
    );
}

#[test]
fn coordinate_prefix_property_builder_rejects_unknown_families_and_positions() {
    assert!(coordinate_prefix_property_key("x", 3, "queryable_detail").is_err());
    assert!(coordinate_prefix_property_key("c", 6, "queryable_detail").is_err());
    assert!(coordinate_prefix_property_key("c", 3, "NotSnakeCase").is_err());
}

#[test]
fn coordinate_prefix_properties_encode_prime_inversion_with_i_segment() {
    let key = coordinate_prefix_property_key_for_axis("m", 2, true, "colour").unwrap();

    assert_eq!(key, "m_2_i_colour");
    assert!(validate_coordinate_prefix_property("m_2_i_colour").is_ok());
    assert!(validate_coordinate_prefix_property("s_4_i_runtime_boundary").is_ok());
    assert!(validate_coordinate_prefix_property("m_2_prime_colour").is_err());
    assert!(validate_coordinate_prefix_property("m_2_i").is_err());
}

#[test]
fn coordinate_semantics_registry_is_agent_complete() {
    let registry = coordinate_semantic_registry();
    let law = coordinate_property_construction_law();

    assert_eq!(registry.property_law.identity_property, "coordinate");
    assert_eq!(
        law.direct_key_pattern,
        "{family}_{position}_{semantic_suffix}"
    );
    assert_eq!(
        law.inverted_key_pattern,
        "{family}_{position}_i_{semantic_suffix}"
    );
    assert_eq!(law.inversion_marker, "i");
    assert_eq!(law.inverted_example, "m_2_i_colour");
    assert!(law
        .agent_rules
        .iter()
        .any(|rule| rule.contains("leading families are hints")));

    assert_eq!(registry.families.len(), 7);
    for family in coordinate_semantic_family_specs() {
        assert!(coordinate_prefix_families().contains(&family.prefix));
        assert!(!family.family_name.trim().is_empty());
        assert!(!family.direct_axis.trim().is_empty());
        assert!(!family.inverted_axis.trim().is_empty());
        assert!(!family.property_guidance.trim().is_empty());
    }

    assert_eq!(coordinate_position_semantics().len(), 6);
    for (position, semantics) in coordinate_position_semantics().iter().enumerate() {
        assert_eq!(semantics.position as usize, position);
        assert!(!semantics.c_role.trim().is_empty());
        assert!(!semantics.p_question.trim().is_empty());
        assert!(!semantics.property_guidance.trim().is_empty());
    }

    assert!(coordinate_semantic_registry_authority_paths().contains(&"repo-ontology.md"));
}

#[test]
fn coordinate_semantics_registry_names_m5_and_mef_scope_law() {
    let families = coordinate_semantic_family_specs();
    let find = |prefix: &str| {
        families
            .iter()
            .find(|family| family.prefix == prefix)
            .unwrap_or_else(|| panic!("{prefix} semantic family missing"))
    };

    let p = find("p");
    assert!(p.semantic_domain.contains("P contains P'"));
    assert!(p.inverted_axis.contains("implicit Klein inversion"));

    let l = find("l");
    assert!(l.semantic_domain.contains("12fold"));
    assert!(l.direct_axis.contains("L0-L5"));
    assert!(l.inverted_axis.contains("L0'-L5'"));

    let s = find("s");
    assert!(s.semantic_domain.contains("system spine"));
    assert!(s.inverted_axis.contains("S0'-S5'"));

    let m = find("m");
    assert!(m.direct_axis.contains("full Bimba map"));
    assert!(m.inverted_axis.contains("M'"));
    assert!(m.inverted_axis.contains("Pratibimba"));
}
