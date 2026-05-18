mod agent_dirs;
mod agents;
mod auth;
mod capabilities;
mod chain;
pub mod claw_runtime;
pub mod codex_runtime;
mod doctor;
mod extensions;
mod goal;
mod hooks;
mod install;
pub mod launch;
mod models;
mod plugin_manifest;
mod plugins;
mod roster;
pub mod runtime;
pub mod session;
pub mod session_propagation;
mod skills;
pub mod spawn;
mod subagents;
mod team;
mod tmux;
pub mod vak;

use clap::{Args, Subcommand};
use std::path::PathBuf;

pub use agent_dirs::{
    canonical_pi_agent_dir, managed_epi_agent_dir, AgentLayout, DEFAULT_PI_AGENT_ID,
};

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
    /// Manage durable multi-agent teams and dispatch runs
    Team {
        #[command(subcommand)]
        cmd: TeamCmd,
    },
    /// Execute ordered agent chains through the native runtime
    Chain {
        #[command(subcommand)]
        cmd: ChainCmd,
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
    /// Launch Pi-Pi meta-agent (builds Pi agents; sets EPI_AGENT_MODE=pipi)
    Pipi,
    /// Launch the default Epii PI embodiment
    Epii(AgentLaunchArgs),
    /// Launch the Anima PI embodiment, optionally role-scoped
    Anima(AgentLaunchArgs),
    /// Launch the Aletheia PI embodiment, optionally role-scoped
    Aletheia(AgentLaunchArgs),
    /// Launch a managed PI session for the selected agent
    Spawn {
        /// Resolve layout for a named agent
        #[arg(long)]
        agent: Option<String>,
        /// Scope the launch to a known agent surface/role within the selected embodiment
        #[arg(long)]
        role: Option<String>,
        /// Launch inside the Khora tmux terminal envelope
        #[arg(long)]
        persist: bool,
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
        /// Scope the launch to a known agent surface/role within the selected embodiment
        #[arg(long)]
        role: Option<String>,
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
        /// Scope the launch to a known agent surface/role within the selected embodiment
        #[arg(long)]
        role: Option<String>,
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
        /// Scope the launch to a known agent surface/role within the selected embodiment
        #[arg(long)]
        role: Option<String>,
        /// Launch inside the Khora tmux terminal envelope
        #[arg(long)]
        persist: bool,
        /// Initial prompt (optional)
        prompt: Option<String>,
    },
    /// Manage the Khora tmux terminal envelope for raw process persistence
    Tmux {
        #[command(subcommand)]
        cmd: TmuxCmd,
    },
    /// Inspect the agent embodiment and role surface roster
    Roster {
        #[command(subcommand)]
        cmd: RosterCmd,
    },
    /// Manage workspace-bound Khora session lifecycle
    Session {
        #[command(subcommand)]
        cmd: session::SessionCmd,
    },
    /// Create and manage NOW-bound goal prelude artifacts
    Goal {
        #[command(subcommand)]
        cmd: goal::GoalCmd,
    },
    /// Evaluate VAK coordinates for a task
    #[command(name = "vak")]
    Vak {
        #[command(subcommand)]
        cmd: VakCmd,
    },
    /// Manage repo-local oh-my-codex (OMX) Codex runtime
    Codex {
        #[command(subcommand)]
        cmd: CodexCmd,
    },
    /// Experimental claw-rust native substrate lane
    Claw {
        #[command(subcommand)]
        cmd: ClawCmd,
    },
}

#[derive(Subcommand)]
pub enum ClawCmd {
    /// Report health of the vendored claw runtime
    Doctor {
        /// Output as JSON
        #[arg(long)]
        json: bool,
    },
    /// Non-destructive smoke path through claw runtime
    VerifyRuntime {
        /// Output as JSON
        #[arg(long)]
        json: bool,
    },
}

#[derive(Subcommand)]
pub enum CodexCmd {
    /// Install OMX runtime from vendors/oh-my-codex into .codex/ and .omx/
    Install {
        /// Output as JSON
        #[arg(long)]
        json: bool,
    },
    /// Verify repo-local Codex runtime state
    Doctor {
        /// Output as JSON
        #[arg(long)]
        json: bool,
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

#[derive(Args, Clone)]
pub struct AgentLaunchArgs {
    /// Scope the launch to a known agent surface/role within this embodiment
    #[arg(long)]
    pub role: Option<String>,
    /// Launch inside the Khora tmux terminal envelope
    #[arg(long)]
    pub persist: bool,
    /// Load one or more plugin bundles in-place for this session
    #[arg(long = "plugin-dir")]
    pub plugin_dirs: Vec<PathBuf>,
    /// Optional prompt to pass into PI
    pub prompt: Option<String>,
}

pub async fn dispatch(cmd: Option<&AgentCmd>, json: bool) -> Result<String, String> {
    let Some(cmd) = cmd else {
        return spawn::spawn(Some(DEFAULT_PI_AGENT_ID), None, false, &[], None, json).await;
    };

    match cmd {
        AgentCmd::Plugin { cmd } => plugins::run_plugin(cmd, json),
        AgentCmd::Plugins { cmd } => plugins::run_plugins(cmd, json),
        AgentCmd::Skill { cmd } => skills::run(cmd, json),
        AgentCmd::Subagent { cmd } => subagents::run(cmd, json),
        AgentCmd::Hooks { cmd } => hooks::run(cmd, json),
        AgentCmd::Team { cmd } => team::run(cmd, json),
        AgentCmd::Chain { cmd } => chain::run(cmd, json),
        AgentCmd::Install { agent } => install::run(agent.as_deref(), json),
        AgentCmd::Doctor { agent } => doctor::run(agent.as_deref(), json),
        AgentCmd::Extensions { cmd } => extensions::run(cmd, json),
        AgentCmd::Agents { cmd } => agents::run(cmd, json),
        AgentCmd::Models { cmd } => models::run(cmd, json),
        AgentCmd::Auth { cmd } => auth::run(cmd, json),
        AgentCmd::Pipi => {
            std::env::set_var("EPI_AGENT_MODE", "pipi");
            spawn::spawn(Some(DEFAULT_PI_AGENT_ID), None, false, &[], None, json).await
        }
        AgentCmd::Epii(args) => launch_direct("epii", args, json).await,
        AgentCmd::Anima(args) => launch_direct("anima", args, json).await,
        AgentCmd::Aletheia(args) => launch_direct("aletheia", args, json).await,
        AgentCmd::Spawn {
            agent,
            role,
            persist,
            plugin_dirs,
            prompt,
        } => {
            spawn::spawn(
                agent.as_deref(),
                role.as_deref(),
                *persist,
                plugin_dirs,
                prompt.as_deref(),
                json,
            )
            .await
        }
        AgentCmd::Attach { agent, session_id } => {
            spawn::attach(agent.as_deref(), session_id, json).await
        }
        AgentCmd::Run {
            agent,
            role,
            plugin_dirs,
            args,
        } => spawn::run_pi(agent.as_deref(), role.as_deref(), plugin_dirs, args, json).await,
        AgentCmd::VerifyRuntime {
            agent,
            role,
            plugin_dirs,
            prompt,
        } => {
            spawn::verify_runtime(
                agent.as_deref(),
                role.as_deref(),
                plugin_dirs,
                prompt.as_deref(),
                json,
            )
            .await
        }
        AgentCmd::Chat {
            agent,
            role,
            persist,
            prompt,
        } => {
            spawn::spawn(
                agent.as_deref(),
                role.as_deref(),
                *persist,
                &[],
                prompt.as_deref(),
                json,
            )
            .await
        }
        AgentCmd::Tmux { cmd } => tmux::run(cmd, json),
        AgentCmd::Roster { cmd } => roster::run(cmd, json),
        AgentCmd::Session { cmd } => session::run(cmd, json),
        AgentCmd::Goal { cmd } => goal::run(cmd, json),
        AgentCmd::Codex { cmd } => match cmd {
            CodexCmd::Install { json: as_json } => codex_runtime::run_install(*as_json || json),
            CodexCmd::Doctor { json: as_json } => codex_runtime::run_doctor(*as_json || json),
        },
        AgentCmd::Claw { cmd } => match cmd {
            ClawCmd::Doctor { json: as_json } => claw_runtime::run_doctor(*as_json || json),
            ClawCmd::VerifyRuntime { json: as_json } => {
                claw_runtime::run_verify_runtime(*as_json || json)
            }
        },
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

async fn launch_direct(
    agent_id: &str,
    args: &AgentLaunchArgs,
    json: bool,
) -> Result<String, String> {
    spawn::spawn(
        Some(agent_id),
        args.role.as_deref(),
        args.persist,
        &args.plugin_dirs,
        args.prompt.as_deref(),
        json,
    )
    .await
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
    /// Spawn a real managed subagent session and run a prompt
    Run {
        #[arg(long)]
        agent: String,
        #[arg(long, default_value = "agent:epii:main")]
        parent_session: String,
        #[arg(long)]
        session_key: Option<String>,
        #[arg(long)]
        task: String,
    },
    /// Continue an existing managed subagent session
    Continue {
        #[arg(long)]
        session_key: String,
        #[arg(long)]
        task: String,
    },
    /// List tracked subagent sessions
    List {
        #[arg(long)]
        parent_session: Option<String>,
    },
    /// Stop a tracked subagent session
    Stop {
        #[arg(long)]
        session_key: String,
    },
}

#[derive(Subcommand)]
pub enum TeamCmd {
    /// Create a durable team record and worker sessions without executing them
    Create {
        #[arg(long, default_value = "agent:epii:main")]
        parent_session: String,
        #[arg(long, default_value = "parallel")]
        strategy: String,
        #[arg(long)]
        label: Option<String>,
        #[arg(long)]
        task: String,
        #[arg(long = "agent")]
        agents: Vec<String>,
    },
    /// Dispatch a single agent through the durable team runtime
    Dispatch {
        #[arg(long, default_value = "agent:epii:main")]
        parent_session: String,
        #[arg(long)]
        label: Option<String>,
        #[arg(long)]
        agent: String,
        #[arg(long)]
        task: String,
        #[arg(long)]
        session_key: Option<String>,
    },
    /// List durable team records
    List,
    /// Resolve one durable team record
    Resolve { team_id: String },
    /// Stop a durable team record
    Stop { team_id: String },
}

#[derive(Subcommand)]
pub enum ChainCmd {
    /// Run an ordered chain of agents through the native runtime
    Run {
        #[arg(long, default_value = "agent:epii:main")]
        parent_session: String,
        #[arg(long)]
        label: Option<String>,
        #[arg(long)]
        task: String,
        #[arg(long = "agent")]
        agents: Vec<String>,
    },
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
    /// Ensure the default `epii` agent is registered
    Init,
    /// Add a named managed agent
    Add { id: String },
    /// List registered agents
    List,
    /// Inspect one registered agent
    Inspect { id: String },
}

#[derive(Subcommand)]
pub enum TmuxCmd {
    /// Start the Khora tmux terminal envelope if it is not already running
    Up {
        /// Override the derived tmux session name
        #[arg(long)]
        name: Option<String>,
        /// Agent embodiment to export inside the terminal envelope
        #[arg(long, default_value = DEFAULT_PI_AGENT_ID)]
        agent: String,
    },
    /// Attach to the Khora tmux terminal envelope
    Attach {
        /// Override the derived tmux session name
        #[arg(long)]
        name: Option<String>,
    },
    /// Report whether the Khora tmux terminal envelope is running
    Status {
        /// Override the derived tmux session name
        #[arg(long)]
        name: Option<String>,
    },
    /// Tear down the Khora tmux terminal envelope
    Down {
        /// Override the derived tmux session name
        #[arg(long)]
        name: Option<String>,
    },
}

#[derive(Subcommand)]
pub enum RosterCmd {
    /// List PI embodiments and role-scoped agent surfaces
    List,
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
