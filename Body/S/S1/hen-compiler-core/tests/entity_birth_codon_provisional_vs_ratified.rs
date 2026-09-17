use epi_s1_hen_compiler_core::birth_codon::BirthCodonState;
use epi_s1_hen_compiler_core::graph_promotion::GraphPromotionIntent;

fn entity_markdown(extra_frontmatter: &str, body: &str) -> String {
    format!(
        r#"---
coordinate: C2
title: Sample Entity
type_family: C
type_coordinate: C2
type_path: Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Sample
c_layer_path: Idea/Bimba/World/Types/Coordinates/C/C2
semantic_authority: candidate_pending_review
crystallisation_state: entity_candidate
candidate_state: candidate
{extra_frontmatter}---

{body}
"#
    )
}

#[test]
fn empty_residency_is_provisional_and_world_types_residency_is_ratified() {
    let markdown = entity_markdown("", "Body refers to [[C2]].");

    let candidate = GraphPromotionIntent::from_markdown(
        "Idea/Empty/Present/10-07-2026/entities/sample.md",
        &markdown,
    )
    .unwrap();
    assert_eq!(
        candidate.birth_codon_computed.as_ref().unwrap().state,
        BirthCodonState::Provisional
    );

    let promoted = GraphPromotionIntent::from_markdown(
        "Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Sample.md",
        &markdown,
    )
    .unwrap();
    assert_eq!(
        promoted.birth_codon_computed.as_ref().unwrap().state,
        BirthCodonState::Ratified
    );
}

#[test]
fn provisional_codons_recompute_on_edit_even_when_frontmatter_carries_one() {
    // `provisional_recompute_on_edit` default true: a candidate in
    // Idea/Empty/ always re-derives from current content — a stale codon in
    // frontmatter is not preserved.
    let markdown = entity_markdown("c_5_birth_codon: 7\n", "Edited candidate body.");
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Empty/Present/10-07-2026/entities/sample.md",
        &markdown,
    )
    .unwrap();
    let computation = intent.birth_codon_computed.as_ref().unwrap();
    assert_eq!(computation.state, BirthCodonState::Provisional);
    assert!(!computation.preserved_from_frontmatter);
}

#[test]
fn ratified_codons_are_preserved_exactly_from_frontmatter() {
    let markdown = entity_markdown(
        "c_5_birth_codon: 33\nbirth_codon_state: ratified\n",
        "World entity body.",
    );
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Sample.md",
        &markdown,
    )
    .unwrap();
    let computation = intent.birth_codon_computed.as_ref().unwrap();
    assert_eq!(computation.state, BirthCodonState::Ratified);
    assert!(computation.preserved_from_frontmatter);
    assert_eq!(computation.record.codon, 33);
    // Already ratified — no transition event on a ratified → ratified pass.
    assert!(computation.transition_event.is_none());
}

#[test]
fn non_entity_residency_computes_no_birth_codon() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Bimba/Seeds/M/Legacy/plans/some-plan.md",
        r#"---
coordinate: M5-4
title: Some Plan
---

Plan body.
"#,
    )
    .unwrap();
    assert!(intent.birth_codon_computed.is_none());
    assert!(!intent.node.properties.contains_key("c_5_birth_codon"));
}
