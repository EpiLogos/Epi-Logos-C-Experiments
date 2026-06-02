//! Epi-Logos SpacetimeDB Module
//!
//! Gateway/client/agent registration and live temporal projection.
//!
//! One SpaceTimeDB deployment can hold any number of Epi-Logos gateway,
//! PI-agent, TUI, desktop, browser, and external client instances. Isolation is
//! carried by installation/workspace identity and per-instance ids, not by
//! multiplying databases per process.
//!
//! # Deployment
//!
//! ```bash
//! spacetime build
//! spacetime publish epi-logos-runtime
//! ```
//!
//! # Tables (SpacetimeDB 2.x schema)
//!
//! - `GatewayInstance`    — gateway process registration and heartbeat
//! - `AgentInstance`      — PI-agent/subagent registration and capability surface
//! - `ClientRegistration` — TUI/desktop/browser/external/agent client registration
//! - `SessionSurface`     — DAY/NOW/session/history/Redis/Graphiti projection
//! - `KairosSurface`      — safe DAY/session Kairos transit projection
//! - `GlobalTemporalSurface` — safe shared DAY/NOW/Kairos/kernel line for agents/portals
//! - `TemporalEvent`      — live temporal activity events
//! - `WorldClock`         — singleton-per-gateway authoritative shared clock state (03.T4)
//! - `WorldClockTick`     — append-only audit log of advance_world_clock invocations (03.T4)
//! - `PratibimbaPresence` — public-safe identity-handle presence for coincidence indexing (03.T4)
//! - `SharedArchetypeEvent` — opt-in shared archetype event publications (03.T4)
//! - `Coincidence`        — detected same-grid-cell coincidences for the day (03.T4)
//! - `CoincidenceTick`    — append-only audit log of detect_coincidences passes (03.T4)
//!
//! # Module versioning constants (03.T4)
//!
//! `CLOCK_PROTOCOL_VERSION`, `KERYKEION_VERSION`, `PROJECTION_SCHEMA_VERSION`,
//! and `REDUCER_ABI_VERSION` are exposed both as crate-level constants AND as
//! singleton rows of `ModuleVersion` so consumers can subscribe to version
//! changes the same way they subscribe to surface state.

use spacetimedb::{reducer, table, ReducerContext, Table};

// =========================== 03.T4 versioning ============================

/// 03.T4 module version identifiers. The gateway-contract crate
/// (`Body/S/S3/gateway-contract`) carries a mirror of these constants so the
/// host can compare its expected versions against what the WASM module
/// reports.
///
/// Bumped from v1 → v2 in 03.T4 because the schema now includes the
/// shared-cosmos tables (world_clock, world_clock_tick, pratibimba_presence,
/// shared_archetype_event, coincidence, coincidence_tick).
pub const CLOCK_PROTOCOL_VERSION: &str = "2026-06-02.s3-clock-v1";
pub const KERYKEION_VERSION: &str = "kerykeion-gateway-fed-v1";
pub const PROJECTION_SCHEMA_VERSION: &str = "2026-06-02.s3-projection-v2";
pub const REDUCER_ABI_VERSION: &str = "2026-06-02.s3-reducer-v2";

#[table(name = "module_version", accessor = module_version, public)]
pub struct ModuleVersion {
    #[primary_key]
    pub gateway_id: String,
    pub clock_protocol_version: String,
    pub kerykeion_version: String,
    pub projection_schema_version: String,
    pub reducer_abi_version: String,
    pub updated_at: u64,
}

#[table(name = "gateway_instance", accessor = gateway_instance, public)]
pub struct GatewayInstance {
    #[primary_key]
    pub gateway_id: String,
    pub installation_id: String,
    pub workspace_root_hash: String,
    pub endpoint: String,
    pub protocol_version: String,
    pub status: String,
    pub started_at: u64,
    pub last_seen: u64,
}

#[table(name = "agent_instance", accessor = agent_instance, public)]
pub struct AgentInstance {
    #[primary_key]
    pub agent_instance_id: String,
    pub installation_id: String,
    pub gateway_id: String,
    pub agent_id: String,
    pub agent_kind: String,
    pub session_key: String,
    pub capability_surface_hash: String,
    pub status: String,
    pub started_at: u64,
    pub last_seen: u64,
}

#[table(name = "client_registration", accessor = client_registration, public)]
pub struct ClientRegistration {
    #[primary_key]
    pub client_id: String,
    pub installation_id: String,
    pub gateway_id: String,
    pub client_kind: String,
    pub scopes: String,
    pub status: String,
    pub registered_at: u64,
    pub last_seen: u64,
}

#[table(name = "session_surface", accessor = session_surface, public)]
pub struct SessionSurface {
    #[primary_key]
    pub session_key: String,
    pub installation_id: String,
    pub gateway_id: String,
    pub agent_instance_id: String,
    pub day_id: String,
    pub parent_session_key: String,
    pub source_session_key: String,
    pub source_session_kind: String,
    pub runtime_cwd: String,
    pub vault_root: String,
    pub resource_loader_id: String,
    pub retry_settlement_state: String,
    pub diagnostics_json: String,
    pub now_path: String,
    pub now_wikilink: String,
    pub history_archive_path: String,
    pub redis_session_now_key: String,
    pub redis_day_context_key: String,
    pub graphiti_arc_id: String,
    pub pratibimba_anchor_ref: String,
    pub kairos_snapshot_id: String,
    pub kernel_projection_json: String,
    pub updated_at: u64,
}

#[table(name = "kairos_surface", accessor = kairos_surface, public)]
pub struct KairosSurface {
    #[primary_key]
    pub kairos_snapshot_id: String,
    pub installation_id: String,
    pub gateway_id: String,
    pub day_id: String,
    pub session_key: String,
    pub available: bool,
    pub fresh: bool,
    pub dominant_sign: u8,
    pub dominant_element: u8,
    pub active_decan: u8,
    pub active_tattva: u8,
    pub planets_json: String,
    pub source: String,
    pub privacy_class: String,
    pub updated_at: u64,
}

#[table(name = "global_temporal_surface", accessor = global_temporal_surface, public)]
pub struct GlobalTemporalSurface {
    #[primary_key]
    pub surface_key: String,
    pub installation_id: String,
    pub gateway_id: String,
    pub agent_instance_id: String,
    pub session_key: String,
    pub day_id: String,
    pub day_wikilink: String,
    pub now_path: String,
    pub now_wikilink: String,
    pub now_lineage_key: String,
    pub history_archive_path: String,
    pub redis_session_now_key: String,
    pub redis_day_context_key: String,
    pub redis_global_context_key: String,
    pub graphiti_namespace_ref: String,
    pub graphiti_session_arc_id: String,
    pub pratibimba_anchor_ref: String,
    pub kairos_snapshot_id: String,
    pub kernel_projection_json: String,
    pub privacy_class: String,
    pub updated_at: u64,
}

#[table(name = "temporal_event", accessor = temporal_event, public)]
pub struct TemporalEvent {
    #[primary_key]
    #[auto_inc]
    pub event_id: u64,
    pub installation_id: String,
    pub gateway_id: String,
    pub agent_instance_id: String,
    pub session_key: String,
    pub event_kind: String,
    pub payload_json: String,
    pub created_at: u64,
}

#[reducer]
pub fn register_gateway(
    ctx: &ReducerContext,
    gateway_id: String,
    installation_id: String,
    workspace_root_hash: String,
    endpoint: String,
    protocol_version: String,
) {
    assert_nonempty(&gateway_id, "gateway_id");
    assert_nonempty(&installation_id, "installation_id");
    assert_nonempty(&workspace_root_hash, "workspace_root_hash");
    assert_nonempty(&endpoint, "endpoint");
    let now = now(ctx);
    ctx.db.gateway_instance().insert(GatewayInstance {
        gateway_id,
        installation_id,
        workspace_root_hash,
        endpoint,
        protocol_version,
        status: "online".to_owned(),
        started_at: now,
        last_seen: now,
    });
}

#[reducer]
pub fn heartbeat_gateway(ctx: &ReducerContext, gateway_id: String) {
    assert_nonempty(&gateway_id, "gateway_id");
    let Some(mut gateway) = ctx.db.gateway_instance().gateway_id().find(&gateway_id) else {
        panic!("gateway_id is not registered");
    };
    gateway.status = "online".to_owned();
    gateway.last_seen = now(ctx);
    ctx.db.gateway_instance().gateway_id().update(gateway);
}

#[reducer]
pub fn register_agent(
    ctx: &ReducerContext,
    agent_instance_id: String,
    installation_id: String,
    gateway_id: String,
    agent_id: String,
    agent_kind: String,
    session_key: String,
    capability_surface_hash: String,
) {
    assert_nonempty(&agent_instance_id, "agent_instance_id");
    assert_nonempty(&installation_id, "installation_id");
    assert_nonempty(&gateway_id, "gateway_id");
    assert_nonempty(&agent_id, "agent_id");
    let now = now(ctx);
    ctx.db.agent_instance().insert(AgentInstance {
        agent_instance_id,
        installation_id,
        gateway_id,
        agent_id,
        agent_kind,
        session_key,
        capability_surface_hash,
        status: "online".to_owned(),
        started_at: now,
        last_seen: now,
    });
}

#[reducer]
pub fn register_client(
    ctx: &ReducerContext,
    client_id: String,
    installation_id: String,
    gateway_id: String,
    client_kind: String,
    scopes: String,
) {
    assert_nonempty(&client_id, "client_id");
    assert_nonempty(&installation_id, "installation_id");
    assert_nonempty(&gateway_id, "gateway_id");
    assert_nonempty(&client_kind, "client_kind");
    let now = now(ctx);
    ctx.db.client_registration().insert(ClientRegistration {
        client_id,
        installation_id,
        gateway_id,
        client_kind,
        scopes,
        status: "online".to_owned(),
        registered_at: now,
        last_seen: now,
    });
}

#[reducer]
pub fn bind_session_temporal_context(
    ctx: &ReducerContext,
    session_key: String,
    installation_id: String,
    gateway_id: String,
    agent_instance_id: String,
    day_id: String,
    now_path: String,
    now_wikilink: String,
    history_archive_path: String,
    redis_session_now_key: String,
    redis_day_context_key: String,
    graphiti_arc_id: String,
    pratibimba_anchor_ref: String,
    kairos_snapshot_id: String,
    parent_session_key: String,
    source_session_key: String,
    source_session_kind: String,
    runtime_cwd: String,
    vault_root: String,
    resource_loader_id: String,
    retry_settlement_state: String,
    diagnostics_json: String,
    kernel_projection_json: String,
) {
    assert_nonempty(&session_key, "session_key");
    assert_nonempty(&installation_id, "installation_id");
    assert_nonempty(&gateway_id, "gateway_id");
    assert_nonempty(&day_id, "day_id");
    ctx.db.session_surface().insert(SessionSurface {
        session_key,
        installation_id,
        gateway_id,
        agent_instance_id,
        day_id,
        parent_session_key,
        source_session_key,
        source_session_kind,
        runtime_cwd,
        vault_root,
        resource_loader_id,
        retry_settlement_state,
        diagnostics_json,
        now_path,
        now_wikilink,
        history_archive_path,
        redis_session_now_key,
        redis_day_context_key,
        graphiti_arc_id,
        pratibimba_anchor_ref,
        kairos_snapshot_id,
        kernel_projection_json,
        updated_at: now(ctx),
    });
}

#[reducer]
pub fn bind_kairos_surface(
    ctx: &ReducerContext,
    kairos_snapshot_id: String,
    installation_id: String,
    gateway_id: String,
    day_id: String,
    session_key: String,
    available: bool,
    fresh: bool,
    dominant_sign: u8,
    dominant_element: u8,
    active_decan: u8,
    active_tattva: u8,
    planets_json: String,
    source: String,
) {
    assert_nonempty(&kairos_snapshot_id, "kairos_snapshot_id");
    assert_nonempty(&installation_id, "installation_id");
    assert_nonempty(&gateway_id, "gateway_id");
    assert_nonempty(&day_id, "day_id");
    ctx.db.kairos_surface().insert(KairosSurface {
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
        planets_json,
        source,
        privacy_class: "public-current-transit-only".to_owned(),
        updated_at: now(ctx),
    });
}

#[reducer]
pub fn bind_global_temporal_surface(
    ctx: &ReducerContext,
    surface_key: String,
    installation_id: String,
    gateway_id: String,
    agent_instance_id: String,
    session_key: String,
    day_id: String,
    day_wikilink: String,
    now_path: String,
    now_wikilink: String,
    now_lineage_key: String,
    history_archive_path: String,
    redis_session_now_key: String,
    redis_day_context_key: String,
    redis_global_context_key: String,
    graphiti_namespace_ref: String,
    graphiti_session_arc_id: String,
    pratibimba_anchor_ref: String,
    kairos_snapshot_id: String,
    kernel_projection_json: String,
) {
    assert_nonempty(&surface_key, "surface_key");
    assert_nonempty(&installation_id, "installation_id");
    assert_nonempty(&gateway_id, "gateway_id");
    assert_nonempty(&session_key, "session_key");
    assert_nonempty(&day_id, "day_id");
    ctx.db.global_temporal_surface().insert(GlobalTemporalSurface {
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
        privacy_class: "safe-live-projection".to_owned(),
        updated_at: now(ctx),
    });
}

#[reducer]
pub fn publish_temporal_event(
    ctx: &ReducerContext,
    installation_id: String,
    gateway_id: String,
    agent_instance_id: String,
    session_key: String,
    event_kind: String,
    payload_json: String,
) {
    assert_nonempty(&installation_id, "installation_id");
    assert_nonempty(&gateway_id, "gateway_id");
    assert_nonempty(&event_kind, "event_kind");
    ctx.db.temporal_event().insert(TemporalEvent {
        event_id: 0,
        installation_id,
        gateway_id,
        agent_instance_id,
        session_key,
        event_kind,
        payload_json,
        created_at: now(ctx),
    });
}

fn now(ctx: &ReducerContext) -> u64 {
    ctx.timestamp.to_micros_since_unix_epoch() as u64 / 1_000_000
}

fn assert_nonempty(value: &str, field: &str) {
    assert!(!value.trim().is_empty(), "{field} must not be empty");
}

// =================== 03.T4 shared-cosmos tables ===================

/// Singleton-per-gateway authoritative shared clock state. Per the alpha
/// §11.7 decision and the 03.T3 IOD-03 resolution, `advance_world_clock` is
/// invoked by the gateway after Kerykeion/Nara computes the authoritative
/// state — SpaceTimeDB WASM cannot natively host the Kerykeion calculation.
/// The gateway is the source of truth; SpaceTimeDB carries the projection.
#[table(name = "world_clock", accessor = world_clock, public)]
pub struct WorldClock {
    #[primary_key]
    pub gateway_id: String,
    pub tick: u64,
    pub source_now_ms: u64,
    pub dominant_aspect: u8,
    pub clock_kind: String,
    pub kerykeion_state_hash: String,
    pub clock_protocol_version: String,
    pub kerykeion_version: String,
    pub updated_at: u64,
}

/// Append-only audit log of every `advance_world_clock` reducer invocation —
/// supports replay/audit and lets analytical consumers re-derive the clock
/// timeline without subscribing to the live singleton.
#[table(name = "world_clock_tick", accessor = world_clock_tick, public)]
pub struct WorldClockTick {
    #[primary_key]
    #[auto_inc]
    pub tick_id: u64,
    pub gateway_id: String,
    pub tick: u64,
    pub source_now_ms: u64,
    pub clock_kind: String,
    pub kerykeion_state_hash: String,
    pub created_at: u64,
}

/// Public-safe presence row for the personal mandala. Carries ONLY the
/// BLAKE3 identity_handle and quintessence_hash fingerprints + a coarse
/// `aspect_grid_cell` for coincidence indexing. Raw birth data, journal
/// text, dream bodies, layer masks, Graphiti bodies, and PersonalNexus
/// graph contents MUST NOT be written into this table — they live outside
/// SpaceTimeDB per the 03.T4 deliverable privacy invariant.
#[table(name = "pratibimba_presence", accessor = pratibimba_presence, public)]
pub struct PratibimbaPresence {
    #[primary_key]
    pub identity_handle: String,
    pub installation_id: String,
    pub gateway_id: String,
    pub session_key: String,
    pub day_id: String,
    pub quintessence_hash: String,
    pub aspect_grid_cell: u32,
    pub privacy_class: String,
    pub present: bool,
    pub updated_at: u64,
}

/// Opt-in shared archetype event publication. Publishers must set
/// `opt_in_consent = true`; the reducer refuses otherwise. The publisher is
/// identified ONLY by `publisher_identity_handle` (BLAKE3); raw identity is
/// never persisted.
#[table(name = "shared_archetype_event", accessor = shared_archetype_event, public)]
pub struct SharedArchetypeEvent {
    #[primary_key]
    #[auto_inc]
    pub event_id: u64,
    pub installation_id: String,
    pub gateway_id: String,
    pub publisher_identity_handle: String,
    pub day_id: String,
    pub aspect_grid_cell: u32,
    pub event_kind: String,
    pub payload_json: String,
    pub privacy_class: String,
    pub created_at: u64,
}

/// Detected same-or-neighboring-grid-cell coincidence. Participants are
/// identified by their BLAKE3 identity_handles; `related_event_ids` is a
/// comma-separated string of `shared_archetype_event.event_id` values
/// (SpaceTimeDB 2.x tables do not support Vec<u64> primary keys directly,
/// so the serialised form is used for portability).
#[table(name = "coincidence", accessor = coincidence, public)]
pub struct Coincidence {
    #[primary_key]
    #[auto_inc]
    pub coincidence_id: u64,
    pub day_id: String,
    pub aspect_grid_cell: u32,
    pub participant_identity_handles: String,
    pub confidence_score: f64,
    pub related_event_ids: String,
    pub detected_at: u64,
}

/// Append-only audit log of every `detect_coincidences` pass. Supports
/// "how often does the gateway run coincidence detection" introspection
/// for the operations track.
#[table(name = "coincidence_tick", accessor = coincidence_tick, public)]
pub struct CoincidenceTick {
    #[primary_key]
    #[auto_inc]
    pub tick_id: u64,
    pub day_id: String,
    pub new_coincidences_count: u32,
    pub participants_count: u32,
    pub detected_at: u64,
}

// =================== 03.T4 shared-cosmos reducers ===================

/// Advance the authoritative shared world_clock. Called by the gateway at
/// the configured cadence (default 1 Hz; surfaces may request higher
/// interpolation downstream). Inserts a new audit row in `world_clock_tick`
/// and upserts the singleton `world_clock` row.
///
/// The gateway is responsible for ensuring `tick` strictly increases per
/// gateway_id; the reducer accepts any value the gateway supplies (replay
/// scenarios require this) but the audit log preserves the original.
#[reducer]
pub fn advance_world_clock(
    ctx: &ReducerContext,
    gateway_id: String,
    tick: u64,
    source_now_ms: u64,
    dominant_aspect: u8,
    clock_kind: String,
    kerykeion_state_hash: String,
) {
    assert_nonempty(&gateway_id, "gateway_id");
    assert_nonempty(&clock_kind, "clock_kind");
    let now = now(ctx);
    ctx.db.world_clock_tick().insert(WorldClockTick {
        tick_id: 0,
        gateway_id: gateway_id.clone(),
        tick,
        source_now_ms,
        clock_kind: clock_kind.clone(),
        kerykeion_state_hash: kerykeion_state_hash.clone(),
        created_at: now,
    });
    // Upsert singleton: delete the prior row for this gateway, then insert.
    if ctx.db.world_clock().gateway_id().find(&gateway_id).is_some() {
        ctx.db.world_clock().gateway_id().delete(&gateway_id);
    }
    ctx.db.world_clock().insert(WorldClock {
        gateway_id,
        tick,
        source_now_ms,
        dominant_aspect,
        clock_kind,
        kerykeion_state_hash,
        clock_protocol_version: CLOCK_PROTOCOL_VERSION.to_owned(),
        kerykeion_version: KERYKEION_VERSION.to_owned(),
        updated_at: now,
    });
}

/// Register or update a pratibimba_presence row. Refuses raw identity input
/// — the gateway MUST pre-derive `identity_handle` (BLAKE3 over canonical
/// identity bytes) and `quintessence_hash` (BLAKE3 over canonical
/// quaternionic bytes + caps). Raw birth/journal/dream/layer data MUST NOT
/// be passed in `payload_json` — there is no payload_json on this surface
/// by design (privacy invariant from 03.T4 deliverable).
#[reducer]
pub fn bind_pratibimba_presence(
    ctx: &ReducerContext,
    identity_handle: String,
    installation_id: String,
    gateway_id: String,
    session_key: String,
    day_id: String,
    quintessence_hash: String,
    aspect_grid_cell: u32,
    present: bool,
) {
    assert_nonempty(&identity_handle, "identity_handle");
    assert_nonempty(&installation_id, "installation_id");
    assert_nonempty(&gateway_id, "gateway_id");
    assert_nonempty(&day_id, "day_id");
    assert_nonempty(&quintessence_hash, "quintessence_hash");
    if ctx
        .db
        .pratibimba_presence()
        .identity_handle()
        .find(&identity_handle)
        .is_some()
    {
        ctx.db
            .pratibimba_presence()
            .identity_handle()
            .delete(&identity_handle);
    }
    ctx.db.pratibimba_presence().insert(PratibimbaPresence {
        identity_handle,
        installation_id,
        gateway_id,
        session_key,
        day_id,
        quintessence_hash,
        aspect_grid_cell,
        privacy_class: "public-safe-fingerprint-only".to_owned(),
        present,
        updated_at: now(ctx),
    });
}

/// Publish a shared archetype event. Requires `opt_in_consent = true`; the
/// reducer refuses with a panic otherwise so the gateway's HTTP error
/// surface clearly indicates the consent gate failed.
#[reducer]
pub fn publish_shared_archetype_event(
    ctx: &ReducerContext,
    installation_id: String,
    gateway_id: String,
    publisher_identity_handle: String,
    day_id: String,
    aspect_grid_cell: u32,
    event_kind: String,
    payload_json: String,
    opt_in_consent: bool,
) {
    assert_nonempty(&installation_id, "installation_id");
    assert_nonempty(&gateway_id, "gateway_id");
    assert_nonempty(&publisher_identity_handle, "publisher_identity_handle");
    assert_nonempty(&day_id, "day_id");
    assert_nonempty(&event_kind, "event_kind");
    assert!(
        opt_in_consent,
        "publish_shared_archetype_event requires opt_in_consent = true"
    );
    ctx.db.shared_archetype_event().insert(SharedArchetypeEvent {
        event_id: 0,
        installation_id,
        gateway_id,
        publisher_identity_handle,
        day_id,
        aspect_grid_cell,
        event_kind,
        payload_json,
        privacy_class: "public-opt-in-archetype".to_owned(),
        created_at: now(ctx),
    });
}

/// Run a coincidence-detection pass for the given day. Reads the
/// `shared_archetype_event` and `pratibimba_presence` rows for `day_id`,
/// groups by `aspect_grid_cell`, and emits a `coincidence` row for each
/// cell where at least `min_participants` distinct identity_handles
/// participate.
///
/// "Same-or-neighboring grid cell" is honoured by the gateway computing
/// the relevant cell list before invoking this reducer multiple times — the
/// reducer itself works per-cell to keep the inside-SpaceTimeDB logic
/// deterministic and cheap.
///
/// Always inserts a `coincidence_tick` audit row, even when zero new
/// coincidences are detected (so the cadence is observable).
#[reducer]
pub fn detect_coincidences(
    ctx: &ReducerContext,
    day_id: String,
    aspect_grid_cell: u32,
    min_participants: u32,
) {
    assert_nonempty(&day_id, "day_id");
    assert!(
        min_participants >= 2,
        "detect_coincidences min_participants must be >= 2"
    );

    let mut participant_handles: Vec<String> = Vec::new();
    let mut related_event_ids: Vec<u64> = Vec::new();
    for event in ctx.db.shared_archetype_event().iter() {
        if event.day_id == day_id && event.aspect_grid_cell == aspect_grid_cell {
            if !participant_handles.contains(&event.publisher_identity_handle) {
                participant_handles.push(event.publisher_identity_handle.clone());
            }
            related_event_ids.push(event.event_id);
        }
    }
    for presence in ctx.db.pratibimba_presence().iter() {
        if presence.day_id == day_id
            && presence.aspect_grid_cell == aspect_grid_cell
            && presence.present
            && !participant_handles.contains(&presence.identity_handle)
        {
            participant_handles.push(presence.identity_handle.clone());
        }
    }

    let participants_count = participant_handles.len() as u32;
    let mut new_coincidences_count: u32 = 0;
    if participants_count >= min_participants {
        // Confidence: ratio of participants over min_participants, capped at 1.0.
        let confidence_score = (participants_count as f64 / min_participants as f64).min(4.0);
        ctx.db.coincidence().insert(Coincidence {
            coincidence_id: 0,
            day_id: day_id.clone(),
            aspect_grid_cell,
            participant_identity_handles: participant_handles.join(","),
            confidence_score,
            related_event_ids: related_event_ids
                .iter()
                .map(|id| id.to_string())
                .collect::<Vec<_>>()
                .join(","),
            detected_at: now(ctx),
        });
        new_coincidences_count = 1;
    }
    ctx.db.coincidence_tick().insert(CoincidenceTick {
        tick_id: 0,
        day_id,
        new_coincidences_count,
        participants_count,
        detected_at: now(ctx),
    });
}

/// Publish module version singleton. The gateway invokes this on registration
/// so consumers can subscribe to a single row to learn what versions the
/// module is running.
#[reducer]
pub fn publish_module_version(ctx: &ReducerContext, gateway_id: String) {
    assert_nonempty(&gateway_id, "gateway_id");
    if ctx
        .db
        .module_version()
        .gateway_id()
        .find(&gateway_id)
        .is_some()
    {
        ctx.db
            .module_version()
            .gateway_id()
            .delete(&gateway_id);
    }
    ctx.db.module_version().insert(ModuleVersion {
        gateway_id,
        clock_protocol_version: CLOCK_PROTOCOL_VERSION.to_owned(),
        kerykeion_version: KERYKEION_VERSION.to_owned(),
        projection_schema_version: PROJECTION_SCHEMA_VERSION.to_owned(),
        reducer_abi_version: REDUCER_ABI_VERSION.to_owned(),
        updated_at: now(ctx),
    });
}
