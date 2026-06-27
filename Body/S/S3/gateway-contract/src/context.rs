//! 12.T12.31 — Dispatch-with-parent-slice primitive (`ConversationSliceHandle`).
//!
//! Canon: [[S3-SPEC]] (session authority) + [[S4-SPEC]] ([[anima]] dispatch) +
//! [[S5-SPEC]] (world-return). This module is the **canonical home** of the
//! parent-slice handle that [[anima]] passes to child dispatches so that the
//! nesting is genuinely in the execution — the parent DAY/NOW contextual
//! horizon and selected slices of the parent conversation travel WITH the
//! dispatch rather than being lost behind a child's final stdout.
//!
//! Per the wave-2 scout-5 finding, today H (folded macro horizon) and
//! τ (raw micro observation-action history) are never folded: the parent only
//! sees a child's final stdout. This primitive lands the HiP-If
//! `(C, H, g_k, τ_{k,j})` state schema onto [[anima]] dispatch:
//!
//! - **H — folded-macro zone**: the slice's coordinate-referenced contextual
//!   horizon, delivered to the child as VAK address + `q_*` discoverables
//!   (CCT-17: coordinate-tagging IS compression). H is consumed by [[anima]]'s
//!   reflection layer at child-completion, NOT by the child agent directly.
//! - **τ — raw-micro zone**: only the current active sub-goal's
//!   observation-action history. The child reads only τ + H-references.
//! - **c=1 / c=0**: on completion the child emits a sub-goal-complete (`c=1`)
//!   or intermediate (`c=0`) indicator. [[chronos]] is the structural router
//!   seat (it already owns temporal semantics + cron registration): `c=1`
//!   folds τ into H and advances `g_k`; `c=0` continues τ.
//!
//! The handle type itself ([`ConversationSliceHandle`]) and its
//! [`VakAddressFilter`] are defined alongside the harness dispatch envelope so
//! they can ride [`crate::HarnessDispatch`]; this module re-exports them as the
//! canonical contextual-slice surface and extends them with the
//! [`crate::SessionRecord`]-derived builder, the three canonical redaction
//! levels, and the [[chronos]] bifurcation-router contract.

use serde::{Deserialize, Serialize};

pub use crate::harness::{ConversationSliceHandle, VakAddressFilter};
pub use crate::session::SessionRecord;
pub use portal_core::VakAddress;

// ============================================================================
// SessionRecord extension — building a slice from the parent session authority
// ============================================================================

impl ConversationSliceHandle {
    /// Build a parent-slice handle from the parent [`SessionRecord`] (the S3
    /// session authority landed by Tranche 12.02). The DAY/NOW contextual
    /// horizon (`day_anchor`, NOW tick window) and the parent conversation
    /// locus (`thread_ids`, `message_span`, `vak_filter`) are projected off the
    /// record so the nesting is genuinely carried in the dispatch.
    pub fn for_session_record(
        record: &SessionRecord,
        now_start_tick: u64,
        now_end_tick: u64,
        message_span: (usize, usize),
        redaction: SliceRedactionPolicy,
        provenance_audit_id: impl Into<String>,
    ) -> Self {
        let thread_ids = record
            .thread_id
            .clone()
            .into_iter()
            .collect::<Vec<String>>();
        let vak_filter = record.vak_address.clone().map(|address| VakAddressFilter {
            address,
            include_descendants: true,
        });
        Self {
            session_key: record.canonical_key.clone(),
            day_anchor: record.day_id.clone().unwrap_or_default(),
            now_start_tick,
            now_end_tick,
            thread_ids,
            message_span,
            vak_filter,
            redaction_policy: redaction.as_policy_str().to_string(),
            provenance_audit_id: provenance_audit_id.into(),
        }
    }

    /// The redaction level this handle declares, if it names a canonical one.
    pub fn redaction_kind(&self) -> Option<SliceRedactionPolicy> {
        SliceRedactionPolicy::from_policy_str(&self.redaction_policy)
    }

    /// Number of messages the slice window spans (`[start, end)`).
    pub fn message_count(&self) -> usize {
        self.message_span.1.saturating_sub(self.message_span.0)
    }

    /// Project the child-visible handle by applying the declared redaction
    /// policy. A child only ever resolves what this returns:
    ///
    /// - `full_context` — the complete slice (raw bodies resolvable);
    /// - `governed_review_metadata_only` — coordinate refs + DAY/NOW window
    ///   retained, but no thread handles and an empty message span (no raw
    ///   bodies are resolvable);
    /// - `decorrelated_summary` — as metadata-only, and the parent
    ///   `session_key` is replaced with a decorrelated token so the summary
    ///   cannot be correlated back to the originating PASU.
    ///
    /// Unknown / non-canonical policy strings fail closed to the
    /// metadata-only shape.
    pub fn redacted_for_child(&self) -> Self {
        match self.redaction_kind() {
            Some(SliceRedactionPolicy::FullContext) => self.clone(),
            Some(SliceRedactionPolicy::GovernedReviewMetadataOnly) | None => Self {
                thread_ids: Vec::new(),
                message_span: (0, 0),
                ..self.clone()
            },
            Some(SliceRedactionPolicy::DecorrelatedSummary) => Self {
                session_key: SliceRedactionPolicy::decorrelated_session_token(&self.session_key),
                thread_ids: Vec::new(),
                message_span: (0, 0),
                ..self.clone()
            },
        }
    }

    /// Whether a child reading this handle (after redaction) could resolve raw
    /// conversation bodies. Only `full_context` exposes them.
    pub fn exposes_raw_bodies(&self) -> bool {
        matches!(
            self.redaction_kind(),
            Some(SliceRedactionPolicy::FullContext)
        )
    }
}

// ============================================================================
// Redaction policy — three canonical levels
// ============================================================================

/// The three canonical redaction levels that gate what a child dispatch may
/// resolve from a parent slice. The wire form of each is the
/// `redaction_policy` string carried on [`ConversationSliceHandle`].
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SliceRedactionPolicy {
    /// Child receives the complete slice. Default for trusted constitutional
    /// children working on protected-user-content (PASU-aware per DR-M4-3).
    FullContext,
    /// Child receives only metadata about the slice (timestamps, coordinate
    /// refs); no raw bodies. Used for [[aletheia]] subagents at lower
    /// entitlement.
    GovernedReviewMetadataOnly,
    /// Child receives a VAK-compressed summary, decorrelated from user
    /// identity per DR-TS-5. Used for cross-PASU public-pool dispatches.
    DecorrelatedSummary,
}

impl SliceRedactionPolicy {
    pub const FULL_CONTEXT: &'static str = "full_context";
    pub const GOVERNED_REVIEW_METADATA_ONLY: &'static str = "governed_review_metadata_only";
    pub const DECORRELATED_SUMMARY: &'static str = "decorrelated_summary";

    /// Canonical wire string for this policy.
    pub fn as_policy_str(self) -> &'static str {
        match self {
            Self::FullContext => Self::FULL_CONTEXT,
            Self::GovernedReviewMetadataOnly => Self::GOVERNED_REVIEW_METADATA_ONLY,
            Self::DecorrelatedSummary => Self::DECORRELATED_SUMMARY,
        }
    }

    /// Parse a canonical wire string; `None` for anything non-canonical (the
    /// caller fails closed).
    pub fn from_policy_str(value: &str) -> Option<Self> {
        match value {
            Self::FULL_CONTEXT => Some(Self::FullContext),
            Self::GOVERNED_REVIEW_METADATA_ONLY => Some(Self::GovernedReviewMetadataOnly),
            Self::DECORRELATED_SUMMARY => Some(Self::DecorrelatedSummary),
            _ => None,
        }
    }

    /// All three canonical levels, weakest-exposure first.
    pub fn all() -> [Self; 3] {
        [
            Self::DecorrelatedSummary,
            Self::GovernedReviewMetadataOnly,
            Self::FullContext,
        ]
    }

    /// Replace a parent session key with a stable, decorrelated token so a
    /// summary cannot be correlated back to the originating session/PASU. The
    /// token is a non-reversible label (not a cryptographic fingerprint — the
    /// gateway runtime substitutes a BLAKE3 handle where one is required).
    pub fn decorrelated_session_token(session_key: &str) -> String {
        let _ = session_key;
        "decorrelated:pasu-public-pool".to_string()
    }
}

// ============================================================================
// dispatch_with_parent_slice — the dispatch signature extension contract
// ============================================================================

/// Gateway/dispatch method name for the parent-slice-carrying dispatch. The
/// S4 [[anima]] `dispatch-policy` module exposes this as
/// `dispatch_with_parent_slice(target_agent, task_spec, vak_frame,
/// parent_slice)`; this contract row is the S3 side of the wire.
pub const DISPATCH_WITH_PARENT_SLICE_METHOD: &str = "s4'.anima.dispatch_with_parent_slice";

/// Eros (DR-EROS-1) is the relational-scour consumer of a slice: it reads the
/// slice's `thread_ids` + `message_span` from the Redis hot-tier, runs a
/// relational-graph traversal bounded by the slice's `vak_filter`, convenes
/// with [[moirai]] (Anima-dispatch under [[aletheia]] mode at the same CF
/// gate) for GraphRAG distillation, and surfaces back a slice-resonance map.
pub const EROS_RELATIONAL_GRAPH_TRAVERSE: &str = "relational-graph-traverse";

/// Hot-tier Redis key shape for slice reads, per DR-S5-ONE-1's hierarchical
/// `{day}/{session}/{turn}/*` layout. Eros resolves slice messages through
/// this namespace.
pub const SLICE_HOT_TIER_KEY_PREFIX: &str = "cache:active:s5:one:{day}:{session}:{turn}";

/// The S3 contract row describing the parent-slice dispatch extension: the
/// method, its ordered argument names, the Eros consumption entrypoint, and
/// the [[chronos]] bifurcation-router seat.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DispatchWithParentSliceContract {
    pub method: &'static str,
    pub argument_order: &'static [&'static str],
    pub eros_traverse_op: &'static str,
    pub bifurcation_router_seat: &'static str,
    pub bifurcation_event_channel: &'static str,
}

impl DispatchWithParentSliceContract {
    pub const fn canonical() -> Self {
        Self {
            method: DISPATCH_WITH_PARENT_SLICE_METHOD,
            argument_order: &["target_agent", "task_spec", "vak_frame", "parent_slice"],
            eros_traverse_op: EROS_RELATIONAL_GRAPH_TRAVERSE,
            bifurcation_router_seat: CHRONOS_BIFURCATION_ROUTER_SEAT,
            bifurcation_event_channel: CHRONOS_BIFURCATION_EVENT_CHANNEL,
        }
    }
}

// ============================================================================
// Chronos c=1/c=0 bifurcation router
// ============================================================================

/// [[chronos]] is the structural seat for the `c=1`/`c=0` bifurcation router
/// (scout-5: "already owns temporal semantics + cron registration"). The
/// chronos extension subscribes to this channel.
pub const CHRONOS_BIFURCATION_ROUTER_SEAT: &str = "S4-3'/chronos";

/// The dispatch-complete event channel the router subscribes to. Payload:
/// `{ agentId, taskId, c, evidence }`.
pub const CHRONOS_BIFURCATION_EVENT_CHANNEL: &str = "agent:team:dispatch:complete";

/// The route a completion indicator takes through the [[chronos]] bifurcation
/// router, per the HiP-If `(C, H, g_k, τ)` state.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum BifurcationRoute {
    /// `c=1` — sub-goal complete: [[anima]] compresses τ into H and advances
    /// `g_k`.
    FoldTauIntoH,
    /// `c=0` — intermediate: re-dispatch the same agent with τ appended.
    ContinueTau,
}

impl BifurcationRoute {
    /// Route a `c` indicator: `1` → fold, `0` (and anything non-`1`) →
    /// continue (fails closed to NOT folding an incomplete sub-goal).
    pub fn from_indicator(c: u8) -> Self {
        match c {
            1 => Self::FoldTauIntoH,
            _ => Self::ContinueTau,
        }
    }

    /// Whether this route advances the macro horizon `g_k`.
    pub fn advances_goal(self) -> bool {
        matches!(self, Self::FoldTauIntoH)
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use crate::session::SessionRecord;
    use portal_core::{CpfState, CsDirection, CsField};

    fn vak_address() -> VakAddress {
        VakAddress {
            cpf: CpfState::Mechanistic,
            ct: vec!["CT2".to_string()],
            cp: "3.2".to_string(),
            cf: "(0/1/2)".to_string(),
            cfp: "CFP3".to_string(),
            cs: CsField {
                code: "M3".to_string(),
                direction: CsDirection::Day,
                recognized: false,
            },
        }
    }

    fn parent_record() -> SessionRecord {
        SessionRecord {
            canonical_key: "agent:main:main".to_string(),
            aliases: Vec::new(),
            label: None,
            session_id: "sess-1".to_string(),
            day_id: Some("2026-06-15".to_string()),
            spawned_by: None,
            parent_session_key: None,
            source_session_key: None,
            source_session_kind: None,
            vault_now_path: None,
            runtime_cwd: None,
            vault_root: None,
            resource_loader_id: None,
            retry_settlement_state: None,
            diagnostics: Vec::new(),
            delivery_context: None,
            channel: None,
            thread_id: Some("thread-main".to_string()),
            group_id: None,
            group_channel: None,
            group_space: None,
            team_id: None,
            team_role: None,
            orchestration_kind: None,
            cmux_workspace: None,
            cmux_surface: None,
            cmux_pane_id: None,
            terminal_binding: None,
            active_agent_id: "anima".to_string(),
            subagent_lineage: Vec::new(),
            workspace_root: "/repo".to_string(),
            bootstrap_scope: "full".to_string(),
            thinking_level: None,
            verbose_level: None,
            reasoning_level: None,
            model_override: None,
            provider_override: None,
            cli_session_ids: Vec::new(),
            vak_address: Some(vak_address()),
            updated_at_ms: 0,
        }
    }

    #[test]
    fn conversation_slice_handle_round_trip() {
        // Build from the parent SessionRecord (12.02 infrastructure), covering
        // the last 5 turns over coord M3-2.
        let handle = ConversationSliceHandle::for_session_record(
            &parent_record(),
            12,
            31,
            (3, 8),
            SliceRedactionPolicy::FullContext,
            "audit-12-31",
        );

        // DAY/NOW horizon + conversation locus projected off the record.
        assert_eq!(handle.session_key, "agent:main:main");
        assert_eq!(handle.day_anchor, "2026-06-15");
        assert_eq!(handle.now_start_tick, 12);
        assert_eq!(handle.now_end_tick, 31);
        assert_eq!(handle.thread_ids, vec!["thread-main".to_string()]);
        assert_eq!(handle.message_span, (3, 8));
        assert_eq!(handle.message_count(), 5);
        assert_eq!(handle.redaction_policy, SliceRedactionPolicy::FULL_CONTEXT);
        let filter = handle.vak_filter.as_ref().expect("vak filter present");
        assert!(filter.include_descendants);
        assert_eq!(filter.address.cs.code, "M3");

        // Round-trips through serde unchanged.
        let json = serde_json::to_string(&handle).expect("serialize");
        let back: ConversationSliceHandle = serde_json::from_str(&json).expect("deserialize");
        assert_eq!(handle, back);

        // The dispatch contract names the handle as its trailing argument and
        // routes Eros + the Chronos bifurcation seat.
        let contract = DispatchWithParentSliceContract::canonical();
        assert_eq!(contract.argument_order[3], "parent_slice");
        assert_eq!(contract.eros_traverse_op, EROS_RELATIONAL_GRAPH_TRAVERSE);
        assert_eq!(
            contract.bifurcation_router_seat,
            CHRONOS_BIFURCATION_ROUTER_SEAT
        );
        assert_eq!(
            contract.bifurcation_event_channel,
            "agent:team:dispatch:complete"
        );

        // c=1 folds τ into H and advances g_k; c=0 continues τ.
        assert!(BifurcationRoute::from_indicator(1).advances_goal());
        assert!(!BifurcationRoute::from_indicator(0).advances_goal());
        assert_eq!(
            BifurcationRoute::from_indicator(0),
            BifurcationRoute::ContinueTau
        );
    }

    #[test]
    fn dispatch_with_parent_slice_respects_redaction_policy() {
        let record = parent_record();

        // full_context — trusted constitutional child sees the complete slice.
        let full = ConversationSliceHandle::for_session_record(
            &record,
            12,
            31,
            (3, 8),
            SliceRedactionPolicy::FullContext,
            "audit-full",
        );
        let full_child = full.redacted_for_child();
        assert!(full.exposes_raw_bodies());
        assert_eq!(full_child.thread_ids, vec!["thread-main".to_string()]);
        assert_eq!(full_child.message_span, (3, 8));
        assert_eq!(full_child, full);

        // governed_review_metadata_only — Aletheia subagent gets coordinate
        // refs + DAY/NOW window, but no thread handles and no resolvable
        // message bodies.
        let meta = ConversationSliceHandle::for_session_record(
            &record,
            12,
            31,
            (3, 8),
            SliceRedactionPolicy::GovernedReviewMetadataOnly,
            "audit-meta",
        );
        let meta_child = meta.redacted_for_child();
        assert!(!meta.exposes_raw_bodies());
        assert!(meta_child.thread_ids.is_empty());
        assert_eq!(meta_child.message_span, (0, 0));
        assert_eq!(meta_child.message_count(), 0);
        // Coordinate horizon (H) is preserved even when bodies are stripped.
        assert_eq!(meta_child.day_anchor, "2026-06-15");
        assert!(meta_child.vak_filter.is_some());
        assert_eq!(meta_child.session_key, "agent:main:main");

        // decorrelated_summary — cross-PASU public-pool dispatch: bodies
        // stripped AND the parent session key decorrelated from identity.
        let summary = ConversationSliceHandle::for_session_record(
            &record,
            12,
            31,
            (3, 8),
            SliceRedactionPolicy::DecorrelatedSummary,
            "audit-summary",
        );
        let summary_child = summary.redacted_for_child();
        assert!(!summary.exposes_raw_bodies());
        assert!(summary_child.thread_ids.is_empty());
        assert_eq!(summary_child.message_span, (0, 0));
        assert_ne!(summary_child.session_key, "agent:main:main");
        assert!(summary_child.session_key.starts_with("decorrelated:"));
        // Provenance audit trail survives decorrelation.
        assert_eq!(summary_child.provenance_audit_id, "audit-summary");

        // Every canonical level round-trips through its wire string.
        for policy in SliceRedactionPolicy::all() {
            assert_eq!(
                SliceRedactionPolicy::from_policy_str(policy.as_policy_str()),
                Some(policy)
            );
        }
        // Non-canonical policy fails closed to metadata-only behaviour.
        let mut rogue = full.clone();
        rogue.redaction_policy = "totally-made-up".to_string();
        assert!(rogue.redaction_kind().is_none());
        assert!(!rogue.exposes_raw_bodies());
        assert!(rogue.redacted_for_child().thread_ids.is_empty());
    }
}
