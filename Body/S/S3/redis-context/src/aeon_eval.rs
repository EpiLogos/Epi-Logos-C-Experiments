use std::collections::BTreeMap;
use std::fs;
use std::path::Path;

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::RedisKey;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AeonEvalContext {
    pub day_id: String,
    pub session_id: String,
    pub turn_id: String,
    pub coordinate: String,
    pub session_vak: String,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AeonEvalMetrics {
    pub turns: u64,
    pub read_tool_observations: u64,
    pub reads_before_first_edit: u64,
    pub edit_tool_observations: u64,
    pub test_tool_observations: u64,
    pub tests_after_first_edit: u64,
    pub reads_before_edits_ratio: Option<f64>,
    pub tests_after_edits_ratio: Option<f64>,
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub total_tokens: u64,
    pub total_cost: Option<f64>,
    pub rubric_scores: BTreeMap<String, f64>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AeonEvalLedger {
    pub context: AeonEvalContext,
    pub metrics: AeonEvalMetrics,
    pub source_transcript: String,
}

#[derive(Clone, Debug, PartialEq)]
pub struct AeonEvalRedisRecord {
    pub metric: String,
    pub key: RedisKey,
    pub value: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AeonEvalGraphitiEpisode {
    pub content: String,
    pub ql_position: String,
    pub cpf: String,
    pub cp: String,
    pub source: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub arc_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub arc_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub oracle_face: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reference_time: Option<String>,
    pub day_id: String,
    pub tick12: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub group_id: Option<String>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum ToolClass {
    Read,
    Edit,
    Test,
}

pub fn aeon_eval_ledger_from_transcript(
    transcript_path: impl AsRef<Path>,
    context: AeonEvalContext,
) -> Result<AeonEvalLedger, String> {
    let transcript_path = transcript_path.as_ref();
    let content = fs::read_to_string(transcript_path)
        .map_err(|err| format!("failed to read {}: {err}", transcript_path.display()))?;
    let mut metrics = AeonEvalMetrics::default();
    let mut saw_edit = false;
    let mut total_cost = 0.0_f64;
    let mut saw_cost = false;
    let mut rubric_accumulator: BTreeMap<String, (f64, u64)> = BTreeMap::new();

    for (index, line) in content.lines().enumerate() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        let entry: Value = serde_json::from_str(line).map_err(|err| {
            format!(
                "failed to parse {} line {}: {err}",
                transcript_path.display(),
                index + 1
            )
        })?;

        collect_rubric_scores(&entry, &mut rubric_accumulator);

        let Some(event) = entry.get("event") else {
            continue;
        };
        match event.get("kind").and_then(Value::as_str) {
            Some("toolCallObserved") => {
                let name = event
                    .get("name")
                    .and_then(Value::as_str)
                    .unwrap_or_default();
                let arguments = event.get("arguments").unwrap_or(&Value::Null);
                match classify_tool(name, arguments) {
                    Some(ToolClass::Read) => {
                        metrics.read_tool_observations += 1;
                        if !saw_edit {
                            metrics.reads_before_first_edit += 1;
                        }
                    }
                    Some(ToolClass::Edit) => {
                        metrics.edit_tool_observations += 1;
                        saw_edit = true;
                    }
                    Some(ToolClass::Test) => {
                        metrics.test_tool_observations += 1;
                        if saw_edit {
                            metrics.tests_after_first_edit += 1;
                        }
                    }
                    None => {}
                }
            }
            Some("turnComplete") => {
                metrics.turns += 1;
                if let Some(usage) = event.get("usage") {
                    metrics.input_tokens += integer_field(usage, &["inputTokens", "input_tokens"]);
                    metrics.output_tokens +=
                        integer_field(usage, &["outputTokens", "output_tokens"]);
                    metrics.total_tokens += integer_field(usage, &["totalTokens", "total_tokens"]);
                    if let Some(cost) =
                        numeric_field(usage, &["costUsd", "cost_usd", "cost", "usd"])
                    {
                        total_cost += cost;
                        saw_cost = true;
                    }
                }
            }
            _ => {}
        }

        if let Some(cost) = numeric_field(&entry, &["costUsd", "cost_usd"]) {
            total_cost += cost;
            saw_cost = true;
        }
    }

    metrics.reads_before_edits_ratio = ratio(
        metrics.reads_before_first_edit,
        metrics.read_tool_observations,
    );
    metrics.tests_after_edits_ratio = ratio(
        metrics.tests_after_first_edit,
        metrics.test_tool_observations,
    );
    metrics.total_cost = saw_cost.then_some(total_cost);
    metrics.rubric_scores = rubric_accumulator
        .into_iter()
        .filter_map(|(key, (sum, count))| (count > 0).then_some((key, sum / count as f64)))
        .collect();

    Ok(AeonEvalLedger {
        context,
        metrics,
        source_transcript: transcript_path.display().to_string(),
    })
}

impl AeonEvalLedger {
    pub fn redis_records(&self) -> Result<Vec<AeonEvalRedisRecord>, String> {
        let mut records = Vec::new();
        self.push_record(&mut records, "turns", json!(self.metrics.turns))?;
        self.push_record(
            &mut records,
            "read_tool_observations",
            json!(self.metrics.read_tool_observations),
        )?;
        self.push_record(
            &mut records,
            "reads_before_first_edit",
            json!(self.metrics.reads_before_first_edit),
        )?;
        self.push_record(
            &mut records,
            "reads_before_edits_ratio",
            json!(self.metrics.reads_before_edits_ratio),
        )?;
        self.push_record(
            &mut records,
            "edit_tool_observations",
            json!(self.metrics.edit_tool_observations),
        )?;
        self.push_record(
            &mut records,
            "test_tool_observations",
            json!(self.metrics.test_tool_observations),
        )?;
        self.push_record(
            &mut records,
            "tests_after_first_edit",
            json!(self.metrics.tests_after_first_edit),
        )?;
        self.push_record(
            &mut records,
            "tests_after_edits_ratio",
            json!(self.metrics.tests_after_edits_ratio),
        )?;
        self.push_record(
            &mut records,
            "input_tokens",
            json!(self.metrics.input_tokens),
        )?;
        self.push_record(
            &mut records,
            "output_tokens",
            json!(self.metrics.output_tokens),
        )?;
        self.push_record(
            &mut records,
            "total_tokens",
            json!(self.metrics.total_tokens),
        )?;
        self.push_record(&mut records, "total_cost", json!(self.metrics.total_cost))?;
        for (rubric, score) in &self.metrics.rubric_scores {
            self.push_record(&mut records, &format!("rubric.{rubric}"), json!(score))?;
        }
        Ok(records)
    }

    pub fn graphiti_episode(&self) -> Result<AeonEvalGraphitiEpisode, String> {
        let mut content = format!(
            "Sophia disclosure reference: Aeon eval metrics for coordinate {coordinate} in session {session}. turns={turns}; reads_before_edits_ratio={reads:?}; tests_after_edits_ratio={tests:?}; total_tokens={tokens}; total_cost={cost:?}.",
            coordinate = self.context.coordinate,
            session = self.context.session_id,
            turns = self.metrics.turns,
            reads = self.metrics.reads_before_edits_ratio,
            tests = self.metrics.tests_after_edits_ratio,
            tokens = self.metrics.total_tokens,
            cost = self.metrics.total_cost,
        );
        if !self.metrics.rubric_scores.is_empty() {
            let rubric = self
                .metrics
                .rubric_scores
                .iter()
                .map(|(key, value)| format!("{key}={value:.3}"))
                .collect::<Vec<_>>()
                .join(", ");
            content.push_str(" rubric_scores=");
            content.push_str(&rubric);
            content.push('.');
        }

        Ok(AeonEvalGraphitiEpisode {
            content,
            ql_position: "5'".to_owned(),
            cpf: "(4.0/1-4.4/5)".to_owned(),
            cp: "4.5".to_owned(),
            source: "aeon-eval".to_owned(),
            arc_id: Some(format!("aeon-eval:{}", self.context.session_id)),
            arc_type: Some("aeon-eval-ledger".to_owned()),
            oracle_face: None,
            reference_time: None,
            day_id: self.context.day_id.clone(),
            tick12: 0,
            group_id: Some(self.context.session_vak.clone()),
        })
    }

    fn push_record(
        &self,
        records: &mut Vec<AeonEvalRedisRecord>,
        metric: &str,
        value: Value,
    ) -> Result<(), String> {
        let key = RedisKey::aeon_eval_metric(
            &self.context.day_id,
            &self.context.session_id,
            &self.context.turn_id,
            &self.context.coordinate,
            metric,
        );
        let value = serde_json::to_string(&json!({
            "source": "aeon-eval",
            "day_id": self.context.day_id,
            "session_id": self.context.session_id,
            "turn_id": self.context.turn_id,
            "coordinate": self.context.coordinate,
            "session_vak": self.context.session_vak,
            "metric": metric,
            "value": value,
        }))
        .map_err(|err| err.to_string())?;
        records.push(AeonEvalRedisRecord {
            metric: metric.to_owned(),
            key,
            value,
        });
        Ok(())
    }
}

fn classify_tool(name: &str, arguments: &Value) -> Option<ToolClass> {
    let lowered = name.to_ascii_lowercase();
    let command = command_text(arguments).to_ascii_lowercase();

    if looks_like_test(&lowered) || looks_like_test(&command) {
        return Some(ToolClass::Test);
    }
    if looks_like_edit(&lowered) || looks_like_edit(&command) {
        return Some(ToolClass::Edit);
    }
    if looks_like_read(&lowered) || looks_like_read(&command) {
        return Some(ToolClass::Read);
    }
    None
}

fn looks_like_read(value: &str) -> bool {
    value.contains("read")
        || value == "rg"
        || value.contains("grep")
        || value.contains("find")
        || value.contains("sed ")
        || value.contains("cat ")
        || value.contains("ls ")
        || value.contains("open")
}

fn looks_like_edit(value: &str) -> bool {
    value.contains("apply_patch")
        || value.contains("write")
        || value.contains("edit")
        || value.contains("replace")
        || value.contains("create")
        || value.contains("delete")
        || value.contains("move")
}

fn looks_like_test(value: &str) -> bool {
    value.contains("cargo test")
        || value.contains("cargo nextest")
        || value.contains("npm test")
        || value.contains("pnpm test")
        || value.contains("node --test")
        || value.contains("pytest")
        || value.contains("make test")
        || value.contains("test:")
        || value.ends_with("test")
        || value.contains("_test")
}

fn command_text(arguments: &Value) -> &str {
    arguments
        .get("cmd")
        .or_else(|| arguments.get("command"))
        .and_then(Value::as_str)
        .unwrap_or_default()
}

fn integer_field(value: &Value, names: &[&str]) -> u64 {
    names
        .iter()
        .find_map(|name| value.get(*name).and_then(Value::as_u64))
        .unwrap_or_default()
}

fn numeric_field(value: &Value, names: &[&str]) -> Option<f64> {
    names
        .iter()
        .find_map(|name| value.get(*name).and_then(Value::as_f64))
}

fn ratio(numerator: u64, denominator: u64) -> Option<f64> {
    (denominator > 0).then_some(numerator as f64 / denominator as f64)
}

fn collect_rubric_scores(value: &Value, acc: &mut BTreeMap<String, (f64, u64)>) {
    match value {
        Value::Object(map) => {
            collect_rubric_object(map.get("rubricScores"), acc);
            collect_rubric_object(map.get("rubric_scores"), acc);
            for child in map.values() {
                collect_rubric_scores(child, acc);
            }
        }
        Value::Array(items) => {
            for child in items {
                collect_rubric_scores(child, acc);
            }
        }
        _ => {}
    }
}

fn collect_rubric_object(value: Option<&Value>, acc: &mut BTreeMap<String, (f64, u64)>) {
    let Some(Value::Object(scores)) = value else {
        return;
    };
    for (key, score) in scores {
        if let Some(score) = score.as_f64() {
            let entry = acc.entry(key.clone()).or_insert((0.0, 0));
            entry.0 += score;
            entry.1 += 1;
        }
    }
}
