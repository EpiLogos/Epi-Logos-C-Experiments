//! Capacity-workflow façade — S5 operational-capacity mediation.
//!
//! Split out of the former monolithic `capacity_workflows.rs` (2,584 LOC) per
//! S5-ARCHITECTURE.md §5 finding F1. The submodules carry the registry, the
//! deterministic-slice runner, and the Nara / recursive-review /
//! spine-inspector / Aletheia-lineage governance surfaces; this file re-exports
//! them so the public `capacity_workflows::*` path is unchanged, and holds the
//! cross-module helpers shared between submodules.

mod aletheia_lineage;
mod nara_voice;
mod recursive_review;
mod registry;
mod runner;
mod spine_inspector;

pub use crate::adapters::MahamayaRuntimeTier;

pub use aletheia_lineage::*;
pub use nara_voice::*;
pub use recursive_review::*;
pub use registry::*;
pub use runner::*;
pub use spine_inspector::*;

use epi_s5_epii_review_core::{GateKind, GovernanceLevel, ReviewInboxItem};

use crate::ReviewCategory;

fn is_recursive_spine_item(item: &ReviewInboxItem) -> bool {
    let Some(profile) = item.governance_profile.as_ref() else {
        return false;
    };
    profile.category == ReviewCategory::RecursiveSelfModification
        && profile.gate_kind == GateKind::RecursiveSelfModification
        && profile.governance_level == GovernanceLevel::RecursiveLoadBearing
}

fn stable_uri_suffix(value: &str) -> String {
    value
        .chars()
        .filter(|ch| ch.is_ascii_alphanumeric() || *ch == '-' || *ch == '_')
        .take(48)
        .collect::<String>()
}

fn sanitize_id_component(value: &str) -> String {
    value
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' {
                ch
            } else {
                '-'
            }
        })
        .collect()
}
