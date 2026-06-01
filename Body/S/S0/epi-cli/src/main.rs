use clap::{Parser, Subcommand};
use epi_logos::{
    agent, app, book, code, core, ffi, gate, graph, nara, notebook, portal, profile, sesh, sync,
    techne, up, vault, vimarsa,
};

#[derive(Parser)]
#[command(
    name = "epi",
    about = "The Master CLI for the Epi-Logos coordinate system",
    disable_help_subcommand = true
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
    // System Layer
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
        cmd: Option<agent::AgentCmd>,
    },
    /// Webhook / n8n integration
    Sync {
        #[command(subcommand)]
        cmd: sync::SyncCmd,
    },

    // Tooling Layer
    /// Tmux session lifecycle — launch, kill, banner
    Sesh {
        #[command(subcommand)]
        cmd: sesh::SeshCmd,
    },
    /// Vimarsa -- curiosity-driven coordinate exploration
    Vimarsa {
        #[command(subcommand)]
        cmd: vimarsa::VimarsaCmd,
    },
    /// Book reader — bookokrat TUI (runs 'open' by default)
    Book {
        #[command(subcommand)]
        cmd: Option<book::BookCmd>,
        /// .epub file to open (opens TUI browser if omitted)
        #[arg(value_name = "FILE")]
        file: Option<String>,
    },
    /// NotebookLM — query and manage Google NotebookLM notebooks
    Notebook {
        #[command(subcommand)]
        cmd: notebook::NotebookCmd,
    },
    /// Research tools — chat log capture, NotebookLM, quote research
    Techne {
        #[command(subcommand)]
        cmd: techne::TechneCmd,
    },
    /// EpiLogos Tauri desktop app
    App {
        #[command(subcommand)]
        cmd: app::AppCmd,
    },
    /// Full-stack startup orchestration
    Up(up::UpCmd),
    /// Claude Code with LLM provider profiles
    Code {
        #[command(subcommand)]
        cmd: code::CodeCmd,
    },
    /// Nara personal dialogical interface (#4)
    Nara {
        #[command(subcommand)]
        cmd: nara::NaraCmd,
    },
    /// S0' harmonic profile surface — show / pointer / codon / readiness
    Profile {
        #[command(subcommand)]
        cmd: profile::ProfileCmd,
    },
    /// M' experiential TUI portal
    Portal {
        /// Force factory default layout
        #[arg(long)]
        reset: bool,
        /// Launch directly into a tab (personal, structural)
        #[arg(long)]
        tab: Option<String>,
        /// Load a named saved layout
        #[arg(long)]
        layout: Option<String>,
    },

    // Help
    /// Project help — rooted in the # coordinate
    Help {
        /// Help topic: mission, architecture, install, cli, coordinates, plugin
        topic: Option<String>,
    },
}

#[tokio::main]
async fn main() -> color_eyre::Result<()> {
    color_eyre::install()?;
    let cli = Cli::parse();

    match &cli.command {
        Commands::Core { cmd } => {
            let epi = ffi::EpiLib::new();
            core::dispatch(cmd, &epi, cli.json)?;
        }
        Commands::Vault { cmd } => match vault::dispatch(cmd) {
            Ok(out) => println!("{}", out),
            Err(e) => {
                eprintln!("{}", e);
                std::process::exit(1);
            }
        },
        Commands::Graph { cmd } => match graph::dispatch_with_format(cmd, cli.json).await {
            Ok(out) => println!("{}", out),
            Err(e) => {
                eprintln!("graph error: {}", e);
                std::process::exit(1);
            }
        },
        Commands::Gate { cmd } => match gate::dispatch(cmd, cli.json).await {
            Ok(out) if !out.is_empty() => println!("{}", out),
            Ok(_) => {}
            Err(e) => {
                eprintln!("gate error: {}", e);
                std::process::exit(1);
            }
        },
        Commands::Agent { cmd } => match agent::dispatch(cmd.as_ref(), cli.json).await {
            Ok(out) if !out.is_empty() => println!("{}", out),
            Ok(_) => {}
            Err(e) => {
                eprintln!("agent error: {}", e);
                std::process::exit(1);
            }
        },
        Commands::Sync { cmd } => sync::dispatch(cmd),
        Commands::Sesh { cmd } => sesh::dispatch(cmd),
        Commands::Vimarsa { cmd } => vimarsa::dispatch(cmd),
        Commands::Book { file, cmd } => match cmd {
            Some(sub) => book::dispatch(sub),
            None => book::open_default(file.clone()),
        },
        Commands::Notebook { cmd } => notebook::dispatch(cmd),
        Commands::Techne { cmd } => techne::dispatch(cmd),
        Commands::App { cmd } => app::dispatch(cmd),
        Commands::Up(cmd) => match up::dispatch(cmd, cli.json).await {
            Ok(out) => println!("{}", out),
            Err(e) => eprintln!("up error: {}", e),
        },
        Commands::Code { cmd } => code::dispatch(cmd),
        Commands::Nara { cmd } => match nara::dispatch(&cmd, cli.json) {
            Ok(out) if !out.is_empty() => println!("{}", out),
            Ok(_) => {}
            Err(e) => {
                eprintln!("{}", e);
                std::process::exit(1);
            }
        },
        Commands::Profile { cmd } => match profile::run(cmd) {
            Ok(value) => {
                // Always emit JSON for profile commands — they're machine
                // consumers (Tauri, Theia, gateway, CI tests).
                let _ = cli.json;
                println!(
                    "{}",
                    serde_json::to_string_pretty(&value)
                        .unwrap_or_else(|e| format!("serialise: {e}"))
                );
            }
            Err(e) => {
                eprintln!("profile error: {}", e);
                std::process::exit(1);
            }
        },
        Commands::Portal { reset, tab, layout } => {
            let epi = ffi::EpiLib::new();
            portal::launch(&epi, *reset, tab.as_deref(), layout.as_deref())?;
        }
        Commands::Help { topic } => core::help_dispatch(topic.as_deref(), cli.json)?,
    }

    Ok(())
}
