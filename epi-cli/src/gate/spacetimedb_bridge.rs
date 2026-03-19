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

// ─── SpacetimePresence Client ───────────────────────────────────────────────
//
// Lightweight client stub for calling the epi-spacetime-module reducers.
// Methods log intent without requiring a live SpacetimeDB connection.
//
// When SpacetimeDB is running locally (epi gate spacetime start), swap the
// todo!() bodies for real HTTP/WebSocket calls to the SpacetimeDB REST API:
//   POST /v1/database/{name}/call/{reducer}
//
// The epi-spacetime-module crate defines the table structs and reducer
// signatures that this client mirrors.

pub struct SpacetimePresence {
    url: String,
}

impl SpacetimePresence {
    /// Create a new SpacetimePresence client pointing at the given SpacetimeDB URL.
    /// Default local URL: "http://localhost:3000"
    pub fn new(url: &str) -> Self {
        Self {
            url: url.to_owned(),
        }
    }

    /// Publish anonymous torus stage presence for the given BLAKE3 hash.
    /// hash must be >= 8 hex chars (BLAKE3 quintessence hash truncation).
    /// torus_stage: 0-11 (ring position on the M1 torus walk).
    ///
    /// Stub: logs intent without making a network call.
    /// Real implementation: POST {url}/v1/database/epi-logos-presence/call/update_presence
    pub fn publish_presence(&self, hash: &str, torus_stage: u8) -> Result<(), String> {
        if hash.len() < 8 {
            return Err("invalid hash: must be at least 8 hex chars".to_string());
        }
        eprintln!(
            "[SpacetimeDB] would publish: update_presence(hash={}, torus_stage={}) → {}",
            hash, torus_stage, self.url
        );
        Ok(())
    }

    /// Record an I-Ching oracle draw event (hexagram only — no interpretation).
    /// hexagram_id: 0-63.
    ///
    /// Stub: logs intent without making a network call.
    /// Real implementation: POST {url}/v1/database/epi-logos-presence/call/record_oracle_draw
    pub fn record_oracle_draw(&self, hash: &str, hexagram_id: u8) -> Result<(), String> {
        if hash.len() < 8 {
            return Err("invalid hash: must be at least 8 hex chars".to_string());
        }
        if hexagram_id > 63 {
            return Err("hexagram_id must be 0-63".to_string());
        }
        eprintln!(
            "[SpacetimeDB] would publish: record_oracle_draw(hash={}, hexagram_id={}) → {}",
            hash, hexagram_id, self.url
        );
        Ok(())
    }

    /// Record a logos cycle stage completion.
    /// stage: 0-5 (A-Logos / Pro-Logos / Dia-Logos / Logos / Epi-Logos / An-a-Logos).
    /// day_key: "YYYY-MM-DD" format (10 chars).
    ///
    /// Stub: logs intent without making a network call.
    /// Real implementation: POST {url}/v1/database/epi-logos-presence/call/record_logos_stage
    pub fn record_logos_stage(
        &self,
        hash: &str,
        stage: u8,
        day_key: &str,
    ) -> Result<(), String> {
        if hash.len() < 8 {
            return Err("invalid hash: must be at least 8 hex chars".to_string());
        }
        if stage > 5 {
            return Err("stage must be 0-5 (A-Logos through An-a-Logos)".to_string());
        }
        if day_key.len() != 10 {
            return Err("day_key must be YYYY-MM-DD format (10 chars)".to_string());
        }
        eprintln!(
            "[SpacetimeDB] would publish: record_logos_stage(hash={}, stage={}, day_key={}) → {}",
            hash, stage, day_key, self.url
        );
        Ok(())
    }
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
