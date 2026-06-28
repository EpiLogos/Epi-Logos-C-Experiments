use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use epi_s3_redis_context::{
    aeon_eval_ledger_from_transcript, AeonEvalContext, RedisCache, RedisConfig, RedisKey,
};
use serde_json::Value;

fn unique_transcript_path() -> PathBuf {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    std::env::temp_dir().join(format!("aeon-eval-ledger-{nanos}.jsonl"))
}

fn write_fixture(lines: &[&str]) -> PathBuf {
    let path = unique_transcript_path();
    fs::write(&path, lines.join("\n")).unwrap();
    path
}

fn context() -> AeonEvalContext {
    AeonEvalContext {
        day_id: "02-06-2026".to_owned(),
        session_id: "session-a".to_owned(),
        turn_id: "turn-7".to_owned(),
        coordinate: "S3".to_owned(),
        session_vak: "vak-session-a".to_owned(),
    }
}

#[test]
fn computes_metrics_from_harness_neutral_transcript_events() {
    let transcript = write_fixture(&[
        r#"{"kind":"harness_turn_event","role":"harness","message":"read","run_id":"run-1","harness_id":"codex","event":{"kind":"toolCallObserved","callId":"read-1","name":"read_file","arguments":{"path":"src/lib.rs"},"result":{},"status":"succeeded","durationMs":11},"timestamp_ms":1}"#,
        r#"{"kind":"harness_turn_event","role":"harness","message":"search","run_id":"run-1","harness_id":"different-harness","event":{"kind":"toolCallObserved","callId":"read-2","name":"rg","arguments":{"pattern":"RedisKey"},"result":{},"status":"succeeded","durationMs":12},"timestamp_ms":2}"#,
        r#"{"kind":"harness_turn_event","role":"harness","message":"edit","run_id":"run-1","harness_id":"codex","event":{"kind":"toolCallObserved","callId":"edit-1","name":"apply_patch","arguments":{},"result":{"rubricScores":{"correctness":0.9,"test_quality":1.0}},"status":"succeeded","durationMs":13},"timestamp_ms":3}"#,
        r#"{"kind":"harness_turn_event","role":"harness","message":"test","run_id":"run-1","harness_id":"codex","event":{"kind":"toolCallObserved","callId":"test-1","name":"shell_command","arguments":{"cmd":"cargo test --manifest-path Body/S/S3/redis-context/Cargo.toml"},"result":{},"status":"succeeded","durationMs":14},"timestamp_ms":4}"#,
        r#"{"kind":"harness_turn_event","role":"harness","message":"done","run_id":"run-1","harness_id":"codex","event":{"kind":"turnComplete","text":"done","usage":{"inputTokens":100,"outputTokens":50,"totalTokens":150,"costUsd":0.42},"responseModel":"gpt-5","finishReasons":["stop"]},"timestamp_ms":5}"#,
    ]);

    let ledger = aeon_eval_ledger_from_transcript(&transcript, context()).unwrap();

    assert_eq!(ledger.metrics.turns, 1);
    assert_eq!(ledger.metrics.read_tool_observations, 2);
    assert_eq!(ledger.metrics.reads_before_first_edit, 2);
    assert_eq!(ledger.metrics.edit_tool_observations, 1);
    assert_eq!(ledger.metrics.test_tool_observations, 1);
    assert_eq!(ledger.metrics.tests_after_first_edit, 1);
    assert_eq!(ledger.metrics.input_tokens, 100);
    assert_eq!(ledger.metrics.output_tokens, 50);
    assert_eq!(ledger.metrics.total_tokens, 150);
    assert_eq!(ledger.metrics.total_cost, Some(0.42));
    assert_eq!(ledger.metrics.rubric_scores["correctness"], 0.9);
    assert_eq!(ledger.metrics.rubric_scores["test_quality"], 1.0);
    assert_eq!(ledger.metrics.reads_before_edits_ratio, Some(1.0));
    assert_eq!(ledger.metrics.tests_after_edits_ratio, Some(1.0));
}

#[test]
fn builds_hot_tier_eval_keys_and_graphiti_episode_for_promotion() {
    let transcript = write_fixture(&[
        r#"{"kind":"harness_turn_event","role":"harness","message":"edit","run_id":"run-1","harness_id":"codex","event":{"kind":"toolCallObserved","callId":"edit-1","name":"apply_patch","arguments":{},"result":{},"status":"succeeded","durationMs":13},"timestamp_ms":1}"#,
        r#"{"kind":"harness_turn_event","role":"harness","message":"done","run_id":"run-1","harness_id":"codex","event":{"kind":"turnComplete","text":"done","usage":{"inputTokens":10,"outputTokens":5,"totalTokens":15},"responseModel":"gpt-5","finishReasons":["stop"]},"timestamp_ms":2}"#,
    ]);

    let ledger = aeon_eval_ledger_from_transcript(&transcript, context()).unwrap();
    let records = ledger.redis_records().unwrap();
    let keys: Vec<&str> = records.iter().map(|record| record.key.as_str()).collect();

    assert_eq!(
        RedisKey::aeon_eval_metric("02-06-2026", "session-a", "turn-7", "S3", "turns").as_str(),
        "cache:hot:epi:02-06-2026:session-a:turn-7:S3:eval:turns"
    );
    assert!(keys.contains(&"cache:hot:epi:02-06-2026:session-a:turn-7:S3:eval:turns"));
    assert!(
        keys.contains(&"cache:hot:epi:02-06-2026:session-a:turn-7:S3:eval:tests_after_edits_ratio")
    );

    let turns_value: Value = serde_json::from_str(
        records
            .iter()
            .find(|record| record.metric == "turns")
            .unwrap()
            .value
            .as_str(),
    )
    .unwrap();
    assert_eq!(turns_value["value"], 1);
    assert_eq!(turns_value["source"], "aeon-eval");
    assert_eq!(turns_value["coordinate"], "S3");

    let episode = ledger.graphiti_episode().unwrap();
    assert_eq!(episode.source, "aeon-eval");
    assert_eq!(episode.group_id.as_deref(), Some("vak-session-a"));
    assert_eq!(episode.ql_position, "5'");
    assert!(episode.content.contains("Sophia disclosure reference"));
    assert!(episode.content.contains("turns=1"));
    assert!(episode.content.contains("tests_after_edits_ratio"));
}

#[tokio::test]
#[ignore = "requires a live Redis URI in EPILOGOS_REDIS_URI"]
async fn persists_eval_records_to_real_redis_hot_tier() {
    let transcript = write_fixture(&[
        r#"{"kind":"harness_turn_event","role":"harness","message":"read","run_id":"run-1","harness_id":"codex","event":{"kind":"toolCallObserved","callId":"read-1","name":"read_file","arguments":{"path":"src/lib.rs"},"result":{},"status":"succeeded","durationMs":11},"timestamp_ms":1}"#,
        r#"{"kind":"harness_turn_event","role":"harness","message":"done","run_id":"run-1","harness_id":"codex","event":{"kind":"turnComplete","text":"done","usage":{"inputTokens":10,"outputTokens":5,"totalTokens":15},"responseModel":"gpt-5","finishReasons":["stop"]},"timestamp_ms":2}"#,
    ]);
    let ledger = aeon_eval_ledger_from_transcript(&transcript, context()).unwrap();
    let records = ledger.redis_records().unwrap();
    let turns = records
        .iter()
        .find(|record| record.metric == "turns")
        .unwrap();

    let mut cache = RedisCache::connect(&RedisConfig::from_env()).await.unwrap();
    cache.set_aeon_eval_records(&records).await.unwrap();
    let persisted = cache.get_key(&turns.key).await.unwrap().unwrap();
    let persisted: Value = serde_json::from_str(&persisted).unwrap();

    assert_eq!(persisted["source"], "aeon-eval");
    assert_eq!(persisted["metric"], "turns");
    assert_eq!(persisted["value"], 1);
    assert_eq!(turns.key.tier().ttl_seconds(), 300);
}
