//! S1 Hen compiler contract.

pub mod artifact_evidence;
pub mod base_view;
pub mod compile_plan;
pub mod coordinate;
pub mod frontmatter;
pub mod graph_promotion;
pub mod graph_sync;
pub mod l_alignments;
pub mod ledger;
pub mod property_intelligence;
pub mod relation_inference;
pub mod residency;
mod smart_env;
pub mod wikilinks;

pub use compile_plan::{
    compiler_invocation, plan_compile, CompilePlanRequest, CompilePlanResponse, CompilerInvocation,
    ExecutorKind, TargetAgent,
};
pub use coordinate::is_valid_coordinate;
pub use frontmatter::{
    validate_compile_artifact_frontmatter, validate_frontmatter, ValidationResult,
};
pub use graph_sync::{graph_sync_intent, GraphSyncIntent, GraphSyncMode};
pub use ledger::{ql_first_channels, LedgerChannel, ENVELOPE_LEDGER_CHANNELS};
pub use residency::{resolve_compiler_residency, CompilerResidencyPlan, HenTimestamp};
pub use smart_env::{
    suggest_link_candidates, LinkCandidate, LinkCandidateKind, LinkCandidateRequest,
    LinkCandidateResponse,
};
pub use wikilinks::{
    coordinate_for_residency, coordinate_residency_refusal, parse_wikilinks, reconcile_rename,
    rewrite_wikilink_titles, wikilink_title_from_path, ReconciledDoc, RenameRefusal,
    RenameRefusalReason, Wikilink, WikilinkTarget,
};
