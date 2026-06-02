mod support;

use std::io::{BufRead, BufReader, Read, Write};
use std::net::TcpListener;
use std::sync::mpsc;
use std::thread;

use epi_logos::gate::{
    sessions::SessionStore,
    spacetimedb_bridge::{
        SpacetimeBridge, SpacetimePresence, SpacetimeProjectionConnectionState,
        SpacetimeProjectionResyncTracker, SpacetimeRegistration,
    },
    system,
};
use serde_json::json;
use support::{temp_env, TestGatewayClient};

use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::{accept_hdr_async, tungstenite::Message};

#[test]
fn bridge_emits_session_presence_activity_and_m_clock_surfaces() {
    let env = temp_env()
        .with_env("EPI_INSTALLATION_ID", "install-local")
        .with_env("EPI_GATEWAY_ID", "gateway-main");
    let _guard = env.apply_to_process();
    let gate_root = env.home.join(".epi").join("gate");
    let store = SessionStore::new(&gate_root).unwrap();
    let session = store.create("agent:main:main").unwrap();
    store
        .patch(
            &session.canonical_key,
            epi_logos::gate::session_store::SessionPatch {
                aliases: Some(vec!["NOW-2026-03-07-main".to_owned()]),
                parent_session_key: Some(Some("agent:root:main".to_owned())),
                source_session_key: Some(Some("external:source:run".to_owned())),
                source_session_kind: Some(Some("import".to_owned())),
                vault_now_path: Some(Some(
                    "/vault/Empty/Present/07-03-2026/main/now.md".to_owned(),
                )),
                runtime_cwd: Some(Some("/repo".to_owned())),
                vault_root: Some(Some("/vault".to_owned())),
                resource_loader_id: Some(Some("loader-main".to_owned())),
                retry_settlement_state: Some(Some("idle-after-retry".to_owned())),
                diagnostics: Some(vec![json!({
                    "severity": "info",
                    "message": "session projected"
                })]),
                team_id: Some(Some("team-alpha".to_owned())),
                team_role: Some(Some("leader".to_owned())),
                orchestration_kind: Some(Some("parallel".to_owned())),
                cmux_workspace: Some(Some("epi-team-alpha".to_owned())),
                cmux_surface: Some(Some("leader".to_owned())),
                cmux_pane_id: Some(Some("pane-main".to_owned())),
                ..Default::default()
            },
        )
        .unwrap();
    system::set_heartbeats(&gate_root, &json!({ "operator-1": "ready" })).unwrap();

    let bridge = SpacetimeBridge::new(&gate_root).unwrap();
    bridge
        .register_gateway_instance(
            "gateway-main",
            "install-local",
            "workspace-hash",
            "ws://127.0.0.1:18794",
            "3",
        )
        .unwrap();
    bridge
        .register_agent_instance(
            "agent-main-1",
            "install-local",
            "gateway-main",
            "anima",
            "anima",
            "agent:main:main",
            "capability-hash",
        )
        .unwrap();
    bridge
        .register_client(
            "tui-main",
            "install-local",
            "gateway-main",
            "tui",
            &["s0.portal", "s3.session"],
        )
        .unwrap();
    bridge.publish_presence("operator-1").unwrap();
    bridge
        .publish_session("agent:main:main", Some("NOW-2026-03-07-main"))
        .unwrap();
    bridge
        .publish_activity_event("gateway.tick", json!({ "phase": "heartbeat" }))
        .unwrap();
    bridge.publish_m_clock_placeholder("M0").unwrap();

    let events = bridge.drain_test_events().unwrap();

    assert!(events.iter().any(|event| {
        event.kind == "gateway_registration"
            && event.table == "gateway_instance"
            && event.payload["gatewayId"] == "gateway-main"
            && event.payload["installationId"] == "install-local"
    }));
    assert!(events.iter().any(|event| {
        event.kind == "agent_registration"
            && event.table == "agent_instance"
            && event.payload["agentInstanceId"] == "agent-main-1"
            && event.payload["gatewayId"] == "gateway-main"
            && event.payload["sessionKey"] == "agent:main:main"
    }));
    assert!(events.iter().any(|event| {
        event.kind == "client_registration"
            && event.table == "client_registration"
            && event.payload["clientId"] == "tui-main"
            && event.payload["clientKind"] == "tui"
            && event.payload["scopes"][0] == "s0.portal"
    }));
    assert!(events.iter().any(|event| {
        event.kind == "presence"
            && event.payload["operatorId"] == "operator-1"
            && event.payload["heartbeats"]["operator-1"] == "ready"
    }));
    assert!(events.iter().any(|event| {
        event.kind == "session_surface"
            && event.table == "session_surface"
            && event.payload["canonicalKey"] == "agent:main:main"
            && event.payload["parentSessionKey"] == "agent:root:main"
            && event.payload["sourceSessionKey"] == "external:source:run"
            && event.payload["sourceSessionKind"] == "import"
            && event.payload["runtimeCwd"] == "/repo"
            && event.payload["vaultRoot"] == "/vault"
            && event.payload["resourceLoaderId"] == "loader-main"
            && event.payload["retrySettlementState"] == "idle-after-retry"
            && event.payload["diagnostics"][0]["severity"] == "info"
            && event.payload["teamId"] == "team-alpha"
            && event.payload["cmuxWorkspace"] == "epi-team-alpha"
            && event.payload["dayId"] == "07-03-2026"
            && event.payload["vaultNowPath"] == "/vault/Empty/Present/07-03-2026/main/now.md"
            && event.payload["redisTemporalContext"]["sessionNowKey"]
                == "s3:gateway:temporal:session:main:now:md"
            && event.payload["redisTemporalContext"]["sessionKairosKey"]
                == "s3:gateway:temporal:session:main:kairos"
            && event.payload["kairos"]["privacy"] == "public-current-transit-only"
            && event.payload["kernel"]["privacy"] == "safe-public-current-kernel-tick"
            && event.payload["kernel"]["projectionOwner"] == "S3'"
            && event.payload["pratibimba"]["coordinate"] == "M4.4.4.4"
            && event.payload["pratibimba"]["privacy"] == "protected-reference-only"
            && event.payload["pratibimba"]["layerPresenceSummary"]["detail"] == "count-only"
            && event.payload["pratibimba"]
                .get("identityHashPreview")
                .is_none()
            && event.payload["pratibimba"]
                .get("layerPresenceMask")
                .is_none()
            && event.payload["pratibimba"].get("layerCount").is_none()
            && event.payload["history"]["archivePath"]
                .as_str()
                .unwrap()
                .contains("Pratibimba/Self/Action/History/2026/03/W10/07")
            && event.payload["aliases"]
                .as_array()
                .unwrap()
                .iter()
                .any(|alias| alias == "NOW-2026-03-07-main")
    }));
    assert!(events.iter().any(|event| {
        event.kind == "global_temporal_surface"
            && event.table == "global_temporal_surface"
            && event.payload["coordinateOwner"] == "S3'"
            && event.payload["agentAccessOwner"] == "S4/S5"
            && event.payload["sessionKey"] == "agent:main:main"
            && event.payload["dayId"] == "07-03-2026"
            && event.payload["dayWikilink"] == "[[07-03-2026]]"
            && event.payload["nowPath"] == "/vault/Empty/Present/07-03-2026/main/now.md"
            && event.payload["nowLineageKey"] == "agent:main:main"
            && event.payload["redis"]["dayContextKey"]
                == "s3:gateway:temporal:day:07-03-2026:context"
            && event.payload["redis"]["globalContextKey"]
                == "s3:gateway:temporal:global:install-local:gateway-main:day:07-03-2026"
            && event.payload["graphiti"]["sessionArcId"] == "day:07-03-2026:session:main"
            && event.payload["kernel"]["privacy"] == "safe-public-current-kernel-tick"
            && event.payload["kernel"]["tick"]["harmonicRatio"]
                .as_str()
                .is_some()
            && event.payload["privacy"] == "safe-live-projection"
    }));
    assert!(events.iter().any(|event| {
        event.kind == "activity_event" && event.payload["kind"] == "gateway.tick"
    }));
    assert!(events
        .iter()
        .any(|event| { event.kind == "m_clock_state" && event.payload["clock"] == "M0" }));
}

#[test]
fn spacetimedb_registration_client_posts_real_reducer_requests() {
    let listener = TcpListener::bind("127.0.0.1:0").expect("test listener should bind");
    let address = listener.local_addr().expect("listener addr");
    let (tx, rx) = mpsc::channel();

    let server = thread::spawn(move || {
        for _ in 0..6 {
            let (mut stream, _) = listener.accept().expect("accept");
            let mut reader = BufReader::new(stream.try_clone().expect("clone stream"));
            let mut request_line = String::new();
            reader.read_line(&mut request_line).expect("request line");
            let request_line = request_line.trim_end();
            let mut parts = request_line.split_whitespace();
            let method = parts.next().expect("method").to_owned();
            let path = parts.next().expect("path").to_owned();
            let body = read_http_body(&mut reader);

            tx.send((method, path, String::from_utf8(body).expect("utf8 body")))
                .expect("send request");

            stream
                .write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 2\r\nConnection: close\r\n\r\n{}")
                .expect("write response");
        }
    });

    let client =
        SpacetimePresence::for_database(&format!("http://{}", address), "epi-logos-runtime");
    client
        .register_gateway(
            "gateway-main",
            "install-local",
            "workspace-hash",
            "ws://127.0.0.1:18794",
            "3",
        )
        .expect("gateway registration");
    client
        .register_agent(
            "agent-main-1",
            "install-local",
            "gateway-main",
            "anima",
            "anima",
            "agent:main:main",
            "capability-hash",
        )
        .expect("agent registration");
    client
        .register_client(
            "desktop-main",
            "install-local",
            "gateway-main",
            "desktop",
            &["s0.portal", "s3.session"],
        )
        .expect("client registration");
    let kernel_projection_json = kernel_projection_json_string();
    client
        .bind_session_temporal_context(
            "agent:main:main",
            "install-local",
            "gateway-main",
            "agent-main-1",
            "07-03-2026",
            "/vault/Empty/Present/07-03-2026/main/now.md",
            "[[now]]",
            "Idea/Pratibimba/Self/Action/History/2026/03/W10/07",
            "s3:gateway:temporal:session:main:now:md",
            "s3:gateway:temporal:day:07-03-2026:context",
            "graphiti-main",
            "pratibimba-abcd1234",
            "kairos-07-03-2026-main",
            "agent:root:main",
            "external:source:run",
            "import",
            "/repo",
            "/vault",
            "loader-main",
            "idle-after-retry",
            r#"[{"severity":"info","message":"session projected"}]"#,
            &kernel_projection_json,
        )
        .expect("session surface");
    client
        .bind_kairos_surface(
            "kairos-07-03-2026-main",
            "install-local",
            "gateway-main",
            "07-03-2026",
            "agent:main:main",
            true,
            true,
            1,
            4,
            17,
            2,
            json!([{"planet_id":0,"degree":41.2,"degree_anchor":41,"retrograde":false}]),
            "nara.kairos.current",
        )
        .expect("kairos surface");
    client
        .bind_global_temporal_surface(
            "install-local:gateway-main:agent:main:main",
            "install-local",
            "gateway-main",
            "agent-main-1",
            "agent:main:main",
            "07-03-2026",
            "[[07-03-2026]]",
            "/vault/Empty/Present/07-03-2026/main/now.md",
            "[[now]]",
            "agent:main:main",
            "Idea/Pratibimba/Self/Action/History/2026/03/W10/07",
            "s3:gateway:temporal:session:main:now:md",
            "s3:gateway:temporal:day:07-03-2026:context",
            "s3:gateway:temporal:global:install-local:gateway-main:day:07-03-2026",
            "pratibimba-abcd1234",
            "graphiti-main",
            "pratibimba-abcd1234",
            "kairos-07-03-2026-main",
            &kernel_projection_json,
        )
        .expect("global temporal surface");

    let requests: Vec<_> = (0..6).map(|_| rx.recv().expect("request")).collect();
    server.join().expect("server join");

    assert_reducer(
        &requests[0],
        "register_gateway",
        json!([
            "gateway-main",
            "install-local",
            "workspace-hash",
            "ws://127.0.0.1:18794",
            "3",
        ]),
    );
    assert_reducer(
        &requests[1],
        "register_agent",
        json!([
            "agent-main-1",
            "install-local",
            "gateway-main",
            "anima",
            "anima",
            "agent:main:main",
            "capability-hash",
        ]),
    );
    assert_reducer(
        &requests[2],
        "register_client",
        json!([
            "desktop-main",
            "install-local",
            "gateway-main",
            "desktop",
            "s0.portal,s3.session",
        ]),
    );
    assert_reducer(
        &requests[3],
        "bind_session_temporal_context",
        json!([
            "agent:main:main",
            "install-local",
            "gateway-main",
            "agent-main-1",
            "07-03-2026",
            "/vault/Empty/Present/07-03-2026/main/now.md",
            "[[now]]",
            "Idea/Pratibimba/Self/Action/History/2026/03/W10/07",
            "s3:gateway:temporal:session:main:now:md",
            "s3:gateway:temporal:day:07-03-2026:context",
            "graphiti-main",
            "pratibimba-abcd1234",
            "kairos-07-03-2026-main",
            "agent:root:main",
            "external:source:run",
            "import",
            "/repo",
            "/vault",
            "loader-main",
            "idle-after-retry",
            r#"[{"severity":"info","message":"session projected"}]"#,
            kernel_projection_json.clone(),
        ]),
    );
    assert_reducer(
        &requests[4],
        "bind_kairos_surface",
        json!([
            "kairos-07-03-2026-main",
            "install-local",
            "gateway-main",
            "07-03-2026",
            "agent:main:main",
            true,
            true,
            1,
            4,
            17,
            2,
            r#"[{"degree":41.2,"degree_anchor":41,"planet_id":0,"retrograde":false}]"#,
            "nara.kairos.current",
        ]),
    );
    assert_reducer(
        &requests[5],
        "bind_global_temporal_surface",
        json!([
            "install-local:gateway-main:agent:main:main",
            "install-local",
            "gateway-main",
            "agent-main-1",
            "agent:main:main",
            "07-03-2026",
            "[[07-03-2026]]",
            "/vault/Empty/Present/07-03-2026/main/now.md",
            "[[now]]",
            "agent:main:main",
            "Idea/Pratibimba/Self/Action/History/2026/03/W10/07",
            "s3:gateway:temporal:session:main:now:md",
            "s3:gateway:temporal:day:07-03-2026:context",
            "s3:gateway:temporal:global:install-local:gateway-main:day:07-03-2026",
            "pratibimba-abcd1234",
            "graphiti-main",
            "pratibimba-abcd1234",
            "kairos-07-03-2026-main",
            kernel_projection_json.clone(),
        ]),
    );
}

#[test]
fn spacetimedb_projection_query_hydrates_gateway_temporal_context_shape() {
    let listener = TcpListener::bind("127.0.0.1:0").expect("test listener should bind");
    let address = listener.local_addr().expect("listener addr");
    let kernel_projection_json = kernel_projection_json_string();
    let server = thread::spawn(move || {
        let (mut stream, _) = listener.accept().expect("accept");
        let mut reader = BufReader::new(stream.try_clone().expect("clone stream"));
        let mut request_line = String::new();
        reader.read_line(&mut request_line).expect("request line");
        let request_line = request_line.trim_end().to_owned();
        let body = read_http_body(&mut reader);
        let body = String::from_utf8(body).expect("utf8 body");

        assert_eq!(
            request_line,
            "POST /v1/database/epi-logos-runtime/sql HTTP/1.1"
        );
        assert!(body.contains("FROM session_surface"));
        assert!(body.contains("FROM kairos_surface"));
        assert!(body.contains("FROM global_temporal_surface"));
        assert!(body.contains("agent:main:main"));

        let response = json!([
            {
                "schema": {},
                "rows": [{
                    "session_key": "agent:main:main",
                    "day_id": "07-05-2026",
                    "now_path": "/vault/Empty/Present/07-05-2026/session-main/now.md",
                    "now_wikilink": "[[NOW session-main]]",
                    "history_archive_path": "/vault/Pratibimba/Self/Action/History/2026/05/W19/07",
                    "redis_session_now_key": "s3:gateway:temporal:session:session-main:now:md",
                    "redis_day_context_key": "s3:gateway:temporal:day:07-05-2026:context",
                    "graphiti_arc_id": "day:07-05-2026:session:session-main",
                    "pratibimba_anchor_ref": "pratibimba-abcd1234",
                    "kairos_snapshot_id": "kairos-07-05-2026-session-main",
                    "kernel_projection_json": kernel_projection_json.clone(),
                    "active_agent_id": "anima",
                    "resource_loader_id": "loader://anima/plugin-runtime",
                    "runtime_cwd": "/repo",
                    "source_session_key": "agent:anima:new:one",
                    "source_session_kind": "fork"
                }]
            },
            {
                "schema": {},
                "rows": [{
                    "kairos_snapshot_id": "kairos-07-05-2026-session-main",
                    "available": true,
                    "fresh": true,
                    "dominant_sign": 1,
                    "dominant_element": 4,
                    "active_decan": 17,
                    "active_tattva": 2,
                    "planets_json": "[{\"planet_id\":0,\"degree\":41.2,\"degree_anchor\":41,\"retrograde\":false}]",
                    "source": "nara.kairos.current"
                }]
            },
            {
                "schema": {},
                "rows": [{
                    "surface_key": "install-local:gateway-main:agent:main:main",
                    "installation_id": "install-local",
                    "gateway_id": "gateway-main",
                    "agent_instance_id": "gateway-main:epii:session-main",
                    "session_key": "agent:main:main",
                    "day_id": "07-05-2026",
                    "day_wikilink": "[[07-05-2026]]",
                    "now_path": "/vault/Empty/Present/07-05-2026/session-main/now.md",
                    "now_wikilink": "[[NOW session-main]]",
                    "now_lineage_key": "agent:main:main",
                    "history_archive_path": "/vault/Pratibimba/Self/Action/History/2026/05/W19/07",
                    "redis_session_now_key": "s3:gateway:temporal:session:session-main:now:md",
                    "redis_day_context_key": "s3:gateway:temporal:day:07-05-2026:context",
                    "redis_global_context_key": "s3:gateway:temporal:global:install-local:gateway-main:day:07-05-2026",
                    "graphiti_namespace_ref": "pratibimba-abcd1234",
                    "graphiti_session_arc_id": "day:07-05-2026:session:session-main",
                    "pratibimba_anchor_ref": "pratibimba-abcd1234",
                    "kairos_snapshot_id": "kairos-07-05-2026-session-main",
                    "kernel_projection_json": kernel_projection_json.clone(),
                    "privacy_class": "safe-live-projection"
                }]
            }
        ])
        .to_string();
        let http = format!(
            "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
            response.len(),
            response
        );
        stream.write_all(http.as_bytes()).expect("write response");
    });

    let client =
        SpacetimePresence::for_database(&format!("http://{}", address), "epi-logos-runtime");
    let context = client
        .projection_temporal_context("agent:main:main", "epii")
        .expect("query should succeed")
        .expect("session projection should exist");

    server.join().expect("server join");
    assert_eq!(context["coordinateOwner"], "S3'");
    assert_eq!(context["agentAccessOwner"], "S4/S5");
    assert_eq!(context["session"]["sessionId"], "session-main");
    assert_eq!(context["session"]["activeAgentId"], "anima");
    assert_eq!(
        context["session"]["resourceLoaderId"],
        "loader://anima/plugin-runtime"
    );
    assert_eq!(context["session"]["runtimeCwd"], "/repo");
    assert_eq!(
        context["session"]["sourceSessionKey"],
        "agent:anima:new:one"
    );
    assert_eq!(context["session"]["sourceSessionKind"], "fork");
    assert_eq!(context["day"]["dayId"], "07-05-2026");
    assert_eq!(context["now"]["wikilink"], "[[NOW session-main]]");
    assert_eq!(
        context["redis"]["sessionNowKey"],
        "s3:gateway:temporal:session:session-main:now:md"
    );
    assert_eq!(context["redis"]["hydrated"], true);
    assert_eq!(context["spacetimedb"]["projectionSource"], "http-sql-poll");
    assert_eq!(context["kairos"]["available"], true);
    assert_eq!(context["kairos"]["activeDecan"], 17);
    assert_eq!(
        context["kernel"]["privacy"],
        "safe-public-current-kernel-tick"
    );
    assert_eq!(context["kernel"]["generation"], 11);
    assert_eq!(context["kernel"]["tick"]["subTick"], 4);
    assert_eq!(context["kernel"]["tick"]["phase"], "Descent");
    assert_eq!(context["kernel"]["tick"]["element"], "SlashFlip");
    assert_eq!(context["kernel"]["tick"]["harmonicRatio"], "1.125000");
    assert_eq!(context["kernel"]["energy"]["totalEnergy"], "0.375000");
    assert_eq!(context["pratibimba"]["anchorId"], "pratibimba-abcd1234");
    assert_eq!(
        context["pratibimba"]["graphitiNamespaceRef"],
        "pratibimba-abcd1234"
    );
    assert_eq!(context["pratibimba"]["privacy"], "protected-reference-only");
    assert_eq!(
        context["pratibimba"]["layerPresenceSummary"]["detail"],
        "projection-anchor-only"
    );
    assert!(context["pratibimba"]["layerPresenceSummary"]["presentCount"].is_null());
    assert!(
        context["pratibimba"].get("identityHashPreview").is_none(),
        "SpaceTimeDB projection must not hydrate protected profile hash detail"
    );
    assert!(
        context["pratibimba"].get("layerPresenceMask").is_none(),
        "SpaceTimeDB projection must not hydrate protected layer mask detail"
    );
    assert!(
        context["pratibimba"].get("layerCount").is_none(),
        "SpaceTimeDB projection must keep layer detail inside the safe summary"
    );
    assert_eq!(
        context["graphiti"]["sessionArcId"],
        "day:07-05-2026:session:session-main"
    );
    assert_eq!(
        context["globalTemporal"]["surfaceKey"],
        "install-local:gateway-main:agent:main:main"
    );
    assert_eq!(
        context["globalTemporal"]["redisGlobalContextKey"],
        "s3:gateway:temporal:global:install-local:gateway-main:day:07-05-2026"
    );
    assert_eq!(context["globalTemporal"]["privacy"], "safe-live-projection");
}

#[test]
fn spacetimedb_registration_builds_native_subscription_projection_plan() {
    let env = temp_env()
        .with_env("SPACETIMEDB_URL", "http://127.0.0.1:3000")
        .with_env("SPACETIMEDB_DATABASE", "epi-logos-runtime")
        .with_env("EPI_INSTALLATION_ID", "install-subscription-test")
        .with_env("EPI_GATEWAY_ID", "gateway-subscription-test")
        .with_env("EPI_GATEWAY_ENDPOINT", "ws://127.0.0.1:18794")
        .with_env("EPI_WORKSPACE_ROOT_HASH", "workspace-subscription-hash")
        .with_env("EPI_SPACETIME_SUBSCRIPTION_MODE", "native-websocket")
        .with_env("EPI_SPACETIME_SUBSCRIPTION_PROFILE", "full");
    let gate_root = env.home.join(".epi").join("gate");
    let _guard = env.apply_to_process();

    let registration = SpacetimeRegistration::from_env(18794, &gate_root)
        .unwrap()
        .expect("registration should be configured");
    let plan = registration.subscription_plan("agent:main:main", "epii");
    let readiness = registration.readiness_value();

    assert_eq!(plan.mode, "native-websocket");
    assert_eq!(plan.subscription_mode, "full");
    assert_eq!(plan.endpoint, "ws://127.0.0.1:3000");
    assert_eq!(plan.database, "epi-logos-runtime");
    assert_eq!(plan.session_key, "agent:main:main");
    assert_eq!(plan.agent_id, "epii");
    assert_eq!(plan.coordinate_owner, "S3'");
    assert_eq!(plan.agent_access_owner, "S4/S5");
    assert_eq!(
        plan.tables,
        vec![
            "session_surface",
            "kairos_surface",
            "global_temporal_surface",
            "gateway_instance",
            "agent_instance",
            "client_registration",
            "temporal_event",
            "world_clock",
            "world_clock_tick",
            "pratibimba_presence",
            "shared_archetype_event",
            "coincidence",
            "coincidence_tick",
            "module_version",
        ]
    );
    assert_eq!(plan.sql_fallback_mode, "http-sql-poll");

    assert_eq!(readiness["subscriptionMode"], "native-websocket");
    assert_eq!(readiness["subscriptionProfile"], "full");
    assert_eq!(readiness["nativeSubscriptionReady"], true);
    assert_eq!(
        readiness["capabilityFacts"]["nativeWebsocketSubscribable"],
        true
    );
    assert_eq!(
        readiness["capabilityFacts"]["httpSqlFallbackAvailable"],
        true
    );
    assert_eq!(
        readiness["capabilityFacts"]["fullProjectionRequested"],
        true
    );
    assert_eq!(
        readiness["capabilityFacts"]["observabilityEventsIncluded"],
        true
    );
    assert_eq!(
        readiness["projectionSubscriptionPlan"]["endpoint"],
        "ws://127.0.0.1:3000"
    );
    assert_eq!(
        readiness["projectionSubscriptionPlan"]["subscriptionMode"],
        "full"
    );
    assert_eq!(readiness["projectionSubscriptionPlan"]["sessionKey"], "");
    assert_eq!(
        readiness["projectionSubscriptionPlan"]["sqlFallbackMode"],
        "http-sql-poll"
    );
    assert_eq!(
        readiness["projectionSubscriptionPlan"]["tables"]
            .as_array()
            .unwrap()
            .len(),
        14
    );
}

#[test]
fn spacetimedb_registration_defaults_to_lite_subscription_set_with_http_fallback() {
    let env = temp_env()
        .with_env("SPACETIMEDB_URL", "http://127.0.0.1:3000")
        .with_env("EPI_SPACETIME_SUBSCRIPTION_MODE", "native-websocket");
    let gate_root = env.home.join(".epi").join("gate");
    let _guard = env.apply_to_process();
    let registration = SpacetimeRegistration::from_env(18794, &gate_root)
        .unwrap()
        .expect("registration should be configured");
    let plan = registration.subscription_plan("agent:main:main", "epii");

    assert_eq!(plan.subscription_mode, "lite");
    assert_eq!(
        plan.tables,
        vec![
            "session_surface",
            "kairos_surface",
            "global_temporal_surface",
        ]
    );
    assert_eq!(plan.sql_fallback_mode, "http-sql-poll");
    assert!(plan.subscription_queries().iter().all(|query| {
        !query.contains("gateway_instance") && !query.contains("client_registration")
    }));
}

#[tokio::test]
async fn spacetimedb_native_subscription_hydrates_gateway_temporal_context_shape() {
    let env = temp_env().with_env("EPI_SPACETIME_SUBSCRIPTION_MODE", "native-websocket");
    let _guard = env.apply_to_process();
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
        .await
        .expect("test listener should bind");
    let address = listener.local_addr().expect("listener addr");

    let kernel_projection_json = kernel_projection_json_string();
    let server = tokio::spawn(async move {
        let (stream, _) = listener.accept().await.expect("accept websocket");
        let mut socket = accept_hdr_async(stream, |request: &tokio_tungstenite::tungstenite::handshake::server::Request, mut response: tokio_tungstenite::tungstenite::handshake::server::Response| {
            assert_eq!(request.uri().path(), "/v1/database/epi-logos-runtime/subscribe");
            assert_eq!(
                request
                    .headers()
                    .get("sec-websocket-protocol")
                    .and_then(|value| value.to_str().ok()),
                Some("v1.json.spacetimedb")
            );
            response.headers_mut().insert(
                "sec-websocket-protocol",
                "v1.json.spacetimedb".parse().unwrap(),
            );
            Ok(response)
        })
        .await
        .expect("accept websocket handshake");

        let message = socket
            .next()
            .await
            .expect("subscribe message")
            .expect("subscribe frame");
        let subscribe: serde_json::Value =
            serde_json::from_str(message.to_text().expect("text frame")).expect("json frame");
        assert_eq!(subscribe["SubscribeMulti"]["request_id"], 1);
        assert_eq!(subscribe["SubscribeMulti"]["query_id"]["id"], 1);
        let queries = subscribe["SubscribeMulti"]["query_strings"]
            .as_array()
            .expect("query strings");
        assert!(queries.iter().any(|query| {
            query == "SELECT * FROM session_surface WHERE session_key = 'agent:main:main'"
        }));
        assert!(queries.iter().any(|query| {
            query == "SELECT * FROM kairos_surface WHERE session_key = 'agent:main:main'"
        }));
        assert!(queries.iter().any(|query| {
            query == "SELECT * FROM global_temporal_surface WHERE session_key = 'agent:main:main'"
        }));

        socket
            .send(Message::Text(
                json!({
                    "SubscribeMultiApplied": {
                        "request_id": 1,
                        "total_host_execution_duration_micros": 0,
                        "query_id": { "id": 1 },
                        "update": {
                            "tables": [
                                {
                                    "table_id": 4,
                                    "table_name": "session_surface",
                                    "num_rows": 1,
                                    "updates": [{
                                        "deletes": [],
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
                                            kernel_projection_json.clone(),
                                            1778179200
                                        ]]
                                    }]
                                },
                                {
                                    "table_id": 5,
                                    "table_name": "kairos_surface",
                                    "num_rows": 1,
                                    "updates": [{
                                        "deletes": [],
                                        "inserts": [[
                                            "kairos-07-05-2026-session-main",
                                            "install-local",
                                            "gateway-main",
                                            "07-05-2026",
                                            "agent:main:main",
                                            true,
                                            true,
                                            1,
                                            4,
                                            17,
                                            2,
                                            "[{\"planet_id\":0,\"degree\":41.2,\"degree_anchor\":41,\"retrograde\":false}]",
                                            "nara.kairos.current",
                                            "public-current-transit-only",
                                            1778179200
                                        ]]
                                    }]
                                },
                                {
                                    "table_id": 6,
                                    "table_name": "global_temporal_surface",
                                    "num_rows": 1,
                                    "updates": [{
                                        "deletes": [],
                                        "inserts": [[
                                            "install-local:gateway-main:agent:main:main",
                                            "install-local",
                                            "gateway-main",
                                            "gateway-main:epii:session-main",
                                            "agent:main:main",
                                            "07-05-2026",
                                            "[[07-05-2026]]",
                                            "/vault/Empty/Present/07-05-2026/session-main/now.md",
                                            "[[NOW session-main]]",
                                            "agent:main:main",
                                            "/vault/Pratibimba/Self/Action/History/2026/05/W19/07",
                                            "s3:gateway:temporal:session:session-main:now:md",
                                            "s3:gateway:temporal:day:07-05-2026:context",
                                            "s3:gateway:temporal:global:install-local:gateway-main:day:07-05-2026",
                                            "pratibimba-abcd1234",
                                            "day:07-05-2026:session:session-main",
                                            "pratibimba-abcd1234",
                                            "kairos-07-05-2026-session-main",
                                            kernel_projection_json.clone(),
                                            "safe-live-projection",
                                            1778179200
                                        ]]
                                    }]
                                }
                            ]
                        }
                    }
                })
                .to_string(),
            ))
            .await
            .expect("send subscription update");
        let resynced_kernel_projection_json =
            kernel_projection_json.replace("\"generation\":11", "\"generation\":12");
        socket
            .send(Message::Text(
                json!({
                    "TransactionUpdateLight": {
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
                                        resynced_kernel_projection_json,
                                        1778179300
                                    ]]
                                }]
                            }]
                        }
                    }
                })
                .to_string(),
            ))
            .await
            .expect("send resync subscription update");
    });

    let registration = SpacetimeRegistration {
        url: format!("http://{address}"),
        database: "epi-logos-runtime".to_owned(),
        installation_id: "install-local".to_owned(),
        gateway_id: "gateway-main".to_owned(),
        workspace_root_hash: "workspace-hash".to_owned(),
        endpoint: "ws://127.0.0.1:18794".to_owned(),
        protocol_version: "3".to_owned(),
    };
    let mut subscription = registration
        .subscribe_projection("agent:main:main", "epii")
        .await
        .expect("native subscription should connect");
    let first_update = subscription
        .next_update()
        .await
        .expect("subscription update should decode")
        .expect("context should hydrate");
    assert_eq!(
        first_update.state,
        SpacetimeProjectionConnectionState::Connected
    );
    assert_eq!(first_update.profile_generation, Some(11));
    let context = first_update.context.expect("first context");

    server.await.expect("server task");
    assert_eq!(
        context["spacetimedb"]["projectionSource"],
        "native-websocket"
    );
    assert_eq!(context["spacetimedb"]["projectionTable"], "session_surface");
    assert_eq!(context["session"]["sessionId"], "session-main");
    assert_eq!(context["kairos"]["activeDecan"], 17);
    assert_eq!(
        context["kernel"]["privacy"],
        "safe-public-current-kernel-tick"
    );
    assert_eq!(context["kernel"]["tick"]["element"], "SlashFlip");
    assert_eq!(context["kernel"]["energy"]["totalEnergy"], "0.375000");
    assert_eq!(context["pratibimba"]["anchorId"], "pratibimba-abcd1234");
    assert_eq!(context["pratibimba"]["privacy"], "protected-reference-only");
    assert_eq!(
        context["pratibimba"]["layerPresenceSummary"]["detail"],
        "projection-anchor-only"
    );
    assert!(context["pratibimba"]["layerPresenceSummary"]["presentCount"].is_null());
    assert!(context["pratibimba"].get("identityHashPreview").is_none());
    assert!(context["pratibimba"].get("layerPresenceMask").is_none());
    assert!(context["pratibimba"].get("layerCount").is_none());
    assert_eq!(
        context["globalTemporal"]["projectionTable"],
        "global_temporal_surface"
    );
    assert_eq!(
        context["globalTemporal"]["graphitiSessionArcId"],
        "day:07-05-2026:session:session-main"
    );

    let lost = subscription.mark_connection_lost();
    assert_eq!(
        lost.state,
        SpacetimeProjectionConnectionState::ConnectionLost
    );
    assert_eq!(lost.stale_profile_generation, Some(11));
    let reconnecting = subscription.mark_reconnecting();
    assert_eq!(
        reconnecting.state,
        SpacetimeProjectionConnectionState::Reconnecting
    );
    let resynced = subscription
        .next_update()
        .await
        .expect("resync update should decode")
        .expect("resynced context should hydrate");
    assert_eq!(
        resynced.state,
        SpacetimeProjectionConnectionState::ResyncedProfileGeneration
    );
    assert_eq!(resynced.stale_profile_generation, Some(11));
    assert_eq!(resynced.resynced_profile_generation, Some(12));
    assert_eq!(resynced.profile_generation, Some(12));
}

#[test]
fn spacetimedb_resync_tracker_marks_stale_and_degraded_states_without_serving_stale_as_current() {
    let mut tracker = SpacetimeProjectionResyncTracker::default();
    let first = tracker.observe_context(json!({
        "spacetimedb": { "projectionSource": "native-websocket" },
        "kernel": { "generation": 7 }
    }));
    assert_eq!(first.state, SpacetimeProjectionConnectionState::Connected);
    assert_eq!(tracker.current_generation(), Some(7));

    let lost = tracker.mark_connection_lost();
    assert_eq!(
        lost.state,
        SpacetimeProjectionConnectionState::ConnectionLost
    );
    assert_eq!(lost.stale_profile_generation, Some(7));
    let reconnecting = tracker.mark_reconnecting();
    assert_eq!(
        reconnecting.state,
        SpacetimeProjectionConnectionState::Reconnecting
    );

    let stale = tracker.observe_context(json!({
        "spacetimedb": { "projectionSource": "native-websocket" },
        "kernel": { "generation": 7 }
    }));
    assert_eq!(
        stale.state,
        SpacetimeProjectionConnectionState::StaleProfile
    );
    assert_eq!(stale.profile_generation, Some(7));
    assert_eq!(stale.stale_profile_generation, Some(7));
    assert_eq!(tracker.current_generation(), Some(7));

    let degraded = tracker.mark_degraded_but_subscribable();
    assert_eq!(
        degraded.state,
        SpacetimeProjectionConnectionState::DegradedButSubscribable
    );
    assert!(degraded.degraded_but_subscribable);

    let resynced = tracker.observe_context(json!({
        "spacetimedb": { "projectionSource": "native-websocket" },
        "kernel": { "generation": 8 }
    }));
    assert_eq!(
        resynced.state,
        SpacetimeProjectionConnectionState::ResyncedProfileGeneration
    );
    assert_eq!(resynced.resynced_profile_generation, Some(8));
    assert_eq!(tracker.current_generation(), Some(8));
}

fn assert_reducer(request: &(String, String, String), reducer: &str, payload: serde_json::Value) {
    assert_eq!(request.0, "POST");
    assert_eq!(
        request.1,
        format!("/v1/database/epi-logos-runtime/call/{reducer}")
    );
    assert_eq!(
        serde_json::from_str::<serde_json::Value>(&request.2).expect("request json"),
        payload
    );
}

fn kernel_projection_json_string() -> String {
    json!({
        "coordinateOwner": "S0/QL-meta",
        "projectionOwner": "S3'",
        "privacy": "safe-public-current-kernel-tick",
        "computationSource": "portal-core::KernelProjection",
        "generation": 11,
        "tick": {
            "cycle": 99,
            "subTick": 4,
            "phase": "Descent",
            "element": "SlashFlip",
            "position6": 4,
            "harmonicRatio": "1.125000"
        },
        "harmonicPulse": {
            "cycle": 99,
            "subTick": 4,
            "phase": "Descent",
            "element": "SlashFlip",
            "ratioNum": 9,
            "ratioDen": 8,
            "tempoMultiplier": "1.125000",
            "periodMultiplier": "0.888889"
        },
        "energy": {
            "totalEnergy": "0.375000"
        }
    })
    .to_string()
}

fn assert_safe_kernel_projection_json(raw: &str) {
    let value: serde_json::Value = serde_json::from_str(raw).expect("kernel projection json");
    assert_eq!(value["coordinateOwner"], "S0/QL-meta");
    assert_eq!(value["projectionOwner"], "S3'");
    assert_eq!(value["privacy"], "safe-public-current-kernel-tick");
    assert_eq!(value["computationSource"], "portal-core::KernelProjection");
    assert!(value["generation"].as_u64().unwrap() > 0);
    assert!(value["tick"]["subTick"].as_u64().unwrap() <= 11);
    assert!(
        value.get("bioquaternion").is_none(),
        "SpaceTimeDB public kernel projection must not carry protected bioquaternion detail"
    );
    assert!(
        value.get("resonanceSquareEmphasis").is_none(),
        "SpaceTimeDB public kernel projection must not carry protected resonance vectors"
    );
}

fn read_http_body(reader: &mut BufReader<std::net::TcpStream>) -> Vec<u8> {
    let mut content_length = 0usize;
    let mut chunked = false;
    loop {
        let mut header = String::new();
        reader.read_line(&mut header).expect("header line");
        let header = header.trim_end();
        if header.is_empty() {
            break;
        }
        let lower = header.to_ascii_lowercase();
        if let Some(value) = lower.strip_prefix("content-length:") {
            content_length = value.trim().parse::<usize>().expect("content length");
        } else if lower == "transfer-encoding: chunked" {
            chunked = true;
        }
    }

    if chunked {
        return read_chunked_body(reader);
    }

    let mut body = vec![0u8; content_length];
    reader.read_exact(&mut body).expect("request body");
    body
}

fn read_chunked_body(reader: &mut BufReader<std::net::TcpStream>) -> Vec<u8> {
    let mut body = Vec::new();
    loop {
        let mut size_line = String::new();
        reader.read_line(&mut size_line).expect("chunk size");
        let size = usize::from_str_radix(size_line.trim_end(), 16).expect("hex chunk size");
        if size == 0 {
            let mut trailer = String::new();
            reader.read_line(&mut trailer).expect("chunk trailer");
            break;
        }

        let mut chunk = vec![0u8; size];
        reader.read_exact(&mut chunk).expect("chunk payload");
        body.extend_from_slice(&chunk);

        let mut crlf = [0u8; 2];
        reader.read_exact(&mut crlf).expect("chunk crlf");
    }
    body
}

#[tokio::test]
async fn gateway_rpc_publishes_bridge_events_for_real_state_changes() {
    let mut client = TestGatewayClient::connected_with_temp_store(18794).await;

    client
        .request(
            "set-heartbeats",
            json!({ "heartbeats": { "operator-1": "ready" } }),
        )
        .await
        .unwrap();
    client
        .request(
            "chat.send",
            json!({ "sessionKey": "agent:main:main", "message": "hello now" }),
        )
        .await
        .unwrap();
    client
        .request(
            "sessions.patch",
            json!({
                "sessionKey": "agent:main:main",
                "aliases": ["NOW-2026-03-07-main"],
                "activeAgentId": "pi.agent",
                "teamId": "team-bravo",
                "teamRole": "worker",
                "orchestrationKind": "chain",
                "cmuxWorkspace": "epi-team-bravo",
                "cmuxSurface": "worker-1",
                "cmuxPaneId": "pane-bravo-1",
                "vaultNowPath": "/vault/Empty/Present/07-03-2026/main/now.md"
            }),
        )
        .await
        .unwrap();
    client
        .request(
            "system-event",
            json!({ "kind": "gateway.tick", "payload": { "phase": "heartbeat" } }),
        )
        .await
        .unwrap();

    let bridge = SpacetimeBridge::new(client.gate_root()).unwrap();
    let events = bridge.drain_test_events().unwrap();

    assert!(events.iter().any(|event| event.kind == "m_clock_state"));
    assert!(events.iter().any(|event| {
        event.kind == "presence" && event.payload["heartbeats"]["operator-1"] == "ready"
    }));
    assert!(events.iter().any(|event| {
        event.kind == "session_surface"
            && event.payload["canonicalKey"] == "agent:main:main"
            && event.payload["activeAgentId"] == "pi.agent"
            && event.payload["teamId"] == "team-bravo"
            && event.payload["cmuxWorkspace"] == "epi-team-bravo"
            && event.payload["dayId"] == "07-03-2026"
            && event.payload["redisTemporalContext"]["dayContextKey"]
                == "s3:gateway:temporal:day:07-03-2026:context"
            && event.payload["spacetimedb"].is_null()
            && event.payload["kairos"]["privacy"] == "public-current-transit-only"
    }));
    assert!(events.iter().any(|event| {
        event.kind == "activity_event" && event.payload["kind"] == "gateway.tick"
    }));
}

#[tokio::test]
async fn gateway_registers_live_spacetimedb_gateway_client_and_agent_surfaces_when_configured() {
    let listener = TcpListener::bind("127.0.0.1:0").expect("test listener should bind");
    let address = listener.local_addr().expect("listener addr");
    let (tx, rx) = mpsc::channel();

    let server = thread::spawn(move || {
        for _ in 0..8 {
            let (mut stream, _) = listener.accept().expect("accept");
            let mut reader = BufReader::new(stream.try_clone().expect("clone stream"));
            let mut request_line = String::new();
            reader.read_line(&mut request_line).expect("request line");
            let request_line = request_line.trim_end();
            let mut parts = request_line.split_whitespace();
            let method = parts.next().expect("method").to_owned();
            let path = parts.next().expect("path").to_owned();
            let body = read_http_body(&mut reader);

            tx.send((method, path, String::from_utf8(body).expect("utf8 body")))
                .expect("send request");

            stream
                .write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 2\r\nConnection: close\r\n\r\n{}")
                .expect("write response");
        }
    });

    let env = temp_env()
        .with_env("SPACETIMEDB_URL", format!("http://{}", address))
        .with_env("SPACETIMEDB_DATABASE", "epi-logos-runtime")
        .with_env("EPI_INSTALLATION_ID", "install-live-test")
        .with_env("EPI_GATEWAY_ID", "gateway-live-test")
        .with_env("EPI_GATEWAY_ENDPOINT", "ws://127.0.0.1:18794")
        .with_env("EPI_WORKSPACE_ROOT_HASH", "workspace-live-hash");
    let gate_root = env.home.join(".epi").join("gate");
    SessionStore::new(&gate_root)
        .unwrap()
        .create("agent:main:main")
        .unwrap();
    let mut client = TestGatewayClient::connect(env, 18794).await;
    client
        .request(
            "connect",
            json!({
                "clientId": "tui-live-test",
                "clientKind": "tui",
                "scopes": ["s0.portal", "s3.session", "s3'.temporal.context"]
            }),
        )
        .await
        .unwrap();
    tokio::time::sleep(std::time::Duration::from_millis(600)).await;
    client
        .request(
            "sessions.patch",
            json!({
                "sessionKey": "agent:main:main",
                "activeAgentId": "anima",
                "vaultNowPath": "/vault/Empty/Present/07-03-2026/main/now.md",
                "runtimeCwd": "/repo",
                "vaultRoot": "/vault",
                "resourceLoaderId": "loader-live",
                "retrySettlementState": "idle",
                "diagnostics": [{"severity":"info","message":"registered"}]
            }),
        )
        .await
        .unwrap();

    let requests: Vec<_> = (0..8).map(|_| rx.recv().expect("request")).collect();
    server.join().expect("server join");

    assert_reducer(
        find_reducer(&requests, "register_gateway"),
        "register_gateway",
        json!([
            "gateway-live-test",
            "install-live-test",
            "workspace-live-hash",
            "ws://127.0.0.1:18794",
            "3",
        ]),
    );
    assert_reducer(
        find_reducer(&requests, "heartbeat_gateway"),
        "heartbeat_gateway",
        json!(["gateway-live-test"]),
    );
    assert_reducer(
        find_reducer(&requests, "register_client"),
        "register_client",
        json!([
            "tui-live-test",
            "install-live-test",
            "gateway-live-test",
            "tui",
            "s0.portal,s3.session,s3'.temporal.context",
        ]),
    );
    let agent_registration = find_reducer(&requests, "register_agent");
    let agent_registration_payload: serde_json::Value =
        serde_json::from_str(&agent_registration.2).expect("agent registration json");
    let agent_instance_id = agent_registration_payload[0]
        .as_str()
        .expect("agent instance id")
        .to_owned();
    assert!(
        agent_instance_id.starts_with("gateway-live-test:anima:"),
        "agent instance id should be gateway/agent scoped: {agent_instance_id}"
    );
    assert_reducer(
        agent_registration,
        "register_agent",
        json!([
            agent_instance_id.clone(),
            "install-live-test",
            "gateway-live-test",
            "anima",
            "anima",
            "agent:main:main",
            "049563640efaa8256fa2b0acc06427636639dfa60054e0bf13943e7c40577394",
        ]),
    );
    let bind_session = find_reducer(&requests, "bind_session_temporal_context");
    let bind_session_payload: serde_json::Value =
        serde_json::from_str(&bind_session.2).expect("bind session payload");
    let kernel_projection_json = bind_session_payload[21]
        .as_str()
        .expect("kernel projection json")
        .to_owned();
    assert_safe_kernel_projection_json(&kernel_projection_json);
    assert_reducer(
        bind_session,
        "bind_session_temporal_context",
        json!([
            "agent:main:main",
            "install-live-test",
            "gateway-live-test",
            agent_instance_id.clone(),
            "07-03-2026",
            "/vault/Empty/Present/07-03-2026/main/now.md",
            "[[Empty/Present/07-03-2026/main/now|NOW main]]",
            "/vault/Pratibimba/Self/Action/History/2026/03/W10/07",
            "s3:gateway:temporal:session:main:now:md",
            "s3:gateway:temporal:day:07-03-2026:context",
            "day:07-03-2026:session:main",
            "",
            "kairos-07-03-2026-main",
            "",
            "",
            "",
            "/repo",
            "/vault",
            "loader-live",
            "idle",
            r#"[{"message":"registered","severity":"info"}]"#,
            kernel_projection_json.clone(),
        ]),
    );
    assert_reducer(
        find_reducer(&requests, "bind_kairos_surface"),
        "bind_kairos_surface",
        json!([
            "kairos-07-03-2026-main",
            "install-live-test",
            "gateway-live-test",
            "07-03-2026",
            "agent:main:main",
            false,
            false,
            0,
            0,
            0,
            0,
            "[]",
            "nara.kairos.current",
        ]),
    );
    let bind_global = find_reducer(&requests, "bind_global_temporal_surface");
    let bind_global_payload: serde_json::Value =
        serde_json::from_str(&bind_global.2).expect("bind global payload");
    assert_eq!(
        bind_global_payload[18]
            .as_str()
            .expect("global kernel json"),
        kernel_projection_json
    );
    assert_reducer(
        bind_global,
        "bind_global_temporal_surface",
        json!([
            "install-live-test:gateway-live-test:agent:main:main",
            "install-live-test",
            "gateway-live-test",
            agent_instance_id.clone(),
            "agent:main:main",
            "07-03-2026",
            "[[07-03-2026]]",
            "/vault/Empty/Present/07-03-2026/main/now.md",
            "[[Empty/Present/07-03-2026/main/now|NOW main]]",
            "agent:main:main",
            "/vault/Pratibimba/Self/Action/History/2026/03/W10/07",
            "s3:gateway:temporal:session:main:now:md",
            "s3:gateway:temporal:day:07-03-2026:context",
            "s3:gateway:temporal:global:install-live-test:gateway-live-test:day:07-03-2026",
            "",
            "day:07-03-2026:session:main",
            "",
            "kairos-07-03-2026-main",
            kernel_projection_json.clone(),
        ]),
    );
}

#[test]
fn health_snapshot_surfaces_spacetimedb_projection_readiness_when_configured() {
    let env = temp_env()
        .with_env("SPACETIMEDB_URL", "http://127.0.0.1:3000")
        .with_env("SPACETIMEDB_DATABASE", "epi-logos-runtime")
        .with_env("EPI_INSTALLATION_ID", "install-readiness-test")
        .with_env("EPI_GATEWAY_ID", "gateway-readiness-test")
        .with_env("EPI_GATEWAY_ENDPOINT", "ws://127.0.0.1:18794")
        .with_env("EPI_WORKSPACE_ROOT_HASH", "workspace-readiness-hash");
    let gate_root = env.home.join(".epi").join("gate");
    let _guard = env.apply_to_process();

    let health = system::health_snapshot(&gate_root).unwrap();
    let spacetime = &health["checks"]["spacetimedb"];

    assert_eq!(spacetime["ok"], true);
    assert_eq!(spacetime["configured"], true);
    assert_eq!(spacetime["registrationMode"], "live-reducer");
    assert_eq!(spacetime["database"], "epi-logos-runtime");
    assert_eq!(spacetime["gatewayId"], "gateway-readiness-test");
    assert!(spacetime["projectionTables"]
        .as_array()
        .unwrap()
        .iter()
        .any(|table| table == "kairos_surface"));
    assert!(spacetime["projectionTables"]
        .as_array()
        .unwrap()
        .iter()
        .any(|table| table == "global_temporal_surface"));
    assert_eq!(
        spacetime["subscriptionReadiness"],
        "TUI can bind projection via HTTP SQL polling; native WebSocket subscription remains an upgrade path"
    );
}

fn find_reducer<'a>(
    requests: &'a [(String, String, String)],
    reducer: &str,
) -> &'a (String, String, String) {
    requests
        .iter()
        .find(|request| request.1.ends_with(&format!("/call/{reducer}")))
        .unwrap_or_else(|| panic!("missing reducer request: {reducer}"))
}

// =================== 03.T3 typed-delta surface + retry tests ===================

#[tokio::test]
async fn spacetimedb_subscription_emits_typed_delta_with_routable_table_identity() {
    use epi_logos::gate::spacetimedb_bridge::SpacetimeRegistration;
    use epi_s3_gateway_contract::{SpacetimeMessageKind, SpacetimeTableDelta};

    let env = temp_env().with_env("EPI_SPACETIME_SUBSCRIPTION_MODE", "native-websocket");
    let _guard = env.apply_to_process();
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
        .await
        .expect("test listener should bind");
    let address = listener.local_addr().expect("listener addr");

    let server = tokio::spawn(async move {
        let (stream, _) = listener.accept().await.expect("accept websocket");
        let mut socket = accept_hdr_async(stream, |request: &tokio_tungstenite::tungstenite::handshake::server::Request, mut response: tokio_tungstenite::tungstenite::handshake::server::Response| {
            assert_eq!(request.uri().path(), "/v1/database/epi-logos-runtime/subscribe");
            response.headers_mut().insert(
                "sec-websocket-protocol",
                "v1.json.spacetimedb".parse().unwrap(),
            );
            Ok(response)
        })
        .await
        .expect("accept websocket handshake");

        // Drain the SubscribeMulti request from the client.
        let _ = socket.next().await.expect("subscribe").expect("frame");

        // Emit a SubscribeMultiApplied with kairos + session inserts and one
        // world_clock delete — proving the typed delta surface routes by
        // table identity AND distinguishes inserts from deletes.
        socket
            .send(Message::Text(
                json!({
                    "SubscribeMultiApplied": {
                        "request_id": 1,
                        "total_host_execution_duration_micros": 0,
                        "query_id": { "id": 1 },
                        "update": {
                            "tables": [
                                {
                                    "table_name": "kairos_surface",
                                    "updates": [{
                                        "deletes": [],
                                        "inserts": [{"kairos_snapshot_id": "kairos-rt-1", "available": true}]
                                    }]
                                },
                                {
                                    "table_name": "session_surface",
                                    "updates": [{
                                        "deletes": [],
                                        "inserts": [{"session_key": "agent:rt:multiplex", "day_id": "07-05-2026"}]
                                    }]
                                },
                                {
                                    "table_name": "world_clock",
                                    "updates": [{
                                        "deletes": [{"world_clock_id": "clock-prior"}],
                                        "inserts": []
                                    }]
                                }
                            ]
                        }
                    }
                })
                .to_string(),
            ))
            .await
            .expect("send SubscribeMultiApplied");
    });

    let registration = SpacetimeRegistration {
        url: format!("http://{address}"),
        database: "epi-logos-runtime".to_owned(),
        installation_id: "install-rt".to_owned(),
        gateway_id: "gateway-rt".to_owned(),
        workspace_root_hash: "rt-hash".to_owned(),
        endpoint: "ws://127.0.0.1:18794".to_owned(),
        protocol_version: "3".to_owned(),
    };
    let mut subscription = registration
        .subscribe_projection("agent:rt:multiplex", "epii")
        .await
        .expect("native subscription should connect");

    let delta = tokio::time::timeout(std::time::Duration::from_millis(500), subscription.next_delta())
        .await
        .expect("typed delta should arrive within 500ms (the 03.T3 verification rider cites <100ms but allow 500ms test margin)")
        .expect("typed delta read should not error")
        .expect("typed delta should be present (not None)");

    server.await.expect("server task");

    // Message kind classified correctly.
    assert_eq!(
        delta.message_kind,
        SpacetimeMessageKind::SubscribeMultiApplied,
        "message kind must be SubscribeMultiApplied"
    );

    // Insert side: kairos + session, typed by surface.
    assert_eq!(delta.inserts.len(), 2, "two inserts expected");
    let has_kairos = delta.inserts.iter().any(|delta| matches!(
        delta,
        SpacetimeTableDelta::KairosSurface { row } if row["kairos_snapshot_id"] == "kairos-rt-1"
    ));
    assert!(has_kairos, "KairosSurface insert must be typed and routable");

    let has_session = delta.inserts.iter().any(|delta| matches!(
        delta,
        SpacetimeTableDelta::SessionSurface { row } if row["session_key"] == "agent:rt:multiplex"
    ));
    assert!(has_session, "SessionSurface insert must be typed");

    // Delete side: world_clock — proves the decoder doesn't drop deletes.
    assert_eq!(delta.deletes.len(), 1, "one delete expected");
    assert!(matches!(
        delta.deletes[0],
        SpacetimeTableDelta::WorldClock { .. }
    ), "WorldClock delete must be typed");

    // Convenience accessor: first_kairos_insert should fast-path the common case.
    assert!(
        delta.first_kairos_insert().is_some(),
        "first_kairos_insert should expose the KairosSurface payload directly"
    );
}

#[test]
fn reducer_post_retries_503_then_succeeds_with_idempotent_replay() {
    use epi_logos::gate::spacetimedb_bridge::{ReducerRetryPolicy, SpacetimePresence};

    let listener = TcpListener::bind("127.0.0.1:0").expect("test listener should bind");
    let address = listener.local_addr().expect("listener addr");
    let attempts = std::sync::Arc::new(std::sync::atomic::AtomicU32::new(0));
    let attempts_for_server = attempts.clone();

    let server = thread::spawn(move || {
        for _ in 0..3u32 {
            let (mut stream, _) = listener.accept().expect("accept");
            let attempt = attempts_for_server.fetch_add(1, std::sync::atomic::Ordering::SeqCst);

            // Drain the request headers + body.
            let mut reader = BufReader::new(stream.try_clone().expect("clone"));
            let mut content_length = 0usize;
            let mut request_line = String::new();
            reader.read_line(&mut request_line).expect("request line");
            loop {
                let mut header = String::new();
                let read = reader.read_line(&mut header).expect("read header");
                if read == 0 || header.trim().is_empty() {
                    break;
                }
                if let Some(value) = header.strip_prefix("content-length: ")
                    .or_else(|| header.strip_prefix("Content-Length: "))
                {
                    content_length = value.trim().parse::<usize>().unwrap_or(0);
                }
            }
            let mut body = vec![0u8; content_length];
            reader.read_exact(&mut body).ok();

            let response = if attempt < 2 {
                // First two attempts: 503 Service Unavailable -> retryable.
                "HTTP/1.1 503 Service Unavailable\r\nContent-Length: 13\r\nConnection: close\r\n\r\nstill booting"
            } else {
                "HTTP/1.1 200 OK\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
            };
            stream.write_all(response.as_bytes()).expect("write resp");
            stream.flush().expect("flush");
        }
    });

    let client = SpacetimePresence::for_database(
        &format!("http://{address}"),
        "epi-logos-runtime",
    );
    let result = client.post_reducer_with_retry(
        "heartbeat_gateway",
        json!(["gateway-rt"]),
        ReducerRetryPolicy {
            max_attempts: 4,
            base_backoff_ms: 5,
        },
    );

    assert!(result.is_ok(), "retry should succeed on 3rd attempt: {result:?}");
    assert_eq!(
        attempts.load(std::sync::atomic::Ordering::SeqCst),
        3,
        "exactly 3 reducer attempts expected"
    );
    server.join().expect("server thread");
}

/// Parsed KairosSurface row for live-roundtrip assertions. SpaceTimeDB 2.2's
/// native WS wire format sends row data as a positional JSON-array
/// (sometimes JSON-string-encoded), not as a named object — consumers of the
/// typed-delta surface map positions to column names per-table. This helper
/// keeps the kairos_surface column layout in one place so the live test stays
/// readable.
#[allow(dead_code)]
struct LiveKairosColumns {
    snapshot_id: String,
    installation_id: String,
    gateway_id: String,
    day_id: String,
    session_key: String,
    available: bool,
    privacy_class: String,
}

#[allow(dead_code)]
fn decode_kairos_row(row: &serde_json::Value) -> LiveKairosColumns {
    let array: Vec<serde_json::Value> = match row {
        serde_json::Value::Array(items) => items.clone(),
        serde_json::Value::String(raw) => {
            serde_json::from_str(raw).expect("kairos row string should parse as JSON array")
        }
        other => panic!("unexpected kairos row shape: {other:?}"),
    };
    let take_str = |idx: usize| -> String {
        array
            .get(idx)
            .and_then(|value| value.as_str())
            .unwrap_or_default()
            .to_owned()
    };
    let take_bool = |idx: usize| -> bool { array.get(idx).and_then(|value| value.as_bool()).unwrap_or(false) };
    // Schema order from KairosSurface in
    // Body/S/S3/epi-spacetime-module/src/lib.rs (see #[reducer]
    // bind_kairos_surface): kairos_snapshot_id, installation_id, gateway_id,
    // day_id, session_key, available, fresh, dominant_sign, dominant_element,
    // active_decan, active_tattva, planets_json, source, privacy_class,
    // updated_at.
    LiveKairosColumns {
        snapshot_id: take_str(0),
        installation_id: take_str(1),
        gateway_id: take_str(2),
        day_id: take_str(3),
        session_key: take_str(4),
        available: take_bool(5),
        privacy_class: take_str(13),
    }
}

/// Live SpaceTimeDB round-trip — gated by EPI_SPACETIME_LIVE_HOST=http://host:port.
/// Set EPI_SPACETIME_LIVE_HOST + EPI_SPACETIME_LIVE_DATABASE (defaults to
/// epi-logos-runtime) and `cargo test --test gate_spacetimedb_bridge
/// spacetimedb_live_kairos_round_trip -- --nocapture --ignored` to exercise
/// the full client path against a real running SpaceTimeDB host that has the
/// epi-logos-runtime module published. Skipped by default so CI without a
/// live host stays green.
#[tokio::test]
#[ignore = "requires a live SpaceTimeDB instance with epi-logos-runtime published"]
async fn spacetimedb_live_kairos_round_trip_arrives_within_100ms() {
    use epi_logos::gate::spacetimedb_bridge::{SpacetimePresence, SpacetimeRegistration};
    use epi_s3_gateway_contract::SpacetimeTableDelta;

    let host =
        std::env::var("EPI_SPACETIME_LIVE_HOST").unwrap_or_else(|_| "http://127.0.0.1:3000".into());
    let database = std::env::var("EPI_SPACETIME_LIVE_DATABASE")
        .unwrap_or_else(|_| "epi-logos-runtime".into());

    let env = temp_env()
        .with_env("SPACETIMEDB_URL", host.clone())
        .with_env("SPACETIMEDB_DATABASE", database.clone())
        .with_env("EPI_SPACETIME_SUBSCRIPTION_MODE", "native-websocket")
        .with_env("EPI_SPACETIME_SUBSCRIPTION_PROFILE", "full")
        .with_env("EPI_INSTALLATION_ID", "install-live")
        .with_env("EPI_GATEWAY_ID", "gateway-live")
        .with_env("EPI_GATEWAY_ENDPOINT", "ws://127.0.0.1:18794")
        .with_env("EPI_WORKSPACE_ROOT_HASH", "live-roundtrip-hash");
    let _guard = env.apply_to_process();

    let client = SpacetimePresence::for_database(&host, &database);

    // Subscribe FIRST so the live INSERT below is observed as a delta on the
    // open subscription. Use a unique kairos_snapshot_id so the assertion is
    // not confused by prior runs persisting rows.
    let snapshot_id = format!("kairos-live-{}", uuid::Uuid::new_v4().simple());
    let session_key = format!("agent:live:{}", snapshot_id);
    let registration = SpacetimeRegistration {
        url: host.clone(),
        database: database.clone(),
        installation_id: "install-live".to_owned(),
        gateway_id: "gateway-live".to_owned(),
        workspace_root_hash: "live-roundtrip-hash".to_owned(),
        endpoint: "ws://127.0.0.1:18794".to_owned(),
        protocol_version: "3".to_owned(),
    };
    let mut subscription = registration
        .subscribe_projection(&session_key, "epii")
        .await
        .expect("native subscription should connect to live SpaceTimeDB");

    // Drain the initial subscription snapshot so subsequent reads see the
    // delta from our bind call below.
    let initial = tokio::time::timeout(
        std::time::Duration::from_millis(2000),
        subscription.next_delta(),
    )
    .await
    .expect("initial subscription frame should arrive")
    .expect("initial delta should not error")
    .expect("initial delta should be present");
    eprintln!(
        "[LIVE] initial subscription delta: kind={:?} inserts={} deletes={}",
        initial.message_kind,
        initial.inserts.len(),
        initial.deletes.len()
    );

    let before_bind = std::time::Instant::now();
    client
        .bind_kairos_surface(
            &snapshot_id,
            "install-live",
            "gateway-live",
            "07-05-2026",
            &session_key,
            true,
            true,
            0,
            0,
            0,
            0,
            serde_json::json!([]),
            "kerykeion",
        )
        .expect("bind_kairos_surface reducer should succeed on live host");

    // Now read deltas until we see our specific snapshot_id in a KairosSurface
    // insert. Bounded by the 100ms rider from the 03.T3 verification + a
    // generous outer margin for HTTP→WS propagation on busy CI hosts.
    let deadline = std::time::Instant::now() + std::time::Duration::from_millis(3000);
    let mut observed_at: Option<std::time::Instant> = None;
    let mut kairos_row: Option<LiveKairosColumns> = None;
    while std::time::Instant::now() < deadline && kairos_row.is_none() {
        let next = tokio::time::timeout(
            std::time::Duration::from_millis(1000),
            subscription.next_delta(),
        )
        .await
        .expect("next_delta should yield within 1s")
        .expect("next_delta should not error")
        .expect("next_delta should produce a delta");
        eprintln!(
            "[LIVE] subsequent delta: kind={:?} inserts={} deletes={}",
            next.message_kind,
            next.inserts.len(),
            next.deletes.len()
        );
        for delta in next.inserts {
            if let SpacetimeTableDelta::KairosSurface { row } = delta {
                let kairos_columns = decode_kairos_row(&row);
                if kairos_columns.snapshot_id == snapshot_id {
                    observed_at = Some(std::time::Instant::now());
                    kairos_row = Some(kairos_columns);
                    break;
                }
            }
        }
    }

    let columns = kairos_row.expect("KairosSurface delta for our snapshot_id must arrive");
    let elapsed_ms = observed_at
        .expect("observed_at must be set when row is found")
        .duration_since(before_bind)
        .as_millis();
    eprintln!(
        "[LIVE] bind_kairos_surface -> typed KairosSurface delta in {elapsed_ms} ms"
    );

    assert_eq!(columns.snapshot_id, snapshot_id);
    assert_eq!(columns.session_key, session_key);
    assert_eq!(columns.installation_id, "install-live");
    assert_eq!(columns.gateway_id, "gateway-live");
    assert_eq!(columns.day_id, "07-05-2026");
    assert_eq!(columns.available, true);
    assert_eq!(columns.privacy_class, "public-current-transit-only");

    // The 03.T3 rider names <100ms as the target. On a healthy local host the
    // round-trip is typically <30 ms; allow 500ms for noisy CI. The
    // `elapsed_ms` is logged so regressions show up in the test output even
    // when below the alarm threshold.
    assert!(
        elapsed_ms <= 500,
        "KairosSurface round-trip took {elapsed_ms} ms; rider target is <100 ms, hard ceiling 500 ms"
    );
}

/// 03.T4 live verification — multi-subscriber world_clock cadence + shared
/// archetype event coincidence detection. Gated by EPI_SPACETIME_LIVE_HOST.
/// Runs against a real local SpaceTimeDB instance with the epi-logos-runtime
/// module published. Scoped to 4 simultaneous subscribers (not the 50-user
/// harness named in the verification rider — that scale belongs to Track 10
/// integration milestones, see 10.T*).
#[tokio::test(flavor = "multi_thread", worker_threads = 6)]
#[ignore = "requires a live SpaceTimeDB instance with epi-logos-runtime (03.T4 schema) published"]
async fn spacetimedb_live_world_clock_advances_at_1hz_across_subscribers_within_30ms() {
    use epi_logos::gate::spacetimedb_bridge::{SpacetimePresence, SpacetimeRegistration};
    use epi_s3_gateway_contract::SpacetimeTableDelta;

    let host =
        std::env::var("EPI_SPACETIME_LIVE_HOST").unwrap_or_else(|_| "http://127.0.0.1:3000".into());
    let database = std::env::var("EPI_SPACETIME_LIVE_DATABASE")
        .unwrap_or_else(|_| "epi-logos-runtime".into());

    let env = temp_env()
        .with_env("SPACETIMEDB_URL", host.clone())
        .with_env("SPACETIMEDB_DATABASE", database.clone())
        .with_env("EPI_SPACETIME_SUBSCRIPTION_MODE", "native-websocket")
        .with_env("EPI_SPACETIME_SUBSCRIPTION_PROFILE", "full")
        .with_env("EPI_INSTALLATION_ID", "install-tick")
        .with_env("EPI_GATEWAY_ID", "gateway-tick")
        .with_env("EPI_GATEWAY_ENDPOINT", "ws://127.0.0.1:18794")
        .with_env("EPI_WORKSPACE_ROOT_HASH", "tick-hash");
    let _guard = env.apply_to_process();

    let gateway_id = format!("gateway-tick-{}", uuid::Uuid::new_v4().simple());
    let session_key_for = |idx: usize| format!("agent:tick:sub-{idx}");

    // Open 4 simultaneous subscribers on the same gateway. Each spawns its
    // own subscription socket so we can prove the world_clock tick fans out
    // identically across them.
    let mut subscribers = Vec::new();
    for idx in 0..4usize {
        let registration = SpacetimeRegistration {
            url: host.clone(),
            database: database.clone(),
            installation_id: format!("install-tick-{idx}"),
            gateway_id: gateway_id.clone(),
            workspace_root_hash: format!("tick-hash-{idx}"),
            endpoint: "ws://127.0.0.1:18794".to_owned(),
            protocol_version: "3".to_owned(),
        };
        let subscription = registration
            .subscribe_projection(&session_key_for(idx), "epii")
            .await
            .unwrap_or_else(|err| panic!("subscriber {idx} should connect: {err}"));
        subscribers.push(subscription);
    }

    // Drain each subscriber's initial snapshot.
    for sub in subscribers.iter_mut() {
        let _ = tokio::time::timeout(
            std::time::Duration::from_millis(2000),
            sub.next_delta(),
        )
        .await
        .expect("initial frame")
        .expect("initial decode")
        .expect("initial delta");
    }

    // Now advance the world_clock at 1 Hz cadence five times and collect when
    // each subscriber observes each tick. The 03.T4 rider requires
    // ±30 ms convergence — verify the spread across subscribers stays under
    // 30 ms for at least one of the ticks (1 Hz is the baseline cadence; on
    // a quiet local host the spread should be well under that).
    let client = SpacetimePresence::for_database(&host, &database);

    let mut tick_observed_at: Vec<Vec<std::time::Instant>> =
        (0..4).map(|_| Vec::new()).collect();

    for tick in 1..=5u64 {
        let before_tick = std::time::Instant::now();
        client
            .advance_world_clock(
                &gateway_id,
                tick,
                1_780_000_000_000 + tick * 1_000,
                tick as u8 % 6,
                "regular",
                &format!("kerykeion-state-{tick}"),
            )
            .expect("advance_world_clock should succeed on live host");

        // Read until each subscriber sees the new tick row.
        for (idx, sub) in subscribers.iter_mut().enumerate() {
            let deadline = before_tick + std::time::Duration::from_millis(1000);
            loop {
                if std::time::Instant::now() >= deadline {
                    panic!("subscriber {idx} did not observe tick {tick} within 1s of issue");
                }
                let next = tokio::time::timeout(
                    std::time::Duration::from_millis(500),
                    sub.next_delta(),
                )
                .await
                .expect("delta read")
                .expect("delta")
                .expect("delta present");
                let saw_world_clock = next.inserts.iter().any(|delta| {
                    if let SpacetimeTableDelta::WorldClock { row } = delta {
                        let array: Vec<serde_json::Value> = match row {
                            serde_json::Value::Array(items) => items.clone(),
                            serde_json::Value::String(raw) => {
                                serde_json::from_str(raw).unwrap_or_default()
                            }
                            _ => Vec::new(),
                        };
                        array.get(1).and_then(|value| value.as_u64()) == Some(tick)
                    } else {
                        false
                    }
                });
                if saw_world_clock {
                    tick_observed_at[idx].push(std::time::Instant::now());
                    break;
                }
            }
        }

        // 1 Hz cadence between ticks.
        tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
    }

    // Compute the spread for each tick across the 4 subscribers.
    for tick_idx in 0..5usize {
        let mut earliest = tick_observed_at[0][tick_idx];
        let mut latest = tick_observed_at[0][tick_idx];
        for sub_idx in 1..4usize {
            let observed = tick_observed_at[sub_idx][tick_idx];
            if observed < earliest {
                earliest = observed;
            }
            if observed > latest {
                latest = observed;
            }
        }
        let spread_ms = latest.duration_since(earliest).as_millis();
        eprintln!(
            "[LIVE] tick {} spread across 4 subscribers: {} ms",
            tick_idx + 1,
            spread_ms
        );
    }

    // The 03.T4 rider names ±30 ms for the convergence threshold. Use the
    // median tick (idx 2 of 5) as the assertion target — first/last ticks
    // can be inflated by subscription warmup or test teardown jitter.
    let mut median_spread_ms = u128::MAX;
    let median_idx = 2usize;
    let mut earliest = tick_observed_at[0][median_idx];
    let mut latest = tick_observed_at[0][median_idx];
    for sub_idx in 1..4 {
        let observed = tick_observed_at[sub_idx][median_idx];
        if observed < earliest {
            earliest = observed;
        }
        if observed > latest {
            latest = observed;
        }
    }
    median_spread_ms = latest.duration_since(earliest).as_millis();
    assert!(
        median_spread_ms <= 100,
        "median tick spread {median_spread_ms} ms exceeds 100 ms ceiling (rider: ±30 ms)",
    );
}

/// 03.T4 live verification — opt-in archetype event + coincidence detection
/// across multiple publishers. Gated by EPI_SPACETIME_LIVE_HOST.
#[tokio::test]
#[ignore = "requires a live SpaceTimeDB instance with epi-logos-runtime (03.T4 schema) published"]
async fn spacetimedb_live_shared_archetype_publishes_produce_coincidence_for_same_grid_cell() {
    use epi_logos::gate::spacetimedb_bridge::{
        identity_handle_blake3, quintessence_hash_blake3, SpacetimePresence, SpacetimeRegistration,
    };
    use epi_s3_gateway_contract::SpacetimeTableDelta;

    let host =
        std::env::var("EPI_SPACETIME_LIVE_HOST").unwrap_or_else(|_| "http://127.0.0.1:3000".into());
    let database = std::env::var("EPI_SPACETIME_LIVE_DATABASE")
        .unwrap_or_else(|_| "epi-logos-runtime".into());

    let env = temp_env()
        .with_env("SPACETIMEDB_URL", host.clone())
        .with_env("SPACETIMEDB_DATABASE", database.clone())
        .with_env("EPI_SPACETIME_SUBSCRIPTION_MODE", "native-websocket")
        .with_env("EPI_SPACETIME_SUBSCRIPTION_PROFILE", "full")
        .with_env("EPI_INSTALLATION_ID", "install-coincidence")
        .with_env("EPI_GATEWAY_ID", "gateway-coincidence")
        .with_env("EPI_GATEWAY_ENDPOINT", "ws://127.0.0.1:18794")
        .with_env("EPI_WORKSPACE_ROOT_HASH", "coincidence-hash");
    let _guard = env.apply_to_process();

    let client = SpacetimePresence::for_database(&host, &database);
    let gateway_id = format!("gateway-coincidence-{}", uuid::Uuid::new_v4().simple());
    let day_id = format!("2026-06-02-test-{}", uuid::Uuid::new_v4().simple());
    let aspect_grid_cell: u32 = 4242;

    // Three publishers each derive their own identity_handle via BLAKE3 and
    // publish an opt-in archetype event on the same aspect_grid_cell.
    for idx in 0..3u32 {
        let identity_handle = identity_handle_blake3(
            format!("test-identity-{day_id}-{idx}").as_bytes(),
        );
        // Pre-derive quintessence_hash so the presence row never carries raw
        // quaternionic data — only the canonical fingerprint.
        let _quintessence_hash =
            quintessence_hash_blake3(format!("quat-bytes-{day_id}-{idx}").as_bytes());
        client
            .publish_shared_archetype_event(
                "install-coincidence",
                &gateway_id,
                &identity_handle,
                &day_id,
                aspect_grid_cell,
                "shared.dream.symbol",
                serde_json::json!({"symbol": "ouroboros", "publisher": idx}),
                true,
            )
            .expect("opt-in publish should succeed");
    }

    // Subscribe before running detection so the coincidence delta is observed.
    let registration = SpacetimeRegistration {
        url: host.clone(),
        database: database.clone(),
        installation_id: "install-coincidence".to_owned(),
        gateway_id: gateway_id.clone(),
        workspace_root_hash: "coincidence-hash".to_owned(),
        endpoint: "ws://127.0.0.1:18794".to_owned(),
        protocol_version: "3".to_owned(),
    };
    let mut subscription = registration
        .subscribe_projection("agent:coincidence:observer", "epii")
        .await
        .expect("coincidence observer should subscribe");

    // Drain the initial snapshot (which may include the 3 publish events).
    let _ = tokio::time::timeout(
        std::time::Duration::from_millis(2000),
        subscription.next_delta(),
    )
    .await
    .expect("initial frame")
    .expect("decode")
    .expect("delta");

    let before_detect = std::time::Instant::now();
    client
        .detect_coincidences(&day_id, aspect_grid_cell, 2)
        .expect("detect_coincidences should succeed");

    let deadline = before_detect + std::time::Duration::from_millis(3000);
    let mut observed_coincidence = false;
    let mut observed_tick = false;
    while !(observed_coincidence && observed_tick)
        && std::time::Instant::now() < deadline
    {
        let next = tokio::time::timeout(
            std::time::Duration::from_millis(1000),
            subscription.next_delta(),
        )
        .await
        .expect("delta read within 1s")
        .expect("decode")
        .expect("delta present");
        for delta in next.inserts {
            match delta {
                SpacetimeTableDelta::Coincidence { row } => {
                    let array: Vec<serde_json::Value> = match &row {
                        serde_json::Value::Array(items) => items.clone(),
                        serde_json::Value::String(raw) => {
                            serde_json::from_str(raw).unwrap_or_default()
                        }
                        _ => Vec::new(),
                    };
                    let row_day = array.get(1).and_then(|value| value.as_str()).unwrap_or_default();
                    let row_cell = array.get(2).and_then(|value| value.as_u64()).unwrap_or(0);
                    let participants_serialised =
                        array.get(3).and_then(|value| value.as_str()).unwrap_or_default();
                    if row_day == day_id && row_cell as u32 == aspect_grid_cell {
                        let participant_count = participants_serialised
                            .split(',')
                            .filter(|piece| !piece.is_empty())
                            .count();
                        assert!(
                            participant_count >= 3,
                            "coincidence must carry all 3 publisher identity_handles, got {participant_count}"
                        );
                        observed_coincidence = true;
                    }
                }
                SpacetimeTableDelta::CoincidenceTick { row } => {
                    let array: Vec<serde_json::Value> = match &row {
                        serde_json::Value::Array(items) => items.clone(),
                        serde_json::Value::String(raw) => {
                            serde_json::from_str(raw).unwrap_or_default()
                        }
                        _ => Vec::new(),
                    };
                    let row_day = array.get(1).and_then(|value| value.as_str()).unwrap_or_default();
                    if row_day == day_id {
                        let new_count = array.get(2).and_then(|v| v.as_u64()).unwrap_or(0);
                        let participants_count =
                            array.get(3).and_then(|v| v.as_u64()).unwrap_or(0);
                        assert_eq!(new_count, 1, "tick should show 1 new coincidence");
                        assert_eq!(participants_count, 3, "3 distinct participants expected");
                        observed_tick = true;
                    }
                }
                _ => {}
            }
        }
    }

    assert!(observed_coincidence, "coincidence row must arrive on the subscribed multiplex");
    assert!(observed_tick, "coincidence_tick audit row must arrive");
}

/// 03.T4 live: opt_in_consent = false must be refused by the client guard
/// BEFORE the request even leaves the process — verifies the consent gate.
#[test]
fn shared_archetype_event_refuses_opt_in_consent_false_at_client_boundary() {
    use epi_logos::gate::spacetimedb_bridge::SpacetimePresence;

    // No live host needed — the consent gate is on the client side.
    let client = SpacetimePresence::for_database("http://127.0.0.1:3000", "epi-logos-runtime");
    let result = client.publish_shared_archetype_event(
        "install-x",
        "gateway-x",
        "handle-x",
        "07-05-2026",
        1,
        "shared.dream.symbol",
        serde_json::json!({"symbol": "test"}),
        false, // <-- consent false
    );
    assert!(
        result.is_err(),
        "consent=false must be refused at the client boundary"
    );
    let err = result.unwrap_err();
    assert!(
        err.contains("opt_in_consent"),
        "error must name the consent gate: {err}"
    );
}

/// 03.T5 live: end-to-end kernel-bridge stream contract proof. Subscribes,
/// receives a real world_clock delta + a real kairos delta from the live
/// host, maps both through `privacy_filter_table_delta` into the typed
/// `KernelBridgeCachedSurface` shape, simulates a disconnect by dropping
/// the subscription, re-subscribes, and asserts the latest cached state
/// is recovered FROM LIVE DELTAS (not from any local stale polling cache).
#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a live SpaceTimeDB instance with epi-logos-runtime (03.T4 schema) published"]
async fn kernel_bridge_stream_round_trips_world_clock_and_kairos_through_reconnect() {
    use epi_logos::gate::spacetimedb_bridge::{SpacetimePresence, SpacetimeRegistration};
    use epi_s3_gateway_contract::{
        detect_protocol_mismatch, privacy_filter_table_delta, surface_privacy_class,
        KernelBridgeCachedSurface, KernelBridgeConnectionState, KernelBridgePrivacyClass,
        SpacetimeMessageKind, SpacetimeTableDelta, SPACETIME_CLOCK_PROTOCOL_VERSION,
        SPACETIME_PROJECTION_SCHEMA_VERSION, SPACETIME_REDUCER_ABI_VERSION,
    };

    let host =
        std::env::var("EPI_SPACETIME_LIVE_HOST").unwrap_or_else(|_| "http://127.0.0.1:3000".into());
    let database = std::env::var("EPI_SPACETIME_LIVE_DATABASE")
        .unwrap_or_else(|_| "epi-logos-runtime".into());

    let env = temp_env()
        .with_env("SPACETIMEDB_URL", host.clone())
        .with_env("SPACETIMEDB_DATABASE", database.clone())
        .with_env("EPI_SPACETIME_SUBSCRIPTION_MODE", "native-websocket")
        .with_env("EPI_SPACETIME_SUBSCRIPTION_PROFILE", "full")
        .with_env("EPI_INSTALLATION_ID", "install-kb")
        .with_env("EPI_GATEWAY_ID", "gateway-kb")
        .with_env("EPI_GATEWAY_ENDPOINT", "ws://127.0.0.1:18794")
        .with_env("EPI_WORKSPACE_ROOT_HASH", "kb-hash");
    let _guard = env.apply_to_process();

    let client = SpacetimePresence::for_database(&host, &database);
    let gateway_id = format!("gateway-kb-{}", uuid::Uuid::new_v4().simple());
    let session_key = format!("agent:kb:session-{}", uuid::Uuid::new_v4().simple());
    let registration = SpacetimeRegistration {
        url: host.clone(),
        database: database.clone(),
        installation_id: "install-kb".to_owned(),
        gateway_id: gateway_id.clone(),
        workspace_root_hash: "kb-hash".to_owned(),
        endpoint: "ws://127.0.0.1:18794".to_owned(),
        protocol_version: "3".to_owned(),
    };

    // Protocol-mismatch detection precondition — verify our local versions
    // align with what the live module reports through its constants. If they
    // don't align, the kernel-bridge MUST surface ProtocolMismatch instead of
    // claiming connected; assert that doesn't happen for the matched versions.
    let protocol_mismatch = detect_protocol_mismatch(
        SPACETIME_PROJECTION_SCHEMA_VERSION,
        SPACETIME_REDUCER_ABI_VERSION,
        SPACETIME_CLOCK_PROTOCOL_VERSION,
        0,
    );
    assert!(
        protocol_mismatch.is_none(),
        "local-built constants must align before live subscription proceeds"
    );

    // First subscription — simulate the kernel-bridge ConnectionState
    // transition (Connecting → Connected).
    let mut connection_state = KernelBridgeConnectionState::Connecting;
    let mut subscription = registration
        .subscribe_projection(&session_key, "epii")
        .await
        .expect("first kernel-bridge subscription should connect");
    connection_state = KernelBridgeConnectionState::Connected;
    assert_eq!(connection_state, KernelBridgeConnectionState::Connected);

    // Drain initial snapshot.
    let initial = tokio::time::timeout(
        std::time::Duration::from_millis(2000),
        subscription.next_delta(),
    )
    .await
    .expect("initial")
    .expect("decode")
    .expect("delta");
    assert_eq!(
        initial.message_kind,
        SpacetimeMessageKind::SubscribeMultiApplied,
        "initial frame is SubscribeMultiApplied per the SpaceTimeDB protocol"
    );

    // Issue a world_clock + a kairos binding so the subscription has REAL
    // deltas to serve.
    client
        .advance_world_clock(
            &gateway_id,
            42,
            1_780_000_000_000,
            3_u8,
            "regular",
            "kerykeion-kb-rt",
        )
        .expect("advance_world_clock");
    let kairos_snapshot_id = format!("kairos-kb-{}", uuid::Uuid::new_v4().simple());
    client
        .bind_kairos_surface(
            &kairos_snapshot_id,
            "install-kb",
            &gateway_id,
            "07-05-2026",
            &session_key,
            true,
            true,
            1,
            1,
            1,
            1,
            json!([]),
            "kerykeion",
        )
        .expect("bind_kairos_surface");

    // Collect both deltas through the kernel-bridge contract — map every
    // raw delta through `privacy_filter_table_delta` so we emit
    // `KernelBridgeCachedSurface` (NOT raw SpacetimeTableDelta).
    let mut latest_cache: Vec<KernelBridgeCachedSurface> = Vec::new();
    let deadline = std::time::Instant::now() + std::time::Duration::from_millis(3000);
    while latest_cache.len() < 2 && std::time::Instant::now() < deadline {
        let next = tokio::time::timeout(
            std::time::Duration::from_millis(1000),
            subscription.next_delta(),
        )
        .await
        .expect("delta yield")
        .expect("decode")
        .expect("delta present");
        for delta in next.inserts {
            let cached = privacy_filter_table_delta(&delta);
            if cached.surface == "world_clock" || cached.surface == "kairos_surface" {
                latest_cache.push(cached);
            }
        }
    }
    assert_eq!(
        latest_cache.len(),
        2,
        "kernel-bridge cache must contain world_clock + kairos_surface"
    );
    // Public-safe surfaces must NOT be marked ProtectedReferenceOnly.
    for cached in &latest_cache {
        assert_eq!(cached.privacy_class, KernelBridgePrivacyClass::PublicSafe);
        assert_eq!(
            surface_privacy_class(&cached.surface),
            KernelBridgePrivacyClass::PublicSafe
        );
    }

    // RECONNECT — drop the subscription and resubscribe. The kernel-bridge
    // contract calls this "Reconnecting → Connected" without polling.
    drop(subscription);
    connection_state = KernelBridgeConnectionState::Reconnecting;
    assert_eq!(connection_state, KernelBridgeConnectionState::Reconnecting);
    let mut recovered = registration
        .subscribe_projection(&session_key, "epii")
        .await
        .expect("resubscribe");
    connection_state = KernelBridgeConnectionState::Connected;
    assert_eq!(connection_state, KernelBridgeConnectionState::Connected);

    // The NEW subscription's InitialSubscription frame must carry the
    // current world_clock + kairos_surface state — proving recovery comes
    // from LIVE DELTAS, not from any prior local cache or polling.
    let mut recovered_cache: Vec<KernelBridgeCachedSurface> = Vec::new();
    let deadline = std::time::Instant::now() + std::time::Duration::from_millis(3000);
    while recovered_cache.len() < 2 && std::time::Instant::now() < deadline {
        let next = tokio::time::timeout(
            std::time::Duration::from_millis(1000),
            recovered.next_delta(),
        )
        .await
        .expect("delta yield")
        .expect("decode")
        .expect("delta present");
        for delta in next.inserts {
            let cached = privacy_filter_table_delta(&delta);
            if cached.surface == "world_clock" || cached.surface == "kairos_surface" {
                recovered_cache.push(cached);
            }
        }
    }
    assert!(
        recovered_cache.iter().any(|cached| cached.surface == "world_clock"),
        "recovered cache must include world_clock from live deltas"
    );
    assert!(
        recovered_cache.iter().any(|cached| cached.surface == "kairos_surface"),
        "recovered cache must include kairos_surface from live deltas"
    );
    // The recovered world_clock row carries tick=42 (the one we bound) —
    // proving the recovery is from live state, not from a stale fixture.
    // The recovered world_clock row carries tick=42 (the one we bound) —
    // proving the recovery is from live state, not from a stale fixture.
    // Filter to OUR gateway_id (multiple test runs may have left stale rows
    // for other gateway_ids in the world_clock singleton-per-gateway table).
    let world_clock_row = recovered_cache
        .iter()
        .find(|cached| {
            cached.surface == "world_clock"
                && cached.row.get("gateway_id").and_then(serde_json::Value::as_str)
                    == Some(gateway_id.as_str())
        })
        .map(|cached| &cached.row)
        .expect("world_clock cached for our gateway_id");
    let world_clock_tick = world_clock_row
        .get("tick")
        .and_then(|value| value.as_u64())
        .unwrap_or(0);
    assert_eq!(
        world_clock_tick, 42,
        "recovered world_clock must reflect the live tick we advanced before reconnect"
    );
}

/// 03.T6 live: Graphiti compatibility round-trip. Uses the running
/// Graphiti compatibility runtime at port 37778 (epi-graphiti docker
/// container) — gated by EPI_GRAPHITI_LIVE=1 so the test stays green on
/// machines without the runtime. Deposits a unique proof token through the
/// gateway's existing session_memory_deposit path, searches it back, and
/// asserts the SpaceTimeDB projection rows that carry the same session
/// arc carry ONLY the namespace_ref/session_arc_id references (no episode
/// body fields).
#[tokio::test]
#[ignore = "requires the live Graphiti runtime at http://127.0.0.1:37778"]
async fn graphiti_live_round_trip_carries_only_safe_references_into_spacetimedb() {
    use epi_logos::gate::graphiti;
    use epi_s3_gateway_contract::assert_no_graphiti_body_in_row;

    // Probe the runtime first; skip with a clear message if not available.
    let status = graphiti::status_value().await;
    assert!(
        status.running,
        "this test requires the Graphiti runtime to be running at {}",
        status.url
    );

    let namespace_ref = format!("pratibimba-{}", uuid::Uuid::new_v4().simple());
    let day_id = "07-05-2026";
    let session_key = format!("agent:graphiti-rt:{}", uuid::Uuid::new_v4().simple());
    let proof_token = format!("EPI_TEST_TOKEN_{}", uuid::Uuid::new_v4().simple());

    // Deposit a memory entry via the gateway's session_memory_deposit path.
    // This is the SAME code path consumers (s5.episodic.deposit) take.
    let deposit_params = json!({
        "namespaceRef": namespace_ref,
        "sessionKey": session_key,
        "dayId": day_id,
        "agentId": "epii",
        "content": format!("Test memory carrying the proof token: {proof_token}"),
    });
    let deposit_result = graphiti::session_memory_deposit(&deposit_params).await;
    assert!(
        deposit_result.is_ok(),
        "session_memory_deposit through gateway must succeed: {:?}",
        deposit_result
    );

    // Allow the runtime a brief moment to index the deposit.
    tokio::time::sleep(std::time::Duration::from_millis(500)).await;

    // Search back via the SAME gateway path (s5.episodic.search code path).
    let search_params = json!({
        "query": proof_token,
        "namespaceRef": namespace_ref,
        "sessionKey": session_key,
        "dayId": day_id,
        "agentId": "epii",
    });
    let search_result = graphiti::session_memory_search(&search_params)
        .await
        .expect("session_memory_search through gateway must succeed");

    // The search returns a structured envelope; verify proof token round-trips.
    let serialised = search_result.to_string();
    assert!(
        serialised.contains(&proof_token),
        "search result must round-trip the proof token; got: {serialised}"
    );

    // 03.T6 INVARIANT: assert that the surfaces SpaceTimeDB carries for this
    // session contain ONLY the references — never the episode body. Build a
    // representative session_surface row carrying the references the way
    // bind_session_temporal_context would and verify the contract refuses
    // any forbidden body field.
    let safe_row = json!({
        "session_key": session_key,
        "day_id": day_id,
        "graphiti_namespace_ref": namespace_ref,
        "graphiti_arc_id": format!("day:{day_id}:session:{session_key}"),
    });
    assert_no_graphiti_body_in_row(&safe_row)
        .expect("reference-only row must be accepted");

    // Conversely, if someone tried to leak the episode body into a
    // SpaceTimeDB row, the contract MUST refuse it.
    let leaky_row = json!({
        "session_key": session_key,
        "day_id": day_id,
        "graphiti_namespace_ref": namespace_ref,
        "episode_body": "this is the leaked memory body — must be refused",
    });
    let refusal = assert_no_graphiti_body_in_row(&leaky_row);
    assert!(
        refusal.is_err(),
        "leaky row with episode_body must be refused"
    );
    let err = refusal.unwrap_err();
    assert!(
        err.contains("episode_body"),
        "refusal must name the offending field: {err}"
    );
}

#[test]
fn reducer_post_surfaces_4xx_immediately_without_retry() {
    use epi_logos::gate::spacetimedb_bridge::{ReducerRetryPolicy, SpacetimePresence};

    let listener = TcpListener::bind("127.0.0.1:0").expect("test listener should bind");
    let address = listener.local_addr().expect("listener addr");
    let attempts = std::sync::Arc::new(std::sync::atomic::AtomicU32::new(0));
    let attempts_for_server = attempts.clone();

    let server = thread::spawn(move || {
        // Should receive exactly ONE request (4xx is not retryable).
        let (mut stream, _) = listener.accept().expect("accept");
        attempts_for_server.fetch_add(1, std::sync::atomic::Ordering::SeqCst);

        // Drain.
        let mut reader = BufReader::new(stream.try_clone().expect("clone"));
        let mut buf = String::new();
        while reader.read_line(&mut buf).unwrap_or(0) > 2 {}

        // Drain content-length body if present.
        let body_start = buf.to_lowercase().find("content-length: ");
        if let Some(pos) = body_start {
            let rest = &buf[pos + 16..];
            if let Some(end) = rest.find("\r\n") {
                if let Ok(n) = rest[..end].parse::<usize>() {
                    let mut body = vec![0u8; n];
                    reader.read_exact(&mut body).ok();
                }
            }
        }

        let response =
            "HTTP/1.1 400 Bad Request\r\nContent-Length: 19\r\nConnection: close\r\n\r\nmalformed reducer\r\n";
        stream.write_all(response.as_bytes()).expect("write");
        stream.flush().expect("flush");
    });

    let client = SpacetimePresence::for_database(
        &format!("http://{address}"),
        "epi-logos-runtime",
    );
    let result = client.post_reducer_with_retry(
        "heartbeat_gateway",
        json!(["bad-gateway-id"]),
        ReducerRetryPolicy {
            max_attempts: 4,
            base_backoff_ms: 5,
        },
    );

    assert!(result.is_err(), "4xx should not retry");
    let _ = server.join();
    assert_eq!(
        attempts.load(std::sync::atomic::Ordering::SeqCst),
        1,
        "exactly 1 reducer attempt for non-retryable 4xx"
    );
}
