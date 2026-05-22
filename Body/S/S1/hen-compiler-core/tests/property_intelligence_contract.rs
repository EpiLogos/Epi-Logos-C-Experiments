use epi_s1_hen_compiler_core::artifact_evidence::collect_artifact_evidence;
use epi_s1_hen_compiler_core::property_intelligence::build_property_intelligence_request;

#[test]
fn property_intelligence_request_carries_full_coordinate_schema_scope() {
    let evidence = collect_artifact_evidence(
        "docs/specs/S/S2-S2i-GRAPH.md",
        "---\ncoordinate: S2\ntitle: Graph\n---\n# Graph\n\nLinks [[M2']] and [[Q4]].",
    )
    .unwrap();

    let request = build_property_intelligence_request(
        &evidence,
        "technical_coordinate_doc",
        &["c", "p", "l", "s", "t", "m", "q"],
        &["s", "c"],
        &["coordinate", "s_4_i_runtime_boundary", "m_2_i_colour"],
    )
    .unwrap();

    assert_eq!(request.source_coordinate.as_deref(), Some("S2"));
    assert_eq!(request.promotion_class, "technical_coordinate_doc");
    assert_eq!(
        request.coordinate_property_families,
        vec!["c", "p", "l", "s", "t", "m", "q"]
    );
    assert_eq!(request.leading_property_families, vec!["s", "c"]);
    assert_eq!(request.wikilink_evidence.len(), 2);
    assert_eq!(request.headings[0].title, "Graph");
    assert!(request.content_hash.starts_with("sha256:"));
    assert!(request.markdown_body_hash.starts_with("sha256:"));
}

#[test]
fn property_intelligence_request_does_not_choose_model_provider() {
    let evidence = collect_artifact_evidence(
        "Idea/Bimba/World/NOW.md",
        "---\ncoordinate: Q4\n---\n# NOW\n\nTemplate [[S1]].",
    )
    .unwrap();

    let request = build_property_intelligence_request(
        &evidence,
        "bimba_world_template",
        &["c", "p", "l", "s", "t", "m", "q"],
        &["q", "c"],
        &["q_4_template_role", "c_1_name"],
    )
    .unwrap();
    let value = serde_json::to_value(&request).unwrap();

    assert!(value.get("provider").is_none());
    assert!(value.get("model").is_none());
    assert!(value.get("api_key").is_none());
    assert!(value.get("apiKey").is_none());
}

#[test]
fn property_intelligence_contract_names_i_as_prime_inversion_marker() {
    let evidence = collect_artifact_evidence(
        "docs/specs/M/M2-prime-colour.md",
        "---\ncoordinate: M2'\n---\n# M2 Prime Colour\n",
    )
    .unwrap();

    let request = build_property_intelligence_request(
        &evidence,
        "technical_coordinate_doc",
        &["c", "p", "l", "s", "t", "m", "q"],
        &["m", "c"],
        &["m_2_i_colour"],
    )
    .unwrap();

    assert!(request.system_instructions.contains("m_2_i_colour"));
    assert!(request.system_instructions.contains("M2'"));
    assert!(request.system_instructions.contains("m_2_prime_colour"));
    assert!(request
        .system_instructions
        .contains("Consult the S2 coordinate semantics registry"));
}
