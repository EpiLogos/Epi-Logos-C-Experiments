use serde::{Deserialize, Serialize};
use serde_json::Value;

pub const GRAPHITI_PORT: u16 = 37778;
pub const GRAPHITI_BASE_URL: &str = "http://127.0.0.1:37778";
pub const GRAPHITI_RUNTIME_AUTHORITY: &str = "S3 graphiti runtime adapter";
pub const GRAPHITI_INVOCATION_OWNER: &str = "S5 episodic invocation and arc governance";
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
