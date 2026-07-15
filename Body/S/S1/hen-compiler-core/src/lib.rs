//! S1 Hen compiler contract.

pub mod artifact_evidence;
pub mod base_view;
pub mod birth_codon;
pub mod compile_plan;
pub mod coordinate;
pub mod entity_lifecycle;
pub mod frontmatter;
pub mod frontmatter_mutation;
pub mod graph_promotion;
pub mod graph_sync;
pub mod l_alignments;
pub mod ledger;
pub mod property_intelligence;
pub mod relation_inference;
pub mod residency;
mod smart_env;
pub mod wikilinks;

pub use artifact_evidence::{
    c_layer_evidence_kind, classify_c_layer, CLayerClassification, CLayerEvidence,
};
pub use birth_codon::{
    derive_birth_codon, derive_birth_codon_with_composition, BirthCodonLedger, BirthCodonRecord,
    BirthCodonSeed, BirthCodonState, CollisionOutcome, DerivationPolicy, SEED_COMPOSITION_DEFAULT,
};
pub use compile_plan::{
    compiler_invocation, plan_compile, CompilePlanRequest, CompilePlanResponse, CompilerInvocation,
    ExecutorKind, TargetAgent,
};
pub use coordinate::is_valid_coordinate;
pub use entity_lifecycle::{
    c_layer_segment, entity_list_entry, entity_state_for_path, plan_entity_capture,
    plan_entity_classify, plan_entity_promote_to_type, plan_world_graduate, EntityCapturePlan,
    EntityClassifyPlan, EntityListEntry, EntityPromotionPlan, WorldGraduationPlan,
    C_LAYER_SEGMENTS,
};
pub use frontmatter::{
    validate_compile_artifact_frontmatter, validate_frontmatter, ValidationResult,
};
pub use frontmatter_mutation::append_frontmatter_string;
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
