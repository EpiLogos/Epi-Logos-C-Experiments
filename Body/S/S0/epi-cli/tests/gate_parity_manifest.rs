#[test]
fn gateway_method_manifest_is_complete() {
    let methods = epi_logos::gate::parity::method_names();
    assert!(methods.contains(&"chat.send"));
    assert!(methods.contains(&"skills.install"));
    assert!(methods.contains(&"sessions.compact"));
    assert!(methods.contains(&"s2.graph.pointer_web.compute"));
    assert!(methods.contains(&"s2.graph.pointer_web.refresh"));
    assert!(methods.contains(&"s2.graph.kernel_resonance.record"));
    assert!(methods.contains(&"s5.episodic.kernel_resonance.deposit"));
    assert_eq!(epi_logos::gate::parity::TEST_GATEWAY_PORT, 18794);
}

#[tokio::test]
async fn pointer_web_compute_dispatch_is_s2_owned_without_neo4j_connection() {
    let value = epi_logos::gate::graph::dispatch_graph_method(
        "s2.graph.pointer_web.compute",
        &serde_json::json!({ "coordinate": "#2" }),
    )
    .await
    .expect("compute pointer web through S0 gateway mirror");

    assert_eq!(value["resolution"]["canonical"], "M2");
    assert_eq!(value["coordinate_anchor"]["kernel"]["source"], "s0.kernel");
    assert_eq!(value["pointerWeb"]["pointer_count"], 36);
    assert_eq!(value["pointerWeb"]["family_refs"]["m_ref"], "M2");
}

#[test]
fn every_product_gateway_method_has_coordinate_mapping() {
    for method in epi_logos::gate::parity::method_names() {
        let mapped = epi_logos::gate::parity::coordinate_family_for_gateway_method(method);
        assert!(
            mapped.is_some(),
            "product gateway method must have coordinate parity mapping: {method}"
        );
    }
}

#[test]
fn coordinate_manifest_covers_all_s_families() {
    let records = epi_logos::gate::parity::coordinate_parity_records();

    for required in [
        "connect",
        "agent.capabilities",
        "s0.*",
        "s1.*",
        "s1'.*",
        "s2.graph.*",
        "s2'.*",
        "s3.*",
        "s3'.*",
        "s4.agent.*",
        "s4'.*",
        "s5.gnostic.*",
        "s5.episodic.*",
        "s5.bimba.*",
        "s5.m.*",
        "s5'.epii.*",
        "s5'.gnosis.*",
        "s5'.review.*",
        "s5'.improve.*",
    ] {
        assert!(
            records
                .iter()
                .any(|record| record.canonical_method == required),
            "missing coordinate parity record: {required}"
        );
    }
}

#[test]
fn epii_review_and_improvement_are_native_targets() {
    use epi_logos::gate::parity::CoordinateParityStatus;

    let records = epi_logos::gate::parity::coordinate_parity_records();

    let review = records
        .iter()
        .find(|record| record.canonical_method == "s5'.review.*")
        .expect("s5 review parity record");

    assert_eq!(review.owner, "S5'");
    assert_eq!(review.status, CoordinateParityStatus::Native);
    assert_eq!(review.body_path, "Body/S/S5/epii-review-core");
    assert_eq!(
        epi_logos::gate::parity::coordinate_family_for_gateway_method("s5'.review.submit"),
        Some("s5'.review.*")
    );

    let improve = records
        .iter()
        .find(|record| record.canonical_method == "s5'.improve.*")
        .expect("s5 improve parity record");

    assert_eq!(improve.owner, "S5'");
    assert_eq!(improve.status, CoordinateParityStatus::Native);
    assert_eq!(improve.body_path, "Body/S/S5/epii-autoresearch-core");
    assert_eq!(
        epi_logos::gate::parity::coordinate_family_for_gateway_method("s5'.improve.propose"),
        Some("s5'.improve.*")
    );

    let epii = records
        .iter()
        .find(|record| record.canonical_method == "s5'.epii.*")
        .expect("s5 epii parity record");

    assert_eq!(epii.owner, "S5'");
    assert_eq!(epii.status, CoordinateParityStatus::Native);
    assert_eq!(epii.body_path, "Body/S/S5/epii-agent-core");
    assert_eq!(
        epi_logos::gate::parity::coordinate_family_for_gateway_method("s5'.epii.deposit"),
        Some("s5'.epii.*")
    );
    assert_eq!(
        epi_logos::gate::parity::coordinate_family_for_gateway_method("s5'.epii.runtime.context"),
        Some("s5'.epii.*")
    );

    let gnosis = records
        .iter()
        .find(|record| record.canonical_method == "s5'.gnosis.*")
        .expect("s5 gnosis parity record");

    assert_eq!(gnosis.owner, "S5'");
    assert_eq!(gnosis.status, CoordinateParityStatus::Native);
    assert_eq!(
        epi_logos::gate::parity::coordinate_family_for_gateway_method(
            "s5'.gnosis.context.retrieve"
        ),
        Some("s5'.gnosis.*")
    );
}

#[test]
fn s4_prime_manifest_exposes_vak_and_orchestrate_gateway_access() {
    use epi_logos::gate::parity::CoordinateParityStatus;

    let record = epi_logos::gate::parity::coordinate_parity_records()
        .iter()
        .find(|record| record.canonical_method == "s4'.*")
        .expect("s4' parity record");

    assert_eq!(record.owner, "S4'");
    assert_eq!(record.status, CoordinateParityStatus::Mirror);
    assert!(record
        .live_gateway_method
        .expect("live methods")
        .contains("s4'.vak.evaluate"));
    assert!(record
        .test_evidence
        .contains(&"gate_anima_pleroma_access.rs"));
    assert_eq!(
        epi_logos::gate::parity::coordinate_family_for_gateway_method("s4'.orchestrate"),
        Some("s4'.*")
    );
}

#[test]
fn s1_prime_manifest_points_at_rust_hen_compiler_contract() {
    use epi_logos::gate::parity::CoordinateParityStatus;

    let record = epi_logos::gate::parity::coordinate_parity_records()
        .iter()
        .find(|record| record.canonical_method == "s1'.*")
        .expect("s1' parity record");

    assert_eq!(record.owner, "S1'");
    assert_eq!(record.status, CoordinateParityStatus::Native);
    assert_eq!(record.body_path, "Body/S/S1/hen-compiler-core");
    assert!(record
        .test_evidence
        .contains(&"hen-compiler-core/tests/compile_plan.rs"));
    assert!(record
        .test_evidence
        .contains(&"hen-compiler-core/tests/frontmatter.rs"));
    assert!(record.test_evidence.contains(&"vault_frontmatter.rs"));

    let _timestamp = epi_logos::hen::HenTimestamp::new(2026, 4, 25, 0, 0, 0);
}
