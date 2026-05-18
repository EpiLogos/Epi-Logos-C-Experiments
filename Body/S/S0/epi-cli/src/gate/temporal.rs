use std::path::{Component, Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use chrono::{Datelike, NaiveDate};
use portal_core::KernelTemporalProjection;
use redis::{AsyncCommands, Commands};
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
    let now_path = record.vault_now_path.as_deref().map(PathBuf::from);
    let inferred = now_path.as_deref().and_then(infer_now_identity);
    let day_id = record
        .day_id
        .clone()
        .or_else(|| inferred.as_ref().map(|identity| identity.day_id.clone()))
        .unwrap_or_else(|| "unknown-day".to_string());
    let temporal_session_id = inferred
        .as_ref()
        .map(|identity| identity.session_id.clone())
        .unwrap_or_else(|| record.session_id.clone());
    let vault_root = inferred
        .as_ref()
        .map(|identity| identity.vault_root.clone())
        .or_else(vault_root_from_env);
    let role = epi_s3_gateway_contract::RedisTemporalContextRole::session_now();
    let history_archive_path = vault_root
        .as_deref()
        .and_then(|root| history_archive_path(root, &day_id))
        .map(|path| path.display().to_string());
    let now_wikilink = match (vault_root.as_deref(), now_path.as_deref()) {
        (Some(root), Some(path)) => Some(now_wikilink(root, path, &temporal_session_id)),
        _ => None,
    };
    let now_content = now_path
        .as_deref()
        .and_then(|path| std::fs::read_to_string(path).ok());
    let kairos_surface = kairos_surface_value(&day_id);
    let pratibimba_surface = pratibimba_surface_value();
    let personal_anchor_id = pratibimba_surface
        .pointer("/anchorId")
        .and_then(Value::as_str)
        .unwrap_or("unbound");
    let kernel_surface = kernel_surface_value();

    json!({
        "coordinateOwner": "S3'",
        "agentAccessOwner": "S4/S5",
        "privacy": {
            "spacetimedb": "safe projection only: gateway/client/session ids, DAY/NOW, Kairos transit summaries, and protected Pratibimba anchor references",
            "redis": "hot local temporal context with TTL; not durable identity truth",
            "neo4jGraphiti": "protected local PersonalNexus, journal, identity, and episodic memory substrate",
        },
        "session": {
            "canonicalKey": record.canonical_key,
            "sessionId": temporal_session_id,
            "recordSessionId": record.session_id,
            "aliases": record.aliases,
            "activeAgentId": record.active_agent_id,
            "requestedAgentId": agent_id,
            "resourceLoaderId": record.resource_loader_id,
            "runtimeCwd": record.runtime_cwd,
            "sourceSessionKey": record.source_session_key,
            "sourceSessionKind": record.source_session_kind,
            "channel": record.channel,
            "subagentLineage": record.subagent_lineage,
        },
        "day": {
            "dayId": day_id,
            "wikilink": if day_id == "unknown-day" {
                Value::Null
            } else {
                Value::String(format!("[[{day_id}]]"))
            },
        },
        "kairos": kairos_surface,
        "kernel": kernel_surface,
        "now": {
            "path": now_path.as_ref().map(|path| path.display().to_string()),
            "wikilink": now_wikilink,
            "content": now_content,
        },
        "pratibimba": pratibimba_surface,
        "history": {
            "archivePath": history_archive_path,
            "archiveRoot": vault_root
                .as_ref()
                .map(|root| root.join("Pratibimba/Self/Action/History").display().to_string()),
        },
        "redis": {
            "namespace": role.redis_namespace,
            "sessionNowKey": role.session_now_key(&temporal_session_id),
            "dayContextKey": if day_id == "unknown-day" {
                Value::Null
            } else {
                Value::String(role.day_context_key(&day_id))
            },
            "dayKairosKey": if day_id == "unknown-day" {
                Value::Null
            } else {
                Value::String(role.day_kairos_key(&day_id))
            },
            "sessionKairosKey": role.session_kairos_key(&temporal_session_id),
            "personalOrientationKey": if personal_anchor_id == "unbound" {
                Value::Null
            } else {
                Value::String(role.personal_orientation_key(personal_anchor_id))
            },
            "agentOrientationKey": role.agent_orientation_key(agent_id, &temporal_session_id),
            "ttlSeconds": role.ttl_seconds,
            "hydrated": false,
        },
        "spacetimedb": {
            "projectionTable": "session_surface",
            "kairosProjectionTable": "kairos_surface",
            "eventTable": "temporal_event",
            "stateRoot": state_root.display().to_string(),
        },
        "graphiti": {
            "runtimeOwner": "S3'",
            "invocationOwner": "S5/S5'",
            "sessionArcId": format!("day:{day_id}:session:{temporal_session_id}"),
            "namespaceRef": if personal_anchor_id == "unbound" {
                Value::Null
            } else {
                Value::String(personal_anchor_id.to_owned())
            },
            "redisContextKey": role.session_now_key(&temporal_session_id),
        },
    })
}

pub fn kernel_surface_value() -> Value {
    let timestamp_ms = current_timestamp_ms();
    kernel_surface_value_at(timestamp_ms, timestamp_ms)
}

pub fn kernel_surface_value_at(timestamp_ms: u64, generation: u64) -> Value {
    let projection = KernelTemporalProjection::from_clock_tick(timestamp_ms, generation);
    serde_json::to_value(projection).unwrap_or_else(|_| json!({}))
}

fn current_timestamp_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis().min(u64::MAX as u128) as u64)
        .unwrap_or(0)
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
    let content = context
        .pointer("/now/content")
        .and_then(Value::as_str)
        .ok_or_else(|| "temporal context has no NOW content to hydrate".to_string())?
        .to_string();
    let ttl = context
        .pointer("/redis/ttlSeconds")
        .and_then(Value::as_u64)
        .ok_or_else(|| "temporal context missing Redis TTL".to_string())?;
    let session_key = context
        .pointer("/redis/sessionNowKey")
        .and_then(Value::as_str)
        .ok_or_else(|| "temporal context missing Redis session key".to_string())?
        .to_string();
    let day_key = context
        .pointer("/redis/dayContextKey")
        .and_then(Value::as_str)
        .map(str::to_string);
    let agent_key = context
        .pointer("/redis/agentOrientationKey")
        .and_then(Value::as_str)
        .map(str::to_string);
    let day_kairos_key = context
        .pointer("/redis/dayKairosKey")
        .and_then(Value::as_str)
        .map(str::to_string);
    let session_kairos_key = context
        .pointer("/redis/sessionKairosKey")
        .and_then(Value::as_str)
        .map(str::to_string);
    let personal_orientation_key = context
        .pointer("/redis/personalOrientationKey")
        .and_then(Value::as_str)
        .map(str::to_string);
    let redis_uri =
        std::env::var("EPILOGOS_REDIS_URI").unwrap_or_else(|_| "redis://localhost:6379".into());
    let client = redis::Client::open(redis_uri.as_str()).map_err(|err| err.to_string())?;
    let mut conn = client.get_connection().map_err(|err| err.to_string())?;
    conn.set_ex::<_, _, ()>(&session_key, content, ttl)
        .map_err(|err| err.to_string())?;

    if let Some(day_key) = day_key {
        conn.set_ex::<_, _, ()>(&day_key, context["day"].to_string(), ttl)
            .map_err(|err| err.to_string())?;
    }
    if let Some(agent_key) = agent_key {
        conn.set_ex::<_, _, ()>(&agent_key, context["session"].to_string(), ttl)
            .map_err(|err| err.to_string())?;
    }
    if let Some(day_kairos_key) = day_kairos_key {
        conn.set_ex::<_, _, ()>(&day_kairos_key, context["kairos"].to_string(), ttl)
            .map_err(|err| err.to_string())?;
    }
    if let Some(session_kairos_key) = session_kairos_key {
        conn.set_ex::<_, _, ()>(&session_kairos_key, context["kairos"].to_string(), ttl)
            .map_err(|err| err.to_string())?;
    }
    if let Some(personal_orientation_key) = personal_orientation_key {
        conn.set_ex::<_, _, ()>(
            &personal_orientation_key,
            context["pratibimba"].to_string(),
            ttl,
        )
        .map_err(|err| err.to_string())?;
    }
    context["redis"]["hydrated"] = json!(true);
    Ok(())
}

pub async fn hydrate_redis_from_context(context: &mut Value) -> Result<(), String> {
    let content = context
        .pointer("/now/content")
        .and_then(Value::as_str)
        .ok_or_else(|| "temporal context has no NOW content to hydrate".to_string())?
        .to_string();
    let ttl = context
        .pointer("/redis/ttlSeconds")
        .and_then(Value::as_u64)
        .ok_or_else(|| "temporal context missing Redis TTL".to_string())?;
    let session_key = context
        .pointer("/redis/sessionNowKey")
        .and_then(Value::as_str)
        .ok_or_else(|| "temporal context missing Redis session key".to_string())?
        .to_string();
    let day_key = context
        .pointer("/redis/dayContextKey")
        .and_then(Value::as_str)
        .map(str::to_string);
    let agent_key = context
        .pointer("/redis/agentOrientationKey")
        .and_then(Value::as_str)
        .map(str::to_string);
    let day_kairos_key = context
        .pointer("/redis/dayKairosKey")
        .and_then(Value::as_str)
        .map(str::to_string);
    let session_kairos_key = context
        .pointer("/redis/sessionKairosKey")
        .and_then(Value::as_str)
        .map(str::to_string);
    let personal_orientation_key = context
        .pointer("/redis/personalOrientationKey")
        .and_then(Value::as_str)
        .map(str::to_string);
    let redis_uri =
        std::env::var("EPILOGOS_REDIS_URI").unwrap_or_else(|_| "redis://localhost:6379".into());
    let client = redis::Client::open(redis_uri.as_str()).map_err(|err| err.to_string())?;
    let mut conn = client
        .get_multiplexed_async_connection()
        .await
        .map_err(|err| err.to_string())?;
    conn.set_ex::<_, _, ()>(&session_key, content, ttl)
        .await
        .map_err(|err| err.to_string())?;

    if let Some(day_key) = day_key {
        conn.set_ex::<_, _, ()>(&day_key, context["day"].to_string(), ttl)
            .await
            .map_err(|err| err.to_string())?;
    }
    if let Some(agent_key) = agent_key {
        conn.set_ex::<_, _, ()>(&agent_key, context["session"].to_string(), ttl)
            .await
            .map_err(|err| err.to_string())?;
    }
    if let Some(day_kairos_key) = day_kairos_key {
        conn.set_ex::<_, _, ()>(&day_kairos_key, context["kairos"].to_string(), ttl)
            .await
            .map_err(|err| err.to_string())?;
    }
    if let Some(session_kairos_key) = session_kairos_key {
        conn.set_ex::<_, _, ()>(&session_kairos_key, context["kairos"].to_string(), ttl)
            .await
            .map_err(|err| err.to_string())?;
    }
    if let Some(personal_orientation_key) = personal_orientation_key {
        conn.set_ex::<_, _, ()>(
            &personal_orientation_key,
            context["pratibimba"].to_string(),
            ttl,
        )
        .await
        .map_err(|err| err.to_string())?;
    }
    context["redis"]["hydrated"] = json!(true);
    Ok(())
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

#[derive(Debug)]
struct NowIdentity {
    vault_root: PathBuf,
    day_id: String,
    session_id: String,
}

fn infer_now_identity(path: &Path) -> Option<NowIdentity> {
    let parts = path
        .components()
        .filter_map(|component| match component {
            Component::Normal(part) => part.to_str().map(str::to_string),
            Component::RootDir => Some("/".to_string()),
            _ => None,
        })
        .collect::<Vec<_>>();
    let empty_idx = parts.iter().position(|part| part == "Empty")?;
    if parts.get(empty_idx + 1).map(String::as_str) != Some("Present") {
        return None;
    }
    let day_id = parts.get(empty_idx + 2)?.clone();
    let session_id = parts.get(empty_idx + 3)?.clone();
    let mut root = PathBuf::new();
    for part in &parts[..empty_idx] {
        root.push(part);
    }
    Some(NowIdentity {
        vault_root: root,
        day_id,
        session_id,
    })
}

fn vault_root_from_env() -> Option<PathBuf> {
    std::env::var("EPILOGOS_VAULT")
        .ok()
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
}

fn history_archive_path(vault_root: &Path, day_id: &str) -> Option<PathBuf> {
    let day = NaiveDate::parse_from_str(day_id, "%d-%m-%Y").ok()?;
    Some(
        vault_root
            .join("Pratibimba")
            .join("Self")
            .join("Action")
            .join("History")
            .join(day.format("%Y").to_string())
            .join(day.format("%m").to_string())
            .join(format!("W{}", day.iso_week().week()))
            .join(day.format("%d").to_string()),
    )
}

fn now_wikilink(vault_root: &Path, now_path: &Path, session_id: &str) -> String {
    let relative = now_path
        .strip_prefix(vault_root)
        .unwrap_or(now_path)
        .with_extension("");
    format!(
        "[[{}|NOW {}]]",
        relative.display().to_string().replace('\\', "/"),
        session_id
    )
}
