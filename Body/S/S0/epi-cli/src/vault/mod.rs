//! # S0 vault helpers — IOD-19 / ADR-05-010 boundary audit (Track 13 T8)
//!
//! Per [ADR-05-010](../../../../../../Idea/Pratibimba/System/docs/decisions/adr-05-010-hen-vault-bridge.md)
//! and the IOD-19 decision (Hen as vault-write gatekeeper), the S1' gateway
//! methods `s1'.vault.{read_file, write_file, rename_file, move_file}` and
//! `s1'.semantic.suggest_links` are the canonical vault-write surface for
//! Theia, M-extensions, agents, and integrated plugins. They are implemented
//! in [`crate::gate::s1_hen`] and dispatched via the S3 gateway
//! ([`Body/S/S3/gateway/src/dispatch.rs`](../../../../S3/gateway/src/dispatch.rs)
//! lines 174-192, Track 03 T6.5 — **LANDED**).
//!
//! The S0 epi-cli helpers below predate that boundary and fall into three
//! classes:
//!
//! 1. **`obsidian-cli` shells** (Create / FrontmatterSet / FrontmatterDelete /
//!    Move / Delete) — *deprecated for agentic / Theia use*. They remain only
//!    as **operator-local terminal escape hatches** for users running
//!    `obsidian-cli` against a desktop Obsidian instance. Agents and the
//!    Theia `vault-bridge` extension MUST route through `s1'.vault.*` per
//!    ADR-05-010 §2. See per-arm `# DEPRECATED ROUTE` comments below.
//!
//! 2. **Direct-filesystem writes for managed scaffolding** (NowWrite,
//!    ThoughtRoute, DayInit, NowInit, FlowInit, ArchiveDay, pasu::pasu_set,
//!    kairos::kairos_fetch). These are **local bootstrap / fast-path
//!    operations** that the S0 CLI owns — they create scaffolded structures
//!    rather than mutating existing wikilink-bearing content. They are
//!    **governed-local** writes: not routed through Hen because they
//!    instantiate fresh templates (no inbound wikilinks to reconcile).
//!    EXCEPTION: `ArchiveDay::fs::rename(day_folder, history_path)` *can*
//!    leave orphaned wikilinks if any day-folder note has inbound `[[X]]`
//!    references from elsewhere in the vault. Per ADR-05-010 §2 it should
//!    route through `s1'.vault.move_file` once Hen exposes a directory-move
//!    surface (see `// TODO(IOD-19):` comment on `archive_day`).
//!
//! 3. **Frontmatter mutations** (FrontmatterSet / FrontmatterDelete via
//!    obsidian-cli, pasu::pasu_set via direct fs::write). These need
//!    `s1'.vault.update_frontmatter`, which is **DEFERRED** per
//!    [`crate::gate::s1_hen`] module docstring lines 23-24. Until that
//!    Hen-side surface lands, these helpers stay direct-FS / obsidian-cli
//!    with the `# DEPRECATED ROUTE` annotation pointing at the replacement
//!    method name. See Track 03 T6.5 follow-up.
//!
//! See `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/13-t8-s1-vault-hen-evidence.md`
//! for the full audit table.

pub mod frontmatter;
pub mod kairos;
pub mod pasu;
pub mod paths;
pub mod templates;

use crate::vault::paths::{
    archive_day_path, day_folder, day_note_path, now_note_path, thought_note_path,
};
use crate::vault::templates::{
    render_template, render_template_with_vak_and_summary, TemplateRenderContext,
};
use chrono::{DateTime, NaiveDate, Utc};
use clap::Subcommand;
use epi_s1_hen_compiler_core::{suggest_link_candidates, LinkCandidateRequest};
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
    /// Suggest ranked wikilink targets from Smart Env cache
    #[command(name = "link-suggest")]
    LinkSuggest {
        note: String,
        #[arg(long = "source-coordinate")]
        source_coordinates: Vec<String>,
        #[arg(long, default_value_t = 10)]
        limit: usize,
        #[arg(long)]
        include_stale: bool,
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
        /// JSON-encoded producing `portal_core::VakAddress`. When present and
        /// parses successfully, the seven canonical VAK keys are inlined
        /// into the SAME `---...---` frontmatter block as the template keys
        /// — producing a single, parser-readable block. When absent or
        /// malformed JSON, this flag is rejected with a non-zero exit so
        /// callers don't silently lose VAK provenance (the
        /// aletheia_thought_route extension omits the flag entirely when
        /// no VAK is available, which is dialogical pass-through).
        #[arg(long = "vak-address-json")]
        vak_address_json: Option<String>,
        /// Optional summary line emitted as `summary: "..."` inside the same
        /// ---...--- frontmatter block as the template keys (above any VAK
        /// keys). YAML-quoted via `serde_yaml` so embedded quotes, colons,
        /// or newlines round-trip safely. When omitted, no `summary:` key is
        /// emitted (consistent with the dialogical pass-through pattern used
        /// for `--vak-address-json`). The TS-side `aletheia_thought_route`
        /// tool falls back to `content.split("\n")[0].slice(0, 200)` when
        /// the agent doesn't pass a summary explicitly.
        #[arg(long = "summary")]
        summary: Option<String>,
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
            // DEPRECATED ROUTE (IOD-19 / ADR-05-010): obsidian-cli `create`
            // bypasses Hen wikilink integrity. Replacement: dispatch through
            // `s1'.vault.write_file` (gate::s1_hen::write_file). Theia
            // vault-bridge and agents MUST use the gateway path. This arm is
            // retained only as a local terminal escape hatch for operators
            // running against a desktop Obsidian instance.
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
        VaultCmd::LinkSuggest {
            note,
            source_coordinates,
            limit,
            include_stale,
        } => {
            let response = suggest_link_candidates(LinkCandidateRequest {
                vault_root: vault_root(),
                note_path: PathBuf::from(note),
                source_wikilinks: source_coordinates.clone(),
                limit: *limit,
                include_stale: *include_stale,
            })?;
            serde_json::to_string_pretty(&response)
                .map_err(|error| format!("Failed to serialize link suggestions: {error}"))
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
            // DEPRECATED ROUTE (IOD-19 / ADR-05-010): obsidian-cli frontmatter
            // edits bypass Hen frontmatter governance. Replacement:
            // `s1'.vault.update_frontmatter` — DEFERRED in
            // `gate::s1_hen` module docstring (line 24). Once Hen exposes the
            // surface, route through `gate::s1_hen::update_frontmatter`.
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
            // DEPRECATED ROUTE (IOD-19 / ADR-05-010): obsidian-cli `move` does
            // NOT atomically reconcile inbound `[[X]]` references. Replacement
            // (LANDED): `s1'.vault.move_file` →
            // `gate::s1_hen::rename_or_move_file`, which rewrites every
            // inbound wikilink via Hen's `parse_wikilinks` + the atomic
            // rename receipt. See test
            // `tests/gate_s1_vault_surface.rs::rename_file_reconciles_all_inbound_wikilinks_atomically`
            // and the T8 fixture-vault wikilink-integrity test
            // `tests/vault_hen_boundary_audit.rs`.
            let mut args = vec!["move", note.as_str(), new_path.as_str()];
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }
        VaultCmd::Delete { note, vault } => {
            // DEPRECATED ROUTE (IOD-19 / ADR-05-010): obsidian-cli `delete`
            // does not surface dangling-wikilink warnings. Replacement
            // (DEFERRED): `s1'.vault.delete_file` (not yet exposed in
            // `gate::s1_hen`). Until then, callers should
            // `s1'.semantic.suggest_links` against the note's inbound
            // wikilinks to detect orphans before invoking.
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
        VaultCmd::SetDefault { vault_name } => {
            // Persist EPI_VAULT_NAME to base.env so PI sessions inherit it
            let _ = set_vault_name_in_base_env(vault_name);
            obsidian_cli(&["set-default", vault_name.as_str()])
        }
        VaultCmd::Open { note, vault } => {
            let mut args = vec!["open", note.as_str()];
            if let Some(v) = vault {
                args.extend(["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }
        VaultCmd::FrontmatterDelete { note, key, vault } => {
            // DEPRECATED ROUTE (IOD-19 / ADR-05-010): see FrontmatterSet.
            // Replacement: `s1'.vault.update_frontmatter` — DEFERRED.
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
            vak_address_json,
            summary,
        } => {
            let vak_address = match vak_address_json.as_deref() {
                Some(raw) => Some(
                    serde_json::from_str::<portal_core::VakAddress>(raw)
                        .map_err(|err| format!("invalid --vak-address-json: {err}"))?,
                ),
                None => None,
            };
            route_thought(
                *position,
                content,
                session_id.as_deref(),
                coordinate.as_deref(),
                now.as_deref(),
                vak_address.as_ref(),
                summary.as_deref(),
            )
        }
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

/// Commands that configure the vault itself — must NOT receive -v injection
const VAULT_CONFIG_CMDS: &[&str] = &["set-default", "print-default", "open-vault"];

fn obsidian_cli(args: &[&str]) -> Result<String, String> {
    let is_config_cmd = args
        .first()
        .map(|cmd| VAULT_CONFIG_CMDS.contains(cmd))
        .unwrap_or(false);

    let injected: Vec<String> = if !is_config_cmd {
        if let Some(name) = vault_name() {
            let mut v = vec!["-v".to_string(), name];
            v.extend(args.iter().map(|s| s.to_string()));
            v
        } else {
            args.iter().map(|s| s.to_string()).collect()
        }
    } else {
        args.iter().map(|s| s.to_string()).collect()
    };

    match Command::new("obsidian-cli").args(&injected).output() {
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

/// Write (or update) EPI_VAULT_NAME=<name> in ~/.epi-logos/env/base.env
fn set_vault_name_in_base_env(name: &str) -> Result<(), String> {
    let base_env_path = dirs::home_dir()
        .ok_or("no home dir")?
        .join(".epi-logos")
        .join("env")
        .join("base.env");
    if let Some(parent) = base_env_path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("create env dir: {e}"))?;
    }
    let existing = fs::read_to_string(&base_env_path).unwrap_or_default();
    let updated: String = {
        let mut lines: Vec<String> = existing
            .lines()
            .filter(|l| !l.starts_with("EPI_VAULT_NAME="))
            .map(ToOwned::to_owned)
            .collect();
        lines.push(format!("EPI_VAULT_NAME={name}"));
        lines.join("\n") + "\n"
    };
    fs::write(&base_env_path, updated).map_err(|e| format!("write base.env: {e}"))
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

/// Write a freshly-rendered template body to a vault path.
///
/// **IOD-19 / ADR-05-010 boundary note:** This is a **governed-local** write
/// — it scaffolds a brand-new artifact (Daily / NOW / Thought / Flow) from
/// a template, so there are no inbound `[[X]]` references to reconcile and
/// no Hen wikilink integrity contract is at risk. It is therefore safe to
/// stay direct-FS. Once `s1'.vault.write_file` (LANDED in
/// `gate::s1_hen::write_file`) is wired through the Theia vault-bridge
/// extension (Track 05 T4.5), the bridge can call it for templated writes
/// too — but the S0 CLI path is fast-bootstrap and pre-dates the boundary.
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
    vak_address: Option<&portal_core::VakAddress>,
    summary: Option<&str>,
) -> Result<String, String> {
    if position > 5 {
        return Err("thought position must be T0 through T5".to_owned());
    }
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
    // VAK keys (when present) are merged into the SAME ---...--- frontmatter
    // block that the template emits — see render_template_with_vak. This
    // replaces the previous (B2 v1) approach of prepending a separate VAK
    // frontmatter block to the body, which produced TWO ---...--- blocks
    // and was silently invisible to standard parsers (Obsidian,
    // gnosis_ingest, hen_frontmatter_validate, Aletheia retrieval).
    //
    // `summary` (when present) is YAML-quoted via serde_yaml and emitted
    // BETWEEN the template-rendered keys and the VAK block — restoring the
    // contract for the `summary` parameter on the TS-side schema, which was
    // orphaned by the B2 (cc53d882) refactor.
    let mut body = render_template_with_vak_and_summary(
        &context,
        &repo_root(),
        &home_root(),
        vak_address,
        summary,
    )?;
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

/// Archive a day folder into the History tree.
///
/// **IOD-19 / ADR-05-010 boundary note:** This direct `fs::rename` on the
/// day-folder *can* leave orphaned `[[X]]` wikilinks if any note inside the
/// day folder is referenced from elsewhere in the vault. Per ADR-05-010 §2,
/// directory-level moves should reconcile inbound wikilinks via
/// `s1'.vault.move_file`. The current Hen surface
/// ([`crate::gate::s1_hen::rename_or_move_file`]) handles **file-level**
/// renames atomically with full wikilink rewrite; a **directory-level**
/// move surface (`s1'.vault.move_directory` with per-file recursion) is
/// DEFERRED in the gateway dispatch (`Body/S/S3/gateway/src/dispatch.rs`
/// classifier). Until that surface lands, archive_day stays local-only,
/// guarded by the `c_5_reflection_complete: true` discipline check below
/// and the `--plan` mode which prints SOURCE→DEST without touching FS.
///
/// TODO(IOD-19): when the gateway exposes `s1'.vault.move_directory`,
/// replace the `fs::rename(&source, &target)` call with a recursive Hen
/// dispatch so per-file wikilink integrity is preserved across the archive.
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
