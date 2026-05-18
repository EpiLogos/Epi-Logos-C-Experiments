#[test]
fn spacetime_module_declares_gateway_agent_client_registration_schema() {
    let workspace = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .unwrap()
        .to_path_buf();
    let module_source =
        std::fs::read_to_string(workspace.join("Body/S/S3/epi-spacetime-module/src/lib.rs"))
            .expect("spacetime module source should be readable");

    for expected in [
        "pub struct GatewayInstance",
        "pub struct AgentInstance",
        "pub struct ClientRegistration",
        "pub struct SessionSurface",
        "pub struct KairosSurface",
        "pub struct GlobalTemporalSurface",
        "pub struct TemporalEvent",
        "pub fn register_gateway",
        "pub fn heartbeat_gateway",
        "pub fn register_agent",
        "pub fn register_client",
        "pub fn bind_session_temporal_context",
        "pub fn bind_kairos_surface",
        "pub fn bind_global_temporal_surface",
        "pub fn publish_temporal_event",
        "parent_session_key",
        "source_session_key",
        "source_session_kind",
        "runtime_cwd",
        "vault_root",
        "resource_loader_id",
        "retry_settlement_state",
        "diagnostics_json",
        "kernel_projection_json",
        "global_temporal_surface",
        "redis_global_context_key",
        "graphiti_namespace_ref",
        "safe-live-projection",
    ] {
        assert!(
            module_source.contains(expected),
            "SpaceTimeDB module should declare {expected}"
        );
    }

    assert!(
        !module_source.contains("pub struct UserPresence"),
        "old presence-only schema should not remain the module centre"
    );
    assert!(
        module_source.contains("One SpaceTimeDB deployment can hold any number"),
        "module docs should state the multi-gateway/multi-agent invariant"
    );
}
