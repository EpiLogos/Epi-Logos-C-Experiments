use std::path::PathBuf;
use std::sync::Arc;

use serde::{Deserialize, Serialize};
use tokio::sync::{Mutex, RwLock};

use crate::agents::AgentRegistry;
use crate::clock::PortalClockState;
use crate::gateway::GatewayConnection;
use crate::graph::Neo4jClient;
use crate::temporal::PortalRuntimeState;

pub struct AppState {
    pub gateway: Arc<RwLock<Option<GatewayConnection>>>,
    pub clock: Arc<Mutex<PortalClockState>>,
    pub runtime: Arc<RwLock<PortalRuntimeState>>,
    pub neo4j: Arc<RwLock<Option<Neo4jClient>>>,
    pub vault: Arc<VaultPaths>,
    pub settings: Arc<RwLock<Settings>>,
    pub agents: Arc<AgentRegistry>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            gateway: Arc::new(RwLock::new(None)),
            clock: Arc::new(Mutex::new(PortalClockState::default())),
            runtime: Arc::new(RwLock::new(PortalRuntimeState::default())),
            neo4j: Arc::new(RwLock::new(None)),
            vault: Arc::new(VaultPaths::from_env()),
            settings: Arc::new(RwLock::new(Settings::from_env())),
            agents: Arc::new(AgentRegistry::new()),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Settings {
    pub gateway_url: String,
    pub gateway_token: Option<String>,
    pub gateway_password: Option<String>,
    pub neo4j_url: String,
    pub neo4j_user: String,
    pub neo4j_password: Option<String>,
    pub spacetime_mode: SpacetimeMode,
    pub spacetime_url: String,
    pub theme: String,
}

impl Settings {
    pub fn from_env() -> Self {
        Self {
            gateway_url: std::env::var("EPI_GATEWAY_URL")
                .unwrap_or_else(|_| "ws://127.0.0.1:18794".into()),
            gateway_token: std::env::var("EPI_GATEWAY_TOKEN").ok(),
            gateway_password: std::env::var("EPI_GATEWAY_PASSWORD").ok(),
            neo4j_url: std::env::var("EPI_NEO4J_URL")
                .unwrap_or_else(|_| "bolt://127.0.0.1:7687".into()),
            neo4j_user: std::env::var("EPI_NEO4J_USER")
                .unwrap_or_else(|_| "neo4j".into()),
            neo4j_password: std::env::var("EPI_NEO4J_PASSWORD").ok(),
            spacetime_mode: if std::env::var("EPI_SPACETIME_SUBSCRIPTION_MODE")
                .unwrap_or_default()
                == "native-websocket"
            {
                SpacetimeMode::NativeWebSocket
            } else if std::env::var("EPI_SPACETIME_SUBSCRIPTION_MODE")
                .unwrap_or_default()
                == "disabled"
            {
                SpacetimeMode::Disabled
            } else {
                SpacetimeMode::Polling {
                    interval_ms: std::env::var("EPI_SPACETIME_POLL_MS")
                        .ok()
                        .and_then(|v| v.parse().ok())
                        .unwrap_or(1000),
                }
            },
            spacetime_url: std::env::var("EPI_SPACETIME_URL")
                .unwrap_or_else(|_| "ws://127.0.0.1:3000/v1".into()),
            theme: "dark".into(),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "mode", rename_all = "snake_case")]
pub enum SpacetimeMode {
    Polling { interval_ms: u64 },
    NativeWebSocket,
    Disabled,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct VaultPaths {
    pub idea_root: PathBuf,
    pub present_root: PathBuf,
}

impl VaultPaths {
    pub fn from_env() -> Self {
        let idea_root = std::env::var("EPI_VAULT_IDEA_ROOT")
            .map(PathBuf::from)
            .unwrap_or_else(|_| {
                dirs::document_dir()
                    .unwrap_or_else(|| PathBuf::from("."))
                    .join("Epi-Logos C Experiments/Idea")
            });
        let present_root = std::env::var("EPI_VAULT_PRESENT_ROOT")
            .map(PathBuf::from)
            .unwrap_or_else(|_| idea_root.join("Empty/Present"));
        Self {
            idea_root,
            present_root,
        }
    }
}
