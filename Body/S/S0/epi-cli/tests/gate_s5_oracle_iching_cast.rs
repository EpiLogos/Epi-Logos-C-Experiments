//! Coordinate: S0/S3/S5/M3' governed I-Ching cast edge (24.T24.14).
//! Residency: Body/S/S0/epi-cli/tests.
//! Position (#n): real gateway verification boundary.
//! Actualises: one kernel-authoritative three-coin cast, persistence, and strict provenance.
//! Public surface: `cargo test --test gate_s5_oracle_iching_cast`.
//! Does NOT own: oracle randomness, hexagram law, or M3' ribbon presentation.
//! Contract: `s5.oracle.iching.cast`.

mod support;

use serde_json::{json, Value};
use support::{TestEnv, TestGatewayClient};

fn assert_cast_receipt(receipt: &Value) {
    assert_eq!(receipt["cast_method"], "three-coin");
    assert_eq!(
        receipt["provenance"],
        "epi-cli.nara.oracle.iching.three-coin"
    );

    let lines = receipt["lines"]
        .as_array()
        .expect("cast receipt must contain six lines");
    assert_eq!(lines.len(), 6);
    assert!(lines
        .iter()
        .all(|line| matches!(line.as_u64(), Some(6 | 7 | 8 | 9))));

    let primary = receipt["primary_hexagram_id"]
        .as_u64()
        .expect("primary hexagram id must be numeric");
    assert!((1..=64).contains(&primary));

    if let Some(derived) = receipt["derived_hexagram_id"].as_u64() {
        assert!((1..=64).contains(&derived));
    } else {
        assert!(receipt["derived_hexagram_id"].is_null());
    }

    let changing = receipt["changing_line_indices"]
        .as_array()
        .expect("changing-line indices must be an array");
    let expected: Vec<u64> = lines
        .iter()
        .enumerate()
        .filter_map(|(index, line)| {
            matches!(line.as_u64(), Some(6 | 9)).then_some(index as u64)
        })
        .collect();
    let actual: Vec<u64> = changing
        .iter()
        .map(|index| {
            index
                .as_u64()
                .expect("changing-line indices must be integers")
        })
        .collect();
    assert_eq!(actual, expected);
}

#[tokio::test]
async fn live_gateway_casts_and_persists_governed_iching_receipts() {
    let env = TestEnv::with_fake_pi();
    let mut client = TestGatewayClient::connect(env, 18953).await;
    client.request("connect", json!({})).await.unwrap();

    let first = client
        .request(
            "s5.oracle.iching.cast",
            json!({ "castMethod": "three-coin" }),
        )
        .await
        .expect("the real gateway must dispatch a governed I-Ching cast");
    let second = client
        .request(
            "s5.oracle.iching.cast",
            json!({ "castMethod": "three-coin" }),
        )
        .await
        .expect("the real gateway must persist and dispatch a second cast");

    assert_cast_receipt(&first);
    assert_cast_receipt(&second);
    assert_eq!(
        second["cast_id"].as_u64(),
        first["cast_id"].as_u64().map(|cast_id| cast_id + 1),
        "cast ids must advance from persisted Nara oracle history"
    );
}
