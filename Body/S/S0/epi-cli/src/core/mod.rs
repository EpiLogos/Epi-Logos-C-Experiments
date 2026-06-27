use crate::ffi::EpiLib;
use clap::Subcommand;

pub mod knowing;
pub mod overlay;
pub mod write_gate;

mod help;
mod pointer_web;
mod quintessential_view;
mod walk;

pub use walk::position_name;

#[derive(Subcommand)]
pub enum CoreCmd {
    /// Inspect a coordinate (psychoid, family, CF root, weave)
    Inspect {
        /// Coordinate to inspect (e.g. #0, P3, CF(012), W0.5)
        coordinate: String,
    },
    /// Verify all 18 BIMBA entities — boot check
    Verify,
    /// Dump all .rodata bedrock
    Dump,
    /// List all 7 Context Frame roots
    Cf,
    /// Show the operator table with tagged pointer bits
    Operators,
    /// Interactive TUI dashboard
    Dashboard,
    /// Run a torus walk
    Walk {
        /// Number of steps (default: 6 for one full cycle)
        #[arg(short, long, default_value = "6")]
        steps: u32,
    },
    /// Apply # inversion to a mutable copy of a coordinate
    Hash {
        /// Coordinate to invert (e.g. #0, #3)
        coordinate: String,
    },
    /// Interactive torus walk TUI (step-by-step with space/r/c keys)
    WalkTui,
    /// Family explorer — browse all 36 family coordinates (6 families × 6 positions)
    Families,
    /// M5 (Epii) holographic integration — Logos FSM, QV lookup
    M5,
    /// Look up a coordinate's quintessential self-knowledge (M5 self-API)
    Knowing {
        /// Coordinate to look up (e.g. M0, S3, C4, P2, L5, T1, #)
        coordinate: Option<String>,

        /// Sub-operation for # portal: essence | comms | map | navigate
        operation: Option<String>,

        /// List all available coordinates in a family (C, P, L, S, T, M, #, CF, W, VAK)
        #[arg(long)]
        family: Option<String>,

        /// Update a coordinate's pithy in the JSON overlay (write-gated)
        #[arg(long)]
        update: Option<String>,

        /// Show QV coverage report
        #[arg(long)]
        coverage: bool,

        /// Export all QV data as JSON
        #[arg(long)]
        export: bool,

        /// Bake overlay data into C source (write-gated, generates src/qv_data.c)
        #[arg(long)]
        bake: bool,

        /// Open the selected Vimarsa hit with the system opener
        #[arg(long)]
        open: Option<usize>,

        /// Preview the selected markdown Vimarsa hit with glow
        #[arg(long)]
        glow: Option<usize>,

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

        /// Open the knowing dossier in a ratatui browser
        #[arg(long)]
        tui: bool,
    },
}

pub fn dispatch(cmd: &CoreCmd, epi: &EpiLib, json: bool) -> color_eyre::Result<()> {
    match cmd {
        CoreCmd::Inspect { coordinate } => pointer_web::inspect(epi, coordinate, json),
        CoreCmd::Verify => pointer_web::verify(epi, json),
        CoreCmd::Dump => pointer_web::dump(epi, json),
        CoreCmd::Cf => pointer_web::cf_roots(epi, json),
        CoreCmd::Operators => pointer_web::operators(json),
        CoreCmd::Dashboard => crate::tui::run_dashboard(epi),
        CoreCmd::Walk { steps } => walk::walk(epi, *steps, json),
        CoreCmd::Hash { coordinate } => pointer_web::hash(epi, coordinate, json),
        CoreCmd::WalkTui => crate::tui::run_walk(epi),
        CoreCmd::Families => crate::tui::run_families(epi),
        CoreCmd::M5 => crate::tui::run_m5(epi),
        CoreCmd::Knowing {
            coordinate,
            operation,
            family,
            update,
            coverage,
            export,
            bake,
            open,
            glow,
            project,
            limit,
            refresh,
            quick,
            tui,
        } => quintessential_view::knowing(
            epi,
            coordinate.as_deref(),
            operation.as_deref(),
            family.as_deref(),
            update.as_deref(),
            *coverage,
            *export,
            *bake,
            *open,
            *glow,
            project.as_deref(),
            *limit,
            *refresh,
            *quick,
            *tui,
            json,
        ),
    }
}

pub fn help_dispatch(topic: Option<&str>, json: bool) -> color_eyre::Result<()> {
    help::dispatch(topic, json)
}
