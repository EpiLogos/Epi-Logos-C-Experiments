//! Coordinate: S0/S2/S3'/S4 live VAK languification profile edge.
//! Residency: Body/S/S0/epi-cli/tests.
//! Position (#n): real WebSocket gateway verification boundary.
//! Actualises: 36.T36.8 `sessions.patch` to shared `profile.update` projection.
//! Public surface: `cargo test --test gate_vak_languification_profile`.
//! Does NOT own: VAK evaluation, M0 address law, or renderer presentation.
//! Contract: [[S0-SPEC]] / [[S3-SPEC]] / [[M'-SYSTEM-SPEC]].

mod support;

use serde_json::{json, Value};
use support::TestGatewayClient;

async fn seed_session(client: &mut TestGatewayClient) {
    let accepted = client
        .request(
            "agent",
            json!({
                "sessionKey": "agent:main:main",
                "message": "seed session for languification projection",
                "idempotencyKey": "gate-vak-languification-profile-seed",
            }),
        )
        .await
        .expect("seed agent call should succeed");
    let run_id = accepted["runId"]
        .as_str()
        .expect("agent receipt carries runId");
    client
        .request("agent.wait", json!({ "runId": run_id, "timeoutMs": 2_000 }))
        .await
        .expect("seed agent wait should succeed");
}

fn vak(cpf: &str, cf: &str, recognized: bool) -> Value {
    json!({
        "cpf": cpf,
        "ct": ["CT4"],
        "cp": "CP4.5",
        "cf": cf,
        "cfp": "CFP5",
        "cs": {
            "code": "CS5",
            "direction": "Night'",
            "recognized": recognized
        }
    })
}

async fn patch_and_read_trace(
    client: &mut TestGatewayClient,
    cpf: &str,
    cf: &str,
    recognized: bool,
) -> Value {
    client
        .request(
            "sessions.patch",
            json!({
                "sessionKey": "agent:main:main",
                "vakAddress": vak(cpf, cf, recognized)
            }),
        )
        .await
        .expect("sessions.patch accepts the authoritative VAK evaluation");

    client.next_event("profile.update").await["payload"]["harmonicProfile"]
        ["vakLanguificationTrace"]
        .clone()
}

#[tokio::test]
async fn live_profile_bus_projects_dialogical_aperture_and_recognized_closure() {
    let mut client = TestGatewayClient::connected_with_temp_store(18964).await;
    seed_session(&mut client).await;

    let para = patch_and_read_trace(&mut client, "(00/00)", "(00/00)", false).await;
    assert_eq!(para["cpfNotation"], "(00/00)");
    assert_eq!(para["cfNotation"], "(00/00)");
    assert_eq!(para["m0Address"], "M0-2:00/00");
    assert_eq!(para["vakLevel"], "para");
    assert_eq!(para["biasWeightsEmpty"], true);
    assert_eq!(para["recognitionClosed"], false);

    let vaikhari = patch_and_read_trace(&mut client, "(4.0/1-4.4/5)", "(5/0)", true).await;
    assert_eq!(vaikhari["cpfNotation"], "(4.0/1-4.4/5)");
    assert_eq!(vaikhari["cfNotation"], "(5/0)");
    assert_eq!(vaikhari["m0Address"], "M0-5");
    assert_eq!(vaikhari["vakLevel"], "vaikhari");
    assert_eq!(vaikhari["diatonicDegree"], 0);
    assert_eq!(vaikhari["biasWeightsEmpty"], false);
    assert_eq!(vaikhari["recognitionClosed"], true);
    assert!(vaikhari["resonance72Index"].as_u64().is_some());
    assert_eq!(
        vaikhari["halfDecanIndex"].as_u64(),
        vaikhari["resonance72Index"].as_u64().map(|index| index / 2)
    );
}
