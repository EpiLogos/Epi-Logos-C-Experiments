use clap::Subcommand;
use std::process::Command;

const BKMR: &str = "/usr/local/bin/bkmr";

#[derive(Subcommand)]
pub enum KbaseCmd {
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
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
    },
    /// List all tags
    Tags,
    /// Show bookmarks
    Show {
        /// Filter by tag or search
        filter: Option<String>,
    },
    /// Show bkmr configuration info
    Info,
    /// Pass arbitrary args directly to bkmr
    Raw {
        /// Arguments to pass through
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
    },
}

pub fn dispatch(cmd: &KbaseCmd) {
    let status = match cmd {
        KbaseCmd::Search { query } => {
            let mut c = Command::new(BKMR);
            c.arg("search");
            if let Some(q) = query { c.arg(q); }
            c.status()
        }
        KbaseCmd::SemSearch { query } => {
            Command::new(BKMR)
                .args(["sem-search", query])
                .status()
        }
        KbaseCmd::Open { target } => {
            let mut c = Command::new(BKMR);
            c.arg("open");
            if let Some(t) = target { c.arg(t); }
            c.status()
        }
        KbaseCmd::Add { url, tags, desc } => {
            let mut c = Command::new(BKMR);
            c.args(["add", url]);
            if let Some(t) = tags { c.args(["--tag", t]); }
            if let Some(d) = desc { c.args(["--desc", d]); }
            c.status()
        }
        KbaseCmd::Tags => {
            Command::new(BKMR).arg("tags").status()
        }
        KbaseCmd::Show { filter } => {
            let mut c = Command::new(BKMR);
            c.arg("show");
            if let Some(f) = filter { c.arg(f); }
            c.status()
        }
        KbaseCmd::Info => {
            Command::new(BKMR).arg("info").status()
        }
        KbaseCmd::Raw { args } => {
            Command::new(BKMR).args(args).status()
        }
    };

    match status {
        Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
        Err(e) => {
            eprintln!("epi kbase: failed to run bkmr: {}", e);
            eprintln!("  expected: {}", BKMR);
            std::process::exit(1);
        }
        _ => {}
    }
}
