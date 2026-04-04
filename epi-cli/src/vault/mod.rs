pub mod frontmatter;
pub mod kairos;
pub mod pasu;
pub mod paths;
pub mod templates;

use crate::vault::paths::{
    archive_day_path, day_folder, day_note_path, now_note_path, thought_note_path,
};
use crate::vault::templates::{render_template, TemplateRenderContext};
use chrono::{DateTime, NaiveDate, Utc};
use clap::Subcommand;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Subcommand)]
pub enum VaultCmd {
    /// Show vault connection status
    Status,
    /// Create a new note
    Create {
        note: String,
        #[arg(short, long)]
        content: Option<String>,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Read a note
    Read {
        note: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Search note titles
    Search {
        query: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Search note content
    #[command(name = "search-content")]
    SearchContent {
        query: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Create/open daily note via obsidian CLI
    Daily {
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Get YAML frontmatter
    #[command(name = "frontmatter-get")]
    FrontmatterGet {
        note: String,
        #[arg(short, long)]
        key: Option<String>,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Set YAML frontmatter
    #[command(name = "frontmatter-set")]
    FrontmatterSet {
        note: String,
        key: String,
        value: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Move/rename note (updates wikilinks)
    Move {
        note: String,
        new_path: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Delete a note
    Delete {
        note: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Read the active NOW.md file
    #[command(name = "now-read")]
    NowRead,
    /// Write the active NOW.md file
    #[command(name = "now-write")]
    NowWrite { content: String },
    /// Resolve the managed NOW.md path for a session
    #[command(name = "now-path")]
    NowPath {
        #[arg(long)]
        session_id: String,
        #[arg(long)]
        now: Option<String>,
    },
    /// Set the default vault
    #[command(name = "set-default")]
    SetDefault { vault_name: String },
    /// Open a note in Obsidian
    Open {
        note: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Delete a frontmatter key
    #[command(name = "frontmatter-delete")]
    FrontmatterDelete {
        note: String,
        key: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Route a thought artifact to T0-T5
    #[command(name = "thought-route")]
    ThoughtRoute {
        #[arg(short, long)]
        position: u8,
        #[arg(short = 'x', long = "content")]
        content: String,
        #[arg(short, long)]
        session_id: Option<String>,
        #[arg(long)]
        coordinate: Option<String>,
        #[arg(long)]
        now: Option<String>,
    },
    /// Validate frontmatter of a note
    #[command(name = "frontmatter-validate")]
    FrontmatterValidate {
        note: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Render a template by type
    #[command(name = "template-invoke")]
    TemplateInvoke {
        template_type: String,
        #[arg(long)]
        coordinate: Option<String>,
        #[arg(long)]
        session_id: Option<String>,
        #[arg(long)]
        now: Option<String>,
    },
    /// Initialize the day folder and daily note
    #[command(name = "day-init")]
    DayInit {
        #[arg(long)]
        now: Option<String>,
    },
    /// Initialize a NOW folder for the provided session
    #[command(name = "now-init")]
    NowInit {
        #[arg(long)]
        session_id: String,
        #[arg(long)]
        now: Option<String>,
    },
    /// Archive a day folder into History
    #[command(name = "archive-day")]
    ArchiveDay {
        date: String,
        /// Print SOURCE → DEST paths without moving (for obsidian move)
        #[arg(long)]
        plan: bool,
        /// Skip c_5_reflection_complete check
        #[arg(long)]
        force: bool,
    },
    /// Initialize FLOW.md (CT0 daily journal) in today's Day folder
    #[command(name = "flow-init")]
    FlowInit {
        #[arg(long)]
        now: Option<String>,
    },
    /// Interact with PASU.md (non-dual agent-user field)
    #[command(subcommand)]
    Pasu(PasuCmd),
    /// Kairos temporal enrichment (kerykeion natal chart)
    #[command(subcommand)]
    Kairos(KairosCmd),
}

#[derive(Subcommand)]
pub enum PasuCmd {
    /// Show full PASU.md content
    Show,
    /// Get a PASU field value (birth-date, birth-location, natal-chart-path)
    Get { field: String },
    /// Set a PASU field value
    Set { field: String, value: String },
}

#[derive(Subcommand)]
pub enum KairosCmd {
    /// Show kairos status (mode, planet_valid bitmask)
    Status,
    /// Fetch natal chart from kerykeion (requires PASU birth data)
    Fetch {
        /// Recompute even if chart already exists
        #[arg(long)]
        force: bool,
    },
    /// Print current natal chart JSON
    Show,
}

pub fn dispatch(cmd: &VaultCmd) -> Result<String, String> {
    match cmd {
        VaultCmd::Status => match obsidian_cli(&["print-default"]) {
            Ok(vault) => Ok(format!("Default vault: {}", vault.trim())),
            Err(e) => Err(e),
        },
        VaultCmd::Create {
            note,
            content,
            vault,
        } => {
            let mut args = vec!["create", note.as_str()];
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            if let Some(c) = content {
                args.extend(["-c", c.as_str()]);
            }
            obsidian_cli(&args)
        }
        VaultCmd::Read { note, vault } => {
            let mut args = vec!["print", note.as_str()];
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }
        VaultCmd::Search { query, vault } => {
            let mut args = vec!["search", query.as_str()];
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }
        VaultCmd::SearchContent { query, vault } => {
            let mut args = vec!["search-content", query.as_str()];
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }
        VaultCmd::Daily { vault } => {
            let mut args = vec!["daily"];
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }
        VaultCmd::FrontmatterGet { note, key, vault } => {
            let mut args = vec!["frontmatter", note.as_str(), "--print"];
            if let Some(k) = key {
                args.extend(["--key", k.as_str()]);
            }
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }
        VaultCmd::FrontmatterSet {
            note,
            key,
            value,
            vault,
        } => {
            let mut args = vec![
                "frontmatter",
                note.as_str(),
                "--edit",
                "--key",
                key.as_str(),
                "--value",
                value.as_str(),
            ];
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }
        VaultCmd::Move {
            note,
            new_path,
            vault,
        } => {
            let mut args = vec!["move", note.as_str(), new_path.as_str()];
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }
        VaultCmd::Delete { note, vault } => {
            let mut args = vec!["delete", note.as_str()];
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }
        VaultCmd::NowRead => {
            let now_path = active_now_path();
            fs::read_to_string(&now_path)
                .map_err(|err| format!("Failed to read {}: {err}", now_path.display()))
        }
        VaultCmd::NowWrite { content } => {
            let now_path = active_now_path();
            if let Some(parent) = now_path.parent() {
                fs::create_dir_all(parent)
                    .map_err(|err| format!("Failed to create {}: {err}", parent.display()))?;
            }
            fs::write(&now_path, content)
                .map_err(|err| format!("Failed to write {}: {err}", now_path.display()))?;
            Ok(format!(
                "Wrote {} bytes to {}",
                content.len(),
                now_path.display()
            ))
        }
        VaultCmd::NowPath { session_id, now } => now_path(session_id, now.as_deref()),
        VaultCmd::SetDefault { vault_name } => obsidian_cli(&["set-default", vault_name.as_str()]),
        VaultCmd::Open { note, vault } => {
            let mut args = vec!["open", note.as_str()];
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }
        VaultCmd::FrontmatterDelete { note, key, vault } => {
            let mut args = vec![
                "frontmatter",
                note.as_str(),
                "--delete",
                "--key",
                key.as_str(),
            ];
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }
        VaultCmd::ThoughtRoute {
            position,
            content,
            session_id,
            coordinate,
            now,
        } => route_thought(
            *position,
            content,
            session_id.as_deref(),
            coordinate.as_deref(),
            now.as_deref(),
        ),
        VaultCmd::FrontmatterValidate { note, vault } => {
            let mut args = vec!["frontmatter", note.as_str(), "--print"];
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            let raw = obsidian_cli(&args)?;
            let yaml: serde_yaml::Value = serde_yaml::from_str(&raw)
                .map_err(|e| format!("Failed to parse frontmatter YAML: {e}"))?;
            let result = frontmatter::validate_frontmatter(&yaml);
            let mut messages = Vec::new();
            for w in &result.warnings {
                messages.push(format!("WARNING: {w}"));
            }
            for e in &result.errors {
                messages.push(format!("ERROR: {e}"));
            }
            if messages.is_empty() {
                Ok("Frontmatter is valid.".to_string())
            } else {
                Ok(messages.join("\n"))
            }
        }
        VaultCmd::TemplateInvoke {
            template_type,
            coordinate,
            session_id,
            now,
        } => {
            let context = TemplateRenderContext {
                template_type: template_type.clone(),
                coordinate: coordinate.clone(),
                session_id: session_id.clone(),
                now: parse_now(now.as_deref())?,
            };
            render_template(&context, &repo_root(), &home_root())
        }
        VaultCmd::DayInit { now } => day_init(now.as_deref()),
        VaultCmd::NowInit { session_id, now } => now_init(session_id, now.as_deref()),
        VaultCmd::ArchiveDay { date, plan, force } => archive_day(date, *plan, *force),
        VaultCmd::FlowInit { now } => flow_init(now.as_deref()),
        VaultCmd::Pasu(sub) => {
            let vr = vault_root();
            match sub {
                PasuCmd::Show => pasu::pasu_show(&vr),
                PasuCmd::Get { field } => pasu::pasu_get(&vr, field),
                PasuCmd::Set { field, value } => pasu::pasu_set(&vr, field, value),
            }
        }
        VaultCmd::Kairos(sub) => {
            let vr = vault_root();
            match sub {
                KairosCmd::Status => kairos::kairos_status(&vr),
                KairosCmd::Fetch { force } => kairos::kairos_fetch(&vr, *force),
                KairosCmd::Show => kairos::kairos_show(&vr),
            }
        }
    }
}

fn obsidian_cli(args: &[&str]) -> Result<String, String> {
    match Command::new("obsidian-cli").args(args).output() {
        Ok(out) if out.status.success() => Ok(String::from_utf8_lossy(&out.stdout).to_string()),
        Ok(out) => Err(String::from_utf8_lossy(&out.stderr).to_string()),
        Err(err) => Err(format!("Failed to execute obsidian-cli: {err}")),
    }
}

fn parse_now(raw: Option<&str>) -> Result<DateTime<Utc>, String> {
    match raw {
        Some(value) => DateTime::parse_from_rfc3339(value)
            .map(|dt| dt.with_timezone(&Utc))
            .map_err(|err| format!("invalid timestamp {value:?}: {err}")),
        None => Ok(Utc::now()),
    }
}

fn vault_root() -> PathBuf {
    // 1. Explicit env var (base.env or test override) — trusted when non-empty
    if let Ok(v) = std::env::var("EPILOGOS_VAULT") {
        if !v.is_empty() {
            return PathBuf::from(v);
        }
    }
    // 2. {repo_root}/Idea if present (the canonical repo-as-vault layout)
    let repo = repo_root();
    let idea = repo.join("Idea");
    if idea.exists() {
        return idea;
    }
    // 3. Legacy home-based fallback
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("Documents")
        .join("Epi-Logos")
        .join("Idea")
}

fn repo_root() -> PathBuf {
    std::env::var("EPI_REPO_ROOT")
        .map(PathBuf::from)
        .or_else(|_| std::env::current_dir())
        .unwrap_or_else(|_| PathBuf::from("."))
}

/// Resolve the Obsidian vault name for -v flag injection.
/// Priority: EPI_VAULT_NAME env var → .obsidian/ in repo_root → None
fn vault_name() -> Option<String> {
    if let Ok(name) = std::env::var("EPI_VAULT_NAME") {
        if !name.is_empty() {
            return Some(name);
        }
    }
    let repo = repo_root();
    if repo.join(".obsidian").exists() {
        if let Some(name) = repo.file_name().and_then(|n| n.to_str()) {
            return Some(name.to_string());
        }
    }
    None
}

fn home_root() -> PathBuf {
    std::env::var("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("."))
}

fn active_now_path() -> PathBuf {
    std::env::var("EPI_NOW_PATH")
        .map(PathBuf::from)
        .unwrap_or_else(|_| vault_root().join("Empty").join("Present").join("NOW.md"))
}

fn write_rendered_template(path: &Path, body: &str) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|err| format!("failed to create {}: {err}", parent.display()))?;
    }
    fs::write(path, body).map_err(|err| format!("failed to write {}: {err}", path.display()))
}

fn day_init(now_override: Option<&str>) -> Result<String, String> {
    let now = parse_now(now_override)?;
    let path = day_note_path(&vault_root(), now);
    let context = TemplateRenderContext {
        template_type: "daily-note".to_string(),
        coordinate: None,
        session_id: None,
        now,
    };
    let body = render_template(&context, &repo_root(), &home_root())?;
    write_rendered_template(&path, &body)?;
    Ok(format!("created {}", path.display()))
}

fn now_init(session_id: &str, now_override: Option<&str>) -> Result<String, String> {
    let now = parse_now(now_override)?;
    let vr = vault_root();
    let now_dir = day_folder(&vr, now).join(session_id);

    // Create NOW subdirectories per Hen CONTRACT
    for subdir in &["thinking", "thoughts", "tasks", "patterns"] {
        fs::create_dir_all(now_dir.join(subdir)).map_err(|e| format!("create {subdir}/: {e}"))?;
    }

    let path = now_note_path(&vr, now, session_id);
    let context = TemplateRenderContext {
        template_type: "now".to_string(),
        coordinate: None,
        session_id: Some(session_id.to_string()),
        now,
    };
    let body = render_template(&context, &repo_root(), &home_root())?;
    write_rendered_template(&path, &body)?;
    Ok(format!("created {}", path.display()))
}

fn now_path(session_id: &str, now_override: Option<&str>) -> Result<String, String> {
    let now = parse_now(now_override)?;
    let path = now_note_path(&vault_root(), now, session_id);
    Ok(path.display().to_string())
}

fn route_thought(
    position: u8,
    content: &str,
    session_id: Option<&str>,
    coordinate: Option<&str>,
    now_override: Option<&str>,
) -> Result<String, String> {
    let now = parse_now(now_override)?;
    let path = thought_note_path(&vault_root(), now, position);
    let context = TemplateRenderContext {
        template_type: "thought".to_string(),
        coordinate: Some(
            coordinate
                .unwrap_or(&format!("T{}", position.min(5)))
                .to_string(),
        ),
        session_id: session_id.map(ToOwned::to_owned),
        now,
    };
    let mut body = render_template(&context, &repo_root(), &home_root())?;
    body.push_str(content);
    body.push('\n');
    write_rendered_template(&path, &body)?;
    Ok(format!("routed {}", path.display()))
}

fn flow_init(now_override: Option<&str>) -> Result<String, String> {
    let now = parse_now(now_override)?;
    let vr = vault_root();
    let day_dir = day_folder(&vr, now);
    let flow_path = day_dir.join("FLOW.md");
    if flow_path.exists() {
        return Ok(format!(
            "flow-init: FLOW.md already exists (noop) {}",
            flow_path.display()
        ));
    }
    fs::create_dir_all(&day_dir).map_err(|e| format!("create day dir: {e}"))?;
    let context = TemplateRenderContext {
        template_type: "flow".to_string(),
        coordinate: None,
        session_id: None,
        now,
    };
    let body = render_template(&context, &repo_root(), &home_root())?;
    fs::write(&flow_path, &body).map_err(|e| format!("write FLOW.md: {e}"))?;
    Ok(format!(
        "flow-init: created FLOW.md at {}",
        flow_path.display()
    ))
}

fn archive_day(date: &str, plan: bool, force: bool) -> Result<String, String> {
    let day = NaiveDate::parse_from_str(date, "%d-%m-%Y")
        .map_err(|err| format!("invalid archive date {date:?}: {err}"))?;
    let vr = vault_root();
    let source = vr
        .join("Empty")
        .join("Present")
        .join(day.format("%d-%m-%Y").to_string());
    let target = archive_day_path(&vr, day);
    if !source.exists() {
        return Err(format!("day folder not found: {}", source.display()));
    }

    // Reflection guard: require c_5_reflection_complete: true in daily-note
    if !force {
        let daily_note = source.join("daily-note.md");
        let content = fs::read_to_string(&daily_note)
            .map_err(|_| format!("cannot read {}", daily_note.display()))?;
        if !content.contains("c_5_reflection_complete: true") {
            return Err("c_5_reflection_complete not set — use --force to override".into());
        }
    }

    if plan {
        // Print paths for obsidian move — do NOT touch filesystem
        return Ok(format!("{} → {}", source.display(), target.display()));
    }

    // Direct archive (fallback when obsidian CLI not available)
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent)
            .map_err(|err| format!("failed to create {}: {err}", parent.display()))?;
    }
    fs::rename(&source, &target).map_err(|err| {
        format!(
            "failed to archive {} -> {}: {err}",
            source.display(),
            target.display()
        )
    })?;
    Ok(format!("archived {}", target.display()))
}
