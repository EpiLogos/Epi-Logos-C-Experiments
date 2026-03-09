pub mod frontmatter;

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
    NowWrite { content: String },

    // ── Task 8: Missing obsidian-cli commands ──

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

    // ── Task 9: Thought routing ──

    /// Route a thought artifact to T0-T5
    #[command(name = "thought-route")]
    ThoughtRoute {
        #[arg(short, long)]
        position: u8,
        #[arg(short = 'x', long)]
        content: String,
        #[arg(short, long)]
        session_id: Option<String>,
        #[arg(long)]
        coordinate: Option<String>,
    },

    // ── Task 10: Frontmatter validation ──

    /// Validate frontmatter of a note
    #[command(name = "frontmatter-validate")]
    FrontmatterValidate {
        note: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
}

fn obsidian_cli(args: &[&str]) -> Result<String, String> {
    let output = Command::new("obsidian-cli").args(args).output();

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
                args.extend(&["-v", v.as_str()]);
            }
            if let Some(c) = content {
                args.extend(&["-c", c.as_str()]);
            }
            obsidian_cli(&args)
        }

        VaultCmd::Read { note, vault } => {
            let mut args = vec!["print", note.as_str()];
            if let Some(v) = vault {
                args.extend(&["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }

        VaultCmd::Search { query, vault } => {
            let mut args = vec!["search", query.as_str()];
            if let Some(v) = vault {
                args.extend(&["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }

        VaultCmd::SearchContent { query, vault } => {
            let mut args = vec!["search-content", query.as_str()];
            if let Some(v) = vault {
                args.extend(&["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }

        VaultCmd::Daily { vault } => {
            let mut args = vec!["daily"];
            if let Some(v) = vault {
                args.extend(&["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }

        VaultCmd::FrontmatterGet { note, key, vault } => {
            let mut args = vec!["frontmatter", note.as_str(), "--print"];
            if let Some(k) = key {
                args.extend(&["--key", k.as_str()]);
            }
            if let Some(v) = vault {
                args.extend(&["-v", v.as_str()]);
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
                args.extend(&["-v", v.as_str()]);
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
                args.extend(&["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }

        VaultCmd::Delete { note, vault } => {
            let mut args = vec!["delete", note.as_str()];
            if let Some(v) = vault {
                args.extend(&["-v", v.as_str()]);
            }
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
            let present_dir = PathBuf::from(vault_root).join("Empty").join("Present");
            let now_path = present_dir.join("NOW.md");

            fs::create_dir_all(&present_dir)
                .map_err(|e| format!("Failed to create Present directory: {}", e))?;

            match fs::write(&now_path, content) {
                Ok(_) => Ok(format!("Wrote {} bytes to NOW.md", content.len())),
                Err(e) => Err(format!("Failed to write NOW.md: {}", e)),
            }
        }

        // ── Task 8: Missing obsidian-cli commands ──

        VaultCmd::SetDefault { vault_name } => {
            obsidian_cli(&["set-default", vault_name.as_str()])
        }

        VaultCmd::Open { note, vault } => {
            let mut args = vec!["open", note.as_str()];
            if let Some(v) = vault {
                args.extend(&["-v", v.as_str()]);
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
                args.extend(&["-v", v.as_str()]);
            }
            obsidian_cli(&args)
        }

        // ── Task 9: Thought routing ──

        VaultCmd::ThoughtRoute {
            position,
            content,
            session_id,
            coordinate,
        } => {
            use std::fs;
            use std::path::PathBuf;

            const THOUGHT_NAMES: [&str; 6] = [
                "Questions",
                "Traces",
                "Challenges",
                "Patterns",
                "Discovery",
                "Insight",
            ];

            let pos = (*position).min(5);
            let thought_name = THOUGHT_NAMES[pos as usize];

            let vault_root = std::env::var("EPILOGOS_VAULT")
                .unwrap_or_else(|_| "/Users/admin/Documents/Epi-Logos/Idea".to_string());

            let now = chrono::Local::now();
            let timestamp = now.format("%Y%m%d-%H%M%S").to_string();

            let dir = PathBuf::from(&vault_root)
                .join("Pratibimba")
                .join("Self")
                .join("Thought")
                .join(format!("T{}", pos));

            fs::create_dir_all(&dir)
                .map_err(|e| format!("Failed to create thought directory: {}", e))?;

            let filename = format!("T{}-{}.md", pos, timestamp);
            let filepath = dir.join(&filename);

            let mut fm = String::new();
            fm.push_str("---\n");
            fm.push_str(&format!("bimbaCoordinate: \"T{}\"\n", pos));
            fm.push_str(&format!("ql_position: {}\n", pos));
            fm.push_str("family: \"T\"\n");
            fm.push_str("layer: 2\n");
            fm.push_str(&format!("thought_type: \"{}\"\n", thought_name));
            fm.push_str(&format!("name: \"{}\"\n", thought_name));
            fm.push_str(&format!(
                "timestamp: \"{}\"\n",
                now.format("%Y-%m-%dT%H:%M:%S%:z")
            ));
            if let Some(sid) = session_id {
                fm.push_str(&format!("source_session: \"{}\"\n", sid));
            }
            if let Some(coord) = coordinate {
                fm.push_str(&format!("coordinate: \"{}\"\n", coord));
            }
            fm.push_str("---\n\n");
            fm.push_str(content);
            fm.push('\n');

            fs::write(&filepath, &fm)
                .map_err(|e| format!("Failed to write thought file: {}", e))?;

            Ok(format!(
                "Routed T{} ({}) -> {}",
                pos,
                thought_name,
                filepath.display()
            ))
        }

        // ── Task 10: Frontmatter validation ──

        VaultCmd::FrontmatterValidate { note, vault } => {
            // First, get the frontmatter via obsidian-cli
            let mut args = vec!["frontmatter", note.as_str(), "--print"];
            if let Some(v) = vault {
                args.extend(&["-v", v.as_str()]);
            }
            let raw = obsidian_cli(&args)?;

            let yaml: serde_yaml::Value = serde_yaml::from_str(&raw)
                .map_err(|e| format!("Failed to parse frontmatter YAML: {}", e))?;

            let errors = frontmatter::validate_frontmatter(&yaml);
            if errors.is_empty() {
                Ok("Frontmatter is valid.".to_string())
            } else {
                Ok(format!(
                    "Frontmatter validation errors:\n{}",
                    errors
                        .iter()
                        .map(|e| format!("  - {}", e))
                        .collect::<Vec<_>>()
                        .join("\n")
                ))
            }
        }
    }
}
