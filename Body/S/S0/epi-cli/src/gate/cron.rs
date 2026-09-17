use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use chrono::{DateTime, Datelike, Duration, Timelike, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct CronState {
    #[serde(default)]
    jobs: Vec<CronJob>,
    #[serde(default)]
    runs: Vec<CronRun>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CronJob {
    id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    agent_id: Option<String>,
    name: String,
    description: String,
    schedule: Value,
    enabled: bool,
    payload: Value,
    session_target: String,
    wake_mode: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    isolation: Option<Value>,
    created_at_ms: u128,
    updated_at_ms: u128,
    state: CronJobState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CronJobState {
    next_run_at_ms: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CronRun {
    job_id: String,
    ts: u128,
    status: String,
    summary: String,
}

pub fn status(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let next_wake = state
        .jobs
        .iter()
        .filter(|job| job.enabled)
        .map(|job| job.state.next_run_at_ms)
        .min();
    Ok(json!({ "enabled": true, "jobs": state.jobs.len(), "nextWakeAtMs": next_wake }))
}

pub fn list(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    Ok(json!({ "jobs": state.jobs }))
}

pub fn add(
    state_root: impl AsRef<Path>,
    name: &str,
    description: &str,
    agent_id: Option<&str>,
    enabled: bool,
    schedule: Value,
    session_target: &str,
    wake_mode: &str,
    payload: Value,
    isolation: Option<Value>,
) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let now = now_ms()?;
    let next_run_at_ms = initial_next_run_at_ms(&schedule, now)?;
    let job = CronJob {
        id: Uuid::new_v4().to_string(),
        agent_id: agent_id.map(str::to_owned),
        name: name.to_owned(),
        description: description.to_owned(),
        schedule,
        enabled,
        payload,
        session_target: session_target.to_owned(),
        wake_mode: wake_mode.to_owned(),
        isolation,
        created_at_ms: now,
        updated_at_ms: now,
        state: CronJobState { next_run_at_ms },
    };
    state.jobs.push(job.clone());
    save_state(state_root, &state)?;
    Ok(json!({ "job": job }))
}

pub fn update(
    state_root: impl AsRef<Path>,
    id: &str,
    enabled: Option<bool>,
    description: Option<&str>,
) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let job = state
        .jobs
        .iter_mut()
        .find(|job| job.id == id)
        .ok_or_else(|| format!("cron job not found: {id}"))?;
    if let Some(enabled) = enabled {
        job.enabled = enabled;
    }
    if let Some(description) = description {
        job.description = description.to_owned();
    }
    job.updated_at_ms = now_ms()?;
    let job_value = serde_json::to_value(job.clone()).map_err(|err| err.to_string())?;
    save_state(state_root, &state)?;
    Ok(json!({ "job": job_value }))
}

pub fn run(state_root: impl AsRef<Path>, id: &str) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let fired_at_ms = now_ms()?;
    fire_job(&mut state, id, fired_at_ms, false)?;
    save_state(state_root, &state)?;
    Ok(json!({ "ok": true, "id": id }))
}

pub fn check_due_and_fire(state_root: impl AsRef<Path>) -> Result<Vec<Value>, String> {
    let mut state = load_state(&state_root)?;
    let now = now_ms()?;
    let due_job_ids = state
        .jobs
        .iter()
        .filter(|job| job.enabled && now >= job.state.next_run_at_ms)
        .map(|job| job.id.clone())
        .collect::<Vec<_>>();

    if due_job_ids.is_empty() {
        return Ok(Vec::new());
    }

    let mut fired = Vec::with_capacity(due_job_ids.len());
    for job_id in due_job_ids {
        fired.push(fire_job(&mut state, &job_id, now, true)?);
    }

    save_state(state_root, &state)?;
    Ok(fired)
}

pub fn runs(state_root: impl AsRef<Path>, id: &str) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let runs = state
        .runs
        .into_iter()
        .filter(|run| run.job_id == id)
        .collect::<Vec<_>>();
    Ok(json!({ "runs": runs, "entries": runs }))
}

pub fn remove(state_root: impl AsRef<Path>, id: &str) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    state.jobs.retain(|job| job.id != id);
    save_state(state_root, &state)?;
    Ok(json!({ "removed": true, "id": id }))
}

fn load_state(state_root: impl AsRef<Path>) -> Result<CronState, String> {
    let path = state_path(state_root);
    if !path.exists() {
        return Ok(CronState::default());
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

fn save_state(state_root: impl AsRef<Path>, state: &CronState) -> Result<(), String> {
    let path = state_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

fn state_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("cron.json")
}

fn fire_job(
    state: &mut CronState,
    id: &str,
    fired_at_ms: u128,
    rearm: bool,
) -> Result<Value, String> {
    let job = state
        .jobs
        .iter_mut()
        .find(|job| job.id == id)
        .ok_or_else(|| format!("cron job not found: {id}"))?;
    let previous_next_run_at_ms = job.state.next_run_at_ms;
    let next_run_at_ms = if rearm {
        next_run_after_ms(&job.schedule, previous_next_run_at_ms, fired_at_ms)?
    } else {
        None
    };

    if let Some(next_run_at_ms) = next_run_at_ms {
        job.state.next_run_at_ms = next_run_at_ms;
    } else if rearm {
        job.enabled = false;
    }
    job.updated_at_ms = fired_at_ms;

    let run = CronRun {
        job_id: id.to_owned(),
        ts: fired_at_ms,
        status: "ok".to_owned(),
        summary: job.name.clone(),
    };
    state.runs.push(run.clone());

    Ok(json!({
        "jobId": job.id,
        "agentId": job.agent_id,
        "name": job.name,
        "description": job.description,
        "schedule": job.schedule,
        "payload": job.payload,
        "sessionTarget": job.session_target,
        "wakeMode": job.wake_mode,
        "isolation": job.isolation,
        "firedAtMs": fired_at_ms,
        "previousNextRunAtMs": previous_next_run_at_ms,
        "nextRunAtMs": next_run_at_ms,
        "run": run,
    }))
}

fn next_run_after_ms(
    schedule: &Value,
    previous_next_run_at_ms: u128,
    now_ms: u128,
) -> Result<Option<u128>, String> {
    if let Some(interval_ms) = interval_ms(schedule)? {
        let baseline = previous_next_run_at_ms.max(1);
        let elapsed = now_ms.saturating_sub(baseline);
        let intervals_elapsed = (elapsed / interval_ms) + 1;
        return Ok(Some(baseline + intervals_elapsed * interval_ms));
    }

    if let Some(expression) = schedule.as_str() {
        if expression.trim().is_empty() {
            return Ok(None);
        }
        return next_cron_expression_ms(expression, now_ms).map(Some);
    }

    Ok(None)
}

fn initial_next_run_at_ms(schedule: &Value, now_ms: u128) -> Result<u128, String> {
    if let Some(at_ms) = at_ms(schedule)? {
        return Ok(at_ms);
    }

    if let Some(interval_ms) = interval_ms(schedule)? {
        return Ok(now_ms + interval_ms);
    }

    if let Some(expression) = schedule.as_str() {
        if expression.trim().is_empty() {
            return Ok(now_ms + 60_000);
        }
        return next_cron_expression_ms(expression, now_ms);
    }

    Ok(now_ms + 60_000)
}

fn interval_ms(schedule: &Value) -> Result<Option<u128>, String> {
    let Some(kind) = schedule.get("kind").and_then(Value::as_str) else {
        return Ok(None);
    };
    if kind != "every" {
        return Ok(None);
    }

    if let Some(every_ms) = schedule
        .get("everyMs")
        .or_else(|| schedule.get("every_ms"))
        .and_then(Value::as_u64)
    {
        if every_ms == 0 {
            return Err("cron everyMs schedule requires a positive value".to_owned());
        }
        return Ok(Some(every_ms as u128));
    }

    let amount = schedule
        .get("amount")
        .and_then(Value::as_u64)
        .filter(|amount| *amount > 0)
        .ok_or_else(|| "cron every schedule requires positive amount".to_owned())?
        as u128;
    let unit = schedule
        .get("unit")
        .and_then(Value::as_str)
        .unwrap_or("milliseconds");
    let multiplier = match unit {
        "millisecond" | "milliseconds" | "ms" => 1,
        "second" | "seconds" | "sec" | "secs" => 1_000,
        "minute" | "minutes" | "min" | "mins" => 60_000,
        "hour" | "hours" => 3_600_000,
        "day" | "days" => 86_400_000,
        other => return Err(format!("unsupported cron every unit: {other}")),
    };
    Ok(Some(amount * multiplier))
}

fn at_ms(schedule: &Value) -> Result<Option<u128>, String> {
    let Some(kind) = schedule.get("kind").and_then(Value::as_str) else {
        return Ok(None);
    };
    if kind != "at" {
        return Ok(None);
    }

    schedule
        .get("atMs")
        .or_else(|| schedule.get("at_ms"))
        .and_then(Value::as_u64)
        .map(|value| Some(value as u128))
        .ok_or_else(|| "cron at schedule requires atMs".to_owned())
}

fn next_cron_expression_ms(expression: &str, now_ms: u128) -> Result<u128, String> {
    let fields = CronFields::parse(expression)?;
    let start = DateTime::<Utc>::from_timestamp_millis(
        i64::try_from(now_ms).map_err(|_| "timestamp exceeds i64 range".to_owned())?,
    )
    .ok_or_else(|| "invalid current timestamp".to_owned())?;
    let mut candidate = start + Duration::minutes(1);
    candidate = candidate
        .with_second(0)
        .and_then(|dt| dt.with_nanosecond(0))
        .ok_or_else(|| "failed to normalize cron candidate timestamp".to_owned())?;

    for _ in 0..(366 * 24 * 60) {
        if fields.matches(candidate) {
            return u128::try_from(candidate.timestamp_millis())
                .map_err(|_| "cron candidate timestamp is negative".to_owned());
        }
        candidate += Duration::minutes(1);
    }

    Err(format!(
        "cron expression did not produce a run within 366 days: {expression}"
    ))
}

#[derive(Debug)]
struct CronFields {
    minutes: CronField,
    hours: CronField,
    days: CronField,
    months: CronField,
    weekdays: CronField,
}

impl CronFields {
    fn parse(expression: &str) -> Result<Self, String> {
        let parts = expression.split_whitespace().collect::<Vec<_>>();
        if parts.len() != 5 {
            return Err(format!("expected 5-field cron expression: {expression}"));
        }
        Ok(Self {
            minutes: CronField::parse(parts[0], 0, 59)?,
            hours: CronField::parse(parts[1], 0, 23)?,
            days: CronField::parse(parts[2], 1, 31)?,
            months: CronField::parse(parts[3], 1, 12)?,
            weekdays: CronField::parse(parts[4], 0, 7)?,
        })
    }

    fn matches(&self, candidate: DateTime<Utc>) -> bool {
        let weekday = candidate.weekday().num_days_from_sunday();
        self.minutes.matches(candidate.minute())
            && self.hours.matches(candidate.hour())
            && self.days.matches(candidate.day())
            && self.months.matches(candidate.month())
            && (self.weekdays.matches(weekday) || (weekday == 0 && self.weekdays.matches(7)))
    }
}

#[derive(Debug)]
struct CronField {
    allowed: Vec<u32>,
}

impl CronField {
    fn parse(raw: &str, min: u32, max: u32) -> Result<Self, String> {
        let mut allowed = Vec::new();
        for token in raw.split(',') {
            parse_cron_token(token.trim(), min, max, &mut allowed)?;
        }
        allowed.sort_unstable();
        allowed.dedup();
        if allowed.is_empty() {
            return Err(format!("empty cron field: {raw}"));
        }
        Ok(Self { allowed })
    }

    fn matches(&self, value: u32) -> bool {
        self.allowed.binary_search(&value).is_ok()
    }
}

fn parse_cron_token(raw: &str, min: u32, max: u32, allowed: &mut Vec<u32>) -> Result<(), String> {
    if raw.is_empty() {
        return Err("empty cron token".to_owned());
    }

    let (range_part, step) = match raw.split_once('/') {
        Some((range_part, step_part)) => {
            let step = step_part
                .parse::<u32>()
                .map_err(|_| format!("invalid cron step: {raw}"))?;
            if step == 0 {
                return Err(format!("cron step must be positive: {raw}"));
            }
            (range_part, step)
        }
        None => (raw, 1),
    };

    let (start, end) = if range_part == "*" {
        (min, max)
    } else if let Some((start, end)) = range_part.split_once('-') {
        (
            parse_cron_number(start, min, max)?,
            parse_cron_number(end, min, max)?,
        )
    } else {
        let value = parse_cron_number(range_part, min, max)?;
        (value, value)
    };

    if start > end {
        return Err(format!("cron range start exceeds end: {raw}"));
    }

    let mut value = start;
    while value <= end {
        allowed.push(value);
        value = value.saturating_add(step);
        if value == u32::MAX {
            break;
        }
    }
    Ok(())
}

fn parse_cron_number(raw: &str, min: u32, max: u32) -> Result<u32, String> {
    let value = raw
        .parse::<u32>()
        .map_err(|_| format!("invalid cron number: {raw}"))?;
    if value < min || value > max {
        return Err(format!("cron number out of range {min}-{max}: {raw}"));
    }
    Ok(value)
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn due_job_fires_and_records_run() {
        let state_root = temp_state_root("due_job_fires_and_records_run");
        write_state(
            &state_root,
            json!({
                "jobs": [job("due", true, 1_000, json!({"kind":"once"}))],
                "runs": []
            }),
        );

        let fired = check_due_and_fire(&state_root).expect("due check should succeed");
        let state = load_state(&state_root).expect("state should reload");

        assert_eq!(fired.len(), 1);
        assert_eq!(fired[0]["jobId"], "due");
        assert_eq!(state.runs.len(), 1);
        assert_eq!(state.runs[0].job_id, "due");
        assert_eq!(state.jobs[0].enabled, false);
    }

    #[test]
    fn recurring_every_schedule_rearms_next_run() {
        let state_root = temp_state_root("recurring_every_schedule_rearms_next_run");
        write_state(
            &state_root,
            json!({
                "jobs": [job("recurring", true, 1_000, json!({"kind":"every","amount":15,"unit":"minutes"}))],
                "runs": []
            }),
        );

        let fired = check_due_and_fire(&state_root).expect("due check should succeed");
        let state = load_state(&state_root).expect("state should reload");

        assert_eq!(fired.len(), 1);
        assert!(state.jobs[0].enabled);
        assert!(
            state.jobs[0].state.next_run_at_ms > fired[0]["firedAtMs"].as_u64().unwrap() as u128
        );
        assert_eq!(state.runs.len(), 1);
    }

    #[test]
    fn add_derives_initial_next_run_from_cron_expression() {
        let state_root = temp_state_root("add_derives_initial_next_run_from_cron_expression");
        let added = add(
            &state_root,
            "morning",
            "morning description",
            None,
            true,
            json!("0 6 * * *"),
            "main",
            "next-heartbeat",
            json!({"kind":"systemEvent","text":"morning"}),
            None,
        )
        .expect("cron add should succeed");

        let next_run = added["job"]["state"]["nextRunAtMs"]
            .as_u64()
            .expect("next run should be numeric") as u128;
        assert!(next_run > now_ms().expect("now should resolve"));
        assert_eq!(next_run % 60_000, 0);
    }

    #[test]
    fn due_at_schedule_fires_once_and_disables() {
        let state_root = temp_state_root("due_at_schedule_fires_once_and_disables");
        write_state(
            &state_root,
            json!({
                "jobs": [job("aeon-at", true, 1_000, json!({"kind":"at","atMs":1_000}))],
                "runs": []
            }),
        );

        let fired = check_due_and_fire(&state_root).expect("due check should succeed");
        let state = load_state(&state_root).expect("state should reload");

        assert_eq!(fired.len(), 1);
        assert_eq!(fired[0]["jobId"], "aeon-at");
        assert_eq!(state.runs.len(), 1);
        assert!(!state.jobs[0].enabled);
    }

    #[test]
    fn every_ms_schedule_rearms_after_fire() {
        let state_root = temp_state_root("every_ms_schedule_rearms_after_fire");
        write_state(
            &state_root,
            json!({
                "jobs": [job("every-ms", true, 1_000, json!({"kind":"every","everyMs":60_000}))],
                "runs": []
            }),
        );

        let fired = check_due_and_fire(&state_root).expect("due check should succeed");
        let state = load_state(&state_root).expect("state should reload");

        assert_eq!(fired.len(), 1);
        assert!(state.jobs[0].enabled);
        assert!(
            state.jobs[0].state.next_run_at_ms > fired[0]["firedAtMs"].as_u64().unwrap() as u128
        );
    }

    #[test]
    fn disabled_due_job_never_fires() {
        let state_root = temp_state_root("disabled_due_job_never_fires");
        write_state(
            &state_root,
            json!({
                "jobs": [job("disabled", false, 1_000, json!({"kind":"every","amount":1,"unit":"minutes"}))],
                "runs": []
            }),
        );

        let fired = check_due_and_fire(&state_root).expect("due check should succeed");
        let state = load_state(&state_root).expect("state should reload");

        assert!(fired.is_empty());
        assert!(state.runs.is_empty());
        assert_eq!(state.jobs[0].state.next_run_at_ms, 1_000);
    }

    fn job(id: &str, enabled: bool, next_run_at_ms: u128, schedule: Value) -> Value {
        json!({
            "id": id,
            "name": id,
            "description": format!("{id} description"),
            "schedule": schedule,
            "enabled": enabled,
            "payload": {"kind":"systemEvent","text":id},
            "sessionTarget": "main",
            "wakeMode": "next-heartbeat",
            "createdAtMs": 1,
            "updatedAtMs": 1,
            "state": {"nextRunAtMs": next_run_at_ms}
        })
    }

    fn temp_state_root(name: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!("epi-cron-{name}-{}", Uuid::new_v4()));
        fs::create_dir_all(&path).expect("temp cron state root should be created");
        path
    }

    fn write_state(state_root: &Path, state: Value) {
        fs::write(
            state_path(state_root),
            serde_json::to_string_pretty(&state).expect("state should serialize"),
        )
        .expect("state should write");
    }
}
