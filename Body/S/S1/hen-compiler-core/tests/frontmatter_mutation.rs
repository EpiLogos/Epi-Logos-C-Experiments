use epi_s1_hen_compiler_core::{
    append_frontmatter_string, plan_q_articulation_amendment, set_frontmatter_string,
    QArticulationAmendmentRequest,
};

#[test]
fn appends_and_deduplicates_a_coordinate_prefixed_string_sequence() {
    let source = "---\ncoordinate: M4\nc_4_pinned_materia:\n  - Hawthorn\n---\n\n# NOW\n\nBody stays intact.\n";
    let updated = append_frontmatter_string(source, "c_4_pinned_materia", "Nettle")
        .expect("valid frontmatter append");
    let deduplicated = append_frontmatter_string(&updated, "c_4_pinned_materia", "Nettle")
        .expect("duplicate append is idempotent");

    assert_eq!(updated, deduplicated);
    assert!(updated.contains("- Hawthorn"));
    assert!(updated.contains("- Nettle"));
    assert!(updated.ends_with("# NOW\n\nBody stays intact.\n"));
}

#[test]
fn refuses_missing_frontmatter_and_non_coordinate_keys() {
    assert!(append_frontmatter_string("# NOW\n", "c_4_pinned_materia", "Nettle").is_err());
    assert!(append_frontmatter_string("---\ncoordinate: M4\n---\n", "pinned", "Nettle").is_err());
}

#[test]
fn replaces_a_coordinate_prefixed_scalar_without_touching_the_body() {
    let source =
        "---\ncoordinate: M4\nc_4_active_alchemical_op: nigredo\n---\n\n# NOW\nExact body.\n";
    let updated = set_frontmatter_string(source, "c_4_active_alchemical_op", "solutio")
        .expect("valid scalar replacement");

    assert!(updated.contains("c_4_active_alchemical_op: solutio"));
    assert!(!updated.contains("c_4_active_alchemical_op: nigredo"));
    assert!(updated.ends_with("# NOW\nExact body.\n"));
    assert!(set_frontmatter_string(source, "active_op", "solutio").is_err());
}

#[test]
fn q_articulation_amendment_replaces_the_q_value_and_stamps_its_review_epoch() {
    let source = "---\ncoordinate: M5-1\nq_5_return: old articulation\n---\n\n# M5\n";
    let plan = plan_q_articulation_amendment(
        source,
        QArticulationAmendmentRequest {
            q_key: "q_5_return".to_owned(),
            q_value: "A return remains open to its next question.".to_owned(),
            review_epoch: 18,
            accepted_review_ref: "review-18".to_owned(),
            opens_questions: vec!["What remains unarticulated?".to_owned()],
            source_artifacts: vec!["Idea/Empty/Present/15-07-2026/session.md".to_owned()],
        },
    )
    .expect("accepted Q proposal should produce a Hen amendment plan");

    assert_eq!(plan.q_key, "q_5_return");
    assert_eq!(plan.review_epoch_key, "qm_5_review_epoch_return");
    assert!(plan.markdown.contains("q_5_return: A return remains open"));
    assert!(plan.markdown.contains("qm_5_review_epoch_return: '18'"));
    assert!(plan.markdown.ends_with("# M5\n"));
}

#[test]
fn q_articulation_amendment_refuses_metadata_or_closed_proposals() {
    let source = "---\ncoordinate: M5-1\n---\n\n# M5\n";
    let invalid_key = plan_q_articulation_amendment(
        source,
        QArticulationAmendmentRequest {
            q_key: "qm_5_review_epoch_return".to_owned(),
            q_value: "not an articulation".to_owned(),
            review_epoch: 18,
            accepted_review_ref: "review-18".to_owned(),
            opens_questions: vec!["What remains open?".to_owned()],
            source_artifacts: vec!["source.md".to_owned()],
        },
    )
    .expect_err("Q metadata must never become an editable articulation target");
    assert!(invalid_key.contains("q_"));

    let closed = plan_q_articulation_amendment(
        source,
        QArticulationAmendmentRequest {
            q_key: "q_5_return".to_owned(),
            q_value: "candidate".to_owned(),
            review_epoch: 18,
            accepted_review_ref: "review-18".to_owned(),
            opens_questions: vec![],
            source_artifacts: vec!["source.md".to_owned()],
        },
    )
    .expect_err("accepted Sophia work must remain open");
    assert!(closed.contains("opens_questions"));
}
