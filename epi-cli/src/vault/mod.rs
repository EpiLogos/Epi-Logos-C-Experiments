use clap::Subcommand;

#[derive(Subcommand)]
pub enum VaultCmd {
    /// Show vault connection status
    Status,
}

pub fn dispatch(cmd: &VaultCmd) {
    match cmd {
        VaultCmd::Status => eprintln!("epi vault: not yet implemented (Obsidian integration)"),
    }
}
