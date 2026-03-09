use clap::{Parser, Subcommand};
use epi::{agent, app, book, code, core, ffi, gate, graph, kbase, sesh, sync, techne, vault};

#[derive(Parser)]
#[command(
    name = "epi",
    about = "The Master CLI for the Epi-Logos coordinate system"
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    /// Output structured JSON instead of TUI
    #[arg(long, global = true)]
    json: bool,
}

#[derive(Subcommand)]
enum Commands {
    // ── System Layer ──
    /// Bare-metal Quaternal Logic — inspect, walk, verify the coordinate system
    Core {
        #[command(subcommand)]
        cmd: core::CoreCmd,
    },
    /// Obsidian vault operations
    Vault {
        #[command(subcommand)]
        cmd: vault::VaultCmd,
    },
    /// Neo4j + Redis graph operations
    Graph {
        #[command(subcommand)]
        cmd: graph::GraphCmd,
    },
    /// Gateway (S3') — RPC server, plugin host
    Gate {
        #[command(subcommand)]
        cmd: gate::GateCmd,
    },
    /// Pi agent (S4') — LLM orchestration
    Agent {
        #[command(subcommand)]
        cmd: agent::AgentCmd,
    },
    /// Webhook / n8n integration
    Sync {
        #[command(subcommand)]
        cmd: sync::SyncCmd,
    },

    // ── Tooling Layer ──
    /// Tmux session lifecycle — launch, kill, banner
    Sesh {
        #[command(subcommand)]
        cmd: sesh::SeshCmd,
    },
    /// Knowledge base — bkmr bookmark manager
    Kbase {
        #[command(subcommand)]
        cmd: kbase::KbaseCmd,
    },
    /// Book reader — bookokrat TUI
    Book {
        #[command(subcommand)]
        cmd: book::BookCmd,
    },
    /// Research tools — chat log capture, NotebookLM, quote research
    Techne {
        #[command(subcommand)]
        cmd: techne::TechneCmd,
    },
    /// EpiLogos Electron app
    App {
        #[command(subcommand)]
        cmd: app::AppCmd,
    },
    /// Claude Code with LLM provider profiles
    Code {
        #[command(subcommand)]
        cmd: code::CodeCmd,
    },
}

fn main() -> color_eyre::Result<()> {
    color_eyre::install()?;
    let cli = Cli::parse();

    match &cli.command {
        // System layer
        Commands::Core { cmd } => {
            let epi = ffi::EpiLib::new();
            core::dispatch(cmd, &epi, cli.json)?;
        }
        Commands::Vault { cmd } => match vault::dispatch(cmd) {
            Ok(out) => println!("{}", out),
            Err(e) => eprintln!("vault error: {}", e),
        },
        Commands::Graph { cmd } => match graph::dispatch(cmd) {
            Ok(out) => println!("{}", out),
            Err(e) => eprintln!("graph error: {}", e),
        },
        Commands::Gate { cmd } => match gate::dispatch(cmd, cli.json) {
            Ok(out) if !out.is_empty() => println!("{}", out),
            Ok(_) => {}
            Err(e) => eprintln!("gate error: {}", e),
        },
        Commands::Agent { cmd } => match agent::dispatch(cmd, cli.json) {
            Ok(out) => println!("{}", out),
            Err(e) => eprintln!("agent error: {}", e),
        },
        Commands::Sync { cmd } => sync::dispatch(cmd),

        // Tooling layer
        Commands::Sesh { cmd } => sesh::dispatch(cmd),
        Commands::Kbase { cmd } => kbase::dispatch(cmd),
        Commands::Book { cmd } => book::dispatch(cmd),
        Commands::Techne { cmd } => techne::dispatch(cmd),
        Commands::App { cmd } => app::dispatch(cmd),
        Commands::Code { cmd } => code::dispatch(cmd),
    }

    Ok(())
}
