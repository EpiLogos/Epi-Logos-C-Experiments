use epi_s2_graph_services::{
    PromotionClass, PropertyProposal, PropertySchemaStatus, SyncCoordinator,
};
use serde_json::json;

#[test]
fn accepts_agent_proposed_registered_and_dynamic_coordinate_properties() {
    let proposals = vec![
        PropertyProposal {
            key: "s_4_function_role".to_owned(),
            value: json!("schema/protocol authority for graph promotion"),
            evidence_kind: "heading_summary".to_owned(),
            evidence_text: "S2 graph-services owns schema validation before Neo4j writes."
                .to_owned(),
            source_path: Some("docs/specs/S/S2-S2i-GRAPH.md".to_owned()),
            source_line: Some(42),
            proposed_by: "pi:pleroma".to_owned(),
            reasoning: Some("Operational S4/S2 boundary stated in the spec.".to_owned()),
        },
        PropertyProposal {
            key: "m_2_i_colour".to_owned(),
            value: json!("inverted colour key derived from M2' coordinate evidence"),
            evidence_kind: "wikilink_context".to_owned(),
            evidence_text: "The artifact links M2' while discussing colour inversion.".to_owned(),
            source_path: Some("docs/specs/M/M2-prime-colour.md".to_owned()),
            source_line: Some(9),
            proposed_by: "pi:pleroma".to_owned(),
            reasoning: Some("Prime is encoded with the canonical i segment.".to_owned()),
        },
    ];

    let validated = SyncCoordinator::validate_property_proposals(
        PromotionClass::TechnicalCoordinateDoc,
        &["s".to_owned(), "c".to_owned()],
        &proposals,
    )
    .unwrap();

    assert_eq!(validated.len(), 2);
    assert_eq!(validated[0].schema_status, PropertySchemaStatus::Registered);
    assert_eq!(
        validated[1].schema_status,
        PropertySchemaStatus::CoordinatePrefixDynamic
    );
    assert!(!validated[1].leading_family_hint);
}

#[test]
fn accepts_non_leading_family_when_coordinate_prefix_and_evidence_are_valid() {
    let proposals = vec![PropertyProposal {
        key: "q_4_historical_diagnosis".to_owned(),
        value: json!("template coordinates disclose historical-developmental placement"),
        evidence_kind: "content_synthesis".to_owned(),
        evidence_text:
            "The S document explicitly compares the graph protocol to Bimba world templates."
                .to_owned(),
        source_path: Some("docs/specs/S/S2-S2i-GRAPH.md".to_owned()),
        source_line: Some(87),
        proposed_by: "pi:pleroma".to_owned(),
        reasoning: Some(
            "The q-family is not leading here, but the evidence warrants it.".to_owned(),
        ),
    }];

    let validated = SyncCoordinator::validate_property_proposals(
        PromotionClass::TechnicalCoordinateDoc,
        &["s".to_owned(), "c".to_owned()],
        &proposals,
    )
    .unwrap();

    assert_eq!(validated[0].key, "q_4_historical_diagnosis");
    assert!(!validated[0].leading_family_hint);
}

#[test]
fn rejects_ad_hoc_prime_spelling_and_unknown_property_shapes() {
    let proposals = vec![PropertyProposal {
        key: "m_2_prime_colour".to_owned(),
        value: json!("bad spelling"),
        evidence_kind: "content_synthesis".to_owned(),
        evidence_text: "M2' colour inversion.".to_owned(),
        source_path: Some("docs/specs/M/M2-prime-colour.md".to_owned()),
        source_line: Some(7),
        proposed_by: "pi:pleroma".to_owned(),
        reasoning: Some("This must fail because prime is not canonical.".to_owned()),
    }];

    let err = SyncCoordinator::validate_property_proposals(
        PromotionClass::TechnicalCoordinateDoc,
        &["m".to_owned(), "c".to_owned()],
        &proposals,
    )
    .unwrap_err();

    assert!(err.contains("m_2_prime_colour"));
    assert!(err.contains("i"));
}

#[test]
fn rejects_empty_evidence_and_wrong_registered_value_type() {
    let empty_evidence = PropertyProposal {
        key: "s_4_function_role".to_owned(),
        value: json!("schema/protocol authority"),
        evidence_kind: "content_synthesis".to_owned(),
        evidence_text: "   ".to_owned(),
        source_path: Some("docs/specs/S/S2-S2i-GRAPH.md".to_owned()),
        source_line: Some(18),
        proposed_by: "pi:pleroma".to_owned(),
        reasoning: None,
    };
    let wrong_type = PropertyProposal {
        key: "s_4_function_role".to_owned(),
        value: json!(["not", "a", "string"]),
        evidence_kind: "content_synthesis".to_owned(),
        evidence_text: "The role is described as schema authority.".to_owned(),
        source_path: Some("docs/specs/S/S2-S2i-GRAPH.md".to_owned()),
        source_line: Some(18),
        proposed_by: "pi:pleroma".to_owned(),
        reasoning: None,
    };

    let err = SyncCoordinator::validate_property_proposals(
        PromotionClass::TechnicalCoordinateDoc,
        &["s".to_owned(), "c".to_owned()],
        &[empty_evidence, wrong_type],
    )
    .unwrap_err();

    assert!(err.contains("evidence_text"));
    assert!(err.contains("expected string"));
}
