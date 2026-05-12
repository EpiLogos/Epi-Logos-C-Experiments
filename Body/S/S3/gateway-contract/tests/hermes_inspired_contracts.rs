use epi_s3_gateway_contract::{
    command_method_names, cron_contract, gateway_protocol_contracts, mcp_event_cursor_contract,
    method_names, platform_adapter_contract, portal_event_contracts, portal_event_names,
    subject_coordinate_resolver_contract, GatewayProtocolFamily,
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
