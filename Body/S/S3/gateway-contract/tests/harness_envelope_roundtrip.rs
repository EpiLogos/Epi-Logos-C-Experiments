use epi_s3_gateway_contract::{
    ConversationSliceHandle, HarnessBacking, HarnessCostClass, HarnessDispatch,
    HarnessDispatchError, HarnessDispatchInput, HarnessDispatchPurpose, HarnessRegistry,
    HarnessRegistryEntry, HarnessToolCallStatus, HarnessToolGrant, HarnessTurnContext,
    HarnessTurnEvent, HarnessTurnUsage, HarnessWorktreeAuthority, ToolCallEnforcementHook,
    VakAddress, VakAddressFilter,
};
use portal_core::{CpfState, CsDirection, CsField};
use serde_json::json;

#[test]
fn every_harness_turn_event_variant_round_trips_through_serde() {
    let events = vec![
        HarnessTurnEvent::TextChunk {
            text: "hello".to_string(),
        },
        HarnessTurnEvent::ReasoningChunk {
            text: "because".to_string(),
        },
        HarnessTurnEvent::ToolCallRequested {
            call_id: "call-1".to_string(),
            name: "bash".to_string(),
            arguments: json!({"cmd": "cargo test"}),
        },
        HarnessTurnEvent::ToolCallInProgress {
            call_id: "call-1".to_string(),
            name: "bash".to_string(),
        },
        HarnessTurnEvent::ToolCallObserved {
            call_id: "call-1".to_string(),
            name: "bash".to_string(),
            arguments: json!({"cmd": "cargo test"}),
            result: json!({"exitCode": 0}),
            status: HarnessToolCallStatus::Succeeded,
            duration_ms: 42,
        },
        HarnessTurnEvent::TurnComplete {
            text: "done".to_string(),
            usage: HarnessTurnUsage {
                input_tokens: 10,
                output_tokens: 5,
                total_tokens: 15,
            },
            response_model: "claude-opus".to_string(),
            finish_reasons: vec!["stop".to_string()],
        },
        HarnessTurnEvent::TurnCancelled {
            reason: "user-request".to_string(),
            partial_text: "partial".to_string(),
        },
        HarnessTurnEvent::ContextWindowExceeded {
            max_tokens: 200_000,
            actual_tokens: 200_001,
        },
        HarnessTurnEvent::HarnessError {
            message: "temporary overload".to_string(),
            code: "overloaded".to_string(),
            retryable: true,
        },
    ];

    for event in events {
        let json = serde_json::to_value(&event).expect("event serializes");
        let decoded: HarnessTurnEvent = serde_json::from_value(json).expect("event deserializes");
        assert_eq!(decoded, event);
    }
}

#[test]
fn harness_dispatch_envelope_and_turn_context_round_trip() {
    let registry = registry();
    let dispatch = HarnessDispatch::new(
        HarnessDispatchInput {
            harness_id: "codex".to_string(),
            model_slot: "anuttara_verifier".to_string(),
            purpose: HarnessDispatchPurpose::Review,
            worktree: Some(HarnessWorktreeAuthority {
                path: "/tmp/epi-worktree".to_string(),
                lease_id: "lease-1".to_string(),
                write_scopes: vec!["Body/S/S3/gateway-contract/src/harness.rs".to_string()],
            }),
            parent_session_key: Some("agent:main:main".to_string()),
            vak_address: vak_address(),
            parent_slice: Some(parent_slice()),
            cost_class: HarnessCostClass::Warm,
            tool_grant: Some(HarnessToolGrant {
                grant_id: "grant-1".to_string(),
                allowed_tools: vec!["bash".to_string(), "read".to_string()],
                policy_gate: "meta-layer-tool-policy".to_string(),
            }),
        },
        &registry,
    )
    .expect("registered non-converse dispatch is valid");

    let context = HarnessTurnContext::new(
        dispatch,
        "turn-1",
        ToolCallEnforcementHook::gateway_policy_gate("hook-1"),
    );
    let json = serde_json::to_value(&context).expect("turn context serializes");

    assert_eq!(
        json["toolCallEnforcement"]["gatewayMethod"],
        "s4'.permission.get"
    );
    assert_eq!(
        json["dispatch"]["parentSlice"]["sessionKey"],
        "agent:main:main"
    );

    let decoded: HarnessTurnContext =
        serde_json::from_value(json).expect("turn context deserializes");
    assert_eq!(decoded, context);
}

#[test]
fn unregistered_harness_id_fails_loud_at_construction() {
    let err = HarnessDispatch::new(
        HarnessDispatchInput {
            harness_id: "unregistered".to_string(),
            model_slot: "nara_parser".to_string(),
            purpose: HarnessDispatchPurpose::Explore,
            worktree: None,
            parent_session_key: None,
            vak_address: vak_address(),
            parent_slice: None,
            cost_class: HarnessCostClass::Cold,
            tool_grant: None,
        },
        &registry(),
    )
    .unwrap_err();

    assert_eq!(
        err,
        HarnessDispatchError::UnregisteredHarness {
            harness_id: "unregistered".to_string()
        }
    );
    assert!(err.to_string().contains("unregistered"));
}

#[test]
fn converse_dispatch_rejects_worktree_or_tool_grant_authority() {
    let with_worktree = HarnessDispatch::new(
        HarnessDispatchInput {
            harness_id: "pi".to_string(),
            model_slot: "nara_parser".to_string(),
            purpose: HarnessDispatchPurpose::Converse,
            worktree: Some(HarnessWorktreeAuthority {
                path: "/tmp/should-not-exist".to_string(),
                lease_id: "lease-voice".to_string(),
                write_scopes: vec!["Body/**".to_string()],
            }),
            parent_session_key: None,
            vak_address: vak_address(),
            parent_slice: None,
            cost_class: HarnessCostClass::Hot,
            tool_grant: None,
        },
        &registry(),
    )
    .unwrap_err();
    assert_eq!(with_worktree, HarnessDispatchError::ConverseCarriesWorktree);

    let with_tool_grant = HarnessDispatch::new(
        HarnessDispatchInput {
            harness_id: "pi".to_string(),
            model_slot: "nara_parser".to_string(),
            purpose: HarnessDispatchPurpose::Converse,
            worktree: None,
            parent_session_key: None,
            vak_address: vak_address(),
            parent_slice: None,
            cost_class: HarnessCostClass::Hot,
            tool_grant: Some(HarnessToolGrant {
                grant_id: "grant-voice".to_string(),
                allowed_tools: vec!["bash".to_string()],
                policy_gate: "meta-layer-tool-policy".to_string(),
            }),
        },
        &registry(),
    )
    .unwrap_err();
    assert_eq!(
        with_tool_grant,
        HarnessDispatchError::ConverseCarriesToolGrant
    );
}

fn registry() -> HarnessRegistry {
    HarnessRegistry::new(vec![
        HarnessRegistryEntry {
            harness_id: "pi".to_string(),
            backing: HarnessBacking::Acp,
        },
        HarnessRegistryEntry {
            harness_id: "codex".to_string(),
            backing: HarnessBacking::NativeCli,
        },
    ])
}

fn parent_slice() -> ConversationSliceHandle {
    ConversationSliceHandle {
        session_key: "agent:main:main".to_string(),
        day_anchor: "2026-06-17".to_string(),
        now_start_tick: 12,
        now_end_tick: 31,
        thread_ids: vec!["thread-main".to_string()],
        message_span: (3, 8),
        vak_filter: Some(VakAddressFilter {
            address: vak_address(),
            include_descendants: true,
        }),
        redaction_policy: "governed_review_metadata_only".to_string(),
        provenance_audit_id: "audit-1".to_string(),
    }
}

fn vak_address() -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT2".to_string()],
        cp: "4.2".to_string(),
        cf: "(0/1/2)".to_string(),
        cfp: "CFP3".to_string(),
        cs: CsField {
            code: "S3".to_string(),
            direction: CsDirection::Day,
            recognized: false,
        },
    }
}
