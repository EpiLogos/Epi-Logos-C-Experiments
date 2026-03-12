use clap::Subcommand;

pub mod approvals;
pub mod auth;
pub mod bootstrap;
pub mod browser;
pub mod channels;
pub mod chat;
pub mod config;
pub mod config_tui;
pub mod cron;
pub mod devices;
pub mod events;
pub mod lock;
pub mod logs;
pub mod models;
pub mod nara;
pub mod nodes;
pub mod omnipanel;
pub mod parity;
pub mod protocol;
pub mod runs;
pub mod runtime;
pub mod server;
pub mod session_store;
pub mod sessions;
pub mod skills;
pub mod spacetimedb_bridge;
pub mod subagents;
pub mod system;
pub mod tls;
pub mod transcripts;
pub mod update;
pub mod wizard;
pub mod workspace;

#[derive(Subcommand)]
pub enum GateCmd {
    /// Show gateway status
    Status,
    /// Start the gateway runtime
    Start {
        #[arg(long, default_value_t = parity::DEFAULT_GATEWAY_PORT)]
        port: u16,
    },
    /// Stop the gateway runtime
    Stop,
    /// Manage gateway configuration
    Config {
        #[command(subcommand)]
        cmd: Option<GateConfigCmd>,
    },
    /// List supported gateway methods
    Methods,
    /// Inspect gateway runtime state
    Inspect,
    /// Subscribe to live gateway state
    Subscribe,
    /// Pair a device or node with the gateway
    Pair,
    /// Inspect gateway bootstrap state
    Bootstrap,
    /// Inspect gateway workspace state
    Workspace,
}

#[derive(Subcommand)]
pub enum GateConfigCmd {
    Show,
    Schema,
    Set { key: String, value: String },
    Patch { patch: String },
    Apply { patch: Option<String> },
    Tui,
}

pub async fn dispatch(cmd: &GateCmd, json: bool) -> Result<String, String> {
    match cmd {
        GateCmd::Status => server::render_status(json),
        GateCmd::Start { port } => {
            let config = config::GatewayConfig::with_port(*port);
            server::start(&config, json).await
        }
        GateCmd::Stop => server::stop(json),
        GateCmd::Config { cmd } => match cmd {
            Some(GateConfigCmd::Show) | None => config::render_default(json),
            Some(GateConfigCmd::Schema) => {
                if json {
                    serde_json::to_string_pretty(&config::schema_value())
                        .map_err(|err| err.to_string())
                } else {
                    Ok(config::schema_value().to_string())
                }
            }
            Some(GateConfigCmd::Set { key, value }) => {
                let state_root = config::gate_root_from_env()?;
                let value: serde_json::Value = serde_json::from_str(value)
                    .unwrap_or_else(|_| serde_json::Value::String(value.clone()));
                let rendered = config::set_value(state_root, key, &value)?;
                if json {
                    serde_json::to_string_pretty(&rendered).map_err(|err| err.to_string())
                } else {
                    Ok(rendered.to_string())
                }
            }
            Some(GateConfigCmd::Patch { patch }) => {
                let state_root = config::gate_root_from_env()?;
                let patch: serde_json::Value =
                    serde_json::from_str(patch).map_err(|err| err.to_string())?;
                let rendered = config::patch_value(state_root, &patch)?;
                if json {
                    serde_json::to_string_pretty(&rendered).map_err(|err| err.to_string())
                } else {
                    Ok(rendered.to_string())
                }
            }
            Some(GateConfigCmd::Apply { patch }) => {
                let state_root = config::gate_root_from_env()?;
                let patch = match patch {
                    Some(patch) => serde_json::from_str(patch).map_err(|err| err.to_string())?,
                    None => serde_json::json!({}),
                };
                let rendered = config::apply_value(state_root, &patch)?;
                if json {
                    serde_json::to_string_pretty(&rendered).map_err(|err| err.to_string())
                } else {
                    Ok(rendered.to_string())
                }
            }
            Some(GateConfigCmd::Tui) => config_tui::render(config::gate_root_from_env()?),
        },
        GateCmd::Methods => {
            if json {
                serde_json::to_string(&parity::method_names()).map_err(|err| err.to_string())
            } else {
                Ok(parity::method_names().join("\n"))
            }
        }
        GateCmd::Inspect => server::render_status(json),
        GateCmd::Subscribe => Err("epi gate subscribe: not yet implemented".to_owned()),
        GateCmd::Pair => Err("epi gate pair: not yet implemented".to_owned()),
        GateCmd::Bootstrap => Err("epi gate bootstrap: not yet implemented".to_owned()),
        GateCmd::Workspace => Err("epi gate workspace: not yet implemented".to_owned()),
    }
}
