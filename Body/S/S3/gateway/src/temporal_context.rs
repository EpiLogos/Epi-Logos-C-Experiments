use std::path::{Component, Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use portal_core::KernelTemporalProjection;
use serde_json::{json, Value};

use epi_s3_gateway_contract::SessionRecord;
use epi_s3_redis_context::{CacheTier, RedisCache, RedisConfig, RedisKey};

#[derive(Debug, Clone)]
pub struct TemporalContextInputs {
    pub kairos: Value,
    pub pratibimba: Value,
    pub kernel: Value,
    pub vault_root: Option<PathBuf>,
}

impl Default for TemporalContextInputs {
    fn default() -> Self {
        Self {
            kairos: json!({
                "available": false,
                "fresh": false,
                "source": "s3.gateway.temporal_context",
                "privacy": "public-current-transit-only",
            }),
            pratibimba: json!({
                "available": false,
                "anchorId": Value::Null,
                "coordinate": "M4.4.4.4",
                "privacy": "protected-reference-only",
            }),
            kernel: kernel_surface_value(),
            vault_root: None,
        }
    }
}

pub fn context_for_record(
    state_root: &Path,
    record: &SessionRecord,
    agent_id: &str,
    inputs: TemporalContextInputs,
) -> Value {
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
        .or(inputs.vault_root)
        .or_else(|| record.vault_root.as_ref().map(PathBuf::from));
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
    let personal_anchor_id = inputs
        .pratibimba
        .pointer("/anchorId")
        .and_then(Value::as_str)
        .unwrap_or("unbound");
    let session_now_key = RedisKey::session_now(&temporal_session_id);
    let day_context_key = (day_id != "unknown-day").then(|| RedisKey::day_context(&day_id));
    let day_kairos_key = (day_id != "unknown-day").then(|| RedisKey::day_kairos(&day_id));
    let session_kairos_key = RedisKey::session_kairos(&temporal_session_id);
    let personal_orientation_key = (personal_anchor_id != "unbound")
        .then(|| RedisKey::personal_orientation(personal_anchor_id));
    let agent_orientation_key = RedisKey::agent_orientation(agent_id, &temporal_session_id);
    let blocks_key = RedisKey::from_logical(
        CacheTier::Hot,
        format!("s3:gateway:temporal:session:{temporal_session_id}:blocks"),
    );
    let blocks_projection = blocks_projection_for_record(
        state_root,
        &record.canonical_key,
        &temporal_session_id,
        blocks_key.as_str(),
    );

    json!({
        "coordinateOwner": "S3'",
        "agentAccessOwner": "S4/S5",
        "privacy": {
            "spacetimedb": "safe projection only: gateway/client/session ids, DAY/NOW, Kairos transit summaries, and protected Pratibimba anchor references",
            "redis": "tiered S3-owned runtime context with TTL; not durable identity truth",
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
        "kairos": inputs.kairos,
        "kernel": inputs.kernel,
        "now": {
            "path": now_path.as_ref().map(|path| path.display().to_string()),
            "wikilink": now_wikilink,
            "content": now_content,
        },
        "pratibimba": inputs.pratibimba,
        "blocks": blocks_projection,
        "history": {
            "archivePath": history_archive_path,
            "archiveRoot": vault_root
                .as_ref()
                .map(|root| root.join("Pratibimba/Self/Action/History").display().to_string()),
        },
        "redis": {
            "namespace": "s3:gateway:temporal",
            "sessionNowKey": session_now_key.as_str(),
            "dayContextKey": day_context_key.as_ref().map(|key| key.as_str()),
            "dayKairosKey": day_kairos_key.as_ref().map(|key| key.as_str()),
            "sessionKairosKey": session_kairos_key.as_str(),
            "personalOrientationKey": personal_orientation_key.as_ref().map(|key| key.as_str()),
            "agentOrientationKey": agent_orientation_key.as_str(),
            "blocksKey": blocks_key.as_str(),
            "ttlSeconds": CacheTier::Hot.ttl_seconds(),
            "tiers": {
                "live": CacheTier::Live.ttl_seconds(),
                "active": CacheTier::Active.ttl_seconds(),
                "hot": CacheTier::Hot.ttl_seconds(),
                "warm": CacheTier::Warm.ttl_seconds(),
                "cold": CacheTier::Cold.ttl_seconds(),
            },
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
            "redisContextKey": session_now_key.as_str(),
        },
    })
}

pub async fn hydrate_redis_from_context(context: &mut Value) -> Result<(), String> {
    let mut cache = RedisCache::connect(&RedisConfig::from_env())
        .await
        .map_err(|err| err.to_string())?;
    hydrate_redis_from_context_with_cache(context, &mut cache).await
}

pub async fn hydrate_redis_from_context_with_cache(
    context: &mut Value,
    cache: &mut RedisCache,
) -> Result<(), String> {
    let content = context
        .pointer("/now/content")
        .and_then(Value::as_str)
        .ok_or_else(|| "temporal context has no NOW content to hydrate".to_string())?
        .to_string();
    write_context_value(cache, context, "/redis/sessionNowKey", &content).await?;
    write_context_value(
        cache,
        context,
        "/redis/dayContextKey",
        &context["day"].to_string(),
    )
    .await?;
    write_context_value(
        cache,
        context,
        "/redis/agentOrientationKey",
        &context["session"].to_string(),
    )
    .await?;
    write_context_value(
        cache,
        context,
        "/redis/dayKairosKey",
        &context["kairos"].to_string(),
    )
    .await?;
    write_context_value(
        cache,
        context,
        "/redis/sessionKairosKey",
        &context["kairos"].to_string(),
    )
    .await?;
    write_context_value(
        cache,
        context,
        "/redis/personalOrientationKey",
        &context["pratibimba"].to_string(),
    )
    .await?;
    write_context_value(
        cache,
        context,
        "/redis/blocksKey",
        &context["blocks"].to_string(),
    )
    .await?;
    context["redis"]["hydrated"] = json!(true);
    Ok(())
}

pub fn kernel_surface_value() -> Value {
    let timestamp_ms = current_timestamp_ms();
    kernel_surface_value_at(timestamp_ms, timestamp_ms)
}

pub fn kernel_surface_value_at(timestamp_ms: u64, generation: u64) -> Value {
    let projection = KernelTemporalProjection::from_clock_tick(timestamp_ms, generation);
    serde_json::to_value(projection).unwrap_or_else(|_| json!({}))
}

async fn write_context_value(
    cache: &mut RedisCache,
    context: &Value,
    pointer: &str,
    value: &str,
) -> Result<(), String> {
    let Some(key) = context.pointer(pointer).and_then(Value::as_str) else {
        return Ok(());
    };
    cache
        .set_with_ttl(key, value, ttl_for_key(key))
        .await
        .map_err(|err| err.to_string())
}

fn ttl_for_key(key: &str) -> u64 {
    if key.starts_with(CacheTier::Live.prefix()) {
        CacheTier::Live.ttl_seconds()
    } else if key.starts_with(CacheTier::Active.prefix()) {
        CacheTier::Active.ttl_seconds()
    } else if key.starts_with(CacheTier::Warm.prefix()) {
        CacheTier::Warm.ttl_seconds()
    } else if key.starts_with(CacheTier::Cold.prefix()) {
        CacheTier::Cold.ttl_seconds()
    } else {
        CacheTier::Hot.ttl_seconds()
    }
}

fn blocks_projection_for_record(
    state_root: &Path,
    session_key: &str,
    temporal_session_id: &str,
    redis_key: &str,
) -> Value {
    let renderer = read_psyche_renderer_state(state_root, session_key);
    let active_block_ids = renderer
        .as_ref()
        .and_then(|value| value.get("activeBlockIds"))
        .and_then(Value::as_array)
        .map(|ids| {
            ids.iter()
                .filter_map(Value::as_str)
                .map(|id| json!(id))
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    let items = renderer
        .as_ref()
        .and_then(|value| value.get("blocks"))
        .and_then(Value::as_array)
        .map(|blocks| {
            blocks
                .iter()
                .filter(|block| is_valid_block_projection_item(block))
                .cloned()
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    let pending_verdict = renderer
        .as_ref()
        .and_then(|value| value.get("pendingVerdict"))
        .cloned()
        .unwrap_or(Value::Null);
    let current_selection = renderer
        .as_ref()
        .and_then(|value| value.get("currentSelection"))
        .cloned()
        .unwrap_or(Value::Null);
    let applied_operations = renderer
        .as_ref()
        .and_then(|value| value.get("appliedOperations"))
        .and_then(Value::as_array)
        .map(|operations| {
            operations
                .iter()
                .filter(|operation| operation.as_object().is_some())
                .cloned()
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    json!({
        "projectionOwner": "S3'",
        "agentAccessOwner": "S4/S5",
        "source": "s4'.psyche.state.renderer",
        "transport": "day-now-runtime",
        "privacy": "public/protected block wire payloads only; protected-local bodies remain handles",
        "sessionKey": session_key,
        "sessionId": temporal_session_id,
        "redisKey": redis_key,
        "ttlSeconds": CacheTier::Hot.ttl_seconds(),
        "activeBlockIds": active_block_ids,
        "currentSelection": current_selection,
        "pendingVerdict": pending_verdict,
        "appliedOperations": applied_operations,
        "items": items,
    })
}

fn read_psyche_renderer_state(state_root: &Path, session_key: &str) -> Option<Value> {
    let path = state_root
        .join("s4")
        .join("psyche")
        .join(format!("{}.json", slug_session_key(session_key)));
    let body = std::fs::read_to_string(path).ok()?;
    let state: Value = serde_json::from_str(&body).ok()?;
    state.get("renderer").cloned()
}

fn is_valid_block_projection_item(value: &Value) -> bool {
    let Some(block) = value.as_object() else {
        return false;
    };
    let has_required_strings = block.get("id").and_then(Value::as_str).is_some()
        && block.get("type").and_then(Value::as_str).is_some();
    let privacy_ok = matches!(
        block.get("privacyClass").and_then(Value::as_str),
        Some("public" | "protected" | "protected-local")
    );
    let ctx_ok = block
        .get("ctx")
        .and_then(Value::as_object)
        .map(|ctx| {
            ctx.get("cf").and_then(Value::as_str).is_some()
                && ctx.get("ct").and_then(Value::as_str).is_some()
                && ctx.get("cp").and_then(Value::as_str).is_some()
        })
        .unwrap_or(false);
    has_required_strings && privacy_ok && ctx_ok && block.contains_key("data")
}

fn slug_session_key(value: &str) -> String {
    value
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' {
                ch
            } else {
                '_'
            }
        })
        .collect()
}

fn current_timestamp_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis().min(u64::MAX as u128) as u64)
        .unwrap_or(0)
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

fn history_archive_path(vault_root: &Path, day_id: &str) -> Option<PathBuf> {
    let day = chrono_like_day(day_id)?;
    Some(
        vault_root
            .join("Pratibimba")
            .join("Self")
            .join("Action")
            .join("History")
            .join(format!("{:04}", day.year))
            .join(format!("{:02}", day.month))
            .join(format!(
                "W{}",
                iso_week_number(day.year, day.month, day.day)
            ))
            .join(format!("{:02}", day.day)),
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

#[derive(Clone, Copy)]
struct CivilDay {
    year: i32,
    month: u32,
    day: u32,
}

fn chrono_like_day(day_id: &str) -> Option<CivilDay> {
    let mut parts = day_id.split('-');
    let day = parts.next()?.parse().ok()?;
    let month = parts.next()?.parse().ok()?;
    let year = parts.next()?.parse().ok()?;
    Some(CivilDay { year, month, day })
}

fn iso_week_number(year: i32, month: u32, day: u32) -> u32 {
    // S3 only needs deterministic archive placement; S0's chrono-backed adapter
    // still owns rich calendrical presentation.
    let ordinal = day_of_year(year, month, day);
    ((ordinal + 6) / 7).max(1)
}

fn day_of_year(year: i32, month: u32, day: u32) -> u32 {
    const DAYS: [u32; 12] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let prior_month_days: u32 = DAYS[..month.saturating_sub(1) as usize].iter().sum();
    let leap_day = u32::from(month > 2 && is_leap_year(year));
    prior_month_days + day + leap_day
}

fn is_leap_year(year: i32) -> bool {
    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
}
