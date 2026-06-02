use serde::Serialize;
use tauri::{AppHandle, Emitter};

pub fn emit_event<T: Serialize + Clone>(app: &AppHandle, channel: &str, payload: T) {
    if let Err(e) = app.emit(channel, payload) {
        tracing::warn!("Failed to emit event on channel '{}': {}", channel, e);
    }
}

pub mod channels {
    pub const GATEWAY_HELLO: &str = "gateway:hello";
    pub const GATEWAY_DISCONNECTED: &str = "gateway:disconnected";
    pub const CLOCK_STATE: &str = "clock:state";
    pub const CLOCK_ORACLE_CAST: &str = "clock:oracle_cast";
    pub const TEMPORAL_RUNTIME: &str = "temporal:runtime";
    pub const TEMPORAL_KAIROS: &str = "temporal:kairos";
    pub const INBOX_ADDED: &str = "inbox:added";
    pub const INBOX_UPDATED: &str = "inbox:updated";
    pub const VAULT_CHANGED: &str = "vault:changed";
}
