use serde::{Deserialize, Serialize};
use serde_json::Value;

// Track 53 T53.06: "S3 runs the runtime, S5 owns invocation" is a statement
// about three layers, and S2's Graphiti promotion planner has to quote it. It
// moved down to `epi_kernel_contract::graphiti_residency`, where S2 may see it
// without an upward S2→S3 edge; re-exported here so every import path in the
// tree still resolves through the gateway contract.
pub use epi_kernel_contract::graphiti_residency::{
    GraphitiAdapterContract, GraphitiAdapterMode, GRAPHITI_INVOCATION_OWNER,
    GRAPHITI_RUNTIME_AUTHORITY,
};

pub const GRAPHITI_PORT: u16 = 37778;
pub const GRAPHITI_BASE_URL: &str = "http://127.0.0.1:37778";
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GraphitiRuntimeStatus {
    Available,
    Degraded,
    Unavailable,
}

/// Subscription lifecycle from the kernel-bridge's perspective — mirrors the
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphitiInvocationEnvelope {
    pub session_key: String,
    pub day_id: String,
    pub now_path: String,
    pub namespace_ref: String,
    pub session_arc_id: String,
    pub privacy_class: GraphitiPrivacyClass,
    /// `agent_id` is the invoking agent identity (`epii`, `nara`, …) —
    /// surfaced for audit/provenance, not for authorisation.
    pub agent_id: String,
}

/// 03.T6: Graphiti invocation privacy classification. `ProtectedEpisodic`
/// means the body contains personal episodic memory that MUST NOT be
/// persisted to SpaceTimeDB or any other public projection — only the
/// `session_arc_id` + `namespace_ref` references cross the gateway
/// boundary. `PublicProvenance` means a provenance event that can be
/// safely persisted as a reference.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GraphitiPrivacyClass {
    ProtectedEpisodic,
    PublicProvenance,
}

/// 03.T6: refuse a SpaceTimeDB row payload if it carries any field that
/// would leak Graphiti episode body content into the public projection.
/// Returns `Ok(())` when the row is safe (only references); `Err` naming
/// the offending field when an episode body field is present.
///
/// The forbidden field names are the ones used in the Graphiti
/// compatibility surface (`Body/S/S3/graphiti-runtime/src/lib.rs`): any
/// raw `episode_id` + body, raw `episode`, `episode_body`, `memory_body`,
/// `protected_payload`, or `journal_text`. SAFE references are
/// `graphiti_namespace_ref` and `graphiti_session_arc_id` only.
pub fn assert_no_graphiti_body_in_row(row: &Value) -> Result<(), String> {
    let forbidden = [
        "episode_id",
        "episode",
        "episode_body",
        "memory_body",
        "protected_payload",
        "journal_text",
        "dream_body",
        "raw_episode",
    ];
    let Value::Object(map) = row else {
        return Ok(());
    };
    for field in forbidden {
        if map.contains_key(field) {
            return Err(format!(
                "Graphiti episode body field `{field}` must not be persisted to SpaceTimeDB; only `graphiti_namespace_ref` and `graphiti_session_arc_id` references are safe (see 03.T6 IOD-08)"
            ));
        }
    }
    Ok(())
}

// `GraphitiAdapterMode` and `GraphitiAdapterContract` are re-exported from
// `epi_kernel_contract::graphiti_residency` at the top of this module.
