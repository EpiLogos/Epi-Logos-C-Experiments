use epi_s3_gateway_contract::{
    GRAPHITI_BASE_URL, GRAPHITI_INVOCATION_OWNER, GRAPHITI_RUNTIME_AUTHORITY,
};
use epi_s3_graphiti_runtime::{
    provenance_from_record, session_memory_deposit_payload, session_memory_envelope,
    GraphitiRuntimeConfig,
};
use serde_json::json;

#[test]
fn graphiti_runtime_config_is_s3_owned_and_http_adapter_is_compatibility_mode() {
    let config = GraphitiRuntimeConfig::default();
    assert_eq!(config.base_url, GRAPHITI_BASE_URL);
    assert_eq!(config.runtime_authority, GRAPHITI_RUNTIME_AUTHORITY);
    assert_eq!(config.invocation_owner, GRAPHITI_INVOCATION_OWNER);
    assert!(config.compatibility_http_adapter);
}

#[test]
fn graphiti_session_memory_envelope_keeps_s3_runtime_and_s5_invocation_split() {
    let envelope = session_memory_envelope(json!({"agentId": "epii"}));
    assert_eq!(envelope["runtimeOwner"], "S3'");
    assert_eq!(envelope["invocationOwner"], "S5/S5'");
    assert_eq!(
        envelope["privacyBoundary"],
        "protected-local-episodic-memory"
    );
}

#[test]
fn graphiti_deposit_payload_rejects_identity_mutation_and_keeps_session_arc() {
    let payload = session_memory_deposit_payload(
        "epii",
        "session note",
        "agent:epii:main",
        "local-user",
        "20260509",
        "5'",
        "4.5",
        "(5/0)",
        false,
    )
    .expect("non-identity deposit should be allowed");
    assert_eq!(payload["source"], "epii");
    assert_eq!(payload["group_id"], "agent:epii:main");
    assert_eq!(
        payload["arc_id"],
        "day:20260509:session:agent:epii:main:namespace:local-user"
    );

    let err = session_memory_deposit_payload(
        "epii",
        "identity change",
        "agent:epii:main",
        "local-user",
        "20260509",
        "5'",
        "4.5",
        "(5/0)",
        true,
    )
    .unwrap_err();
    assert!(err.contains("cannot mutate protected identity"));
}

#[test]
fn graphiti_provenance_events_are_built_without_s0_gate_state() {
    let event = provenance_from_record(
        "session.start",
        "session-id",
        "agent:epii:main",
        Some("agent"),
        Some("20260509"),
        Some("Idea/Empty/Present/09-05-2026/now.md"),
    );
    assert_eq!(event.event_type, "session.start");
    assert_eq!(event.session_id, "session-id");
    assert_eq!(event.channel_id, "agent:epii:main");
    assert_eq!(event.channel_type, "agent");
    assert_eq!(event.day_id, "20260509");
    assert_eq!(event.vault_now_path, "Idea/Empty/Present/09-05-2026/now.md");
    assert!(!event.timestamp.is_empty());
}
