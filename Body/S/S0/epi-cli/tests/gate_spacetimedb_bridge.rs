mod support;

use std::io::{BufRead, BufReader, Read, Write};
use std::net::TcpListener;
use std::sync::mpsc;
use std::thread;

use epi_logos::gate::{
    sessions::SessionStore,
    spacetimedb_bridge::{SpacetimeBridge, SpacetimePresence, SpacetimeRegistration},
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
            && event.payload["pratibimba"]["coordinate"] == "M4.4.4.4"
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
        ]),
    );
}

#[test]
fn spacetimedb_projection_query_hydrates_gateway_temporal_context_shape() {
    let listener = TcpListener::bind("127.0.0.1:0").expect("test listener should bind");
    let address = listener.local_addr().expect("listener addr");
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
    assert_eq!(context["pratibimba"]["anchorId"], "pratibimba-abcd1234");
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
        .with_env("EPI_SPACETIME_SUBSCRIPTION_MODE", "native-websocket");
    let gate_root = env.home.join(".epi").join("gate");
    let _guard = env.apply_to_process();

    let registration = SpacetimeRegistration::from_env(18794, &gate_root)
        .unwrap()
        .expect("registration should be configured");
    let plan = registration.subscription_plan("agent:main:main", "epii");
    let readiness = registration.readiness_value();

    assert_eq!(plan.mode, "native-websocket");
    assert_eq!(plan.endpoint, "ws://127.0.0.1:3000");
    assert_eq!(plan.database, "epi-logos-runtime");
    assert_eq!(plan.session_key, "agent:main:main");
    assert_eq!(plan.agent_id, "epii");
    assert_eq!(plan.coordinate_owner, "S3'");
    assert_eq!(plan.agent_access_owner, "S4/S5");
    assert_eq!(
        plan.tables,
        vec![
            "gateway_instance",
            "agent_instance",
            "client_registration",
            "session_surface",
            "kairos_surface",
            "global_temporal_surface",
            "temporal_event"
        ]
    );
    assert_eq!(plan.sql_fallback_mode, "http-sql-poll");

    assert_eq!(readiness["subscriptionMode"], "native-websocket");
    assert_eq!(readiness["nativeSubscriptionReady"], true);
    assert_eq!(
        readiness["projectionSubscriptionPlan"]["endpoint"],
        "ws://127.0.0.1:3000"
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
        7
    );
}

#[tokio::test]
async fn spacetimedb_native_subscription_hydrates_gateway_temporal_context_shape() {
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
    let context = subscription
        .next_context()
        .await
        .expect("subscription update should decode")
        .expect("context should hydrate");

    server.await.expect("server task");
    assert_eq!(
        context["spacetimedb"]["projectionSource"],
        "native-websocket"
    );
    assert_eq!(context["spacetimedb"]["projectionTable"], "session_surface");
    assert_eq!(context["session"]["sessionId"], "session-main");
    assert_eq!(context["kairos"]["activeDecan"], 17);
    assert_eq!(context["pratibimba"]["anchorId"], "pratibimba-abcd1234");
    assert_eq!(
        context["globalTemporal"]["projectionTable"],
        "global_temporal_surface"
    );
    assert_eq!(
        context["globalTemporal"]["graphitiSessionArcId"],
        "day:07-05-2026:session:session-main"
    );
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
    assert_reducer(
        find_reducer(&requests, "bind_session_temporal_context"),
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
    assert_reducer(
        find_reducer(&requests, "bind_global_temporal_surface"),
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
