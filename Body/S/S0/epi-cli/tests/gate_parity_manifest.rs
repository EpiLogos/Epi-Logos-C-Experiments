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
    assert!(methods.contains(&"s5.episodic.kernel_profile_observation.deposit"));
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
    // Post Track 13 T1: s4'.* is an explicit Adapter (anima at S0 wraps the
    // S4 ta-onta authority). Deprecated `Mirror` alias still equates to
    // Adapter for migration smoothness.
    assert_eq!(record.status, CoordinateParityStatus::Adapter);
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
    // Track 13 T1 fields populated.
    assert!(record
        .authority_path
        .expect("s4'.* must carry a Body-native authority path")
        .contains("S4-4p-anima"));
    assert_eq!(
        record.adapter_path,
        Some("Body/S/S0/epi-cli/src/gate/anima.rs")
    );
    assert_eq!(record.extraction_task, Some("13.T6"));
    assert!(!record.allowed_s0_responsibilities.is_empty());
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

#[test]
fn parity_status_vocabulary_recast_has_explicit_kinds() {
    // Track 13 T1: the previously ambiguous `Mirror` status is now split into
    // four explicit kinds. Verify the enum surface exposes each as a distinct
    // value (and that the deprecated aliases still resolve for downstream
    // callers that have not migrated yet).
    use epi_logos::gate::parity::CoordinateParityStatus;

    #[allow(deprecated)]
    let aliased_mirror: CoordinateParityStatus = CoordinateParityStatus::Mirror;
    #[allow(deprecated)]
    let aliased_compat: CoordinateParityStatus = CoordinateParityStatus::Compatibility;

    assert_eq!(aliased_mirror, CoordinateParityStatus::Adapter);
    assert_eq!(aliased_compat, CoordinateParityStatus::CompatibilityAdapter);

    // All four explicit kinds (plus Native) are distinct.
    assert_ne!(
        CoordinateParityStatus::Adapter,
        CoordinateParityStatus::CompatibilityAdapter
    );
    assert_ne!(
        CoordinateParityStatus::Adapter,
        CoordinateParityStatus::TemporaryLiveHost
    );
    assert_ne!(
        CoordinateParityStatus::CompatibilityAdapter,
        CoordinateParityStatus::TemporaryLiveHost
    );
    assert_ne!(
        CoordinateParityStatus::Native,
        CoordinateParityStatus::Adapter
    );
    assert_ne!(
        CoordinateParityStatus::Missing,
        CoordinateParityStatus::TemporaryLiveHost
    );

    // The label / describe API is in place for portal rendering.
    assert_eq!(CoordinateParityStatus::Adapter.label(), "Adapter");
    assert_eq!(
        CoordinateParityStatus::CompatibilityAdapter.label(),
        "CompatibilityAdapter"
    );
    assert_eq!(
        CoordinateParityStatus::TemporaryLiveHost.label(),
        "TemporaryLiveHost"
    );
    assert!(CoordinateParityStatus::TemporaryLiveHost
        .describe_for_portal()
        .contains("temporary live host"));
    assert!(CoordinateParityStatus::CompatibilityAdapter
        .describe_for_portal()
        .contains("compatibility"));
}

#[test]
fn every_record_exposes_track13_t1_provenance_fields() {
    // Track 13 T1: every record must carry the four new fields. The exact
    // value of each depends on the record (see authority_path_required_for_adapter
    // regression test below for the stronger invariant), but the field shape
    // is universal.
    let records = epi_logos::gate::parity::coordinate_parity_records();
    assert!(!records.is_empty(), "parity ledger must not be empty");

    for record in records {
        // Field is reachable; compile-time presence is the assertion. Verify
        // the allowed_s0_responsibilities slice is at least readable.
        let _: Option<&'static str> = record.authority_path;
        let _: Option<&'static str> = record.adapter_path;
        let _: Option<&'static str> = record.extraction_task;
        let _: &'static [&'static str] = record.allowed_s0_responsibilities;
    }
}

#[test]
fn non_s0_method_with_s0_adapter_has_body_native_authority_path() {
    // REGRESSION (Track 13 T1, plan verification §3): any non-S0 method that
    // is implemented via an S0 adapter MUST declare a Body-native
    // authority_path. This blocks future records from re-introducing the
    // ambiguous "S0 owns this but it isn't really S0 substrate" state that
    // the Mirror status used to enable.
    use epi_logos::gate::parity::CoordinateParityStatus;

    let records = epi_logos::gate::parity::coordinate_parity_records();
    let mut checked = 0_usize;

    for record in records {
        let is_s0_method = record.canonical_method.starts_with("s0.")
            || record.canonical_method == "s0.*";

        // Records where S0 truly is the authority can legitimately skip
        // authority_path; everything else must declare one when an adapter
        // exists, regardless of the explicit kind.
        if is_s0_method {
            continue;
        }

        let has_adapter = matches!(
            record.status,
            CoordinateParityStatus::Adapter
                | CoordinateParityStatus::CompatibilityAdapter
                | CoordinateParityStatus::TemporaryLiveHost
        );
        // Native records that point at an S0 file (e.g. portal-core kernel
        // canonical surfaces, temporal renderer) also carry an adapter_path;
        // they additionally have a Body-native authority_path because the
        // crate that owns the type lives in Body proper.
        let is_native_with_adapter = matches!(record.status, CoordinateParityStatus::Native)
            && record.adapter_path.is_some();

        if has_adapter || is_native_with_adapter {
            let authority = record.authority_path.unwrap_or_else(|| {
                panic!(
                    "non-S0 method with an S0 adapter must declare a Body-native authority_path: {}",
                    record.canonical_method
                )
            });
            assert!(
                !authority.is_empty(),
                "authority_path must be non-empty for {}",
                record.canonical_method
            );
            // The authority must not point back at the same S0 adapter file
            // (that would be self-referential and defeat the purpose).
            if let Some(adapter) = record.adapter_path {
                assert_ne!(
                    authority, adapter,
                    "authority_path must differ from adapter_path for {}",
                    record.canonical_method
                );
            }
            checked += 1;
        }
    }

    assert!(
        checked >= 10,
        "regression scope check: expected >= 10 non-S0 adapter records to validate, got {checked}"
    );
}

#[test]
fn temporary_live_host_status_is_used_for_known_transitional_runtimes() {
    // Track 13 T1 introduces TemporaryLiveHost as an explicit kind. The
    // refactor uses CompatibilityAdapter for s3.* (the adapter shape) but the
    // status surface MUST expose TemporaryLiveHost as a callable variant so
    // future records (and the contract-inventory) can name explicit live-host
    // entries. This test asserts the variant is constructable and routes
    // through describe_for_portal correctly.
    use epi_logos::gate::parity::CoordinateParityStatus;
    let host = CoordinateParityStatus::TemporaryLiveHost;
    assert_eq!(host.label(), "TemporaryLiveHost");
    assert!(host.describe_for_portal().to_lowercase().contains("temporary"));
}
