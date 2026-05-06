pub mod session;

use clap::Subcommand;
use std::path::PathBuf;
use std::process::Command;

const SESSION_SCRIPT: &str = concat!(env!("HOME"), "/.config/epi/epi-session-v2.sh");

#[derive(Subcommand)]
pub enum SeshCmd {
    /// Launch the epi tmux session (dashboard + agents + work panes)
    Launch,
    /// Kill the epi tmux session and clean swap files
    Kill,
    /// Kill all tmux sessions
    Killall,
    /// Show the epi ASCII banner
    Banner,
}

pub fn dispatch(cmd: &SeshCmd) {
    let status = command_for(cmd).status();

    match status {
        Ok(s) if !s.success() => {
            std::process::exit(s.code().unwrap_or(1));
        }
        Err(e) => {
            eprintln!("epi sesh: failed to run session script: {}", e);
            eprintln!("  expected: {}", session_script_path().display());
            std::process::exit(1);
        }
        _ => {}
    }
}

pub fn command_for(cmd: &SeshCmd) -> Command {
    let arg = match cmd {
        SeshCmd::Launch => "sesh",
        SeshCmd::Kill => "kill",
        SeshCmd::Killall => "killall",
        SeshCmd::Banner => "banner",
    };

    let mut command = Command::new(session_script_path());
    command.arg(arg);
    command
}

pub fn session_script_path() -> PathBuf {
    std::env::var_os("EPI_SESSION_SCRIPT")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from(SESSION_SCRIPT))
}
