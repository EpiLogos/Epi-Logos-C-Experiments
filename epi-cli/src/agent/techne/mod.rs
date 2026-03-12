use clap::Subcommand;
use std::path::PathBuf;
use std::process::Command;

use crate::code::{dispatch as dispatch_code, CodeCmd};
use crate::notebook::{dispatch as dispatch_notebook, NotebookCmd};

const CTLG_SCRIPT: &str = concat!(env!("HOME"), "/.config/epi/epi-ctlg");

#[derive(Subcommand)]
pub enum TechneCmd {
    /// Fetch a chat log from a share URL (Gemini, ChatGPT, Claude, DeepSeek)
    Ctlg {
        /// Share URL to fetch
        url: String,
        /// Optional analysis prompt (runs via GLM after capture)
        prompt: Option<String>,
    },
    /// Query NotebookLM — list, search, ask, manage sources
    Notebook {
        #[command(subcommand)]
        cmd: NotebookCmd,
    },
    /// Research a quote — find origin, context, attribution
    Quote {
        /// The quote text to research
        text: String,
    },
    /// cmux — Ghostty-based terminal with vertical tabs and notifications for AI coding agents
    Cmux {
        /// Arguments passed to cmux CLI (e.g. "notify", "identify", "list-workspaces")
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
    },
    /// code — LLM provider profiles and launch surfaces
    Code {
        #[command(subcommand)]
        cmd: CodeCmd,
    },
    /// worktrunk (wt) — Git worktree management for parallel AI agent workflows
    Wt {
        /// Arguments passed to wt CLI (e.g. "switch", "list", "merge", "remove")
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
    },
}

pub fn dispatch(cmd: &TechneCmd) -> Result<String, String> {
    match cmd {
        TechneCmd::Ctlg { url, prompt } => {
            let mut c = Command::new(CTLG_SCRIPT);
            c.arg(url);
            if let Some(p) = prompt {
                c.arg(p);
            }
            run(c, "ctlg", CTLG_SCRIPT)
        }
        TechneCmd::Notebook { cmd } => {
            dispatch_notebook(cmd);
            Ok(String::new())
        }
        TechneCmd::Quote { text } => {
            let prompt = format!(
                concat!(
                    "Please research the following quote thoroughly. ",
                    "Find: (1) original source and attribution, ",
                    "(2) when and where it originated, ",
                    "(3) historical context, ",
                    "(4) related works and similar quotes. ",
                    "Output as clean markdown.\n\n",
                    "Quote: \"{}\""
                ),
                text
            );
            let mut c = Command::new("bash");
            c.args([
                "-c",
                &format!(
                    "source ~/.claude/api-keys.env 2>/dev/null; \
                     source ~/.claude/profiles/glm.conf; \
                     exec claude -p {}",
                    shell_escape(&prompt)
                ),
            ]);
            run(c, "quote", "claude (glm profile)")
        }
        TechneCmd::Cmux { args } => {
            let c = cmux_command(args);
            let cmux_display = resolve_cmux_bin().display().to_string();
            run(c, "cmux", &cmux_display)
        }
        TechneCmd::Code { cmd } => {
            dispatch_code(cmd);
            Ok(String::new())
        }
        TechneCmd::Wt { args } => {
            let mut c = Command::new("wt");
            c.args(args);
            run(c, "wt", "wt (worktrunk)")
        }
    }
}

fn run(mut cmd: Command, name: &str, binary: &str) -> Result<String, String> {
    match cmd.status() {
        Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
        Err(e) => {
            eprintln!("epi agent techne {}: failed to run: {}", name, e);
            eprintln!("  expected: {}", binary);
            std::process::exit(1);
        }
        _ => Ok(String::new()),
    }
}

fn shell_escape(s: &str) -> String {
    format!("'{}'", s.replace('\'', "'\\''"))
}

fn resolve_cmux_bin() -> PathBuf {
    std::env::var_os("EPI_CMUX_BIN")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("cmux"))
}

fn cmux_command(args: &[String]) -> Command {
    let mut command = Command::new(resolve_cmux_bin());
    command.args(args);
    command
}
