//! Nara Gateway RPC handler — dispatches all nara.* methods
//!
//! Bridges the CLI nara module into the gateway's JSON-RPC dispatch.
//! Every method returns JSON (json=true) since the gateway is a structured transport.

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
        "nara.kairos.sync" => cli_to_rpc(kairos::sync_current()),
        "nara.kairos.decan" => {
            let k =
                kairos::require_temporal_authority().map_err(|e| ("nara-error".to_owned(), e))?;
            Ok(json!({"decan": k.active_decan, "element": k.dominant_element}))
        }
        "nara.kairos.resonance" => deferred_stub("nara.kairos.resonance"),
        "nara.kairos.project" => deferred_stub("nara.kairos.project"),

        // ── Identity ────────────────────────────────────────────────────
        "nara.identity.get" => cli_to_rpc(identity::show(true)),
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
            cli_to_rpc(oracle::cast(&system, &question, yes, method.as_deref()))
        }
        "nara.oracle.decan" => {
            let k =
                kairos::require_temporal_authority().map_err(|e| ("nara-error".to_owned(), e))?;
            Ok(json!({"decan": k.active_decan, "element": k.dominant_element}))
        }
        "nara.oracle.history" => cli_to_rpc(oracle::show_history()),
        "nara.oracle.payload" => deferred_stub("nara.oracle.payload"),
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
            cli_to_rpc(medicine::prescribe(&context))
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
            cli_to_rpc(logos::stage(stage, date.as_deref(), true))
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
