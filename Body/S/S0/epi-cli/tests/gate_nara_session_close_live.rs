//! Live-gateway driver for the persisted Nara session-close bundle.
//!
//! This drives `nara.session_close` and `nara.session_close.read` through the
//! actual WebSocket dispatch loop, proving the close request can carry the full
//! contemplation evidence while the persisted/read-back artifact stays aggregate
//! and privacy-safe.

mod support;

use serde_json::json;
use std::fs;
use std::path::Path;
use support::{TestEnv, TestGatewayClient};

fn seed_active_pasu(home: &Path) {
    let nara_home = home.join(".epi-logos").join("nara");
    fs::create_dir_all(&nara_home).expect("create isolated nara home");
    fs::write(
        nara_home.join("profile.json"),
        serde_json::to_vec_pretty(&json!({
            "version": 1,
            "layers": {
                "numerological": {
                    "present": true,
                    "source": "gate_nara_session_close_live",
                    "completeness": 100,
                    "set_at": 1_700_000_000_000u64,
                    "elemental_profile": [0.25, 0.25, 0.25, 0.25]
                }
            },
            "layer_presence_mask": 1,
            "hash_preview": "caller-input-is-not-authority",
            "last_wound": null,
            "kerykeion_version": null
        }))
        .expect("serialize isolated PASU profile"),
    )
    .expect("write isolated PASU profile");
}

async fn connected_with_active_pasu(port: u16) -> TestGatewayClient {
    let env = TestEnv::with_fake_pi();
    seed_active_pasu(&env.home);
    let mut client = TestGatewayClient::connect(env, port).await;
    client
        .request("connect", json!({}))
        .await
        .expect("connect handshake should succeed");
    client
}

fn contemplation_object(session_id: &str) -> serde_json::Value {
    json!({
        "session_id": session_id,
        "q_nara": "q_Nara",
        "pi_instance": {
            "id": "pi-live-close",
            "recognition_state": "trajectory returned through the disclosed gauge",
            "loaded_agents": ["Nous", "Moirai", "Sophia", "Psyche"]
        },
        "engaged_coordinates": [
            { "coordinate": "M3.COMP", "target_resonance_vector": [0.2, 0.4, 0.6] },
            { "coordinate": "M3.MOVE", "target_resonance_vector": [0.1, 0.3, 0.5] },
            { "coordinate": "M3.RES", "target_resonance_vector": [0.9, 0.7, 0.5] }
        ],
        "trajectory": [
            { "tick_id": "t0", "gauge": "COMP", "actual_resonance": [0.2, 0.4, 0.6], "codon": "I" },
            { "tick_id": "t1", "gauge": "MOVE", "actual_resonance": [0.1, 0.3, 0.5], "codon": "II" },
            { "tick_id": "t2", "gauge": "RES", "actual_resonance": [0.9, 0.7, 0.5], "codon": "III" }
        ],
        // Two cards drawn, one whose codon ("IX") the trajectory above never
        // reaches -- so the live readback has to distinguish them, not just
        // report a verdict.
        "psyche_anchor": {
            "cards": ["The Magician", "The Hermit"],
            "codons": ["I", "IX"]
        },
        "verifier_report": {
            "virtue_witness_vector": [true, true, false, true, false, true, true, false, true],
            "unsatisfied_constraints": ["#R0-0/1/A-T7-pending?"],
            "coherence_score": 0.82
        }
    })
}

#[tokio::test]
async fn nara_session_close_persists_aggregate_bundle_and_reads_it_back() {
    let session_id = "review-close-live";
    let mut client = connected_with_active_pasu(18942).await;

    let opened = client
        .request(
            "nara.session_open",
            json!({ "session_id": session_id, "kairos": 1_700_000_000_000u64 }),
        )
        .await
        .expect("nara.session_open must dispatch live before close");

    let closed = client
        .request(
            "nara.session_close",
            json!({
                "session_id": session_id,
                "protein_handle": opened["protein_handle"].as_str().expect("protein handle"),
                "kairos_close": 1_700_000_000_999u64,
                "pasu_hash_preview": "deadbeef",
                "contemplation_object": contemplation_object(session_id),
                "m1_closure": {
                    "position_sequence": [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]
                },
                "audio_octet": {
                    "position_sequence": [0, 1, 2, 3, 4, 5, 6, 7, 0]
                }
            }),
        )
        .await
        .expect("nara.session_close must persist and return an opaque close ref");

    let close_ref = closed["close_ref"]
        .as_str()
        .expect("nara.session_close must return close_ref");
    assert!(!close_ref.is_empty(), "opaque close ref must be non-empty");
    assert_eq!(closed["session_id"], session_id);

    let read_latest = client
        .request(
            "nara.session_close.read",
            json!({
                "session_id": session_id,
                "pasu_hash_preview": "feedface",
                "latest": true
            }),
        )
        .await
        .expect("nara.session_close.read latest lookup must return the aggregate bundle");

    assert_eq!(read_latest["session_id"], session_id);
    assert_eq!(read_latest["close_ref"], close_ref);
    assert_eq!(read_latest["m1_closure"]["closed"], true);
    assert_eq!(read_latest["m1_closure"]["generator_step"], 7);
    assert_eq!(read_latest["audio_octet"]["traversed"][7], true);
    assert_eq!(read_latest["audio_octet"]["octave_returned"], true);
    assert_eq!(read_latest["virtue_witness_vector"], 0b101101011);
    assert_eq!(read_latest["coherence_score"], 0.82);
    assert!(
        read_latest.get("trajectory").is_none(),
        "stored/read-back close bundle must not expose contemplation trajectory"
    );
    assert!(
        read_latest.get("graphiti_relation").is_none(),
        "stored/read-back close bundle must not expose graphiti relation bodies"
    );
    assert!(
        read_latest.get("pattern_packet").is_none(),
        "stored/read-back close bundle must not expose raw pattern packets"
    );
    assert!(
        read_latest.get("body").is_none(),
        "stored/read-back close bundle must not expose raw protein bodies"
    );

    let contemplation = client
        .request(
            "nara.session_close.contemplation.read",
            json!({
                "session_id": session_id,
                "pasu_hash_preview": "feedface",
                "latest": true
            }),
        )
        .await
        .expect("contemplation readback must return its guarded projection");

    assert_eq!(contemplation["session_id"], session_id);
    assert_eq!(contemplation["close_ref"], close_ref);
    assert!(
        contemplation["contemplation_ref"]
            .as_str()
            .is_some_and(|reference| reference.starts_with("contemplation-")),
        "viewer readback must use an opaque contemplation reference"
    );
    assert_eq!(contemplation["triplet"]["llm"]["loaded_agent_count"], 4);
    assert_eq!(contemplation["triplet"]["ebm"]["gauge_trio_coherent"], true);
    assert_eq!(
        contemplation["triplet"]["verifier"]["arch9_wholeness"],
        true
    );

    // 25.20 substrate: the per-card anchor reading has to survive the close
    // and come back over the same live method that serves the verdict.
    let anchor_cards = contemplation["triplet"]["llm"]["anchor_cards"]
        .as_array()
        .expect("the live projection must carry the per-card anchor reading");
    assert_eq!(anchor_cards.len(), 2, "both drawn cards read back");
    assert_eq!(anchor_cards[0]["card"], "The Magician");
    assert_eq!(anchor_cards[0]["codon"], "I");
    assert_eq!(anchor_cards[0]["matched"], true);
    assert_eq!(anchor_cards[1]["card"], "The Hermit");
    assert_eq!(anchor_cards[1]["codon"], "IX");
    assert_eq!(
        anchor_cards[1]["matched"], false,
        "the card that broke coherence must be nameable from the readback"
    );
    assert_eq!(
        contemplation["triplet"]["llm"]["psyche_anchor_coherent"], false,
        "one unmatched anchor codon refuses the verdict"
    );
    assert_eq!(contemplation["triplet"]["llm"]["matched_anchor_codon_count"], 1);

    for forbidden in [
        "q_nara",
        "trajectory",
        "actual_resonance",
        "unsatisfied_constraints",
        "recognition_state",
        "wisdom_delta",
        "raw",
        "body",
    ] {
        assert!(
            contemplation.get(forbidden).is_none(),
            "contemplation projection must not expose `{forbidden}`"
        );
    }

    let read_by_ref = client
        .request(
            "nara.session_close.read",
            json!({
                "session_id": session_id,
                "pasu_hash_preview": "deadbeef",
                "close_ref": close_ref
            }),
        )
        .await
        .expect("nara.session_close.read exact ref lookup must round-trip");

    assert_eq!(read_by_ref, read_latest);

    let contemplation_by_ref = client
        .request(
            "nara.session_close.contemplation.read",
            json!({
                "session_id": session_id,
                "pasu_hash_preview": "deadbeef",
                "close_ref": close_ref
            }),
        )
        .await
        .expect("contemplation readback must round-trip by exact opaque close ref");

    assert_eq!(contemplation_by_ref, contemplation);
}

#[tokio::test]
async fn nara_session_close_read_refuses_cross_session_and_path_shaped_input() {
    let session_id = "review-close-refusal";
    let mut client = connected_with_active_pasu(18943).await;

    let opened = client
        .request(
            "nara.session_open",
            json!({ "session_id": session_id, "kairos": 1_700_000_100_000u64 }),
        )
        .await
        .expect("nara.session_open must dispatch live before close");

    let mismatched_handle = client
        .request(
            "nara.session_close",
            json!({
                "session_id": session_id,
                "protein_handle": "m4-protein://session/another-session/1700000100000",
                "kairos_close": 1_700_000_100_999u64,
                "contemplation_object": contemplation_object(session_id),
                "m1_closure": { "position_sequence": [0, 7, 2] },
                "audio_octet": { "position_sequence": [0, 1, 2] }
            }),
        )
        .await
        .expect_err("close must reject a protein handle opened for another session");
    assert!(mismatched_handle.message.contains("does not belong"));

    let closed = client
        .request(
            "nara.session_close",
            json!({
                "session_id": session_id,
                "protein_handle": opened["protein_handle"].as_str().expect("protein handle"),
                "kairos_close": 1_700_000_100_999u64,
                "pasu_hash_preview": "deadbeef",
                "contemplation_object": contemplation_object(session_id),
                "m1_closure": {
                    "position_sequence": [0, 7, 2, 9, 4, 11]
                },
                "audio_octet": {
                    "position_sequence": [0, 1, 2, 3]
                }
            }),
        )
        .await
        .expect("nara.session_close must persist a close bundle");

    let close_ref = closed["close_ref"].as_str().expect("close_ref");

    let cross_session = client
        .request(
            "nara.session_close.read",
            json!({
                "session_id": "other-session",
                "pasu_hash_preview": "deadbeef",
                "close_ref": close_ref
            }),
        )
        .await
        .expect_err("readback must refuse cross-session ref access");
    assert!(
        cross_session.message.contains("session"),
        "cross-session refusal should mention session confinement, got {:?}",
        cross_session
    );

    let path_shaped = client
        .request(
            "nara.session_close.read",
            json!({
                "session_id": session_id,
                "pasu_hash_preview": "deadbeef",
                "close_ref": "../escape"
            }),
        )
        .await
        .expect_err("path-shaped refs must fail closed");
    assert!(
        path_shaped.message.contains("path"),
        "path refusal should mention path-shaped input, got {:?}",
        path_shaped
    );

    let contemplation_cross_session = client
        .request(
            "nara.session_close.contemplation.read",
            json!({
                "session_id": "other-session",
                "pasu_hash_preview": "deadbeef",
                "close_ref": close_ref
            }),
        )
        .await
        .expect_err("contemplation projection must retain exact-session confinement");
    assert!(contemplation_cross_session.message.contains("session"));
}
