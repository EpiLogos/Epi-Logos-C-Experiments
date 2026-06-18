use portal_core::{
    kernel_tick_from_epogdoon, BeingEntityRef, BeingObserverAnchor, BeingPatternClockAddress,
    BeingPatternProtectedRef, BeingPatternRelationEdge, BioQuaternionHandle,
    ElementalWeightProjection, M2M3RelationProjection, MathemeHarmonicProfile, MonoPolyOperator,
    PasuBeingPatternProjection, PasuLiveStateHandle, PasuReviewRisk, PerspectiveRole,
    StableIdentityHandle,
};
use serde_json::Value;
use std::collections::BTreeMap;

fn protected_ref(id: &str, source: &str, summary: &str) -> BeingPatternProtectedRef {
    BeingPatternProtectedRef {
        episode_id: id.to_owned(),
        source_ref: source.to_owned(),
        public_summary: summary.to_owned(),
    }
}

fn projection(operator: MonoPolyOperator) -> PasuBeingPatternProjection {
    PasuBeingPatternProjection {
        entity_ref: BeingEntityRef {
            entity_id: "pasu:self".to_owned(),
            entity_kind: "user-being".to_owned(),
            graph_anchor: "neo4j://s2/nodes/being/pasu-self".to_owned(),
            public_label: Some("PASU public identity".to_owned()),
        },
        stable_identity: StableIdentityHandle {
            graph_anchor: "neo4j://s2/nodes/being/pasu-self".to_owned(),
            identity_handle: "being:pasu-self".to_owned(),
            source: "S2 Neo4j canonical graph".to_owned(),
        },
        live_state: PasuLiveStateHandle {
            spacetime_row_id: "being_pattern_presence:pasu-self".to_owned(),
            generation: 42,
            redis_psyche: BTreeMap::from([
                (
                    "presence".to_owned(),
                    "redis://psyche/hot/pasu-self/presence".to_owned(),
                ),
                (
                    "state".to_owned(),
                    "redis://psyche/hot/pasu-self/state".to_owned(),
                ),
            ]),
            day_ref: "Idea/Empty/Present/17-06-2026".to_owned(),
            now_ref: "Idea/Empty/Present/17-06-2026/20260617T181955Z/now.md".to_owned(),
            stream_delta: "redis://psyche/stream/pasu-self/42".to_owned(),
            graphiti_episode_refs: vec![protected_ref(
                "graphiti:episode:pasu-self:42",
                "graphiti://episodes/pasu-self/42",
                "public live-state summary",
            )],
        },
        observer_anchor: BeingObserverAnchor {
            observer_entity_id: "earth-observer".to_owned(),
            observer_role: PerspectiveRole::FirstPerson,
            anchor_ref: "Earth".to_owned(),
        },
        clock_address: BeingPatternClockAddress {
            degree360: 137,
            tick12: 5,
            hexagram: Some(42),
            line: Some(3),
            source: "portal-core".to_owned(),
        },
        monopoly_operator: operator,
        perspective_role: PerspectiveRole::FirstPerson,
        nara_family_role: None,
        m2_m3_relation: M2M3RelationProjection {
            relation_handle: "m2m3://relation/pasu-self/trine".to_owned(),
            planetary_lens_aspect: "backend-supplied-trine".to_owned(),
            source: "S3 CCT-21".to_owned(),
        },
        bioquaternion_handles: vec![
            BioQuaternionHandle {
                handle: "protected://bioquaternion/q_identity".to_owned(),
                privacy: "protected-local-body".to_owned(),
                source: "PASU".to_owned(),
            },
            BioQuaternionHandle {
                handle: "protected://bioquaternion/q_personal".to_owned(),
                privacy: "protected-local-body".to_owned(),
                source: "PASU".to_owned(),
            },
            BioQuaternionHandle {
                handle: "protected://pattern-packets/pasu-self/42".to_owned(),
                privacy: "protected-local-body".to_owned(),
                source: "CCT-21".to_owned(),
            },
        ],
        elemental_weights: ElementalWeightProjection {
            fire: 0.3,
            water: 0.2,
            air: 0.4,
            earth: 0.1,
        },
        relation_edges: vec![BeingPatternRelationEdge {
            edge_id: "edge:pasu-self:school".to_owned(),
            source_entity_id: "pasu:self".to_owned(),
            target_entity_id: "school-of-thought-being".to_owned(),
            edge_kind: "aspect-like".to_owned(),
            aspect_label: "trine-like-resonance".to_owned(),
            generation: 42,
            m2_m3_relation: M2M3RelationProjection {
                relation_handle: "m2m3://relation/pasu-self/trine".to_owned(),
                planetary_lens_aspect: "backend-supplied-trine".to_owned(),
                source: "S3 CCT-21".to_owned(),
            },
            elemental_delta: ElementalWeightProjection {
                fire: 0.1,
                water: 0.0,
                air: 0.0,
                earth: 0.0,
            },
            verifier_refs: vec![protected_ref(
                "review:edge:pasu-self:school",
                "m5-review://candidate/edge:pasu-self:school",
                "candidate relation edge awaits M5 review and M0 witness",
            )],
            canon_status: "live-only".to_owned(),
        }],
        verifier_refs: vec![protected_ref(
            "review:pasu-self",
            "m5-review://candidate/pasu-self",
            "PASU being pattern verifier candidate",
        )],
        review_risk: PasuReviewRisk::for_operator(operator),
    }
}

#[test]
fn pasu_being_pattern_serializes_live_state_without_canon_mutation_or_private_bodies() {
    let profile = MathemeHarmonicProfile::with_pasu_being_pattern(
        kernel_tick_from_epogdoon(3, 5),
        projection(MonoPolyOperator::Poly),
    );

    let value = serde_json::to_value(&profile).expect("profile serializes");
    let pasu = &value["pasuBeingPattern"];

    assert_eq!(
        pasu["stableIdentity"]["graphAnchor"],
        "neo4j://s2/nodes/being/pasu-self"
    );
    assert_eq!(
        pasu["liveState"]["spacetimeRowId"],
        "being_pattern_presence:pasu-self"
    );
    assert_eq!(pasu["liveState"]["streamGeneration"], 42);
    assert_eq!(
        pasu["liveState"]["redisPsyche"]["presence"],
        "redis://psyche/hot/pasu-self/presence"
    );
    assert_eq!(pasu["liveState"]["dayRef"], "Idea/Empty/Present/17-06-2026");
    assert_eq!(
        pasu["liveState"]["graphitiEpisodeRefs"][0]["episodeId"],
        "graphiti:episode:pasu-self:42"
    );
    assert_eq!(
        pasu["relationEdges"][0]["m2M3Relation"]["planetaryLensAspect"],
        "backend-supplied-trine"
    );
    assert_eq!(pasu["relationEdges"][0]["canonStatus"], "live-only");
    assert!(
        pasu.get("canonMutation").is_none(),
        "live relation edge must not mutate S2 canon"
    );

    let rendered = serde_json::to_string(&value).expect("json string");
    for forbidden in [
        "episodeBody",
        "rawQuaternion",
        "privateIdentityData",
        "s2CanonMutation",
    ] {
        assert!(
            !rendered.contains(forbidden),
            "leaked forbidden key {forbidden}: {rendered}"
        );
    }
}

#[test]
fn actualising_one_forces_review_risk_but_stays_displayable() {
    let value: Value = serde_json::to_value(projection(MonoPolyOperator::ActualisingOne))
        .expect("projection serializes");

    assert_eq!(value["monopolyOperator"], "ActualisingOne");
    assert_eq!(value["reviewRisk"], "forced-unification");
    assert_eq!(value["perspectiveRole"], "FirstPerson");
}
