use epi_logos::gate::kernel_bridge_runtime::{
    extract_typed_json, typed_json_profile_event_payload, KernelBridgeCachedProfile,
    KernelBridgeProfileJsonShape,
};
use portal_core::{
    kernel_tick_from_epogdoon, AnuttaraWitnessBandBalance, AnuttaraWitnessPalindromeState,
    AnuttaraWitnessProjection, AnuttaraWitnessRFactorBand, AnuttaraWitnessRFactorPathStep,
    BeingEntityRef, BeingObserverAnchor, BeingPatternClockAddress, BioQuaternionHandle,
    ElementalWeightProjection, M2M3RelationProjection, MathemeHarmonicProfile, MonoPolyOperator,
    PasuBeingPatternProjection, PasuLiveStateHandle, PasuReviewRisk, PendingPlanetDatasetBadge,
    PerspectiveRole, PlanetApertureAspectEdge, PlanetPlanetAspectEdge, StableIdentityHandle,
};
use std::collections::BTreeMap;

fn pasu_projection() -> PasuBeingPatternProjection {
    PasuBeingPatternProjection {
        entity_ref: BeingEntityRef {
            entity_id: "pasu:self".to_owned(),
            entity_kind: "user-being".to_owned(),
            graph_anchor: "neo4j://s2/nodes/being/pasu-self".to_owned(),
            public_label: None,
        },
        stable_identity: StableIdentityHandle {
            graph_anchor: "neo4j://s2/nodes/being/pasu-self".to_owned(),
            identity_handle: "being:pasu-self".to_owned(),
            source: "S2 Neo4j canonical graph".to_owned(),
        },
        live_state: PasuLiveStateHandle {
            spacetime_row_id: "being_pattern_presence:pasu-self".to_owned(),
            generation: 77,
            redis_psyche: BTreeMap::from([(
                "state".to_owned(),
                "redis://psyche/hot/pasu-self".to_owned(),
            )]),
            day_ref: "Idea/Empty/Present/17-06-2026".to_owned(),
            now_ref: "Idea/Empty/Present/17-06-2026/20260617T181955Z/now.md".to_owned(),
            stream_delta: "redis://psyche/stream/pasu-self/77".to_owned(),
            graphiti_episode_refs: vec![],
        },
        observer_anchor: BeingObserverAnchor {
            observer_entity_id: "earth-observer".to_owned(),
            observer_role: PerspectiveRole::IntegralWeI,
            anchor_ref: "Earth".to_owned(),
        },
        clock_address: BeingPatternClockAddress {
            degree360: 137,
            tick12: 5,
            hexagram: None,
            line: None,
            source: "portal-core".to_owned(),
        },
        monopoly_operator: MonoPolyOperator::ActualisingOne,
        perspective_role: PerspectiveRole::IntegralWeI,
        nara_family_role: None,
        m2_m3_relation: M2M3RelationProjection {
            relation_handle: "m2m3://relation/pasu-self/trine".to_owned(),
            source: "S3 CCT-21".to_owned(),
            planet_planet_edges: vec![PlanetPlanetAspectEdge {
                planet_a: 0,
                planet_b: 4,
                aspect_type: 120,
                angle: 120.0,
                orb: 1.5,
            }],
            planet_aperture_edges: vec![PlanetApertureAspectEdge {
                planet: 0,
                lens_id: 2,
                aperture_phase: 137,
                aspect_type: 120,
                orb: 1.5,
            }],
            pending_dataset_badges: vec![PendingPlanetDatasetBadge {
                planet: 7,
                badge: "track-23.10-pending".to_owned(),
            }],
        },
        bioquaternion_handles: vec![BioQuaternionHandle {
            handle: "protected://bio/q_identity".to_owned(),
            privacy: "protected-local-body".to_owned(),
            source: "PASU".to_owned(),
        }],
        elemental_weights: ElementalWeightProjection {
            fire: 0.0,
            water: 0.0,
            air: 0.0,
            earth: 0.4,
        },
        relation_edges: vec![],
        verifier_refs: vec![],
        review_risk: PasuReviewRisk::for_operator(MonoPolyOperator::ActualisingOne),
    }
}

fn anuttara_witness_projection() -> AnuttaraWitnessProjection {
    AnuttaraWitnessProjection {
        virtue_witness_vector: 0b111_000_101,
        syntax_witness_vector: 0b1001,
        rfactor_path: vec![
            AnuttaraWitnessRFactorPathStep {
                r_factor: 1,
                base_route: "Nara".to_owned(),
                band: AnuttaraWitnessRFactorBand::Pravritti,
                position: 4,
                is_turn: false,
            },
            AnuttaraWitnessRFactorPathStep {
                r_factor: 2,
                base_route: "Shakti".to_owned(),
                band: AnuttaraWitnessRFactorBand::Pravritti,
                position: 5,
                is_turn: true,
            },
            AnuttaraWitnessRFactorPathStep {
                r_factor: 3,
                base_route: "Shakti".to_owned(),
                band: AnuttaraWitnessRFactorBand::Nivritti,
                position: 0,
                is_turn: false,
            },
        ],
        band_balance: AnuttaraWitnessBandBalance {
            pravritti_depth: 2,
            nivritti_depth: 1,
            reached_turn: true,
            returned: false,
        },
        palindrome_state: AnuttaraWitnessPalindromeState {
            normal_form_symmetric: false,
            mirror_normal_form: "R1@Nara/4|(@#)|R3@Shakti/0".to_owned(),
        },
        open_questions: vec!["Law-6:R3@Shakti:return?".to_owned()],
        coherence_score: 0.625,
    }
}

#[test]
fn typed_json_profile_event_carries_pasu_being_pattern_edge() {
    let profile = MathemeHarmonicProfile::with_pasu_being_pattern(
        kernel_tick_from_epogdoon(6, 5),
        pasu_projection(),
    );
    let profile_value = serde_json::to_value(profile).expect("profile serializes");
    let cached = KernelBridgeCachedProfile {
        generation: 77,
        cached_at_ms: 1234,
        stale: false,
        staleness_ms: 0,
        privacy_class: "safe-public-current-kernel-tick".to_owned(),
        profile: profile_value,
    };

    let shape = typed_json_profile_event_payload(&cached).expect("typed profile json extracts");
    assert_eq!(
        shape.profile["pasuBeingPattern"]["monopolyOperator"],
        "ActualisingOne"
    );
    assert_eq!(
        shape.profile["pasuBeingPattern"]["perspectiveRole"],
        "IntegralWeI"
    );
    assert_eq!(
        shape.profile["pasuBeingPattern"]["stableIdentity"]["graphAnchor"],
        "neo4j://s2/nodes/being/pasu-self"
    );
    assert_eq!(
        shape.profile["pasuBeingPattern"]["reviewRisk"],
        "forced-unification"
    );

    let round_trip: KernelBridgeProfileJsonShape =
        extract_typed_json(&serde_json::to_value(shape).unwrap(), "round trip").unwrap();
    assert_eq!(
        round_trip.profile["pasuBeingPattern"]["liveState"]["streamGeneration"],
        77
    );

    let rendered = serde_json::to_string(&round_trip).unwrap();
    assert!(!rendered.contains("s2CanonMutation"));
    assert!(!rendered.contains("rawQuaternion"));
    assert!(!rendered.contains("episodeBody"));
}

#[test]
fn typed_json_profile_event_carries_anuttara_witness_without_gate_semantics() {
    let profile = MathemeHarmonicProfile::with_anuttara_witness(
        kernel_tick_from_epogdoon(4, 5),
        anuttara_witness_projection(),
    );
    let profile_value = serde_json::to_value(profile).expect("profile serializes");
    let cached = KernelBridgeCachedProfile {
        generation: 88,
        cached_at_ms: 1234,
        stale: false,
        staleness_ms: 0,
        privacy_class: "safe-public-current-kernel-tick".to_owned(),
        profile: profile_value,
    };

    let shape = typed_json_profile_event_payload(&cached).expect("typed profile json extracts");
    let witness = &shape.profile["anuttaraWitness"];
    assert_eq!(witness["virtueWitnessVector"], 0b111_000_101);
    assert_eq!(witness["syntaxWitnessVector"], 0b1001);
    assert_eq!(witness["rfactorPath"][0]["band"], "pravritti");
    assert_eq!(witness["rfactorPath"][2]["band"], "nivritti");
    assert_eq!(witness["rfactorPath"][1]["isTurn"], true);
    assert_eq!(witness["bandBalance"]["reachedTurn"], true);
    assert_eq!(
        witness["palindromeState"]["mirrorNormalForm"],
        "R1@Nara/4|(@#)|R3@Shakti/0"
    );
    assert_eq!(witness["openQuestions"][0], "Law-6:R3@Shakti:return?");

    let performance =
        epi_logos::gate::kernel_bridge_runtime::typed_json_performance_event_from_profile(
            88,
            &MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 5)),
        );
    assert!(
        !performance
            .required_profile_fields
            .iter()
            .any(|field| field == "anuttaraWitness"),
        "anuttaraWitness is emit-only and must not become a bridge-required gate"
    );
}
