use serde::{Deserialize, Serialize};
use serde_json::Value;

pub use portal_core::VakAddress;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", tag = "kind")]
pub enum HarnessTurnEvent {
    TextChunk {
        text: String,
    },
    ReasoningChunk {
        text: String,
    },
    ToolCallRequested {
        call_id: String,
        name: String,
        arguments: Value,
    },
    ToolCallInProgress {
        call_id: String,
        name: String,
    },
    ToolCallObserved {
        call_id: String,
        name: String,
        arguments: Value,
        result: Value,
        status: HarnessToolCallStatus,
        duration_ms: u64,
    },
    TurnComplete {
        text: String,
        usage: HarnessTurnUsage,
        response_model: String,
        finish_reasons: Vec<String>,
    },
    TurnCancelled {
        reason: String,
        partial_text: String,
    },
    ContextWindowExceeded {
        max_tokens: u64,
        actual_tokens: u64,
    },
    HarnessError {
        message: String,
        code: String,
        retryable: bool,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum HarnessToolCallStatus {
    Succeeded,
    Failed,
    Cancelled,
    Denied,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum HarnessDispatchPurpose {
    Implement,
    Review,
    Explore,
    Search,
    Converse,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum HarnessBacking {
    NativeCli,
    Acp,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum HarnessCostClass {
    Hot,
    Warm,
    Cold,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HarnessRegistryEntry {
    pub harness_id: String,
    pub backing: HarnessBacking,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HarnessRegistry {
    pub entries: Vec<HarnessRegistryEntry>,
}

impl HarnessRegistry {
    pub fn new(entries: Vec<HarnessRegistryEntry>) -> Self {
        Self { entries }
    }

    pub fn lookup(&self, harness_id: &str) -> Option<&HarnessRegistryEntry> {
        self.entries
            .iter()
            .find(|entry| entry.harness_id == harness_id)
    }

    pub fn contains(&self, harness_id: &str) -> bool {
        self.lookup(harness_id).is_some()
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HarnessDispatch {
    pub harness_id: String,
    pub model_slot: String,
    pub purpose: HarnessDispatchPurpose,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub worktree: Option<HarnessWorktreeAuthority>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parent_session_key: Option<String>,
    pub vak_address: VakAddress,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parent_slice: Option<ConversationSliceHandle>,
    pub cost_class: HarnessCostClass,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tool_grant: Option<HarnessToolGrant>,
}

impl HarnessDispatch {
    pub fn new(
        input: HarnessDispatchInput,
        registry: &HarnessRegistry,
    ) -> Result<Self, HarnessDispatchError> {
        if !registry.contains(&input.harness_id) {
            return Err(HarnessDispatchError::UnregisteredHarness {
                harness_id: input.harness_id,
            });
        }
        if input.purpose == HarnessDispatchPurpose::Converse && input.worktree.is_some() {
            return Err(HarnessDispatchError::ConverseCarriesWorktree);
        }
        if input.purpose == HarnessDispatchPurpose::Converse && input.tool_grant.is_some() {
            return Err(HarnessDispatchError::ConverseCarriesToolGrant);
        }

        Ok(Self {
            harness_id: input.harness_id,
            model_slot: input.model_slot,
            purpose: input.purpose,
            worktree: input.worktree,
            parent_session_key: input.parent_session_key,
            vak_address: input.vak_address,
            parent_slice: input.parent_slice,
            cost_class: input.cost_class,
            tool_grant: input.tool_grant,
        })
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HarnessDispatchInput {
    pub harness_id: String,
    pub model_slot: String,
    pub purpose: HarnessDispatchPurpose,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub worktree: Option<HarnessWorktreeAuthority>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parent_session_key: Option<String>,
    pub vak_address: VakAddress,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parent_slice: Option<ConversationSliceHandle>,
    pub cost_class: HarnessCostClass,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tool_grant: Option<HarnessToolGrant>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HarnessWorktreeAuthority {
    pub path: String,
    pub lease_id: String,
    pub write_scopes: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HarnessToolGrant {
    pub grant_id: String,
    pub allowed_tools: Vec<String>,
    pub policy_gate: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HarnessTurnContext {
    pub dispatch: HarnessDispatch,
    pub turn_id: String,
    pub tool_call_enforcement: ToolCallEnforcementHook,
}

impl HarnessTurnContext {
    pub fn new(
        dispatch: HarnessDispatch,
        turn_id: impl Into<String>,
        tool_call_enforcement: ToolCallEnforcementHook,
    ) -> Self {
        Self {
            dispatch,
            turn_id: turn_id.into(),
            tool_call_enforcement,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ToolCallEnforcementHook {
    pub hook_id: String,
    pub gateway_method: String,
    pub policy_gate: String,
    pub required_for_internal_tool_dispatch: bool,
}

impl ToolCallEnforcementHook {
    pub fn gateway_policy_gate(hook_id: impl Into<String>) -> Self {
        Self {
            hook_id: hook_id.into(),
            gateway_method: "s4'.permission.get".to_string(),
            policy_gate: "meta-layer-tool-policy".to_string(),
            required_for_internal_tool_dispatch: true,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversationSliceHandle {
    pub session_key: String,
    pub day_anchor: String,
    pub now_start_tick: u64,
    pub now_end_tick: u64,
    pub thread_ids: Vec<String>,
    pub message_span: (usize, usize),
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vak_filter: Option<VakAddressFilter>,
    pub redaction_policy: String,
    pub provenance_audit_id: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VakAddressFilter {
    pub address: VakAddress,
    pub include_descendants: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HarnessTurnUsage {
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub total_tokens: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum HarnessDispatchError {
    UnregisteredHarness { harness_id: String },
    ConverseCarriesWorktree,
    ConverseCarriesToolGrant,
}

impl std::fmt::Display for HarnessDispatchError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::UnregisteredHarness { harness_id } => {
                write!(f, "harness_id `{harness_id}` is not registered")
            }
            Self::ConverseCarriesWorktree => {
                write!(
                    f,
                    "converse harness dispatch cannot carry worktree authority"
                )
            }
            Self::ConverseCarriesToolGrant => {
                write!(f, "converse harness dispatch cannot carry tool authority")
            }
        }
    }
}

impl std::error::Error for HarnessDispatchError {}
