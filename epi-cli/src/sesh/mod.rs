use clap::Subcommand;
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
    let arg = match cmd {
        SeshCmd::Launch => "sesh",
        SeshCmd::Kill => "kill",
        SeshCmd::Killall => "killall",
        SeshCmd::Banner => "banner",
    };

    let status = Command::new(SESSION_SCRIPT)
        .arg(arg)
        .status();

    match status {
        Ok(s) if !s.success() => {
            std::process::exit(s.code().unwrap_or(1));
        }
        Err(e) => {
            eprintln!("epi sesh: failed to run session script: {}", e);
            eprintln!("  expected: {}", SESSION_SCRIPT);
            std::process::exit(1);
        }
        _ => {}
    }
}
