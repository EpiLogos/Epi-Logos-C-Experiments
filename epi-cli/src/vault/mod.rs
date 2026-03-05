use clap::Subcommand;
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
    /// Create/open daily note
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
    /// Epi-Logos: Read NOW.md
    #[command(name = "now-read")]
    NowRead,
    /// Epi-Logos: Write NOW.md
    #[command(name = "now-write")]
    NowWrite {
        content: String,
    },
}

fn obsidian_cli(args: &[&str]) -> Result<String, String> {
    let output = Command::new("obsidian-cli")
        .args(args)
        .output();

    match output {
        Ok(out) => {
            if out.status.success() {
                Ok(String::from_utf8_lossy(&out.stdout).to_string())
            } else {
                Err(String::from_utf8_lossy(&out.stderr).to_string())
            }
        }
        Err(e) => Err(format!("Failed to execute obsidian-cli: {}", e)),
    }
}

pub fn dispatch(cmd: &VaultCmd) -> Result<String, String> {
    match cmd {
        VaultCmd::Status => {
            match obsidian_cli(&["print-default"]) {
                Ok(vault) => Ok(format!("Default vault: {}", vault.trim())),
                Err(e) => Err(e),
            }
        }

        VaultCmd::Create { note, content, vault } => {
            let mut args = vec!["create", note.as_str()];
            if let Some(v) = vault { args.extend(&["-v", v.as_str()]); }
            if let Some(c) = content { args.extend(&["-c", c.as_str()]); }
            obsidian_cli(&args)
        }

        VaultCmd::Read { note, vault } => {
            let mut args = vec!["print", note.as_str()];
            if let Some(v) = vault { args.extend(&["-v", v.as_str()]); }
            obsidian_cli(&args)
        }

        VaultCmd::Search { query, vault } => {
            let mut args = vec!["search", query.as_str()];
            if let Some(v) = vault { args.extend(&["-v", v.as_str()]); }
            obsidian_cli(&args)
        }

        VaultCmd::SearchContent { query, vault } => {
            let mut args = vec!["search-content", query.as_str()];
            if let Some(v) = vault { args.extend(&["-v", v.as_str()]); }
            obsidian_cli(&args)
        }

        VaultCmd::Daily { vault } => {
            let mut args = vec!["daily"];
            if let Some(v) = vault { args.extend(&["-v", v.as_str()]); }
            obsidian_cli(&args)
        }

        VaultCmd::FrontmatterGet { note, key, vault } => {
            let mut args = vec!["frontmatter", note.as_str(), "--print"];
            if let Some(k) = key { args.extend(&["--key", k.as_str()]); }
            if let Some(v) = vault { args.extend(&["-v", v.as_str()]); }
            obsidian_cli(&args)
        }

        VaultCmd::FrontmatterSet { note, key, value, vault } => {
            let mut args = vec!["frontmatter", note.as_str(), "--edit", "--key", key.as_str(), "--value", value.as_str()];
            if let Some(v) = vault { args.extend(&["-v", v.as_str()]); }
            obsidian_cli(&args)
        }

        VaultCmd::Move { note, new_path, vault } => {
            let mut args = vec!["move", note.as_str(), new_path.as_str()];
            if let Some(v) = vault { args.extend(&["-v", v.as_str()]); }
            obsidian_cli(&args)
        }

        VaultCmd::Delete { note, vault } => {
            let mut args = vec!["delete", note.as_str()];
            if let Some(v) = vault { args.extend(&["-v", v.as_str()]); }
            obsidian_cli(&args)
        }

        VaultCmd::NowRead => {
            use std::fs;
            use std::path::PathBuf;

            let vault_root = std::env::var("EPILOGOS_VAULT")
                .unwrap_or_else(|_| "/Users/admin/Documents/Epi-Logos/Idea".to_string());
            let now_path = PathBuf::from(vault_root)
                .join("Empty")
                .join("Present")
                .join("NOW.md");

            match fs::read_to_string(&now_path) {
                Ok(content) => Ok(content),
                Err(e) => Err(format!("Failed to read NOW.md: {}", e)),
            }
        }

        VaultCmd::NowWrite { content } => {
            use std::fs;
            use std::path::PathBuf;

            let vault_root = std::env::var("EPILOGOS_VAULT")
                .unwrap_or_else(|_| "/Users/admin/Documents/Epi-Logos/Idea".to_string());
            let present_dir = PathBuf::from(vault_root)
                .join("Empty")
                .join("Present");
            let now_path = present_dir.join("NOW.md");

            fs::create_dir_all(&present_dir)
                .map_err(|e| format!("Failed to create Present directory: {}", e))?;

            match fs::write(&now_path, content) {
                Ok(_) => Ok(format!("Wrote {} bytes to NOW.md", content.len())),
                Err(e) => Err(format!("Failed to write NOW.md: {}", e)),
            }
        }
    }
}
