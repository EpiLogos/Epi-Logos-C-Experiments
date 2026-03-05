use clap::Subcommand;

#[derive(Subcommand)]
pub enum AgentCmd {
    /// Show active agent swarm
    Status,
}

pub fn dispatch(cmd: &AgentCmd) {
    match cmd {
        AgentCmd::Status => eprintln!("epi agent: not yet implemented (LLM orchestration)"),
    }
}
