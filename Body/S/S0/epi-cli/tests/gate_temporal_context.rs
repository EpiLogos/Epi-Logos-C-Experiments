mod support;

use std::fs;

use epi_logos::gate::sessions::{SessionPatch, SessionStore};
use redis::AsyncCommands;
use serde_json::json;
use support::{spawn_epi, temp_env, TestEnv, TestGatewayClient};

fn env_with_now_file() -> (TestEnv, String, String) {
    let env = temp_env().with_env("EPILOGOS_VAULT", temp_env_placeholder_vault_marker());
    let vault = env.repo_root.join("Idea");
    let day_id = "07-05-2026".to_string();
    let session_id = "session-temporal-main".to_string();
    let now_path = vault
        .join("Empty")
        .join("Present")
        .join(&day_id)
        .join(&session_id)
        .join("now.md");
    fs::create_dir_all(now_path.parent().unwrap()).unwrap();
    fs::write(
        &now_path,
        "# NOW\n\nTemporal anchor for [[07-05-2026]] and [[Chronos]].\n",
    )
    .unwrap();
    write_nara_temporal_identity(&env);

    let env = env.with_env("EPILOGOS_VAULT", vault.display().to_string());
    let gate_root = env.home.join(".epi").join("gate");
    let store = SessionStore::new(&gate_root).unwrap();
    let record = store.create("agent:main:main").unwrap();
    store
        .patch(
            &record.canonical_key,
            SessionPatch {
                aliases: Some(vec![format!("NOW-{day_id}-{session_id}")]),
                vault_now_path: Some(Some(now_path.display().to_string())),
                channel: Some(Some("cli_direct".to_string())),
                active_agent_id: Some("anima".to_string()),
                ..Default::default()
            },
        )
        .unwrap();

    (env, day_id, session_id)
}

fn temp_env_placeholder_vault_marker() -> &'static str {
    "__set_after_repo_root_exists__"
}

#[test]
fn cli_temporal_context_resolves_day_now_history_and_agent_orientation() {
    let (env, day_id, session_id) = env_with_now_file();
    let process = spawn_epi(
        &[
            "--json",
            "gate",
            "temporal",
            "context",
            "--session-key",
            "agent:main:main",
            "--agent-id",
            "anima",
        ],
        env,
    );

    assert!(
        process.output.status.success(),
        "stderr: {}",
        process.output.stderr
    );
    let value: serde_json::Value = serde_json::from_str(&process.output.stdout).unwrap();

    assert_eq!(value["coordinateOwner"], "S3'");
    assert_eq!(value["agentAccessOwner"], "S4/S5");
    assert_eq!(value["session"]["canonicalKey"], "agent:main:main");
    assert_eq!(value["session"]["sessionId"], session_id);
    assert_eq!(value["day"]["dayId"], day_id);
    assert_eq!(value["day"]["wikilink"], "[[07-05-2026]]");
    assert_eq!(
        value["redis"]["sessionNowKey"],
        "s3:gateway:temporal:session:session-temporal-main:now:md"
    );
    assert_eq!(
        value["redis"]["agentOrientationKey"],
        "s3:gateway:temporal:agent:anima:session:session-temporal-main:orientation"
    );
    assert_eq!(value["kairos"]["available"], true);
    assert_eq!(value["kairos"]["activeDecan"], 17);
    assert_eq!(value["kairos"]["privacy"], "public-current-transit-only");
    assert_eq!(value["pratibimba"]["available"], true);
    assert_eq!(value["pratibimba"]["coordinate"], "M4.4.4.4");
    assert_eq!(value["pratibimba"]["anchorId"], "pratibimba-abcd1234");
    assert_eq!(
        value["pratibimba"]["graphitiNamespaceRef"],
        "pratibimba-abcd1234"
    );
    assert_eq!(value["pratibimba"]["privacy"], "protected-reference-only");
    assert_eq!(
        value["pratibimba"]["layerPresenceSummary"]["presentCount"],
        2
    );
    assert!(
        value["pratibimba"].get("identityHashPreview").is_none(),
        "temporal context must not publish protected profile hash detail"
    );
    assert!(
        value["pratibimba"].get("layerPresenceMask").is_none(),
        "temporal context must not publish protected layer mask detail"
    );
    assert!(
        value["pratibimba"].get("layerCount").is_none(),
        "temporal context must keep layer detail inside the count-only summary"
    );
    assert_eq!(
        value["redis"]["dayKairosKey"],
        "s3:gateway:temporal:day:07-05-2026:kairos"
    );
    assert_eq!(
        value["redis"]["sessionKairosKey"],
        "s3:gateway:temporal:session:session-temporal-main:kairos"
    );
    assert_eq!(
        value["redis"]["personalOrientationKey"],
        "s3:gateway:temporal:personal:pratibimba-abcd1234:orientation"
    );
    assert_eq!(
        value["spacetimedb"]["kairosProjectionTable"],
        "kairos_surface"
    );
    assert_safe_kernel_projection(&value);
    assert_eq!(value["graphiti"]["namespaceRef"], "pratibimba-abcd1234");
    assert!(value["now"]["wikilink"].as_str().unwrap().contains(
        "[[Empty/Present/07-05-2026/session-temporal-main/now|NOW session-temporal-main]]"
    ));
    assert!(value["history"]["archivePath"]
        .as_str()
        .unwrap()
        .contains("Pratibimba/Self/Action/History/2026/05/W19/07"));
    assert!(value["now"]["content"]
        .as_str()
        .unwrap()
        .contains("[[Chronos]]"));
}

#[tokio::test]
async fn gateway_rpc_temporal_context_is_available_to_agent_surfaces() {
    let (env, day_id, session_id) = env_with_now_file();
    let mut client = TestGatewayClient::connect(env, 18794).await;
    client.request("connect", json!({})).await.unwrap();

    let value = client
        .request(
            "s3'.temporal.context",
            json!({
                "sessionKey": "agent:main:main",
                "agentId": "epii"
            }),
        )
        .await
        .unwrap();

    assert_eq!(value["coordinateOwner"], "S3'");
    assert_eq!(value["day"]["dayId"], day_id);
    assert_eq!(value["session"]["sessionId"], session_id);
    assert_eq!(
        value["redis"]["agentOrientationKey"],
        "s3:gateway:temporal:agent:epii:session:session-temporal-main:orientation"
    );
    assert_eq!(value["graphiti"]["runtimeOwner"], "S3'");
    assert_eq!(value["graphiti"]["invocationOwner"], "S5/S5'");
    assert_eq!(value["kairos"]["available"], true);
    assert_eq!(value["pratibimba"]["stewardshipOwner"], "S5'");
    assert_safe_kernel_projection(&value);
}

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d redis
async fn live_redis_temporal_context_hydration_uses_s3_namespace() {
    let (env, _, session_id) = env_with_now_file();
    let mut client = TestGatewayClient::connect(env, 18794).await;
    client.request("connect", json!({})).await.unwrap();

    let value = client
        .request(
            "s3'.temporal.context",
            json!({
                "sessionKey": "agent:main:main",
                "agentId": "anima",
                "hydrateRedis": true
            }),
        )
        .await
        .unwrap();

    assert_eq!(value["redis"]["hydrated"], true);
    let key = value["redis"]["sessionNowKey"]
        .as_str()
        .unwrap()
        .to_string();
    assert!(key.starts_with("s3:gateway:temporal:session:"));
    assert!(key.contains(&session_id));

    let redis_uri =
        std::env::var("EPILOGOS_REDIS_URI").unwrap_or_else(|_| "redis://localhost:6379".into());
    let client = redis::Client::open(redis_uri).unwrap();
    let mut conn = client.get_multiplexed_async_connection().await.unwrap();
    let cached: String = conn.get(&key).await.unwrap();
    assert!(cached.contains("[[Chronos]]"));
    let _: usize = conn.del(&key).await.unwrap();
}

fn assert_safe_kernel_projection(value: &serde_json::Value) {
    assert_eq!(value["kernel"]["coordinateOwner"], "S0/QL-meta");
    assert_eq!(value["kernel"]["projectionOwner"], "S3'");
    assert_eq!(
        value["kernel"]["privacy"],
        "safe-public-current-kernel-tick"
    );
    assert_eq!(
        value["kernel"]["computationSource"],
        "portal-core::KernelProjection"
    );
    assert!(value["kernel"]["generation"].as_u64().unwrap() > 0);
    assert!(value["kernel"]["tick"]["subTick"].as_u64().unwrap() <= 11);
    assert!(value["kernel"]["tick"]["cycle"].as_u64().unwrap() > 0);
    assert!(value["kernel"]["tick"]["phase"].as_str().unwrap().len() > 0);
    assert!(value["kernel"]["tick"]["element"].as_str().unwrap().len() > 0);
    assert!(value["kernel"]["tick"]["harmonicRatio"]
        .as_str()
        .unwrap()
        .contains('.'));
    assert!(
        value["kernel"]["harmonicPulse"]["ratioNum"]
            .as_u64()
            .unwrap()
            >= 1
    );
    assert!(
        value["kernel"]["harmonicPulse"]["ratioDen"]
            .as_u64()
            .unwrap()
            >= 1
    );
    assert!(
        value["kernel"].get("bioquaternion").is_none(),
        "gateway temporal context must not publish protected bioquaternion detail"
    );
    assert!(
        value["kernel"].get("resonanceSquareEmphasis").is_none(),
        "gateway temporal context must not publish protected resonance vectors"
    );
}

fn write_nara_temporal_identity(env: &TestEnv) {
    let nara_root = env.home.join(".epi-logos").join("nara");
    fs::create_dir_all(nara_root.join("kairos")).unwrap();
    fs::write(
        nara_root.join("profile.json"),
        r#"{
  "version": 1,
  "layers": {},
  "layer_presence_mask": 3,
  "hash_preview": "abcd1234",
  "last_wound": null,
  "kerykeion_version": "test"
}"#,
    )
    .unwrap();
    fs::write(
        nara_root.join("kairos").join("current.json"),
        r#"{
  "planets": [
    {"planet_id": 0, "degree": 41.2, "degree_anchor": 41, "retrograde": false},
    {"planet_id": 1, "degree": 208.8, "degree_anchor": 209, "retrograde": true}
  ],
  "dominant_sign": 1,
  "dominant_element": 4,
  "active_decan": 17,
  "active_tattva": 2
}"#,
    )
    .unwrap();
}
