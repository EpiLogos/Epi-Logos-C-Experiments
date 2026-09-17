use crate::*;
use serde_json::{json, Value};

#[test]
fn gateway_protocol_contract_is_s3_protocol_three() {
    assert_eq!(PROTOCOL_VERSION, 3);
    assert_eq!(PROTOCOL_DEV_VERSION, "s3-gateway-dev");
    assert_eq!(DEFAULT_GATEWAY_PORT, TEST_GATEWAY_PORT);
}

#[test]
fn product_method_manifest_keeps_execution_spine() {
    for required in [
        "connect",
        "agent",
        "chat.send",
        "sessions.run-state",
        "sessions.resolve",
        "sessions.fork",
        "sessions.resume",
        "sessions.import",
        "sessions.tree",
        "skills.install",
        "health.snapshot",
        "wizard.status",
    ] {
        assert!(METHOD_NAMES.contains(&required));
    }
}

#[test]
fn nara_transform_lifecycle_is_advertised_and_classified() {
    for method in crate::NARA_TRANSFORM_METHODS {
        assert!(crate::METHOD_NAMES.contains(method));
        let plan = crate::method_dispatch_plan_entry(method).expect("transform dispatch plan");
        assert_eq!(plan.kind, crate::MethodDispatchKind::S0ProductAdapter);
        assert_eq!(
            plan.authority_path,
            "Body/S/S0/epi-cli::nara::transform::lifecycle"
        );
    }
}

#[test]
fn codon_amino_acid_lookup_is_advertised_and_classified() {
    assert!(crate::METHOD_NAMES.contains(&crate::S2_CODON_AA_LOOKUP_METHOD));
    let plan = crate::method_dispatch_plan_entry(crate::S2_CODON_AA_LOOKUP_METHOD)
        .expect("codon lookup dispatch plan");
    assert_eq!(plan.kind, crate::MethodDispatchKind::S0ProductAdapter);
    assert!(plan.authority_path.contains("portal-core::transcription"));
}

#[test]
fn anuttara_verifier_contract_exposes_s0_prime_methods() {
    let methods = s0_prime_verifier_methods();

    assert_eq!(
        methods,
        &[
            "s0'.verifier.check_state",
            "s0'.verifier.emit_query",
            "s0'.verifier.respond_question",
            "s0'.verifier.validate_membership",
            "s0'.verifier.owl_query",
        ]
    );
    for method in methods {
        assert!(METHOD_NAMES.contains(method));
        assert!(method_dispatch_plan_entry(method).is_some());
    }
}

#[test]
fn settings_contract_exposes_s0_prime_methods() {
    let methods = s0_prime_settings_methods();

    assert_eq!(
        methods,
        &["s0'.settings.api_key_status", "s0'.settings.opt_in"]
    );
    for method in methods {
        assert!(METHOD_NAMES.contains(method));
        assert!(method_dispatch_plan_entry(method).is_some());
    }
}

#[test]
fn m0_residual_browser_contract_exposes_s2_graph_list() {
    assert_eq!(S2_GRAPH_LIST_METHOD, "s2.graph.list");
    assert!(METHOD_NAMES.contains(&S2_GRAPH_LIST_METHOD));
    assert!(S2_GRAPH_GATEWAY_EXPOSED_METHODS.contains(&S2_GRAPH_LIST_METHOD));

    let entry =
        method_dispatch_plan_entry(S2_GRAPH_LIST_METHOD).expect("S2 graph list dispatch row");
    assert_eq!(entry.kind, MethodDispatchKind::S2GraphServiceAdapter);
    assert_eq!(entry.authority_path, "Body/S/S2/graph-services");
}

#[test]
fn base_view_contract_exposes_s2_graph_list_by_filter() {
    // Track 48 §13.E — the additive BasesView data-layer gateway surface.
    assert_eq!(S2_GRAPH_LIST_BY_FILTER_METHOD, "s2.graph.list_by_filter");
    assert!(METHOD_NAMES.contains(&S2_GRAPH_LIST_BY_FILTER_METHOD));
    assert!(S2_GRAPH_GATEWAY_EXPOSED_METHODS.contains(&S2_GRAPH_LIST_BY_FILTER_METHOD));

    let entry = method_dispatch_plan_entry(S2_GRAPH_LIST_BY_FILTER_METHOD)
        .expect("S2 graph list_by_filter dispatch row");
    assert_eq!(entry.kind, MethodDispatchKind::S2GraphServiceAdapter);
    assert_eq!(entry.authority_path, "Body/S/S2/graph-services");
}

#[test]
fn settings_api_key_status_response_never_carries_value() {
    let response = ApiKeyStatusResponse {
        present: true,
        opt_in: "recorded".to_owned(),
    };
    let json = serde_json::to_value(&response).expect("status response should serialize");
    assert_eq!(json["present"], true);
    assert_eq!(json["optIn"], "recorded");
    assert!(
        json.get("value").is_none(),
        "api key status response must never carry the key value"
    );
}

#[test]
fn anuttara_verifier_typed_query_contract_uses_full_seven_laws() {
    let query = M0VerifierTypedQuery {
        surface: "full-7-laws".to_owned(),
        law_family: "coordinate-language-law-4".to_owned(),
        symbolic_coordinate_string: "M0-4.4/5".to_owned(),
        query: "validate_coordinate_language_membership".to_owned(),
    };

    let json = serde_json::to_value(&query).expect("typed query should serialize");
    assert_eq!(json["surface"], "full-7-laws");
    assert_ne!(json["surface"], "law-6-minimal");

    let round_trip: M0VerifierTypedQuery =
        serde_json::from_value(json).expect("typed query should deserialize");
    assert_eq!(round_trip.law_family, "coordinate-language-law-4");
}

#[test]
fn anuttara_verifier_report_contract_carries_slot_privacy_boundary_compliance() {
    let report = M0VerifierReportContract {
        virtue_witness_vector: 0x01ff,
        virtue_scores: [1.0; 9],
        unsatisfied_constraints: vec![],
        coherence_score: 1.0,
        slot_privacy_boundary_compliance: true,
    };

    let json = serde_json::to_value(&report).expect("report should serialize");
    assert_eq!(json["slotPrivacyBoundaryCompliance"], true);

    let round_trip: M0VerifierReportContract =
        serde_json::from_value(json).expect("report should deserialize");
    assert!(round_trip.slot_privacy_boundary_compliance);
}

#[test]
fn gateway_session_operation_contract_covers_omnipanel_runtime_surface() {
    let contracts = gateway_session_operation_contracts();
    let methods: Vec<&str> = contracts
        .iter()
        .map(|contract| contract.gateway_method)
        .collect();

    for required in [
        "sessions.list",
        "sessions.resolve",
        "sessions.preview",
        "sessions.patch",
        "sessions.reset",
        "sessions.delete",
        "sessions.compact",
        "sessions.fork",
        "sessions.resume",
        "sessions.import",
        "sessions.tree",
        "chat.history",
        "chat.send",
        "chat.abort",
        "channels.status",
        "channels.logout",
    ] {
        assert!(
            methods.contains(&required),
            "gateway session contract should expose {required}; got {methods:?}"
        );
    }

    let history = contracts
        .iter()
        .find(|contract| contract.kind == GatewaySessionOperationKind::ChatHistory)
        .expect("chat history contract should be present");
    assert_eq!(history.coordinate_owner, "S3");
    assert_eq!(history.projection_table, "session_surface");
    assert_eq!(history.request_keys, &["sessionKey"]);
    assert!(history.response_keys.contains(&"canonicalKey"));
    assert!(METHOD_NAMES.contains(&history.gateway_method));

    let run_state = contracts
        .iter()
        .find(|contract| contract.kind == GatewaySessionOperationKind::RunState)
        .expect("run state contract should be present");
    assert_eq!(run_state.gateway_method, "sessions.run-state");
    assert!(METHOD_NAMES.contains(&run_state.gateway_method));
    assert!(run_state.response_keys.contains(&"retrySettlementState"));
    assert!(run_state.response_keys.contains(&"idleState"));
    assert!(run_state.response_keys.contains(&"diagnostics"));

    let channel_binding = contracts
        .iter()
        .find(|contract| contract.kind == GatewaySessionOperationKind::ChannelBindingStatus)
        .expect("channel binding status contract should be present");
    assert_eq!(channel_binding.gateway_method, "channels.status");
    assert_eq!(channel_binding.agent_access_owner, "S4/S5");
}

#[test]
fn graphiti_contract_keeps_runtime_separate_from_invocation_governance() {
    assert_eq!(GRAPHITI_PORT, 37778);
    assert_eq!(GRAPHITI_BASE_URL, "http://127.0.0.1:37778");
    assert!(GRAPHITI_RUNTIME_AUTHORITY.contains("S3"));
    assert!(GRAPHITI_INVOCATION_OWNER.contains("S5"));
    assert!(!GRAPHITI_RUNTIME_AUTHORITY.contains("sidecar"));
}

#[test]
fn graphiti_adapter_contract_prefers_native_library_runtime() {
    let adapter = GraphitiAdapterContract::native_library();

    assert_eq!(adapter.coordinate_owner, "S3");
    assert_eq!(adapter.invocation_owner, "S5");
    assert_eq!(adapter.mode, GraphitiAdapterMode::NativeLibrary);
    assert_eq!(
        adapter.compatibility_mode,
        Some(GraphitiAdapterMode::HttpCompatibility)
    );
    assert!(adapter.required_capabilities.contains(&"add_episode"));
    assert!(adapter.required_capabilities.contains(&"search"));
    assert!(adapter
        .required_capabilities
        .contains(&"build_indices_and_constraints"));
    assert!(!adapter.description.contains("sidecar"));
}

#[test]
fn redis_temporal_context_contract_owns_session_now_keys() {
    let role = RedisTemporalContextRole::session_now();

    assert_eq!(role.coordinate_owner, "S3");
    assert_eq!(role.redis_namespace, "s3:gateway:temporal");
    assert_eq!(role.ttl_seconds, 300);
    assert_eq!(
        role.session_now_key("test-session-123"),
        "cache:hot:s3:gateway:temporal:session:test-session-123:now:md"
    );
    assert_eq!(
        role.day_context_key("07-05-2026"),
        "cache:warm:s3:gateway:temporal:day:07-05-2026:context"
    );
    assert_eq!(
        role.day_kairos_key("07-05-2026"),
        "cache:hot:s3:gateway:temporal:day:07-05-2026:kairos"
    );
    assert_eq!(
        role.session_kairos_key("test-session-123"),
        "cache:hot:s3:gateway:temporal:session:test-session-123:kairos"
    );
    assert_eq!(
        role.personal_orientation_key("pratibimba-abcd1234"),
        "cache:hot:s3:gateway:temporal:personal:pratibimba-abcd1234:orientation"
    );
    assert_eq!(
        role.agent_orientation_key("anima", "test-session-123"),
        "cache:hot:s3:gateway:temporal:agent:anima:session:test-session-123:orientation"
    );
    assert!(role.description.contains("session"));
    assert!(!role.description.contains("graph retrieval"));
}

#[test]
fn psyche_runtime_handle_contract_uses_s3_active_layer_without_raw_bodies() {
    let handle = PsycheRuntimeHandle::for_session("session-main");

    assert_eq!(handle.coordinate_owner, "S3");
    assert_eq!(handle.continuity_owner, "S4/Psyche");
    assert_eq!(
        handle.redis_state_key,
        "cache:active:s3:gateway:psyche:session:session-main:state"
    );
    assert_eq!(handle.max_carry_forward_items, 12);
    assert!(handle.protected_body_policy.contains("handles"));
    assert!(handle
        .protected_body_policy
        .contains("do not expose raw protected bodies"));
}

#[test]
fn kbase_source_runtime_handle_contract_uses_s3_warm_layer_refs() {
    let handle = KbaseSourceRuntimeHandle::new("gnosis-pack-42", "sha256-deadbeef");

    assert_eq!(handle.coordinate_owner, "S3");
    assert_eq!(handle.semantic_owner, "S5/Gnosis");
    assert_eq!(
        handle.kbase_ref_key,
        "cache:warm:s5:kbase:ref:gnosis-pack-42"
    );
    assert_eq!(
        handle.source_pool_ref_key,
        "cache:warm:s5:source-pool:ref:sha256-deadbeef"
    );
    assert!(handle
        .protected_body_policy
        .contains("raw protected bodies require explicit hot-local TTL"));
}

#[test]
fn coordinate_lookup_cache_handle_contract_uses_cold_layer_invalidation_axes() {
    let handle = CoordinateLookupCacheHandle::new("graph-rev-17", "M4.4.4.4");

    assert_eq!(handle.coordinate_owner, "S3");
    assert_eq!(handle.graph_owner, "S2");
    assert_eq!(
        handle.coordinate_snapshot_key,
        "cache:cold:s2:coordinate:lookup:graph-rev-17:M4.4.4.4"
    );
    assert!(handle.invalidates_by.contains(&"graph_revision"));
    assert!(handle.invalidates_by.contains(&"embedding_version"));
    assert!(handle.invalidates_by.contains(&"q_schema_version"));
    assert!(handle.invalidates_by.contains(&"source_hash"));
}

#[test]
fn session_record_contract_covers_omnipanel_metadata() {
    let record = SessionRecord {
        canonical_key: "agent:main:main".to_owned(),
        aliases: vec!["NOW-main".to_owned()],
        label: Some("Main".to_owned()),
        session_id: "session-1".to_owned(),
        day_id: Some("02-05-2026".to_owned()),
        spawned_by: None,
        parent_session_key: Some("agent:root:main".to_owned()),
        source_session_key: Some("agent:source:main".to_owned()),
        source_session_kind: Some("fork".to_owned()),
        vault_now_path: Some("/vault/now.md".to_owned()),
        runtime_cwd: Some("/repo".to_owned()),
        vault_root: Some("/vault".to_owned()),
        resource_loader_id: Some("loader-1".to_owned()),
        retry_settlement_state: Some("idle".to_owned()),
        diagnostics: vec![json!({"severity":"info","message":"ready"})],
        delivery_context: Some(json!({"mode":"reply"})),
        channel: Some("telegram".to_owned()),
        thread_id: Some("thread-1".to_owned()),
        group_id: Some("group-1".to_owned()),
        group_channel: Some("ops".to_owned()),
        group_space: Some("alpha".to_owned()),
        team_id: Some("team-1".to_owned()),
        team_role: Some("lead".to_owned()),
        orchestration_kind: Some("anima".to_owned()),
        cmux_workspace: Some("workspace".to_owned()),
        cmux_surface: Some("pane".to_owned()),
        cmux_pane_id: Some("pane-1".to_owned()),
        terminal_binding: Some(TerminalBinding {
            terminal_identifier: Some("terminal:main".to_owned()),
            session_anchor: Some("agent:main:main".to_owned()),
            tmux_pane_id: Some("%7".to_owned()),
            attached_session_key: Some("agent:main:main".to_owned()),
            terminal_status: Some(TerminalStatus::Attached),
            lease: Some(TerminalLease {
                lease_owner: Some("pi.main".to_owned()),
                lease_purpose: Some("interactive-session".to_owned()),
                lease_expires_at_ms: Some(2),
            }),
            capture_policy: Some(TerminalCapturePolicy {
                mode: TerminalCaptureMode::MetadataOnly,
                max_lines: None,
                redaction_policy: None,
            }),
        }),
        active_agent_id: "pi.main".to_owned(),
        subagent_lineage: vec!["vak".to_owned(), "pi.main".to_owned()],
        workspace_root: "/tmp/workspace".to_owned(),
        bootstrap_scope: "/tmp/bootstrap".to_owned(),
        thinking_level: Some("high".to_owned()),
        verbose_level: Some("normal".to_owned()),
        reasoning_level: Some("high".to_owned()),
        model_override: Some("gpt".to_owned()),
        provider_override: Some("openai".to_owned()),
        cli_session_ids: vec!["cli-1".to_owned()],
        vak_address: None,
        updated_at_ms: 1,
    };

    let value = serde_json::to_value(&record).expect("session record should serialize");
    for storage_field in [
        "canonical_key",
        "aliases",
        "label",
        "active_agent_id",
        "subagent_lineage",
        "workspace_root",
        "bootstrap_scope",
        "parent_session_key",
        "source_session_key",
        "source_session_kind",
        "runtime_cwd",
        "vault_root",
        "resource_loader_id",
        "retry_settlement_state",
        "diagnostics",
        "team_id",
        "team_role",
        "orchestration_kind",
        "cmux_workspace",
        "cmux_surface",
        "cmux_pane_id",
        "terminal_binding",
    ] {
        assert!(
            value.get(storage_field).is_some(),
            "{storage_field} should be present in the session storage contract"
        );
    }

    assert_eq!(
        value["terminal_binding"]["terminalIdentifier"],
        "terminal:main"
    );
    assert_eq!(
        value["terminal_binding"]["sessionAnchor"],
        "agent:main:main"
    );
}

#[test]
fn terminal_binding_round_trips_through_camel_case_contract() {
    let binding = TerminalBinding {
        terminal_identifier: Some("terminal:main".to_owned()),
        session_anchor: Some("agent:main:main".to_owned()),
        tmux_pane_id: Some("%7".to_owned()),
        attached_session_key: Some("agent:main:main".to_owned()),
        terminal_status: Some(TerminalStatus::Attached),
        lease: Some(TerminalLease {
            lease_owner: Some("pi.main".to_owned()),
            lease_purpose: Some("operator-presence".to_owned()),
            lease_expires_at_ms: Some(4_102_444_800_000),
        }),
        capture_policy: Some(TerminalCapturePolicy {
            mode: TerminalCaptureMode::Transcript,
            max_lines: Some(200),
            redaction_policy: Some("pii-and-secrets".to_owned()),
        }),
    };

    let value = serde_json::to_value(&binding).expect("terminal binding serializes");
    assert_eq!(value["terminalIdentifier"], "terminal:main");
    assert_eq!(value["sessionAnchor"], "agent:main:main");
    assert_eq!(value["tmuxPaneId"], "%7");
    assert_eq!(value["attachedSessionKey"], "agent:main:main");
    assert_eq!(value["terminalStatus"], "attached");
    assert_eq!(value["lease"]["leaseOwner"], "pi.main");
    assert_eq!(value["capturePolicy"]["mode"], "transcript");

    let decoded: TerminalBinding =
        serde_json::from_value(value).expect("terminal binding deserializes");
    assert_eq!(decoded, binding);
}

#[test]
fn terminal_binding_inherited_metadata_clears_active_authority() {
    let binding = TerminalBinding {
        terminal_identifier: Some("terminal:main".to_owned()),
        session_anchor: Some("agent:main:main".to_owned()),
        tmux_pane_id: Some("%7".to_owned()),
        attached_session_key: Some("agent:main:main".to_owned()),
        terminal_status: Some(TerminalStatus::Attached),
        lease: Some(TerminalLease {
            lease_owner: Some("pi.main".to_owned()),
            lease_purpose: Some("operator-presence".to_owned()),
            lease_expires_at_ms: Some(4_102_444_800_000),
        }),
        capture_policy: Some(TerminalCapturePolicy {
            mode: TerminalCaptureMode::MetadataOnly,
            max_lines: Some(20),
            redaction_policy: Some("none".to_owned()),
        }),
    };

    let inherited = binding.safe_inherited_metadata();

    assert_eq!(
        inherited.terminal_identifier.as_deref(),
        Some("terminal:main")
    );
    assert_eq!(inherited.session_anchor.as_deref(), Some("agent:main:main"));
    assert!(inherited.tmux_pane_id.is_none());
    assert!(inherited.attached_session_key.is_none());
    assert!(inherited.terminal_status.is_none());
    assert!(inherited.lease.is_none());
    assert_eq!(inherited.capture_policy, binding.capture_policy);
}

#[test]
fn run_and_event_contracts_preserve_temporal_context() {
    let context = RunContext::new("run-1", "agent:main:main", "agent");
    let snapshot = RunSnapshot::ok("run-1", "agent:main:main", 10, 20);
    let event = GatewayEvent::new(
        "agent",
        Some("run-1"),
        Some("agent:main:main"),
        Some(1),
        json!({"state":"accepted"}),
    );

    assert_eq!(context.session_key, "agent:main:main");
    assert_eq!(snapshot.ended_at_ms, Some(20));
    assert_eq!(event.seq, Some(1));
}

#[test]
fn chat_run_registry_tracks_active_runs_by_session() {
    let mut registry = ChatRunRegistry::default();
    registry.add("agent:main:main", "run-a");
    registry.add("agent:main:main", "run-b");

    assert_eq!(registry.list("agent:main:main"), vec!["run-a", "run-b"]);
    assert_eq!(
        registry.remove_run("run-a").as_deref(),
        Some("agent:main:main")
    );
    assert_eq!(registry.pop("agent:main:main").as_deref(), Some("run-b"));
    assert!(registry.list("agent:main:main").is_empty());
}

#[test]
fn kernel_envelope_contract_registers_typed_publish_method_and_keeps_legacy_json_column() {
    let envelope = kernel_envelope_contract();
    assert_eq!(envelope.coordinate_owner, "S0/QL-meta");
    assert_eq!(envelope.privacy, "safe-public-current-kernel-tick");
    assert_eq!(envelope.typed_publish_method, "s3'.kernel.envelope.publish");
    assert_eq!(envelope.legacy_json_column, "kernel_projection_json");
    assert!(METHOD_NAMES.contains(&envelope.typed_publish_method));
    assert!(METHOD_NAMES.contains(&envelope.deposit_method));
    assert!(METHOD_NAMES.contains(&envelope.diagnostic_method));
    for required in [
        "s2'.coordinate.cypher",
        "s2'.coordinate.ingest",
        "s2'.coordinate.analyse_resonance",
        "s2'.coordinate.persist_analysis",
        "s2'.coordinate.aggregate_resonance",
        "s2'.constraint.list",
        "s2'.constraint.register",
        "s2'.constraint.test",
        "s5.trajectory.verify",
        "s5.ebm.train",
        "s5.ebm.export_state",
        "s5.episodic.kernel_profile_observation.deposit",
    ] {
        assert!(
            METHOD_NAMES.contains(&required),
            "kernel-aligned method {required} missing from METHOD_NAMES"
        );
    }
}

#[test]
fn kernel_tick_envelope_serialises_into_legacy_kernel_projection_json_shape() {
    let projection = KernelProjection::default();
    let envelope = KernelTickEnvelope::from_kernel_projection(1, &projection);
    let value = serde_json::to_value(&envelope).expect("envelope serialises");
    let privacy = value
        .get("privacy")
        .and_then(Value::as_str)
        .expect("privacy field");
    let element = value
        .get("tick")
        .and_then(|tick| tick.get("element"))
        .and_then(Value::as_str)
        .expect("tick.element field");
    assert_eq!(privacy, "safe-public-current-kernel-tick");
    assert_eq!(element, "BimbaEncoding");

    let temporal = envelope.to_temporal_projection();
    let legacy = serde_json::to_value(&temporal).expect("temporal serialises");
    assert_eq!(legacy["privacy"], "safe-public-current-kernel-tick");
    assert_eq!(legacy["coordinateOwner"], "S0/QL-meta");
}

#[test]
fn anuttara_diagnostic_carried_in_envelope_round_trips_through_serde() {
    let projection = KernelProjection::default();
    let diag = AnuttaraDiagnostic::parse("?#2-1-3-4{2,4}; ○").expect("parses");
    let envelope = KernelTickEnvelope::from_kernel_projection(2, &projection)
        .with_session_key("session-1")
        .with_source_coordinate("M2-1-3")
        .with_anuttara_diagnostic(diag.clone());

    let json = serde_json::to_string(&envelope).expect("serialises");
    let restored: KernelTickEnvelope = serde_json::from_str(&json).expect("round-trips");
    assert_eq!(restored.anuttara_diagnostic, Some(diag));
    assert_eq!(restored.source_coordinate.as_deref(), Some("M2-1-3"));
}

#[test]
fn spacetimedb_projection_contract_builds_native_subscribe_multi_and_decodes_updates() {
    let plan = SpacetimeProjectionPlan::native("ws://127.0.0.1:3000", "epi-logos-runtime")
        .for_session("agent:main:main", "epii");
    let message = plan.subscribe_multi_message();

    assert_eq!(plan.mode, "native-websocket");
    assert_eq!(plan.subscription_mode, "lite");
    assert_eq!(plan.coordinate_owner, "S3'");
    assert_eq!(plan.agent_access_owner, "S4/S5");
    assert_eq!(
        plan.clock_protocol_version,
        SPACETIME_CLOCK_PROTOCOL_VERSION
    );
    assert_eq!(
        plan.projection_schema_version,
        SPACETIME_PROJECTION_SCHEMA_VERSION
    );
    assert!(METHOD_NAMES.contains(&SPACETIME_SUBSCRIBE_METHOD));
    assert!(METHOD_NAMES.contains(&SPACETIME_SUBSCRIBE_ALIAS_METHOD));
    assert_eq!(
        plan.tables,
        vec![
            "session_surface",
            "kairos_surface",
            "global_temporal_surface",
        ]
    );
    assert_eq!(
        plan.subscribe_url(),
        "ws://127.0.0.1:3000/v1/database/epi-logos-runtime/subscribe"
    );
    assert_eq!(message["SubscribeMulti"]["request_id"], 1);
    assert!(message["SubscribeMulti"]["query_strings"]
        .as_array()
        .unwrap()
        .iter()
        .any(
            |query| query == "SELECT * FROM session_surface WHERE session_key = 'agent:main:main'"
        ));

    let full_plan = plan
        .clone()
        .for_subscription_mode(SPACETIME_PROJECTION_MODE_FULL);
    assert_eq!(full_plan.subscription_mode, "full");
    assert!(full_plan
        .tables
        .iter()
        .any(|table| table == "temporal_event"));
    for shared_table in [
        "world_clock",
        "pratibimba_presence",
        "shared_archetype_event",
        "coincidence",
    ] {
        assert!(
            SPACETIME_PROJECTION_TABLES.contains(&shared_table),
            "{shared_table} should be in the complete projection table contract"
        );
        assert!(
            full_plan.tables.iter().any(|table| table == shared_table),
            "{shared_table} should be available in full subscription mode"
        );
    }
    assert!(
        full_plan
            .subscription_queries()
            .iter()
            .any(|query| query
                == "SELECT * FROM temporal_event WHERE session_key = 'agent:main:main'")
    );
    assert!(full_plan
        .subscription_queries()
        .iter()
        .any(|query| query == "SELECT * FROM world_clock"));
    // 03.T4: shared_archetype_event is keyed by day_id + publisher_identity_handle,
    // not by session_key. The subscription has no WHERE clause; consumer-side
    // and SpaceTimeDB RLS handle visibility.
    assert!(full_plan
        .subscription_queries()
        .iter()
        .any(|query| query == "SELECT * FROM shared_archetype_event"));
    assert!(full_plan
        .subscription_queries()
        .iter()
        .any(|query| query == "SELECT * FROM coincidence"));
    // 03.T4 audit/version surfaces.
    assert!(full_plan
        .subscription_queries()
        .iter()
        .any(|query| query == "SELECT * FROM world_clock_tick"));
    assert!(full_plan
        .subscription_queries()
        .iter()
        .any(|query| query == "SELECT * FROM coincidence_tick"));
    assert!(full_plan
        .subscription_queries()
        .iter()
        .any(|query| query == "SELECT * FROM module_version"));

    let readiness = full_plan.readiness_contract();
    assert_eq!(
        readiness.projection_schema_version,
        SPACETIME_PROJECTION_SCHEMA_VERSION
    );
    assert_eq!(
        readiness.clock_protocol_version,
        SPACETIME_CLOCK_PROTOCOL_VERSION
    );
    assert_eq!(
        readiness.active_fallback_mode,
        SPACETIME_PROJECTION_SOURCE_HTTP_SQL
    );

    for event in [
        "requested",
        "applied",
        "delta",
        "resync",
        "error",
        "closed",
        "fallback-active",
    ] {
        assert!(SPACETIME_SUBSCRIPTION_LIFECYCLE_EVENTS.contains(&event));
    }
    let envelope = full_plan.lifecycle_envelope("requested", json!({"scope":"full"}));
    assert_eq!(envelope.method, SPACETIME_SUBSCRIBE_METHOD);
    assert_eq!(envelope.session_key, "agent:main:main");
    assert_eq!(
        envelope.projection_schema_version,
        SPACETIME_PROJECTION_SCHEMA_VERSION
    );

    let update = json!({
        "SubscribeMultiApplied": {
            "update": {
                "tables": [{
                    "table_name": "session_surface",
                    "updates": [{
                        "inserts": [[
                            "agent:main:main",
                            "install-local",
                            "gateway-main",
                            "gateway-main:epii:session-main",
                            "07-05-2026",
                            "",
                            "",
                            "",
                            "/repo",
                            "/vault",
                            "loader-main",
                            "idle",
                            "[]",
                            "/vault/Empty/Present/07-05-2026/session-main/now.md",
                            "[[NOW session-main]]",
                            "/vault/Pratibimba/Self/Action/History/2026/05/W19/07",
                            "s3:gateway:temporal:session:session-main:now:md",
                            "s3:gateway:temporal:day:07-05-2026:context",
                            "day:07-05-2026:session:session-main",
                            "pratibimba-abcd1234",
                            "kairos-07-05-2026-session-main",
                            r#"{"privacy":"safe-public-current-kernel-tick","tick":{"element":"SlashFlip"}}"#,
                            1778179200
                        ]]
                    }]
                }]
            }
        }
    });

    let rows = SpacetimeProjectionRows::from_subscription_message(&update).unwrap();
    let session = rows.session.unwrap();
    assert_eq!(session["session_key"], "agent:main:main");
    assert_eq!(
        session["kernel_projection_json"],
        r#"{"privacy":"safe-public-current-kernel-tick","tick":{"element":"SlashFlip"}}"#
    );
}

#[test]
fn typed_delta_decodes_initial_subscription_with_kairos_insert_and_routes_by_table_identity() {
    let message = json!({
        "InitialSubscription": {
            "database_update": {
                "tables": [
                    {
                        "table_name": "kairos_surface",
                        "updates": [{
                            "inserts": [{"kairos_snapshot_id": "kairos-test-1", "available": true}]
                        }]
                    },
                    {
                        "table_name": "session_surface",
                        "updates": [{
                            "inserts": [{"session_key": "agent:main:main", "day_id": "07-05-2026"}]
                        }]
                    }
                ]
            }
        }
    });
    let delta = SpacetimeProjectionDelta::from_subscription_message(&message).unwrap();
    assert_eq!(
        delta.message_kind,
        SpacetimeMessageKind::InitialSubscription
    );
    assert_eq!(delta.inserts.len(), 2);
    assert!(delta.deletes.is_empty());

    // KairosSurface insert is routable by surface identity.
    let kairos = delta
        .first_kairos_insert()
        .expect("KairosSurface insert must be tagged by surface");
    assert_eq!(kairos["kairos_snapshot_id"], "kairos-test-1");
    assert_eq!(kairos["available"], true);

    // SessionSurface insert is also typed correctly.
    let has_session = delta.inserts.iter().any(|delta| {
        matches!(
            delta,
            SpacetimeTableDelta::SessionSurface { row } if row["session_key"] == "agent:main:main"
        )
    });
    assert!(has_session, "SessionSurface insert must be typed");
}

#[test]
fn typed_delta_handles_transaction_update_with_inserts_and_deletes() {
    let message = json!({
        "TransactionUpdate": {
            "status": {
                "Committed": {
                    "tables": [{
                        "table_name": "world_clock",
                        "updates": [{
                            "inserts": [{"world_clock_id": "clock-1", "tick": 42}],
                            "deletes": [{"world_clock_id": "clock-0", "tick": 41}]
                        }]
                    }]
                }
            }
        }
    });
    let delta = SpacetimeProjectionDelta::from_subscription_message(&message).unwrap();
    assert_eq!(delta.message_kind, SpacetimeMessageKind::TransactionUpdate);
    assert_eq!(delta.inserts.len(), 1);
    assert_eq!(delta.deletes.len(), 1);
    assert!(matches!(
        delta.inserts[0],
        SpacetimeTableDelta::WorldClock { .. }
    ));
    assert!(matches!(
        delta.deletes[0],
        SpacetimeTableDelta::WorldClock { .. }
    ));
}

#[test]
fn typed_delta_classifies_subscribe_multi_applied_and_transaction_update_light() {
    let multi = json!({
        "SubscribeMultiApplied": {
            "update": {"tables": []}
        }
    });
    let delta = SpacetimeProjectionDelta::from_subscription_message(&multi).unwrap();
    assert_eq!(
        delta.message_kind,
        SpacetimeMessageKind::SubscribeMultiApplied
    );

    let light = json!({
        "TransactionUpdateLight": {
            "update": {"tables": []}
        }
    });
    let delta = SpacetimeProjectionDelta::from_subscription_message(&light).unwrap();
    assert_eq!(
        delta.message_kind,
        SpacetimeMessageKind::TransactionUpdateLight
    );
}

#[test]
fn typed_delta_treats_unknown_message_kinds_as_unknown_with_empty_delta() {
    let identity_token = json!({"IdentityToken": {"identity": "abc"}});
    let delta = SpacetimeProjectionDelta::from_subscription_message(&identity_token).unwrap();
    assert_eq!(delta.message_kind, SpacetimeMessageKind::Unknown);
    assert!(delta.inserts.is_empty() && delta.deletes.is_empty());
}

#[test]
fn kernel_bridge_stream_event_round_trips_through_serde_for_every_variant() {
    let events = vec![
        KernelBridgeStreamEvent::ConnectionStatus(KernelBridgeConnectionStatus {
            gateway_id: "gateway-main".to_owned(),
            state: KernelBridgeConnectionState::Connected,
            protocol_version: 3,
            clock_protocol_version: SPACETIME_CLOCK_PROTOCOL_VERSION.to_owned(),
            graphiti_runtime_status: GraphitiRuntimeStatus::Available,
            at_ms: 1_000,
        }),
        KernelBridgeStreamEvent::SubscriptionStatus(KernelBridgeSubscriptionStatus {
            subscription_id: "sub-1".to_owned(),
            method: SPACETIME_SUBSCRIBE_METHOD.to_owned(),
            session_key: "agent:main:main".to_owned(),
            phase: "applied".to_owned(),
            source: "websocket-multiplex".to_owned(),
            privacy_class: "session-local".to_owned(),
            graphiti_runtime_status: GraphitiRuntimeStatus::Available,
            at_ms: 1_001,
        }),
        KernelBridgeStreamEvent::Delta(KernelBridgeDelta {
            subscription_id: "sub-1".to_owned(),
            session_key: "agent:main:main".to_owned(),
            message_kind: SpacetimeMessageKind::SubscribeMultiApplied,
            inserts: vec![KernelBridgeCachedSurface {
                surface: "kairos_surface".to_owned(),
                privacy_class: KernelBridgePrivacyClass::PublicSafe,
                row: json!({"kairos_snapshot_id": "k1"}),
                updated_at_ms: 1_010,
            }],
            deletes: vec![],
        }),
        KernelBridgeStreamEvent::Resync(KernelBridgeResync {
            subscription_id: "sub-1".to_owned(),
            session_key: "agent:main:main".to_owned(),
            stale_profile_generation: Some(7),
            recovered_profile_generation: 8,
            recovered_surfaces: vec![],
        }),
        KernelBridgeStreamEvent::ProtocolMismatch(KernelBridgeProtocolMismatch {
            local_projection_schema_version: SPACETIME_PROJECTION_SCHEMA_VERSION.to_owned(),
            remote_projection_schema_version: "ancient".to_owned(),
            local_reducer_abi_version: SPACETIME_REDUCER_ABI_VERSION.to_owned(),
            remote_reducer_abi_version: "ancient".to_owned(),
            local_clock_protocol_version: SPACETIME_CLOCK_PROTOCOL_VERSION.to_owned(),
            remote_clock_protocol_version: "ancient".to_owned(),
            at_ms: 1_020,
        }),
    ];
    for event in events {
        let json = serde_json::to_value(&event).expect("event must serialise");
        // External tag is the `kind` field for the kebab-case discriminator.
        assert!(
            json.get("kind").and_then(Value::as_str).is_some(),
            "every kernel-bridge event must carry a `kind` discriminator: {json}"
        );
        let decoded: KernelBridgeStreamEvent =
            serde_json::from_value(json).expect("event must deserialise");
        assert_eq!(event, decoded);
    }
}

#[test]
fn privacy_filter_strips_quintessence_hash_from_pratibimba_presence() {
    // Live native-WS row arrives as a positional array.
    let delta = SpacetimeTableDelta::PratibimbaPresence {
        row: json!([
            "handle-fingerprint",
            "install-xyz",
            "gateway-xyz",
            "agent:user:main",
            "07-05-2026",
            "quint-fingerprint",
            42_u32,
            "public-safe-fingerprint-only",
            true,
            1_780_000_000_u64,
        ]),
    };
    let cached = privacy_filter_table_delta(&delta);
    assert_eq!(cached.surface, "pratibimba_presence");
    assert_eq!(
        cached.privacy_class,
        KernelBridgePrivacyClass::ProtectedReferenceOnly
    );
    let row = cached.row;
    assert_eq!(row["identity_handle"], "handle-fingerprint");
    assert_eq!(row["day_id"], "07-05-2026");
    assert_eq!(row["aspect_grid_cell"], 42);
    assert_eq!(row["present"], true);
    // Correlation handles MUST be stripped at the boundary.
    assert!(
        row.get("session_key").is_none(),
        "session_key must not cross to frontend: {row}"
    );
    assert!(
        row.get("installation_id").is_none(),
        "installation_id must not cross to frontend: {row}"
    );
    assert!(
        row.get("gateway_id").is_none(),
        "gateway_id must not cross to frontend: {row}"
    );
    // quintessence_hash is a derived fingerprint but still identity-shaped —
    // keep it gateway-side per the deliverable privacy invariant.
    assert!(
        row.get("quintessence_hash").is_none(),
        "quintessence_hash must not cross to frontend: {row}"
    );
}

#[test]
fn privacy_filter_strips_payload_json_and_correlation_from_shared_archetype_event() {
    let delta = SpacetimeTableDelta::SharedArchetypeEvent {
        row: json!([
            123_u64,
            "install-secret",
            "gateway-secret",
            "publisher-handle",
            "07-05-2026",
            42_u32,
            "shared.dream.symbol",
            r#"{"raw_publisher_content":"hidden"}"#,
            "public-opt-in-archetype",
            1_780_000_001_u64,
        ]),
    };
    let cached = privacy_filter_table_delta(&delta);
    assert_eq!(cached.privacy_class, KernelBridgePrivacyClass::OptInShared);
    let row = cached.row;
    assert_eq!(row["event_kind"], "shared.dream.symbol");
    assert_eq!(row["publisher_identity_handle"], "publisher-handle");
    assert_eq!(row["day_id"], "07-05-2026");
    // payload_json carries publisher-supplied content — strip at boundary.
    assert!(
        row.get("payload_json").is_none(),
        "payload_json must not cross: {row}"
    );
    assert!(
        row.get("installation_id").is_none(),
        "installation_id must not cross: {row}"
    );
    assert!(
        row.get("gateway_id").is_none(),
        "gateway_id must not cross: {row}"
    );
}

#[test]
fn privacy_filter_passes_public_safe_surfaces_through_unmodified() {
    let delta = SpacetimeTableDelta::WorldClock {
        row: json!([
            "gateway-main",
            100_u64,
            1_780_000_000_000_u64,
            3_u8,
            "regular",
            "kerykeion-hash",
            SPACETIME_CLOCK_PROTOCOL_VERSION,
            "kerykeion-gateway-fed-v1",
            1_780_000_000_u64,
        ]),
    };
    let cached = privacy_filter_table_delta(&delta);
    assert_eq!(cached.surface, "world_clock");
    assert_eq!(cached.privacy_class, KernelBridgePrivacyClass::PublicSafe);
    let row = cached.row;
    assert_eq!(row["tick"], 100);
    assert_eq!(row["gateway_id"], "gateway-main");
    assert_eq!(row["clock_kind"], "regular");
}

#[test]
fn detect_protocol_mismatch_returns_none_when_versions_align() {
    let result = detect_protocol_mismatch(
        SPACETIME_PROJECTION_SCHEMA_VERSION,
        SPACETIME_REDUCER_ABI_VERSION,
        SPACETIME_CLOCK_PROTOCOL_VERSION,
        42,
    );
    assert!(result.is_none(), "aligned versions must not flag mismatch");
}

#[test]
fn detect_protocol_mismatch_flags_any_version_drift() {
    let mismatch = detect_protocol_mismatch(
        "different-projection-schema",
        SPACETIME_REDUCER_ABI_VERSION,
        SPACETIME_CLOCK_PROTOCOL_VERSION,
        777,
    )
    .expect("drift on projection schema must flag");
    assert_eq!(
        mismatch.local_projection_schema_version,
        SPACETIME_PROJECTION_SCHEMA_VERSION
    );
    assert_eq!(
        mismatch.remote_projection_schema_version,
        "different-projection-schema"
    );
    assert_eq!(mismatch.at_ms, 777);
}

#[test]
fn kernel_bridge_api_request_serialises_with_method_discriminator() {
    let request = KernelBridgeApiRequest::SubscribeWorldClock {
        gateway_id: "gateway-main".to_owned(),
    };
    let json = serde_json::to_value(&request).unwrap();
    assert_eq!(json["method"], "subscribe-world-clock");
    assert_eq!(json["params"]["gatewayId"], "gateway-main");

    let request = KernelBridgeApiRequest::SubscribeSharedArchetypeEvent {
        day_id: "07-05-2026".to_owned(),
        aspect_grid_cell_filter: Some(42),
    };
    let json = serde_json::to_value(&request).unwrap();
    assert_eq!(json["method"], "subscribe-shared-archetype-event");
    assert_eq!(json["params"]["dayId"], "07-05-2026");
    assert_eq!(json["params"]["aspectGridCellFilter"], 42);

    let request = KernelBridgeApiRequest::ObserveConnectionState;
    let json = serde_json::to_value(&request).unwrap();
    assert_eq!(json["method"], "observe-connection-state");
}

#[test]
fn graphiti_runtime_status_round_trips_through_kernel_bridge_envelopes() {
    // ConnectionStatus must carry graphiti_runtime_status.
    let connection = KernelBridgeConnectionStatus {
        gateway_id: "gateway-main".to_owned(),
        state: KernelBridgeConnectionState::Connected,
        protocol_version: 3,
        clock_protocol_version: SPACETIME_CLOCK_PROTOCOL_VERSION.to_owned(),
        graphiti_runtime_status: GraphitiRuntimeStatus::Available,
        at_ms: 1_000,
    };
    let json = serde_json::to_value(&connection).unwrap();
    assert_eq!(json["graphitiRuntimeStatus"], "available");

    // SubscriptionStatus likewise.
    let subscription = KernelBridgeSubscriptionStatus {
        subscription_id: "sub-1".to_owned(),
        method: SPACETIME_SUBSCRIBE_METHOD.to_owned(),
        session_key: "agent:main:main".to_owned(),
        phase: "applied".to_owned(),
        source: "websocket-multiplex".to_owned(),
        privacy_class: "session-local".to_owned(),
        graphiti_runtime_status: GraphitiRuntimeStatus::Unavailable,
        at_ms: 1_001,
    };
    let json = serde_json::to_value(&subscription).unwrap();
    assert_eq!(json["graphitiRuntimeStatus"], "unavailable");

    // All three variants of GraphitiRuntimeStatus must serialise to
    // the kebab-case discriminator the TypeScript side switches on.
    for (status, expected) in [
        (GraphitiRuntimeStatus::Available, "available"),
        (GraphitiRuntimeStatus::Degraded, "degraded"),
        (GraphitiRuntimeStatus::Unavailable, "unavailable"),
    ] {
        let json = serde_json::to_value(&status).unwrap();
        assert_eq!(json, expected);
    }
}

#[test]
fn graphiti_invocation_envelope_carries_required_axes_in_camel_case() {
    let envelope = GraphitiInvocationEnvelope {
        session_key: "agent:main:main".to_owned(),
        day_id: "07-05-2026".to_owned(),
        now_path: "/vault/Empty/Present/07-05-2026/session-main/now.md".to_owned(),
        namespace_ref: "pratibimba-local".to_owned(),
        session_arc_id: "day:07-05-2026:session:session-main".to_owned(),
        privacy_class: GraphitiPrivacyClass::ProtectedEpisodic,
        agent_id: "epii".to_owned(),
    };
    let json = serde_json::to_value(&envelope).unwrap();
    assert_eq!(json["sessionKey"], "agent:main:main");
    assert_eq!(json["dayId"], "07-05-2026");
    assert_eq!(
        json["nowPath"],
        "/vault/Empty/Present/07-05-2026/session-main/now.md"
    );
    assert_eq!(json["namespaceRef"], "pratibimba-local");
    assert_eq!(json["sessionArcId"], "day:07-05-2026:session:session-main");
    assert_eq!(json["privacyClass"], "protected-episodic");
    assert_eq!(json["agentId"], "epii");

    let public = GraphitiInvocationEnvelope {
        privacy_class: GraphitiPrivacyClass::PublicProvenance,
        ..envelope
    };
    let json = serde_json::to_value(&public).unwrap();
    assert_eq!(json["privacyClass"], "public-provenance");
}

#[test]
fn assert_no_graphiti_body_in_row_accepts_safe_reference_only_rows() {
    // A SessionSurface-shaped row: only the references cross.
    let safe_row = json!({
        "session_key": "agent:main:main",
        "day_id": "07-05-2026",
        "graphiti_namespace_ref": "pratibimba-local",
        "graphiti_arc_id": "day:07-05-2026:session:session-main",
    });
    assert!(assert_no_graphiti_body_in_row(&safe_row).is_ok());

    // A GlobalTemporalSurface-shaped row likewise.
    let safe_global = json!({
        "surface_key": "global",
        "day_id": "07-05-2026",
        "graphiti_namespace_ref": "pratibimba-local",
        "graphiti_session_arc_id": "day:07-05-2026:session:session-main",
    });
    assert!(assert_no_graphiti_body_in_row(&safe_global).is_ok());
}

#[test]
fn assert_no_graphiti_body_in_row_refuses_every_episode_body_field() {
    for forbidden in [
        "episode_id",
        "episode",
        "episode_body",
        "memory_body",
        "protected_payload",
        "journal_text",
        "dream_body",
        "raw_episode",
    ] {
        let row = json!({
            "session_key": "agent:main:main",
            forbidden: "should-not-be-here",
        });
        let result = assert_no_graphiti_body_in_row(&row);
        assert!(
            result.is_err(),
            "row containing `{forbidden}` must be refused"
        );
        let err = result.unwrap_err();
        assert!(
            err.contains(forbidden),
            "error must name the offending field `{forbidden}`: {err}"
        );
    }
}

#[test]
fn classify_vault_path_marks_nara_protected_under_any_day() {
    // Canonical layout: Idea/Pratibimba/Nara/<day>/protected/...
    let protected = [
        "Idea/Pratibimba/Nara/07-05-2026/protected/journal.md",
        "Idea/Pratibimba/Nara/01-01-2026/protected/dream/2026-01-01.md",
        "Pratibimba/Nara/07-05-2026/protected/birth-data.md",
        // Windows-style separator must normalise.
        "Idea\\Pratibimba\\Nara\\07-05-2026\\protected\\journal.md",
        // Leading slash form.
        "/Idea/Pratibimba/Nara/07-05-2026/protected/journal.md",
    ];
    for path in protected {
        assert_eq!(
            classify_vault_path_privacy(path),
            S1VaultPathPrivacyClass::Protected,
            "path {path} must be classified Protected"
        );
    }
}

#[test]
fn classify_vault_path_treats_non_protected_nara_paths_as_public() {
    let public = [
        // Public-safe Nara surfaces (not under /protected/).
        "Idea/Pratibimba/Nara/07-05-2026/now.md",
        "Idea/Pratibimba/Nara/07-05-2026/oracle/draw.md",
        // Other vault content.
        "Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md",
        "Idea/Empty/Present/07-05-2026/session-1/now.md",
        // Edge: a path that *contains* protected as a substring but
        // not as a positional Nara/<day>/protected segment.
        "Idea/Other/protected-but-not-nara.md",
    ];
    for path in public {
        assert_eq!(
            classify_vault_path_privacy(path),
            S1VaultPathPrivacyClass::Public,
            "path {path} must be classified Public"
        );
    }
}

#[test]
fn s1_vault_rename_receipt_round_trips_through_serde() {
    let receipt = S1VaultRenameReceipt {
        from_path: "Idea/A.md".to_owned(),
        to_path: "Idea/B.md".to_owned(),
        reconciled_documents: vec!["Idea/Index.md".to_owned(), "Idea/Other.md".to_owned()],
        reconciled_link_count: 5,
        refusals: vec![S1VaultRenameRefusal {
            source_path: "Idea/Refused.md".to_owned(),
            reason: S1VaultRenameRefusalReason::CoordinateResidencyMismatch,
            detail: "coordinate `S1.0` does not match destination residency `S2.0`".to_owned(),
        }],
    };
    let json = serde_json::to_value(&receipt).unwrap();
    assert_eq!(json["fromPath"], "Idea/A.md");
    assert_eq!(json["reconciledLinkCount"], 5);
    assert_eq!(
        json["refusals"][0]["reason"],
        "coordinate-residency-mismatch"
    );
    let decoded: S1VaultRenameReceipt = serde_json::from_value(json).unwrap();
    assert_eq!(decoded, receipt);
}

#[test]
fn s1_semantic_response_carries_typed_candidates_with_staleness_and_privacy() {
    let response = S1SemanticResponse {
        seed_sources: vec!["Idea/Seed.md".to_owned()],
        candidates: vec![
            S1SemanticCandidate {
                target_path: "Idea/A.md".to_owned(),
                wikilink_title: "A".to_owned(),
                score: 0.92,
                kind: S1SemanticCandidateKind::SemanticBlock,
                evidence_source_path: "Idea/A.md".to_owned(),
                evidence_lines: Some((12, 18)),
                stale: false,
                privacy_class: S1VaultPathPrivacyClass::Public,
            },
            S1SemanticCandidate {
                target_path: "Idea/Pratibimba/Nara/07-05-2026/protected/dream.md".to_owned(),
                wikilink_title: "Dream".to_owned(),
                score: 0.85,
                kind: S1SemanticCandidateKind::SemanticSource,
                evidence_source_path: "Idea/Pratibimba/Nara/07-05-2026/protected/dream.md"
                    .to_owned(),
                evidence_lines: None,
                stale: true,
                privacy_class: S1VaultPathPrivacyClass::Protected,
            },
        ],
        warnings: vec![],
        staleness: S1SemanticStaleness::Stale,
        smart_env_index_path: Some(".smart-env/multi/index.ajson".to_owned()),
    };
    let json = serde_json::to_value(&response).unwrap();
    assert_eq!(json["candidates"][0]["kind"], "semantic-block");
    assert_eq!(json["candidates"][0]["privacyClass"], "public");
    assert_eq!(json["candidates"][1]["privacyClass"], "protected");
    assert_eq!(json["candidates"][1]["stale"], true);
    assert_eq!(json["staleness"], "stale");
    let decoded: S1SemanticResponse = serde_json::from_value(json).unwrap();
    assert_eq!(decoded, response);
}

#[test]
fn s1_c_first_type_lifecycle_receipts_round_trip_and_methods_are_registered() {
    for method in [
        S1_TYPE_CLASSIFY_C_LAYER_METHOD,
        S1_ENTITY_PROMOTE_TO_TYPE_METHOD,
        S1_WORLD_GRADUATE_METHOD,
    ] {
        assert!(METHOD_NAMES.contains(&method));
        assert!(method_dispatch_plan_entry(method).is_some());
    }

    let classify = S1CFirstTypologyReceipt {
        source_path: "Idea/Bimba/World/Types/Coordinates/C/C4/Types-Contexts-MOCs.md".to_owned(),
        type_family: "C".to_owned(),
        type_path: "Idea/Bimba/World/Types/Coordinates/C/C4/Types-Contexts-MOCs".to_owned(),
        type_coordinate: "C4".to_owned(),
        semantic_authority: "authoritative".to_owned(),
        crystallisation_state: "incubating_type_index".to_owned(),
        c_layer_path: "Idea/Bimba/World/Types/Coordinates/C/C4".to_owned(),
        evidence_kind: "c4_type_moc_authority".to_owned(),
    };
    let entity = S1EntityPromoteToTypeReceipt {
        entity_path: "Idea/Empty/Present/02-06-2026/entities/Anima.md".to_owned(),
        type_coordinate: "C2".to_owned(),
        aliases: vec!["Dispatch Function".to_owned()],
        candidate_state: "candidate".to_owned(),
        accepted_wikilinks: vec!["Anima".to_owned(), "S4".to_owned()],
        target_type_path: "Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Anima"
            .to_owned(),
        graph_promotion_ready: true,
    };
    let graduate = S1WorldGraduateReceipt {
        source_c_authority_path:
            "Idea/Bimba/World/Types/Coordinates/C/C5/Crystallisations-Pratibimba/NOW.md".to_owned(),
        flat_world_target: "Idea/Bimba/World/NOW.md".to_owned(),
        type_coordinate: "C5".to_owned(),
        crystallisation_state: "crystallised_world_form".to_owned(),
        graph_promotion_ready: true,
    };

    assert_eq!(
        serde_json::from_value::<S1CFirstTypologyReceipt>(serde_json::to_value(&classify).unwrap())
            .unwrap(),
        classify
    );
    assert_eq!(
        serde_json::from_value::<S1EntityPromoteToTypeReceipt>(
            serde_json::to_value(&entity).unwrap()
        )
        .unwrap(),
        entity
    );
    assert_eq!(
        serde_json::from_value::<S1WorldGraduateReceipt>(serde_json::to_value(&graduate).unwrap())
            .unwrap(),
        graduate
    );
}

#[test]
fn cct_14_entity_lifecycle_methods_are_registered_with_dispatch_entries() {
    assert_eq!(S1_ENTITY_LIFECYCLE_METHODS.len(), 6);
    for method in S1_ENTITY_LIFECYCLE_METHODS {
        assert!(
            METHOD_NAMES.contains(method),
            "{method} missing from METHOD_NAMES"
        );
        let entry = method_dispatch_plan_entry(method)
            .unwrap_or_else(|| panic!("{method} missing dispatch-plan entry"));
        assert_eq!(entry.kind, MethodDispatchKind::S1HenAdapter);
    }
}

#[test]
fn accepted_q_articulation_amendment_is_registered_with_hen_dispatch() {
    assert_eq!(
        S1_Q_ARTICULATION_METHODS,
        &[S1_Q_ARTICULATION_ACCEPT_METHOD]
    );
    assert!(METHOD_NAMES.contains(&S1_Q_ARTICULATION_ACCEPT_METHOD));
    let entry = method_dispatch_plan_entry(S1_Q_ARTICULATION_ACCEPT_METHOD)
        .expect("Q articulation acceptance needs an S1 Hen dispatch entry");
    assert_eq!(entry.kind, MethodDispatchKind::S1HenAdapter);
}

#[test]
fn base_ensure_is_registered_with_hen_dispatch() {
    let method = S1_BASE_ENSURE_METHOD;
    assert_eq!(S1_BASE_METHODS, &[S1_BASE_ENSURE_METHOD]);
    assert!(METHOD_NAMES.contains(&method));
    let entry =
        method_dispatch_plan_entry(method).expect("base ensure needs an S1 Hen dispatch entry");
    assert_eq!(entry.kind, MethodDispatchKind::S1HenAdapter);
}

#[test]
fn cct_14_capture_classify_and_list_payloads_round_trip() {
    let capture_request = S1EntityCaptureRequest {
        source: "Loose Root Note".to_owned(),
        day_id: "10-07-2026".to_owned(),
        creator_identity: Some("hen".to_owned()),
    };
    let capture_receipt = S1EntityCaptureReceipt {
        candidate_path: "Idea/Empty/Present/10-07-2026/entities/Loose Root Note.md".to_owned(),
        title: "Loose Root Note".to_owned(),
        candidate_state: "candidate".to_owned(),
        birth_codon: 42,
        birth_codon_state: "provisional".to_owned(),
    };
    let classify_request = S1EntityClassifyRequest {
        candidate_path: capture_receipt.candidate_path.clone(),
        c_layer: Some("C2".to_owned()),
    };
    let classify_receipt = S1EntityClassifyReceipt {
        candidate_path: capture_receipt.candidate_path.clone(),
        type_coordinate: "C2".to_owned(),
        birth_codon: 42,
        birth_codon_state: "provisional".to_owned(),
    };
    let list_receipt = S1EntityListReceipt {
        entries: vec![S1EntityListEntry {
            path: capture_receipt.candidate_path.clone(),
            title: "Loose Root Note".to_owned(),
            state: "candidate".to_owned(),
            type_coordinate: Some("C2".to_owned()),
            birth_codon: Some(42),
            birth_codon_state: Some("provisional".to_owned()),
        }],
    };

    let json = serde_json::to_value(&capture_receipt).unwrap();
    assert_eq!(json["birthCodon"], 42);
    assert_eq!(json["birthCodonState"], "provisional");

    assert_eq!(
        serde_json::from_value::<S1EntityCaptureRequest>(
            serde_json::to_value(&capture_request).unwrap()
        )
        .unwrap(),
        capture_request
    );
    assert_eq!(
        serde_json::from_value::<S1EntityCaptureReceipt>(json).unwrap(),
        capture_receipt
    );
    assert_eq!(
        serde_json::from_value::<S1EntityClassifyRequest>(
            serde_json::to_value(&classify_request).unwrap()
        )
        .unwrap(),
        classify_request
    );
    assert_eq!(
        serde_json::from_value::<S1EntityClassifyReceipt>(
            serde_json::to_value(&classify_receipt).unwrap()
        )
        .unwrap(),
        classify_receipt
    );
    assert_eq!(
        serde_json::from_value::<S1EntityListReceipt>(serde_json::to_value(&list_receipt).unwrap())
            .unwrap(),
        list_receipt
    );
}

#[test]
fn scan_for_forbidden_privacy_fields_catches_every_canonical_invariant() {
    for field in PRIVACY_FORBIDDEN_FIELD_NAMES {
        let payload = format!(r#"{{"safe":"ok","{field}":"should-not-be-here"}}"#);
        let hits = scan_for_forbidden_privacy_fields(&payload);
        assert!(
            hits.contains(field),
            "field {field} must be detected in {payload}"
        );
    }
}

#[test]
fn scan_for_forbidden_privacy_fields_does_not_false_positive_on_substring_matches() {
    // `episode_id` is forbidden as a top-level key; a different key
    // ending in `_episode_id` must NOT trip the scan.
    let safe = r#"{"safe":"ok","other_episode_id_field":"reference-handle"}"#;
    let hits = scan_for_forbidden_privacy_fields(safe);
    assert!(
        hits.is_empty(),
        "substring match must not false-positive; hits={hits:?}"
    );
}

#[test]
fn scan_for_forbidden_privacy_fields_accepts_safe_reference_only_payloads() {
    let safe = r#"{
            "session_key": "agent:main:main",
            "day_id": "07-05-2026",
            "graphiti_namespace_ref": "pratibimba-local",
            "graphiti_arc_id": "day:07-05-2026:session:session-main",
            "identity_handle": "blake3-fingerprint-hex",
            "quintessence_hash": "blake3-quaternionic-hex"
        }"#;
    let hits = scan_for_forbidden_privacy_fields(safe);
    assert!(
        hits.is_empty(),
        "safe row with only references and fingerprints must pass; hits={hits:?}"
    );
}

#[test]
fn production_fallback_policy_defaults_to_development_only_without_opt_in() {
    // Clear the env first so the default is observed.
    std::env::remove_var("EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK");
    assert_eq!(
        detect_production_fallback_policy(),
        ProductionFallbackPolicy::DevelopmentOnly
    );
    std::env::set_var("EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK", "1");
    assert_eq!(
        detect_production_fallback_policy(),
        ProductionFallbackPolicy::OperatorOptIn
    );
    std::env::set_var("EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK", "TRUE");
    assert_eq!(
        detect_production_fallback_policy(),
        ProductionFallbackPolicy::OperatorOptIn
    );
    std::env::set_var("EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK", "no");
    assert_eq!(
        detect_production_fallback_policy(),
        ProductionFallbackPolicy::DevelopmentOnly
    );
    std::env::remove_var("EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK");
}

#[test]
fn track03_release_gate_open_requires_every_criterion_true() {
    let mut report = Track03ReleaseGateReport {
        multi_subscriber_clock_within_tolerance: true,
        bind_kairos_p95_under_100ms: true,
        reconnect_recovers_latest_state: true,
        privacy_audit_no_forbidden_fields: true,
        production_fallback_policy: ProductionFallbackPolicy::DevelopmentOnly,
        graphiti_runtime_status: GraphitiRuntimeStatus::Available,
        projection_schema_version: SPACETIME_PROJECTION_SCHEMA_VERSION.to_owned(),
        reducer_abi_version: SPACETIME_REDUCER_ABI_VERSION.to_owned(),
        clock_protocol_version: SPACETIME_CLOCK_PROTOCOL_VERSION.to_owned(),
    };
    assert!(report.is_open(), "all gates true => open");
    // Each individual criterion gates the open state.
    for flip in [
        |r: &mut Track03ReleaseGateReport| {
            r.multi_subscriber_clock_within_tolerance = false;
        },
        |r: &mut Track03ReleaseGateReport| {
            r.bind_kairos_p95_under_100ms = false;
        },
        |r: &mut Track03ReleaseGateReport| {
            r.reconnect_recovers_latest_state = false;
        },
        |r: &mut Track03ReleaseGateReport| {
            r.privacy_audit_no_forbidden_fields = false;
        },
    ] {
        let mut clone = report.clone();
        flip(&mut clone);
        assert!(
            !clone.is_open(),
            "flipping a single criterion to false must close the gate"
        );
    }
    // Production fallback policy and graphiti status do NOT directly
    // gate the release — they are operator-facing context, not pass/fail
    // criteria. Verify that change.
    report.production_fallback_policy = ProductionFallbackPolicy::OperatorOptIn;
    assert!(
        report.is_open(),
        "production fallback policy is operator context, not a gate"
    );
}

#[test]
fn typed_delta_preserves_unknown_table_identity_via_other_variant() {
    let message = json!({
        "SubscribeMultiApplied": {
            "update": {
                "tables": [{
                    "table_name": "future_table_not_yet_modelled",
                    "updates": [{"inserts": [{"id": 1}]}]
                }]
            }
        }
    });
    let delta = SpacetimeProjectionDelta::from_subscription_message(&message).unwrap();
    assert_eq!(delta.inserts.len(), 1);
    match &delta.inserts[0] {
        SpacetimeTableDelta::Other { table_name, row } => {
            assert_eq!(table_name, "future_table_not_yet_modelled");
            assert_eq!(row["id"], 1);
        }
        other => panic!("expected Other variant, got {other:?}"),
    }
}

// ====== 13.T2 dispatch-plan contract tests ======

#[test]
fn every_method_in_metadata_has_a_dispatch_plan_entry() {
    let missing: Vec<&str> = METHOD_NAMES
        .iter()
        .copied()
        .filter(|method| method_dispatch_plan_entry(method).is_none())
        .collect();
    assert!(
        missing.is_empty(),
        "METHOD_NAMES entries without a dispatch-plan row: {missing:?}"
    );
}

#[test]
fn dispatch_plan_does_not_carry_methods_outside_metadata() {
    let stray: Vec<&str> = METHOD_DISPATCH_PLAN
        .iter()
        .map(|entry| entry.method)
        .filter(|method| !METHOD_NAMES.contains(method))
        .collect();
    assert!(
        stray.is_empty(),
        "dispatch-plan rows reference methods absent from METHOD_NAMES: {stray:?}"
    );
}

#[test]
fn dispatch_plan_has_unique_method_rows() {
    let mut seen = std::collections::HashSet::new();
    for entry in METHOD_DISPATCH_PLAN {
        assert!(
            seen.insert(entry.method),
            "duplicate dispatch-plan row for {}",
            entry.method
        );
    }
}

#[test]
fn dispatch_plan_carries_all_six_canonical_kinds_or_extensions() {
    // The plan body enumerates six kinds: S3 native handler, S2 graph
    // service adapter, S4 orchestration adapter, S5 governance adapter,
    // S0 product adapter, Missing. The plan-extension `S1HenAdapter`
    // is permitted to surface alongside them per the module-level
    // 13.T2 comment.
    let mut s3 = 0;
    let mut s2 = 0;
    let mut s4 = 0;
    let mut s5 = 0;
    let mut s0 = 0;
    let mut s1 = 0;
    let mut missing = 0;
    for entry in METHOD_DISPATCH_PLAN {
        match entry.kind {
            MethodDispatchKind::S3NativeHandler => s3 += 1,
            MethodDispatchKind::S2GraphServiceAdapter => s2 += 1,
            MethodDispatchKind::S4OrchestrationAdapter => s4 += 1,
            MethodDispatchKind::S5GovernanceAdapter => s5 += 1,
            MethodDispatchKind::S0ProductAdapter => s0 += 1,
            MethodDispatchKind::S1HenAdapter => s1 += 1,
            MethodDispatchKind::Missing => missing += 1,
        }
    }
    assert!(s3 > 0, "expected at least one S3 native handler row");
    assert!(s2 > 0, "expected at least one S2 graph adapter row");
    assert!(s4 > 0, "expected at least one S4 orchestration row");
    assert!(s5 > 0, "expected at least one S5 governance row");
    assert!(s0 > 0, "expected at least one S0 product adapter row");
    // S1 Hen adapter is a 13.T2 plan extension: five 03.T6.5
    // vault/semantic methods, the accepted-Q amendment, three C-first type
    // lifecycle receipts, the four CCT-14 entity-candidate lifecycle/review
    // surfaces, plus Track 32's idempotent day scaffold.
    assert_eq!(s1, 15, "expected exactly fifteen s1' Hen rows");
    // Missing is currently 0 because no Missing-status methods appear
    // in METHOD_NAMES (parity.rs Missing records all live outside the
    // shipped manifest). The variant must still be expressible.
    assert_eq!(missing, 0);
}

#[test]
fn dispatch_plan_authority_paths_are_non_empty() {
    for entry in METHOD_DISPATCH_PLAN {
        assert!(
            !entry.authority_path.is_empty(),
            "dispatch plan entry for {} has empty authority_path",
            entry.method
        );
    }
}

#[test]
fn dispatch_plan_missing_entries_carry_extraction_annotation() {
    // If a future entry is added with kind=Missing, it MUST carry the
    // `needs_extraction_to` annotation per the plan's "Missing with a
    // needs_extraction_to annotation" rule (line 91 of 13.T2 plan body).
    for entry in METHOD_DISPATCH_PLAN {
        if matches!(entry.kind, MethodDispatchKind::Missing) {
            assert!(
                entry.needs_extraction_to.is_some(),
                "Missing dispatch entry for {} must carry needs_extraction_to annotation",
                entry.method
            );
        }
    }
}

#[test]
fn s5_prime_gnostic_methods_register_over_production_epi_gnostic() {
    let required = [
        "s5'.gnostic.ingest",
        "s5'.gnostic.query",
        "s5'.gnostic.notebook",
        "s5'.gnostic.status",
        "s5'.gnostic.models",
        // 12.T12.2 ONE-substrate minimum (DR-S5-ONE-1): the six named reads
        // over production epi-gnostic — dispatching, never duplicating.
        "s5'.gnostic.candidates",
        "s5'.gnostic.etymology",
        "s5'.gnostic.list_notebooks",
        "s5'.gnostic.episode_search",
        "s5'.gnostic.evidence_trace",
        "s5'.gnostic.query_with_layers",
        // 12.T12.13: the seam's only WRITE. Every method above reads; this one
        // mints the cross-namespace MAPS_TO_COORDINATE edge, and until it was
        // registered no M' carrier could reach the enricher at all.
        "s5'.gnostic.enrich",
    ];

    for method in required {
        assert!(
            METHOD_NAMES.contains(&method),
            "s5' gnostic method {method} missing from METHOD_NAMES"
        );
        let entry = method_dispatch_plan_entry(method)
            .unwrap_or_else(|| panic!("s5' gnostic method {method} missing dispatch-plan row"));
        assert_eq!(
            entry.kind,
            MethodDispatchKind::S5GovernanceAdapter,
            "s5' gnostic method {method} must route as S5 governance"
        );
        assert!(
            entry.authority_path.contains("Body/S/S5/epi-gnostic"),
            "s5' gnostic method {method} must route over production epi-gnostic, got {}",
            entry.authority_path
        );
        assert_eq!(entry.needs_extraction_to, None);
    }
}
