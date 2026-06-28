use epi_s3_gateway_contract::{
    SpacetimeFallbackPolicy, SpacetimeProjectionPlan, SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
    SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
};

// 13.T4: silent-HTTP-fallback sentinel
// =============================================================================

/// Returns the canonical sentinel string that names the forbidden silent HTTP
/// fallback path. Test fixtures may compare against this value, but no
/// production code path here ever returns it as a `projectionSource`. The
/// `silent_fallback_refused_is_never_emitted` regression test in the gateway
/// crate asserts the sentinel is not present in any reachable readiness JSON
/// or lifecycle envelope.
pub fn silent_fallback_refused() -> &'static str {
    SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN
}

/// 13.T4: derive a `SpacetimeFallbackPolicy` from a `SpacetimeProjectionPlan`.
/// This is the SINGLE entry point for routing native↔fallback decisions; any
/// new caller must use this — never construct a fallback decision via string
/// comparison or by silently downgrading.
pub fn fallback_policy_for_plan(plan: &SpacetimeProjectionPlan) -> SpacetimeFallbackPolicy {
    if plan.endpoint.is_empty() {
        SpacetimeFallbackPolicy::Disabled
    } else if plan.mode == SPACETIME_PROJECTION_SOURCE_NATIVE_WS {
        SpacetimeFallbackPolicy::NativeWebsocket
    } else {
        SpacetimeFallbackPolicy::FallbackActive
    }
}

// =============================================================================
