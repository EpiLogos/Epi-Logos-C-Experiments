use std::collections::BTreeMap;

pub use portal_core::{
    BeingEntityRef, BeingObserverAnchor, BeingPatternClockAddress, BeingPatternProtectedRef,
    BeingPatternRelationEdge as BeingPatternRelationEdgeProjection, BioQuaternionHandle,
    ElementalWeightProjection, M2M3RelationProjection, MonoPolyOperator,
    PasuBeingPatternProjection, PasuLiveStateHandle as LiveStateHandle, PasuReviewRisk,
    PerspectiveRole, StableIdentityHandle,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

pub const BEING_PATTERN_OBSERVE_METHOD: &str = "s3'.being_pattern.observe";
pub const BEING_PATTERN_PROJECT_METHOD: &str = "s3'.being_pattern.project";
pub const BEING_PATTERN_SUBSCRIBE_METHOD: &str = "s3'.being_pattern.subscribe";
pub const BEING_PATTERN_REVIEW_CANDIDATE_METHOD: &str = "s3'.being_pattern.review_candidate";

pub const BEING_PATTERN_TABLES: [&str; 3] = [
    "being_pattern_presence",
    "being_pattern_relation_edge",
    "being_pattern_review_candidate",
];

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub enum BeingPatternStreamEventKind {
    EntityObserved,
    BeingPatternProjected,
    PerspectiveRoleResolved,
    MonoPolyOperatorResolved,
    ClockAddressUpdated,
    AspectEdgeComputed,
    ElementalResonanceChanged,
    PatternPacketFormed,
    ReviewCandidateEmitted,
}

impl BeingPatternStreamEventKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::EntityObserved => "EntityObserved",
            Self::BeingPatternProjected => "BeingPatternProjected",
            Self::PerspectiveRoleResolved => "PerspectiveRoleResolved",
            Self::MonoPolyOperatorResolved => "MonoPolyOperatorResolved",
            Self::ClockAddressUpdated => "ClockAddressUpdated",
            Self::AspectEdgeComputed => "AspectEdgeComputed",
            Self::ElementalResonanceChanged => "ElementalResonanceChanged",
            Self::PatternPacketFormed => "PatternPacketFormed",
            Self::ReviewCandidateEmitted => "ReviewCandidateEmitted",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BeingPatternReviewCandidateProjection {
    pub candidate_id: String,
    pub generation: u64,
    pub entity_ids: Vec<String>,
    pub monopoly_operator: MonoPolyOperator,
    pub review_risk: PasuReviewRisk,
    pub verifier_refs: Vec<BeingPatternProtectedRef>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BeingPatternStreamEvent {
    pub kind: BeingPatternStreamEventKind,
    pub generation: u64,
    pub entity_id: String,
    pub payload: Value,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BeingPatternReplay {
    pub generation: u64,
    pub events: Vec<BeingPatternStreamEvent>,
    pub user_projection: PasuBeingPatternProjection,
    pub school_projection: PasuBeingPatternProjection,
    pub relation_edges: Vec<BeingPatternRelationEdgeProjection>,
    pub review_candidate: BeingPatternReviewCandidateProjection,
    pub m4_consumer_generation: u64,
    pub clock_overlay_generation: u64,
    pub s2_mutation_attempted: bool,
}

pub fn being_pattern_acceptance_replay() -> BeingPatternReplay {
    let generation = 42;
    let user_ref = BeingPatternProtectedRef {
        episode_id: "episode:user-being:42".to_owned(),
        source_ref: "graphiti:episode:user-being:42".to_owned(),
        public_summary: "user-being observed as public-safe live presence".to_owned(),
    };
    let school_ref = BeingPatternProtectedRef {
        episode_id: "episode:school-being:42".to_owned(),
        source_ref: "graphiti:episode:school-being:42".to_owned(),
        public_summary: "school-of-thought-being observed as public-safe live presence".to_owned(),
    };
    let relation_ref = BeingPatternProtectedRef {
        episode_id: "episode:relation:user-school:42".to_owned(),
        source_ref: "graphiti:episode:relation:user-school:42".to_owned(),
        public_summary: "aspect-like relation summary only".to_owned(),
    };

    let relation = BeingPatternRelationEdgeProjection {
        edge_id: "edge:user-being:school-being:42".to_owned(),
        source_entity_id: "user-being".to_owned(),
        target_entity_id: "school-of-thought-being".to_owned(),
        edge_kind: "aspect-like".to_owned(),
        aspect_label: "trine-like-resonance".to_owned(),
        generation,
        m2_m3_relation: M2M3RelationProjection {
            relation_handle: "m2m3:edge:user-being:school-being:42".to_owned(),
            planetary_lens_aspect: "backend-supplied-trine".to_owned(),
            source: "CCT-21 SpaceTimeDB replay".to_owned(),
        },
        elemental_delta: ElementalWeightProjection {
            fire: 0.10,
            water: -0.05,
            air: 0.20,
            earth: 0.0,
        },
        verifier_refs: vec![relation_ref.clone()],
        canon_status: "live-only-review-required".to_owned(),
    };

    let user_projection = projection(
        "user-being",
        "user-being",
        PerspectiveRole::FirstPerson,
        MonoPolyOperator::Mono,
        generation,
        user_ref.clone(),
        vec![relation.clone()],
    );
    let school_projection = projection(
        "school-of-thought-being",
        "school-of-thought-being",
        PerspectiveRole::ThirdPerson,
        MonoPolyOperator::Poly,
        generation,
        school_ref.clone(),
        vec![relation.clone()],
    );

    let review_candidate = BeingPatternReviewCandidateProjection {
        candidate_id: "candidate:actualising-one:42".to_owned(),
        generation,
        entity_ids: vec![
            "user-being".to_owned(),
            "school-of-thought-being".to_owned(),
        ],
        monopoly_operator: MonoPolyOperator::ActualisingOne,
        review_risk: PasuReviewRisk::ForcedUnification,
        verifier_refs: vec![relation_ref],
    };

    let events = [
        BeingPatternStreamEventKind::EntityObserved,
        BeingPatternStreamEventKind::BeingPatternProjected,
        BeingPatternStreamEventKind::PerspectiveRoleResolved,
        BeingPatternStreamEventKind::MonoPolyOperatorResolved,
        BeingPatternStreamEventKind::ClockAddressUpdated,
        BeingPatternStreamEventKind::AspectEdgeComputed,
        BeingPatternStreamEventKind::ElementalResonanceChanged,
        BeingPatternStreamEventKind::PatternPacketFormed,
        BeingPatternStreamEventKind::ReviewCandidateEmitted,
    ]
    .into_iter()
    .map(|kind| BeingPatternStreamEvent {
        kind,
        generation,
        entity_id: match kind {
            BeingPatternStreamEventKind::ReviewCandidateEmitted => {
                review_candidate.candidate_id.clone()
            }
            _ => "user-being".to_owned(),
        },
        payload: json!({"eventKind": kind.as_str(), "generation": generation}),
    })
    .collect();

    BeingPatternReplay {
        generation,
        events,
        user_projection,
        school_projection,
        relation_edges: vec![relation],
        review_candidate,
        m4_consumer_generation: generation,
        clock_overlay_generation: generation,
        s2_mutation_attempted: false,
    }
}

fn projection(
    entity_id: &str,
    entity_kind: &str,
    perspective_role: PerspectiveRole,
    monopoly_operator: MonoPolyOperator,
    generation: u64,
    verifier_ref: BeingPatternProtectedRef,
    relation_edges: Vec<BeingPatternRelationEdgeProjection>,
) -> PasuBeingPatternProjection {
    let graph_anchor = format!("neo4j://s2/Bimba/{entity_id}");
    let mut redis_psyche = BTreeMap::new();
    redis_psyche.insert(
        "presence".to_owned(),
        format!("cache:live:s3:being_pattern:{entity_id}:presence"),
    );
    redis_psyche.insert(
        "state".to_owned(),
        format!("cache:active:s3:being_pattern:{entity_id}:state"),
    );
    let m2_m3_relation = relation_edges
        .first()
        .map(|edge| edge.m2_m3_relation.clone())
        .unwrap_or_else(|| M2M3RelationProjection {
            relation_handle: format!("m2m3:{entity_id}:{generation}"),
            planetary_lens_aspect: "none".to_owned(),
            source: "CCT-21 SpaceTimeDB replay".to_owned(),
        });

    PasuBeingPatternProjection {
        entity_ref: BeingEntityRef {
            entity_id: entity_id.to_owned(),
            entity_kind: entity_kind.to_owned(),
            graph_anchor: graph_anchor.clone(),
            public_label: None,
        },
        stable_identity: StableIdentityHandle {
            graph_anchor,
            identity_handle: format!("s2:identity:{entity_id}"),
            source: "S2 Neo4j canonical graph".to_owned(),
        },
        live_state: LiveStateHandle {
            spacetime_row_id: format!("being_pattern_presence:{entity_id}"),
            generation,
            redis_psyche,
            day_ref: "[[02-06-2026]]".to_owned(),
            now_ref: "[[20260602-120000-being-pattern]]".to_owned(),
            stream_delta: format!("cache:stream:s3:being_pattern:{generation}:delta"),
            graphiti_episode_refs: vec![verifier_ref.clone()],
        },
        observer_anchor: BeingObserverAnchor {
            observer_entity_id: entity_id.to_owned(),
            observer_role: perspective_role,
            anchor_ref: format!("observer:earth-centred:{entity_id}"),
        },
        clock_address: BeingPatternClockAddress {
            degree360: 137,
            tick12: 5,
            hexagram: Some(42),
            line: Some(3),
            source: "CCT-21 SpaceTimeDB replay".to_owned(),
        },
        monopoly_operator,
        perspective_role,
        nara_family_role: None,
        m2_m3_relation,
        bioquaternion_handles: vec![BioQuaternionHandle {
            handle: format!("protected-local://bioquaternion/{entity_id}/current"),
            privacy: "protected-local-body".to_owned(),
            source: "M4 protected handle only".to_owned(),
        }],
        elemental_weights: ElementalWeightProjection {
            fire: 0.30,
            water: 0.20,
            air: 0.40,
            earth: 0.10,
        },
        relation_edges,
        verifier_refs: vec![verifier_ref],
        review_risk: PasuReviewRisk::for_operator(monopoly_operator),
    }
}

pub fn assert_being_pattern_public_safe(value: &Value) -> Result<(), String> {
    const FORBIDDEN_KEYS: &[&str] = &[
        "body",
        "episodeBody",
        "episode_body",
        "protectedPayload",
        "protected_payload",
        "protectedNaraBody",
        "rawQuaternion",
        "raw_quaternion",
        "q_b",
        "q_p",
        "qB",
        "qP",
    ];
    find_forbidden_key(value, FORBIDDEN_KEYS)
        .map(|key| {
            Err(format!(
                "being pattern public-safe payload cannot include {key}"
            ))
        })
        .unwrap_or(Ok(()))
}

fn find_forbidden_key<'a>(value: &Value, forbidden: &'a [&str]) -> Option<&'a str> {
    match value {
        Value::Object(map) => {
            for (key, child) in map {
                if let Some(forbidden_key) = forbidden.iter().find(|candidate| **candidate == key) {
                    return Some(*forbidden_key);
                }
                if let Some(found) = find_forbidden_key(child, forbidden) {
                    return Some(found);
                }
            }
            None
        }
        Value::Array(values) => values
            .iter()
            .find_map(|child| find_forbidden_key(child, forbidden)),
        _ => None,
    }
}
