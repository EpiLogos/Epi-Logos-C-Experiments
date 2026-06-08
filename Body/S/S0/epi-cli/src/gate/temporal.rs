use std::path::{Path, PathBuf};

use epi_s3_gateway::temporal_context as s3_temporal_context;
use epi_s3_gateway::temporal_context::TemporalContextInputs;
use serde_json::{json, Value};

use crate::nara::{identity, kairos};

use super::sessions::{SessionRecord, SessionStore};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RedisHydrationMode {
    Off,
    BestEffort,
    Required,
}

pub fn context_value(
    state_root: &Path,
    store: &SessionStore,
    session_key: &str,
    agent_id: &str,
) -> Result<Value, String> {
    let record = store.resolve(session_key)?;
    Ok(context_for_record(state_root, &record, agent_id))
}

pub fn context_for_record(state_root: &Path, record: &SessionRecord, agent_id: &str) -> Value {
    s3_temporal_context::context_for_record(
        state_root,
        record,
        agent_id,
        TemporalContextInputs {
            kairos: kairos_surface_value(record.day_id.as_deref().unwrap_or("unknown-day")),
            pratibimba: pratibimba_surface_value(),
            kernel: kernel_surface_value(),
            vault_root: vault_root_from_env(),
        },
    )
}

pub fn kernel_surface_value() -> Value {
    s3_temporal_context::kernel_surface_value()
}

pub fn kernel_surface_value_at(timestamp_ms: u64, generation: u64) -> Value {
    s3_temporal_context::kernel_surface_value_at(timestamp_ms, generation)
}

pub fn hydrate_redis_for_record_on_propagation(
    state_root: &Path,
    record: &SessionRecord,
    agent_id: &str,
) -> Result<Option<Value>, String> {
    match redis_hydration_mode() {
        RedisHydrationMode::Off => Ok(None),
        RedisHydrationMode::BestEffort => {
            let mut context = context_for_record(state_root, record, agent_id);
            if let Err(error) = hydrate_redis_from_context_blocking(&mut context) {
                context["redis"]["hydrationError"] = json!(error);
            }
            Ok(Some(context))
        }
        RedisHydrationMode::Required => {
            let mut context = context_for_record(state_root, record, agent_id);
            hydrate_redis_from_context_blocking(&mut context)?;
            Ok(Some(context))
        }
    }
}

pub fn redis_hydration_mode() -> RedisHydrationMode {
    match std::env::var("EPI_GATE_SESSION_REDIS_HYDRATION") {
        Ok(value) => match value.trim().to_ascii_lowercase().as_str() {
            "required" | "strict" | "1" | "true" | "yes" => RedisHydrationMode::Required,
            "best-effort" | "best_effort" | "best" => RedisHydrationMode::BestEffort,
            "off" | "false" | "0" | "no" | "" => RedisHydrationMode::Off,
            _ => RedisHydrationMode::Off,
        },
        Err(_) => RedisHydrationMode::Off,
    }
}

pub fn hydrate_redis_from_context_blocking(context: &mut Value) -> Result<(), String> {
    let context_value = context.clone();
    let hydrated = if tokio::runtime::Handle::try_current().is_ok() {
        std::thread::spawn(move || hydrate_redis_context_on_new_runtime(context_value))
            .join()
            .map_err(|_| "Redis hydration worker thread panicked".to_string())??
    } else {
        hydrate_redis_context_on_new_runtime(context_value)?
    };
    *context = hydrated;
    Ok(())
}

fn hydrate_redis_context_on_new_runtime(mut context: Value) -> Result<Value, String> {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .map_err(|err| err.to_string())?;
    runtime.block_on(s3_temporal_context::hydrate_redis_from_context(
        &mut context,
    ))?;
    Ok(context)
}

pub async fn hydrate_redis_from_context(context: &mut Value) -> Result<(), String> {
    s3_temporal_context::hydrate_redis_from_context(context).await
}

fn kairos_surface_value(day_id: &str) -> Value {
    let fresh = kairos::is_current_fresh();
    match kairos::load_current() {
        Ok(Some(snapshot)) => json!({
            "available": true,
            "fresh": fresh,
            "source": "nara.kairos.current",
            "dayId": if day_id == "unknown-day" { Value::Null } else { Value::String(day_id.to_owned()) },
            "dominantSign": snapshot.dominant_sign,
            "dominantElement": snapshot.dominant_element,
            "activeDecan": snapshot.active_decan,
            "activeTattva": snapshot.active_tattva,
            "planets": snapshot.planets,
            "privacy": "public-current-transit-only",
        }),
        Ok(None) => json!({
            "available": false,
            "fresh": false,
            "source": "nara.kairos.current",
            "dayId": if day_id == "unknown-day" { Value::Null } else { Value::String(day_id.to_owned()) },
            "reason": "no cached Kairos snapshot; run `epi nara kairos sync`",
            "privacy": "public-current-transit-only",
        }),
        Err(error) => json!({
            "available": false,
            "fresh": false,
            "source": "nara.kairos.current",
            "dayId": if day_id == "unknown-day" { Value::Null } else { Value::String(day_id.to_owned()) },
            "error": error,
            "privacy": "public-current-transit-only",
        }),
    }
}

pub fn pratibimba_surface_value() -> Value {
    match identity::load_profile() {
        Ok(Some(profile)) => {
            let anchor_id = format!("pratibimba-{}", profile.hash_preview);
            json!({
                "available": true,
                "anchorId": anchor_id,
                "coordinate": "M4.4.4.4",
                "graphitiNamespaceRef": anchor_id,
                "layerPresenceSummary": {
                    "presentCount": profile.layer_presence_mask.count_ones(),
                    "detail": "count-only",
                    "protectedSource": "local-nara-profile",
                },
                "localProtectedGraphOwner": "S2/S5",
                "stewardshipOwner": "S5'",
                "mutationOwner": "Epii/user validation",
                "mutationBoundary": "identity-affecting changes require Epii/user validation; live projections carry references only",
                "privacy": "protected-reference-only",
            })
        }
        Ok(None) => json!({
            "available": false,
            "anchorId": Value::Null,
            "coordinate": "M4.4.4.4",
            "graphitiNamespaceRef": Value::Null,
            "layerPresenceSummary": {
                "presentCount": 0,
                "detail": "count-only",
                "protectedSource": "local-nara-profile",
            },
            "reason": "no Nara profile found",
            "localProtectedGraphOwner": "S2/S5",
            "stewardshipOwner": "S5'",
            "mutationOwner": "Epii/user validation",
            "mutationBoundary": "identity-affecting changes require Epii/user validation; live projections carry references only",
            "privacy": "protected-reference-only",
        }),
        Err(error) => json!({
            "available": false,
            "anchorId": Value::Null,
            "coordinate": "M4.4.4.4",
            "graphitiNamespaceRef": Value::Null,
            "layerPresenceSummary": {
                "presentCount": 0,
                "detail": "count-only",
                "protectedSource": "local-nara-profile",
            },
            "error": error,
            "localProtectedGraphOwner": "S2/S5",
            "stewardshipOwner": "S5'",
            "mutationOwner": "Epii/user validation",
            "mutationBoundary": "identity-affecting changes require Epii/user validation; live projections carry references only",
            "privacy": "protected-reference-only",
        }),
    }
}

fn vault_root_from_env() -> Option<PathBuf> {
    std::env::var("EPILOGOS_VAULT")
        .ok()
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
}
