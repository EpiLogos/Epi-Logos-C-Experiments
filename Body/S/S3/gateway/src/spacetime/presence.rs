use crate::spacetime::identity::{require_nonempty, sql_string};
use crate::spacetime::projection::projection_context_from_sql_result;
use crate::spacetime::retry::{
    default_reducer_retry_policy, run_blocking_http, ReducerRetryPolicy,
};

use reqwest::blocking::Client as BlockingClient;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

// 05.T5.17: OracleSpreadPosition — per-position aliveness state
// =============================================================================
//
// The stateless `record_oracle_draw(hash, hexagram_id)` captures a single
// I-Ching cast as a fire-and-forget event. A *spread* (tarot or I-Ching) is
// instead a set of positions whose meaning stays *alive* over time: each
// position generates meaning, then mutes as the moment passes, and can reopen
// when a tracked planetary aspect comes back into proximity. This is the
// foundation for Janus's live-vs-mute tracking (Track 12.18) and the live-
// spreads section of the briefing (Track 05.18).
//
// Like `SessionSurface`/`KairosSurface`, the canonical row shape lives in the
// epi-spacetime-module crate as a `#[table]`; this struct is the S3 host-side
// projection of that row. Spreads are carried into the module's `temporal_event`
// table via `publish_temporal_event` (event kinds `nara.oracle_spread` /
// `nara.oracle_position_state`), exactly as `record_oracle_draw` rides the same
// reducer — no silent dedicated reducer is assumed.

/// Card-kind discriminant for an `OracleSpreadPosition`. Tarot draws split into
/// the three Thoth card classes (major arcana, pip, court); I-Ching draws are a
/// single hexagram kind. The numeric repr is the on-wire value carried to the
/// `record_oracle_spread` event payload.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CardKind {
    TarotMajor,
    TarotPip,
    TarotCourt,
    Hexagram,
}

impl CardKind {
    pub fn as_u8(self) -> u8 {
        match self {
            CardKind::TarotMajor => 0,
            CardKind::TarotPip => 1,
            CardKind::TarotCourt => 2,
            CardKind::Hexagram => 3,
        }
    }

    pub fn from_u8(value: u8) -> Result<Self, String> {
        Ok(match value {
            0 => CardKind::TarotMajor,
            1 => CardKind::TarotPip,
            2 => CardKind::TarotCourt,
            3 => CardKind::Hexagram,
            other => {
                return Err(format!(
                    "card_kind must be 0-3 (tarot-major/pip/court | hexagram), got {other}"
                ))
            }
        })
    }
}

/// Per-position aliveness phase. A position begins `Generating`, transitions to
/// `Muting` as the moment settles, then `Mute` once dormant. A `Mute`/`Muting`
/// position reopens to `Generating` when its target aspect is proximate again.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum LiveState {
    Generating,
    Muting,
    Mute,
}

impl LiveState {
    pub fn as_u8(self) -> u8 {
        match self {
            LiveState::Generating => 0,
            LiveState::Muting => 1,
            LiveState::Mute => 2,
        }
    }

    pub fn from_u8(value: u8) -> Result<Self, String> {
        Ok(match value {
            0 => LiveState::Generating,
            1 => LiveState::Muting,
            2 => LiveState::Mute,
            other => {
                return Err(format!(
                    "live_state must be 0-2 (generating/muting/mute), got {other}"
                ))
            }
        })
    }
}

/// Klein-bottle face of a position: `Prospective` while meaning is still being
/// drawn forward from the draw, `Retrospective` once muted and read back as
/// already-passed. Mirrors the Klein-bottle non-duality of the coordinate
/// space (inside/outside one).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum KleinFace {
    Prospective,
    Retrospective,
}

impl KleinFace {
    pub fn as_u8(self) -> u8 {
        match self {
            KleinFace::Prospective => 0,
            KleinFace::Retrospective => 1,
        }
    }

    pub fn from_u8(value: u8) -> Result<Self, String> {
        Ok(match value {
            0 => KleinFace::Prospective,
            1 => KleinFace::Retrospective,
            other => {
                return Err(format!(
                    "klein_face must be 0-1 (prospective/retrospective), got {other}"
                ))
            }
        })
    }
}

/// Planetary aspect a position is anchored to. When the live moment comes back
/// within proximity of `exact_at`, the position reopens (see
/// [`OracleSpreadPosition::reopen_if_aspect_proximate`]). `planet_b_or_natal` is
/// the second body of a transit↔transit aspect, or the natal-point index of a
/// transit↔natal aspect — interpretation is the caller's (M4 planet model).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TargetAspect {
    pub planet_a: u8,
    pub aspect_kind: u8,
    pub planet_b_or_natal: u8,
    pub exact_at: u64,
}

/// S3 host-side projection of one `oracle_spread_position` row. Models a single
/// alive position within a spread, with its own aliveness state machine.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OracleSpreadPosition {
    pub spread_id: String,
    pub position_idx: u8,
    pub card_id: u16,
    pub card_kind: CardKind,
    pub drawn_at: u64,
    pub drawn_in_session: String,
    pub target_aspect: Option<TargetAspect>,
    pub live_state: LiveState,
    pub last_recognition_at: u64,
    pub recognition_count: u32,
    pub klein_face: KleinFace,
}

impl OracleSpreadPosition {
    /// Construct a freshly-drawn position: `Generating`, `Prospective`, with no
    /// recognitions yet.
    pub fn new(
        spread_id: impl Into<String>,
        position_idx: u8,
        card_id: u16,
        card_kind: CardKind,
        drawn_at: u64,
        drawn_in_session: impl Into<String>,
        target_aspect: Option<TargetAspect>,
    ) -> Self {
        Self {
            spread_id: spread_id.into(),
            position_idx,
            card_id,
            card_kind,
            drawn_at,
            drawn_in_session: drawn_in_session.into(),
            target_aspect,
            live_state: LiveState::Generating,
            last_recognition_at: 0,
            recognition_count: 0,
            klein_face: KleinFace::Prospective,
        }
    }

    /// `Generating` → `Muting`. The moment is settling; the position begins to
    /// fade. Only valid from `Generating`.
    pub fn begin_mute(&mut self) -> Result<(), String> {
        match self.live_state {
            LiveState::Generating => {
                self.live_state = LiveState::Muting;
                Ok(())
            }
            other => Err(format!(
                "begin_mute requires generating; position {} is {:?}",
                self.position_idx, other
            )),
        }
    }

    /// `Muting` → `Mute`. The position goes dormant and flips to the
    /// `Retrospective` Klein face. Only valid from `Muting`.
    pub fn complete_mute(&mut self) -> Result<(), String> {
        match self.live_state {
            LiveState::Muting => {
                self.live_state = LiveState::Mute;
                self.klein_face = KleinFace::Retrospective;
                Ok(())
            }
            other => Err(format!(
                "complete_mute requires muting; position {} is {:?}",
                self.position_idx, other
            )),
        }
    }

    /// Record a recognition event (a re-reading / re-activation of this
    /// position). Bumps the count and stamps `last_recognition_at`.
    pub fn record_recognition(&mut self, at_ms: u64) {
        self.recognition_count = self.recognition_count.saturating_add(1);
        self.last_recognition_at = at_ms;
    }

    /// Reopen a `Muting`/`Mute` position when its `target_aspect` is within
    /// `proximity_window_ms` of `now_ms`. Returns to `Generating` on the
    /// `Prospective` face and records a recognition. Returns `true` if the
    /// position reopened. Already-`Generating` positions and positions without
    /// a target aspect are left untouched (`false`).
    pub fn reopen_if_aspect_proximate(&mut self, now_ms: u64, proximity_window_ms: u64) -> bool {
        if matches!(self.live_state, LiveState::Generating) {
            return false;
        }
        let Some(aspect) = self.target_aspect else {
            return false;
        };
        if now_ms.abs_diff(aspect.exact_at) > proximity_window_ms {
            return false;
        }
        self.live_state = LiveState::Generating;
        self.klein_face = KleinFace::Prospective;
        self.record_recognition(now_ms);
        true
    }
}

// =============================================================================
// SpacetimePresence: HTTP reducer client + projection SQL fallback
// =============================================================================

#[derive(Debug, Clone)]
pub struct SpacetimePresence {
    url: String,
    database: String,
}

impl SpacetimePresence {
    /// Create a new SpacetimePresence client pointing at the given SpacetimeDB URL.
    /// Default local URL: "http://localhost:3000"
    pub fn new(url: &str) -> Self {
        Self::for_database(url, "epi-logos-runtime")
    }

    pub fn for_database(url: &str, database: &str) -> Self {
        Self {
            url: url.trim_end_matches('/').to_owned(),
            database: database.to_owned(),
        }
    }

    pub fn url(&self) -> &str {
        &self.url
    }

    pub fn database(&self) -> &str {
        &self.database
    }

    pub fn register_gateway(
        &self,
        gateway_id: &str,
        installation_id: &str,
        workspace_root_hash: &str,
        endpoint: &str,
        protocol_version: &str,
    ) -> Result<(), String> {
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(workspace_root_hash, "workspace_root_hash")?;
        require_nonempty(endpoint, "endpoint")?;
        self.post_reducer(
            "register_gateway",
            json!([
                gateway_id,
                installation_id,
                workspace_root_hash,
                endpoint,
                protocol_version,
            ]),
        )
    }

    pub fn heartbeat_gateway(&self, gateway_id: &str) -> Result<(), String> {
        require_nonempty(gateway_id, "gateway_id")?;
        self.post_reducer("heartbeat_gateway", json!([gateway_id]))
    }

    pub fn register_agent(
        &self,
        agent_instance_id: &str,
        installation_id: &str,
        gateway_id: &str,
        agent_id: &str,
        agent_kind: &str,
        session_key: &str,
        capability_surface_hash: &str,
    ) -> Result<(), String> {
        require_nonempty(agent_instance_id, "agent_instance_id")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(agent_id, "agent_id")?;
        self.post_reducer(
            "register_agent",
            json!([
                agent_instance_id,
                installation_id,
                gateway_id,
                agent_id,
                agent_kind,
                session_key,
                capability_surface_hash,
            ]),
        )
    }

    pub fn register_client(
        &self,
        client_id: &str,
        installation_id: &str,
        gateway_id: &str,
        client_kind: &str,
        scopes: &[&str],
    ) -> Result<(), String> {
        require_nonempty(client_id, "client_id")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(client_kind, "client_kind")?;
        self.post_reducer(
            "register_client",
            json!([
                client_id,
                installation_id,
                gateway_id,
                client_kind,
                scopes.join(","),
            ]),
        )
    }

    pub fn bind_session_temporal_context(
        &self,
        session_key: &str,
        installation_id: &str,
        gateway_id: &str,
        agent_instance_id: &str,
        day_id: &str,
        now_path: &str,
        now_wikilink: &str,
        history_archive_path: &str,
        redis_session_now_key: &str,
        redis_day_context_key: &str,
        graphiti_arc_id: &str,
        pratibimba_anchor_ref: &str,
        kairos_snapshot_id: &str,
        parent_session_key: &str,
        source_session_key: &str,
        source_session_kind: &str,
        runtime_cwd: &str,
        vault_root: &str,
        resource_loader_id: &str,
        retry_settlement_state: &str,
        diagnostics_json: &str,
        kernel_projection_json: &str,
    ) -> Result<(), String> {
        require_nonempty(session_key, "session_key")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(day_id, "day_id")?;
        self.post_reducer(
            "bind_session_temporal_context",
            json!([
                session_key,
                installation_id,
                gateway_id,
                agent_instance_id,
                day_id,
                now_path,
                now_wikilink,
                history_archive_path,
                redis_session_now_key,
                redis_day_context_key,
                graphiti_arc_id,
                pratibimba_anchor_ref,
                kairos_snapshot_id,
                parent_session_key,
                source_session_key,
                source_session_kind,
                runtime_cwd,
                vault_root,
                resource_loader_id,
                retry_settlement_state,
                diagnostics_json,
                kernel_projection_json,
            ]),
        )
    }

    pub fn bind_kairos_surface(
        &self,
        kairos_snapshot_id: &str,
        installation_id: &str,
        gateway_id: &str,
        day_id: &str,
        session_key: &str,
        available: bool,
        fresh: bool,
        dominant_sign: u8,
        dominant_element: u8,
        active_decan: u8,
        active_tattva: u8,
        planets: Value,
        source: &str,
    ) -> Result<(), String> {
        require_nonempty(kairos_snapshot_id, "kairos_snapshot_id")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(day_id, "day_id")?;
        self.post_reducer(
            "bind_kairos_surface",
            json!([
                kairos_snapshot_id,
                installation_id,
                gateway_id,
                day_id,
                session_key,
                available,
                fresh,
                dominant_sign,
                dominant_element,
                active_decan,
                active_tattva,
                planets.to_string(),
                source,
            ]),
        )
    }

    pub fn bind_global_temporal_surface(
        &self,
        surface_key: &str,
        installation_id: &str,
        gateway_id: &str,
        agent_instance_id: &str,
        session_key: &str,
        day_id: &str,
        day_wikilink: &str,
        now_path: &str,
        now_wikilink: &str,
        now_lineage_key: &str,
        history_archive_path: &str,
        redis_session_now_key: &str,
        redis_day_context_key: &str,
        redis_global_context_key: &str,
        graphiti_namespace_ref: &str,
        graphiti_session_arc_id: &str,
        pratibimba_anchor_ref: &str,
        kairos_snapshot_id: &str,
        kernel_projection_json: &str,
    ) -> Result<(), String> {
        require_nonempty(surface_key, "surface_key")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(session_key, "session_key")?;
        require_nonempty(day_id, "day_id")?;
        self.post_reducer(
            "bind_global_temporal_surface",
            json!([
                surface_key,
                installation_id,
                gateway_id,
                agent_instance_id,
                session_key,
                day_id,
                day_wikilink,
                now_path,
                now_wikilink,
                now_lineage_key,
                history_archive_path,
                redis_session_now_key,
                redis_day_context_key,
                redis_global_context_key,
                graphiti_namespace_ref,
                graphiti_session_arc_id,
                pratibimba_anchor_ref,
                kairos_snapshot_id,
                kernel_projection_json,
            ]),
        )
    }

    pub fn publish_temporal_event(
        &self,
        installation_id: &str,
        gateway_id: &str,
        agent_instance_id: &str,
        session_key: &str,
        event_kind: &str,
        payload: Value,
    ) -> Result<(), String> {
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(event_kind, "event_kind")?;
        self.post_reducer(
            "publish_temporal_event",
            json!([
                installation_id,
                gateway_id,
                agent_instance_id,
                session_key,
                event_kind,
                payload.to_string(),
            ]),
        )
    }

    // =================== 03.T4 shared-cosmos reducer calls ===================

    /// Advance the authoritative shared world_clock. Inherits idempotent retry
    /// from `post_reducer`.
    pub fn advance_world_clock(
        &self,
        gateway_id: &str,
        tick: u64,
        source_now_ms: u64,
        dominant_aspect: u8,
        clock_kind: &str,
        kerykeion_state_hash: &str,
    ) -> Result<(), String> {
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(clock_kind, "clock_kind")?;
        self.post_reducer(
            "advance_world_clock",
            json!([
                gateway_id,
                tick,
                source_now_ms,
                dominant_aspect,
                clock_kind,
                kerykeion_state_hash,
            ]),
        )
    }

    pub fn bind_pratibimba_presence(
        &self,
        identity_handle: &str,
        installation_id: &str,
        gateway_id: &str,
        session_key: &str,
        day_id: &str,
        quintessence_hash: &str,
        aspect_grid_cell: u32,
        present: bool,
    ) -> Result<(), String> {
        require_nonempty(identity_handle, "identity_handle")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(day_id, "day_id")?;
        require_nonempty(quintessence_hash, "quintessence_hash")?;
        self.post_reducer(
            "bind_pratibimba_presence",
            json!([
                identity_handle,
                installation_id,
                gateway_id,
                session_key,
                day_id,
                quintessence_hash,
                aspect_grid_cell,
                present,
            ]),
        )
    }

    pub fn publish_shared_archetype_event(
        &self,
        installation_id: &str,
        gateway_id: &str,
        publisher_identity_handle: &str,
        day_id: &str,
        aspect_grid_cell: u32,
        event_kind: &str,
        payload: Value,
        opt_in_consent: bool,
    ) -> Result<(), String> {
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(publisher_identity_handle, "publisher_identity_handle")?;
        require_nonempty(day_id, "day_id")?;
        require_nonempty(event_kind, "event_kind")?;
        if !opt_in_consent {
            return Err("publish_shared_archetype_event requires opt_in_consent = true".to_owned());
        }
        self.post_reducer(
            "publish_shared_archetype_event",
            json!([
                installation_id,
                gateway_id,
                publisher_identity_handle,
                day_id,
                aspect_grid_cell,
                event_kind,
                payload.to_string(),
                opt_in_consent,
            ]),
        )
    }

    pub fn detect_coincidences(
        &self,
        day_id: &str,
        aspect_grid_cell: u32,
        min_participants: u32,
    ) -> Result<(), String> {
        require_nonempty(day_id, "day_id")?;
        if min_participants < 2 {
            return Err("detect_coincidences min_participants must be >= 2".to_owned());
        }
        self.post_reducer(
            "detect_coincidences",
            json!([day_id, aspect_grid_cell, min_participants]),
        )
    }

    pub fn publish_module_version(&self, gateway_id: &str) -> Result<(), String> {
        require_nonempty(gateway_id, "gateway_id")?;
        self.post_reducer("publish_module_version", json!([gateway_id]))
    }

    /// 12.T12.19: persist one Aletheia facet veto so subsequent runs see
    /// recurring gaps. Args mirror the module's `publish_aletheia_veto`
    /// reducer in exact positional order; the required identity fields are
    /// refused empty host-side exactly as the reducer's assert_nonempty set.
    #[allow(clippy::too_many_arguments)]
    pub fn publish_aletheia_veto(
        &self,
        veto_id: &str,
        installation_id: &str,
        gateway_id: &str,
        session_key: &str,
        dispatch_id: &str,
        facet: &str,
        reason: &str,
        what_is_missed: &str,
        klein_weighting_prospective: f32,
        disposition: &str,
    ) -> Result<(), String> {
        require_nonempty(veto_id, "veto_id")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(session_key, "session_key")?;
        require_nonempty(facet, "facet")?;
        self.post_reducer(
            "publish_aletheia_veto",
            json!([
                veto_id,
                installation_id,
                gateway_id,
                session_key,
                dispatch_id,
                facet,
                reason,
                what_is_missed,
                klein_weighting_prospective,
                disposition,
            ]),
        )
    }

    pub fn publish_presence(&self, hash: &str, tick12: u8) -> Result<(), String> {
        require_nonempty(hash, "hash")?;
        self.publish_temporal_event(
            "local",
            "nara",
            "",
            hash,
            "nara.presence",
            json!({ "hash": hash, "tick12": tick12 }),
        )
    }

    pub fn record_oracle_draw(&self, hash: &str, hexagram_id: u8) -> Result<(), String> {
        require_nonempty(hash, "hash")?;
        if hexagram_id > 63 {
            return Err("hexagram_id must be 0-63".to_string());
        }
        self.publish_temporal_event(
            "local",
            "nara",
            "",
            hash,
            "nara.oracle_draw",
            json!({ "hash": hash, "hexagram_id": hexagram_id }),
        )
    }

    /// 05.T5.17: record a full oracle spread — every position with its initial
    /// aliveness state and (optional) target aspect. Carried into the module's
    /// `temporal_event` table via `publish_temporal_event`, keyed by
    /// `spread_id`, exactly as `record_oracle_draw` rides the same reducer. The
    /// `positions` slice is serialized verbatim; every position must belong to
    /// `spread_id`. This is the foundation for Janus's live-vs-mute tracking.
    pub fn record_oracle_spread(
        &self,
        spread_id: &str,
        positions: &[OracleSpreadPosition],
    ) -> Result<(), String> {
        require_nonempty(spread_id, "spread_id")?;
        if positions.is_empty() {
            return Err("record_oracle_spread requires at least one position".to_string());
        }
        for position in positions {
            if position.spread_id != spread_id {
                return Err(format!(
                    "position {} carries spread_id {:?} but spread is {:?}",
                    position.position_idx, position.spread_id, spread_id
                ));
            }
        }
        self.publish_temporal_event(
            "local",
            "nara",
            "",
            spread_id,
            "nara.oracle_spread",
            json!({ "spread_id": spread_id, "positions": positions }),
        )
    }

    /// 05.T5.17: transition a single position's aliveness state (e.g. as Janus
    /// mutes a settled position or reopens one on aspect proximity). Carried as
    /// a `nara.oracle_position_state` event keyed by `spread_id`.
    pub fn update_position_state(
        &self,
        spread_id: &str,
        position_idx: u8,
        new_state: LiveState,
    ) -> Result<(), String> {
        require_nonempty(spread_id, "spread_id")?;
        self.publish_temporal_event(
            "local",
            "nara",
            "",
            spread_id,
            "nara.oracle_position_state",
            json!({
                "spread_id": spread_id,
                "position_idx": position_idx,
                "live_state": new_state.as_u8(),
            }),
        )
    }

    pub fn record_logos_stage(&self, hash: &str, stage: u8, day_key: &str) -> Result<(), String> {
        require_nonempty(hash, "hash")?;
        if stage > 5 {
            return Err("stage must be 0-5 (A-Logos through An-a-Logos)".to_string());
        }
        if day_key.len() != 10 {
            return Err("day_key must be YYYY-MM-DD format (10 chars)".to_string());
        }
        self.publish_temporal_event(
            "local",
            "nara",
            "",
            hash,
            "nara.logos_stage",
            json!({ "hash": hash, "stage": stage, "day_key": day_key }),
        )
    }

    pub fn projection_temporal_context(
        &self,
        session_key: &str,
        agent_id: &str,
    ) -> Result<Option<Value>, String> {
        require_nonempty(session_key, "session_key")?;
        require_nonempty(agent_id, "agent_id")?;
        let escaped_session = sql_string(session_key);
        let query = format!(
            "SELECT * FROM session_surface WHERE session_key = {escaped_session} LIMIT 1;\
             SELECT * FROM kairos_surface WHERE session_key = {escaped_session} LIMIT 1;\
             SELECT * FROM global_temporal_surface WHERE session_key = {escaped_session} LIMIT 1"
        );
        let result = self.sql(&query)?;
        projection_context_from_sql_result(&result, agent_id)
    }

    pub fn sql(&self, query: &str) -> Result<Value, String> {
        require_nonempty(query, "query")?;
        let url = format!("{}/v1/database/{}/sql", self.url, self.database);
        let query = query.to_owned();
        let response = run_blocking_http(move || {
            BlockingClient::new()
                .post(&url)
                .body(query)
                .send()
                .map_err(|err| format!("spacetimedb sql request failed: {err}"))
        })?;

        if response.status().is_success() {
            return response
                .json::<Value>()
                .map_err(|err| format!("spacetimedb sql response was not JSON: {err}"));
        }

        let status = response.status();
        let body = response
            .text()
            .unwrap_or_else(|_| "<unreadable body>".to_owned());
        Err(format!("spacetimedb sql request failed: {status} {body}"))
    }

    fn post_reducer(&self, reducer: &str, payload: Value) -> Result<(), String> {
        self.post_reducer_with_retry(reducer, payload, default_reducer_retry_policy())
    }

    /// 03.T3 deliverable: reducer post with bounded idempotent retry. All
    /// reducers in the epi-spacetime-module are pure inserts/upserts keyed by
    /// subject-identity (gateway_id, session_key, kairos_snapshot_id, …) so
    /// they are safe to replay.
    pub fn post_reducer_with_retry(
        &self,
        reducer: &str,
        payload: Value,
        policy: ReducerRetryPolicy,
    ) -> Result<(), String> {
        let url = format!(
            "{}/v1/database/{}/call/{}",
            self.url, self.database, reducer
        );
        let mut attempts: u32 = 0;
        let mut last_error: String = String::new();
        loop {
            attempts += 1;
            let reducer_name = reducer.to_owned();
            let url_attempt = url.clone();
            let payload_attempt = payload.clone();
            let response = run_blocking_http(move || {
                BlockingClient::new()
                    .post(&url_attempt)
                    .json(&payload_attempt)
                    .send()
                    .map_err(|err| format!("spacetimedb {reducer_name} request failed: {err}"))
            });
            match response {
                Ok(response) => {
                    let status = response.status();
                    if status.is_success() {
                        return Ok(());
                    }
                    let body = response
                        .text()
                        .unwrap_or_else(|_| "<unreadable body>".to_owned());
                    last_error = format!("spacetimedb {reducer} request failed: {status} {body}");
                    // 4xx (other than 408/429) is not retryable — these are
                    // contract violations the caller must fix.
                    let retryable = status.is_server_error()
                        || status.as_u16() == 408
                        || status.as_u16() == 429;
                    if !retryable {
                        return Err(last_error);
                    }
                }
                Err(err) => {
                    last_error = err;
                }
            }
            if attempts >= policy.max_attempts {
                return Err(format!(
                    "{last_error} (gave up after {attempts} attempt(s))",
                ));
            }
            std::thread::sleep(policy.backoff(attempts));
        }
    }
}
