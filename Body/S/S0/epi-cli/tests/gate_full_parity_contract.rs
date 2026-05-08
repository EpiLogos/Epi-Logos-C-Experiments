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
