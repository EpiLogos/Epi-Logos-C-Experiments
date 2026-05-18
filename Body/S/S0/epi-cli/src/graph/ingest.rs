//! `epi graph ingest` — open and progress a typed ingestion session.
//!
//! Sessions live as JSON files under `<store>/ingestion-sessions/`
//! (default `${EPILOGOS_INGEST_HOME:-~/.epi-logos/ingestion}`). Each
//! command in the ingestion arc (`ingest` → `analyse-resonance` →
//! `persist-analysis` → `verify-trajectory`) reads and rewrites the
//! file, so the matheme-cycle is preserved across CLI invocations.

use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use epi_kernel_contract::{IngestionSession, IngestionStatus, KernelTickEnvelope};
use portal_core::KernelProjection;

pub const ENV_INGEST_HOME: &str = "EPILOGOS_INGEST_HOME";

pub fn ingest_home() -> PathBuf {
    if let Ok(path) = std::env::var(ENV_INGEST_HOME) {
        return PathBuf::from(path);
    }
    let mut home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    home.push(".epi-logos");
    home.push("ingestion");
    home
}

pub fn ensure_store(home: &Path) -> Result<(), String> {
    fs::create_dir_all(home).map_err(|e| format!("create ingest store {}: {e}", home.display()))
}

pub fn session_path(home: &Path, session_id: &str) -> PathBuf {
    let mut p = home.to_path_buf();
    p.push(format!("{session_id}.json"));
    p
}

pub fn save(session: &IngestionSession, home: &Path) -> Result<PathBuf, String> {
    ensure_store(home)?;
    let path = session_path(home, &session.session_id);
    let json =
        serde_json::to_string_pretty(session).map_err(|e| format!("serialize session: {e}"))?;
    fs::write(&path, json).map_err(|e| format!("write {}: {e}", path.display()))?;
    Ok(path)
}

pub fn load(session_id: &str, home: &Path) -> Result<IngestionSession, String> {
    let path = session_path(home, session_id);
    let raw = fs::read_to_string(&path).map_err(|e| format!("read {}: {e}", path.display()))?;
    serde_json::from_str(&raw).map_err(|e| format!("parse session {}: {e}", path.display()))
}

/// Open a new ingestion session for a document at a coordinate and
/// persist it. Returns the session's `session_id` for follow-up
/// commands plus the path it was saved to.
pub fn open_session(
    document_id: &str,
    coordinate: &str,
    session_key: &str,
    home: &Path,
) -> Result<(IngestionSession, PathBuf), String> {
    let started_at_ms = now_ms();
    let mut session = IngestionSession::new(document_id, coordinate, session_key, started_at_ms)
        .map_err(str::to_owned)?;
    let projection = KernelProjection::from_clock_state(
        0,
        0,
        [1.0, 0.0, 0.0, 0.0],
        [1.0, 0.0, 0.0, 0.0],
        None,
        None,
        0.0,
    );
    let envelope = KernelTickEnvelope::from_kernel_projection(0, &projection)
        .with_session_key(session_key)
        .with_source_coordinate(coordinate);
    // Opening corresponds to KernelElement::BimbaEncoding (sub_tick 0)
    // — IngestionStatus::Opened. But we constructed the session in the
    // Opened state already; record the envelope as the visible bimba
    // encoding without advancing past it.
    session.envelopes.push(envelope);
    let path = save(&session, home)?;
    Ok((session, path))
}

/// Advance an existing session by recording a new envelope and status.
pub fn record_step(
    session_id: &str,
    next_status: IngestionStatus,
    envelope: KernelTickEnvelope,
    home: &Path,
) -> Result<IngestionSession, String> {
    let mut session = load(session_id, home)?;
    session
        .record_envelope(next_status, envelope)
        .map_err(str::to_owned)?;
    save(&session, home)?;
    Ok(session)
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(1)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};

    static COUNTER: AtomicUsize = AtomicUsize::new(0);

    fn tmp_home() -> PathBuf {
        let id = COUNTER.fetch_add(1, Ordering::SeqCst);
        let mut p = std::env::temp_dir();
        p.push(format!("epi-cli-ingest-test-{}-{}", std::process::id(), id));
        let _ = fs::remove_dir_all(&p);
        p
    }

    #[test]
    fn open_save_load_round_trip() {
        let home = tmp_home();
        let (session, path) = open_session("doc", "M2-1-3", "session-1", &home).unwrap();
        assert!(path.exists());
        let loaded = load(&session.session_id, &home).unwrap();
        assert_eq!(loaded.document_id, "doc");
        assert_eq!(loaded.coordinate, "M2-1-3");
        assert_eq!(loaded.session_key, "session-1");
        assert_eq!(loaded.status, IngestionStatus::Opened);
        assert_eq!(loaded.envelopes.len(), 1);
    }

    #[test]
    fn record_step_advances_status_and_persists() {
        let home = tmp_home();
        let (session, _) = open_session("doc", "M2-1-3", "session-1", &home).unwrap();
        let projection = KernelProjection::from_clock_state(
            0,
            1,
            [1.0, 0.0, 0.0, 0.0],
            [0.5, 0.5, 0.5, 0.5],
            None,
            None,
            0.0,
        );
        let envelope = KernelTickEnvelope::from_kernel_projection(1, &projection);
        let updated = record_step(
            &session.session_id,
            IngestionStatus::PrehensiveAnalysis,
            envelope,
            &home,
        )
        .unwrap();
        assert_eq!(updated.status, IngestionStatus::PrehensiveAnalysis);
        assert_eq!(updated.envelopes.len(), 2);

        // Reload from disk to confirm persistence.
        let reloaded = load(&session.session_id, &home).unwrap();
        assert_eq!(reloaded.status, IngestionStatus::PrehensiveAnalysis);
    }

    #[test]
    fn record_step_rejects_invalid_advance() {
        let home = tmp_home();
        let (session, _) = open_session("doc", "M2-1-3", "session-1", &home).unwrap();
        // Try to advance with a sub_tick that does not match
        // PrehensiveAnalysis (which requires sub_tick 1).
        let projection = KernelProjection::from_clock_state(
            0,
            5,
            [1.0, 0.0, 0.0, 0.0],
            [0.5, 0.5, 0.5, 0.5],
            None,
            None,
            0.0,
        );
        let envelope = KernelTickEnvelope::from_kernel_projection(1, &projection);
        assert!(record_step(
            &session.session_id,
            IngestionStatus::PrehensiveAnalysis,
            envelope,
            &home
        )
        .is_err());
    }
}
