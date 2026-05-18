use epi_logos::portal::surfaces::{
    portal_surfaces, readiness_report_from_health_and_agent_status, AgentContractProvider,
    CapabilityMatrixProvider, ExtensionToolsProvider, GatewayParityProvider,
    PluginManifestProvider, PortalReadinessBucket, PortalRegistryProvider, PortalSurfaceKind,
    PortalSurfaceSource, ReadinessProvider, SessionOperationsProvider, SurfaceRegistry,
    TopologyProvider,
};
use serde_json::json;

#[test]
fn portal_surface_registry_collects_gateway_parity_without_forking_method_truth() {
    let registry = SurfaceRegistry::from_providers(vec![
        Box::new(TopologyProvider),
        Box::new(GatewayParityProvider),
    ]);
    let surfaces = registry.surfaces();

    let s4_agent = surfaces
        .iter()
        .find(|surface| surface.id == "gateway.s4.agent.*")
        .expect("S4 agent gateway parity surface should be visible to the portal");
    assert_eq!(s4_agent.coordinate, "S4");
    assert_eq!(s4_agent.kind, PortalSurfaceKind::GatewayMethod);
    assert_eq!(s4_agent.source, PortalSurfaceSource::GatewayParity);
    assert!(s4_agent.proves_agent_access_separately);
    assert!(s4_agent
        .actions
        .iter()
        .any(|action| action.command.iter().any(|part| part == "s4.agent.status")));

    let epii = surfaces
        .iter()
        .find(|surface| surface.id == "gateway.s5'.epii.*")
        .expect("Epii gateway methods should be visible to the portal");
    assert_eq!(epii.coordinate, "S5'");
    assert!(epii.proves_raw_service_health);
    assert!(epii.proves_agent_access_separately);
    assert!(epii
        .metadata
        .iter()
        .any(|item| item.contains("epii-agent-core")));
}

#[test]
fn portal_session_surfaces_are_generated_from_gateway_session_contracts() {
    let registry = SurfaceRegistry::from_providers(vec![Box::new(SessionOperationsProvider)]);
    let surfaces = registry.surfaces();
    let ids: Vec<&str> = surfaces.iter().map(|surface| surface.id.as_str()).collect();

    for expected in [
        "session-op.sessions.list",
        "session-op.sessions.resolve",
        "session-op.sessions.run-state",
        "session-op.sessions.fork",
        "session-op.chat.history",
        "session-op.chat.send",
        "session-op.channels.status",
    ] {
        assert!(
            ids.contains(&expected),
            "session operation provider should expose {expected}; got {ids:?}"
        );
    }

    let history = surfaces
        .iter()
        .find(|surface| surface.id == "session-op.chat.history")
        .expect("chat history should be a first-class portal session surface");
    assert_eq!(history.coordinate, "S3");
    assert_eq!(history.kind, PortalSurfaceKind::GatewayMethod);
    assert_eq!(history.source, PortalSurfaceSource::GatewaySessionContract);
    assert!(history.proves_raw_service_health);
    assert!(history.proves_agent_access_separately);
    assert_eq!(history.command_hint, "chat.history");
    assert!(history.actions.iter().any(|action| action.command
        == [
            "epi".to_string(),
            "gate".to_string(),
            "rpc".to_string(),
            "chat.history".to_string()
        ]));
    assert!(history
        .metadata
        .iter()
        .any(|item| item == "projection: session_surface"));
    assert!(history
        .metadata
        .iter()
        .any(|item| item == "request: sessionKey"));

    let run_state = surfaces
        .iter()
        .find(|surface| surface.id == "session-op.sessions.run-state")
        .expect("run-state should be a first-class portal session surface");
    assert_eq!(run_state.command_hint, "sessions.run-state");
    assert!(run_state
        .metadata
        .iter()
        .any(|item| item == "response: runState"));
}

#[test]
fn portal_surface_registry_separates_readiness_from_agent_access() {
    let registry = SurfaceRegistry::from_providers(vec![Box::new(ReadinessProvider)]);
    let surfaces = registry.surfaces();
    let ids: Vec<&str> = surfaces.iter().map(|surface| surface.id.as_str()).collect();

    for expected in [
        "readiness.s2.neo4j",
        "readiness.s3.spacetimedb-registration",
        "readiness.s3.spacetimedb-subscription",
        "readiness.s4.pi-agent-access",
        "readiness.s5.epii-review-autoresearch",
    ] {
        assert!(
            ids.contains(&expected),
            "readiness provider should expose {expected}; got {ids:?}"
        );
    }

    let neo4j = surfaces
        .iter()
        .find(|surface| surface.id == "readiness.s2.neo4j")
        .unwrap();
    assert_eq!(neo4j.kind, PortalSurfaceKind::ReadinessCheck);
    assert_eq!(neo4j.source, PortalSurfaceSource::ReadinessManifest);
    assert!(neo4j.proves_raw_service_health);
    assert!(!neo4j.proves_agent_access_separately);

    let agent = surfaces
        .iter()
        .find(|surface| surface.id == "readiness.s4.pi-agent-access")
        .unwrap();
    assert_eq!(agent.coordinate, "S4");
    assert!(!agent.proves_raw_service_health);
    assert!(agent.proves_agent_access_separately);

    let subscription = surfaces
        .iter()
        .find(|surface| surface.id == "readiness.s3.spacetimedb-subscription")
        .unwrap();
    assert_eq!(subscription.coordinate, "S3'");
    assert!(!subscription.proves_raw_service_health);
    assert!(subscription.proves_agent_access_separately);
    assert_eq!(subscription.command_hint, "epi gate rpc health.snapshot");
}

#[test]
fn portal_config_surface_exposes_channel_and_secret_provider_fields() {
    let registry = SurfaceRegistry::from_providers(vec![Box::new(TopologyProvider)]);
    let surfaces = registry.surfaces();
    let config = surfaces
        .iter()
        .find(|surface| surface.id == "topology.config.schema")
        .expect("config schema surface should be present");
    let keys: Vec<&str> = config
        .config_fields
        .iter()
        .map(|field| field.key.as_str())
        .collect();

    for expected in [
        "gateway.secrets.provider",
        "gateway.secrets.onePasswordVault",
        "gateway.secrets.varlockProfile",
        "gateway.channels.telegram.enabled",
        "gateway.channels.telegram.secretRef",
        "gateway.channels.whatsapp.enabled",
        "gateway.channels.whatsapp.secretRef",
        "gateway.channels.whatsapp.workspace",
        "gateway.channels.slack.enabled",
        "gateway.channels.slack.secretRef",
        "gateway.channels.discord.enabled",
        "gateway.channels.discord.secretRef",
        "gateway.channels.google-drive.enabled",
        "gateway.channels.google-drive.secretRef",
    ] {
        assert!(
            keys.contains(&expected),
            "portal config surface should expose {expected}; got {keys:?}"
        );
    }
}

#[test]
fn portal_gateway_surface_exposes_real_channel_actions() {
    let registry = SurfaceRegistry::from_providers(vec![Box::new(TopologyProvider)]);
    let surfaces = registry.surfaces();
    let gateway = surfaces
        .iter()
        .find(|surface| surface.id == "topology.s3.gateway")
        .expect("gateway surface should be present");
    let actions = gateway
        .actions
        .iter()
        .map(|action| action.id.as_str())
        .collect::<Vec<_>>();

    for expected in ["channels.status", "channels.send", "channels.files.list"] {
        assert!(
            actions.contains(&expected),
            "gateway surface should expose {expected}; got {actions:?}"
        );
    }
}

#[test]
fn portal_readiness_report_splits_live_raw_service_and_agent_access_results() {
    let health = json!({
        "ok": false,
        "checks": {
            "session": {"ok": true, "sessionId": "20260507-120000-root01"},
            "vault": {"ok": true, "nowPath": "/vault/now.md"},
            "graph": {
                "ok": true,
                "report": {
                    "neo4j": {"ok": true, "uri": "bolt://localhost:7687"},
                    "redis": {"ok": true, "namespace": "s2:graph:semantic"}
                }
            },
            "spacetimedb": {
                "ok": true,
                "configured": true,
                "registrationMode": "live-reducer",
                "subscriptionMode": "http-sql-poll",
                "subscriptionReadiness": "TUI can bind projection via HTTP SQL polling; native WebSocket subscription remains an upgrade path"
            }
        }
    });
    let agent = json!({
        "agent_id": "epii",
        "review": {"open_count": 2},
        "improvement": {"active_count": 1},
        "world_return": {
            "gnosis": {"available": true},
            "nara": {"available": true},
            "graphiti": {"running": false, "runtime_coordinate": "S3'"}
        }
    });

    let report = readiness_report_from_health_and_agent_status(&health, Some(&agent));

    assert!(report.raw_service_results.iter().any(|result| {
        result.id == "readiness.s2.neo4j"
            && result.bucket == PortalReadinessBucket::RawService
            && result.ok == Some(true)
    }));
    assert!(report.agent_access_results.iter().any(|result| {
        result.id == "readiness.s5.epii-review-autoresearch"
            && result.bucket == PortalReadinessBucket::AgentAccess
            && result.ok == Some(true)
            && result.detail.contains("review open=2")
            && result.detail.contains("autoresearch active=1")
    }));
    let subscription = report
        .agent_access_results
        .iter()
        .find(|result| result.id == "readiness.s3.spacetimedb-subscription")
        .expect("SpaceTimeDB subscription readiness should be an agent/live projection result");
    assert_eq!(subscription.ok, Some(false));
    assert_eq!(subscription.status, "transitional");
    assert!(subscription.detail.contains("HTTP SQL polling"));
}

#[test]
fn portal_surface_registry_reads_extension_tools_from_manifest_files() {
    let dir = std::env::temp_dir().join(format!("epi-portal-tools-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    let tools_path = dir.join("tools.json");
    std::fs::write(
        &tools_path,
        r#"{
          "tools": [
            { "name": "epi_vault_link_suggest", "command": "epi vault link-suggest" },
            { "name": "epi_gate_status", "command": "epi gate status" }
          ]
        }"#,
    )
    .unwrap();

    let registry = SurfaceRegistry::from_providers(vec![Box::new(
        ExtensionToolsProvider::from_manifest("S1'", "Hen test tools", &tools_path),
    )]);
    let surfaces = registry.surfaces();
    let _ = std::fs::remove_dir_all(&dir);

    let tool = surfaces
        .iter()
        .find(|surface| surface.id == "extension.epi_vault_link_suggest")
        .expect("tools.json entries should become portal command surfaces");
    assert_eq!(tool.coordinate, "S1'");
    assert_eq!(tool.kind, PortalSurfaceKind::ExtensionTool);
    assert_eq!(tool.source, PortalSurfaceSource::ExtensionManifest);
    assert_eq!(tool.command_hint, "epi vault link-suggest");
    assert!(tool.actions.iter().any(|action| action.command
        == [
            "epi".to_string(),
            "vault".to_string(),
            "link-suggest".to_string()
        ]));
}

#[test]
fn portal_surface_registry_includes_registered_tui_plugins_as_m_surfaces() {
    let registry = SurfaceRegistry::from_providers(vec![Box::new(
        PortalRegistryProvider::from_registered_types([
            "m4.identity",
            default_clock_plugin_id(),
            "s0.command",
        ]),
    )]);
    let surfaces = registry.surfaces();
    let ids: Vec<&str> = surfaces.iter().map(|surface| surface.id.as_str()).collect();

    for expected in [
        "plugin.m4.identity",
        default_clock_surface_id(),
        "plugin.s0.command",
    ] {
        assert!(
            ids.contains(&expected),
            "registered portal plugin {expected} should be represented in the surface registry; got {ids:?}"
        );
    }

    let command = surfaces
        .iter()
        .find(|surface| surface.id == "plugin.s0.command")
        .unwrap();
    assert_eq!(command.coordinate, "S0'");
    assert_eq!(command.kind, PortalSurfaceKind::PortalPlugin);
}

fn default_clock_plugin_id() -> &'static str {
    #[cfg(feature = "portal-images")]
    {
        "clock.unified"
    }
    #[cfg(not(feature = "portal-images"))]
    {
        "clock.cosmic"
    }
}

fn default_clock_surface_id() -> &'static str {
    #[cfg(feature = "portal-images")]
    {
        "plugin.clock.unified"
    }
    #[cfg(not(feature = "portal-images"))]
    {
        "plugin.clock.cosmic"
    }
}

#[test]
fn portal_surface_registry_reads_plugin_manifests_agent_contracts_and_capability_gates() {
    let workspace = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .unwrap()
        .to_path_buf();
    let registry = SurfaceRegistry::from_providers(vec![
        Box::new(PluginManifestProvider::from_manifest(
            "S4'",
            workspace.join("Body/S/S4/plugins/pleroma/.claude-plugin/plugin.json"),
        )),
        Box::new(AgentContractProvider::from_manifest(
            workspace.join("Body/S/S5/epii-agent/agent-contract.json"),
        )),
        Box::new(CapabilityMatrixProvider::from_manifest(
            workspace.join("Body/S/S4/plugins/pleroma/capability-matrix.json"),
        )),
    ]);
    let surfaces = registry.surfaces();
    let ids: Vec<&str> = surfaces.iter().map(|surface| surface.id.as_str()).collect();

    for expected in [
        "package.pleroma",
        "agent.epii.s5'.review.inbox",
        "capability.eros.hen_template_invoke",
    ] {
        assert!(
            ids.contains(&expected),
            "manifest/contract/capability provider should expose {expected}; got {ids:?}"
        );
    }

    let review = surfaces
        .iter()
        .find(|surface| surface.id == "agent.epii.s5'.review.inbox")
        .unwrap();
    assert_eq!(review.coordinate, "S5'");
    assert_eq!(review.kind, PortalSurfaceKind::AgentContract);
    assert_eq!(review.source, PortalSurfaceSource::AgentContract);
    assert!(review.proves_agent_access_separately);

    let capability = surfaces
        .iter()
        .find(|surface| surface.id == "capability.eros.hen_template_invoke")
        .unwrap();
    assert_eq!(capability.coordinate, "S4'");
    assert_eq!(capability.kind, PortalSurfaceKind::CapabilityGate);
    assert_eq!(capability.source, PortalSurfaceSource::CapabilityMatrix);
    assert_eq!(capability.trust_tier, "trusted");

    let package = surfaces
        .iter()
        .find(|surface| surface.id == "package.pleroma")
        .unwrap();
    assert_eq!(package.trust_tier, "trusted");
}

#[test]
fn default_portal_surfaces_include_live_body_manifests() {
    let surfaces = portal_surfaces();
    let ids: Vec<&str> = surfaces.iter().map(|surface| surface.id.as_str()).collect();

    for expected in [
        "topology.setup.readiness",
        "readiness.s3.spacetimedb-registration",
        "readiness.s3.spacetimedb-subscription",
        "readiness.s5.epii-review-autoresearch",
        "gateway.s3.*",
        "gateway.s5'.improve.*",
        "extension.epi_core_knowing",
        "extension.epi_vault",
        "package.pleroma",
        "package.epi-logos",
        "agent.epii.s5'.improve.status",
        "capability.anima.vak_evaluate",
        "plugin.m4.identity",
        "plugin.s0.command",
    ] {
        assert!(
            ids.contains(&expected),
            "default portal surfaces should include {expected}; got {ids:?}"
        );
    }

    assert!(surfaces
        .iter()
        .any(|surface| surface.proves_raw_service_health));
    assert!(surfaces
        .iter()
        .any(|surface| surface.proves_agent_access_separately));
    assert!(surfaces
        .iter()
        .any(|surface| surface.trust_tier == "trusted"));
}
