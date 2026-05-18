use crate::{
    agent::session_propagation::default_gateway_state_root,
    gate::sessions::SessionStore,
    sesh::session::{read_session_state, repo_root_from_env},
};
use chrono::{DateTime, Utc};
use clap::Subcommand;
use serde::Serialize;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};

const GOAL_CHAR_LIMIT: usize = 4_000;

#[derive(Subcommand)]
pub enum GoalCmd {
    /// Write a dialogical GoalPrelude into the active NOW without executing it
    Prelude {
        /// Raw user goal text. Must be 4,000 characters or fewer.
        goal: String,
        /// Explicit NOW.md path. Defaults to EPI_NOW_PATH, gateway session, or .epi/session.json.
        #[arg(long = "now-path")]
        now_path: Option<PathBuf>,
        /// Gateway session key used to resolve NOW when --now-path is absent.
        #[arg(long = "session-key")]
        session_key: Option<String>,
        /// Override session id when NOW path does not follow Empty/Present/{day}/{session}/now.md.
        #[arg(long = "session-id")]
        session_id: Option<String>,
        /// Override day id when NOW path does not follow Empty/Present/{day}/{session}/now.md.
        #[arg(long = "day-id")]
        day_id: Option<String>,
        /// Deterministic creation timestamp for tests/automation.
        #[arg(long = "created-at")]
        created_at: Option<String>,
    },
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct GoalPreludeOutput {
    path: String,
    now_path: String,
    session_id: String,
    day_id: String,
    created_at: String,
    summary: String,
}

pub fn run(cmd: &GoalCmd, json: bool) -> Result<String, String> {
    match cmd {
        GoalCmd::Prelude {
            goal,
            now_path,
            session_key,
            session_id,
            day_id,
            created_at,
        } => {
            let output = write_goal_prelude(GoalPreludeRequest {
                goal,
                now_path: now_path.as_deref(),
                session_key: session_key.as_deref(),
                session_id: session_id.as_deref(),
                day_id: day_id.as_deref(),
                created_at: created_at.as_deref(),
            })?;
            if json {
                serde_json::to_string_pretty(&output)
                    .map_err(|err| format!("failed to serialize goal prelude output: {err}"))
            } else {
                Ok(format!(
                    "GOAL_PRELUDE_PATH={}\nEPI_NOW_PATH={}\nEPI_SESSION_ID={}\nEPI_DAY_ID={}\ncreated_at={}\nsummary={}",
                    output.path,
                    output.now_path,
                    output.session_id,
                    output.day_id,
                    output.created_at,
                    output.summary
                ))
            }
        }
    }
}

struct GoalPreludeRequest<'a> {
    goal: &'a str,
    now_path: Option<&'a Path>,
    session_key: Option<&'a str>,
    session_id: Option<&'a str>,
    day_id: Option<&'a str>,
    created_at: Option<&'a str>,
}

fn write_goal_prelude(request: GoalPreludeRequest<'_>) -> Result<GoalPreludeOutput, String> {
    let goal = request.goal.trim();
    if goal.is_empty() {
        return Err("goal prelude requires non-empty goal text".to_owned());
    }
    let char_count = goal.chars().count();
    if char_count > GOAL_CHAR_LIMIT {
        return Err(format!(
            "goal prelude is {char_count} characters; limit is {GOAL_CHAR_LIMIT}"
        ));
    }

    let now_path = resolve_now_path(request.now_path, request.session_key)?;
    let inferred = infer_now_identity(&now_path);
    let session_id = request
        .session_id
        .map(ToOwned::to_owned)
        .or_else(|| {
            inferred
                .as_ref()
                .map(|identity| identity.session_id.clone())
        })
        .ok_or_else(|| {
            "goal prelude requires session id; pass --session-id or use a canonical NOW path"
                .to_owned()
        })?;
    let day_id = request
        .day_id
        .map(ToOwned::to_owned)
        .or_else(|| inferred.as_ref().map(|identity| identity.day_id.clone()))
        .ok_or_else(|| {
            "goal prelude requires day id; pass --day-id or use a canonical NOW path".to_owned()
        })?;
    let created_at = parse_created_at(request.created_at)?;
    let now_dir = now_path
        .parent()
        .ok_or_else(|| format!("NOW path has no parent: {}", now_path.display()))?;
    let goals_dir = now_dir.join("goals");
    fs::create_dir_all(&goals_dir)
        .map_err(|err| format!("failed to create {}: {err}", goals_dir.display()))?;

    let filename = format!("goal-prelude-{}.md", created_at.format("%Y%m%d-%H%M%S"));
    let goal_path = goals_dir.join(filename);
    let body = render_goal_prelude(goal, &session_id, &day_id, created_at);
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&goal_path)
        .map_err(|err| format!("failed to create {}: {err}", goal_path.display()))?;
    file.write_all(body.as_bytes())
        .map_err(|err| format!("failed to write {}: {err}", goal_path.display()))?;

    Ok(GoalPreludeOutput {
        path: goal_path.display().to_string(),
        now_path: now_path.display().to_string(),
        session_id,
        day_id,
        created_at: created_at.to_rfc3339(),
        summary: summary_for(goal),
    })
}

fn resolve_now_path(explicit: Option<&Path>, session_key: Option<&str>) -> Result<PathBuf, String> {
    if let Some(path) = explicit {
        return Ok(path.to_path_buf());
    }
    if let Ok(path) = std::env::var("EPI_NOW_PATH") {
        let trimmed = path.trim();
        if !trimmed.is_empty() {
            return Ok(PathBuf::from(trimmed));
        }
    }
    let env_session_key = std::env::var("EPI_GATEWAY_SESSION_KEY")
        .ok()
        .or_else(|| std::env::var("EPI_PARENT_SESSION").ok());
    if let Some(key) = session_key
        .filter(|key| !key.trim().is_empty())
        .map(ToOwned::to_owned)
        .or(env_session_key)
    {
        if let Some(path) = resolve_now_path_from_gateway(&key)? {
            return Ok(path);
        }
    }
    if let Ok(state) = read_session_state(&repo_root_from_env()) {
        return Ok(state.context.now_path);
    }
    Err("goal prelude requires an active NOW path; pass --now-path, set EPI_NOW_PATH, or initialize an agent session".to_owned())
}

fn resolve_now_path_from_gateway(session_key: &str) -> Result<Option<PathBuf>, String> {
    let store = SessionStore::new(default_gateway_state_root())?;
    match store.resolve(session_key) {
        Ok(record) => Ok(record.vault_now_path.map(PathBuf::from)),
        Err(_) => Ok(None),
    }
}

#[derive(Debug)]
struct NowIdentity {
    day_id: String,
    session_id: String,
}

fn infer_now_identity(now_path: &Path) -> Option<NowIdentity> {
    let file_name = now_path.file_name()?.to_str()?;
    if file_name != "now.md" {
        return None;
    }
    let session_id = now_path.parent()?.file_name()?.to_str()?.to_owned();
    let day_id = now_path
        .parent()?
        .parent()?
        .file_name()?
        .to_str()?
        .to_owned();
    Some(NowIdentity { day_id, session_id })
}

fn parse_created_at(raw: Option<&str>) -> Result<DateTime<Utc>, String> {
    match raw {
        Some(value) => DateTime::parse_from_rfc3339(value)
            .map(|time| time.with_timezone(&Utc))
            .map_err(|err| format!("invalid --created-at {value:?}: {err}")),
        None => Ok(Utc::now()),
    }
}

fn render_goal_prelude(
    goal: &str,
    session_id: &str,
    day_id: &str,
    created_at: DateTime<Utc>,
) -> String {
    let title = summary_for(goal);
    let fence = markdown_fence_for(goal);
    format!(
        r#"---
c_4_artifact_role: "goal-prelude"
c_1_ct_type: "CT4b"
c_3_ctx_frame: "4.0/1-4.4/5"
c_3_invocation_kind: "goal"
c_3_session_id: "{session_id}"
c_3_day_id: "{day_id}"
c_3_created_at: "{created_at}"
c_0_source_coordinates:
  - "[[S4.4']]"
c_4_vak_status: "prelude"
c_4_cpf: "(00/00)"
c_4_cf: "(0000)"
c_4_cs: "Day"
c_5_review_required: false
---

# Goal Prelude - {title}

[[NOW-{session_id}]] | [[S4.4']] | [[Anima]] | [[Psyche]] | [[Nous]]

## #0 - Ground / Questions

Original user wording:

{fence}
{goal}
{fence}

Open questions:

- What intent should remain dialogical before execution?
- What source context should [[Nous]] gather before [[Psyche]] compiles a task-world?

Assumptions to check:

- This is a first-pass prelude, not an autonomous run.
- VAK coordinates are provisional until the next invocation re-resolves them.

## #1 - Material / Sources

Context gathered by [[Nous]]:

- Pending.

Relevant kbase, vault, graph, or prior-session references:

- Pending.

## #2 - Possible Operations

Candidate next actions:

- Return this prelude to the user for correction, confirmation, or reframing.

Immediate run possibility:

- Compile a `GoalSpec` only after explicit user assent.

Scheduled run possibility:

- Chronos may schedule only a confirmed `GoalSpec`, never this raw prelude.

## #3 - Patterns / Shape

Likely task shape:

- Dialogical discovery surface.

VAK thread candidates:

- CPF: `(00/00)`
- CF: `(0000)` / [[Nous]]
- CFP: unresolved
- CS: `Day`

## #4 - Context / Psyche State

How this fits the current NOW:

- The prelude belongs to the active NOW as Psyche session memory.

Affected coordinates:

- [[S4.4']]
- [[S4.3']] if this becomes scheduled
- [[S4.5']] / [[S5']] if review, disclosure, autoresearch, or crystallisation is requested

Permission, safety, and human-dialogue boundaries:

- Do not start a run, cron job, Epii review, or permanent promotion from this file alone.

## #5 - Integration / User-Facing Return

Distilled intent:

- {title}

Recommended next mode:

- Dialogue with the user, then optionally compile a confirmed `GoalSpec`.

What needs user confirmation:

- Whether to continue into immediate execution, isolated NOW execution, cron scheduling, or review/autoresearch.
"#,
        created_at = created_at.to_rfc3339(),
    )
}

fn summary_for(goal: &str) -> String {
    let normalized = goal.split_whitespace().collect::<Vec<_>>().join(" ");
    let mut words = normalized.split_whitespace().take(10).collect::<Vec<_>>();
    if words.is_empty() {
        return "Untitled Goal".to_owned();
    }
    let mut summary = words.join(" ");
    if normalized.split_whitespace().count() > words.len() {
        summary.push_str("...");
    }
    if summary.len() > 96 {
        summary.truncate(93);
        summary.push_str("...");
    }
    words.clear();
    summary
}

fn markdown_fence_for(text: &str) -> String {
    let longest = text
        .lines()
        .filter_map(|line| {
            let trimmed = line.trim_start();
            if trimmed.starts_with("```") {
                Some(trimmed.chars().take_while(|ch| *ch == '`').count())
            } else {
                None
            }
        })
        .max()
        .unwrap_or(2);
    "`".repeat(longest + 1)
}
