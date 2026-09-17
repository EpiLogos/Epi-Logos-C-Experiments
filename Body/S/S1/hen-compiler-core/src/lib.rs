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
/// The `s1'.*` gateway method contracts — S1's OWN receipt and request shapes.
/// They lived in `epi-s3-gateway-contract` until Track 53 T53.04; a coordinate's
/// contract belongs to that coordinate, and S1 may not import S3 to reach it.
/// `gateway-contract` now re-exports these, so no consumer import path changed.
pub mod s1_handlers;
pub mod s1_vault;
mod smart_env;
pub mod wikilinks;

pub use s1_vault::*;

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
pub use coordinate::{is_valid_coordinate, is_valid_umbrella_designator};
pub use entity_lifecycle::{
    c_layer_segment, entity_list_entry, entity_state_for_path, plan_entity_capture,
    plan_entity_classify, plan_entity_promote_to_type, plan_world_graduate, EntityCapturePlan,
    EntityClassifyPlan, EntityListEntry, EntityPromotionPlan, WorldGraduationPlan,
    C_LAYER_SEGMENTS,
};
pub use frontmatter::{
    validate_compile_artifact_frontmatter, validate_frontmatter, validate_frontmatter_contract,
    ValidatedFrontmatterContract, ValidationResult,
};
pub use frontmatter_mutation::{
    append_frontmatter_string, plan_q_articulation_amendment, q_articulation_review_epoch_key,
    set_frontmatter_string, QArticulationAmendmentPlan, QArticulationAmendmentRequest,
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
