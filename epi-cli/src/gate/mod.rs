use clap::Subcommand;

#[derive(Subcommand)]
pub enum GateCmd {
    /// Show gateway status
    Status,
}

pub fn dispatch(cmd: &GateCmd) {
    match cmd {
        GateCmd::Status => eprintln!("epi gate: not yet implemented (WebSocket gateway)"),
    }
}
