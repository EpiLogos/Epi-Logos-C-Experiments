//! 13.T4: S3' SpaceTimeDB bridge -- native WebSocket subscription, HTTP
//! reducer client, lifecycle envelope construction, fallback policy, readiness
//! schema. Extracted from `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs`
//! per plan 13.T4 deliverable. S0 keeps only env/config discovery and the
//! file-based `SpacetimeBridge` test recorder; everything in this module is
//! S3-owned.
//!
//! Lane discipline (13.T4):
//! - `s3'.temporal.subscribe` and `s3'.spacetime.subscribe` share ONE
//!   subscription registry. Lifecycle envelopes use the same
//!   `SpacetimeSubscriptionLifecycleEnvelope` type carried by the
//!   gateway-contract crate.
//! - Fallback policy is explicit. Silent HTTP fallback is forbidden:
//!   `silent_fallback_refused()` returns the contract sentinel constant; no
//!   code path here may produce a "silently degraded to HTTP" projection
//!   source. When native is unavailable, callers receive an explicit
//!   `SpacetimeFallbackPolicy::FallbackActive` signal AND the readiness JSON
//!   names HTTP SQL polling as the fallback mode.

mod fallback;
mod identity;
mod lifecycle;
mod presence;
mod projection;
mod registration;
mod resync;
mod retry;

pub use fallback::{fallback_policy_for_plan, silent_fallback_refused};
pub use identity::{
    agent_instance_id, agent_kind, capability_surface_hash, day_wikilink,
    global_temporal_surface_key, identity_handle_blake3, kairos_snapshot_id,
    quintessence_hash_blake3, redis_global_context_key, string_at,
};
pub use lifecycle::{
    assert_no_silent_fallback_in_value, fallback_active_envelope, lifecycle_envelope_from_update,
};
pub use presence::{
    CardKind, KleinFace, LiveState, OracleSpreadPosition, SpacetimePresence, TargetAspect,
};
pub use projection::{
    projection_context_from_sql_result, projection_context_from_subscription_message,
};
pub use registration::{
    being_pattern_acceptance_replay, being_pattern_bridge_handle_payload, readiness_value,
    readiness_value_default, readiness_value_for_state_root, SpacetimeProjectionSubscription,
    SpacetimeRegistration, SpacetimeSubscriptionPlan,
};
pub use resync::{
    SpacetimeProjectionConnectionState, SpacetimeProjectionResyncTracker, SpacetimeProjectionUpdate,
};
pub use retry::ReducerRetryPolicy;
