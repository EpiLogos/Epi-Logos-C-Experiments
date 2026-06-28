use crate::spacetime::resync::{SpacetimeProjectionConnectionState, SpacetimeProjectionUpdate};

use epi_s3_gateway_contract::{
    SpacetimeFallbackPolicy, SpacetimeProjectionPlan, SPACETIME_FALLBACK_ACTIVE,
    SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
};
use serde_json::{json, Value};

// 13.T4 envelope helpers — proves both s3'.temporal.subscribe AND
// s3'.spacetime.subscribe emit the same SpacetimeSubscriptionLifecycleEnvelope
// type with method carried verbatim.
// =============================================================================

/// Project the resync update into the canonical S3-owned
/// `SpacetimeSubscriptionLifecycleEnvelope`. Both subscribe methods share
/// this projection: pass the desired `method` (one of
/// `SPACETIME_SUBSCRIBE_METHOD`, `SPACETIME_SUBSCRIBE_ALIAS_METHOD`) and the
/// update is wrapped under the same envelope type.
pub fn lifecycle_envelope_from_update(
    plan: &SpacetimeProjectionPlan,
    method: &str,
    update: &SpacetimeProjectionUpdate,
) -> epi_s3_gateway_contract::SpacetimeSubscriptionLifecycleEnvelope {
    let event = match update.state {
        SpacetimeProjectionConnectionState::Connected => "connected",
        SpacetimeProjectionConnectionState::ConnectionLost => "connection-lost",
        SpacetimeProjectionConnectionState::Reconnecting => "reconnecting",
        SpacetimeProjectionConnectionState::StaleProfile => "stale-profile",
        SpacetimeProjectionConnectionState::ResyncedProfileGeneration => {
            "resynced-profile-generation"
        }
        SpacetimeProjectionConnectionState::DegradedButSubscribable => "degraded-but-subscribable",
    };
    let mut payload = json!({
        "source": update.source,
        "profileGeneration": update.profile_generation,
        "staleProfileGeneration": update.stale_profile_generation,
        "resyncedProfileGeneration": update.resynced_profile_generation,
        "degradedButSubscribable": update.degraded_but_subscribable,
    });
    if let Some(context) = &update.context {
        payload["context"] = context.clone();
    }
    plan.lifecycle_envelope_for_method(method, event, payload)
}

/// Construct a `fallback-active` lifecycle envelope when the runtime degrades
/// from native WS to HTTP SQL polling. The envelope carries the explicit
/// `SpacetimeFallbackPolicy::FallbackActive` marker AND the
/// silent-fallback-forbidden sentinel so consumers know this is the EXPLICIT
/// degraded path — not a silent downgrade.
pub fn fallback_active_envelope(
    plan: &SpacetimeProjectionPlan,
    method: &str,
    reason: &str,
) -> epi_s3_gateway_contract::SpacetimeSubscriptionLifecycleEnvelope {
    let payload = json!({
        "fallbackPolicy": SpacetimeFallbackPolicy::FallbackActive,
        "silentFallbackForbiddenSentinel": SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
        "reason": reason,
    });
    plan.lifecycle_envelope_for_method(method, SPACETIME_FALLBACK_ACTIVE, payload)
}

/// 13.T4 audit helper: walk a JSON value and assert no nested string field
/// names the silent-HTTP-fallback sentinel as a `projectionSource` or
/// `fallbackPolicy`. The contract is that `silentFallbackForbiddenSentinel` is
/// allowed to NAME the sentinel (so consumers can audit) but no
/// `projectionSource` or `fallbackPolicy` may equal it. This is invoked by the
/// `silent_fallback_refused_is_never_emitted` test.
pub fn assert_no_silent_fallback_in_value(value: &Value) -> Result<(), String> {
    walk_value_for_silent_fallback(value, &mut String::new())
}

fn walk_value_for_silent_fallback(value: &Value, path: &mut String) -> Result<(), String> {
    match value {
        Value::Object(map) => {
            for (key, child) in map {
                let key_lower = key.to_ascii_lowercase();
                if matches!(
                    key_lower.as_str(),
                    "projectionsource" | "fallbackpolicy" | "fallback_policy"
                ) {
                    if let Some(s) = child.as_str() {
                        if s == SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN {
                            return Err(format!(
                                "silent-HTTP-fallback sentinel emitted as {key} at {path}.{key}"
                            ));
                        }
                    }
                }
                let pushed = path.len();
                if !path.is_empty() {
                    path.push('.');
                }
                path.push_str(key);
                walk_value_for_silent_fallback(child, path)?;
                path.truncate(pushed);
            }
            Ok(())
        }
        Value::Array(items) => {
            for (idx, child) in items.iter().enumerate() {
                let pushed = path.len();
                path.push_str(&format!("[{idx}]"));
                walk_value_for_silent_fallback(child, path)?;
                path.truncate(pushed);
            }
            Ok(())
        }
        _ => Ok(()),
    }
}

// =============================================================================
