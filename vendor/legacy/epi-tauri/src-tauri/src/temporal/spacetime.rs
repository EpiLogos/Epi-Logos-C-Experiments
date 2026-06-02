use std::sync::Arc;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

use crate::error::AppError;
use crate::state::SpacetimeMode;

use super::PortalRuntimeState;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ClockPresenceRow {
    pub session_hash: [u8; 32],
    pub pratibimba_coord: String,
    pub visibility: String,
    pub composed_quaternion: [f32; 4],
    pub current_degree: u16,
    pub tick12: u8,
    pub walk_mode: u8,
    pub orbital_position: [f32; 3],
    pub fibre_phase: f32,
    pub last_cast_timestamp: Option<u64>,
    pub label: Option<String>,
    pub updated_at: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LocalPresence {
    pub composed_quaternion: [f32; 4],
    pub current_degree: u16,
    pub tick12: u8,
    pub walk_mode: u8,
    pub orbital_position: [f32; 3],
    pub fibre_phase: f32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct KairosSnapshot {
    pub snapshot_at: u64,
    pub planet_degrees: [u16; 10],
    pub hour_planet: u8,
    pub current_hour: u8,
}

pub struct SpacetimeHandle {
    mode: SpacetimeMode,
    shutdown: Option<tokio::sync::oneshot::Sender<()>>,
}

impl SpacetimeHandle {
    pub fn new(mode: SpacetimeMode) -> Self {
        Self {
            mode,
            shutdown: None,
        }
    }

    pub async fn start(
        &mut self,
        url: String,
        runtime: Arc<RwLock<PortalRuntimeState>>,
        app: tauri::AppHandle,
    ) -> Result<(), AppError> {
        match &self.mode {
            SpacetimeMode::Disabled => Ok(()),
            SpacetimeMode::Polling { interval_ms } => {
                let interval = Duration::from_millis(*interval_ms);
                let (tx, mut rx) = tokio::sync::oneshot::channel();
                self.shutdown = Some(tx);

                let url = url.clone();
                tokio::spawn(async move {
                    let client = reqwest::Client::new();
                    let mut ticker = tokio::time::interval(interval);
                    loop {
                        tokio::select! {
                            _ = ticker.tick() => {
                                if let Err(e) = poll_once(&client, &url, &runtime, &app).await {
                                    tracing::warn!("spacetime poll: {e}");
                                }
                            }
                            _ = &mut rx => break,
                        }
                    }
                });
                Ok(())
            }
            SpacetimeMode::NativeWebSocket => {
                tracing::info!("SpaceTimeDB native WebSocket mode — stub, falling back to polling");
                Ok(())
            }
        }
    }

    pub async fn stop(&mut self) {
        if let Some(tx) = self.shutdown.take() {
            let _ = tx.send(());
        }
    }
}

async fn poll_once(
    client: &reqwest::Client,
    url: &str,
    runtime: &Arc<RwLock<PortalRuntimeState>>,
    app: &tauri::AppHandle,
) -> Result<(), AppError> {
    let sql_url = format!("{}/sql", url.trim_end_matches('/'));
    let resp = client
        .post(&sql_url)
        .body("SELECT * FROM session_surface LIMIT 1")
        .send()
        .await
        .map_err(|e| AppError::Temporal(format!("poll: {e}")))?;

    if resp.status().is_success() {
        let body = resp
            .text()
            .await
            .map_err(|e| AppError::Temporal(format!("poll read: {e}")))?;
        if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&body) {
            let mut rt = runtime.write().await;
            if let Some(day) = parsed.get("day_id").and_then(|v| v.as_str()) {
                rt.day_id = day.to_string();
            }
            if let Some(path) = parsed.get("now_path").and_then(|v| v.as_str()) {
                rt.now_path = path.to_string();
            }
            crate::events::emit_event(app, crate::events::channels::TEMPORAL_RUNTIME, &*rt);
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn disabled_handle_is_noop() {
        let handle = SpacetimeHandle::new(SpacetimeMode::Disabled);
        assert!(handle.shutdown.is_none());
    }

    #[test]
    fn local_presence_serializes() {
        let p = LocalPresence {
            composed_quaternion: [1.0, 0.0, 0.0, 0.0],
            current_degree: 90,
            tick12: 3,
            walk_mode: 1,
            orbital_position: [0.5, 0.5, 0.0],
            fibre_phase: 0.25,
        };
        let json = serde_json::to_string(&p).unwrap();
        assert!(json.contains("composed_quaternion"));
    }
}
