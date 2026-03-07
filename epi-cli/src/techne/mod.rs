use clap::Subcommand;
use std::process::Command;

const CTLG_SCRIPT: &str = concat!(env!("HOME"), "/.config/epi/epi-ctlg");
const NOTEBOOKLM: &str = concat!(
    env!("HOME"),
    "/.epi-claw/workspace/skills/notebooklm/.venv/bin/notebooklm"
);

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
        /// Arguments passed to notebooklm CLI (e.g. "list", "ask <query>", "<notebook> <query>")
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
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
    /// worktrunk (wt) — Git worktree management for parallel AI agent workflows
    Wt {
        /// Arguments passed to wt CLI (e.g. "switch", "list", "merge", "remove")
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
    },
}

pub fn dispatch(cmd: &TechneCmd) {
    match cmd {
        TechneCmd::Ctlg { url, prompt } => {
            let mut c = Command::new(CTLG_SCRIPT);
            c.arg(url);
            if let Some(p) = prompt {
                c.arg(p);
            }
            run(c, "ctlg", CTLG_SCRIPT);
        }
        TechneCmd::Notebook { args } => {
            let mut c = Command::new(NOTEBOOKLM);
            c.args(args);
            run(c, "notebook", NOTEBOOKLM);
        }
        TechneCmd::Quote { text } => {
            // Quote research: source the GLM profile and run claude with a research prompt
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
            run(c, "quote", "claude (glm profile)");
        }
        TechneCmd::Cmux { args } => {
            let mut c = Command::new("cmux");
            c.args(args);
            // Set working directory to current project when cmux needs context
            if !args.is_empty() && args.first().map(|a| a.starts_with('-')).unwrap_or(false) {
                // Flags only - stay in current directory
            }
            run(c, "cmux", "cmux");
        }
        TechneCmd::Wt { args } => {
            let mut c = Command::new("wt");
            c.args(args);
            // Always run wt from the current working directory
            run(c, "wt", "wt (worktrunk)");
        }
    }
}

fn run(mut cmd: Command, name: &str, binary: &str) {
    match cmd.status() {
        Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
        Err(e) => {
            eprintln!("epi techne {}: failed to run: {}", name, e);
            eprintln!("  expected: {}", binary);
            std::process::exit(1);
        }
        _ => {}
    }
}

fn shell_escape(s: &str) -> String {
    format!("'{}'", s.replace('\'', "'\\''"))
}
