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
