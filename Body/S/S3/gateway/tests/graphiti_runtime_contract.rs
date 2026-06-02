use epi_s3_gateway_contract::{
    GRAPHITI_BASE_URL, GRAPHITI_INVOCATION_OWNER, GRAPHITI_RUNTIME_AUTHORITY,
};
use epi_s3_graphiti_runtime::{
    kernel_profile_observation_deposit_payload, kernel_resonance_deposit_payload,
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
fn graphiti_kernel_resonance_payload_keeps_s3_runtime_and_s2_graph_origin_clear() {
    let payload = kernel_resonance_deposit_payload(
        "anima",
        "agent:epii:main",
        "pratibimba-test",
        "20260517",
        "S2.kernel.resonance.agent-epii-main.1779000001234.31",
        "M2",
        31,
        2,
        0.875,
        9,
        false,
    )
    .expect("kernel resonance deposit should be allowed");

    assert_eq!(payload["source"], "anima");
    assert_eq!(payload["ql_position"], "2/5");
    assert_eq!(payload["cp"], "S2.5");
    assert_eq!(payload["cpf"], "kernel-resonance");
    assert_eq!(payload["episode_type"], "kernel_resonance");
    assert_eq!(payload["metadata"]["source_coordinate"], "M2");
    assert_eq!(
        payload["metadata"]["observation_coordinate"],
        "S2.kernel.resonance.agent-epii-main.1779000001234.31"
    );
    assert_eq!(payload["metadata"]["resonance_index"], 31);
    assert_eq!(payload["metadata"]["tritone_square"], 2);
    assert_eq!(payload["metadata"]["kernel_tick"], 9);
    assert_eq!(
        payload["arc_id"],
        "day:20260517:session:agent:epii:main:namespace:pratibimba-test"
    );

    let err = kernel_resonance_deposit_payload(
        "anima",
        "agent:epii:main",
        "pratibimba-test",
        "20260517",
        "S2.kernel.resonance.agent-epii-main.1779000001234.31",
        "M2",
        31,
        2,
        0.875,
        9,
        true,
    )
    .unwrap_err();
    assert!(err.contains("cannot mutate protected identity"));
}

#[test]
fn graphiti_kernel_profile_observation_payload_carries_s2_anchor_without_private_state() {
    let coordinate_anchor = json!({
        "coordinate": "M2",
        "coordinate_anchor": {
            "coordinate": "M2",
            "kernel": {
                "source": "s0.kernel",
                "profile": "portal-core::MathemeHarmonicProfile"
            },
            "harmonic_pointer": {
                "source_profile": "portal-core::MathemeHarmonicProfile",
                "source_contract": "S0 Bedrock7/PointerWeb36/CF7",
                "bedrock": {
                    "psychoid_number": "#2",
                    "inverted_psychoid_number": "#2'",
                    "successor_psychoid_number": "#3"
                },
                "pointer_anchor": {
                    "source_coordinate": "S0/QL-meta",
                    "ql_position": 2,
                    "helix": "bimba",
                    "web_index": 2,
                    "web_cardinality": 36,
                    "lens_anchor": "L2"
                },
                "context_frames": {
                    "cf_cardinality": 7,
                    "diatonic_frame": "(0/1/2)",
                    "vak_agent": "Eros"
                }
            }
        }
    });

    let payload = kernel_profile_observation_deposit_payload(
        "anima",
        "agent:epii:main",
        "pratibimba-test",
        "20260519",
        "Idea/Empty/Present/19-05-2026/20260519-120000-main/now.md",
        "M2",
        10,
        600,
        64,
        42,
        &coordinate_anchor,
        false,
    )
    .expect("kernel profile observation deposit should be allowed");

    assert_eq!(payload["source"], "anima");
    assert_eq!(payload["ql_position"], "3/5");
    assert_eq!(payload["cp"], "S3.5");
    assert_eq!(payload["cpf"], "kernel-profile-observation");
    assert_eq!(payload["episode_type"], "kernel_profile_observation");
    assert_eq!(payload["metadata"]["source_coordinate"], "M2");
    assert_eq!(payload["metadata"]["tick12"], 10);
    assert_eq!(payload["metadata"]["degree720"], 600);
    assert_eq!(payload["metadata"]["resonance72_index"], 64);
    assert_eq!(payload["metadata"]["mahamaya_address64"], 42);
    assert_eq!(payload["metadata"]["kernel_owner"], "S0");
    assert_eq!(payload["metadata"]["graph_owner"], "S2");
    assert_eq!(payload["metadata"]["runtime_owner"], "S3'");
    assert_eq!(payload["metadata"]["invocation_owner"], "S5/S5'");
    assert_eq!(
        payload["metadata"]["profile_to_performance_stream"]["stream"],
        "S0.kernel-bridge.m1-profile-to-performance"
    );
    assert_eq!(
        payload["metadata"]["profile_to_performance_stream"]["consumer"],
        "M1'/Paramasiva"
    );
    assert_eq!(
        payload["metadata"]["profile_to_performance_stream"]["tempo_authority"],
        "kernel-tick-not-renderer-frame"
    );
    assert_eq!(
        payload["metadata"]["profile_to_performance_stream"]["renderer_derivation_allowed"],
        false
    );
    assert!(
        payload["metadata"]["profile_to_performance_stream"]["required_profile_fields"]
            .as_array()
            .expect("required_profile_fields")
            .iter()
            .any(|field| field == "lensMode")
    );
    assert_eq!(
        payload["metadata"]["coordinate_anchor"]["coordinate_anchor"]["harmonic_pointer"]
            ["pointer_anchor"]["lens_anchor"],
        "L2"
    );
    assert!(payload["metadata"].get("q_b").is_none());

    let mut private_anchor = coordinate_anchor;
    private_anchor["q_b"] = json!([1.0, 0.0, 0.0, 0.0]);
    let err = kernel_profile_observation_deposit_payload(
        "anima",
        "agent:epii:main",
        "pratibimba-test",
        "20260519",
        "Idea/Empty/Present/19-05-2026/20260519-120000-main/now.md",
        "M2",
        10,
        600,
        64,
        42,
        &private_anchor,
        false,
    )
    .unwrap_err();
    assert!(err.contains("protected kernel state"));
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
