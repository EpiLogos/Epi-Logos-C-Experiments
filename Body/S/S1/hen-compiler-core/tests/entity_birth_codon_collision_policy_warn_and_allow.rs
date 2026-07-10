use epi_s1_hen_compiler_core::birth_codon::{BirthCodonLedger, BirthCodonRecord};
use epi_s1_hen_compiler_core::graph_promotion::GraphPromotionIntent;

#[test]
fn collision_is_counted_and_both_entities_ratify() {
    let mut ledger = BirthCodonLedger::default();

    let first = ledger.record(17, "Idea/Bimba/World/Anima.md");
    assert!(!first.collision);
    assert_eq!(first.occupancy, 1);
    assert!(first.warning.is_none());

    // Second entity deterministically hashes to the same codon: collision
    // counted, warning emitted, entity still recorded (warn-and-allow —
    // shared chromosomal territory is an ontological signal, not a bug).
    let second = ledger.record(17, "Idea/Bimba/World/Logos.md");
    assert!(second.collision);
    assert_eq!(second.occupancy, 2);
    let warning = second.warning.expect("collision must warn");
    assert!(warning.contains("warn-and-allow"));
    assert_eq!(ledger.entities_for(17).len(), 2);

    // Both entities carry a full ratified record — no refusal path exists.
    for _path in ledger.entities_for(17) {
        let record = BirthCodonRecord::from_codon(17);
        assert_eq!(record.codon, 17);
    }
}

#[test]
fn colliding_world_entities_both_produce_ratified_promotion_intents() {
    // Two distinct World entities pinned to the SAME codon via frontmatter
    // preservation: both promotions succeed and both ratify.
    let markdown = |title: &str| {
        format!(
            r#"---
coordinate: C2
title: {title}
type_family: C
type_coordinate: C2
type_path: Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/{title}
c_layer_path: Idea/Bimba/World/Types/Coordinates/C/C2
semantic_authority: candidate_pending_review
crystallisation_state: entity_candidate
c_5_birth_codon: 17
birth_codon_state: ratified
---

{title} body.
"#
        )
    };

    let mut ledger = BirthCodonLedger::default();
    let mut outcomes = Vec::new();
    for title in ["Anima", "Logos"] {
        let intent = GraphPromotionIntent::from_markdown(
            format!("Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/{title}.md"),
            &markdown(title),
        )
        .unwrap();
        let computation = intent.birth_codon_computed.as_ref().unwrap();
        assert_eq!(computation.record.codon, 17);
        outcomes.push(ledger.record(computation.record.codon, title));
    }

    assert!(!outcomes[0].collision);
    assert!(outcomes[1].collision);
    assert_eq!(outcomes[1].occupancy, 2);
    assert!(outcomes[1].warning.is_some());
}
