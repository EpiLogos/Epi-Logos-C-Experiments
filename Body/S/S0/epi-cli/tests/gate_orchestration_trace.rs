//! 50.T50.14 — the deterministic orchestration trace, end to end over the wire.
//!
//! The chain this holds is the whole tranche in one pass: a completed run
//! deposits its trace through the real gateway, the gateway writes it into the
//! real session transcript, and `aeon_eval` — the reader that actually scores
//! runs — derives the behavioural metrics from that file on disk. No fixture
//! stands in for any link.
//!
//! What makes the chain worth proving: every metric `aeon_eval` computes comes
//! from counting `toolCallObserved` entries, and Track 50 collapses N JSON tool
//! calls into ONE script. Without this unit a code-mode run reads as zero reads,
//! zero edits, zero tests — the measurement going blind exactly when the
//! orchestration works as designed.

mod support;

use epi_s3_redis_context::{aeon_eval_ledger_from_transcript, AeonEvalContext};
use serde_json::{json, Value};
use support::TestGatewayClient;

fn context() -> AeonEvalContext {
    AeonEvalContext {
        day_id: "07-27-2026".to_owned(),
        session_id: "agent:anima:main".to_owned(),
        turn_id: "turn-1".to_owned(),
        coordinate: "S4'".to_owned(),
        session_vak: "vak-anima".to_owned(),
    }
}

fn op(step: &str, operation: &str) -> Value {
    json!({ "stepId": step, "operation": operation, "agent": "anima" })
}

fn trace(ops: Vec<Value>) -> Value {
    json!({
        "scoreId": "nightly-sweep",
        "scoreHash": "b8f1c0de0000000000000000000000000000000000000000000000000000dead",
        "runId": "run-1",
        "ops": ops,
        "usage": { "turns": 1, "inputTokens": 900, "outputTokens": 300, "totalTokens": 1200 }
    })
}

/// The ops a code-mode script performs inside its single turn.
fn code_mode_ops() -> Vec<Value> {
    vec![
        op("survey", "read"),
        op("survey", "rg"),
        op("survey", "read"),
        op("land", "apply_patch"),
        json!({
            "stepId": "prove",
            "operation": "bash",
            "command": "cargo test --offline -p portal-core",
            "agent": "anima"
        }),
        op("prove", "read"),
    ]
}

#[tokio::test]
async fn a_run_trace_reaches_the_transcript_and_aeon_eval_reads_it() {
    let mut client = TestGatewayClient::connected_with_temp_store(18981).await;

    let response = client
        .request(
            "chat.inject",
            json!({
                "sessionKey": "agent:anima:main",
                "orchestrationTrace": trace(code_mode_ops()),
                "vakAddress": {
                    "cpf": "(4.0/1-4.4/5)",
                    "ct": ["CT2"],
                    "cp": "CP4.2",
                    "cf": "(4.0/1-4.4/5)",
                    "cfp": "CFP2",
                    "cs": { "code": "CS2", "direction": "Day" }
                }
            }),
        )
        .await
        .expect("a completed orchestration can deposit its trace");

    assert_eq!(response["ok"], true);
    assert_eq!(response["kind"], "orchestration_trace");
    assert_eq!(response["runId"], "run-1");
    assert_eq!(response["ops"], 6);

    // The gateway wrote a real file. Read it as `aeon_eval` does.
    let path = client.transcript_path(&response["canonicalKey"].as_str().unwrap().to_owned());
    let ledger = aeon_eval_ledger_from_transcript(&path, context())
        .expect("the reader parses the transcript");

    assert_eq!(ledger.metrics.read_tool_observations, 4);
    assert_eq!(ledger.metrics.edit_tool_observations, 1);
    assert_eq!(
        ledger.metrics.test_tool_observations, 1,
        "the `cargo test` COMMAND is what makes a bare `bash` a test"
    );
    assert_eq!(ledger.metrics.reads_before_first_edit, 3);
    assert_eq!(ledger.metrics.tests_after_first_edit, 1);
    assert_eq!(ledger.metrics.reads_before_edits_ratio, Some(0.75));
    assert_eq!(ledger.metrics.turns, 1, "one script, one turn");
    assert_eq!(ledger.metrics.total_tokens, 1200);
    assert_eq!(ledger.source_transcript, path.display().to_string());
}

#[tokio::test]
async fn the_same_score_replayed_reproduces_the_metrics() {
    // The tranche's own acceptance. Two sessions, one program: the trace is a
    // function of the score, so the metrics derived from it must not drift.
    let mut client = TestGatewayClient::connected_with_temp_store(18982).await;

    let mut ledgers = Vec::new();
    for session in ["agent:anima:first", "agent:anima:second"] {
        let response = client
            .request(
                "chat.inject",
                json!({ "sessionKey": session, "orchestrationTrace": trace(code_mode_ops()) }),
            )
            .await
            .expect("replay deposits its trace");
        let path = client.transcript_path(response["canonicalKey"].as_str().unwrap());
        ledgers.push(
            aeon_eval_ledger_from_transcript(&path, context()).expect("reader parses the replay"),
        );
    }

    assert_eq!(
        ledgers[0].metrics, ledgers[1].metrics,
        "the same score hash yields the same metrics"
    );
}

#[tokio::test]
async fn the_transcript_still_carries_ordinary_messages_alongside_traces() {
    // The trace is additive: `chat.inject`'s existing shape must keep working,
    // and a transcript holding both must still parse as a whole.
    let mut client = TestGatewayClient::connected_with_temp_store(18983).await;

    client
        .request(
            "chat.inject",
            json!({ "sessionKey": "agent:anima:mixed", "message": "hello", "role": "assistant" }),
        )
        .await
        .expect("the message form is untouched");

    let response = client
        .request(
            "chat.inject",
            json!({
                "sessionKey": "agent:anima:mixed",
                "orchestrationTrace": trace(vec![op("land", "apply_patch")])
            }),
        )
        .await
        .expect("the trace form lands in the same transcript");
    assert_eq!(response["ops"], 1);

    // `read_entries` parses every line STRICTLY and fails the whole file on one
    // bad record, so history succeeding at all is the proof that the additive
    // field did not orphan the transcript.
    let history = client
        .request("chat.history", json!({ "sessionKey": "agent:anima:mixed" }))
        .await
        .expect("history still reads a transcript carrying both kinds");
    let messages = history["messages"]
        .as_array()
        .expect("history returns messages");
    assert_eq!(
        messages.len(),
        1,
        "the chat history carries the message and does NOT surface the trace as one: {history}"
    );
    assert_eq!(messages[0]["content"][0]["text"], "hello");

    // The trace is invisible to chat and fully visible to the scorer.
    let path = client.transcript_path("agent:anima:mixed");
    let ledger = aeon_eval_ledger_from_transcript(&path, context()).expect("mixed file parses");
    assert_eq!(ledger.metrics.edit_tool_observations, 1);
}

#[tokio::test]
async fn a_trace_without_its_program_identity_is_refused() {
    // Replay is checkable only because the score hash rides along. A trace that
    // cannot say which program it ran is not a trace of anything.
    let mut client = TestGatewayClient::connected_with_temp_store(18984).await;

    let mut bad = trace(vec![op("land", "apply_patch")]);
    bad["scoreHash"] = json!("");
    let error = client
        .request(
            "chat.inject",
            json!({ "sessionKey": "agent:anima:main", "orchestrationTrace": bad }),
        )
        .await
        .expect_err("an identity-less trace is refused");
    assert!(
        error.message.contains("scoreHash"),
        "the refusal names the missing field: {}",
        error.message
    );

    let malformed = client
        .request(
            "chat.inject",
            json!({ "sessionKey": "agent:anima:main", "orchestrationTrace": { "ops": [] } }),
        )
        .await
        .expect_err("a trace missing required fields is refused, not half-written");
    assert!(
        malformed.message.contains("unreadable"),
        "{}",
        malformed.message
    );
}
