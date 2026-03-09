use clap::Subcommand;
use std::env;
use std::path::PathBuf;
use std::process::Command;

/// Resolve the path to the bundled kbase.sh script.
///
/// Search order:
///   1. $EPI_VIMARSA_SCRIPT  (explicit override)
///   2. $EPI_KBASE_SCRIPT    (backward-compat fallback)
///   3. Next to the running binary:  <exe_dir>/../scripts/kbase.sh
///   4. Cargo workspace dev path:    <manifest_dir>/scripts/kbase.sh
///   5. Original epi-claw location:  ~/.epi-claw/workspace/skills/kbase/scripts/kbase.sh
fn resolve_vimarsa_script() -> Option<PathBuf> {
    // 1. Primary env override
    if let Ok(p) = env::var("EPI_VIMARSA_SCRIPT") {
        let pb = PathBuf::from(p);
        if pb.exists() {
            return Some(pb);
        }
    }

    // 2. Backward-compat fallback
    if let Ok(p) = env::var("EPI_KBASE_SCRIPT") {
        let pb = PathBuf::from(p);
        if pb.exists() {
            return Some(pb);
        }
    }

    // 3. Relative to binary (installed layout: bin/../scripts/kbase.sh)
    if let Ok(exe) = env::current_exe() {
        if let Some(bin_dir) = exe.parent() {
            let candidate = bin_dir.join("../scripts/kbase.sh");
            if candidate.exists() {
                return Some(candidate);
            }
            // Also check sibling scripts/ (flat install)
            let candidate = bin_dir.join("scripts/kbase.sh");
            if candidate.exists() {
                return Some(candidate);
            }
        }
    }

    // 4. Cargo workspace dev path (CARGO_MANIFEST_DIR baked at compile time)
    let manifest_candidate = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("scripts/kbase.sh");
    if manifest_candidate.exists() {
        return Some(manifest_candidate);
    }

    // 5. Original epi-claw location
    if let Some(home) = dirs::home_dir() {
        let epi_claw = home.join(".epi-claw/workspace/skills/kbase/scripts/kbase.sh");
        if epi_claw.exists() {
            return Some(epi_claw);
        }
    }

    None
}

/// Vimarsa -- curiosity-driven coordinate exploration (bkmr apertures)
#[derive(Subcommand)]
pub enum VimarsaCmd {
    /// Search bookmarks (FZF interactive)
    Search {
        /// Search query
        query: Option<String>,
    },
    /// Semantic search using Gemini embeddings
    SemSearch {
        /// Search query
        query: String,
    },
    /// Open a bookmark by ID or search
    Open {
        /// Bookmark ID or search term
        target: Option<String>,
    },
    /// Add a new bookmark
    Add {
        /// URL to bookmark
        url: String,
        /// Tags (comma-separated)
        #[arg(short, long)]
        tags: Option<String>,
    },
    /// Add a file as bookmark
    AddFile {
        /// Path to file
        path: String,
        /// Tags (comma-separated)
        #[arg(short, long)]
        tags: Option<String>,
    },
    /// Fetch URL content and index
    Fetch {
        /// URL to fetch
        url: String,
        /// Tags (comma-separated)
        #[arg(short, long)]
        tags: Option<String>,
    },
    /// Update a bookmark (re-embeds)
    Update {
        /// Bookmark ID
        id: String,
        /// Extra args passed to bkmr update
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
    },
    /// Re-fetch URL and regenerate embedding
    Refresh {
        /// Bookmark ID
        id: String,
    },
    /// List all tags
    Tags,
    /// Show bookmark details
    Show {
        /// Bookmark ID or filter
        filter: Option<String>,
    },
    /// Show project stats
    Info {
        /// Project name (default: current)
        project: Option<String>,
    },
    /// List all projects
    List,
    /// Show active project
    Current,
    /// Create new project
    Init {
        /// Project name
        name: String,
    },
    /// Switch to a project
    Use {
        /// Project name (or --global)
        name: Option<String>,
    },
    /// Delete a project
    Delete {
        /// Project name
        name: String,
    },
    /// Rename a project
    Rename {
        /// Old name
        old: String,
        /// New name
        new: String,
    },
    /// Find projects by partial name
    Find {
        /// Partial name to match
        query: String,
    },
    /// Fuzzy-switch to matching project
    Switch {
        /// Partial name to match
        query: String,
    },
    /// Search across all projects
    SearchAll {
        /// Search query
        query: String,
        /// Use Gemini semantic search
        #[arg(long)]
        gemini: bool,
    },
    /// List bookmarks from all projects
    ListAll,
    /// Create compressed backup snapshot
    Snapshot {
        /// Snapshot message
        message: Option<String>,
    },
    /// List snapshots
    Log,
    /// Show help for vimarsa commands
    Help,
    /// Pass arbitrary args directly to kbase.sh
    Raw {
        /// Arguments to pass through
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
    },
}

/// Convert a VimarsaCmd into the argument vector that kbase.sh expects.
fn cmd_to_args(cmd: &VimarsaCmd) -> Vec<String> {
    match cmd {
        VimarsaCmd::Search { query } => {
            let mut v = vec!["search".to_string()];
            if let Some(q) = query {
                v.push(q.clone());
            }
            v
        }
        VimarsaCmd::SemSearch { query } => vec!["sem-search".to_string(), query.clone()],
        VimarsaCmd::Open { target } => {
            let mut v = vec!["open".to_string()];
            if let Some(t) = target {
                v.push(t.clone());
            }
            v
        }
        VimarsaCmd::Add { url, tags } => {
            let mut v = vec!["add".to_string(), url.clone()];
            if let Some(t) = tags {
                v.push(t.clone());
            }
            v
        }
        VimarsaCmd::AddFile { path, tags } => {
            let mut v = vec!["add-file".to_string(), path.clone()];
            if let Some(t) = tags {
                v.push(t.clone());
            }
            v
        }
        VimarsaCmd::Fetch { url, tags } => {
            let mut v = vec!["fetch".to_string(), url.clone()];
            if let Some(t) = tags {
                v.push(t.clone());
            }
            v
        }
        VimarsaCmd::Update { id, args } => {
            let mut v = vec!["update".to_string(), id.clone()];
            v.extend(args.iter().cloned());
            v
        }
        VimarsaCmd::Refresh { id } => vec!["refresh".to_string(), id.clone()],
        VimarsaCmd::Tags => vec!["tags".to_string()],
        VimarsaCmd::Show { filter } => {
            let mut v = vec!["show".to_string()];
            if let Some(f) = filter {
                v.push(f.clone());
            }
            v
        }
        VimarsaCmd::Info { project } => {
            let mut v = vec!["info".to_string()];
            if let Some(p) = project {
                v.push(p.clone());
            }
            v
        }
        VimarsaCmd::List => vec!["list".to_string()],
        VimarsaCmd::Current => vec!["current".to_string()],
        VimarsaCmd::Init { name } => vec!["init".to_string(), name.clone()],
        VimarsaCmd::Use { name } => {
            let mut v = vec!["use".to_string()];
            if let Some(n) = name {
                v.push(n.clone());
            } else {
                v.push("--global".to_string());
            }
            v
        }
        VimarsaCmd::Delete { name } => vec!["delete".to_string(), name.clone()],
        VimarsaCmd::Rename { old, new } => vec!["rename".to_string(), old.clone(), new.clone()],
        VimarsaCmd::Find { query } => vec!["find".to_string(), query.clone()],
        VimarsaCmd::Switch { query } => vec!["switch".to_string(), query.clone()],
        VimarsaCmd::SearchAll { query, gemini } => {
            let mut v = vec!["search-all".to_string(), query.clone()];
            if *gemini {
                v.push("--gemini".to_string());
            }
            v
        }
        VimarsaCmd::ListAll => vec!["list-all".to_string()],
        VimarsaCmd::Snapshot { message } => {
            let mut v = vec!["snapshot".to_string()];
            if let Some(m) = message {
                v.push(m.clone());
            }
            v
        }
        VimarsaCmd::Log => vec!["log".to_string()],
        VimarsaCmd::Help => vec!["help".to_string()],
        VimarsaCmd::Raw { args } => args.clone(),
    }
}

pub fn dispatch(cmd: &VimarsaCmd) {
    let script = match resolve_vimarsa_script() {
        Some(s) => s,
        None => {
            eprintln!("epi vimarsa: cannot find kbase.sh script");
            eprintln!("  searched: $EPI_VIMARSA_SCRIPT, $EPI_KBASE_SCRIPT, <exe>/../scripts/, CARGO_MANIFEST_DIR/scripts/, ~/.epi-claw/");
            std::process::exit(1);
        }
    };

    let args = cmd_to_args(cmd);

    // Set BKMR_PROJECT=epi-logos as default when not already set
    let mut command = Command::new("bash");
    command.arg(&script);
    command.args(&args);

    if env::var("BKMR_PROJECT").is_err() {
        command.env("BKMR_PROJECT", "epi-logos");
    }

    let status = command.status();

    match status {
        Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
        Err(e) => {
            eprintln!("epi vimarsa: failed to run kbase.sh: {}", e);
            eprintln!("  script: {}", script.display());
            std::process::exit(1);
        }
        _ => {}
    }
}
