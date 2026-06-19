use epi_s2_graph_services::{
    CoordLayer, CoordinateArrayParser, CoordinateSearchScope, GraphRetrievalQuery, QueryType,
    RetrievalMode, RetrievalResult,
};

#[test]
fn coordinate_parser_accepts_full_bimba_vak_and_m_prime_surface() {
    let psychoid = CoordinateArrayParser::parse_one("#4").unwrap();
    assert_eq!(psychoid.layer, CoordLayer::Psychoid);
    assert_eq!(psychoid.ql_position, Some(4));

    let m_prime = CoordinateArrayParser::parse_one("M4'").unwrap();
    assert_eq!(m_prime.layer, CoordLayer::Family);
    assert_eq!(m_prime.family.as_deref(), Some("M"));
    assert_eq!(m_prime.ql_position, Some(4));
    assert!(m_prime.inverted);

    let context_frame = CoordinateArrayParser::parse_one("CF_FRACTAL").unwrap();
    assert_eq!(context_frame.layer, CoordLayer::ContextFrame);
    assert_eq!(context_frame.ql_position, Some(4));

    let vak = CoordinateArrayParser::parse_one("CPF").unwrap();
    assert_eq!(vak.layer, CoordLayer::Vak);
    assert_eq!(vak.ql_position, Some(0));
}

#[test]
fn coordinate_parser_extracts_wikilink_frontmatter_arrays() {
    let yaml: serde_yaml::Value = serde_yaml::from_str(
        r#"
coordinate: "M4"
c_0_ground: "[[Bimba/Seeds/C/C0|Bimba]]"
p_3_pattern: "[[P3|Pattern]]"
t_5_insight:
  - "[[T5|Insight]]"
  - "[[Bimba/Seeds/T/T5]]"
name: "Nara"
"#,
    )
    .unwrap();

    let arrays = CoordinateArrayParser::parse_frontmatter_arrays(&yaml);
    let keys: Vec<&str> = arrays.iter().map(|(key, _)| key.as_str()).collect();
    assert_eq!(arrays.len(), 3);
    assert!(keys.contains(&"c_0_ground"));
    assert!(keys.contains(&"p_3_pattern"));
    assert!(keys.contains(&"t_5_insight"));
}

#[test]
fn graph_retrieval_query_contract_classifies_mentions_and_positions() {
    let query = GraphRetrievalQuery::from_text("How does #4 relate to CF_FRACTAL and C4'?");

    assert_eq!(query.query_type, QueryType::HowDoes);
    assert_eq!(query.coordinate_mentions, vec!["#4", "CF_FRACTAL", "C4'"]);
    assert_eq!(query.c_layer_metadata.len(), 1);
    assert_eq!(
        query.c_layer_metadata[0].semantic_authority,
        "non_authoritative_pending_c_prime_vak_ancestry_audit"
    );
    assert_eq!(query.query_type.as_str(), "how_does");

    let inferred = GraphRetrievalQuery::from_text("How does the foundation context integrate?");
    assert_eq!(inferred.inferred_positions, vec![0, 4, 5]);
}

#[test]
fn c_layer_parser_surfaces_authority_metadata_and_prime_audit() {
    let c2 = CoordinateArrayParser::parse_one("C2").unwrap();
    let c2_meta = c2.c_layer_metadata.expect("C2 metadata missing");
    assert_eq!(c2_meta.c_layer_role, "entities_properties_tags");
    assert_eq!(c2_meta.semantic_authority, "authoritative");
    assert_eq!(
        c2_meta.world_type_path,
        Some("Idea/Bimba/World/Types/Coordinates/C/C2")
    );
    assert_eq!(c2_meta.crystallisation_state, "incubating_type_index");

    let c4_prime = CoordinateArrayParser::parse_one("C4'").unwrap();
    let c4_prime_meta = c4_prime.c_layer_metadata.expect("C-prime metadata missing");
    assert_eq!(c4_prime_meta.c_layer_role, "cfp_reflective_scaffold");
    assert_eq!(
        c4_prime_meta.semantic_authority,
        "non_authoritative_pending_c_prime_vak_ancestry_audit"
    );
    assert_eq!(c4_prime_meta.world_type_path, None);
    assert_eq!(c4_prime_meta.crystallisation_state, "audit_pending");
}

#[test]
fn coordinate_search_scope_bounds_stack_mprime_and_bimba_queries() {
    let technical = CoordinateSearchScope::from_query_text(
        "bounded technical stack search for S/S' graph CRUD and S5' improvement",
    );
    assert_eq!(technical.scope_id(), "technical_stack");
    assert!(technical.matches_coordinate("S2-3"));
    assert!(technical.matches_coordinate("S5-5'"));
    assert!(!technical.matches_coordinate("M5-2"));

    let pratibimba =
        CoordinateSearchScope::from_query_text("M' electron app expression for M5-4' agents");
    assert_eq!(pratibimba.scope_id(), "pratibimba_expression");
    assert!(pratibimba.matches_coordinate("M5-4'"));
    assert!(!pratibimba.matches_coordinate("M5-4"));

    let bimba = CoordinateSearchScope::from_query_text("full bimba map query around M5-2");
    assert_eq!(bimba.scope_id(), "bimba_map");
    assert!(bimba.matches_coordinate("M5-2"));
    assert!(bimba.matches_coordinate("#4"));
}

#[test]
fn c_layer_scope_triggers_type_ontology_terms_and_explicit_c_mentions() {
    let entity_scope =
        CoordinateSearchScope::from_query_text("entity property alias relation field");
    assert_eq!(entity_scope.scope_id(), "c_layer_type_ontology");
    assert!(entity_scope.matches_coordinate("C2"));
    assert!(!entity_scope.matches_coordinate("M5-2"));

    let diagram_scope = CoordinateSearchScope::from_query_text("architecture diagram canvas MOC");
    assert_eq!(diagram_scope.scope_id(), "c_layer_type_ontology");
    assert!(diagram_scope.matches_coordinate("C3"));
    assert!(diagram_scope.matches_coordinate("C4"));
    assert!(!diagram_scope.matches_coordinate("S2"));

    let explicit = CoordinateSearchScope::from_query_text("show C5 World graduation");
    assert_eq!(explicit.scope_id(), "c_layer_type_ontology");
    assert!(explicit.matches_coordinate("C5"));
}

#[test]
fn retrieval_result_contract_serializes_cacheable_mode_named_results() {
    assert_eq!(RetrievalMode::HybridRrf.as_str(), "hybrid_rrf");
    assert_eq!(RetrievalMode::GraphOnly.as_str(), "graph_only");

    let result = RetrievalResult {
        coordinate: "#4".into(),
        score: 12.5,
        source: "graph".into(),
        data: serde_json::json!({"coordinate": "#4", "family": "Bimba"}),
    };

    let serialized = serde_json::to_string(&vec![result.clone()]).unwrap();
    let roundtrip: Vec<RetrievalResult> = serde_json::from_str(&serialized).unwrap();

    assert_eq!(roundtrip, vec![result]);
}
