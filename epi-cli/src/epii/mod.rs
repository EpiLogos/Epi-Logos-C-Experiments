pub mod chat;
pub mod fsm;
pub mod gnosis;
pub mod knowing;
pub mod logos;
pub mod vimarsa;

use clap::Subcommand;

#[derive(Subcommand)]
pub enum EpiiCmd {
    /// Live KnowingDossier for a coordinate
    Knowing {
        /// Coordinate to inspect (for now family coordinates like C1, M5, S3')
        coordinate: String,
        /// Optional project scope for Vimarsa lookup
        #[arg(long)]
        project: Option<String>,
        /// Maximum number of Vimarsa hits to include
        #[arg(long, default_value = "5")]
        limit: usize,
        /// Refresh and persist the live snapshot cache for this coordinate
        #[arg(long)]
        refresh: bool,
        /// Quick mode: skip notebook and vimarsa, only fetch graph + local facets
        #[arg(long)]
        quick: bool,
    },
    /// Gnosis ingestion, context, and retrieval surfaces
    Gnosis {
        #[command(subcommand)]
        cmd: gnosis::GnosisCmd,
    },
    /// Vimarsa project knowledge navigation
    Vimarsa {
        #[command(subcommand)]
        cmd: crate::vimarsa::VimarsaCmd,
    },
    /// Logos FSM cycle
    Logos {
        #[command(subcommand)]
        cmd: crate::nara::LogosCmd,
    },
    /// M5 chat interface
    Chat {
        /// Optional initial prompt
        prompt: Option<String>,
    },
    /// FSM state inspection
    Fsm {
        #[arg(long)]
        json: bool,
    },
}

pub fn dispatch(cmd: &EpiiCmd, json: bool) -> Result<String, String> {
    match cmd {
        EpiiCmd::Knowing {
            coordinate,
            project,
            limit,
            refresh,
            quick,
        } => knowing::dispatch(
            coordinate,
            project.as_deref(),
            *limit,
            *refresh,
            *quick,
            json,
        ),
        EpiiCmd::Gnosis { cmd } => gnosis::dispatch(cmd),
        EpiiCmd::Vimarsa { cmd } => vimarsa::dispatch(cmd),
        EpiiCmd::Logos { cmd } => logos::dispatch(cmd, json),
        EpiiCmd::Chat { prompt } => chat::dispatch(prompt.as_deref()),
        EpiiCmd::Fsm { json: as_json } => fsm::dispatch(*as_json || json),
    }
}
