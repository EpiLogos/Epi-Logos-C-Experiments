//! Coordinate: S0 membrane -> M4 oracle composite (rerun 25.T25.8/25.T25.9)
//! Residency: Body/S/S0/epi-cli/tests
//! Position (#n): #4 - spawned-gateway proof for typed oracle casts and history.
//! Actualises: real WebSocket casts, persisted structured history, and durable
//!   OracleSpreadPosition aliveness transitions over one temporary Nara home.
//! Public surface: test-only.
//! Does NOT own: oracle law or carrier rendering.
//! Contract: [[M4-SPEC]] / design-recon 25.T25.8-25.T25.9.

mod support;

use serde_json::{json, Value};
use support::TestGatewayClient;

fn field<'a>(value: &'a Value, key: &str) -> &'a Value {
    value
        .get(key)
        .unwrap_or_else(|| panic!("missing `{key}` in oracle receipt: {value}"))
}

fn establish_temporal_authority(client: &TestGatewayClient) {
    let dir = client
        .home_dir()
        .join(".epi-logos")
        .join("nara")
        .join("kairos");
    std::fs::create_dir_all(&dir).expect("create real Kairos cache directory");
    std::fs::write(
        dir.join("current.json"),
        serde_json::to_vec_pretty(&json!({
            "planets": [
                {"planet_id": 0, "degree": 15.0, "degree_anchor": 30, "retrograde": false}
            ],
            "dominant_sign": 0,
            "dominant_element": 2,
            "active_decan": 1,
            "active_tattva": 2
        }))
        .expect("serialize Kairos fixture"),
    )
    .expect("write real Kairos authority file");
}

#[tokio::test]
async fn typed_iching_cast_persists_six_real_lines_and_position_state() {
    let mut client = TestGatewayClient::connected_with_temp_store(18986).await;
    establish_temporal_authority(&client);

    let cast = client
        .request(
            "nara.oracle.cast_iching",
            json!({"question": "What is changing?", "yes": true}),
        )
        .await
        .expect("typed I-Ching cast must resolve over the live gateway");

    assert_eq!(field(&cast, "system"), "iching");
    assert!(
        field(&cast, "output")
            .as_str()
            .is_some_and(|text| text.starts_with("I-Ching Cast #")),
        "receipt must carry the exact governed cast text: {cast}"
    );
    let lines = field(field(&cast, "draw"), "lines")
        .as_array()
        .expect("typed draw.lines");
    assert_eq!(lines.len(), 6);
    for (index, line) in lines.iter().enumerate() {
        let value = field(line, "value").as_u64().expect("line value");
        assert!((6..=9).contains(&value));
        assert_eq!(field(line, "lineIndex"), (index + 1) as u64);
        assert!(matches!(
            field(line, "nucleotide").as_str(),
            Some("A" | "T" | "C" | "G")
        ));
        assert!(field(line, "codonRef")
            .as_str()
            .is_some_and(|reference| reference.starts_with("m3-codon://")));
    }

    let positions = field(&cast, "positions")
        .as_array()
        .expect("typed positions");
    assert_eq!(positions.len(), 6);
    assert!(positions
        .iter()
        .all(|position| field(position, "liveState") == "generating"));

    let spread_id = field(&cast, "spreadId").as_str().expect("spread id");
    let changed = client
        .request(
            "nara.oracle.update_position_state",
            json!({"spreadId": spread_id, "positionIndex": 0, "liveState": "muting"}),
        )
        .await
        .expect("position transition must persist over the live gateway");
    assert_eq!(field(&changed, "liveState"), "muting");

    let history = client
        .request("nara.oracle.history.read", json!({"limit": 10}))
        .await
        .expect("structured history must resolve over the live gateway");
    assert_eq!(field(&history, "totalCount"), 1);
    let row = &field(&history, "entries")
        .as_array()
        .expect("history entries")[0];
    assert_eq!(field(row, "castAt"), field(&cast, "castAt"));
    assert_eq!(field(row, "spreadId"), spread_id);
    assert_eq!(
        field(row, "positions")
            .as_array()
            .expect("history positions")[0]["liveState"],
        "muting"
    );
}

#[tokio::test]
async fn typed_tarot_cast_honours_spread_size_and_returns_kernel_lut_chain() {
    let mut client = TestGatewayClient::connected_with_temp_store(18987).await;
    establish_temporal_authority(&client);

    let cast = client
        .request(
            "nara.oracle.cast_tarot",
            json!({
                "system": "thoth",
                "question": "What needs attention?",
                "spreadSize": 4,
                "yes": true
            }),
        )
        .await
        .expect("typed Tarot cast must resolve over the live gateway");

    assert_eq!(field(&cast, "system"), "thoth");
    assert_eq!(field(field(&cast, "draw"), "spreadSize"), 4);
    let cards = field(field(&cast, "draw"), "cards")
        .as_array()
        .expect("typed cards");
    assert_eq!(cards.len(), 4);
    for (index, card) in cards.iter().enumerate() {
        assert_eq!(field(card, "positionIndex"), index as u64);
        assert!(field(card, "cardId").as_u64().is_some_and(|id| id < 78));
        match field(card, "codonBinding").as_str() {
            Some("primary") => assert!(field(card, "codonRef")
                .as_str()
                .is_some_and(|reference| reference.starts_with("m3-codon://"))),
            Some("unbound") => {
                assert_eq!(field(card, "cardKind"), "tarot-major");
                assert!(field(card, "codonRef").is_null());
            }
            other => panic!("unexpected codon binding: {other:?}"),
        }
        assert_eq!(field(card, "chainSource"), "kernel-oracle-luts");
    }
    assert_eq!(
        field(&cast, "positions")
            .as_array()
            .expect("tarot positions")
            .len(),
        4
    );
    let envelope = field(&cast, "envelope");
    assert_eq!(field(envelope, "review_state"), "live-only");
    assert_eq!(
        field(envelope, "cp_position_refs")
            .as_array()
            .expect("position refs")
            .len(),
        4
    );
}

#[tokio::test]
async fn position_state_refuses_unknown_spreads_and_invalid_transitions() {
    let mut client = TestGatewayClient::connected_with_temp_store(18988).await;
    establish_temporal_authority(&client);

    let unknown = client
        .request(
            "nara.oracle.update_position_state",
            json!({"spreadId": "oracle-spread-999", "positionIndex": 0, "liveState": "muting"}),
        )
        .await
        .expect_err("unknown spread must fail closed");
    assert!(
        unknown.message.contains("unknown oracle spread"),
        "{}",
        unknown.message
    );

    let cast = client
        .request(
            "nara.oracle.cast_iching",
            json!({"question": "State law?", "yes": true}),
        )
        .await
        .expect("setup cast");
    let spread_id = field(&cast, "spreadId").as_str().expect("spread id");
    let invalid = client
        .request(
            "nara.oracle.update_position_state",
            json!({"spreadId": spread_id, "positionIndex": 0, "liveState": "mute"}),
        )
        .await
        .expect_err("generating must pass through muting before mute");
    assert!(
        invalid.message.contains("generating -> muting"),
        "{}",
        invalid.message
    );
}
