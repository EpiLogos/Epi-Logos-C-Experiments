use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

use epi_s3_redis_context::{
    aeon_eval_ledger_from_transcript, AeonEvalContext, RedisCache, RedisConfig, RedisKey,
};
use serde_json::Value;

fn unique_transcript_path() -> PathBuf {
    // Timestamp alone collides when parallel tests hit the same clock
    // tick (one truncates the shared file while the other reads it);
    // pid + per-process counter make the path genuinely unique.
    static COUNTER: AtomicU64 = AtomicU64::new(0);
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let unique = COUNTER.fetch_add(1, Ordering::Relaxed);
    std::env::temp_dir().join(format!(
        "aeon-eval-ledger-{}-{unique}-{nanos}.jsonl",
        std::process::id()
    ))
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

// ── 50.T50.14 — the deterministic orchestration trace as the learning unit ──
//
// Track 50 collapses N JSON tool calls into ONE generated script. Every metric
// above is derived by counting `toolCallObserved`, so without a second unit a
// code-mode run is invisible to the thing that scores it. These tests hold both
// halves of that claim: that the blindness is real, and that the trace cures it.

/// One orchestration trace line, in the exact shape `transcripts.rs` writes.
fn orchestration_trace_line(ops: &str, usage: &str) -> String {
    format!(
        r#"{{"kind":"orchestration_trace","role":"orchestration","message":"trace","run_id":"run-9","orchestration_trace":{{"scoreId":"nightly","scoreHash":"b8f1c0de00000000","runId":"run-9","ops":{ops},"usage":{usage}}},"timestamp_ms":9}}"#
    )
}

// One line: the transcript is JSONL, so an embedded newline would split the
// record in half and the reader would fail the whole file.
const CODE_MODE_OPS: &str = r#"[{"stepId":"survey","operation":"read","agent":"logos"},{"stepId":"survey","operation":"rg","agent":"logos"},{"stepId":"survey","operation":"read","agent":"logos"},{"stepId":"land","operation":"apply_patch","agent":"anima"},{"stepId":"prove","operation":"bash","command":"cargo test --offline -p portal-core","agent":"anima"},{"stepId":"prove","operation":"read","agent":"anima"}]"#;

const CODE_MODE_USAGE: &str = r#"{"turns":1,"inputTokens":900,"outputTokens":300,"totalTokens":1200}"#;

#[test]
fn a_code_mode_run_is_invisible_without_its_trace() {
    // The SAME work, recorded only as the single turn a script produces. This
    // is the defect the trace exists to fix, pinned so it cannot silently
    // return: six real operations, and the staircase reader sees none of them.
    let transcript = write_fixture(&[
        r#"{"kind":"harness_turn_event","role":"harness","message":"done","run_id":"run-9","harness_id":"pi","event":{"kind":"turnComplete","text":"done","usage":{"inputTokens":900,"outputTokens":300,"totalTokens":1200},"responseModel":"gpt-5","finishReasons":["stop"]},"timestamp_ms":9}"#,
    ]);

    let ledger = aeon_eval_ledger_from_transcript(&transcript, context()).unwrap();

    assert_eq!(ledger.metrics.turns, 1, "the script is one turn");
    assert_eq!(ledger.metrics.read_tool_observations, 0);
    assert_eq!(ledger.metrics.edit_tool_observations, 0);
    assert_eq!(ledger.metrics.test_tool_observations, 0);
    assert_eq!(
        ledger.metrics.reads_before_edits_ratio, None,
        "no denominator — the behavioural signal is simply absent"
    );
    fs::remove_file(&transcript).ok();
}

#[test]
fn the_orchestration_trace_restores_the_behavioural_metrics() {
    let transcript = write_fixture(&[&orchestration_trace_line(CODE_MODE_OPS, CODE_MODE_USAGE)]);

    let ledger = aeon_eval_ledger_from_transcript(&transcript, context()).unwrap();

    // Classified by the SAME vocabulary the staircase path uses: `read`/`rg`
    // read, `apply_patch` edits, and the `cargo test` COMMAND text is what
    // makes the third op a test rather than a bare `bash`.
    assert_eq!(ledger.metrics.read_tool_observations, 4);
    assert_eq!(ledger.metrics.edit_tool_observations, 1);
    assert_eq!(ledger.metrics.test_tool_observations, 1);
    // Order is load-bearing: three reads precede the edit, one follows it.
    assert_eq!(ledger.metrics.reads_before_first_edit, 3);
    assert_eq!(ledger.metrics.tests_after_first_edit, 1);
    assert_eq!(ledger.metrics.reads_before_edits_ratio, Some(0.75));
    assert_eq!(ledger.metrics.tests_after_edits_ratio, Some(1.0));
    // The run reports the turns it ACTUALLY took — the number the staircase
    // inflated — which is what makes the two units comparable.
    assert_eq!(ledger.metrics.turns, 1);
    assert_eq!(ledger.metrics.total_tokens, 1200);
    fs::remove_file(&transcript).ok();
}

#[test]
fn replaying_the_same_score_reproduces_the_metrics() {
    // The tranche's own acceptance: replay reproduces the metrics. A score is
    // byte-identical by `scoreHash`, so its trace is too, and a metric that
    // differed between two runs of one program would be a finding.
    let first = write_fixture(&[&orchestration_trace_line(CODE_MODE_OPS, CODE_MODE_USAGE)]);
    let second = write_fixture(&[&orchestration_trace_line(CODE_MODE_OPS, CODE_MODE_USAGE)]);

    let a = aeon_eval_ledger_from_transcript(&first, context()).unwrap();
    let b = aeon_eval_ledger_from_transcript(&second, context()).unwrap();

    assert_eq!(a.metrics, b.metrics, "the same program yields the same metrics");
    // And the ledger is serialisable to the same bytes, which is what a
    // downstream diff actually compares.
    assert_eq!(
        serde_json::to_string(&a.metrics).unwrap(),
        serde_json::to_string(&b.metrics).unwrap()
    );
    fs::remove_file(&first).ok();
    fs::remove_file(&second).ok();
}

#[test]
fn a_mixed_transcript_accumulates_one_coherent_ordering() {
    // A session may carry both units — a JSON-mode turn and a code-mode run.
    // They must share one `saw_edit` ordering, not two independent tallies.
    let transcript = write_fixture(&[
        r#"{"kind":"harness_turn_event","role":"harness","message":"read","run_id":"run-1","harness_id":"pi","event":{"kind":"toolCallObserved","callId":"r1","name":"read_file","arguments":{},"result":{},"status":"succeeded","durationMs":1},"timestamp_ms":1}"#,
        &orchestration_trace_line(CODE_MODE_OPS, CODE_MODE_USAGE),
    ]);

    let ledger = aeon_eval_ledger_from_transcript(&transcript, context()).unwrap();

    assert_eq!(ledger.metrics.read_tool_observations, 5, "1 staircase + 4 trace");
    assert_eq!(ledger.metrics.edit_tool_observations, 1);
    assert_eq!(
        ledger.metrics.reads_before_first_edit, 4,
        "the staircase read precedes the trace's edit — one ordering, not two"
    );
    fs::remove_file(&transcript).ok();
}

#[test]
fn a_trace_carrying_no_ops_is_honest_absence_not_a_parse_error() {
    let transcript = write_fixture(&[&orchestration_trace_line("[]", r#"{"turns":1}"#)]);

    let ledger = aeon_eval_ledger_from_transcript(&transcript, context()).unwrap();

    assert_eq!(ledger.metrics.read_tool_observations, 0);
    assert_eq!(ledger.metrics.turns, 1);
    assert_eq!(ledger.metrics.reads_before_edits_ratio, None);
    fs::remove_file(&transcript).ok();
}
