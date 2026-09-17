//! The Graphiti adapter residency declaration — S3 runs it, S5 invokes it, S2 plans for it.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S-root |
//! | Residency  | Body/S/epi-kernel-contract/src/graphiti_residency.rs |
//! | Position   | #0 — the shared authority statement beneath S2, S3 and S5 |
//! | Actualises | [[S3-ARCHITECTURE]] Graphiti adapter contract, Track 53 T53.06 |
//!
//! # Why this lives below all three
//!
//! "S3 owns the runtime, S5 owns invocation and arc governance" is a statement
//! *about* three layers. It was resident in `epi-s3-gateway-contract`, so
//! `epi-s2-graph-services` — which records the authority on every Graphiti
//! promotion plan it builds — had to declare an upward S2→S3 dependency to
//! quote a sentence about itself. The sentence sits below all of them now;
//! S3 re-exports it, so no import path in the tree changes.
//!
//! # Public surface
//! * [`GRAPHITI_RUNTIME_AUTHORITY`] / [`GRAPHITI_INVOCATION_OWNER`] — the
//!   frozen authority strings carried on plans, configs and wire payloads.
//! * [`GraphitiAdapterMode`] / [`GraphitiAdapterContract`] — which adapter is
//!   in force and what capabilities it must provide.
//!
//! # Does NOT own
//! * The runtime. Process lifecycle, HTTP compatibility transport, episode
//!   deposit and search live in `epi-s3-graphiti-runtime`.
//! * Invocation policy, arc governance, or privacy classification of episode
//!   bodies — S5 and the S3 gateway contract respectively.

use serde::{Deserialize, Serialize};

pub const GRAPHITI_RUNTIME_AUTHORITY: &str = "S3 graphiti runtime adapter";
pub const GRAPHITI_INVOCATION_OWNER: &str = "S5 episodic invocation and arc governance";

/// Privacy classification — applied at the gateway boundary before a row
/// crosses to the kernel-bridge. Downstream consumers may further restrict
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GraphitiAdapterMode {
    NativeLibrary,
    HttpCompatibility,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct GraphitiAdapterContract {
    pub coordinate_owner: &'static str,
    pub invocation_owner: &'static str,
    pub mode: GraphitiAdapterMode,
    pub compatibility_mode: Option<GraphitiAdapterMode>,
    pub required_capabilities: &'static [&'static str],
    pub description: &'static str,
}

impl GraphitiAdapterContract {
    pub fn native_library() -> Self {
        Self {
            coordinate_owner: "S3",
            invocation_owner: "S5",
            mode: GraphitiAdapterMode::NativeLibrary,
            compatibility_mode: Some(GraphitiAdapterMode::HttpCompatibility),
            required_capabilities: &[
                "add_episode",
                "search",
                "build_indices_and_constraints",
                "provenance_event",
            ],
            description: "Graphiti runtime adapter loaded as a native/library-backed S3 service; S5 owns invocation, search policy, and arc governance",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The two authority strings are wire-visible (they land on promotion
    /// plans, gateway configs and `s5'.epii.*` payloads). They are frozen.
    #[test]
    fn the_authority_strings_keep_naming_s3_runtime_and_s5_invocation() {
        assert_eq!(GRAPHITI_RUNTIME_AUTHORITY, "S3 graphiti runtime adapter");
        assert_eq!(
            GRAPHITI_INVOCATION_OWNER,
            "S5 episodic invocation and arc governance"
        );
        assert!(GRAPHITI_RUNTIME_AUTHORITY.contains("S3"));
        assert!(GRAPHITI_INVOCATION_OWNER.contains("S5"));
        assert!(!GRAPHITI_RUNTIME_AUTHORITY.contains("sidecar"));
    }

    #[test]
    fn the_native_library_adapter_declares_its_required_capabilities() {
        let adapter = GraphitiAdapterContract::native_library();
        assert_eq!(adapter.coordinate_owner, "S3");
        assert_eq!(adapter.invocation_owner, "S5");
        assert_eq!(adapter.mode, GraphitiAdapterMode::NativeLibrary);
        assert_eq!(
            adapter.compatibility_mode,
            Some(GraphitiAdapterMode::HttpCompatibility)
        );
        assert!(adapter.required_capabilities.contains(&"add_episode"));
        assert!(adapter.required_capabilities.contains(&"search"));
        assert!(adapter
            .required_capabilities
            .contains(&"build_indices_and_constraints"));
        assert!(adapter.required_capabilities.contains(&"provenance_event"));
    }
}
