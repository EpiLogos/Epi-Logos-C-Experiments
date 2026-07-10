//! `s0'.settings.*` gateway contract — the S0' settings surface.
//!
//! Mirrors the `s0'.verifier.*` pattern: typed request/response shapes plus a
//! method-membership accessor. The methods are backed by the `epi settings`
//! CLI (`status` / `opt-in`) and the `epi-s0-settings` substrate, honoring the
//! "no route without a CLI command" invariant. The status response NEVER carries
//! the key value — only presence + opt-in state.

use serde::{Deserialize, Serialize};

/// Request for `s0'.settings.api_key_status` — the manifest key to inspect.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiKeyStatusRequest {
    pub name: String,
}

/// Response for `s0'.settings.api_key_status`. Carries presence + opt-in state
/// only — it MUST NOT expose the key value.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiKeyStatusResponse {
    pub present: bool,
    /// Rendered opt-in state: `recorded` / `not-recorded` / `n/a`.
    pub opt_in: String,
}

/// Request for `s0'.settings.opt_in` — record cloud opt-in for a key.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OptInRequest {
    pub name: String,
    /// Consent scope recorded as provenance; server default applies if absent.
    #[serde(default)]
    pub consent_scope: Option<String>,
}

/// Response for `s0'.settings.opt_in` — the recorded consent + provenance.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OptInResponse {
    pub recorded: bool,
    pub consented_at: String,
    pub consent_scope: String,
}

/// The `s0'.settings.*` method names, registration order matching the contract.
pub fn s0_prime_settings_methods() -> &'static [&'static str] {
    crate::S0_PRIME_SETTINGS_METHODS
}
