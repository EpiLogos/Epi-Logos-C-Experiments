use clap::Subcommand;

#[derive(Subcommand)]
pub enum SyncCmd {
    /// Show n8n connection status
    Status,
}

pub fn dispatch(cmd: &SyncCmd) {
    match cmd {
        SyncCmd::Status => eprintln!("epi sync: not yet implemented (n8n webhooks)"),
    }
}
