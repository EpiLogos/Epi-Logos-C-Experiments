use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ProductionFallbackPolicy {
    /// Default: HTTP SQL polling is permitted only for local development;
    /// any production environment refuses to use it.
    DevelopmentOnly,
    /// Operator-opted-in: HTTP SQL polling is permitted as a visible
    /// degraded mode, with an explicit `fallback-active` lifecycle event
    /// on every subscription that uses it.
    OperatorOptIn,
}

/// 03.T7: detect the active fallback policy from the environment. Defaults
/// to `DevelopmentOnly`; flips to `OperatorOptIn` when
/// `EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK=1`.
pub fn detect_production_fallback_policy() -> ProductionFallbackPolicy {
    match std::env::var("EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK") {
        Ok(value) if value == "1" || value.eq_ignore_ascii_case("true") => {
            ProductionFallbackPolicy::OperatorOptIn
        }
        _ => ProductionFallbackPolicy::DevelopmentOnly,
    }
}

/// 03.T7: forbidden field names that MUST NOT appear in any SpaceTimeDB
/// row serialised to the public projection or in any Graphiti search
/// result envelope. The privacy audit harness scans live row payloads for
/// these strings and fails the release gate if any are present.
pub const PRIVACY_FORBIDDEN_FIELD_NAMES: &[&str] = &[
    // From 03.T6 (Graphiti episode bodies).
    "episode_id",
    "episode",
    "episode_body",
    "memory_body",
    "protected_payload",
    "journal_text",
    "dream_body",
    "raw_episode",
    // From the alpha spec privacy invariants (Nara personal mandala).
    "raw_birth_data",
    "birth_data",
    "dream_content",
    "profile_hash_preview",
    "layer_mask",
    "personal_nexus_body",
    "personalnexus_body",
    "personal_nexus",
    // Catch-all for raw identity that should only ever cross as a
    // BLAKE3 fingerprint.
    "raw_identity",
    "raw_quaternionic_bytes",
];

/// 03.T7: scan a serialised row payload (as a JSON Value, or any value
/// renderable to a String via Display) for forbidden field names. Returns
/// the list of forbidden fields found; empty list means the row is safe.
///
/// The scan is intentionally string-based (rather than walking JSON
/// structurally) so it catches forbidden fields buried in
/// arbitrary-shape payload_json blobs that the gateway has not pre-typed.
pub fn scan_for_forbidden_privacy_fields(payload: &str) -> Vec<&'static str> {
    let mut hits = Vec::new();
    for field in PRIVACY_FORBIDDEN_FIELD_NAMES {
        // Match `"field"` to avoid false positives from prefix/substring
        // matches (e.g. `episode_id` matching inside `non_episode_id_field`).
        let needle = format!("\"{field}\"");
        if payload.contains(&needle) {
            hits.push(*field);
        }
    }
    hits
}
