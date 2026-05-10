use epi_s3_gateway::dispatch::{classify_method, GatewayDispatchClass, GatewayDispatchOwner};

#[test]
fn s3_gateway_owns_session_temporal_and_runtime_routing_contract() {
    let session = classify_method("sessions.list").expect("sessions.list should be routed");
    assert_eq!(session.owner, GatewayDispatchOwner::S3Gateway);
    assert_eq!(session.class, GatewayDispatchClass::SessionRuntime);
    assert_eq!(session.coordinate_owner, "S3");
    assert_eq!(session.agent_access_owner, "S4/S5");

    let temporal =
        classify_method("s3'.temporal.context").expect("temporal context should be routed");
    assert_eq!(temporal.owner, GatewayDispatchOwner::S3TemporalGateway);
    assert_eq!(temporal.class, GatewayDispatchClass::TemporalContext);
    assert_eq!(temporal.coordinate_owner, "S3'");

    let graphiti =
        classify_method("s5.episodic.deposit").expect("graphiti deposit should be routed");
    assert_eq!(graphiti.owner, GatewayDispatchOwner::S3GraphitiRuntime);
    assert_eq!(graphiti.class, GatewayDispatchClass::GraphitiInvocation);
    assert_eq!(graphiti.coordinate_owner, "S3/S5");
    assert_eq!(graphiti.agent_access_owner, "S5");
}

#[test]
fn all_contract_methods_are_classified_by_s3_gateway_route_table() {
    let missing = epi_s3_gateway_contract::method_names()
        .iter()
        .copied()
        .filter(|method| classify_method(method).is_none())
        .collect::<Vec<_>>();

    assert!(
        missing.is_empty(),
        "gateway methods missing S3 route ownership: {missing:?}"
    );
}

#[test]
fn extension_methods_are_explicitly_classified_without_polluting_contract_names() {
    let nara = classify_method("nara.journal.entry").expect("nara extension methods should route");
    assert_eq!(nara.owner, GatewayDispatchOwner::S4S5DomainAdapter);
    assert_eq!(nara.class, GatewayDispatchClass::NaraExtension);

    let epii = classify_method("s5'.epii.kairos.context").expect("epii extension should route");
    assert_eq!(epii.owner, GatewayDispatchOwner::S5EpiiAgent);
    assert_eq!(epii.class, GatewayDispatchClass::EpiiAgentRuntime);

    assert!(classify_method("totally.unknown").is_none());
}
