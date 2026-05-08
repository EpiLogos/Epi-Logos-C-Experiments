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
//! - `GlobalTemporalSurface` — safe shared DAY/NOW/Kairos line for agents/portals
//! - `TemporalEvent`      — live temporal activity events

use spacetimedb::{reducer, table, ReducerContext, Table};

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
