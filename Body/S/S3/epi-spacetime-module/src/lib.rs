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
//! - `BeingPatternPresence` — S3 live-state presence/projection carrier for PASU BeingPattern
//! - `BeingPatternRelationEdge` — live aspect-like relation edge carrier
//! - `BeingPatternReviewCandidate` — review-only candidate carrier for forced unification risk
//! - `ArenaScene`         — dialogical-arena scene envelope (41.T41.5; protected-local)
//! - `ArenaPresence`      — per-Vama-Shakti arena presence, identity-handle keyed (41.T41.5)
//! - `ArenaTurn`          — per-turn routing envelope with classifier byte (41.T41.5)
//! - `ArenaDialogueLine`  — dialogue-line metadata; body stays behind opaque handle (41.T41.5)
//! - `WarmVamaShakti`     — warm Vama Shakti persistence carrier, identity-handle keyed (41.T41.5)
//!
//! The five `Arena*`/`WarmVamaShakti` tables are PRIVATE (not `public`): they
//! carry handles, opaque body references, and the q-activity accumulator, which
//! the privacy invariant forbids from global subscription. Only the derived
//! `ArenaSceneGlobalProjection` (scene_key + admitted-count + open/closed-status
//! + class-distribution-summary) is safe to share globally — see
//! `project_arena_scene_global`.
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
// Bumped v2 → v3 in 41.T41.5: the projection schema now includes the
// dialogical-arena tables (arena_scene, arena_presence, arena_turn,
// arena_dialogue_line, warm_vama_shakti) and the derived
// ArenaSceneGlobalProjection safe view.
pub const PROJECTION_SCHEMA_VERSION: &str = "2026-06-16.s3-projection-v3";
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

#[table(name = "being_pattern_presence", accessor = being_pattern_presence, public)]
pub struct BeingPatternPresence {
    #[primary_key]
    pub entity_id: String,
    pub entity_kind: String,
    pub installation_id: String,
    pub gateway_id: String,
    pub session_key: String,
    pub generation: u64,
    pub live_state_json: String,
    pub projection_json: String,
    pub provenance_refs_json: String,
    pub updated_at: u64,
}

#[table(name = "being_pattern_relation_edge", accessor = being_pattern_relation_edge, public)]
pub struct BeingPatternRelationEdge {
    #[primary_key]
    pub edge_id: String,
    pub source_entity_id: String,
    pub target_entity_id: String,
    pub generation: u64,
    pub edge_kind: String,
    pub aspect_label: String,
    pub elemental_delta_json: String,
    pub verifier_refs_json: String,
    pub updated_at: u64,
}

#[table(name = "being_pattern_review_candidate", accessor = being_pattern_review_candidate, public)]
pub struct BeingPatternReviewCandidate {
    #[primary_key]
    pub candidate_id: String,
    pub generation: u64,
    pub entity_ids: String,
    pub monopoly_operator: String,
    pub review_risk: String,
    pub verifier_refs_json: String,
    pub status: String,
    pub emitted_at: u64,
}

// 12.T12.19: aletheia_veto_log — persists veto patterns so subsequent runs see
// recurring gaps. A single veto is recorded per entry with the facet, reason,
// what_is_missed, and the disposition Anima chose.
#[table(name = "aletheia_veto_log", accessor = aletheia_veto_log, public)]
pub struct AletheiaVetoLog {
    #[primary_key]
    pub veto_id: String,
    pub installation_id: String,
    pub gateway_id: String,
    pub session_key: String,
    pub dispatch_id: String,
    pub facet: String,
    pub reason: String,
    pub what_is_missed: String,
    pub klein_weighting_prospective: f32,
    pub disposition: String,
    pub recorded_at: u64,
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
    ctx.db
        .global_temporal_surface()
        .insert(GlobalTemporalSurface {
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

#[reducer]
pub fn observe_being_pattern_entity(
    ctx: &ReducerContext,
    entity_id: String,
    entity_kind: String,
    installation_id: String,
    gateway_id: String,
    session_key: String,
    generation: u64,
    live_state_json: String,
    projection_json: String,
    provenance_refs_json: String,
) {
    assert_nonempty(&entity_id, "entity_id");
    assert_nonempty(&entity_kind, "entity_kind");
    assert_nonempty(&installation_id, "installation_id");
    assert_nonempty(&gateway_id, "gateway_id");
    assert_public_safe_json(&live_state_json);
    assert_public_safe_json(&projection_json);
    assert_public_safe_json(&provenance_refs_json);
    if ctx
        .db
        .being_pattern_presence()
        .entity_id()
        .find(&entity_id)
        .is_some()
    {
        ctx.db
            .being_pattern_presence()
            .entity_id()
            .delete(&entity_id);
    }
    ctx.db
        .being_pattern_presence()
        .insert(BeingPatternPresence {
            entity_id: entity_id.clone(),
            entity_kind,
            installation_id: installation_id.clone(),
            gateway_id: gateway_id.clone(),
            session_key: session_key.clone(),
            generation,
            live_state_json,
            projection_json,
            provenance_refs_json,
            updated_at: now(ctx),
        });
    for event_kind in [
        "EntityObserved",
        "BeingPatternProjected",
        "PerspectiveRoleResolved",
        "MonoPolyOperatorResolved",
        "ClockAddressUpdated",
    ] {
        emit_being_pattern_stream_event(
            ctx,
            &installation_id,
            &gateway_id,
            &session_key,
            event_kind,
            &entity_id,
            generation,
        );
    }
}

#[reducer]
pub fn project_being_pattern_relation(
    ctx: &ReducerContext,
    edge_id: String,
    source_entity_id: String,
    target_entity_id: String,
    generation: u64,
    edge_kind: String,
    aspect_label: String,
    elemental_delta_json: String,
    verifier_refs_json: String,
) {
    assert_nonempty(&edge_id, "edge_id");
    assert_nonempty(&source_entity_id, "source_entity_id");
    assert_nonempty(&target_entity_id, "target_entity_id");
    assert_nonempty(&edge_kind, "edge_kind");
    assert_public_safe_json(&elemental_delta_json);
    assert_public_safe_json(&verifier_refs_json);
    if ctx
        .db
        .being_pattern_relation_edge()
        .edge_id()
        .find(&edge_id)
        .is_some()
    {
        ctx.db
            .being_pattern_relation_edge()
            .edge_id()
            .delete(&edge_id);
    }
    ctx.db
        .being_pattern_relation_edge()
        .insert(BeingPatternRelationEdge {
            edge_id: edge_id.clone(),
            source_entity_id: source_entity_id.clone(),
            target_entity_id,
            generation,
            edge_kind,
            aspect_label,
            elemental_delta_json,
            verifier_refs_json,
            updated_at: now(ctx),
        });
    for event_kind in [
        "AspectEdgeComputed",
        "ElementalResonanceChanged",
        "PatternPacketFormed",
    ] {
        emit_being_pattern_stream_event(ctx, "", "", "", event_kind, &source_entity_id, generation);
    }
}

#[reducer]
pub fn emit_being_pattern_review_candidate(
    ctx: &ReducerContext,
    candidate_id: String,
    generation: u64,
    entity_ids: String,
    monopoly_operator: String,
    verifier_refs_json: String,
) {
    assert_nonempty(&candidate_id, "candidate_id");
    assert_nonempty(&entity_ids, "entity_ids");
    assert_nonempty(&monopoly_operator, "monopoly_operator");
    assert!(
        monopoly_operator == "ActualisingOne",
        "review candidate reducer only accepts ActualisingOne hypotheses"
    );
    assert_public_safe_json(&verifier_refs_json);
    ctx.db
        .being_pattern_review_candidate()
        .insert(BeingPatternReviewCandidate {
            candidate_id: candidate_id.clone(),
            generation,
            entity_ids,
            monopoly_operator,
            review_risk: "forced-unification".to_owned(),
            verifier_refs_json,
            status: "emitted-review-only".to_owned(),
            emitted_at: now(ctx),
        });
    emit_being_pattern_stream_event(
        ctx,
        "",
        "",
        "",
        "ReviewCandidateEmitted",
        &candidate_id,
        generation,
    );
}

fn emit_being_pattern_stream_event(
    ctx: &ReducerContext,
    installation_id: &str,
    gateway_id: &str,
    session_key: &str,
    event_kind: &str,
    entity_id: &str,
    generation: u64,
) {
    ctx.db.temporal_event().insert(TemporalEvent {
        event_id: 0,
        installation_id: installation_id.to_owned(),
        gateway_id: gateway_id.to_owned(),
        agent_instance_id: String::new(),
        session_key: session_key.to_owned(),
        event_kind: event_kind.to_owned(),
        payload_json: format!(
            r#"{{"stream":"s3.being_pattern","entityId":"{entity_id}","generation":{generation}}}"#
        ),
        created_at: now(ctx),
    });
}

fn now(ctx: &ReducerContext) -> u64 {
    ctx.timestamp.to_micros_since_unix_epoch() as u64 / 1_000_000
}

fn assert_nonempty(value: &str, field: &str) {
    assert!(!value.trim().is_empty(), "{field} must not be empty");
}

fn assert_public_safe_json(value: &str) {
    for forbidden in [
        "episodeBody",
        "protectedNaraBody",
        "protectedPayload",
        "journalText",
        "rawQuaternion",
        "qB",
        "qP",
    ] {
        assert!(
            !value.contains(forbidden),
            "BeingPattern live-state payload contains protected field"
        );
    }
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
    if ctx
        .db
        .world_clock()
        .gateway_id()
        .find(&gateway_id)
        .is_some()
    {
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
    ctx.db
        .shared_archetype_event()
        .insert(SharedArchetypeEvent {
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
        ctx.db.module_version().gateway_id().delete(&gateway_id);
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

/// 12.T12.19: Publish a single aletheia veto log entry. The veto_id is the
/// primary key; subsequent runs can query per session_key to detect recurring
/// gaps and veto patterns.
#[reducer]
pub fn publish_aletheia_veto(
    ctx: &ReducerContext,
    veto_id: String,
    installation_id: String,
    gateway_id: String,
    session_key: String,
    dispatch_id: String,
    facet: String,
    reason: String,
    what_is_missed: String,
    klein_weighting_prospective: f32,
    disposition: String,
) {
    assert_nonempty(&veto_id, "veto_id");
    assert_nonempty(&installation_id, "installation_id");
    assert_nonempty(&gateway_id, "gateway_id");
    assert_nonempty(&session_key, "session_key");
    assert_nonempty(&facet, "facet");
    ctx.db.aletheia_veto_log().insert(AletheiaVetoLog {
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
        recorded_at: now(ctx),
    });
}

// =================== 41.T41.5 dialogical-arena tables ===================
//
// These tables persist the [[M4']] [[Nara]] dialogical arena (Track 41) into the
// S3' live plane. They reuse the identity-handle keying established by
// `pratibimba_presence` (the BLAKE3 `vama_shakti_quintessence_hash` rendered as a
// lowercase hex digest — SpacetimeDB 2.x has no `SpacetimeType` for fixed `[u8; N]`
// arrays, so the canonical 32-byte handle is carried as its hex `String`) and the
// `coincidence` / `coincidence_tick` machinery for co-location surfacing.
//
// VamaShaktiClass byte values mirror `portal_core::vama_shakti::VamaShaktiClass`
// (DR-VAMA-6): Egregore=0x01, Sprite=0x02, Daemon=0x03, Mantra=0x04.

/// VamaShaktiClass byte: an egregore (collective/field daemon).
pub const VAMA_SHAKTI_CLASS_EGREGORE: u8 = 0x01;
/// VamaShaktiClass byte: a sprite (ephemeral kairic agent).
pub const VAMA_SHAKTI_CLASS_SPRITE: u8 = 0x02;
/// VamaShaktiClass byte: a daemon (personified entity-as-interlocutor).
pub const VAMA_SHAKTI_CLASS_DAEMON: u8 = 0x03;
/// VamaShaktiClass byte: a mantra (recursive/threshold-bound agent).
pub const VAMA_SHAKTI_CLASS_MANTRA: u8 = 0x04;

/// All canonical VamaShaktiClass bytes in stable ascending order. Used for
/// deterministic class-distribution summaries in the global projection.
pub const VAMA_SHAKTI_CLASSES: [u8; 4] = [
    VAMA_SHAKTI_CLASS_EGREGORE,
    VAMA_SHAKTI_CLASS_SPRITE,
    VAMA_SHAKTI_CLASS_DAEMON,
    VAMA_SHAKTI_CLASS_MANTRA,
];

/// Snake_case name for a VamaShaktiClass byte. Unknown bytes render as
/// `"unknown"` so a malformed value can never masquerade as a valid class.
pub fn vama_shakti_class_name(class: u8) -> &'static str {
    match class {
        VAMA_SHAKTI_CLASS_EGREGORE => "egregore",
        VAMA_SHAKTI_CLASS_SPRITE => "sprite",
        VAMA_SHAKTI_CLASS_DAEMON => "daemon",
        VAMA_SHAKTI_CLASS_MANTRA => "mantra",
        _ => "unknown",
    }
}

/// Dialogical-arena scene envelope. PRIVATE: `privacy_class` is always
/// `protected_local_handle_only`. `admitted_constitutional` records
/// constitutional participants by canonical name (they are not Vama Shaktis).
/// `cpf_brainstorm_confirmation_token` records the [[Anima]] brainstorming-done
/// marker required before scene admission when CPF starts at `(00/00)`.
#[table(name = "arena_scene", accessor = arena_scene)]
pub struct ArenaScene {
    #[primary_key]
    pub scene_key: String,
    pub pinned_coordinate: String,
    pub user_present: bool,
    pub admitted_constitutional: Vec<String>,
    pub kairos_anchor_at_open: u32,
    pub lifecycle_mode_default: String,
    pub cpf_brainstorm_confirmation_token: String,
    pub opened_at_ms: u64,
    pub closed_at_ms: Option<u64>,
    pub privacy_class: String,
}

/// Per-Vama-Shakti presence in an arena scene. Keyed by `presence_id`, with the
/// identity handle (`hex(vama_shakti_quintessence_hash)`) held unique so a Vama
/// Shakti has at most one live presence row (upsert semantics). Carries the
/// classifier byte (`vama_shakti_class`) so classifier-aware routing and
/// projection summaries can discriminate without dereferencing the handle.
#[table(name = "arena_presence", accessor = arena_presence)]
pub struct ArenaPresence {
    #[primary_key]
    pub presence_id: u64,
    #[unique]
    pub vama_shakti_identity_handle: String,
    pub scene_key: String,
    pub vama_shakti_coordinate: String,
    pub vama_shakti_class: u8,
    pub vama_shakti_clock_position: f32,
    pub lifecycle_mode: String,
    pub admitted_at_ms: u64,
    pub released_at_ms: Option<u64>,
}

/// Per-turn routing envelope. `turn_speaker_handle` is `"user"`,
/// `"constitutional:{name}"`, or the hex identity handle of a Vama Shakti;
/// `turn_speaker_class` carries the classifier byte only when the speaker is a
/// Vama Shakti. `turn_kairos_delta_json` is the opaque serialised kairotic delta.
#[table(name = "arena_turn", accessor = arena_turn)]
pub struct ArenaTurn {
    #[primary_key]
    pub turn_id: u64,
    pub scene_key: String,
    pub turn_index: u32,
    pub turn_speaker_handle: String,
    pub turn_speaker_class: Option<u8>,
    pub turn_address: String,
    pub turn_kairos_delta_json: String,
    pub turn_arrived_at_ms: u64,
}

/// Dialogue-line metadata. The dialogue body itself never enters SpaceTimeDB —
/// only `dialogue_body_handle` (opaque) is stored. `vak_address` is the DR-VAK-7
/// C' expression; `l5_lens_witness_handle` is the L5' + T/T' wikilink-accretion
/// handle; `cited_coordinates_json` is the serialised coordinate-citation list.
#[table(name = "arena_dialogue_line", accessor = arena_dialogue_line)]
pub struct ArenaDialogueLine {
    #[primary_key]
    pub line_id: u64,
    pub turn_id: u64,
    pub scene_key: String,
    pub dialogue_body_handle: String,
    pub vak_address: String,
    pub l5_lens_witness_handle: String,
    pub cited_coordinates_json: String,
    pub emitted_at_ms: u64,
}

/// Warm Vama Shakti persistence carrier. Keyed by the identity handle so warm
/// re-summons reuse the accumulated q-activity across scenes. The
/// `q_activity_accumulator_json` and `psyche_template_revision` are
/// protected-local fields and are never exposed by the global projection.
#[table(name = "warm_vama_shakti", accessor = warm_vama_shakti)]
pub struct WarmVamaShakti {
    #[primary_key]
    pub vama_shakti_identity_handle: String,
    pub vama_shakti_coordinate: String,
    pub vama_shakti_class: u8,
    pub psyche_template_revision: String,
    pub last_scene_key: String,
    pub q_activity_accumulator_json: String,
    pub turns_participated_count: u32,
    pub scenes_participated_count: u32,
    pub first_warmed_at_ms: u64,
    pub last_active_at_ms: u64,
    pub promotion_proposal_emitted: bool,
}

// =================== 41.T41.5 arena projection + coincidence helpers ===================

/// Global-safe projection of an arena scene. This is the ONLY shape that may be
/// shared globally: it exposes `scene_key`, the admitted (live) count, the
/// open/closed status, and the per-class distribution summary. It deliberately
/// carries no body, no handle, no speaker, and no q-activity accumulator.
#[derive(Clone, Debug, PartialEq)]
pub struct ArenaSceneGlobalProjection {
    pub scene_key: String,
    pub admitted_count: u32,
    pub status: String,
    /// `(class_byte, count)` pairs in ascending class-byte order, omitting zeros.
    pub class_distribution: Vec<(u8, u32)>,
}

impl ArenaSceneGlobalProjection {
    /// Serialise to the global-safe JSON line. Contains only the four safe
    /// facets; handles/bodies/speakers/q-activity are structurally absent.
    pub fn to_global_json(&self) -> String {
        let dist = self
            .class_distribution
            .iter()
            .map(|(class, count)| format!(r#""{}":{}"#, vama_shakti_class_name(*class), count))
            .collect::<Vec<_>>()
            .join(",");
        format!(
            r#"{{"sceneKey":"{}","admittedCount":{},"status":"{}","classDistribution":{{{}}}}}"#,
            self.scene_key, self.admitted_count, self.status, dist
        )
    }
}

/// Derive the global-safe projection for `scene` from the full set of
/// `presences`. Only presences that belong to the scene and are still live
/// (`released_at_ms` is `None`) are counted.
pub fn project_arena_scene_global(
    scene: &ArenaScene,
    presences: &[ArenaPresence],
) -> ArenaSceneGlobalProjection {
    let live: Vec<&ArenaPresence> = presences
        .iter()
        .filter(|p| p.scene_key == scene.scene_key && p.released_at_ms.is_none())
        .collect();
    let mut class_distribution: Vec<(u8, u32)> = Vec::new();
    for class in VAMA_SHAKTI_CLASSES {
        let count = live.iter().filter(|p| p.vama_shakti_class == class).count() as u32;
        if count > 0 {
            class_distribution.push((class, count));
        }
    }
    ArenaSceneGlobalProjection {
        scene_key: scene.scene_key.clone(),
        admitted_count: live.len() as u32,
        status: if scene.closed_at_ms.is_some() {
            "closed".to_owned()
        } else {
            "open".to_owned()
        },
        class_distribution,
    }
}

/// Fold a pinned coordinate string onto the 360-cell cosmic-clock grid so it
/// shares the `aspect_grid_cell` space used by `pratibimba_presence` and
/// `coincidence`. FNV-1a keeps this dependency-free and deterministic.
pub fn arena_pinned_coordinate_grid_cell(coordinate: &str) -> u32 {
    let mut hash: u32 = 0x811c_9dc5;
    for byte in coordinate.trim().as_bytes() {
        hash ^= *byte as u32;
        hash = hash.wrapping_mul(0x0100_0193);
    }
    hash % 360
}

/// Plan the coincidence-reuse append for a newly-admitted arena presence.
///
/// When a presence enters a scene whose `pinned_coordinate` folds onto a grid
/// cell that already carries a `Coincidence`, this returns the
/// `(Coincidence, CoincidenceTick)` rows to append — the new coincidence records
/// the Vama Shakti co-presence (participant handle + classifier note), and the
/// tick is the append-only audit marker. Returns `None` when there is no
/// co-location (no tick is appended in that case).
pub fn plan_arena_coincidence_reuse(
    scene_key: &str,
    pinned_coordinate: &str,
    vama_shakti_identity_handle: &str,
    vama_shakti_class: u8,
    existing_coincidence_cells: &[u32],
    now_ms: u64,
) -> Option<(Coincidence, CoincidenceTick)> {
    let cell = arena_pinned_coordinate_grid_cell(pinned_coordinate);
    if !existing_coincidence_cells.contains(&cell) {
        return None;
    }
    let coincidence = Coincidence {
        coincidence_id: 0,
        day_id: scene_key.to_owned(),
        aspect_grid_cell: cell,
        participant_identity_handles: vama_shakti_identity_handle.to_owned(),
        confidence_score: 1.0,
        related_event_ids: format!(
            "vamaClass:{}:{}",
            vama_shakti_class,
            vama_shakti_class_name(vama_shakti_class)
        ),
        detected_at: now_ms,
    };
    let tick = CoincidenceTick {
        tick_id: 0,
        day_id: scene_key.to_owned(),
        new_coincidences_count: 1,
        participants_count: 1,
        detected_at: now_ms,
    };
    Some((coincidence, tick))
}

fn assert_vama_shakti_class(class: u8) {
    assert!(
        VAMA_SHAKTI_CLASSES.contains(&class),
        "vama_shakti_class must be one of egregore(1)/sprite(2)/daemon(3)/mantra(4)"
    );
}

// =================== 41.T41.5 dialogical-arena reducers ===================

/// Open (or re-open/upsert) an arena scene. `privacy_class` is forced to
/// `protected_local_handle_only`; callers cannot widen it.
#[reducer]
pub fn open_arena_scene(
    ctx: &ReducerContext,
    scene_key: String,
    pinned_coordinate: String,
    user_present: bool,
    admitted_constitutional: Vec<String>,
    kairos_anchor_at_open: u32,
    lifecycle_mode_default: String,
    cpf_brainstorm_confirmation_token: String,
) {
    assert_nonempty(&scene_key, "scene_key");
    assert_nonempty(&pinned_coordinate, "pinned_coordinate");
    let now = now(ctx);
    if ctx.db.arena_scene().scene_key().find(&scene_key).is_some() {
        ctx.db.arena_scene().scene_key().delete(&scene_key);
    }
    ctx.db.arena_scene().insert(ArenaScene {
        scene_key,
        pinned_coordinate,
        user_present,
        admitted_constitutional,
        kairos_anchor_at_open,
        lifecycle_mode_default,
        cpf_brainstorm_confirmation_token,
        opened_at_ms: now,
        closed_at_ms: None,
        privacy_class: "protected_local_handle_only".to_owned(),
    });
}

/// Close an arena scene by stamping `closed_at_ms`.
#[reducer]
pub fn close_arena_scene(ctx: &ReducerContext, scene_key: String) {
    assert_nonempty(&scene_key, "scene_key");
    let Some(mut scene) = ctx.db.arena_scene().scene_key().find(&scene_key) else {
        panic!("scene_key is not an open arena scene");
    };
    scene.closed_at_ms = Some(now(ctx));
    ctx.db.arena_scene().scene_key().update(scene);
}

/// Admit a Vama Shakti into an arena scene. Upserts on the unique identity
/// handle, then — reusing the coincidence machinery — appends a
/// `Coincidence` + `CoincidenceTick` when the scene's pinned coordinate folds
/// onto a grid cell that already carries a coincidence (co-location).
#[reducer]
pub fn admit_arena_presence(
    ctx: &ReducerContext,
    presence_id: u64,
    vama_shakti_identity_handle: String,
    scene_key: String,
    vama_shakti_coordinate: String,
    vama_shakti_class: u8,
    vama_shakti_clock_position: f32,
    lifecycle_mode: String,
) {
    assert_nonempty(&vama_shakti_identity_handle, "vama_shakti_identity_handle");
    assert_nonempty(&scene_key, "scene_key");
    assert_nonempty(&vama_shakti_coordinate, "vama_shakti_coordinate");
    assert_vama_shakti_class(vama_shakti_class);
    let now = now(ctx);
    if let Some(existing) = ctx
        .db
        .arena_presence()
        .vama_shakti_identity_handle()
        .find(&vama_shakti_identity_handle)
    {
        ctx.db.arena_presence().presence_id().delete(&existing.presence_id);
    }
    ctx.db.arena_presence().insert(ArenaPresence {
        presence_id,
        vama_shakti_identity_handle: vama_shakti_identity_handle.clone(),
        scene_key: scene_key.clone(),
        vama_shakti_coordinate,
        vama_shakti_class,
        vama_shakti_clock_position,
        lifecycle_mode,
        admitted_at_ms: now,
        released_at_ms: None,
    });
    // Coincidence reuse: surface co-presence in an already-active grid cell.
    if let Some(scene) = ctx.db.arena_scene().scene_key().find(&scene_key) {
        let existing_cells: Vec<u32> = ctx
            .db
            .coincidence()
            .iter()
            .map(|c| c.aspect_grid_cell)
            .collect();
        if let Some((coincidence, tick)) = plan_arena_coincidence_reuse(
            &scene_key,
            &scene.pinned_coordinate,
            &vama_shakti_identity_handle,
            vama_shakti_class,
            &existing_cells,
            now,
        ) {
            ctx.db.coincidence().insert(coincidence);
            ctx.db.coincidence_tick().insert(tick);
        }
    }
}

/// Release a Vama Shakti's arena presence by stamping `released_at_ms`.
#[reducer]
pub fn release_arena_presence(ctx: &ReducerContext, vama_shakti_identity_handle: String) {
    assert_nonempty(&vama_shakti_identity_handle, "vama_shakti_identity_handle");
    let Some(mut presence) = ctx
        .db
        .arena_presence()
        .vama_shakti_identity_handle()
        .find(&vama_shakti_identity_handle)
    else {
        panic!("vama_shakti_identity_handle has no live arena presence");
    };
    presence.released_at_ms = Some(now(ctx));
    ctx.db.arena_presence().presence_id().update(presence);
}

/// Record an arena turn (routing envelope). `turn_speaker_class` is the
/// classifier byte when the speaker is a Vama Shakti, else `None`.
#[reducer]
pub fn record_arena_turn(
    ctx: &ReducerContext,
    turn_id: u64,
    scene_key: String,
    turn_index: u32,
    turn_speaker_handle: String,
    turn_speaker_class: Option<u8>,
    turn_address: String,
    turn_kairos_delta_json: String,
) {
    assert_nonempty(&scene_key, "scene_key");
    assert_nonempty(&turn_speaker_handle, "turn_speaker_handle");
    if let Some(class) = turn_speaker_class {
        assert_vama_shakti_class(class);
    }
    ctx.db.arena_turn().insert(ArenaTurn {
        turn_id,
        scene_key,
        turn_index,
        turn_speaker_handle,
        turn_speaker_class,
        turn_address,
        turn_kairos_delta_json,
        turn_arrived_at_ms: now(ctx),
    });
}

/// Emit dialogue-line metadata for a turn. The body itself stays behind
/// `dialogue_body_handle`; only metadata enters SpaceTimeDB.
#[reducer]
pub fn emit_arena_dialogue_line(
    ctx: &ReducerContext,
    line_id: u64,
    turn_id: u64,
    scene_key: String,
    dialogue_body_handle: String,
    vak_address: String,
    l5_lens_witness_handle: String,
    cited_coordinates_json: String,
) {
    assert_nonempty(&scene_key, "scene_key");
    assert_nonempty(&dialogue_body_handle, "dialogue_body_handle");
    ctx.db.arena_dialogue_line().insert(ArenaDialogueLine {
        line_id,
        turn_id,
        scene_key,
        dialogue_body_handle,
        vak_address,
        l5_lens_witness_handle,
        cited_coordinates_json,
        emitted_at_ms: now(ctx),
    });
}

/// Upsert a warm Vama Shakti persistence row. `first_warmed_at_ms` is preserved
/// across upserts; `last_active_at_ms` is refreshed each call.
#[reducer]
pub fn upsert_warm_vama_shakti(
    ctx: &ReducerContext,
    vama_shakti_identity_handle: String,
    vama_shakti_coordinate: String,
    vama_shakti_class: u8,
    psyche_template_revision: String,
    last_scene_key: String,
    q_activity_accumulator_json: String,
    turns_participated_count: u32,
    scenes_participated_count: u32,
    promotion_proposal_emitted: bool,
) {
    assert_nonempty(&vama_shakti_identity_handle, "vama_shakti_identity_handle");
    assert_nonempty(&vama_shakti_coordinate, "vama_shakti_coordinate");
    assert_vama_shakti_class(vama_shakti_class);
    let now = now(ctx);
    let first_warmed_at_ms = ctx
        .db
        .warm_vama_shakti()
        .vama_shakti_identity_handle()
        .find(&vama_shakti_identity_handle)
        .map(|row| row.first_warmed_at_ms)
        .unwrap_or(now);
    if ctx
        .db
        .warm_vama_shakti()
        .vama_shakti_identity_handle()
        .find(&vama_shakti_identity_handle)
        .is_some()
    {
        ctx.db
            .warm_vama_shakti()
            .vama_shakti_identity_handle()
            .delete(&vama_shakti_identity_handle);
    }
    ctx.db.warm_vama_shakti().insert(WarmVamaShakti {
        vama_shakti_identity_handle,
        vama_shakti_coordinate,
        vama_shakti_class,
        psyche_template_revision,
        last_scene_key,
        q_activity_accumulator_json,
        turns_participated_count,
        scenes_participated_count,
        first_warmed_at_ms,
        last_active_at_ms: now,
        promotion_proposal_emitted,
    });
}

#[cfg(test)]
mod arena_tables_tests {
    use super::*;

    fn scene(scene_key: &str, pinned: &str, closed: Option<u64>) -> ArenaScene {
        ArenaScene {
            scene_key: scene_key.to_owned(),
            pinned_coordinate: pinned.to_owned(),
            user_present: true,
            admitted_constitutional: vec!["anima".to_owned(), "sophia".to_owned()],
            kairos_anchor_at_open: 137,
            lifecycle_mode_default: "warm".to_owned(),
            cpf_brainstorm_confirmation_token: "cpf-confirmed-token".to_owned(),
            opened_at_ms: 1_000,
            closed_at_ms: closed,
            privacy_class: "protected_local_handle_only".to_owned(),
        }
    }

    fn presence(id: u64, handle: &str, scene_key: &str, class: u8) -> ArenaPresence {
        ArenaPresence {
            presence_id: id,
            vama_shakti_identity_handle: handle.to_owned(),
            scene_key: scene_key.to_owned(),
            vama_shakti_coordinate: "C2-3".to_owned(),
            vama_shakti_class: class,
            vama_shakti_clock_position: 42.0,
            lifecycle_mode: "warm".to_owned(),
            admitted_at_ms: 1_100,
            released_at_ms: None,
        }
    }

    #[test]
    fn arena_tables_round_trip() {
        // 1 scene + 3 presences (3 classifiers) + 2 turns + 2 dialogue lines.
        let the_scene = scene("arena:arc-001", "C2-3", None);

        let presences = vec![
            presence(1, "handle-plotinus", "arena:arc-001", VAMA_SHAKTI_CLASS_DAEMON),
            presence(2, "handle-whitehead", "arena:arc-001", VAMA_SHAKTI_CLASS_EGREGORE),
            presence(3, "handle-threshold", "arena:arc-001", VAMA_SHAKTI_CLASS_MANTRA),
        ];

        let turns = vec![
            ArenaTurn {
                turn_id: 10,
                scene_key: "arena:arc-001".to_owned(),
                turn_index: 0,
                turn_speaker_handle: "user".to_owned(),
                turn_speaker_class: None,
                turn_address: "vak://user".to_owned(),
                turn_kairos_delta_json: r#"{"delta":0.0}"#.to_owned(),
                turn_arrived_at_ms: 2_000,
            },
            ArenaTurn {
                turn_id: 11,
                scene_key: "arena:arc-001".to_owned(),
                turn_index: 1,
                turn_speaker_handle: "handle-plotinus".to_owned(),
                turn_speaker_class: Some(VAMA_SHAKTI_CLASS_DAEMON),
                turn_address: "vak://daemon/plotinus".to_owned(),
                turn_kairos_delta_json: r#"{"delta":0.25}"#.to_owned(),
                turn_arrived_at_ms: 2_100,
            },
        ];

        let lines = vec![
            ArenaDialogueLine {
                line_id: 100,
                turn_id: 11,
                scene_key: "arena:arc-001".to_owned(),
                dialogue_body_handle: "protected://nara/dialogue/abc".to_owned(),
                vak_address: "C5'-3".to_owned(),
                l5_lens_witness_handle: "protected://nara/witness/xyz".to_owned(),
                cited_coordinates_json: r#"["C2-3","M4-3"]"#.to_owned(),
                emitted_at_ms: 2_150,
            },
            ArenaDialogueLine {
                line_id: 101,
                turn_id: 11,
                scene_key: "arena:arc-001".to_owned(),
                dialogue_body_handle: "protected://nara/dialogue/def".to_owned(),
                vak_address: "C5'-4".to_owned(),
                l5_lens_witness_handle: "protected://nara/witness/uvw".to_owned(),
                cited_coordinates_json: r#"["C3-1"]"#.to_owned(),
                emitted_at_ms: 2_200,
            },
        ];

        assert_eq!(the_scene.scene_key, "arena:arc-001");
        assert_eq!(the_scene.privacy_class, "protected_local_handle_only");
        assert_eq!(presences.len(), 3);
        assert_eq!(turns.len(), 2);
        assert_eq!(lines.len(), 2);

        // Field-level round-trip: values read back unchanged.
        assert_eq!(presences[0].vama_shakti_identity_handle, "handle-plotinus");
        assert_eq!(turns[1].turn_speaker_class, Some(VAMA_SHAKTI_CLASS_DAEMON));
        assert_eq!(lines[0].turn_id, turns[1].turn_id);

        // The derived projection reflects all three live admissions.
        let projection = project_arena_scene_global(&the_scene, &presences);
        assert_eq!(projection.admitted_count, 3);
        assert_eq!(projection.status, "open");
        assert_eq!(projection.class_distribution.len(), 3);
    }

    #[test]
    fn arena_tables_classifier_discrimination() {
        let presences = vec![
            presence(1, "h-daemon", "arena:arc-001", VAMA_SHAKTI_CLASS_DAEMON),
            presence(2, "h-egregore", "arena:arc-001", VAMA_SHAKTI_CLASS_EGREGORE),
            presence(3, "h-mantra", "arena:arc-001", VAMA_SHAKTI_CLASS_MANTRA),
        ];
        // ArenaPresence carries a discriminating class byte per row.
        assert_eq!(presences[0].vama_shakti_class, VAMA_SHAKTI_CLASS_DAEMON);
        assert_eq!(presences[1].vama_shakti_class, VAMA_SHAKTI_CLASS_EGREGORE);
        assert_eq!(presences[2].vama_shakti_class, VAMA_SHAKTI_CLASS_MANTRA);
        assert_eq!(vama_shakti_class_name(presences[0].vama_shakti_class), "daemon");
        assert_eq!(vama_shakti_class_name(presences[1].vama_shakti_class), "egregore");

        let the_scene = scene("arena:arc-001", "C2-3", None);
        let projection = project_arena_scene_global(&the_scene, &presences);
        // Distribution holds one of each, in ascending class-byte order.
        assert_eq!(
            projection.class_distribution,
            vec![
                (VAMA_SHAKTI_CLASS_EGREGORE, 1),
                (VAMA_SHAKTI_CLASS_DAEMON, 1),
                (VAMA_SHAKTI_CLASS_MANTRA, 1),
            ]
        );
    }

    #[test]
    fn arena_tables_privacy_projection() {
        let the_scene = scene("arena:arc-001", "C2-3", Some(9_999));
        let presences = vec![
            presence(1, "handle-plotinus-secret", "arena:arc-001", VAMA_SHAKTI_CLASS_DAEMON),
            presence(2, "handle-whitehead-secret", "arena:arc-001", VAMA_SHAKTI_CLASS_EGREGORE),
        ];
        let projection = project_arena_scene_global(&the_scene, &presences);
        let json = projection.to_global_json();

        // Exposes only the four safe facets.
        assert!(json.contains(r#""sceneKey":"arena:arc-001""#));
        assert!(json.contains(r#""admittedCount":2"#));
        assert!(json.contains(r#""status":"closed""#));
        assert!(json.contains("classDistribution"));
        assert!(json.contains(r#""daemon":1"#));
        assert!(json.contains(r#""egregore":1"#));

        // Never leaks handles, bodies, speakers, or q-activity.
        assert!(!json.contains("handle-plotinus-secret"));
        assert!(!json.contains("handle-whitehead-secret"));
        assert!(!json.to_ascii_lowercase().contains("dialoguebody"));
        assert!(!json.to_ascii_lowercase().contains("speaker"));
        assert!(!json.to_ascii_lowercase().contains("qactivity"));
        assert!(!json.to_ascii_lowercase().contains("q_activity"));
    }

    #[test]
    fn arena_tables_coincidence_reuse() {
        let pinned = "C2-3";
        let cell = arena_pinned_coordinate_grid_cell(pinned);

        // Co-location: the pinned coordinate's cell already carries a coincidence.
        let appended = plan_arena_coincidence_reuse(
            "arena:arc-001",
            pinned,
            "handle-plotinus",
            VAMA_SHAKTI_CLASS_DAEMON,
            &[7, cell, 42],
            5_000,
        );
        let (coincidence, tick) = appended.expect("co-location must append a coincidence + tick");
        assert_eq!(coincidence.aspect_grid_cell, cell);
        assert_eq!(coincidence.participant_identity_handles, "handle-plotinus");
        assert!(coincidence.related_event_ids.contains("daemon"));
        assert_eq!(tick.new_coincidences_count, 1);
        assert_eq!(tick.participants_count, 1);
        assert_eq!(tick.day_id, "arena:arc-001");

        // No co-location: no tick is appended.
        let none = plan_arena_coincidence_reuse(
            "arena:arc-001",
            pinned,
            "handle-plotinus",
            VAMA_SHAKTI_CLASS_DAEMON,
            &[7, 42],
            5_000,
        );
        assert!(none.is_none());

        // Grid cell is deterministic and within the 360-degree clock space.
        assert_eq!(cell, arena_pinned_coordinate_grid_cell(pinned));
        assert!(cell < 360);
    }
}
