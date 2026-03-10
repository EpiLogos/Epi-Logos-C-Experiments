use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use super::{sessions::SessionStore, system};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BridgeEvent {
    pub kind: String,
    pub table: String,
    pub payload: Value,
    pub timestamp_ms: u128,
}

pub struct SpacetimeBridge {
    state_root: PathBuf,
}

impl SpacetimeBridge {
    pub fn new(state_root: impl AsRef<Path>) -> Result<Self, String> {
        let state_root = state_root.as_ref().to_path_buf();
        fs::create_dir_all(event_path(&state_root).parent().unwrap())
            .map_err(|err| err.to_string())?;
        Ok(Self { state_root })
    }

    pub fn publish_presence(&self, operator_id: &str) -> Result<(), String> {
        let snapshot = system::presence(&self.state_root)?;
        self.append(
            "presence",
            "now_presence",
            json!({
                "operatorId": operator_id,
                "heartbeats": snapshot["heartbeats"].clone(),
                "events": snapshot["events"].clone(),
            }),
        )
    }

    pub fn publish_session(&self, identifier: &str, now_alias: Option<&str>) -> Result<(), String> {
        let store = SessionStore::new(&self.state_root)?;
        let record = store.resolve(identifier)?;
        let mut payload = json!({
            "canonicalKey": record.canonical_key,
            "aliases": record.aliases,
            "label": record.label,
            "activeAgentId": record.active_agent_id,
            "subagentLineage": record.subagent_lineage,
            "workspaceRoot": record.workspace_root,
            "bootstrapScope": record.bootstrap_scope,
        });

        if let Some(alias) = now_alias {
            payload["nowAlias"] = json!(alias);
        }

        self.append("session_surface", "now_sessions", payload)
    }

    pub fn publish_activity_event(&self, kind: &str, payload: Value) -> Result<(), String> {
        self.append(
            "activity_event",
            "now_activity",
            json!({
                "kind": kind,
                "payload": payload,
            }),
        )
    }

    pub fn publish_m_clock_placeholder(&self, clock: &str) -> Result<(), String> {
        self.append(
            "m_clock_state",
            "now_m_clock",
            json!({
                "clock": clock,
                "state": "placeholder",
                "bridgeMode": "one_way",
            }),
        )
    }

    pub fn drain_test_events(&self) -> Result<Vec<BridgeEvent>, String> {
        let path = event_path(&self.state_root);
        if !path.exists() {
            return Ok(Vec::new());
        }

        let content = fs::read_to_string(&path).map_err(|err| err.to_string())?;
        let events = serde_json::from_str(&content).map_err(|err| err.to_string())?;
        fs::write(path, "[]").map_err(|err| err.to_string())?;
        Ok(events)
    }

    fn append(&self, kind: &str, table: &str, payload: Value) -> Result<(), String> {
        let path = event_path(&self.state_root);
        let mut events = if path.exists() {
            let content = fs::read_to_string(&path).map_err(|err| err.to_string())?;
            serde_json::from_str::<Vec<BridgeEvent>>(&content).map_err(|err| err.to_string())?
        } else {
            Vec::new()
        };

        events.push(BridgeEvent {
            kind: kind.to_owned(),
            table: table.to_owned(),
            payload,
            timestamp_ms: now_ms()?,
        });

        let content = serde_json::to_string_pretty(&events).map_err(|err| err.to_string())?;
        fs::write(path, content).map_err(|err| err.to_string())
    }
}

fn event_path(state_root: &Path) -> PathBuf {
    state_root
        .join("spacetimedb-bridge")
        .join("test-events.json")
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
