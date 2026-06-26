//! Epii spine-state inspector — a handle-only projection of recursive-spine
//! routing, governance gates, meta-loop events, and effect-verification schedules.

use serde::{Deserialize, Serialize};
use serde_json::Value;

use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, ResolutionActor, ReviewDecision, ReviewInboxFilter, ReviewStore,
};

use crate::{ImprovementStore, ReviewCategory, TargetSubsystem};

use super::is_recursive_spine_item;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SpineRoutingConfigurationEntry {
    pub route_id: String,
    pub candidate_id: String,
    pub target_subsystem: String,
    pub status: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SpineGovernanceGateEntry {
    pub review_item_id: String,
    pub category: ReviewCategory,
    pub gate_kind: GateKind,
    pub governance_level: GovernanceLevel,
    pub required_actors: Vec<String>,
    pub source_artifact_refs: Vec<String>,
    pub promotion_destination: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SpineMetaLoopEvent {
    pub review_item_id: String,
    pub title: String,
    pub status: String,
    pub resolution: Option<ReviewDecision>,
    pub resolved_by: Option<ResolutionActor>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EpiiSpineStateInspectorSnapshot {
    pub routing_configuration: Vec<SpineRoutingConfigurationEntry>,
    pub governance_gates: Vec<SpineGovernanceGateEntry>,
    pub recent_meta_loop_events: Vec<SpineMetaLoopEvent>,
    pub continuity_hints: Vec<String>,
    pub effect_verification_schedules: Vec<String>,
    pub canon_evolution_refs: Vec<String>,
    pub recursive_review_item_ids: Vec<String>,
}

pub fn build_epii_spine_state_inspector(
    autoresearch: &ImprovementStore,
    review: &ReviewStore,
) -> Result<EpiiSpineStateInspectorSnapshot, String> {
    let routes = autoresearch.routes()?;
    let orchestrations = autoresearch.orchestrations()?;
    let inbox = review.inbox(ReviewInboxFilter::default())?;
    let history = review.history(None)?;

    let recursive_items = inbox
        .items
        .iter()
        .chain(history.items.iter())
        .filter(|item| is_recursive_spine_item(item))
        .collect::<Vec<_>>();
    let recursive_review_item_ids = recursive_items
        .iter()
        .map(|item| item.item_id.clone())
        .collect::<Vec<_>>();
    let route_ids = recursive_items
        .iter()
        .filter_map(|item| {
            item.coordinate_context
                .get("route_id")
                .and_then(Value::as_str)
                .map(str::to_owned)
        })
        .collect::<Vec<_>>();

    let mut routing_configuration = routes
        .into_iter()
        .filter(|route| {
            route.target_subsystem == TargetSubsystem::Epii || route_ids.contains(&route.route_id)
        })
        .map(|route| SpineRoutingConfigurationEntry {
            route_id: route.route_id,
            candidate_id: route.candidate_id,
            target_subsystem: format!("{:?}", route.target_subsystem),
            status: format!("{:?}", route.status),
        })
        .collect::<Vec<_>>();
    routing_configuration.sort_by(|left, right| left.route_id.cmp(&right.route_id));

    let mut governance_gates = recursive_items
        .iter()
        .filter_map(|item| {
            item.governance_profile
                .as_ref()
                .map(|profile| SpineGovernanceGateEntry {
                    review_item_id: item.item_id.clone(),
                    category: profile.category,
                    gate_kind: profile.gate_kind,
                    governance_level: profile.governance_level,
                    required_actors: profile.required_actors.clone(),
                    source_artifact_refs: profile.source_artifact_refs.clone(),
                    promotion_destination: profile.promotion_destination.clone(),
                })
        })
        .collect::<Vec<_>>();
    governance_gates.sort_by(|left, right| left.review_item_id.cmp(&right.review_item_id));

    let mut recent_meta_loop_events = history
        .items
        .iter()
        .filter(|item| {
            is_recursive_spine_item(item)
                || item
                    .governance_profile
                    .as_ref()
                    .and_then(|profile| profile.target_subsystem.as_deref())
                    == Some("Epii")
        })
        .map(|item| {
            let resolution = history
                .resolutions
                .iter()
                .find(|resolution| resolution.item_id == item.item_id);
            SpineMetaLoopEvent {
                review_item_id: item.item_id.clone(),
                title: item.title.clone(),
                status: format!("{:?}", item.status),
                resolution: resolution.map(|resolution| resolution.decision),
                resolved_by: resolution.map(|resolution| resolution.resolved_by.clone()),
            }
        })
        .collect::<Vec<_>>();
    recent_meta_loop_events.sort_by(|left, right| left.review_item_id.cmp(&right.review_item_id));

    let mut effect_verification_schedules = orchestrations
        .iter()
        .filter(|orchestration| {
            orchestration
                .review_item_id
                .as_ref()
                .is_some_and(|item_id| recursive_review_item_ids.contains(item_id))
        })
        .map(|orchestration| {
            format!(
                "{}:{:?}:deadline_at={}",
                orchestration.orchestration_id,
                orchestration.state,
                orchestration.deadline_at.unwrap_or_default()
            )
        })
        .collect::<Vec<_>>();
    effect_verification_schedules.sort();

    let mut canon_evolution_refs = governance_gates
        .iter()
        .flat_map(|gate| gate.source_artifact_refs.iter().cloned())
        .collect::<Vec<_>>();
    canon_evolution_refs.sort();
    canon_evolution_refs.dedup();

    let continuity_hints = vec![
        format!("recursive_review_items={}", recursive_review_item_ids.len()),
        "agent_terminal_resolution_allowed=false".to_owned(),
        "human_final_validation_before_spine_promotion=true".to_owned(),
    ];

    Ok(EpiiSpineStateInspectorSnapshot {
        routing_configuration,
        governance_gates,
        recent_meta_loop_events,
        continuity_hints,
        effect_verification_schedules,
        canon_evolution_refs,
        recursive_review_item_ids,
    })
}
