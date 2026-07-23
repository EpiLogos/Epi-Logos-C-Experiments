//! Nara Gateway RPC handler — dispatches all nara.* methods
//!
//! Bridges the CLI nara module into the gateway's JSON-RPC dispatch.
//! Every method returns JSON (json=true) since the gateway is a structured transport.

use std::path::{Path, PathBuf};

use chrono::Utc;
use portal_core::personal_identity::{
    detect_identity_augment_from_activity, IdentityAugmentProposal, IdentityAugmentProposalState,
    IdentityAugmentProposalView, IdentityAugmentReviewVerdict, PersonalIdentityProfile,
    IDENTITY_AUGMENT_DRIFT_THRESHOLD,
};
use portal_core::{CpfState, CsDirection, CsField, NaraPatternPacketStamp, VakAddress, VamaShaktiClass};
use epi_s3_gateway::dispatch::{
    contemplate_session_close, route_nara_session_close, route_nara_session_open,
    ContemplationObject, NaraSessionCloseRequest, NaraSessionConfig, NaraSessionOpenRequest,
    NARA_CONTEMPLATION_OBJECT_READ_METHOD, NARA_SESSION_CLOSE_READ_METHOD,
};
use serde_json::{json, Value};

use crate::gate::nara_close_bundle::{
    aggregate_audio_octet, aggregate_m1_closure, persist_close_bundle, read_close_bundle,
    read_contemplation_object, read_request_from_params, AudioOctetTraversalEvidence,
    M1SessionClosureEvidence,
};
use crate::nara::{
    clock, identity, kairos, lens, logos, medicine, oracle, pratibimba, transform, weights, wind,
};

// ─── Runtime state ──────────────────────────────────────────────────────────

pub struct NaraRuntime {
    pub wound: bool,
    pub kairos_updated_at: Option<u64>,
}

impl NaraRuntime {
    pub fn new() -> Self {
        Self {
            wound: false,
            kairos_updated_at: None,
        }
    }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/// Convert a CLI Result<String, String> into a gateway RPC result.
/// Tries to parse the output as JSON; falls back to wrapping as a string value.
fn cli_to_rpc(result: Result<String, String>) -> Result<Value, (String, String)> {
    match result {
        Ok(text) => serde_json::from_str(&text).or_else(|_| Ok(json!({"result": text}))),
        Err(e) => Err(("nara-error".to_owned(), e)),
    }
}

fn required_param(params: &Value, key: &str) -> Result<String, (String, String)> {
    params
        .get(key)
        .and_then(|v| v.as_str())
        .map(|s| s.to_owned())
        .ok_or_else(|| {
            (
                "invalid-params".to_owned(),
                format!("missing required param '{}'", key),
            )
        })
}

fn opt_str(params: &Value, key: &str) -> Option<String> {
    params
        .get(key)
        .and_then(|v| v.as_str())
        .map(|s| s.to_owned())
}

fn opt_bool(params: &Value, key: &str) -> bool {
    params.get(key).and_then(|v| v.as_bool()).unwrap_or(false)
}

fn opt_u8(params: &Value, key: &str) -> Option<u8> {
    params.get(key).and_then(|v| v.as_u64()).map(|n| n as u8)
}

fn opt_u32(params: &Value, key: &str) -> Option<u32> {
    params.get(key).and_then(|v| v.as_u64()).map(|n| n as u32)
}

fn opt_u64(params: &Value, key: &str) -> Option<u64> {
    params.get(key).and_then(|v| v.as_u64())
}

fn opt_f32(params: &Value, key: &str) -> Option<f32> {
    params.get(key).and_then(|v| v.as_f64()).map(|n| n as f32)
}

fn deferred_stub(method: &str) -> Result<Value, (String, String)> {
    Ok(json!({"status": format!("{}: deferred to agent pipeline", method)}))
}

fn nara_session_config_from_params(params: &Value) -> NaraSessionConfig {
    let mut config = load_nara_session_config().unwrap_or_default();
    let source = params.get("config").unwrap_or(params);
    if let Some(capacity) =
        opt_u32(source, "protein_capacity").or_else(|| opt_u32(source, "proteinCapacity"))
    {
        config.protein_capacity = capacity;
    }
    if let Some(policy) =
        opt_str(source, "stop_codon_policy").or_else(|| opt_str(source, "stopCodonPolicy"))
    {
        config.stop_codon_policy = policy;
    }
    if let Some(mode) =
        opt_str(source, "write_through_mode").or_else(|| opt_str(source, "writeThroughMode"))
    {
        config.write_through_mode = mode;
    }
    if let Some(strict) = source
        .get("protected_handle_strict")
        .or_else(|| source.get("protectedHandleStrict"))
        .and_then(|v| v.as_bool())
    {
        config.protected_handle_strict = strict;
    }
    if let Some(allow) = source
        .get("allow_raw_protein_bus")
        .or_else(|| source.get("allowRawProteinBus"))
        .and_then(|v| v.as_bool())
    {
        config.allow_raw_protein_bus = allow;
    }
    config
}

fn load_nara_session_config() -> Result<NaraSessionConfig, String> {
    let path = dirs::home_dir()
        .ok_or_else(|| "HOME not available for ~/.epi-logos/config.toml".to_owned())?
        .join(".epi-logos")
        .join("config.toml");
    if !path.exists() {
        return Ok(NaraSessionConfig::default());
    }
    let text =
        std::fs::read_to_string(&path).map_err(|err| format!("read {}: {err}", path.display()))?;
    let root: toml::Value =
        toml::from_str(&text).map_err(|err| format!("parse {}: {err}", path.display()))?;
    let mut config = NaraSessionConfig::default();
    let session = root.get("nara").and_then(|v| v.get("session"));
    if let Some(value) = session
        .and_then(|v| v.get("protein_capacity"))
        .and_then(|v| v.as_integer())
    {
        if value >= 0 {
            config.protein_capacity = value as u32;
        }
    }
    if let Some(value) = session
        .and_then(|v| v.get("stop_codon_policy"))
        .and_then(|v| v.as_str())
    {
        config.stop_codon_policy = value.to_owned();
    }
    if let Some(value) = session
        .and_then(|v| v.get("write_through_mode"))
        .and_then(|v| v.as_str())
    {
        config.write_through_mode = value.to_owned();
    }
    if let Some(value) = session
        .and_then(|v| v.get("protected_handle_strict"))
        .and_then(|v| v.as_bool())
    {
        config.protected_handle_strict = value;
    }
    if let Some(value) = root
        .get("dev")
        .and_then(|v| v.get("unsafe"))
        .and_then(|v| v.get("allow_raw_protein_bus"))
        .and_then(|v| v.as_bool())
    {
        config.allow_raw_protein_bus = value;
    }
    Ok(config)
}

/// Return a SpacetimePresence client pointed at the default local SpacetimeDB URL.
/// Default: http://localhost:3000 (overridable via SPACETIMEDB_URL env var).
fn spacetime_client() -> crate::gate::spacetimedb_bridge::SpacetimePresence {
    let url =
        std::env::var("SPACETIMEDB_URL").unwrap_or_else(|_| "http://localhost:3000".to_owned());
    crate::gate::spacetimedb_bridge::SpacetimePresence::new(&url)
}

/// Return the identity hash_preview from the stored profile, or None if unavailable.
/// This is the anonymous BLAKE3 key used for SpacetimeDB presence routing.
fn identity_hash() -> Option<String> {
    identity::load_profile()
        .ok()
        .flatten()
        .filter(|p| p.hash_preview.len() >= 8)
        .map(|p| p.hash_preview)
}

// ─── Dispatch ───────────────────────────────────────────────────────────────

pub fn dispatch_nara(method: &str, params: &Value) -> Result<Value, (String, String)> {
    match method {
        // ── Wind / Status ───────────────────────────────────────────────
        "nara.wind" => {
            let birth_date = opt_str(params, "birth_date");
            let birth_time = opt_str(params, "birth_time");
            let birth_lat = opt_f32(params, "birth_lat");
            let birth_lon = opt_f32(params, "birth_lon");
            let profile = opt_bool(params, "profile");
            let force = opt_bool(params, "force");
            cli_to_rpc(wind::run(
                birth_date.as_deref(),
                birth_time.as_deref(),
                birth_lat,
                birth_lon,
                profile,
                force,
                true,
            ))
        }
        "nara.status" => {
            // Composite status — build JSON from sub-modules
            let mut out = json!({});
            if let Ok(Some(p)) = identity::load_profile() {
                out["identity"] = json!({
                    "layers": p.layer_presence_mask.count_ones(),
                    "hash": p.hash_preview,
                });
            }
            if let Ok(Some(k)) = kairos::load_current() {
                out["kairos"] = json!({
                    "decan": k.active_decan,
                    "element": k.dominant_element,
                });
            }
            Ok(out)
        }
        "nara.session_open" => {
            let session_id = required_param(params, "session_id")
                .or_else(|_| required_param(params, "sessionId"))?;
            let kairos = opt_u64(params, "kairos")
                .unwrap_or_else(|| Utc::now().timestamp_millis().max(0) as u64);
            let response = route_nara_session_open(NaraSessionOpenRequest {
                session_id,
                kairos,
                config: nara_session_config_from_params(params),
            })
            .map_err(|err| ("nara-error".to_owned(), err))?;
            serde_json::to_value(response).map_err(|err| ("nara-error".to_owned(), err.to_string()))
        }
        "nara.session_close" => {
            let session_id = required_param(params, "session_id")
                .or_else(|_| required_param(params, "sessionId"))?;
            let protein_handle = required_param(params, "protein_handle")
                .or_else(|_| required_param(params, "proteinHandle"))?;
            let kairos_close = opt_u64(params, "kairos_close")
                .or_else(|| opt_u64(params, "kairosClose"))
                .unwrap_or_else(|| Utc::now().timestamp_millis().max(0) as u64);
            let response = route_nara_session_close(NaraSessionCloseRequest {
                session_id,
                protein_handle,
                kairos_close,
                config: nara_session_config_from_params(params),
            })
            .map_err(|err| ("nara-error".to_owned(), err))?;
            serde_json::to_value(response).map_err(|err| ("nara-error".to_owned(), err.to_string()))
        }
        "nara.contemplate_session_close" => {
            let object: ContemplationObject =
                serde_json::from_value(params.clone()).map_err(|err| {
                    (
                        "invalid-params".to_owned(),
                        format!("invalid contemplation object: {err}"),
                    )
                })?;
            let response =
                contemplate_session_close(object).map_err(|err| ("nara-error".to_owned(), err))?;
            serde_json::to_value(response).map_err(|err| ("nara-error".to_owned(), err.to_string()))
        }

        // ── Clock ───────────────────────────────────────────────────────
        "nara.clock.status" => cli_to_rpc(clock::show(true)),
        "nara.clock.tick" => {
            // tick = re-show (clock has no separate tick fn)
            cli_to_rpc(clock::show(true))
        }

        // ── Kairos ──────────────────────────────────────────────────────
        "nara.kairos.probe_kerykeion" => serde_json::to_value(kairos::probe_kerykeion())
            .map_err(|error| ("nara-error".to_owned(), error.to_string())),
        "nara.kairos.current" => cli_to_rpc(kairos::show(true, false)),
        "nara.kairos.sync" => {
            let result = kairos::sync_current();
            // SpacetimeDB: update presence with tick12 derived from sun degree after sync
            if result.is_ok() {
                if let Ok(Some(k)) = kairos::load_current() {
                    if let Some(hash) = identity_hash() {
                        // Sun degree (planet_id=0) → tick12 via 12 equal 30° segments
                        if let Some(sun) = k.planets.iter().find(|p| p.planet_id == 0) {
                            let tick12 = ((sun.degree as u16 % 360) * 12 / 360) as u8;
                            let _ = spacetime_client().publish_presence(&hash, tick12);
                        }
                    }
                }
            }
            cli_to_rpc(result)
        }
        "nara.kairos.decan" => {
            let k =
                kairos::require_temporal_authority().map_err(|e| ("nara-error".to_owned(), e))?;
            Ok(json!({"decan": k.active_decan, "element": k.dominant_element}))
        }
        "nara.kairos.resonance" => deferred_stub("nara.kairos.resonance"),
        "nara.kairos.project" => deferred_stub("nara.kairos.project"),

        // ── Identity ────────────────────────────────────────────────────
        "nara.identity.get" => cli_to_rpc(identity::show(true)),
        "nara.identity.clock_position" => {
            use crate::nara::identity::{hash_to_clock_position_from_preview, load_profile};
            match load_profile() {
                Ok(Some(profile)) => {
                    match hash_to_clock_position_from_preview(&profile.hash_preview) {
                        Some((degree, tick12)) => cli_to_rpc(Ok(format!(
                            r#"{{"degree":{},"tick12":{},"hash_preview":"{}","phase":{}}}"#,
                            degree,
                            tick12,
                            profile.hash_preview,
                            if degree >= 180 { 1u8 } else { 0u8 }
                        ))),
                        None => cli_to_rpc(Err(format!(
                            "Cannot derive clock position — hash_preview '{}' too short",
                            profile.hash_preview
                        ))),
                    }
                }
                Ok(None) => cli_to_rpc(Err(
                    "No identity profile found — run `epi nara identity set`".to_string(),
                )),
                Err(e) => cli_to_rpc(Err(e)),
            }
        }
        "nara.identity.layers" => deferred_stub("nara.identity.layers"),
        "nara.identity.compute" => deferred_stub("nara.identity.compute"),
        "nara.identity.layer.set" => {
            let _layer = required_param(params, "layer")?;
            let _source = required_param(params, "source")?;
            deferred_stub("nara.identity.layer.set")
        }

        // ── Oracle ──────────────────────────────────────────────────────
        "nara.oracle.cast" => {
            let system = required_param(params, "system")?;
            let question = required_param(params, "question")?;
            let yes = opt_bool(params, "yes");
            let method = opt_str(params, "method");
            let result = oracle::cast(&system, &question, yes, method.as_deref());
            // SpacetimeDB: record oracle draw with hexagram id if iching cast succeeded
            if system.starts_with("iching") {
                if let Ok(ref text) = result {
                    // Parse primary hexagram from cast output ("Primary hexagram: N")
                    if let Some(hex_id) = text
                        .lines()
                        .find_map(|l| l.strip_prefix("  Primary hexagram: "))
                        .and_then(|s| s.trim().parse::<u8>().ok())
                        .map(|n| n.saturating_sub(1))
                    // display is 1-indexed
                    {
                        if let Some(hash) = identity_hash() {
                            let _ = spacetime_client().record_oracle_draw(&hash, hex_id);
                            // Also update torus presence: derive tick12 from hex_id as crude proxy
                            let tick12 = ((hex_id as u16 * 12) / 64) as u8;
                            let _ = spacetime_client().publish_presence(&hash, tick12);
                        }
                    }
                }
            }
            cli_to_rpc(result)
        }
        "nara.oracle.decan" => {
            let k =
                kairos::require_temporal_authority().map_err(|e| ("nara-error".to_owned(), e))?;
            Ok(json!({"decan": k.active_decan, "element": k.dominant_element}))
        }
        "nara.oracle.history" => cli_to_rpc(oracle::show_history()),
        "nara.oracle.payload" => {
            // Perform a live I-Ching cast and return the full OraclePayload
            // (four faces + eval4 quaternionic charges) as structured JSON.
            //
            // `kairos_degree`: caller may pass the current sun degree (f32 0-360).
            // Falls back to 0.0 — the four faces still compute correctly.
            // `phase`: 0 = explicate (default), 1 = implicate.
            let kairos_degree = opt_f32(params, "kairos_degree").unwrap_or(0.0);
            let phase = opt_u8(params, "phase").unwrap_or(0);
            let result = oracle::cast_iching_coins();
            let payload = oracle::oracle_eval4(&result, kairos_degree, phase);
            // Build transport JSON with tick12-labelled fields (canonical primitive vocabulary)
            let tick12: u8 = {
                let (y, x) = (payload.np, payload.nn);
                let total =
                    payload.pp.abs() + payload.nn.abs() + payload.np.abs() + payload.pn.abs();
                if total < f32::EPSILON {
                    0
                } else {
                    let ny = y / total;
                    let nx = x.abs() / total;
                    let phi = ny.atan2(nx);
                    let normalized = (phi + std::f32::consts::PI) / std::f32::consts::TAU;
                    ((normalized * 12.0).round() as u8) % 12
                }
            };
            Ok(json!({
                "degree":           payload.degree,
                "phase":            payload.phase,
                "primary_hex":      payload.primary_hex,
                "deficient_degree": payload.deficient_degree,
                "implicate_720":    payload.implicate_720,
                "temporal_hex":     payload.temporal_hex,
                "charges": {
                    "pp": payload.pp,
                    "nn": payload.nn,
                    "pn": payload.pn,
                    "np": payload.np,
                },
                "tick12": tick12,
            }))
        }
        "nara.oracle.payload.apply" => {
            let _target = required_param(params, "target")?;
            deferred_stub("nara.oracle.payload.apply")
        }
        "nara.oracle.iching" => {
            // Convenience alias — cast with system=iching
            let question = opt_str(params, "question").unwrap_or_default();
            if question.is_empty() {
                return Err((
                    "invalid-params".to_owned(),
                    "missing required param 'question'".to_owned(),
                ));
            }
            cli_to_rpc(oracle::cast("iching", &question, true, None))
        }
        "nara.oracle.interpret" => {
            let _cast_id = required_param(params, "cast_id")?;
            let _mode = required_param(params, "mode")?;
            deferred_stub("nara.oracle.interpret")
        }
        "nara.oracle.hygiene" => {
            let cast_id = opt_u32(params, "cast_id");
            cli_to_rpc(oracle::show_hygiene(cast_id))
        }

        // ── Medicine ────────────────────────────────────────────────────
        "nara.medicine.snapshot" => {
            let sun_degree = opt_f32(params, "sunDegree")
                .or_else(|| opt_f32(params, "sun_degree"))
                .ok_or_else(|| {
                    (
                        "invalid-params".to_owned(),
                        "missing required numeric param 'sunDegree'".to_owned(),
                    )
                })?;
            serde_json::to_value(
                medicine::medicine_snapshot(sun_degree)
                    .map_err(|error| ("nara-error".to_owned(), error))?,
            )
            .map_err(|error| ("nara-error".to_owned(), error.to_string()))
        }
        "nara.medicine.pin" => {
            let materia = required_param(params, "materia")?;
            serde_json::to_value(
                medicine::pin_materia(&materia)
                    .map_err(|error| ("nara-error".to_owned(), error))?,
            )
            .map_err(|error| ("nara-error".to_owned(), error.to_string()))
        }
        "nara.medicine.balance" => cli_to_rpc(medicine::balance(true)),
        "nara.medicine.chakra" => cli_to_rpc(medicine::chakra(true)),
        "nara.medicine.materia" => cli_to_rpc(medicine::materia(true)),
        "nara.medicine.prescribe" => {
            let context = opt_str(params, "context").unwrap_or_else(|| "general".to_owned());
            cli_to_rpc(medicine::prescribe(&context, false))
        }
        "nara.medicine.safety" => {
            let practice = opt_str(params, "practice");
            cli_to_rpc(medicine::safety(practice.as_deref()))
        }

        // ── Transform ───────────────────────────────────────────────────
        "nara.transform.start" => {
            let container = required_param(params, "container")?;
            serde_json::to_value(
                transform::start_container(&container)
                    .map_err(|error| ("nara-error".to_owned(), error))?,
            )
            .map_err(|error| ("nara-error".to_owned(), error.to_string()))
        }
        "nara.transform.advance" => {
            let container = required_param(params, "container")?;
            let expected_stage = required_param(params, "expectedStage")
                .or_else(|_| required_param(params, "expected_stage"))?;
            let direction =
                transform::TransformDirection::parse(opt_str(params, "direction").as_deref())
                    .map_err(|error| ("invalid-params".to_owned(), error))?;
            let confirmed_backstep = params
                .get("confirmedBackstep")
                .or_else(|| params.get("confirmed_backstep"))
                .and_then(Value::as_bool)
                .unwrap_or(false);
            serde_json::to_value(
                transform::advance_container(
                    &container,
                    &expected_stage,
                    direction,
                    confirmed_backstep,
                )
                .map_err(|error| ("nara-error".to_owned(), error))?,
            )
            .map_err(|error| ("nara-error".to_owned(), error.to_string()))
        }
        "nara.transform.status" => cli_to_rpc(transform::status(true)),
        "nara.transform.cycle.open" => {
            let note = opt_str(params, "note");
            cli_to_rpc(transform::write_cycle(note.as_deref()))
        }
        "nara.transform.cycle.close" => {
            let cycle_id = params
                .get("cycle_id")
                .and_then(|v| v.as_u64())
                .map(|n| n as u32)
                .ok_or_else(|| {
                    (
                        "invalid-params".to_owned(),
                        "missing required param 'cycle_id'".to_owned(),
                    )
                })?;
            let note = opt_str(params, "note");
            cli_to_rpc(transform::reflect(cycle_id, note.as_deref()))
        }
        "nara.transform.recipe" => cli_to_rpc(transform::recipe(true)),
        "nara.transform.commit" => {
            let operation = required_param(params, "operation")?;
            let note = opt_str(params, "note");
            cli_to_rpc(transform::commit(&operation, note.as_deref()))
        }
        "nara.transform.history" => {
            let open = opt_bool(params, "open");
            cli_to_rpc(transform::history(open, true))
        }

        // ── Container (agent pipeline stubs) ────────────────────────────
        "nara.container.open" => deferred_stub("nara.container.open"),
        "nara.container.status" => deferred_stub("nara.container.status"),
        "nara.container.turn" => deferred_stub("nara.container.turn"),
        "nara.container.close" => deferred_stub("nara.container.close"),

        // ── Lens ────────────────────────────────────────────────────────
        "nara.lens.list" => cli_to_rpc(lens::list(true)),
        "nara.lens.apply" => {
            let l = required_param(params, "lens")?;
            let target = opt_str(params, "target");
            cli_to_rpc(lens::apply(&l, target.as_deref()))
        }
        "nara.lens.jungian" => cli_to_rpc(lens::jungian(true)),
        "nara.lens.trika" => cli_to_rpc(lens::trika(true)),
        "nara.lens.phenomenal" => cli_to_rpc(lens::phenomenal(true)),
        "nara.lens.synthesize" => {
            let lenses = required_param(params, "lenses")?;
            let target = opt_str(params, "target");
            cli_to_rpc(lens::synthesize(&lenses, target.as_deref()))
        }
        "nara.lens.subgraph" => deferred_stub("nara.lens.subgraph"),

        // ── Pratibimba ──────────────────────────────────────────────────
        "nara.pratibimba.stats" => cli_to_rpc(pratibimba::stats(true)),
        "nara.pratibimba.recent" => {
            let days = opt_u32(params, "days").unwrap_or(7);
            cli_to_rpc(pratibimba::recent(days, true))
        }
        "nara.pratibimba.record" => {
            let cycle_id = params
                .get("cycle_id")
                .and_then(|v| v.as_u64())
                .map(|n| n as u32)
                .ok_or_else(|| {
                    (
                        "invalid-params".to_owned(),
                        "missing required param 'cycle_id'".to_owned(),
                    )
                })?;
            let lens = opt_str(params, "lens");
            cli_to_rpc(pratibimba::record(cycle_id, lens.as_deref()))
        }
        "nara.pratibimba.excavate" => {
            let term = required_param(params, "term")?;
            cli_to_rpc(pratibimba::excavate(&term, true))
        }
        "nara.pratibimba.atlas_sync" => {
            let yes = opt_bool(params, "yes");
            cli_to_rpc(pratibimba::atlas_sync(yes))
        }
        "nara.pratibimba.atlas_query" => {
            let coordinate = opt_str(params, "coordinate");
            cli_to_rpc(pratibimba::atlas_query(coordinate.as_deref(), true))
        }

        // ── Logos ───────────────────────────────────────────────────────
        "nara.logos.run" => {
            let date = opt_str(params, "date");
            let stage = opt_u8(params, "stage");
            cli_to_rpc(logos::run(date.as_deref(), stage, true))
        }
        "nara.logos.status" => cli_to_rpc(logos::status(true)),
        "nara.logos.advance" => {
            let date = opt_str(params, "date");
            cli_to_rpc(logos::advance(date.as_deref(), true))
        }
        "nara.logos.regress" => {
            let date = opt_str(params, "date");
            cli_to_rpc(logos::regress(date.as_deref(), true))
        }
        "nara.logos.stage" => {
            let stage = params
                .get("stage")
                .and_then(|v| v.as_u64())
                .map(|n| n as u8)
                .ok_or_else(|| {
                    (
                        "invalid-params".to_owned(),
                        "missing required param 'stage'".to_owned(),
                    )
                })?;
            let date = opt_str(params, "date");
            let result = logos::stage(stage, date.as_deref(), true);
            // SpacetimeDB: record logos stage completion
            if result.is_ok() {
                if let Some(hash) = identity_hash() {
                    let day_key = date.unwrap_or_else(|| Utc::now().format("%Y-%m-%d").to_string());
                    let _ = spacetime_client().record_logos_stage(&hash, stage, &day_key);
                }
            }
            cli_to_rpc(result)
        }
        "nara.logos.curriculum" => cli_to_rpc(logos::curriculum(true)),
        "nara.logos.export" => {
            let date = opt_str(params, "date");
            let yes = opt_bool(params, "yes");
            cli_to_rpc(logos::export(date.as_deref(), yes))
        }

        // ── Weights ─────────────────────────────────────────────────────
        "nara.weights.get" => cli_to_rpc(weights::show(true)),
        "nara.weights.set" => {
            let key = required_param(params, "key")?;
            let value = params
                .get("value")
                .and_then(|v| v.as_f64())
                .map(|n| n as f32)
                .ok_or_else(|| {
                    (
                        "invalid-params".to_owned(),
                        "missing required param 'value'".to_owned(),
                    )
                })?;
            cli_to_rpc(weights::set_weight(&key, value))
        }
        "nara.weights.reset" => cli_to_rpc(weights::reset()),
        "nara.weights.calibrate" => cli_to_rpc(weights::calibrate()),

        // ── Cosmos (agent pipeline stubs) ───────────────────────────────
        "nara.cosmos.navigate" => deferred_stub("nara.cosmos.navigate"),
        "nara.cosmos.subgraph" => deferred_stub("nara.cosmos.subgraph"),

        // ── Catch-all ───────────────────────────────────────────────────
        _ => Err((
            "unimplemented".to_owned(),
            format!("{} is not a known nara method", method),
        )),
    }
}

pub fn dispatch_nara_with_state_root(
    state_root: &Path,
    peer_is_loopback: bool,
    method: &str,
    params: &Value,
) -> Result<Value, (String, String)> {
    match method {
        "nara.session_close" => close_with_persisted_bundle(state_root, peer_is_loopback, params),
        NARA_SESSION_CLOSE_READ_METHOD => {
            read_persisted_bundle(state_root, peer_is_loopback, params)
        }
        NARA_CONTEMPLATION_OBJECT_READ_METHOD => {
            read_persisted_contemplation_object(state_root, peer_is_loopback, params)
        }
        // 25.T25.14 (DR-WC-M4-4) — the personal-coordinate surface. All are
        // protected-local: they require a loopback peer, exactly like the
        // session-close bundle above. `nara.pasu.show` is the handle-only read
        // (the natal-chart raw body never transits — only its path string).
        "nara.pasu.show" => show_pasu_record(peer_is_loopback),
        "nara.pasu.consents.append" => append_pasu_consent(peer_is_loopback, params),
        "nara.identity.proposals.detect" => {
            detect_identity_proposal(state_root, peer_is_loopback, params)
        }
        "nara.identity.proposals.submit" => {
            submit_identity_proposal(state_root, peer_is_loopback, params)
        }
        "nara.identity.proposals.list" => list_identity_proposals(state_root, peer_is_loopback),
        "nara.identity.proposals.decide" => {
            decide_identity_proposal(state_root, peer_is_loopback, params)
        }
        "nara.activity.show" => show_activity_trajectory(state_root, peer_is_loopback),
        _ => dispatch_nara(method, params),
    }
}

/// Store path for the M5' identity-augment review ledger — protected-local,
/// under the gateway state root (loopback-gated like the close bundle).
fn identity_proposal_store_path(state_root: &Path) -> PathBuf {
    state_root.join("nara").join("identity-proposals.json")
}

/// Store path for the persisted per-user Q_activity accumulator — protected-local
/// under the gateway state root, parallel to the identity-proposal ledger. This
/// is the real driver the `detect` producer reads and the session-close
/// auto-trigger accumulates into.
fn activity_trajectory_store_path(state_root: &Path) -> PathBuf {
    state_root.join("nara").join("activity-trajectory.json")
}

/// The Vama Shakti perturbation class used for personal session-close activity.
/// A session-close activity packet is a transient, kairos-delta-sensitive
/// perturbation of the personal Q_activity accumulator, so it uses the Sprite
/// law: the elapsed-kairos gap between session closes is the dominant drift
/// driver (longer gaps nudge the accumulator harder), which is the semantically
/// right behaviour for accumulated personal activity. Documented, not derived —
/// the exact class is a product/taste decision at the M4' boundary.
const SESSION_ACTIVITY_VAMA_CLASS: VamaShaktiClass = VamaShaktiClass::Sprite;

/// The kairos window (ms) one unit of `kairos_delta` spans — a 30-minute window,
/// so an inter-session gap of a few hours yields a bounded delta near the
/// perturbation law's internal clamp (8.0).
const KAIROS_WINDOW_MS: f64 = 1_800_000.0;

/// `nara.activity.show`: the persisted per-user Q_activity accumulator, for
/// observability + panel rendering. Protected-local — loopback peer required.
fn show_activity_trajectory(
    state_root: &Path,
    peer_is_loopback: bool,
) -> Result<Value, (String, String)> {
    if !peer_is_loopback {
        return Err((
            "nara-error".to_owned(),
            "protected-local nara.activity.show requires a loopback peer".to_owned(),
        ));
    }
    let trajectory =
        crate::nara::activity_trajectory::current(&activity_trajectory_store_path(state_root));
    Ok(json!({
        "qActivity": trajectory.q_activity,
        "turnCount": trajectory.turn_count,
        "packetRefs": trajectory.packet_refs,
        "updatedAt": trajectory.updated_at,
    }))
}

/// Derive a bounded `kairos_delta` for a session-close activity packet: the
/// elapsed kairos between this close and the accumulator's last turn, expressed
/// in [`KAIROS_WINDOW_MS`] units and clamped to `[0, 8]`. The first turn (no
/// prior close) yields `0.0`.
fn bounded_kairos_delta(kairos_close: u64, last_kairos_close: Option<u64>) -> f32 {
    match last_kairos_close {
        Some(prev) if kairos_close > prev => {
            let elapsed_ms = (kairos_close - prev) as f64;
            ((elapsed_ms / KAIROS_WINDOW_MS) as f32).clamp(0.0, 8.0)
        }
        _ => 0.0,
    }
}

/// Construct ONE real activity packet from the session-close signal.
///
/// * `packet_ref` names the REAL sealed protein + session
///   (`activity://session/{session_id}/{protein_handle}`).
/// * `vak_address.cp` carries the REAL engaged session coordinate discovered on
///   the `ContemplationObject` (`engaged_coordinates[0].coordinate`), and `ct`
///   carries the REAL session codon-trace. When no engaged coordinate is
///   present the address degrades HONESTLY to the documented `#4.0` personal
///   baseline (the returned `bool` flags the degrade); the remaining reflective
///   coordinates are the personal-substrate frame constants `(4.0/1-4.4/5)`.
/// * `kairos_delta` is derived from `kairos_close` vs the accumulator's last
///   turn ([`bounded_kairos_delta`]).
fn session_activity_packet(
    session_id: &str,
    protein_handle: &str,
    kairos_close: u64,
    session_coordinate: Option<&str>,
    session_codons: &[String],
    last_kairos_close: Option<u64>,
) -> (NaraPatternPacketStamp, bool) {
    let (cp, degraded) = match session_coordinate {
        Some(coordinate) if !coordinate.trim().is_empty() => (coordinate.to_owned(), false),
        _ => ("4.0".to_owned(), true),
    };
    let vak_address = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: session_codons.to_vec(),
        cp,
        cf: "(4.0/1-4.4/5)".to_owned(),
        cfp: "4.4".to_owned(),
        cs: CsField {
            code: "M4".to_owned(),
            direction: CsDirection::Day,
            recognized: false,
        },
    };
    let kairos_delta = bounded_kairos_delta(kairos_close, last_kairos_close);
    (
        NaraPatternPacketStamp {
            packet_ref: format!("activity://session/{session_id}/{protein_handle}"),
            vak_address,
            kairos_delta,
        },
        degraded,
    )
}

/// Persist a detected/produced proposal into the review store at `Proposed` and
/// return its handle-only view. Shared by the `detect` RPC and the session-close
/// auto-trigger. NEVER applies — Q_identity stays untouched.
fn persist_detected_proposal(
    store_path: &Path,
    proposal: &IdentityAugmentProposal,
) -> Result<IdentityAugmentProposalView, String> {
    let view = proposal.view();
    let persisted = crate::nara::identity_proposals::PersistedProposal {
        proposal_handle: proposal.proposal_handle.clone(),
        state: IdentityAugmentProposalState::Proposed,
        summary: proposal.summary.clone(),
        source_adapter_handle: proposal.source_adapter_handle.clone(),
        created_at: proposal.created_at.clone(),
        reviewed_at: None,
        decided_at: None,
        applied_at: None,
        q_identity_candidate: proposal.q_identity_candidate(),
    };
    crate::nara::identity_proposals::submit_proposal(store_path, persisted)?;
    Ok(view)
}

/// Run the drift detector on an accumulated `q_activity` against the natal
/// `profile` and, on drift below the alignment floor, SUBMIT a `Proposed`
/// identity-augment proposal into the review store. Returns the produced view
/// (or `None` when still aligned / on a swallowed submit error). Identity
/// transit (no live transit is threaded at session-close) and the schema drift
/// floor are used. NEVER mutates Q_identity — the detector holds `&profile`.
fn auto_detect_and_submit(
    proposal_store: &Path,
    profile: &PersonalIdentityProfile,
    q_activity: [f32; 4],
    now: &str,
) -> Option<IdentityAugmentProposalView> {
    let handle = format!(
        "identity-proposal://activity-auto/{}",
        Utc::now().timestamp_millis()
    );
    let proposal = detect_identity_augment_from_activity(
        profile,
        q_activity,
        [1.0, 0.0, 0.0, 0.0],
        IDENTITY_AUGMENT_DRIFT_THRESHOLD,
        handle,
        "adapter://m4/session-close-activity-drift",
        now.to_owned(),
    )?;
    persist_detected_proposal(proposal_store, &proposal).ok()
}

/// The session-close AUTO-TRIGGER (side-effect; best-effort — never fails the
/// close). Build the real activity packet, accumulate it into the persisted
/// per-user Q_activity, then run the drift detector on the accumulated
/// trajectory vs the loaded natal profile and auto-submit a proposal on drift.
/// Inserts the additive response fields (`activityTrajectory`,
/// `identityAugmentProposed`, and `identityAugmentProposalHandle` when produced)
/// into `object`. On any internal IO error the close still succeeds, only the
/// additive fields are omitted.
fn apply_activity_autotrigger(
    state_root: &Path,
    session_id: &str,
    protein_handle: &str,
    kairos_close: u64,
    session_coordinate: Option<&str>,
    session_codons: &[String],
    object: &mut serde_json::Map<String, Value>,
) {
    let activity_store = activity_trajectory_store_path(state_root);
    let previous = crate::nara::activity_trajectory::current(&activity_store);
    let (packet, _degraded) = session_activity_packet(
        session_id,
        protein_handle,
        kairos_close,
        session_coordinate,
        session_codons,
        previous.last_kairos_close,
    );
    let now = Utc::now().to_rfc3339();
    let Ok(trajectory) = crate::nara::activity_trajectory::accumulate(
        &activity_store,
        std::slice::from_ref(&packet),
        SESSION_ACTIVITY_VAMA_CLASS,
        &now,
        Some(kairos_close),
    ) else {
        return;
    };
    object.insert(
        "activityTrajectory".to_owned(),
        json!({ "qActivity": trajectory.q_activity, "turnCount": trajectory.turn_count }),
    );

    // Auto-detect: measure the freshly-accumulated Q_activity drift vs the natal
    // identity. Honest degradation — no natal/PASU baseline means we accumulate
    // (still useful) but propose nothing.
    let mut proposed = false;
    if let Ok(Some(profile)) = load_personal_identity_profile() {
        let proposal_store = identity_proposal_store_path(state_root);
        if let Some(view) =
            auto_detect_and_submit(&proposal_store, &profile, trajectory.q_activity, &now)
        {
            proposed = true;
            object.insert(
                "identityAugmentProposalHandle".to_owned(),
                json!(view.proposal_handle),
            );
        }
    }
    object.insert("identityAugmentProposed".to_owned(), json!(proposed));
}

/// `nara.pasu.show`: the handle-only PASU record (birth handles, natal-chart
/// PATH string only, derived quintessence reflections, and the atlas-sync
/// consent ledger). Protected-local — loopback peer required.
fn show_pasu_record(peer_is_loopback: bool) -> Result<Value, (String, String)> {
    if !peer_is_loopback {
        return Err((
            "nara-error".to_owned(),
            "protected-local nara.pasu.show requires a loopback peer".to_owned(),
        ));
    }
    let vault_root = crate::vault::resolve_vault_root();
    let record = crate::vault::pasu::pasu_record(&vault_root);
    serde_json::to_value(record).map_err(|err| ("nara-error".to_owned(), err.to_string()))
}

/// `nara.pasu.consents.append` (DR-WC-M4-4): append a typed ConsentRecord to the
/// PASU `c_4_atlas_sync_consents` array. Accepts the record either at the params
/// root or under a `consent` key. Returns the full updated ledger.
fn append_pasu_consent(
    peer_is_loopback: bool,
    params: &Value,
) -> Result<Value, (String, String)> {
    if !peer_is_loopback {
        return Err((
            "nara-error".to_owned(),
            "protected-local nara.pasu.consents.append requires a loopback peer".to_owned(),
        ));
    }
    let consent_value = params.get("consent").cloned().unwrap_or_else(|| params.clone());
    let consent: crate::vault::pasu::ConsentRecord = serde_json::from_value(consent_value)
        .map_err(|err| {
            (
                "invalid-params".to_owned(),
                format!("invalid consent record: {err}"),
            )
        })?;
    let vault_root = crate::vault::resolve_vault_root();
    let consents = crate::vault::pasu::pasu_append_consent(&vault_root, consent)
        .map_err(|err| ("nara-error".to_owned(), err))?;
    let count = consents.len();
    Ok(json!({ "consents": consents, "count": count }))
}

/// Parse an optional `q_identity_candidate` (a `[f32; 4]`) from params, falling
/// back to the identity quaternion `[1, 0, 0, 0]`. The candidate is NEVER
/// surfaced (the review view is handle-only) — it exists only so the persisted
/// record can be reconstructed against the canonical state machine.
fn parse_quaternion_candidate(params: &Value) -> [f32; 4] {
    let default = [1.0, 0.0, 0.0, 0.0];
    let Some(raw) = params
        .get("q_identity_candidate")
        .or_else(|| params.get("qIdentityCandidate"))
        .and_then(|value| value.as_array())
    else {
        return default;
    };
    if raw.len() != 4 {
        return default;
    }
    let mut out = [0.0f32; 4];
    for (index, item) in raw.iter().enumerate() {
        match item.as_f64() {
            Some(number) => out[index] = number as f32,
            None => return default,
        }
    }
    out
}

/// Parse a REQUIRED-shaped `[f32; 4]` quaternion param under any of `keys`,
/// returning `None` when absent or malformed (unlike [`parse_quaternion_candidate`]
/// which defaults to identity). The detect producer uses this to distinguish
/// "no accumulated q_activity supplied" (honest degradation) from a real value.
fn parse_quaternion_param(params: &Value, keys: &[&str]) -> Option<[f32; 4]> {
    let raw = keys
        .iter()
        .find_map(|key| params.get(*key))
        .and_then(|value| value.as_array())?;
    if raw.len() != 4 {
        return None;
    }
    let mut out = [0.0f32; 4];
    for (index, item) in raw.iter().enumerate() {
        out[index] = item.as_f64()? as f32;
    }
    Some(out)
}

/// `nara.identity.proposals.submit` (25.T25.14): open the identity-augment
/// lifecycle by creating a NEW proposal in the review store at state `Proposed`.
/// This is the SUBMISSION SEAM a producer/agent (or the e2e loop) drives so that
/// `list` can then surface the proposal and the user can `decide` (accept|reject).
/// The upstream PRODUCER that DECIDES whether to propose an identity augment is
/// genuinely separate/future — this lands the seam and proves the loop, it is not
/// itself a proposal generator.
///
/// INVARIANT: submit creates a `Proposed` proposal ONLY. It NEVER mutates
/// Q_identity — `apply` stays a separate governed path (UX 10.1), exactly as
/// `decide` (accept|reject) never applies. Duplicate handles are refused by the
/// underlying `submit_proposal` seam.
fn submit_identity_proposal(
    state_root: &Path,
    peer_is_loopback: bool,
    params: &Value,
) -> Result<Value, (String, String)> {
    if !peer_is_loopback {
        return Err((
            "nara-error".to_owned(),
            "protected-local nara.identity.proposals.submit requires a loopback peer".to_owned(),
        ));
    }
    let proposal_handle = required_param(params, "proposal_handle")
        .or_else(|_| required_param(params, "proposalHandle"))?;
    let summary = required_param(params, "summary")?;
    let source_adapter_handle = required_param(params, "source_adapter_handle")
        .or_else(|_| required_param(params, "sourceAdapterHandle"))?;
    let created_at = opt_str(params, "created_at")
        .or_else(|| opt_str(params, "createdAt"))
        .unwrap_or_else(|| Utc::now().to_rfc3339());
    let q_identity_candidate = parse_quaternion_candidate(params);

    // Validate the (non-empty) fields and derive the canonical handle-only view
    // via the portal-core constructor. It is BORN `Proposed` and normalises the
    // candidate; constructing it NEVER applies — mirroring the decide path's
    // no-apply invariant. The view is what `list` would later surface.
    let proposal = IdentityAugmentProposal::proposed(
        proposal_handle.clone(),
        summary.clone(),
        source_adapter_handle.clone(),
        created_at.clone(),
        q_identity_candidate,
    )
    .map_err(|err| ("invalid-params".to_owned(), err.to_string()))?;
    let view = proposal.view();

    // Persist the parallel review-ledger record at `Proposed` — the persistence
    // seam the `list`/`decide` RPCs read and advance. Duplicate handles fail
    // closed inside `submit_proposal`.
    let persisted = crate::nara::identity_proposals::PersistedProposal {
        proposal_handle,
        state: IdentityAugmentProposalState::Proposed,
        summary,
        source_adapter_handle,
        created_at,
        reviewed_at: None,
        decided_at: None,
        applied_at: None,
        q_identity_candidate,
    };
    crate::nara::identity_proposals::submit_proposal(
        &identity_proposal_store_path(state_root),
        persisted,
    )
    .map_err(|err| ("nara-error".to_owned(), err))?;

    serde_json::to_value(view).map_err(|err| ("nara-error".to_owned(), err.to_string()))
}

/// Load the current PROTECTED-LOCAL personal identity profile — the #4.0 natal
/// baseline the drift detector measures accumulated activity against. This is the
/// canonical construction path (per M4-ARCHITECTURE §7.5: PASU natal chart →
/// `KerykeionResult` → `PersonalIdentityProfile::from_kerykeion_json`). Honest
/// degradation: `Ok(None)` when either the persisted natal chart or the local
/// PASU identity is absent — the producer then emits nothing rather than
/// fabricating a baseline.
fn load_personal_identity_profile() -> Result<Option<PersonalIdentityProfile>, String> {
    let Some(natal) = crate::nara::kairos::load_natal()? else {
        return Ok(None);
    };
    let Some(profile_json) = identity::load_profile()? else {
        return Ok(None);
    };
    let hash = identity::blake3_identity_hash(&profile_json);
    let identity_hash: String = hash.iter().map(|byte| format!("{byte:02x}")).collect();
    let natal_json =
        serde_json::to_string(&natal).map_err(|err| format!("re-serialize natal chart: {err}"))?;
    PersonalIdentityProfile::from_kerykeion_json(
        "protected://nara/kairos/natal/identity-augment-detect",
        identity_hash,
        &natal_json,
    )
    .map(Some)
    .map_err(|err| err.to_string())
}

/// `nara.identity.proposals.detect` (25.T25.14): the REAL identity-augment
/// PRODUCER seam that makes panel (c) live in a live system. It loads the natal
/// identity baseline, measures the accumulated-Q_activity drift via
/// `PersonalResonance`, and — ONLY when the accumulated activity has drifted
/// below the tunable alignment floor — SUBMITS a `Proposed` identity-augment
/// proposal into the SAME review store that `list`/`decide` read. It NEVER
/// mutates Q_identity (the detector holds a shared profile ref; only the governed
/// `applied` verdict mutates identity, downstream of a human accept). Aligned
/// activity produces nothing (`produced:false`).
///
/// DRIVER: the accumulated Q_activity is read from the PERSISTED per-user
/// accumulator (`activity_trajectory.rs`) — the real driver. An explicit
/// `q_activity` param still OVERRIDES the persisted value (for tests / explicit
/// calls). The persisted accumulator is fed AUTOMATICALLY at the personal
/// activity checkpoint (`nara.session_close` → [`apply_activity_autotrigger`]),
/// so this producer now fires on real accumulated activity without any param.
///
/// AUTO-TRIGGER (now WIRED): the automatic firing point is the session-close
/// checkpoint. `close_with_persisted_bundle` builds a real
/// [`NaraPatternPacketStamp`] from the close signal, folds it through
/// `apply_pattern_packet_chain` into the persisted accumulator, and runs the SAME
/// drift detector on the accumulated trajectory — auto-submitting a proposal on
/// drift. This RPC and the auto-trigger share one submit seam
/// ([`persist_detected_proposal`]); the accumulate→detect flow is the genuine
/// producer path, no longer a flagged-but-unwired hook.
fn detect_identity_proposal(
    state_root: &Path,
    peer_is_loopback: bool,
    params: &Value,
) -> Result<Value, (String, String)> {
    if !peer_is_loopback {
        return Err((
            "nara-error".to_owned(),
            "protected-local nara.identity.proposals.detect requires a loopback peer".to_owned(),
        ));
    }
    let profile = match load_personal_identity_profile() {
        Ok(Some(profile)) => profile,
        Ok(None) => {
            return Ok(json!({
                "produced": false,
                "reason": "no protected-local identity baseline (natal chart + PASU identity) available"
            }));
        }
        Err(err) => return Err(("nara-error".to_owned(), err)),
    };
    // The real driver: the PERSISTED accumulated Q_activity. An explicit
    // `q_activity` param overrides it inside the core.
    let persisted =
        crate::nara::activity_trajectory::current(&activity_trajectory_store_path(state_root));
    detect_identity_proposal_core(
        &identity_proposal_store_path(state_root),
        &profile,
        params,
        persisted.q_activity,
    )
}

/// The env-free core of [`detect_identity_proposal`]: given a loaded profile,
/// review store, and the PERSISTED accumulated Q_activity fallback, measure drift
/// and submit a `Proposed` proposal on drift. Split out so the
/// produces/submits/lists/identity-untouched invariants (and the persisted-vs-
/// override read) are unit testable without seeding process-global env
/// (`EPI_NARA_HOME`, natal.json, the accumulator ledger).
fn detect_identity_proposal_core(
    store_path: &Path,
    profile: &PersonalIdentityProfile,
    params: &Value,
    persisted_q_activity: [f32; 4],
) -> Result<Value, (String, String)> {
    // Accumulated Q_activity: an explicit param OVERRIDES; otherwise the
    // persisted per-user accumulator is the real driver.
    let q_activity =
        parse_quaternion_param(params, &["q_activity", "qActivity"]).unwrap_or(persisted_q_activity);
    // q_transit is optional — default identity (no transit perturbation).
    let q_transit =
        parse_quaternion_param(params, &["q_transit", "qTransit"]).unwrap_or([1.0, 0.0, 0.0, 0.0]);
    // Tunable drift floor (mirrors the resonance-threshold injection pattern);
    // defaults to the schema constant flagged for Architect tuning.
    let drift_threshold = opt_f32(params, "drift_threshold")
        .or_else(|| opt_f32(params, "driftThreshold"))
        .unwrap_or(IDENTITY_AUGMENT_DRIFT_THRESHOLD);

    let created_at = opt_str(params, "created_at")
        .or_else(|| opt_str(params, "createdAt"))
        .unwrap_or_else(|| Utc::now().to_rfc3339());
    let source_adapter_handle = opt_str(params, "source_adapter_handle")
        .or_else(|| opt_str(params, "sourceAdapterHandle"))
        .unwrap_or_else(|| "adapter://m4/activity-drift-detector".to_owned());
    let proposal_handle = opt_str(params, "proposal_handle")
        .or_else(|| opt_str(params, "proposalHandle"))
        .unwrap_or_else(|| {
            format!(
                "identity-proposal://activity-drift/{}",
                Utc::now().timestamp_millis()
            )
        });

    let Some(proposal) = detect_identity_augment_from_activity(
        profile,
        q_activity,
        q_transit,
        drift_threshold,
        proposal_handle,
        source_adapter_handle,
        created_at,
    ) else {
        return Ok(json!({
            "produced": false,
            "reason": "accumulated activity is still aligned with the natal identity; no drift proposal"
        }));
    };

    // Persist into the SAME review store `list`/`decide` read, so the produced
    // proposal surfaces in panel (c). Candidate = the activity-composed
    // quaternion (never a q_identity write).
    let view = persist_detected_proposal(store_path, &proposal)
        .map_err(|err| ("nara-error".to_owned(), err))?;

    let view_value =
        serde_json::to_value(view).map_err(|err| ("nara-error".to_owned(), err.to_string()))?;
    Ok(json!({ "produced": true, "proposal": view_value }))
}

/// `nara.identity.proposals.list`: the pending (proposed|reviewed) review views.
fn list_identity_proposals(
    state_root: &Path,
    peer_is_loopback: bool,
) -> Result<Value, (String, String)> {
    if !peer_is_loopback {
        return Err((
            "nara-error".to_owned(),
            "protected-local nara.identity.proposals.list requires a loopback peer".to_owned(),
        ));
    }
    let views = crate::nara::identity_proposals::list_pending(&identity_proposal_store_path(
        state_root,
    ))
    .map_err(|err| ("nara-error".to_owned(), err))?;
    Ok(json!({ "proposals": views }))
}

/// `nara.identity.proposals.decide`: accept|reject through the M5' review gate.
/// Never mutates Q_identity (no `apply`) — accept only moves the proposal to
/// Accepted; the identity mutation stays a separate governed path.
fn decide_identity_proposal(
    state_root: &Path,
    peer_is_loopback: bool,
    params: &Value,
) -> Result<Value, (String, String)> {
    if !peer_is_loopback {
        return Err((
            "nara-error".to_owned(),
            "protected-local nara.identity.proposals.decide requires a loopback peer".to_owned(),
        ));
    }
    let handle = required_param(params, "proposal_handle")
        .or_else(|_| required_param(params, "proposalHandle"))?;
    let verdict = match required_param(params, "verdict")?.as_str() {
        "accept" => IdentityAugmentReviewVerdict::Accept,
        "reject" => IdentityAugmentReviewVerdict::Reject,
        other => {
            return Err((
                "invalid-params".to_owned(),
                format!("verdict must be accept|reject, got `{other}`"),
            ))
        }
    };
    let now = Utc::now().to_rfc3339();
    let view = crate::nara::identity_proposals::decide(
        &identity_proposal_store_path(state_root),
        &handle,
        verdict,
        &now,
    )
    .map_err(|err| ("nara-error".to_owned(), err))?;
    serde_json::to_value(view).map_err(|err| ("nara-error".to_owned(), err.to_string()))
}

fn close_with_persisted_bundle(
    state_root: &Path,
    peer_is_loopback: bool,
    params: &Value,
) -> Result<Value, (String, String)> {
    if !peer_is_loopback {
        return Err((
            "nara-error".to_owned(),
            "protected-local nara.session_close requires a loopback peer".to_owned(),
        ));
    }
    let session_id =
        required_param(params, "session_id").or_else(|_| required_param(params, "sessionId"))?;
    let contemplation_object =
        required_object_param(params, &["contemplation_object", "contemplationObject"]).and_then(
            |value| {
                serde_json::from_value::<ContemplationObject>(value).map_err(|err| {
                    (
                        "invalid-params".to_owned(),
                        format!("invalid contemplation_object: {err}"),
                    )
                })
            },
        )?;
    if contemplation_object.session_id != session_id {
        return Err((
            "invalid-params".to_owned(),
            "contemplation_object.session_id must exactly match session_id".to_owned(),
        ));
    }
    // Extract the REAL session-activity signal for the accumulator BEFORE the
    // contemplation object is consumed by `contemplate_session_close`: the first
    // engaged coordinate (the session's coordinate) and the codon-trace.
    let session_coordinate = contemplation_object
        .engaged_coordinates
        .first()
        .map(|engaged| engaged.coordinate.clone());
    let session_codons: Vec<String> = contemplation_object
        .trajectory
        .iter()
        .filter_map(|tick| tick.codon.clone())
        .collect();
    let m1_evidence =
        required_object_param(params, &["m1_closure", "m1Closure"]).and_then(|value| {
            serde_json::from_value::<M1SessionClosureEvidence>(value).map_err(|err| {
                (
                    "invalid-params".to_owned(),
                    format!("invalid m1_closure: {err}"),
                )
            })
        })?;
    let audio_evidence =
        required_object_param(params, &["audio_octet", "audioOctet"]).and_then(|value| {
            serde_json::from_value::<AudioOctetTraversalEvidence>(value).map_err(|err| {
                (
                    "invalid-params".to_owned(),
                    format!("invalid audio_octet: {err}"),
                )
            })
        })?;
    let m1_closure =
        aggregate_m1_closure(&m1_evidence).map_err(|err| ("invalid-params".to_owned(), err))?;
    let audio_octet =
        aggregate_audio_octet(&audio_evidence).map_err(|err| ("invalid-params".to_owned(), err))?;
    let protein_handle = required_param(params, "protein_handle")
        .or_else(|_| required_param(params, "proteinHandle"))?;
    let kairos_close = opt_u64(params, "kairos_close")
        .or_else(|| opt_u64(params, "kairosClose"))
        .unwrap_or_else(|| Utc::now().timestamp_millis().max(0) as u64);
    let response = route_nara_session_close(NaraSessionCloseRequest {
        session_id: session_id.clone(),
        protein_handle: protein_handle.clone(),
        kairos_close,
        config: nara_session_config_from_params(params),
    })
    .map_err(|err| ("nara-error".to_owned(), err))?;
    let contemplation = contemplate_session_close(contemplation_object)
        .map_err(|err| ("nara-error".to_owned(), err))?;
    let pasu_scope = active_pasu_scope("nara.session_close")?;
    let bundle = persist_close_bundle(
        state_root,
        &pasu_scope,
        &session_id,
        &m1_closure,
        &audio_octet,
        &contemplation,
    )
    .map_err(|err| ("nara-error".to_owned(), err))?;
    let mut value =
        serde_json::to_value(response).map_err(|err| ("nara-error".to_owned(), err.to_string()))?;
    if let Some(object) = value.as_object_mut() {
        object.insert("close_ref".to_owned(), json!(bundle.close_ref));
        // AUTO-TRIGGER (side-effect): fold this close's real activity packet into
        // the persisted per-user Q_activity accumulator and auto-detect identity
        // drift. Best-effort — the close never fails on the accumulator.
        apply_activity_autotrigger(
            state_root,
            &session_id,
            &protein_handle,
            kairos_close,
            session_coordinate.as_deref(),
            &session_codons,
            object,
        );
    }
    Ok(value)
}

fn read_persisted_bundle(
    state_root: &Path,
    peer_is_loopback: bool,
    params: &Value,
) -> Result<Value, (String, String)> {
    if !peer_is_loopback {
        return Err((
            "nara-error".to_owned(),
            "protected-local nara.session_close.read requires a loopback peer".to_owned(),
        ));
    }
    let pasu_scope = active_pasu_scope("nara.session_close.read")?;
    let request =
        read_request_from_params(params).map_err(|err| ("invalid-params".to_owned(), err))?;
    let bundle = read_close_bundle(state_root, &pasu_scope, &request)
        .map_err(|err| ("nara-error".to_owned(), err))?;
    serde_json::to_value(bundle).map_err(|err| ("nara-error".to_owned(), err.to_string()))
}

fn read_persisted_contemplation_object(
    state_root: &Path,
    peer_is_loopback: bool,
    params: &Value,
) -> Result<Value, (String, String)> {
    if !peer_is_loopback {
        return Err((
            "nara-error".to_owned(),
            "protected-local nara.session_close.contemplation.read requires a loopback peer"
                .to_owned(),
        ));
    }
    let pasu_scope = active_pasu_scope("nara.session_close.contemplation.read")?;
    let request =
        read_request_from_params(params).map_err(|err| ("invalid-params".to_owned(), err))?;
    let contemplation = read_contemplation_object(state_root, &pasu_scope, &request)
        .map_err(|err| ("nara-error".to_owned(), err))?;
    serde_json::to_value(contemplation).map_err(|err| ("nara-error".to_owned(), err.to_string()))
}

fn required_object_param(params: &Value, keys: &[&str]) -> Result<Value, (String, String)> {
    for key in keys {
        if let Some(value) = params.get(*key) {
            if value.is_object() {
                return Ok(value.clone());
            }
            return Err((
                "invalid-params".to_owned(),
                format!("{key} must be an object"),
            ));
        }
    }
    Err((
        "invalid-params".to_owned(),
        format!("missing required param '{}'", keys[0]),
    ))
}

fn active_pasu_scope(method: &str) -> Result<String, (String, String)> {
    let profile = identity::load_profile()
        .map_err(|err| {
            (
                "nara-error".to_owned(),
                format!("{method} cannot load active PASU: {err}"),
            )
        })?
        .ok_or_else(|| {
            (
                "nara-error".to_owned(),
                format!("{method} requires an active local PASU identity"),
            )
        })?;
    let hash = identity::blake3_identity_hash(&profile);
    Ok(hash.iter().map(|byte| format!("{byte:02x}")).collect())
}

#[cfg(test)]
mod identity_augment_detect_tests {
    use super::*;
    use portal_core::personal_identity::PersonalIdentityProfile;

    const IDENTITY_HASH: &str = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";

    /// A complete 10-planet natal chart JSON (the shape `from_kerykeion_json`
    /// consumes). The specific degrees do not matter to the drift proof: with an
    /// identity transit, resonance score == |q_activity[0]| for ANY unit natal
    /// identity, so [0,1,0,0] always drifts and [1,0,0,0] always aligns.
    fn natal_json() -> String {
        let planets: Vec<String> = (0..10)
            .map(|id| {
                format!(
                    r#"{{"planet_id":{id},"name":"P{id}","degree":{deg},"retrograde":false}}"#,
                    deg = (15.0 + id as f32 * 31.5) % 360.0
                )
            })
            .collect();
        format!(r#"{{"planets":[{}]}}"#, planets.join(","))
    }

    fn fixture_profile() -> PersonalIdentityProfile {
        PersonalIdentityProfile::from_kerykeion_json(
            "protected://nara/kairos/natal/test",
            IDENTITY_HASH,
            &natal_json(),
        )
        .expect("fixture natal derives a protected identity")
    }

    fn temp_store() -> std::path::PathBuf {
        use std::sync::atomic::{AtomicU64, Ordering};
        static SEQ: AtomicU64 = AtomicU64::new(0);
        std::env::temp_dir().join(format!(
            "detect-store-{}-{}.json",
            std::process::id(),
            SEQ.fetch_add(1, Ordering::Relaxed)
        ))
    }

    // The identity quaternion — the aligned persisted fallback for tests that
    // exercise the explicit-param path (the fallback is unused when a param is
    // present).
    const ALIGNED_FALLBACK: [f32; 4] = [1.0, 0.0, 0.0, 0.0];

    fn temp_activity_store() -> std::path::PathBuf {
        use std::sync::atomic::{AtomicU64, Ordering};
        static SEQ: AtomicU64 = AtomicU64::new(0);
        std::env::temp_dir().join(format!(
            "detect-activity-{}-{}.json",
            std::process::id(),
            SEQ.fetch_add(1, Ordering::Relaxed)
        ))
    }

    #[test]
    fn detect_produces_submits_on_drift_and_appears_in_list_without_touching_identity() {
        let profile = fixture_profile();
        let before_identity = profile.q_identity;
        let store = temp_store();
        let params = json!({
            "q_activity": [0.0, 1.0, 0.0, 0.0],
            "proposal_handle": "identity-proposal://drift-test"
        });

        let out = detect_identity_proposal_core(&store, &profile, &params, ALIGNED_FALLBACK)
            .expect("detect ok");
        assert_eq!(out["produced"], json!(true));
        assert_eq!(
            out["proposal"]["proposalHandle"],
            json!("identity-proposal://drift-test")
        );
        assert_eq!(out["proposal"]["state"], json!("proposed"));

        // It surfaces in the SAME store `list` reads (panel c).
        let pending = crate::nara::identity_proposals::list_pending(&store).expect("list pending");
        assert!(pending
            .iter()
            .any(|view| view.proposal_handle == "identity-proposal://drift-test"));

        // Identity is untouched by the producer.
        assert_eq!(profile.q_identity, before_identity);
        std::fs::remove_file(&store).ok();
    }

    #[test]
    fn detect_produces_nothing_when_activity_is_aligned() {
        let profile = fixture_profile();
        let store = temp_store();
        let params = json!({ "q_activity": [1.0, 0.0, 0.0, 0.0] });

        let out = detect_identity_proposal_core(&store, &profile, &params, ALIGNED_FALLBACK)
            .expect("detect ok");
        assert_eq!(out["produced"], json!(false));
        assert!(crate::nara::identity_proposals::list_pending(&store)
            .unwrap_or_default()
            .is_empty());
        std::fs::remove_file(&store).ok();
    }

    #[test]
    fn detect_with_no_param_reads_persisted_activity() {
        let profile = fixture_profile();
        let store = temp_store();

        // A DRIFTED persisted accumulator (no q_activity param) drives a
        // proposal — this is the real accumulate→detect driver path.
        let out = detect_identity_proposal_core(
            &store,
            &profile,
            &json!({ "proposal_handle": "identity-proposal://persisted-drift" }),
            [0.0, 1.0, 0.0, 0.0],
        )
        .expect("detect ok");
        assert_eq!(out["produced"], json!(true));
        assert_eq!(
            out["proposal"]["proposalHandle"],
            json!("identity-proposal://persisted-drift")
        );
        std::fs::remove_file(&store).ok();
    }

    #[test]
    fn detect_no_param_with_aligned_persisted_produces_nothing() {
        let profile = fixture_profile();
        let store = temp_store();
        // An un-accumulated persisted accumulator is the identity quaternion —
        // aligned, so no drift proposal.
        let out = detect_identity_proposal_core(&store, &profile, &json!({}), ALIGNED_FALLBACK)
            .expect("detect ok");
        assert_eq!(out["produced"], json!(false));
        assert!(out["reason"].is_string());
        std::fs::remove_file(&store).ok();
    }

    #[test]
    fn detect_param_overrides_persisted_activity() {
        let profile = fixture_profile();
        let store = temp_store();
        // The persisted accumulator has DRIFTED, but an explicit aligned
        // q_activity param OVERRIDES it → no proposal.
        let out = detect_identity_proposal_core(
            &store,
            &profile,
            &json!({ "q_activity": [1.0, 0.0, 0.0, 0.0] }),
            [0.0, 1.0, 0.0, 0.0],
        )
        .expect("detect ok");
        assert_eq!(out["produced"], json!(false));
        std::fs::remove_file(&store).ok();
    }

    #[test]
    fn session_close_activity_sequence_accumulates_and_auto_submits_a_proposal() {
        // The AUTO-TRIGGER core: a drifting sequence of session-close activity
        // packets accumulates the persisted per-user Q_activity away from
        // identity and, once drifted below the alignment floor, auto-submits a
        // proposal that surfaces in `nara.identity.proposals.list` — WITHOUT any
        // q_activity param. Q_identity is NEVER mutated.
        let profile = fixture_profile();
        let before_identity = profile.q_identity;
        let activity_store = temp_activity_store();
        let proposal_store = temp_store();

        let mut produced_handle: Option<String> = None;
        let mut last_kairos: Option<u64> = None;
        for turn in 0..15u64 {
            // Spaced ~6h apart so the bounded kairos_delta saturates the
            // perturbation clamp — a constant coordinate + saturated delta gives
            // linear drift.
            let kairos_close = 1_700_000_000_000 + turn * 21_600_000;
            let (packet, _degraded) = session_activity_packet(
                "sess-auto",
                "protein://sealed/auto",
                kairos_close,
                Some("M4.session-activity"),
                &["I".to_owned()],
                last_kairos,
            );
            last_kairos = Some(kairos_close);
            let now = format!("2026-07-22T09:{:02}:00.000Z", turn);
            let trajectory = crate::nara::activity_trajectory::accumulate(
                &activity_store,
                std::slice::from_ref(&packet),
                SESSION_ACTIVITY_VAMA_CLASS,
                &now,
                Some(kairos_close),
            )
            .expect("accumulate ok");
            assert_eq!(trajectory.turn_count, turn + 1);

            if let Some(view) =
                auto_detect_and_submit(&proposal_store, &profile, trajectory.q_activity, &now)
            {
                produced_handle = Some(view.proposal_handle);
                break;
            }
        }

        let handle = produced_handle
            .expect("a drifting session-close sequence must auto-submit a proposal within 15 turns");
        // It surfaces in the SAME list panel (c) reads.
        let pending =
            crate::nara::identity_proposals::list_pending(&proposal_store).expect("list pending");
        assert!(pending.iter().any(|view| view.proposal_handle == handle));
        // Identity NEVER mutated by the accumulate/auto-detect path.
        assert_eq!(profile.q_identity, before_identity);

        std::fs::remove_file(&activity_store).ok();
        std::fs::remove_file(&proposal_store).ok();
    }

    #[test]
    fn session_activity_packet_degrades_honestly_without_a_coordinate() {
        let (packet, degraded) = session_activity_packet(
            "sess-x",
            "protein://sealed/x",
            2_000,
            None,
            &[],
            Some(1_000),
        );
        assert!(degraded, "absent engaged coordinate must flag the degrade");
        assert_eq!(packet.vak_address.cp, "4.0");
        assert_eq!(packet.packet_ref, "activity://session/sess-x/protein://sealed/x");

        let (packet, degraded) = session_activity_packet(
            "sess-y",
            "protein://sealed/y",
            2_000,
            Some("M3.COMP"),
            &["II".to_owned()],
            None,
        );
        assert!(!degraded, "a real coordinate must not degrade");
        assert_eq!(packet.vak_address.cp, "M3.COMP");
        // First turn (no prior kairos) → zero delta.
        assert_eq!(packet.kairos_delta, 0.0);
    }
}
