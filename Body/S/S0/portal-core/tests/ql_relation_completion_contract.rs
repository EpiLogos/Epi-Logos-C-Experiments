use portal_core::{
    RelationCompletionDegree, RelationDescriptor, RelationExpansionSide, RelationFamily,
    SemanticCrossOperator,
};

fn relation(family: RelationFamily) -> RelationDescriptor {
    RelationDescriptor::new(
        "ql-test",
        family,
        "#1",
        "profile-1",
        2,
        "ql-relation-interval",
        false,
    )
    .unwrap()
}

#[test]
fn relation_family_is_separate_from_completion_degree() {
    let descriptor = relation(RelationFamily::A);

    assert_eq!(descriptor.relation_family, RelationFamily::A);
    assert_eq!(descriptor.completion_degree, RelationCompletionDegree::D1);
    assert_eq!(descriptor.expansion_side, None);
}

#[test]
fn d2_requires_one_sided_conjugate_expansion() {
    let missing_side = relation(RelationFamily::B)
        .with_completion(RelationCompletionDegree::D2, None)
        .unwrap_err();
    assert!(missing_side.contains("D2 completion requires an expansion side"));

    let descriptor = relation(RelationFamily::B)
        .with_completion(
            RelationCompletionDegree::D2,
            Some(RelationExpansionSide::Right),
        )
        .unwrap();
    assert_eq!(descriptor.completion_degree, RelationCompletionDegree::D2);
    assert_eq!(descriptor.expansion_side, Some(RelationExpansionSide::Right));
}

#[test]
fn d1_and_d3_do_not_carry_an_expansion_side() {
    for degree in [RelationCompletionDegree::D1, RelationCompletionDegree::D3] {
        let error = relation(RelationFamily::C)
            .with_completion(degree, Some(RelationExpansionSide::Left))
            .unwrap_err();
        assert!(error.contains("only D2 completion carries an expansion side"));
    }
}

#[test]
fn pair_index_and_semantic_cross_operator_remain_distinct_fields() {
    let descriptor = relation(RelationFamily::C)
        .with_pair_index(2)
        .unwrap()
        .with_completion(RelationCompletionDegree::D3, None)
        .unwrap()
        .with_semantic_cross_operator(SemanticCrossOperator::Complete);

    assert_eq!(descriptor.pair_index, Some(2));
    assert_eq!(descriptor.completion_degree, RelationCompletionDegree::D3);
    assert_eq!(
        descriptor.semantic_cross_operator,
        Some(SemanticCrossOperator::Complete)
    );
}

#[test]
fn pair_index_is_bounded_by_three_instances_per_family() {
    let error = relation(RelationFamily::A).with_pair_index(3).unwrap_err();
    assert!(error.contains("pair_index must be in 0..3"));
}
