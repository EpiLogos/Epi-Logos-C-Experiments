//! Coordinate: S0/M4' (medicine snapshot + governed pin proof - 25.T25.10)
//! Residency: Body/S/S0/epi-cli/tests
//! Position (#n): real gateway/filesystem verification boundary
//! Actualises: read-only medicine LUT projection and one S1-governed NOW pin.
//! Public surface: `cargo test --test gate_nara_medicine_snapshot`.
//! Does NOT own: medical authority, prescriptions, or medicine LUT law.
//! Contract: [[S0-SPEC]] / [[S1-SPEC]] / [[M4'-SPEC]].

mod support;

use serde_json::json;
use std::fs;
use support::{TestEnv, TestGatewayClient};

#[tokio::test]
async fn medicine_snapshot_reads_real_luts_and_pin_persists_once_to_now() {
    let env = TestEnv::with_fake_pi();
    let now_path = env.root.join("NOW.md");
    fs::write(
        &now_path,
        "---\ncoordinate: M4\nc_4_pinned_materia: []\n---\n\n# NOW\n",
    )
    .unwrap();
    let env = env.with_env("EPI_NOW_PATH", now_path.to_string_lossy());
    let mut client = TestGatewayClient::connect(env, 18949).await;
    client.request("connect", json!({})).await.unwrap();

    let snapshot = client
        .request("nara.medicine.snapshot", json!({ "sunDegree": 15.0 }))
        .await
        .expect("medicine snapshot should be live");
    assert_eq!(snapshot["activeDecan"]["decanIdx"], 1);
    assert_eq!(
        snapshot["activeDecan"]["bodyPart"],
        "Eyes and sinuses - the vision centers"
    );
    assert_eq!(snapshot["activeDecan"]["rulingPlanet"], "Sun");
    assert_eq!(snapshot["activeDecan"]["herbs"][0]["vernacular"], "Nettle");
    let chakras = snapshot["chakras"].as_array().unwrap();
    assert_eq!(chakras.len(), 8);
    assert_eq!(
        chakras
            .iter()
            .map(|row| row["bodyZones"].as_array().unwrap().len())
            .sum::<usize>(),
        75
    );
    for (chakra_id, element_id) in [(1, 1), (2, 2), (3, 4), (4, 3)] {
        let row = chakras
            .iter()
            .find(|row| row["id"] == chakra_id)
            .expect("operative chakra row");
        assert_eq!(row["dominantElementId"], element_id);
    }

    for _ in 0..2 {
        client
            .request("nara.medicine.pin", json!({ "materia": "Nettle" }))
            .await
            .expect("pin should persist through the gateway");
    }
    let persisted = fs::read_to_string(&now_path).unwrap();
    assert_eq!(persisted.matches("Nettle").count(), 1);
    assert!(persisted.ends_with("# NOW\n"));
}
