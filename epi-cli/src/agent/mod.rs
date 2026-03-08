mod agent_dirs;
mod agents;
mod auth;
pub mod capabilities;
pub mod chat;
mod doctor;
mod extensions;
pub mod hooks;
mod install;
mod models;
pub mod plugin_manifest;
pub mod plugins;
pub mod skills;
mod spawn;
pub mod subagents;

use clap::{Args, Subcommand};

pub use agent_dirs::AgentLayout;

#[derive(Subcommand)]
pub enum AgentCmd {
    /// Prepare the managed PI agent directory layout for this repo
    Install {
        /// Prepare a named agent instead of the default `main`
        #[arg(long)]
        agent: Option<String>,
    },
    /// Inspect the repo-native PI agent foundation state
    Doctor {
        /// Resolve layout for a named agent
        #[arg(long)]
        agent: Option<String>,
    },
    /// Sync repo-native PI extensions into the managed agent dir
    Extensions {
        #[command(subcommand)]
        cmd: ExtensionsCmd,
    },
    /// Manage the repo-local registry of PI agents
    Agents {
        #[command(subcommand)]
        cmd: AgentsCmd,
    },
    /// Manage provider and model definitions for a managed agent
    Models {
        #[command(subcommand)]
        cmd: ModelsCmd,
    },
    /// Manage provider auth profiles for a managed agent
    Auth {
        #[command(subcommand)]
        cmd: AuthCmd,
    },
    /// Launch a managed PI session for the selected agent
    Spawn {
        /// Resolve layout for a named agent
        #[arg(long)]
        agent: Option<String>,
        /// Optional prompt to pass into PI
        prompt: Option<String>,
    },
    /// Attach PI to an existing managed session
    Attach {
        /// Resolve layout for a named agent
        #[arg(long)]
        agent: Option<String>,
        session_id: String,
    },
    /// Run PI with managed agent env and forward remaining args
    Run {
        /// Resolve layout for a named agent
        #[arg(long)]
        agent: Option<String>,
        args: Vec<String>,
    },
    /// Interactive chat with managed PI agent
    Chat {
        /// Resolve layout for a named agent
        #[arg(long)]
        agent: Option<String>,
        /// Initial prompt (optional)
        prompt: Option<String>,
    },
    /// Plugin management — validate, install, list, uninstall
    Plugin {
        #[command(subcommand)]
        cmd: PluginCmd,
    },
    /// Skill discovery and eval suite management
    Skills {
        #[command(subcommand)]
        cmd: SkillsCmd,
    },
}

pub fn dispatch(cmd: &AgentCmd, json: bool) -> Result<String, String> {
    match cmd {
        AgentCmd::Install { agent } => install::run(agent.as_deref(), json),
        AgentCmd::Doctor { agent } => doctor::run(agent.as_deref(), json),
        AgentCmd::Extensions { cmd } => extensions::run(cmd, json),
        AgentCmd::Agents { cmd } => agents::run(cmd, json),
        AgentCmd::Models { cmd } => models::run(cmd, json),
        AgentCmd::Auth { cmd } => auth::run(cmd, json),
        AgentCmd::Spawn { agent, prompt } => {
            spawn::spawn(agent.as_deref(), prompt.as_deref(), json)
        }
        AgentCmd::Attach { agent, session_id } => spawn::attach(agent.as_deref(), session_id, json),
        AgentCmd::Run { agent, args } => spawn::run_pi(agent.as_deref(), args, json),
        AgentCmd::Chat { agent, prompt } => {
            chat::run(agent.as_deref(), prompt.as_deref())
                .map_err(|e| e.to_string())?;
            Ok(String::new())
        }
        AgentCmd::Plugin { cmd } => plugins::dispatch_plugin(cmd, json),
        AgentCmd::Skills { cmd } => plugins::dispatch_skills(cmd, json),
    }
}

#[derive(Subcommand)]
pub enum ExtensionsCmd {
    /// Copy the repo `.pi` asset tree into the selected managed agent dir
    Sync(AgentSelection),
    /// Report sync status for the selected managed agent dir
    Status(AgentSelection),
    /// List synced extension assets for the selected managed agent dir
    List(AgentSelection),
}

#[derive(Args, Clone)]
pub struct AgentSelection {
    /// Resolve layout for a named agent
    #[arg(long)]
    pub agent: Option<String>,
}

#[derive(Subcommand)]
pub enum AgentsCmd {
    /// Ensure the default `main` agent is registered
    Init,
    /// Add a named managed agent
    Add { id: String },
    /// List registered agents
    List,
    /// Inspect one registered agent
    Inspect { id: String },
}

#[derive(Subcommand)]
pub enum ModelsCmd {
    /// Ensure the managed agent has a PI-compatible models file
    Init(AgentSelection),
    /// Add a supported provider definition to models.json
    AddProvider {
        #[command(flatten)]
        selection: AgentSelection,
        provider: String,
    },
    /// Set the default provider/model pair
    SetDefault {
        #[command(flatten)]
        selection: AgentSelection,
        provider_model: String,
    },
    /// Show the current models status
    Status(AgentSelection),
}

#[derive(Subcommand)]
pub enum AuthCmd {
    /// Set the API key for a supported provider profile
    Set {
        #[command(flatten)]
        selection: AgentSelection,
        provider: String,
        #[arg(long)]
        api_key: String,
    },
    /// Show redacted auth profile status
    Status(AgentSelection),
}

#[derive(Subcommand)]
pub enum PluginCmd {
    /// Validate a plugin root directory
    Validate {
        /// Path to the plugin root directory
        path: String,
    },
    /// Install a plugin from source directory to the local cache
    Install {
        /// Path to the plugin source directory
        source: String,
    },
    /// List all installed plugins
    List,
    /// Uninstall a plugin by name
    Uninstall {
        /// Plugin name to uninstall
        name: String,
    },
}

#[derive(Subcommand)]
pub enum SkillsCmd {
    /// List skills from a plugin root
    List {
        /// Path to the plugin root directory
        plugin: String,
    },
    /// Discover and list eval suites
    Eval {
        /// Path to the eval suites directory
        suite: String,
    },
}
