//! Live-gateway contemplation surface test (S0 side — companion to
//! `Body/S/S3/gateway/tests/contemplation_rpc_dispatches.rs`).
//!
//! This drives `nara.contemplate_session_close` through the actual WebSocket
//! dispatch loop and asserts the complete 4'-5'-0' envelope returned by the
//! S3-owned composition function. The input supplies the domain evidence;
//! the gateway never fabricates a contemplation object.

mod support;

use epi_s3_gateway::dispatch::{
    classify_method, GatewayDispatchClass, GatewayDispatchOwner, CONTEMPLATE_SESSION_CLOSE_METHOD,
};
use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn contemplation_close_over_live_gateway_composes_triplet_response() {
    let mut client = TestGatewayClient::connected_with_temp_store(18941).await;

    // A sibling nara method proves the live extension route is serving before
    // the contemplation request drives its own adapter.
    let opened = client
        .request(
            "nara.session_open",
            json!({ "session_id": "contemplation-live-probe", "kairos": 1_700_000_000_000u64 }),
        )
        .await
        .expect("nara.session_open must dispatch live over the nara extension route");
    assert_eq!(
        opened["ok"], true,
        "live nara.session_open must return a real protein-handle envelope"
    );
    assert!(
        opened["protein_handle"].as_str().is_some_and(
            |handle| handle.starts_with("m4-protein://session/contemplation-live-probe/")
        ),
        "live nara.session_open must mint the real m4-protein handle, got {:?}",
        opened["protein_handle"]
    );
    assert!(
        opened["start_codon"].is_number(),
        "live nara.session_open must carry a real start_codon"
    );

    // The S3 route table recognises the contemplation method as a Nara
    // extension owned by the S4/S5 domain adapter.
    let route = classify_method(CONTEMPLATE_SESSION_CLOSE_METHOD)
        .expect("contemplation close must classify as a routed nara extension method");
    assert_eq!(route.owner, GatewayDispatchOwner::S4S5DomainAdapter);
    assert_eq!(route.class, GatewayDispatchClass::NaraExtension);
    assert_eq!(route.coordinate_owner, "M4'/S4");
    assert_eq!(route.agent_access_owner, "S4/S5");

    let result = client
        .request(
            CONTEMPLATE_SESSION_CLOSE_METHOD,
            json!({
                "session_id": "contemplation-live-probe",
                "q_nara": "q_Nara",
                "pi_instance": {
                    "id": "pi-live-contemplation",
                    "recognition_state": "trajectory returned through the disclosed gauge",
                    "loaded_agents": ["Nous", "Moirai", "Sophia", "Psyche"]
                },
                "engaged_coordinates": [
                    { "coordinate": "M3.COMP", "target_resonance_vector": [0.2, 0.4, 0.6] }
                ],
                "trajectory": [
                    { "tick_id": "t0", "gauge": "COMP", "actual_resonance": [0.2, 0.4, 0.6], "codon": "I" }
                ],
                "psyche_anchor": { "cards": ["The Magician"], "codons": ["I"] },
                "verifier_report": {
                    "virtue_witness_vector": [true, true, true, true, true, true, true, true, true],
                    "unsatisfied_constraints": ["#R0-0/1/A-T7-pending?"],
                    "coherence_score": 1.0
                }
            }),
        )
        .await
        .expect("contemplation close must return its real gateway response");

    assert_eq!(result["method"], CONTEMPLATE_SESSION_CLOSE_METHOD);
    assert_eq!(result["session_id"], "contemplation-live-probe");
    assert!(result["wisdom_delta"]
        .as_str()
        .is_some_and(|delta| delta.contains("4'-5'-0'")));
    assert_eq!(result["triplet"]["llm"]["position"], "4'");
    assert_eq!(result["triplet"]["ebm"]["position"], "5'");
    assert_eq!(result["triplet"]["verifier"]["position"], "0'");
    assert_eq!(
        result["symbolic_round_trips"][0]["anima_reverification_route"],
        "anima.reverify"
    );
}
