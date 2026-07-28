//! 24.T24.7 — `s2.codon.scalar_ref.read` resolves a scalar M3 reference.
//!
//! A scalar ref is scalar BY CONSTRUCTION: portal-core's `NaraScalarRef` has no
//! body field, so resolution can only ever hand back public identity. These
//! tests hold the gateway half of that contract against the REAL landed
//! datasets — `nara::oracle_identity::HEXAGRAM_BODY_DYNAMICS` (24.T24.8's
//! producer) and `nara::medicine_frame::ZODIAC_DECAN_TABLE` — so a dataset edit
//! that changed what a hexagram or a decan means would fail here rather than
//! reach a surface silently.
//!
//! The kinds portal-core declares but nothing can yet resolve answer
//! `resolved: false` WITH the owning tranche, not an error: a consumer must be
//! able to tell an unlanded producer from a broken call, because those are
//! different things to render.

mod support;

use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn scalar_ref_read_resolves_a_hexagram_to_its_real_body_dynamics() {
    let mut client = TestGatewayClient::connected_with_temp_store(18991).await;

    let response = client
        .request(
            "s2.codon.scalar_ref.read",
            json!({ "refKind": "i-ching", "scalarRef": 1 }),
        )
        .await
        .expect("s2.codon.scalar_ref.read should be gateway-callable");

    assert_eq!(response["refKind"], "i-ching");
    assert_eq!(response["resolved"], true);
    assert_eq!(
        response["authority"],
        "epi-cli::nara::oracle_identity::HEXAGRAM_BODY_DYNAMICS"
    );

    // Hexagram 1 (Qian, Heaven/Heaven) as the dataset actually holds it.
    let entry = &response["entry"];
    assert_eq!(entry["hexagramId"], 1);
    assert_eq!(entry["primaryChakraId"], 6);
    assert_eq!(entry["secondaryChakraIds"], json!([6]));
    assert_eq!(entry["bodyZones"], json!(["head", "lungs"]));
    assert_eq!(entry["dynamic"], "Head/Lungs governing Head/Lungs");
}

#[tokio::test]
async fn scalar_ref_read_accepts_the_king_wen_range_and_refuses_outside_it() {
    let mut client = TestGatewayClient::connected_with_temp_store(18992).await;

    // 64 is in range and carries real data
    let last = client
        .request(
            "s2.codon.scalar_ref.read",
            json!({ "refKind": "i-ching", "scalarRef": "64" }),
        )
        .await
        .expect("hexagram 64 should resolve");
    assert_eq!(last["entry"]["hexagramId"], 64);
    assert_eq!(last["resolved"], true);

    // 0 and 65 are not King Wen numbers — a refusal, not an empty entry
    for out_of_range in [json!(0), json!(65)] {
        let refused = client
            .request(
                "s2.codon.scalar_ref.read",
                json!({ "refKind": "i-ching", "scalarRef": out_of_range }),
            )
            .await;
        assert!(
            refused.is_err(),
            "hexagram {out_of_range} must be refused, not resolved to nothing"
        );
    }
}

#[tokio::test]
async fn scalar_ref_read_resolves_a_decan_to_its_real_medicine_frame() {
    let mut client = TestGatewayClient::connected_with_temp_store(18993).await;

    let response = client
        .request(
            "s2.codon.scalar_ref.read",
            json!({ "refKind": "decan", "scalarRef": 0 }),
        )
        .await
        .expect("decan 0 should resolve");

    assert_eq!(response["resolved"], true);
    assert_eq!(
        response["authority"],
        "epi-cli::nara::medicine_frame::ZODIAC_DECAN_TABLE"
    );

    // Aries I — Mars-ruled, Fire, Cardinal, as the table holds it.
    let entry = &response["entry"];
    assert_eq!(entry["decanIndex"], 0);
    assert_eq!(entry["sign"], 0);
    assert_eq!(entry["decanInSign"], 0);
    assert_eq!(entry["rulingPlanet"], 7);
    assert_eq!(entry["element"], 4);
    assert_eq!(entry["anandaHarmonic"], 0);
    assert_eq!(
        entry["bodyZones"],
        "Skull and brain - the command center of action"
    );
    assert_eq!(entry["herb"], "Hawthorn");
}

#[tokio::test]
async fn scalar_ref_read_resolves_a_codon_through_the_same_lut_aa_lookup_serves() {
    let mut client = TestGatewayClient::connected_with_temp_store(18994).await;

    let scalar = client
        .request(
            "s2.codon.scalar_ref.read",
            json!({ "refKind": "m3-codon", "scalarRef": "AUG" }),
        )
        .await
        .expect("codon AUG should resolve");
    let direct = client
        .request("s2.codon.aa_lookup", json!({ "codon": "AUG" }))
        .await
        .expect("aa_lookup should answer");

    assert_eq!(scalar["resolved"], true);
    // One decode path, not two: the scalar read must agree with the method that
    // already owned this LUT, field for field.
    assert_eq!(scalar["entry"], direct);
    assert_eq!(scalar["authority"], "portal-core::transcription");
}

#[tokio::test]
async fn scalar_ref_read_names_the_owner_of_a_kind_that_cannot_resolve_yet() {
    let mut client = TestGatewayClient::connected_with_temp_store(18995).await;

    for (kind, owner) in [
        ("tarot", "24.T24.6"),
        ("line-change", "24.T24.9"),
        ("chronos", "32.T32.10"),
        ("kairos", "32.T32.10"),
    ] {
        let response = client
            .request(
                "s2.codon.scalar_ref.read",
                json!({ "refKind": kind, "scalarRef": "1" }),
            )
            .await
            .unwrap_or_else(|error| panic!("{kind} should answer, not error: {error:?}"));

        // An unlanded producer is a STATE the caller can render, not a fault.
        assert_eq!(response["resolved"], false, "{kind} must not claim a value");
        assert_eq!(response["ownerTranche"], owner, "{kind} must name its owner");
        assert!(
            response["reason"].as_str().is_some_and(|r| !r.is_empty()),
            "{kind} must say why"
        );
        assert!(
            response.get("entry").is_none(),
            "{kind} must not carry an entry it cannot produce"
        );
    }
}

#[tokio::test]
async fn scalar_ref_read_refuses_an_undeclared_kind_and_a_missing_ref() {
    let mut client = TestGatewayClient::connected_with_temp_store(18996).await;

    // A typo is a different answer from an unlanded producer.
    let unknown = client
        .request(
            "s2.codon.scalar_ref.read",
            json!({ "refKind": "i-ching-but-wrong", "scalarRef": 1 }),
        )
        .await;
    assert!(unknown.is_err(), "an undeclared refKind must be refused");

    let missing_ref = client
        .request("s2.codon.scalar_ref.read", json!({ "refKind": "i-ching" }))
        .await;
    assert!(missing_ref.is_err(), "a missing scalarRef must be refused");

    let missing_kind = client
        .request("s2.codon.scalar_ref.read", json!({ "scalarRef": 1 }))
        .await;
    assert!(missing_kind.is_err(), "a missing refKind must be refused");
}
