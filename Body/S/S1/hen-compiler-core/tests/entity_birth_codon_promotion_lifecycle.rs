use epi_s1_hen_compiler_core::birth_codon::BirthCodonState;
use epi_s1_hen_compiler_core::graph_promotion::GraphPromotionIntent;

const CANDIDATE_BODY: &str = r#"---
coordinate: C2
title: Anima
type_family: C
type_coordinate: C2
type_path: Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Anima
c_layer_path: Idea/Bimba/World/Types/Coordinates/C/C2
semantic_authority: candidate_pending_review
crystallisation_state: entity_candidate
candidate_state: candidate
created_at: 2026-07-10T12:00:00Z
---

Candidate refers to [[Anima]] and [[S4]].
"#;

#[test]
fn candidate_promotion_computes_codon_and_all_derived_fields() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Empty/Present/10-07-2026/entities/anima.md",
        CANDIDATE_BODY,
    )
    .unwrap();

    let computation = intent
        .birth_codon_computed
        .as_ref()
        .expect("entity candidate must compute a birth codon");
    assert_eq!(computation.state, BirthCodonState::Provisional);
    assert!(!computation.preserved_from_frontmatter);
    assert!(computation.transition_event.is_none());
    assert!(computation.record.codon < 64);

    let props = &intent.node.properties;
    let codon = props
        .get("c_5_birth_codon")
        .and_then(serde_json::Value::as_u64)
        .expect("c_5_birth_codon property present");
    assert!(codon < 64);
    assert_eq!(
        props.get("birth_codon_state").unwrap(),
        &serde_json::json!("provisional")
    );

    // Derived fields resolve through the kernel authority seams.
    let rotational = props
        .get("c_5_birth_rotational_class")
        .and_then(serde_json::Value::as_str)
        .unwrap();
    assert!([
        "dual",
        "non-dual-perfect",
        "non-dual-imperfect",
        "non-dual-non-palindromic"
    ]
    .contains(&rotational));
    let transcript = props
        .get("c_5_birth_transcript_class")
        .and_then(serde_json::Value::as_str)
        .unwrap();
    assert!(["shared", "transcribable"].contains(&transcript));
    let governance = props
        .get("c_5_birth_governance_role")
        .and_then(serde_json::Value::as_str)
        .unwrap();
    assert!(["none", "start", "stop"].contains(&governance));
    for charge in [
        "c_5_birth_pp",
        "c_5_birth_nn",
        "c_5_birth_np",
        "c_5_birth_pn",
    ] {
        assert!(
            props.get(charge).and_then(serde_json::Value::as_i64).is_some(),
            "{charge} must be a signed integer property"
        );
    }

    // Parity with the portal-core kernel seam: chromosome is the Major
    // Arcana card of the codon (None only for STOP codons).
    let expected_chromosome =
        portal_core::m3_transcription_bridge::major_arcana(computation.record.codon)
            .map(|card| card.name);
    assert_eq!(computation.record.chromosome, expected_chromosome);
    match &computation.record.chromosome {
        Some(name) => assert_eq!(
            props.get("c_5_birth_chromosome").unwrap(),
            &serde_json::json!(name)
        ),
        None => assert!(!props.contains_key("c_5_birth_chromosome")),
    }
}

#[test]
fn ratification_transition_fires_when_provisional_candidate_promotes_to_world_types() {
    let promoted_body = CANDIDATE_BODY.replace(
        "candidate_state: candidate\n",
        "candidate_state: candidate\nbirth_codon_state: provisional\n",
    );
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Anima.md",
        &promoted_body,
    )
    .unwrap();

    let computation = intent.birth_codon_computed.as_ref().unwrap();
    assert_eq!(computation.state, BirthCodonState::Ratified);
    assert_eq!(
        computation.transition_event.as_deref(),
        Some("birth_codon_provisional_ratified")
    );
    assert_eq!(
        intent.node.properties.get("birth_codon_state").unwrap(),
        &serde_json::json!("ratified")
    );
}

#[test]
fn flat_world_graduation_preserves_the_ratified_codon() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Bimba/World/Anima.md",
        r#"---
coordinate: C2-1
title: Anima
source_c_authority_path: Idea/Bimba/World/Types/Coordinates/C/C2/Anima.md
flat_world_target: Idea/Bimba/World/Anima.md
c_5_birth_codon: 42
birth_codon_state: ratified
---

Graduated from [[Anima]].
"#,
    )
    .unwrap();

    let computation = intent.birth_codon_computed.as_ref().unwrap();
    assert_eq!(computation.state, BirthCodonState::Ratified);
    assert!(computation.preserved_from_frontmatter);
    assert_eq!(computation.record.codon, 42);
    assert!(computation.transition_event.is_none());
    assert_eq!(
        intent.node.properties.get("c_5_birth_codon").unwrap(),
        &serde_json::json!(42)
    );
}
