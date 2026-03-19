mod agent_dirs;
mod agents;
mod auth;
mod capabilities;
pub mod chat;
mod doctor;
mod extensions;
mod hooks;
mod install;
mod models;
mod plugin_manifest;
mod plugins;
pub mod session;
mod skills;
pub mod spawn;
mod subagents;
pub mod vak;

use clap::{Args, Subcommand};
use std::path::PathBuf;

pub use agent_dirs::AgentLayout;

#[derive(Subcommand)]
pub enum AgentCmd {
    /// Validate and inspect a single plugin bundle
    Plugin {
        #[command(subcommand)]
        cmd: PluginCmd,
    },
    /// Discover plugin bundles available to the current repo
    Plugins {
        #[command(subcommand)]
        cmd: PluginsCmd,
    },
    /// Validate a single skill definition
    Skill {
        #[command(subcommand)]
        cmd: SkillCmd,
    },
    /// Validate a single subagent definition
    Subagent {
        #[command(subcommand)]
        cmd: SubagentCmd,
    },
    /// Validate or execute hook configurations
    Hooks {
        #[command(subcommand)]
        cmd: HooksCmd,
    },
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
        /// Load one or more plugin bundles in-place for this session
        #[arg(long = "plugin-dir")]
        plugin_dirs: Vec<PathBuf>,
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
        /// Load one or more plugin bundles in-place for this session
        #[arg(long = "plugin-dir")]
        plugin_dirs: Vec<PathBuf>,
        args: Vec<String>,
    },
    /// Execute a real PI smoke run in an isolated runtime sandbox
    VerifyRuntime {
        /// Resolve layout for a named agent
        #[arg(long)]
        agent: Option<String>,
        /// Load one or more plugin bundles in-place for this verification run
        #[arg(long = "plugin-dir")]
        plugin_dirs: Vec<PathBuf>,
        /// Override the default smoke prompt
        #[arg(long)]
        prompt: Option<String>,
    },
    /// Interactive chat with managed PI agent
    Chat {
        /// Resolve layout for a named agent
        #[arg(long)]
        agent: Option<String>,
        /// Initial prompt (optional)
        prompt: Option<String>,
    },
    /// Manage workspace-bound Khora session lifecycle
    Session {
        #[command(subcommand)]
        cmd: session::SessionCmd,
    },
    /// Evaluate VAK coordinates for a task
    #[command(name = "vak")]
    Vak {
        #[command(subcommand)]
        cmd: VakCmd,
    },
}

#[derive(Subcommand)]
pub enum VakCmd {
    /// Assign 6-layer coordinates (CPF/CT/CP/CF/CFP/CS) to a task
    Evaluate {
        /// Task description to evaluate
        task: String,
        /// Output as JSON
        #[arg(long)]
        json: bool,
    },
}

pub fn dispatch(cmd: &AgentCmd, json: bool) -> Result<String, String> {
    match cmd {
        AgentCmd::Plugin { cmd } => plugins::run_plugin(cmd, json),
        AgentCmd::Plugins { cmd } => plugins::run_plugins(cmd, json),
        AgentCmd::Skill { cmd } => skills::run(cmd, json),
        AgentCmd::Subagent { cmd } => subagents::run(cmd, json),
        AgentCmd::Hooks { cmd } => hooks::run(cmd, json),
        AgentCmd::Install { agent } => install::run(agent.as_deref(), json),
        AgentCmd::Doctor { agent } => doctor::run(agent.as_deref(), json),
        AgentCmd::Extensions { cmd } => extensions::run(cmd, json),
        AgentCmd::Agents { cmd } => agents::run(cmd, json),
        AgentCmd::Models { cmd } => models::run(cmd, json),
        AgentCmd::Auth { cmd } => auth::run(cmd, json),
        AgentCmd::Spawn {
            agent,
            plugin_dirs,
            prompt,
        } => spawn::spawn(agent.as_deref(), plugin_dirs, prompt.as_deref(), json),
        AgentCmd::Attach { agent, session_id } => spawn::attach(agent.as_deref(), session_id, json),
        AgentCmd::Run {
            agent,
            plugin_dirs,
            args,
        } => spawn::run_pi(agent.as_deref(), plugin_dirs, args, json),
        AgentCmd::VerifyRuntime {
            agent,
            plugin_dirs,
            prompt,
        } => spawn::verify_runtime(agent.as_deref(), plugin_dirs, prompt.as_deref(), json),
        AgentCmd::Chat { agent, prompt } => {
            chat::run(agent.as_deref(), prompt.as_deref()).map_err(|e| e.to_string())?;
            Ok(String::new())
        }
        AgentCmd::Session { cmd } => session::run(cmd, json),
        AgentCmd::Vak { cmd } => match cmd {
            VakCmd::Evaluate {
                task,
                json: as_json,
            } => {
                let result = vak::evaluate_vak(task);
                if *as_json || json {
                    Ok(serde_json::to_string_pretty(&result).unwrap_or_default())
                } else {
                    let agent = vak::cf_to_agent(result.cf.as_deref().unwrap_or(""));
                    Ok(format!(
                        "CPF: {}\nCT:  {}\nCP:  {}\nCF:  {} → agent: {}\nCFP: {}\nCS:  {}\n{}",
                        result.cpf.as_deref().unwrap_or("-"),
                        result.ct.as_deref().unwrap_or("-"),
                        result.cp.as_deref().unwrap_or("-"),
                        result.cf.as_deref().unwrap_or("-"),
                        agent,
                        result.cfp.as_deref().unwrap_or("-"),
                        result.cs.as_deref().unwrap_or("-"),
                        result.rationale.as_deref().unwrap_or(""),
                    ))
                }
            }
        },
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

#[derive(Subcommand)]
pub enum PluginCmd {
    /// Validate a single plugin bundle rooted at the provided directory
    Validate { path: PathBuf },
}

#[derive(Subcommand)]
pub enum PluginsCmd {
    /// Discover repo-local plugins under `plugins/`
    List,
}

#[derive(Subcommand)]
pub enum SkillCmd {
    /// Validate a single skill file
    Validate { path: PathBuf },
}

#[derive(Subcommand)]
pub enum SubagentCmd {
    /// Validate a single subagent file
    Validate { path: PathBuf },
}

#[derive(Subcommand)]
pub enum HooksCmd {
    /// Validate a hooks config file or plugin root
    Validate { path: PathBuf },
    /// Execute matching command hooks with a JSON fixture on stdin
    Test {
        #[arg(long)]
        event: String,
        #[arg(long)]
        fixture: PathBuf,
        path: PathBuf,
    },
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
