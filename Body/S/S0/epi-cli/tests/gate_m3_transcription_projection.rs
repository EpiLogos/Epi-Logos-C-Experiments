//! Coordinate: S0/S2/S5'/M3' transcription-projection live edge (12.T12.38).
//! Residency: Body/S/S0/epi-cli/tests.
//! Position (#n): real gateway verification boundary.
//! Actualises: live M3 musical-transcript and Ananda-position projections.
//! Public surface: `cargo test --test gate_m3_transcription_projection`.
//! Does NOT own: M3 transcription law or S2 coordinate semantics.
//! Contract: [[S0-SPEC]] / [[S2-SPEC]] / [[S5-SPEC]] / [[M3'-SPEC]].

mod support;

use serde_json::json;
use support::{TestEnv, TestGatewayClient};

const MUSICAL_TRANSCRIPT_METHOD: &str = "s5'.gnostic.musical_transcript";
const ANANDA_POSITION_METHOD: &str = "s2.graph.ananda_position";

fn vak_address() -> serde_json::Value {
    json!({
        "cpf": "(4.0/1-4.4/5)",
        "ct": ["0", "1", "2", "3"],
        "cp": "4.3",
        "cf": "(0/1/2/3)",
        "cfp": "M3",
        "cs": {
            "code": "CS3",
            "direction": "Day",
            "recognized": true
        }
    })
}

#[tokio::test]
async fn live_gateway_projects_m3_transcription_and_ananda_from_the_same_vak_envelope() {
    let env = TestEnv::with_fake_pi();
    let mut client = TestGatewayClient::connect(env, 18951).await;
    client.request("connect", json!({})).await.unwrap();

    let transcript = client
        .request(
            MUSICAL_TRANSCRIPT_METHOD,
            json!({
                "vakAddress": vak_address(),
                "cycle": 2,
                "subTick": 3,
                "clockDegree": 120
            }),
        )
        .await
        .expect("the real gateway should expose the M3 musical transcript");
    assert_eq!(transcript["cfMapping"], "logos");
    assert_eq!(transcript["diatonicPosition"], "f");
    assert_eq!(transcript["hexagramId"], 21);
    assert!(transcript["codon"].as_u64().is_some());
    assert!(transcript["anandaPosition"].as_u64().is_some());
    assert_eq!(transcript["anandaFamily"], "diff-a");

    let ananda = client
        .request(
            ANANDA_POSITION_METHOD,
            json!({ "vakAddress": vak_address() }),
        )
        .await
        .expect("the real gateway should expose the Ananda coordinate projection");
    assert_eq!(ananda["route"], ANANDA_POSITION_METHOD);
    assert_eq!(ananda["position"], 3);
    assert_eq!(ananda["family"], "diff-a");
    assert_eq!(ananda["spandaStage"], 3);

    let error = client
        .request(MUSICAL_TRANSCRIPT_METHOD, json!({ "clockDegree": 120 }))
        .await
        .expect_err("a VAK envelope is required to prevent an unaddressed projection");
    assert!(error.message.contains("vakAddress"), "{error:?}");
}
