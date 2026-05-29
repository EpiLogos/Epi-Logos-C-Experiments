use clap::Subcommand;

pub mod anima;
pub mod approvals;
pub mod auth;
pub mod bootstrap;
pub mod browser;
pub mod channel_adapters;
pub mod channels;
pub mod chat;
pub mod config;
pub mod config_tui;
pub mod cron;
pub mod devices;
pub mod epii;
pub mod events;
pub mod graph;
pub mod graphiti;
pub mod improve;
pub mod lock;
pub mod logs;
pub mod models;
pub mod nara;
pub mod nodes;
pub mod omnipanel;
pub mod parity;
pub mod preflight;
pub mod protocol;
pub mod review;
pub mod runs;
pub mod runtime;
pub mod secrets;
pub mod server;
pub mod session_store;
pub mod sessions;
pub mod skills;
pub mod spacetimedb_bridge;
pub mod subagents;
pub mod system;
pub mod team_store;
pub mod temporal;
pub mod tls;
pub mod transcripts;
pub mod update;
pub mod wizard;
pub mod workspace;

#[derive(Subcommand)]
pub enum GraphitiCmd {
    /// Start the legacy Graphiti compatibility runtime
    Start,
    /// Stop the legacy Graphiti compatibility runtime
    Stop,
    /// Show Graphiti runtime health and status
    Status,
}

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
    /// Manage persisted cron jobs through the gateway state store
    Cron {
        #[command(subcommand)]
        cmd: GateCronCmd,
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
    /// Inspect S3' temporal context for a session
    Temporal {
        #[command(subcommand)]
        cmd: GateTemporalCmd,
    },
    /// Manage the Graphiti runtime compatibility adapter (port 37778)
    Graphiti {
        #[command(subcommand)]
        cmd: GraphitiCmd,
    },
    /// Operate on gateway SessionRecord entries (patch metadata, etc.)
    Sessions {
        #[command(subcommand)]
        cmd: GateSessionsCmd,
    },
    /// Dispatch a request to a gateway multi-session endpoint
    /// (e.g. route_anima_invoke). Mirrors C1/C2 follow-up pattern —
    /// operates directly on the local SessionStore.
    Dispatch {
        #[command(subcommand)]
        cmd: GateDispatchCmd,
    },
}

#[derive(Subcommand)]
pub enum GateDispatchCmd {
    /// Invoke another Anima session via `route_anima_invoke` (D2 endpoint).
    ///
    /// Closes the D3 follow-up CLI-bridge gap: TS tools `anima_self_invoke`
    /// (S4-4p-anima) and `epii_invoke_anima` (S4-5p-aletheia) build the
    /// canonical payload via `buildAnimaInvokePayload` and shell out here
    /// to actually post it to the gateway.
    AnimaInvoke {
        /// JSON-encoded `epi_s3_gateway::dispatch::AnimaInvokeRequest`. Must
        /// include `target_session_key`, `task`, and `vak_address`. Malformed
        /// JSON exits non-zero. Unknown target session exits non-zero.
        #[arg(long)]
        payload_json: String,
    },
}

#[derive(Subcommand)]
pub enum GateSessionsCmd {
    /// Patch a SessionRecord field. Currently supports vak_address.
    ///
    /// Mirrors the `sessions.patch` JSON-RPC method but operates directly on
    /// the local SessionStore (gate state root) — same pattern as
    /// `epi gate temporal context`. Used by Khora's session_start tool to
    /// echo the compose-phase VakAddress into the gateway record alongside
    /// the env-propagated EPI_SESSION_VAK_ADDRESS.
    Patch {
        /// Session canonical key or alias used to resolve the record.
        #[arg(long)]
        session_id: String,
        /// JSON-encoded `portal_core::VakAddress`. When present and parses
        /// successfully, the record's `vak_address` field is set. Absent or
        /// null = no change. Malformed JSON exits non-zero — callers must
        /// either supply a valid VAK or omit the flag entirely.
        #[arg(long = "vak-address-json")]
        vak_address_json: Option<String>,
    },
    /// Read a SessionRecord. Mirrors `sessions.resolve` but operates directly
    /// on the local SessionStore (gate state root), same pattern as `patch`.
    /// Used by Khora's session_shutdown handler (C2 closure_kind discriminator)
    /// to best-effort recover the live `vak_address` when reporting force_closed.
    Get {
        /// Session canonical key or alias used to resolve the record.
        #[arg(long)]
        session_id: String,
    },
}

#[derive(Subcommand)]
pub enum GateTemporalCmd {
    /// Resolve DAY/NOW, Redis, SpaceTimeDB, and Graphiti temporal orientation
    Context {
        #[arg(long, default_value = "agent:main:main")]
        session_key: String,
        #[arg(long, default_value = "operator")]
        agent_id: String,
        #[arg(long, default_value_t = false)]
        hydrate_redis: bool,
    },
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

#[derive(Subcommand)]
pub enum GateCronCmd {
    Status,
    List,
    Add {
        #[arg(long)]
        name: String,
        #[arg(long)]
        description: Option<String>,
        #[arg(long)]
        agent_id: Option<String>,
        #[arg(long, default_value_t = true)]
        enabled: bool,
        #[arg(long)]
        schedule: String,
        #[arg(long, default_value = "main")]
        session_target: String,
        #[arg(long, default_value = "no_wake")]
        wake_mode: String,
        #[arg(long, default_value = "{}")]
        payload: String,
        #[arg(long)]
        isolation: Option<String>,
    },
    Update {
        #[arg(long)]
        id: String,
        #[arg(long)]
        enabled: Option<bool>,
        #[arg(long)]
        description: Option<String>,
    },
    Run {
        #[arg(long)]
        id: String,
    },
    Runs {
        #[arg(long)]
        id: String,
    },
    Remove {
        #[arg(long)]
        id: String,
    },
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
        GateCmd::Cron { cmd } => dispatch_cron(cmd, json),
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
        GateCmd::Temporal { cmd } => dispatch_temporal(cmd, json).await,
        GateCmd::Graphiti { cmd } => match cmd {
            GraphitiCmd::Start => graphiti::start(json),
            GraphitiCmd::Stop => graphiti::stop(json),
            GraphitiCmd::Status => graphiti::status(json).await,
        },
        GateCmd::Sessions { cmd } => dispatch_sessions(cmd, json),
        GateCmd::Dispatch { cmd } => dispatch_dispatch(cmd, json),
    }
}

fn dispatch_dispatch(cmd: &GateDispatchCmd, json: bool) -> Result<String, String> {
    let state_root = config::gate_root_from_env()?;
    let store = sessions::SessionStore::new(&state_root)?;
    match cmd {
        GateDispatchCmd::AnimaInvoke { payload_json } => {
            let req: epi_s3_gateway::dispatch::AnimaInvokeRequest =
                serde_json::from_str(payload_json)
                    .map_err(|err| format!("invalid --payload-json: {err}"))?;
            let resp = epi_s3_gateway::dispatch::route_anima_invoke(&store, req)
                .map_err(|err| format!("route_anima_invoke failed: {err}"))?;
            let value = serde_json::to_value(&resp).map_err(|err| err.to_string())?;
            if json {
                serde_json::to_string_pretty(&value).map_err(|err| err.to_string())
            } else {
                serde_json::to_string(&value).map_err(|err| err.to_string())
            }
        }
    }
}

fn dispatch_sessions(cmd: &GateSessionsCmd, json: bool) -> Result<String, String> {
    let state_root = config::gate_root_from_env()?;
    let store = sessions::SessionStore::new(&state_root)?;
    match cmd {
        GateSessionsCmd::Patch {
            session_id,
            vak_address_json,
        } => {
            let vak_address = match vak_address_json.as_deref() {
                Some(raw) => Some(
                    serde_json::from_str::<portal_core::VakAddress>(raw)
                        .map_err(|err| format!("invalid --vak-address-json: {err}"))?,
                ),
                None => None,
            };
            let patch = sessions::SessionPatch {
                vak_address,
                ..Default::default()
            };
            let record = store.patch(session_id, patch)?;
            let value = sessions::record_to_value(&record);
            if json {
                serde_json::to_string_pretty(&value).map_err(|err| err.to_string())
            } else {
                Ok(value.to_string())
            }
        }
        GateSessionsCmd::Get { session_id } => {
            let record = store.resolve(session_id)?;
            let value = sessions::record_to_value(&record);
            if json {
                serde_json::to_string_pretty(&value).map_err(|err| err.to_string())
            } else {
                Ok(value.to_string())
            }
        }
    }
}

async fn dispatch_temporal(cmd: &GateTemporalCmd, json: bool) -> Result<String, String> {
    let state_root = config::gate_root_from_env()?;
    let store = sessions::SessionStore::new(&state_root)?;
    let value = match cmd {
        GateTemporalCmd::Context {
            session_key,
            agent_id,
            hydrate_redis,
        } => {
            let mut value = temporal::context_value(&state_root, &store, session_key, agent_id)?;
            if *hydrate_redis {
                temporal::hydrate_redis_from_context(&mut value).await?;
            }
            value
        }
    };

    if json {
        serde_json::to_string_pretty(&value).map_err(|err| err.to_string())
    } else {
        Ok(value.to_string())
    }
}

fn dispatch_cron(cmd: &GateCronCmd, json: bool) -> Result<String, String> {
    let state_root = config::gate_root_from_env()?;
    let value = match cmd {
        GateCronCmd::Status => cron::status(state_root)?,
        GateCronCmd::List => cron::list(state_root)?,
        GateCronCmd::Add {
            name,
            description,
            agent_id,
            enabled,
            schedule,
            session_target,
            wake_mode,
            payload,
            isolation,
        } => cron::add(
            state_root,
            name,
            description.as_deref().unwrap_or(name),
            agent_id.as_deref(),
            *enabled,
            parse_cron_value(schedule)?,
            session_target,
            wake_mode,
            parse_json_or_string(payload)?,
            isolation.as_deref().map(parse_json_or_string).transpose()?,
        )?,
        GateCronCmd::Update {
            id,
            enabled,
            description,
        } => cron::update(state_root, id, *enabled, description.as_deref())?,
        GateCronCmd::Run { id } => cron::run(state_root, id)?,
        GateCronCmd::Runs { id } => cron::runs(state_root, id)?,
        GateCronCmd::Remove { id } => cron::remove(state_root, id)?,
    };

    if json {
        serde_json::to_string_pretty(&value).map_err(|err| err.to_string())
    } else {
        Ok(value.to_string())
    }
}

fn parse_cron_value(raw: &str) -> Result<serde_json::Value, String> {
    parse_json_or_string(raw)
}

fn parse_json_or_string(raw: &str) -> Result<serde_json::Value, String> {
    if raw.trim().is_empty() {
        return Ok(serde_json::Value::String(String::new()));
    }
    match serde_json::from_str(raw) {
        Ok(value) => Ok(value),
        Err(_) => Ok(serde_json::Value::String(raw.to_owned())),
    }
}
