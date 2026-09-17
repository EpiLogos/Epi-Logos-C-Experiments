use epi_s3_gateway::{temporal_context, CreateSessionContext, SessionStore};
use serde_json::json;

fn temp_gate_root(name: &str) -> std::path::PathBuf {
    let mut root = std::env::temp_dir();
    root.push(format!("epi-s3-temporal-{name}-{}", std::process::id()));
    if root.exists() {
        std::fs::remove_dir_all(&root).unwrap();
    }
    root
}

#[test]
fn temporal_context_builds_tiered_s3_redis_handles_from_session_record() {
    let gate_root = temp_gate_root("context");
    let vault_root = gate_root.join("Idea");
    let now_path = vault_root
        .join("Empty")
        .join("Present")
        .join("08-06-2026")
        .join("20260608-120000-main")
        .join("now.md");
    std::fs::create_dir_all(now_path.parent().unwrap()).unwrap();
    std::fs::write(&now_path, "# NOW\n\n[[Chronos]] carries the day.\n").unwrap();

    let store = SessionStore::new(&gate_root).unwrap();
    let record = store
        .create_with_context(
            "agent:main:main",
            CreateSessionContext {
                session_id: Some("record-session".to_owned()),
                day_id: None,
                vault_now_path: Some(now_path.display().to_string()),
                runtime_cwd: Some("/repo".to_owned()),
                vault_root: Some(vault_root.display().to_string()),
            },
        )
        .unwrap();

    let context = temporal_context::context_for_record(
        &gate_root,
        &record,
        "anima",
        temporal_context::TemporalContextInputs {
            kairos: json!({"available": true, "privacy": "public-current-transit-only"}),
            pratibimba: json!({
                "available": true,
                "anchorId": "pratibimba-abcd1234",
                "coordinate": "M4.4.4.4",
                "privacy": "protected-reference-only"
            }),
            ..Default::default()
        },
    );

    assert_eq!(context["coordinateOwner"], "S3'");
    assert_eq!(context["day"]["dayId"], "08-06-2026");
    assert_eq!(context["session"]["sessionId"], "20260608-120000-main");
    assert_eq!(
        context["redis"]["sessionNowKey"],
        "cache:hot:s3:gateway:temporal:session:20260608-120000-main:now:md"
    );
    assert_eq!(
        context["redis"]["dayContextKey"],
        "cache:warm:s3:gateway:temporal:day:08-06-2026:context"
    );
    assert_eq!(
        context["redis"]["agentOrientationKey"],
        "cache:hot:s3:gateway:temporal:agent:anima:session:20260608-120000-main:orientation"
    );
    assert_eq!(
        context["redis"]["personalOrientationKey"],
        "cache:hot:s3:gateway:temporal:personal:pratibimba-abcd1234:orientation"
    );
    assert_eq!(
        context["graphiti"]["redisContextKey"],
        "cache:hot:s3:gateway:temporal:session:20260608-120000-main:now:md"
    );
    assert_eq!(context["redis"]["hydrated"], false);
    assert!(context["now"]["content"]
        .as_str()
        .unwrap()
        .contains("[[Chronos]]"));
}

#[test]
fn temporal_context_projects_blocks_from_existing_psyche_renderer_state() {
    let gate_root = temp_gate_root("context-blocks");
    let vault_root = gate_root.join("Idea");
    let now_path = vault_root
        .join("Empty")
        .join("Present")
        .join("08-06-2026")
        .join("20260608-120000-main")
        .join("now.md");
    std::fs::create_dir_all(now_path.parent().unwrap()).unwrap();
    std::fs::write(&now_path, "# NOW\n\n[[Chronos]] carries the day.\n").unwrap();

    let store = SessionStore::new(&gate_root).unwrap();
    let record = store
        .create_with_context(
            "agent:main:main",
            CreateSessionContext {
                session_id: Some("record-session".to_owned()),
                day_id: None,
                vault_now_path: Some(now_path.display().to_string()),
                runtime_cwd: Some("/repo".to_owned()),
                vault_root: Some(vault_root.display().to_string()),
            },
        )
        .unwrap();
    let psyche_path = gate_root
        .join("s4")
        .join("psyche")
        .join("agent_main_main.json");
    std::fs::create_dir_all(psyche_path.parent().unwrap()).unwrap();
    std::fs::write(
        &psyche_path,
        serde_json::to_string_pretty(&json!({
            "renderer": {
                "activeBlockIds": ["block:review-item:44"],
                "currentSelection": "block:review-item:44",
                "pendingVerdict": {
                    "method": "blocks.verdict",
                    "blockId": "block:review-item:44",
                    "decision": "approve",
                    "actor": "human",
                    "actorIsHuman": true,
                    "resolutionTarget": "human",
                    "reason": "approved under Human Gate",
                    "routesTo": "s4'.psyche.update"
                },
                "appliedOperations": [],
                "blocks": [{
                    "id": "block:review-item:44",
                    "type": "review-item",
                    "ctx": {"cf": "(0/1/2)", "ct": "CT2", "cp": "4.2"},
                    "coordinate": "M5'",
                    "privacyClass": "protected",
                    "provenance": {
                        "kind": "evidence-envelope",
                        "handle": "review-44"
                    },
                    "data": {"title": "Live transport"},
                    "affordances": ["verdict", "annotate"]
                }]
            },
            "updatedAtMs": 1_785_000_000_000u64
        }))
        .unwrap(),
    )
    .unwrap();

    let context = temporal_context::context_for_record(
        &gate_root,
        &record,
        "anima",
        temporal_context::TemporalContextInputs::default(),
    );

    assert_eq!(context["blocks"]["projectionOwner"], "S3'");
    assert_eq!(context["blocks"]["transport"], "day-now-runtime");
    assert_eq!(context["blocks"]["source"], "s4'.psyche.state.renderer");
    assert_eq!(
        context["blocks"]["redisKey"],
        "cache:hot:s3:gateway:temporal:session:20260608-120000-main:blocks"
    );
    assert_eq!(
        context["redis"]["blocksKey"],
        "cache:hot:s3:gateway:temporal:session:20260608-120000-main:blocks"
    );
    assert_eq!(
        context["blocks"]["activeBlockIds"][0],
        "block:review-item:44"
    );
    assert_eq!(context["blocks"]["items"][0]["type"], "review-item");
    assert_eq!(
        context["blocks"]["items"][0]["data"]["title"],
        "Live transport"
    );
    assert_eq!(
        context["blocks"]["pendingVerdict"]["routesTo"],
        "s4'.psyche.update"
    );
}
