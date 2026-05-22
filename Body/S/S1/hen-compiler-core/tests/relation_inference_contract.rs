use epi_s1_hen_compiler_core::artifact_evidence::collect_artifact_evidence;
use epi_s1_hen_compiler_core::relation_inference::{
    build_relation_inference_request, validate_relation_candidates, ALLOWED_RELATION_TYPES,
};

#[test]
fn builds_pi_relation_request_from_real_wikilink_evidence() {
    let source = collect_artifact_evidence(
        "Idea/Empty/current.md",
        "---\ncoordinate: C0/T5\n---\nThis elaborates [[C0/T4]] and contrasts [[C1]].",
    )
    .unwrap();

    let request = build_relation_inference_request(&source, &[]).unwrap();

    assert_eq!(request.source_coordinate, "C0/T5");
    assert_eq!(request.source_path, "Idea/Empty/current.md");
    assert_eq!(request.link_evidence.len(), 2);
    assert_eq!(request.link_evidence[0].target_text, "C0/T4");
    assert_eq!(request.link_evidence[0].source_line, 4);
    assert!(request
        .system_instructions
        .contains("schema-owned relationship types"));
    assert!(request
        .system_instructions
        .contains("Do not invent relationship labels"));
    assert_eq!(
        request.allowed_relation_types.len(),
        ALLOWED_RELATION_TYPES.len()
    );
}

#[test]
fn relation_request_does_not_expose_provider_or_model_selection() {
    let source = collect_artifact_evidence(
        "Idea/Empty/current.md",
        "---\ncoordinate: C0/T5\n---\nThis elaborates [[C0/T4]].",
    )
    .unwrap();

    let request = build_relation_inference_request(&source, &[]).unwrap();
    let value = serde_json::to_value(&request).unwrap();

    assert!(value.get("provider").is_none());
    assert!(value.get("model").is_none());
    assert!(value.get("api_key").is_none());
    assert!(value.get("apiKey").is_none());
}

#[test]
fn validates_candidate_schema_with_required_evidence_and_registered_type() {
    let candidates = validate_relation_candidates(
        r#"
        {
          "candidates": [
            {
              "source_coordinate": "C0/T5",
              "target_coordinate": "C0/T4",
              "relation_type": "ELABORATES",
              "confidence": 0.91,
              "evidence_kind": "wikilink",
              "evidence_text": "This elaborates [[C0/T4]].",
              "source_path": "Idea/Empty/current.md",
              "source_line": 4,
              "target_text": "C0/T4",
              "inferred_by": "contract-test",
              "prompt_hash": "sha256:abc"
            }
          ]
        }
        "#,
    )
    .unwrap();

    assert_eq!(candidates.len(), 1);
    assert_eq!(candidates[0].relation_type, "ELABORATES");
    assert_eq!(candidates[0].evidence_kind, "wikilink");
}

#[test]
fn rejects_candidates_with_unregistered_relationship_type() {
    let result = validate_relation_candidates(
        r#"
        [{
          "source_coordinate": "C0/T5",
          "target_coordinate": "C0/T4",
          "relation_type": "MADE_UP",
          "confidence": 0.91,
          "evidence_kind": "wikilink",
          "evidence_text": "This elaborates [[C0/T4]]."
        }]
        "#,
    );

    assert!(result
        .unwrap_err()
        .contains("unregistered relationship type"));
}

#[test]
fn rejects_candidates_missing_evidence_confidence_source_or_target() {
    for (json, expected) in [
        (
            r#"[{"target_coordinate":"C0/T4","relation_type":"REFERENCES","confidence":0.7,"evidence_kind":"wikilink","evidence_text":"[[C0/T4]]"}]"#,
            "source_coordinate",
        ),
        (
            r#"[{"source_coordinate":"C0/T5","relation_type":"REFERENCES","confidence":0.7,"evidence_kind":"wikilink","evidence_text":"[[C0/T4]]"}]"#,
            "target_coordinate",
        ),
        (
            r#"[{"source_coordinate":"C0/T5","target_coordinate":"C0/T4","relation_type":"REFERENCES","evidence_kind":"wikilink","evidence_text":"[[C0/T4]]"}]"#,
            "confidence",
        ),
        (
            r#"[{"source_coordinate":"C0/T5","target_coordinate":"C0/T4","relation_type":"REFERENCES","confidence":0.7,"evidence_kind":"wikilink"}]"#,
            "evidence_text",
        ),
    ] {
        assert!(
            validate_relation_candidates(json)
                .unwrap_err()
                .contains(expected),
            "expected missing {expected} to be rejected"
        );
    }
}

#[test]
fn rejects_candidates_with_confidence_outside_unit_interval() {
    for confidence in ["-0.01", "1.01"] {
        let json = format!(
            r#"[{{"source_coordinate":"C0/T5","target_coordinate":"C0/T4","relation_type":"REFERENCES","confidence":{confidence},"evidence_kind":"wikilink","evidence_text":"[[C0/T4]]"}}]"#
        );

        assert!(
            validate_relation_candidates(&json)
                .unwrap_err()
                .contains("confidence must be between 0 and 1"),
            "confidence {confidence} should be rejected"
        );
    }
}
