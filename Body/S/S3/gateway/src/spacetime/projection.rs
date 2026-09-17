use crate::spacetime::identity::{
    global_temporal_surface_key, redis_global_context_key, row_bool, row_string, row_u64,
    session_id_from_now_path,
};

use epi_s3_gateway_contract::SpacetimeProjectionRows;
use serde_json::{json, Value};

// projection context hydration (SQL + native WebSocket)
// =============================================================================

pub fn projection_context_from_sql_result(
    result: &Value,
    agent_id: &str,
) -> Result<Option<Value>, String> {
    let statements = result.as_array().ok_or_else(|| {
        "spacetimedb sql response must be an array of statement results".to_owned()
    })?;
    let Some(session_row) = statements
        .first()
        .and_then(|statement| statement.get("rows"))
        .and_then(Value::as_array)
        .and_then(|rows| rows.first())
    else {
        return Ok(None);
    };
    let kairos_row = statements
        .get(1)
        .and_then(|statement| statement.get("rows"))
        .and_then(Value::as_array)
        .and_then(|rows| rows.first());
    let global_row = statements
        .get(2)
        .and_then(|statement| statement.get("rows"))
        .and_then(Value::as_array)
        .and_then(|rows| rows.first());

    let session_key = row_string(session_row, "session_key", "sessionKey", "");
    let day_id = row_string(session_row, "day_id", "dayId", "unknown-day");
    let now_path = row_string(session_row, "now_path", "nowPath", "");
    let now_wikilink = row_string(session_row, "now_wikilink", "nowWikilink", "");
    let history_archive_path = row_string(
        session_row,
        "history_archive_path",
        "historyArchivePath",
        "",
    );
    let redis_session_now_key = row_string(
        session_row,
        "redis_session_now_key",
        "redisSessionNowKey",
        "",
    );
    let redis_day_context_key = row_string(
        session_row,
        "redis_day_context_key",
        "redisDayContextKey",
        "",
    );
    let graphiti_arc_id = row_string(session_row, "graphiti_arc_id", "graphitiArcId", "");
    let pratibimba_anchor_ref = row_string(
        session_row,
        "pratibimba_anchor_ref",
        "pratibimbaAnchorRef",
        "",
    );
    let active_agent_id = row_string(session_row, "active_agent_id", "activeAgentId", "");
    let resource_loader_id = row_string(session_row, "resource_loader_id", "resourceLoaderId", "");
    let runtime_cwd = row_string(session_row, "runtime_cwd", "runtimeCwd", "");
    let source_session_key = row_string(session_row, "source_session_key", "sourceSessionKey", "");
    let source_session_kind =
        row_string(session_row, "source_session_kind", "sourceSessionKind", "");
    let graphiti_namespace_ref = pratibimba_anchor_ref.clone();
    let _kairos_snapshot_id = row_string(session_row, "kairos_snapshot_id", "kairosSnapshotId", "");
    let session_id = session_id_from_now_path(&now_path).unwrap_or_else(|| session_key.to_owned());
    let global_surface_key = global_row
        .map(|row| row_string(row, "surface_key", "surfaceKey", ""))
        .unwrap_or_else(|| {
            global_temporal_surface_key(
                &row_string(session_row, "installation_id", "installationId", "local"),
                &row_string(session_row, "gateway_id", "gatewayId", "gateway-main"),
                &session_key,
            )
        });
    let global_redis_key = global_row
        .map(|row| row_string(row, "redis_global_context_key", "redisGlobalContextKey", ""))
        .unwrap_or_else(|| {
            redis_global_context_key(
                &row_string(session_row, "installation_id", "installationId", "local"),
                &row_string(session_row, "gateway_id", "gatewayId", "gateway-main"),
                &day_id,
            )
        });
    let global_graphiti_namespace = global_row
        .map(|row| row_string(row, "graphiti_namespace_ref", "graphitiNamespaceRef", ""))
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| graphiti_namespace_ref.clone());
    let global_graphiti_arc = global_row
        .map(|row| row_string(row, "graphiti_session_arc_id", "graphitiSessionArcId", ""))
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| graphiti_arc_id.clone());
    let kernel_projection = kernel_projection_from_rows(session_row, global_row);

    let planets = kairos_row
        .map(|row| row_string(row, "planets_json", "planetsJson", "[]"))
        .and_then(|raw| serde_json::from_str::<Value>(&raw).ok())
        .unwrap_or_else(|| json!([]));

    Ok(Some(json!({
        "coordinateOwner": "S3'",
        "agentAccessOwner": "S4/S5",
        "session": {
            "canonicalKey": session_key,
            "sessionId": session_id,
            "activeAgentId": if active_agent_id.is_empty() {
                Value::Null
            } else {
                Value::String(active_agent_id)
            },
            "resourceLoaderId": if resource_loader_id.is_empty() {
                Value::Null
            } else {
                Value::String(resource_loader_id)
            },
            "runtimeCwd": if runtime_cwd.is_empty() {
                Value::Null
            } else {
                Value::String(runtime_cwd)
            },
            "sourceSessionKey": if source_session_key.is_empty() {
                Value::Null
            } else {
                Value::String(source_session_key)
            },
            "sourceSessionKind": if source_session_kind.is_empty() {
                Value::Null
            } else {
                Value::String(source_session_kind)
            },
            "requestedAgentId": agent_id,
        },
        "day": {
            "dayId": day_id,
            "wikilink": if day_id == "unknown-day" {
                Value::Null
            } else {
                Value::String(format!("[[{day_id}]]"))
            },
        },
        "now": {
            "path": now_path,
            "wikilink": now_wikilink,
            "content": Value::Null,
        },
        "history": {
            "archivePath": history_archive_path,
        },
        "kernel": kernel_projection.clone(),
        "redis": {
            "namespace": "s3:gateway:temporal",
            "sessionNowKey": redis_session_now_key,
            "dayContextKey": redis_day_context_key,
            "hydrated": true,
        },
        "spacetimedb": {
            "projectionSource": "http-sql-poll",
            "projectionTable": "session_surface",
            "kairosProjectionTable": "kairos_surface",
            "globalProjectionTable": "global_temporal_surface",
        },
        "globalTemporal": {
            "coordinateOwner": "S3'",
            "agentAccessOwner": "S4/S5",
            "projectionTable": "global_temporal_surface",
            "surfaceKey": global_surface_key,
            "installationId": global_row
                .map(|row| row_string(row, "installation_id", "installationId", ""))
                .unwrap_or_else(|| row_string(session_row, "installation_id", "installationId", "")),
            "gatewayId": global_row
                .map(|row| row_string(row, "gateway_id", "gatewayId", ""))
                .unwrap_or_else(|| row_string(session_row, "gateway_id", "gatewayId", "")),
            "sessionKey": session_key,
            "dayId": global_row
                .map(|row| row_string(row, "day_id", "dayId", "unknown-day"))
                .unwrap_or_else(|| day_id.clone()),
            "dayWikilink": global_row
                .map(|row| row_string(row, "day_wikilink", "dayWikilink", ""))
                .filter(|value| !value.is_empty())
                .unwrap_or_else(|| if day_id == "unknown-day" { String::new() } else { format!("[[{day_id}]]") }),
            "nowPath": global_row
                .map(|row| row_string(row, "now_path", "nowPath", ""))
                .filter(|value| !value.is_empty())
                .unwrap_or_else(|| now_path.clone()),
            "nowWikilink": global_row
                .map(|row| row_string(row, "now_wikilink", "nowWikilink", ""))
                .filter(|value| !value.is_empty())
                .unwrap_or_else(|| now_wikilink.clone()),
            "nowLineageKey": global_row
                .map(|row| row_string(row, "now_lineage_key", "nowLineageKey", ""))
                .filter(|value| !value.is_empty())
                .unwrap_or_else(|| session_key.clone()),
            "historyArchivePath": global_row
                .map(|row| row_string(row, "history_archive_path", "historyArchivePath", ""))
                .filter(|value| !value.is_empty())
                .unwrap_or_else(|| history_archive_path.clone()),
            "redisGlobalContextKey": global_redis_key,
            "graphitiNamespaceRef": if global_graphiti_namespace.is_empty() {
                Value::Null
            } else {
                Value::String(global_graphiti_namespace)
            },
            "graphitiSessionArcId": global_graphiti_arc,
            "pratibimbaAnchorRef": if pratibimba_anchor_ref.is_empty() {
                Value::Null
            } else {
                Value::String(pratibimba_anchor_ref.clone())
            },
            "kairosSnapshotId": global_row
                .map(|row| row_string(row, "kairos_snapshot_id", "kairosSnapshotId", ""))
                .filter(|value| !value.is_empty())
                .unwrap_or_else(|| row_string(session_row, "kairos_snapshot_id", "kairosSnapshotId", "")),
            "kernelProjectionJson": kernel_projection.to_string(),
            "privacy": global_row
                .map(|row| row_string(row, "privacy_class", "privacyClass", "safe-live-projection"))
                .unwrap_or_else(|| "safe-live-projection".to_owned()),
        },
        "kairos": {
            "available": kairos_row
                .map(|row| row_bool(row, "available", "available", false))
                .unwrap_or(false),
            "fresh": kairos_row
                .map(|row| row_bool(row, "fresh", "fresh", false))
                .unwrap_or(false),
            "source": kairos_row
                .map(|row| row_string(row, "source", "source", "nara.kairos.current"))
                .unwrap_or_else(|| "nara.kairos.current".to_owned()),
            "dominantSign": kairos_row
                .map(|row| row_u64(row, "dominant_sign", "dominantSign", 0))
                .unwrap_or(0),
            "dominantElement": kairos_row
                .map(|row| row_u64(row, "dominant_element", "dominantElement", 0))
                .unwrap_or(0),
            "activeDecan": kairos_row
                .map(|row| row_u64(row, "active_decan", "activeDecan", 0))
                .unwrap_or(0),
            "activeTattva": kairos_row
                .map(|row| row_u64(row, "active_tattva", "activeTattva", 0))
                .unwrap_or(0),
            "planets": planets,
            "privacy": "public-current-transit-only",
        },
        "pratibimba": {
            "available": !pratibimba_anchor_ref.is_empty(),
            "anchorId": if pratibimba_anchor_ref.is_empty() {
                Value::Null
            } else {
                Value::String(pratibimba_anchor_ref.to_owned())
            },
            "coordinate": "M4.4.4.4",
            "graphitiNamespaceRef": if pratibimba_anchor_ref.is_empty() {
                Value::Null
            } else {
                Value::String(pratibimba_anchor_ref)
            },
            "layerPresenceSummary": {
                "presentCount": Value::Null,
                "detail": "projection-anchor-only",
                "protectedSource": "local-nara-profile",
            },
            "localProtectedGraphOwner": "S2/S5",
            "stewardshipOwner": "S5'",
            "mutationOwner": "Epii/user validation",
            "mutationBoundary": "identity-affecting changes require Epii/user validation; live projections carry references only",
            "privacy": "protected-reference-only",
        },
        "graphiti": {
            "runtimeOwner": "S3'",
            "invocationOwner": "S5/S5'",
            "sessionArcId": graphiti_arc_id,
            "namespaceRef": if graphiti_arc_id.is_empty() {
                Value::Null
            } else {
                Value::String(graphiti_namespace_ref)
            },
        },
    })))
}

pub fn projection_context_from_subscription_message(
    message: &Value,
    agent_id: &str,
) -> Result<Option<Value>, String> {
    let rows = SpacetimeProjectionRows::from_subscription_message(message)?;
    let Some(session_row) = rows.session else {
        return Ok(None);
    };
    let result = json!([
        {
            "schema": {},
            "rows": [session_row]
        },
        {
            "schema": {},
            "rows": rows.kairos.into_iter().collect::<Vec<_>>()
        },
        {
            "schema": {},
            "rows": rows.global.into_iter().collect::<Vec<_>>()
        }
    ]);
    projection_context_from_sql_result(&result, agent_id).map(|context| {
        context.map(|mut value| {
            value["spacetimedb"]["projectionSource"] = json!("native-websocket");
            value
        })
    })
}

// =============================================================================
fn kernel_projection_from_rows(session_row: &Value, global_row: Option<&Value>) -> Value {
    for row in [global_row, Some(session_row)].into_iter().flatten() {
        let raw = row_string(row, "kernel_projection_json", "kernelProjectionJson", "");
        if raw.trim().is_empty() {
            continue;
        }
        if let Ok(value) = serde_json::from_str::<Value>(&raw) {
            if value.is_object() {
                return value;
            }
        }
    }
    // Fallback empty kernel projection when no row carries one; the S0
    // wrapper supplies a temporal::kernel_surface_value() before reducer
    // calls, so this is only used when decoding stale or partial rows.
    json!({
        "coordinateOwner": "S0/QL-meta",
        "projectionOwner": "S3'",
        "privacy": "safe-public-current-kernel-tick",
        "computationSource": "portal-core::KernelProjection",
        "generation": 0,
    })
}
