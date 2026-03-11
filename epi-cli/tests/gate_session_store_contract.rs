mod support;

use epi_logos::gate::sessions::{SessionPatch, SessionStore};
use serde_json::json;
use support::temp_env;

#[test]
fn session_store_persists_gateway_authority_fields_and_transcript_path() {
    let env = temp_env();
    let gate_root = env.home.join(".epi").join("gate");
    let store = SessionStore::new(&gate_root).unwrap();
    let created = store.create("agent:main:subagent:research").unwrap();

    let patched = store
        .patch(
            "agent:main:subagent:research",
            SessionPatch {
                aliases: Some(vec!["NOW-main".to_owned()]),
                label: Some(Some("Main Session".to_owned())),
                spawned_by: Some(Some("agent:parent:main".to_owned())),
                vault_now_path: Some(Some("/vault/Present/11-03-2026/now.md".to_owned())),
                delivery_context: Some(Some(
                    json!({"mode":"reply","lastTo":"ops","accountId":"acct-1"}),
                )),
                channel: Some(Some("telegram".to_owned())),
                thread_id: Some(Some("thread-42".to_owned())),
                group_id: Some(Some("group-7".to_owned())),
                group_channel: Some(Some("alerts".to_owned())),
                group_space: Some(Some("ops-space".to_owned())),
                model_override: Some(Some("claude-sonnet".to_owned())),
                provider_override: Some(Some("anthropic".to_owned())),
                cli_session_ids: Some(vec!["cli-a".to_owned(), "cli-b".to_owned()]),
                ..SessionPatch::default()
            },
        )
        .unwrap();

    let resolved = store.resolve("Main Session").unwrap();

    assert_eq!(resolved.canonical_key, "agent:main:subagent:research");
    assert_eq!(resolved.aliases, vec!["NOW-main".to_owned()]);
    assert!(!resolved.session_id.is_empty());
    assert_eq!(patched.session_id, resolved.session_id);
    assert_eq!(resolved.spawned_by.as_deref(), Some("agent:parent:main"));
    assert_eq!(
        resolved.vault_now_path.as_deref(),
        Some("/vault/Present/11-03-2026/now.md")
    );
    assert_eq!(resolved.channel.as_deref(), Some("telegram"));
    assert_eq!(resolved.thread_id.as_deref(), Some("thread-42"));
    assert_eq!(resolved.group_id.as_deref(), Some("group-7"));
    assert_eq!(resolved.group_channel.as_deref(), Some("alerts"));
    assert_eq!(resolved.group_space.as_deref(), Some("ops-space"));
    assert_eq!(resolved.model_override.as_deref(), Some("claude-sonnet"));
    assert_eq!(resolved.provider_override.as_deref(), Some("anthropic"));
    assert_eq!(
        resolved.delivery_context,
        Some(json!({"mode":"reply","lastTo":"ops","accountId":"acct-1"}))
    );
    assert_eq!(
        resolved.cli_session_ids,
        vec!["cli-a".to_owned(), "cli-b".to_owned()]
    );
    assert_eq!(
        store.transcript_path("agent:main:subagent:research"),
        gate_root
            .join("transcripts")
            .join("agent_main_subagent_research.jsonl")
    );

    let alias = store.resolve("NOW-main").unwrap();
    assert_eq!(alias.session_id, created.session_id);
}
