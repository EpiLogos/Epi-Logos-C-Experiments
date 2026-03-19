//! Epi-Logos SpacetimeDB Module
//!
//! Privacy-preserving presence tracking. ALL data is keyed by BLAKE3 hash only.
//! NO personal data (no birth dates, no natal chart raw degrees, no MBTI strings,
//! no I-Ching interpretations — only the public hexagram number 0-63).
//!
//! # Deployment
//!
//! ```bash
//! spacetime build
//! spacetime publish epi-logos-presence
//! ```
//!
//! # Tables (SpacetimeDB 2.x schema)
//!
//! - `UserPresence`  — hash + torus stage (anonymous identity)
//! - `OracleDraw`    — hash + hexagram cast event (0-63)
//! - `LogosPhase`    — hash + logos cycle stage (0-5)
//! - `TorusSync`     — hash + current torus position + spanda

use spacetimedb::{reducer, table, ReducerContext, Table};

// ─── UserPresence ─────────────────────────────────────────────────────────
//
// Tracks anonymous user presence by BLAKE3 quintessence hash.
// hash = BLAKE3(layer_presence || present_layer_bytes) truncated to 16 hex chars.
// Privacy invariant: no identity, no coordinates — only the hash.

#[table(name = "user_presence", accessor = user_presence, public)]
pub struct UserPresence {
    #[primary_key]
    pub hash: String,
    pub torus_stage: u8,
    pub last_seen: u64, // Unix seconds
}

// ─── OracleDraw ────────────────────────────────────────────────────────────
//
// Records oracle cast events by hash.
// hexagram_id is the public I-Ching hexagram result (0-63).
// No personal reading content stored — only the drawn hexagram number.

#[table(name = "oracle_draw", accessor = oracle_draw, public)]
pub struct OracleDraw {
    #[primary_key]
    #[auto_inc]
    pub id: u64,
    pub hash: String,
    pub hexagram_id: u8,
    pub timestamp: u64, // Unix seconds
}

// ─── LogosPhase ────────────────────────────────────────────────────────────
//
// Records logos cycle stage presence. day_key = "YYYY-MM-DD" string.
// Stage 0-5 maps to: A-Logos, Pro-Logos, Dia-Logos, Logos, Epi-Logos, An-a-Logos.

#[table(name = "logos_phase", accessor = logos_phase, public)]
pub struct LogosPhase {
    #[primary_key]
    #[auto_inc]
    pub id: u64,
    pub hash: String,
    pub stage: u8,
    pub day_key: String, // "YYYY-MM-DD"
}

// ─── TorusSync ─────────────────────────────────────────────────────────────
//
// Tracks torus position for real-time synchronization.
// position = 0-11 (ring position on torus), spanda = 0-5 (M0-M5 stage).

#[table(name = "torus_sync", accessor = torus_sync, public)]
pub struct TorusSync {
    #[primary_key]
    pub hash: String,
    pub position: u8,
    pub spanda: u8,
}

// ─── Reducers ─────────────────────────────────────────────────────────────

/// Update or insert a user's torus stage presence.
/// Called on session start and at each Spanda stage transition.
/// Privacy: hash must be a BLAKE3 truncation (>= 8 hex chars). No raw identity.
#[reducer]
pub fn update_presence(ctx: &ReducerContext, hash: String, torus_stage: u8) {
    assert!(hash.len() >= 8, "invalid hash: must be at least 8 hex chars");
    let now = ctx.timestamp.to_micros_since_unix_epoch() as u64 / 1_000_000;
    ctx.db.user_presence().insert(UserPresence {
        hash: hash.clone(),
        torus_stage,
        last_seen: now,
    });
    ctx.db.torus_sync().insert(TorusSync {
        hash,
        position: torus_stage % 12,
        spanda: torus_stage % 6,
    });
}

/// Record an oracle cast event (hexagram only — no interpretation stored).
/// hexagram_id must be 0-63 (I-Ching has 64 hexagrams, indexed 0-based).
#[reducer]
pub fn record_oracle_draw(ctx: &ReducerContext, hash: String, hexagram_id: u8) {
    assert!(hash.len() >= 8, "invalid hash: must be at least 8 hex chars");
    assert!(hexagram_id <= 63, "hexagram_id must be 0-63");
    let now = ctx.timestamp.to_micros_since_unix_epoch() as u64 / 1_000_000;
    ctx.db.oracle_draw().insert(OracleDraw {
        id: 0,
        hash,
        hexagram_id,
        timestamp: now,
    });
}

/// Record a logos cycle stage completion for the given day.
/// stage 0-5: A-Logos / Pro-Logos / Dia-Logos / Logos / Epi-Logos / An-a-Logos.
/// day_key must be "YYYY-MM-DD" (10 chars).
#[reducer]
pub fn record_logos_stage(ctx: &ReducerContext, hash: String, stage: u8, day_key: String) {
    assert!(hash.len() >= 8, "invalid hash: must be at least 8 hex chars");
    assert!(stage <= 5, "stage must be 0-5 (A-Logos through An-a-Logos)");
    assert_eq!(day_key.len(), 10, "day_key must be YYYY-MM-DD format (10 chars)");
    ctx.db.logos_phase().insert(LogosPhase {
        id: 0,
        hash,
        stage,
        day_key,
    });
}
