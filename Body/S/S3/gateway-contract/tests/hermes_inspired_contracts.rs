use epi_s3_gateway_contract::{
    command_method_names, cron_contract, gateway_protocol_contracts, mcp_event_cursor_contract,
    method_names, platform_adapter_contract, portal_event_contracts, portal_event_names,
    subject_coordinate_resolver_contract, GatewayProtocolFamily, S3SubscriptionRegistryFacts,
    SpacetimeFallbackPolicy, SpacetimeProjectionPlan, SPACETIME_FALLBACK_ACTIVE,
    SPACETIME_FALLBACK_DISABLED, SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
    SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN, SPACETIME_SUBSCRIBE_ALIAS_METHOD,
    SPACETIME_SUBSCRIBE_METHOD,
};

#[test]
fn portal_command_and_event_contracts_are_first_class() {
    for method in ["s0.command.exec", "s0.command.completion"] {
        assert!(command_method_names().contains(&method));
        assert!(
            method_names().contains(&method),
            "{method} should be dispatchable through the gateway method list"
        );
    }

    for event in [
        "portal.token",
        "portal.tool_call",
        "portal.lens_pressure",
        "portal.vak_eval",
        "portal.review_deposit",
        "portal.kairos_shift",
    ] {
        assert!(portal_event_names().contains(&event));
        let contract = portal_event_contracts()
            .iter()
            .find(|contract| contract.event_name == event)
            .expect("event contract should exist");
        assert!(!contract.payload_keys.is_empty());
        assert!(!contract.consumer_surfaces.is_empty());
    }
}

#[test]
fn s3_gateway_contract_names_protocol_platform_identity_and_cron_boundaries() {
    let protocols = gateway_protocol_contracts();
    assert!(protocols
        .iter()
        .any(|contract| contract.family == GatewayProtocolFamily::JsonRpc));
    assert!(protocols
        .iter()
        .any(|contract| contract.family == GatewayProtocolFamily::Acp));
    assert!(protocols
        .iter()
        .all(|contract| contract.session_identity_source.contains("DAY/NOW")));

    let platform = platform_adapter_contract();
    assert_eq!(platform.trait_name, "BasePlatformAdapter");
    assert!(platform.methods.contains(&"send_document"));
    assert!(!platform.methods.contains(&"truncate_message"));
    assert!(platform
        .implementation_internal_methods
        .contains(&"truncate_message"));

    let resolver = subject_coordinate_resolver_contract();
    assert_eq!(resolver.coordinate_owner, "S3");
    assert!(resolver.output_keys.contains(&"subjectCoordinate"));
    assert!(resolver.graph_boundary.contains("Pratibimba"));

    let cron = cron_contract();
    assert_eq!(cron.lock_strategy, "file-locked tick");
    assert!(cron
        .delivery_target_syntax
        .contains(&"platform_name:chat_id"));
    assert!(cron
        .output_writes
        .iter()
        .any(|write| write.contains("Graphiti episodic")));
    assert!(cron
        .output_writes
        .iter()
        .any(|write| write.contains("DAY/NOW vault artifact")));
}

#[test]
fn s3_subscription_registry_facts_name_unified_envelope_and_forbid_silent_fallback() {
    // 13.T4: the S3-owned subscription registry MUST name exactly ONE envelope
    // type for both s3'.temporal.subscribe and s3'.spacetime.subscribe, and
    // MUST forbid the silent-HTTP-fallback sentinel by name.
    let facts = S3SubscriptionRegistryFacts::new(
        SpacetimeFallbackPolicy::NativeWebsocket,
        Some("ws://127.0.0.1:3000".to_owned()),
    );
    assert_eq!(facts.coordinate_owner, "S3'");
    assert_eq!(
        facts.envelope_type_name, "SpacetimeSubscriptionLifecycleEnvelope",
        "13.T4 mandates ONE envelope type for both subscribe methods"
    );
    assert_eq!(facts.temporal_method, SPACETIME_SUBSCRIBE_METHOD);
    assert_eq!(facts.spacetime_alias_method, SPACETIME_SUBSCRIBE_ALIAS_METHOD);
    assert_eq!(
        facts.silent_fallback_forbidden_sentinel,
        SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN
    );
    assert_eq!(facts.fallback_policy, SpacetimeFallbackPolicy::NativeWebsocket);
    assert_ne!(
        SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN, SPACETIME_FALLBACK_ACTIVE,
        "silent-HTTP-fallback sentinel must not collide with the legitimate fallback-active mode"
    );
    assert_eq!(
        SpacetimeFallbackPolicy::FallbackActive.as_str(),
        SPACETIME_FALLBACK_ACTIVE
    );
    assert_eq!(
        SpacetimeFallbackPolicy::Disabled.as_str(),
        SPACETIME_FALLBACK_DISABLED
    );
    assert_eq!(
        SpacetimeFallbackPolicy::NativeWebsocket.as_str(),
        SPACETIME_PROJECTION_SOURCE_NATIVE_WS
    );
}

#[test]
fn lifecycle_envelope_for_method_unifies_temporal_and_spacetime_subscribe() {
    // 13.T4: both method names emit envelopes of the same type with method
    // carried through verbatim — single envelope identity, dispatchable to two
    // method names.
    let plan = SpacetimeProjectionPlan::native("ws://127.0.0.1:3000", "epi-logos-runtime")
        .for_session("agent:main:main", "epii");
    let temporal = plan.lifecycle_envelope_for_method(
        SPACETIME_SUBSCRIBE_METHOD,
        "opened",
        serde_json::json!({"phase": "native"}),
    );
    let spacetime = plan.lifecycle_envelope_for_method(
        SPACETIME_SUBSCRIBE_ALIAS_METHOD,
        "opened",
        serde_json::json!({"phase": "native"}),
    );
    assert_eq!(temporal.method, SPACETIME_SUBSCRIBE_METHOD);
    assert_eq!(spacetime.method, SPACETIME_SUBSCRIBE_ALIAS_METHOD);
    assert_eq!(temporal.session_key, spacetime.session_key);
    assert_eq!(temporal.subscription_mode, spacetime.subscription_mode);
    assert_eq!(
        temporal.projection_schema_version,
        spacetime.projection_schema_version
    );
    // Structural identity: same type, same shape — only `method` differs.
    let temporal_json = serde_json::to_value(&temporal).unwrap();
    let spacetime_json = serde_json::to_value(&spacetime).unwrap();
    let temporal_keys: Vec<&str> = temporal_json
        .as_object()
        .unwrap()
        .keys()
        .map(String::as_str)
        .collect();
    let spacetime_keys: Vec<&str> = spacetime_json
        .as_object()
        .unwrap()
        .keys()
        .map(String::as_str)
        .collect();
    assert_eq!(
        temporal_keys, spacetime_keys,
        "both subscribe methods must produce identical envelope key sets"
    );
}

#[test]
fn s5_mcp_event_cursor_contract_is_ordered_over_epii_events() {
    let contract = mcp_event_cursor_contract();
    assert_eq!(contract.coordinate_owner, "S5'");
    assert!(contract.methods.contains(&"events_poll(after_cursor)"));
    assert!(contract
        .methods
        .contains(&"events_wait(after_cursor, timeout)"));
    assert!(contract.event_sources.contains(&"Epii inbox"));
    assert!(contract.event_sources.contains(&"autoresearch"));
    assert!(contract.ordering_key.contains("cursor"));
}
