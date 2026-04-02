//! Nara Gateway RPC handler — dispatches all nara.* methods
//!
//! Bridges the CLI nara module into the gateway's JSON-RPC dispatch.
//! Every method returns JSON (json=true) since the gateway is a structured transport.

use chrono::Utc;
use serde_json::{json, Value};

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

fn opt_f32(params: &Value, key: &str) -> Option<f32> {
    params.get(key).and_then(|v| v.as_f64()).map(|n| n as f32)
}

fn deferred_stub(method: &str) -> Result<Value, (String, String)> {
    Ok(json!({"status": format!("{}: deferred to agent pipeline", method)}))
}

/// Return a SpacetimePresence client pointed at the default local SpacetimeDB URL.
/// Default: http://localhost:3000 (overridable via SPACETIMEDB_URL env var).
fn spacetime_client() -> crate::gate::spacetimedb_bridge::SpacetimePresence {
    let url = std::env::var("SPACETIMEDB_URL")
        .unwrap_or_else(|_| "http://localhost:3000".to_owned());
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

        // ── Clock ───────────────────────────────────────────────────────
        "nara.clock.status" => cli_to_rpc(clock::show(true)),
        "nara.clock.tick" => {
            // tick = re-show (clock has no separate tick fn)
            cli_to_rpc(clock::show(true))
        }

        // ── Kairos ──────────────────────────────────────────────────────
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
            use crate::nara::identity::{load_profile, hash_to_clock_position_from_preview};
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
                Ok(None) => cli_to_rpc(Err("No identity profile found — run `epi nara identity set`".to_string())),
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
                        .map(|n| n.saturating_sub(1)) // display is 1-indexed
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
                let total = payload.pp.abs() + payload.nn.abs() + payload.np.abs() + payload.pn.abs();
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
                    let day_key = date.unwrap_or_else(|| {
                        Utc::now().format("%Y-%m-%d").to_string()
                    });
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
