use clap::Subcommand;

#[derive(Subcommand)]
pub enum GraphCmd {
    /// Show Neo4j/Redis connection status
    Status,
}

pub fn dispatch(cmd: &GraphCmd) {
    match cmd {
        GraphCmd::Status => eprintln!("epi graph: not yet implemented (Neo4j + Redis)"),
    }
}
