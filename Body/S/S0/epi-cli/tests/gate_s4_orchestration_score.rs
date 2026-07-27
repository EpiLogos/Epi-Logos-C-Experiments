//! 50.T50.10 — `s4'.orchestration.score` serves the score S4' persisted.
//!
//! Track 50 makes a generated TypeScript program the way Anima composes tool
//! calls. A repeatable program is persisted as a SCORE
//! (`Body/S/S4/ta-onta/S4-1p-hen/modules/score-store.ts`) and runs accumulate
//! against it in an append-only log. This method makes that observable.
//!
//! These tests hold the adapter's half of the contract: it must return the
//! persisted program and its runs, must say so when nothing was persisted, must
//! refuse a score that has lost the hash it was scored under, and must never
//! let a score id escape the store. What it must NOT do is run anything —
//! Pi->subagent is the only agentic path, so the adapter is a reader.
//!
//! The fixtures here are written in the exact shape `saveScore` /
//! `recordScoreRun` write, and the TS side owns that shape
//! (`Body/S/S4/ta-onta/S4-1p-hen/tests/score_store.test.ts`).

mod support;

use serde_json::json;
use std::fs;
use support::TestGatewayClient;

/// The exact document shape `score-store.ts::saveScore` writes.
fn persisted_score(id: &str) -> serde_json::Value {
    json!({
        "schema": "epi.score.v1",
        "id": id,
        "title": "nightly sweep",
        "provenance": {
            "origination": "(00/00)",
            "originatedAt": "2026-07-27T09:00:00.000Z",
            "sessionId": "agent:anima:main",
            "task": "sweep the inbox and file what is actionable"
        },
        "program": {
            "id": id,
            "address": {
                "cpf": "(4.0/1-4.4/5)",
                "ct": ["CT2"],
                "cp": "CP4.2",
                "cf": "(0/1)",
                "cfp": "CFP2",
                "cs": { "code": "CS2", "direction": "Day" }
            },
            "steps": [{
                "id": "collect",
                "address": {
                    "cpf": "(4.0/1-4.4/5)",
                    "ct": ["CT2"],
                    "cp": "CP4.2",
                    "cf": "(0/1)",
                    "cfp": "CFP2",
                    "cs": { "code": "CS2", "direction": "Day" }
                },
                "task": "collect the inbox",
                "agent": "logos"
            }]
        },
        "hash": "b8f1c0de0000000000000000000000000000000000000000000000000000dead"
    })
}

/// Point BOTH halves at one throwaway directory, exactly as `scoresDir()` does.
///
/// `EPI_SCORES_DIR` is the first branch of the TS `scoresDir()` and of its Rust
/// twin, so setting it here is not a test hook bolted onto production code — it
/// is the same precedence a real deployment uses. The test gateway runs
/// in-process under `TestEnv::apply_to_process`, so the handler reads what this
/// sets. Keyed by the test's own port so the tests cannot collide.
struct ScoreStore {
    dir: std::path::PathBuf,
    previous: Option<std::ffi::OsString>,
    _guard: std::sync::MutexGuard<'static, ()>,
}

/// `EPI_SCORES_DIR` is process-global, so two of these alive at once would have
/// one test's teardown unset the variable the other is mid-request on. The
/// gateway's own `test_server_lock` does not cover it — it guards the server,
/// not the environment — so this holds the env for the length of each scenario.
static SCORE_ENV_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

impl ScoreStore {
    fn new(port: u16) -> Self {
        let guard = SCORE_ENV_LOCK
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        let dir = std::env::temp_dir().join(format!("epi-orchestration-score-{port}"));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).expect("score store dir should be creatable");
        let previous = std::env::var_os("EPI_SCORES_DIR");
        std::env::set_var("EPI_SCORES_DIR", &dir);
        Self { dir, previous, _guard: guard }
    }

    fn write_score(&self, id: &str, score: &serde_json::Value) {
        fs::write(
            self.dir.join(format!("{id}.json")),
            serde_json::to_string_pretty(score).expect("score should serialise"),
        )
        .expect("score should be writable");
    }

    fn append_run(&self, id: &str, run: &serde_json::Value) {
        use std::io::Write;
        let mut file = fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(self.dir.join(format!("{id}.runs.jsonl")))
            .expect("run log should be appendable");
        writeln!(file, "{}", serde_json::to_string(run).expect("run should serialise"))
            .expect("run should be writable");
    }
}

impl Drop for ScoreStore {
    fn drop(&mut self) {
        match self.previous.take() {
            Some(value) => std::env::set_var("EPI_SCORES_DIR", value),
            None => std::env::remove_var("EPI_SCORES_DIR"),
        }
        let _ = fs::remove_dir_all(&self.dir);
    }
}

#[tokio::test]
async fn orchestration_score_returns_the_persisted_program_and_its_runs() {
    let store = ScoreStore::new(18901);
    let score = persisted_score("nightly-sweep");
    store.write_score("nightly-sweep", &score);
    store.append_run(
        "nightly-sweep",
        &json!({
            "scoreId": "nightly-sweep",
            "hash": "b8f1c0de0000000000000000000000000000000000000000000000000000dead",
            "at": "2026-07-27T09:30:00.000Z",
            "origination": "(4.0/1-4.4/5)",
            "outcome": "completed"
        }),
    );
    store.append_run(
        "nightly-sweep",
        &json!({
            "scoreId": "nightly-sweep",
            "hash": "b8f1c0de0000000000000000000000000000000000000000000000000000dead",
            "at": "2026-07-27T10:30:00.000Z",
            "origination": "(4.0/1-4.4/5)",
            "outcome": "checkpoint-review",
            "detail": { "checkpoint_review": { "stepId": "collect", "wantedCheckpoint": true } }
        }),
    );

    let mut client = TestGatewayClient::connected_with_temp_store(18901).await;
    let response = client
        .request("s4'.orchestration.score", json!({ "scoreId": "nightly-sweep" }))
        .await
        .expect("s4'.orchestration.score should be gateway-callable");

    assert_eq!(response["owner"], "S4'");
    assert_eq!(response["present"], true);
    assert_eq!(response["scoreId"], "nightly-sweep");

    // The program comes back verbatim — this is the score that would re-run.
    assert_eq!(response["score"], score);
    assert_eq!(
        response["hash"],
        "b8f1c0de0000000000000000000000000000000000000000000000000000dead"
    );
    assert_eq!(response["score"]["provenance"]["origination"], "(00/00)");

    // The run history is append-only and comes back in order.
    let runs = response["runs"].as_array().expect("runs should be an array");
    assert_eq!(runs.len(), 2, "both recorded runs should be served: {runs:?}");
    assert_eq!(runs[0]["outcome"], "completed");
    assert_eq!(runs[1]["outcome"], "checkpoint-review");
    assert_eq!(
        runs[1]["detail"]["checkpoint_review"]["wantedCheckpoint"],
        true,
        "the 50.T50.09 learned-checkpoint evidence must survive the round trip"
    );

    // The adapter names the authority that produced what it serves.
    assert!(
        response["authority"]
            .as_str()
            .expect("authority should be a string")
            .contains("score-store.ts"),
        "the reader must name its S4' authority: {}",
        response["authority"]
    );
}

#[tokio::test]
async fn orchestration_score_reports_absence_instead_of_fabricating_a_score() {
    let _store = ScoreStore::new(18902);

    let mut client = TestGatewayClient::connected_with_temp_store(18902).await;
    let response = client
        .request("s4'.orchestration.score", json!({ "scoreId": "never-persisted" }))
        .await
        .expect("an absent score is an answer, not a transport failure");

    assert_eq!(response["present"], false);
    assert_eq!(response["score"], serde_json::Value::Null);
    assert_eq!(
        response["runs"].as_array().expect("runs should be an array").len(),
        0
    );
    assert!(
        response["reason"]
            .as_str()
            .expect("reason should be a string")
            .contains("no score"),
        "absence must say why: {}",
        response["reason"]
    );
}

#[tokio::test]
async fn orchestration_score_refuses_a_score_that_lost_its_hash() {
    let store = ScoreStore::new(18903);
    let mut score = persisted_score("hashless");
    score
        .as_object_mut()
        .expect("score should be an object")
        .remove("hash");
    store.write_score("hashless", &score);

    let mut client = TestGatewayClient::connected_with_temp_store(18903).await;
    let error = client
        .request("s4'.orchestration.score", json!({ "scoreId": "hashless" }))
        .await
        .expect_err("a score with no hash must fail closed, not be served");

    assert!(
        error.message.contains("hash"),
        "the refusal must name what is missing: {}",
        error.message
    );
}

#[tokio::test]
async fn orchestration_score_lists_the_store_when_no_id_is_given() {
    let store = ScoreStore::new(18904);
    store.write_score("alpha-run", &persisted_score("alpha-run"));
    store.write_score("beta-run", &persisted_score("beta-run"));
    // A run log is not a score — `.runs.jsonl` must not appear as an id.
    store.append_run("alpha-run", &json!({ "scoreId": "alpha-run", "hash": "x" }));

    let mut client = TestGatewayClient::connected_with_temp_store(18904).await;
    let response = client
        .request("s4'.orchestration.score", json!({}))
        .await
        .expect("listing should be gateway-callable");

    let scores: Vec<&str> = response["scores"]
        .as_array()
        .expect("scores should be an array")
        .iter()
        .map(|value| value.as_str().expect("each id should be a string"))
        .collect();
    assert_eq!(scores, vec!["alpha-run", "beta-run"], "sorted ids, run logs excluded");
}

#[tokio::test]
async fn orchestration_score_refuses_a_score_id_that_escapes_the_store() {
    let _store = ScoreStore::new(18905);

    let mut client = TestGatewayClient::connected_with_temp_store(18905).await;
    for escaping in ["../../etc/passwd", "a/b", ".hidden"] {
        let error = client
            .request("s4'.orchestration.score", json!({ "scoreId": escaping }))
            .await
            .expect_err("a score id is never a path segment");
        assert!(
            error.message.contains("invalid score id"),
            "the refusal must name the law for {escaping}: {}",
            error.message
        );
    }
}
