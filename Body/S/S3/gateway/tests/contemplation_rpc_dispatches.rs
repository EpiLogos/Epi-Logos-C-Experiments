//! Contemplation dispatch — route law + pure-helper unit tests (S3 side).
//!
//! Live counterpart: `Body/S/S0/epi-cli/tests/gate_contemplation_live.rs`.
//!
//! This file exercises two things that do NOT require a WebSocket:
//!
//!   * The *route law* — `classify_method(CONTEMPLATE_SESSION_CLOSE_METHOD)`
//!     resolves the method to a Nara extension owned by the S4/S5 domain
//!     adapter. This is genuine S3 route-table law and stays here.
//!   * The *pure helper* — `contemplate_session_close(..)` composes a
//!     `wisdom_delta` / triplet from a hand-built `ContemplationObject`
//!     carrying `deterministic_mock: true`. These are unit tests of the
//!     composition function's arithmetic; the object is synthetic and never
//!     travels over a real surface.
//!
//! The live counterpart above drives the same complete request envelope through
//! `nara.contemplate_session_close` over the actual gateway WebSocket dispatch
//! loop. Keep the input and response contract in lockstep with that test.

use epi_s3_gateway::dispatch::{
    classify_method, contemplate_session_close, ContemplationObject, ContemplationTick,
    EngagedCoordinateResonance, GatewayDispatchClass, GatewayDispatchOwner, M0VerifierReport,
    PiContemplationInstance, PsycheAnchor, CONTEMPLATE_SESSION_CLOSE_METHOD,
};

fn synthetic_contemplation_object() -> ContemplationObject {
    ContemplationObject {
        session_id: "session-close-19-t19-6".to_owned(),
        q_nara: "q_Nara".to_owned(),
        pi_instance: PiContemplationInstance {
            id: "deterministic-pi-4p".to_owned(),
            deterministic_mock: true,
            loaded_agents: vec![
                "Nous".to_owned(),
                "Moirai".to_owned(),
                "Sophia".to_owned(),
                "Psyche".to_owned(),
            ],
            recognition_state: "recognition-state integrates close-of-session contour".to_owned(),
        },
        engaged_coordinates: vec![
            EngagedCoordinateResonance {
                coordinate: "M3.COMP".to_owned(),
                target_resonance_vector: vec![0.2, 0.4, 0.6],
            },
            EngagedCoordinateResonance {
                coordinate: "M3.MOVE".to_owned(),
                target_resonance_vector: vec![0.4, 0.6, 0.8],
            },
            EngagedCoordinateResonance {
                coordinate: "M3.RES".to_owned(),
                target_resonance_vector: vec![0.6, 0.8, 1.0],
            },
        ],
        trajectory: vec![
            ContemplationTick {
                tick_id: "t0".to_owned(),
                gauge: "COMP".to_owned(),
                actual_resonance: vec![0.2, 0.4, 0.6],
                codon: Some("I".to_owned()),
            },
            ContemplationTick {
                tick_id: "t1".to_owned(),
                gauge: "MOVE".to_owned(),
                actual_resonance: vec![0.4, 0.6, 0.8],
                codon: Some("V".to_owned()),
            },
            ContemplationTick {
                tick_id: "t2".to_owned(),
                gauge: "RES".to_owned(),
                actual_resonance: vec![0.61, 0.79, 1.0],
                codon: Some("X".to_owned()),
            },
        ],
        psyche_anchor: PsycheAnchor {
            cards: vec!["The Fool".to_owned(), "The Hierophant".to_owned()],
            codons: vec!["I".to_owned(), "V".to_owned()],
        },
        verifier_report: M0VerifierReport {
            virtue_witness_vector: vec![true, true, true, true, true, false, true, false, true],
            unsatisfied_constraints: vec!["#R0-0/1/A-T7-pending?".to_owned()],
            coherence_score: 0.82,
        },
    }
}

#[test]
fn contemplation_rpc_dispatches_as_headless_nara_extension() {
    let route = classify_method(CONTEMPLATE_SESSION_CLOSE_METHOD)
        .expect("contemplation close RPC should route through gateway");

    assert_eq!(route.owner, GatewayDispatchOwner::S4S5DomainAdapter);
    assert_eq!(route.class, GatewayDispatchClass::NaraExtension);
    assert_eq!(route.coordinate_owner, "M4'/S4");
    assert_eq!(route.agent_access_owner, "S4/S5");
}

// Pure-helper unit test: composition arithmetic over an isolated object. The
// live counterpart named in the module header proves the same function through
// the WebSocket boundary.
#[test]
fn contemplation_session_close_composes_non_empty_wisdom_delta() {
    let response = contemplate_session_close(synthetic_contemplation_object())
        .expect("synthetic contemplation object should close");

    assert_eq!(response.method, CONTEMPLATE_SESSION_CLOSE_METHOD);
    assert!(response.wisdom_delta.contains("4'-5'-0'"));
    assert!(response.wisdom_delta.contains("gauge-trio"));
    assert!(response.wisdom_delta.contains("arch-9"));
    assert_eq!(response.triplet.llm.position, "4'");
    assert_eq!(response.triplet.ebm.position, "5'");
    assert_eq!(response.triplet.verifier.position, "0'");
    assert_eq!(response.triplet.ebm.per_tick_energy.len(), 3);
    assert!(response.triplet.ebm.gradient_magnitude < 0.1);
    assert!(response.triplet.llm.psyche_anchor_coherent);
}

// Pure-helper unit test (see module header). Live counterpart:
// `Body/S/S0/epi-cli/tests/gate_contemplation_live.rs`.
#[test]
fn verifier_symbolic_coordinate_questions_round_trip_through_anima() {
    let response = contemplate_session_close(synthetic_contemplation_object())
        .expect("synthetic contemplation object should close");

    assert_eq!(response.symbolic_round_trips.len(), 1);
    let round_trip = &response.symbolic_round_trips[0];
    assert_eq!(round_trip.raw, "#R0-0/1/A-T7-pending?");
    assert_eq!(round_trip.parsed.coordinate, "R0-0/1/A");
    assert_eq!(round_trip.parsed.tranche, "T7");
    assert_eq!(round_trip.parsed.status, "pending");
    assert_eq!(round_trip.parser_skill, "anuttara-symbolic-parse");
    assert_eq!(round_trip.anima_reverification_route, "anima.reverify");
    assert!(round_trip.routed_back_through_anima);
    assert!(round_trip.llm_response.contains("R0-0/1/A"));
}
