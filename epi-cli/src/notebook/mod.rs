use clap::Subcommand;
use std::process::Command;

use crate::techne::{resolve_notebooklm_bin, resolve_notebooklm_setup};

/// NotebookLM — query and manage Google NotebookLM notebooks
#[derive(Subcommand)]
pub enum NotebookCmd {
    /// Ask a question (delegates to `notebooklm ask`)
    Ask {
        /// The question to ask
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        question: Vec<String>,
    },
    /// List notebooks
    List,
    /// Set up the NotebookLM Python venv (runs setup.sh)
    Setup,
    /// Pass arbitrary args directly to the notebooklm CLI
    Raw {
        /// Arguments to pass through
        #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
        args: Vec<String>,
    },
}

pub fn dispatch(cmd: &NotebookCmd) {
    match cmd {
        NotebookCmd::Ask { question } => {
            let bin = resolve_notebooklm_bin();
            if !bin.exists() {
                eprintln!(
                    "epi notebook: notebooklm binary not found at {}",
                    bin.display()
                );
                eprintln!("  run `epi notebook setup` to install the Python venv");
                std::process::exit(1);
            }
            let q = question.join(" ");
            let mut c = Command::new(&bin);
            c.args(["ask", &q]);
            run(c, "ask");
        }
        NotebookCmd::List => {
            let bin = resolve_notebooklm_bin();
            if !bin.exists() {
                eprintln!(
                    "epi notebook: notebooklm binary not found at {}",
                    bin.display()
                );
                eprintln!("  run `epi notebook setup` to install the Python venv");
                std::process::exit(1);
            }
            let mut c = Command::new(&bin);
            c.arg("list");
            run(c, "list");
        }
        NotebookCmd::Setup => {
            let setup = match resolve_notebooklm_setup() {
                Some(s) => s,
                None => {
                    eprintln!("epi notebook setup: cannot find setup.sh");
                    eprintln!("  searched: <exe>/../scripts/notebooklm/, CARGO_MANIFEST_DIR/scripts/notebooklm/, ~/.epi-claw/");
                    std::process::exit(1);
                }
            };
            let mut c = Command::new("bash");
            c.arg(&setup);
            run(c, "setup");
        }
        NotebookCmd::Raw { args } => {
            let bin = resolve_notebooklm_bin();
            if !bin.exists() {
                eprintln!(
                    "epi notebook: notebooklm binary not found at {}",
                    bin.display()
                );
                eprintln!("  run `epi notebook setup` to install the Python venv");
                std::process::exit(1);
            }
            let mut c = Command::new(&bin);
            c.args(args);
            run(c, "raw");
        }
    }
}

fn run(mut cmd: Command, subname: &str) {
    match cmd.status() {
        Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
        Err(e) => {
            eprintln!("epi notebook {}: failed to run: {}", subname, e);
            std::process::exit(1);
        }
        _ => {}
    }
}
