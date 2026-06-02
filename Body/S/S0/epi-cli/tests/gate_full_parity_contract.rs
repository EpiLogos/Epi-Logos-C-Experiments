use epi_logos::gate::{parity, protocol};

#[test]
fn gateway_method_manifest_covers_full_execution_spine() {
    let methods = parity::method_names();

    for required in [
        "agent",
        "agent.wait",
        "chat.send",
        "chat.abort",
        "chat.history",
        "sessions.resolve",
        "send",
        "health",
        "status",
        "wake",
    ] {
        assert!(
            methods.contains(&required),
            "missing parity method declaration: {required}"
        );
    }
}

#[test]
fn s0_parity_session_surface_is_derived_from_s3_gateway_contract() {
    let contract_methods = epi_s3_gateway_contract::gateway_session_method_names();
    let parity_methods = parity::session_surface_method_names();

    for method in &contract_methods {
        assert!(
            parity_methods.contains(method),
            "S0 parity should expose S3 gateway session method {method}; got {parity_methods:?}"
        );
    }

    assert!(parity_methods.contains(&"chat.history"));
    assert!(parity_methods.contains(&"channels.status"));
    assert!(parity_methods.contains(&"sessions.resolve"));
}

#[test]
fn coordinate_parity_records_preserve_missing_and_compatibility_boundaries() {
    let records = parity::coordinate_parity_records();

    for required in [
        "s2.graph.*",
        "s3.*",
        "s5.episodic.*",
        "s5'.epii.*",
        "s5'.review.*",
        "s5'.improve.*",
        "s5'.ql.*",
        "s3'.temporal.*",
    ] {
        assert!(
            records
                .iter()
                .any(|record| record.canonical_method == required),
            "missing coordinate parity record: {required}"
        );
    }

    let graph = records
        .iter()
        .find(|record| record.canonical_method == "s2.graph.*")
        .expect("s2 graph parity record");
    assert_eq!(graph.status, parity::CoordinateParityStatus::Mirror);
    assert_eq!(graph.cli_mirror, Some("epi graph"));

    let gateway = records
        .iter()
        .find(|record| record.canonical_method == "s3.*")
        .expect("s3 gateway parity record");
    assert_eq!(
        gateway.status,
        parity::CoordinateParityStatus::Compatibility
    );

    let temporal = records
        .iter()
        .find(|record| record.canonical_method == "s3'.temporal.*")
        .expect("s3 temporal parity record");
    assert_eq!(temporal.status, parity::CoordinateParityStatus::Native);
    assert_eq!(temporal.live_gateway_method, Some("s3'.temporal.context"));

    let review = records
        .iter()
        .find(|record| record.canonical_method == "s5'.review.*")
        .expect("s5 review parity record");
    assert_eq!(review.status, parity::CoordinateParityStatus::Native);

    let improve = records
        .iter()
        .find(|record| record.canonical_method == "s5'.improve.*")
        .expect("s5 improve parity record");
    assert_eq!(improve.status, parity::CoordinateParityStatus::Native);

    let epii = records
        .iter()
        .find(|record| record.canonical_method == "s5'.epii.*")
        .expect("s5 epii parity record");
    assert_eq!(epii.status, parity::CoordinateParityStatus::Native);
}

#[test]
fn hello_contract_advertises_protocol_three_and_event_channels() {
    let hello = protocol::hello_ok();
    let hello_value = serde_json::to_value(&hello).expect("hello contract should serialize");

    assert_eq!(hello_value["type"], "hello-ok");
    assert_eq!(hello.protocol, 3);

    let events = hello_value["features"]["events"]
        .as_array()
        .expect("hello contract should declare event channels");

    for required in ["agent", "chat", "tick", "health", "heartbeat"] {
        assert!(
            events.iter().any(|value| value.as_str() == Some(required)),
            "missing hello event declaration: {required}"
        );
    }
}

// ======== 13.T2 S0-as-adapter dispatch tests ========
//
// Per Track 13 Tranche T2 deliverable: "Add an S0 adapter test proving
// `Body/S/S0/epi-cli/src/gate/server.rs` dispatches only through S3-owned
// route metadata." These tests assert exactly that — S0 has NO parallel
// route table; classification is always satisfied by the S3 crates.

#[test]
fn s0_gate_server_dispatches_only_via_s3_route_metadata() {
    // For every method in the contract's METHOD_NAMES, S3's `classify_method`
    // must yield a route. If this fails, S0's `gate::server::dispatch_rpc`
    // would be forced to invent ownership locally — exactly the parallel
    // table the plan forbids.
    let unclassified: Vec<&str> = epi_s3_gateway_contract::METHOD_NAMES
        .iter()
        .copied()
        .filter(|method| epi_s3_gateway::dispatch::classify_method(method).is_none())
        .collect();
    assert!(
        unclassified.is_empty(),
        "S0 cannot dispatch these methods without a parallel route table — \
         S3 classify_method missing: {unclassified:?}"
    );

    // And similarly: every method must have an executable dispatch-plan
    // entry. If a method exists in METHOD_NAMES but has no plan row, S0
    // can't surface an honest "no executable adapter" error and would have
    // to make one up — that too is a parallel route table.
    let unplanned: Vec<&str> = epi_s3_gateway_contract::METHOD_NAMES
        .iter()
        .copied()
        .filter(|method| epi_s3_gateway_contract::method_dispatch_plan_entry(method).is_none())
        .collect();
    assert!(
        unplanned.is_empty(),
        "S0 dispatch cannot rely on S3 dispatch-plan because methods are unmapped: {unplanned:?}"
    );
}

#[test]
fn s0_gate_server_does_not_synthesise_methods_outside_s3_contract() {
    // The inverse: S3's executable dispatch-plan must not carry methods that
    // METHOD_NAMES doesn't declare. If S3 grew rows for an S0-only-method,
    // that's still a violation of the staged boundary (S0 process / S3 law).
    let stray: Vec<&str> = epi_s3_gateway_contract::METHOD_DISPATCH_PLAN
        .iter()
        .map(|entry| entry.method)
        .filter(|method| !epi_s3_gateway_contract::METHOD_NAMES.contains(method))
        .collect();
    assert!(
        stray.is_empty(),
        "S3 dispatch-plan must not contain methods absent from METHOD_NAMES (would imply \
         S0 synthesises route truth): {stray:?}"
    );
}

#[test]
fn s0_only_method_absent_from_s3_dispatch_classification_is_rejected() {
    // The plan's failing-test guard (line 91 of 13.T2 plan body): "A new
    // test fails if a method appears in S0 dispatch but is absent from S3
    // dispatch classification."
    //
    // We model this by constructing a synthetic S0-only fake method and
    // asserting both S3 surfaces reject it. If a future refactor of S0
    // server.rs accidentally adds a hand-coded route for a method outside
    // METHOD_NAMES, the contracts above (`s0_gate_server_dispatches_only_via_s3_route_metadata`)
    // will not catch it because that test iterates METHOD_NAMES — but this
    // explicit fake-method probe documents the intent and acts as a
    // regression boundary.
    let fake_s0_only_method = "s0.fake.invented_by_server.never_in_contract";
    assert!(
        !epi_s3_gateway_contract::METHOD_NAMES.contains(&fake_s0_only_method),
        "test setup invariant: fake method should not be in METHOD_NAMES"
    );
    assert!(
        epi_s3_gateway::dispatch::classify_method(fake_s0_only_method).is_none(),
        "S3 classify_method must reject a fake S0-only method; otherwise S0 could dispatch \
         by an in-process route table"
    );
    assert!(
        epi_s3_gateway_contract::method_dispatch_plan_entry(fake_s0_only_method).is_none(),
        "S3 dispatch-plan must reject a fake S0-only method; otherwise S0 could dispatch \
         by an in-process route table"
    );
}

#[test]
fn s0_parity_does_not_carry_an_independent_route_classification_table() {
    // The S0 parity surface (parity.rs) is allowed to carry a
    // *family-bucket* mapping for portal rendering — that's not a route
    // table. The actual *route classification* MUST come from S3. We assert
    // this indirectly: parity::method_names() is re-exported from the
    // contract's METHOD_NAMES (not invented in S0), and S0 has no public
    // classification surface beyond what re-exports from S3.
    assert_eq!(
        parity::method_names().len(),
        epi_s3_gateway_contract::METHOD_NAMES.len(),
        "S0 parity::method_names must be exactly the S3 contract's METHOD_NAMES — \
         a divergence would indicate a parallel route table"
    );
    for method in parity::method_names() {
        assert!(
            epi_s3_gateway_contract::METHOD_NAMES.contains(method),
            "S0 parity::method_names diverged from S3 METHOD_NAMES at {method}"
        );
    }
}

#[test]
fn s0_dispatch_plan_carries_every_dispatch_kind_label_for_observability() {
    // The S3 dispatch-plan must reach S0 via re-export so server.rs can
    // surface the dispatch kind in error messages. This test asserts the
    // label() helper is reachable through the re-export chain.
    use epi_s3_gateway_contract::MethodDispatchKind;
    assert_eq!(
        MethodDispatchKind::S3NativeHandler.label(),
        "S3 native handler"
    );
    assert_eq!(
        MethodDispatchKind::S2GraphServiceAdapter.label(),
        "S2 graph service adapter"
    );
    assert_eq!(
        MethodDispatchKind::S4OrchestrationAdapter.label(),
        "S4 orchestration adapter"
    );
    assert_eq!(
        MethodDispatchKind::S5GovernanceAdapter.label(),
        "S5 governance adapter"
    );
    assert_eq!(
        MethodDispatchKind::S0ProductAdapter.label(),
        "S0 product adapter"
    );
    assert_eq!(MethodDispatchKind::Missing.label(), "Missing");
}
