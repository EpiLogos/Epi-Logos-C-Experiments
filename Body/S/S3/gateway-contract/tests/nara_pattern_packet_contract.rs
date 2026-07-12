//! 05.T5.11 — typed PatternPacket edge contract tests.
//!
//! The fixture in `live_edge_packet()` is the EXACT JSON shape emitted today by
//! `epi-s3-gateway` `dispatch::route_nara_session_close` (the live edge this
//! contract types, per the Track 16/18 typed-JSON-edge law). If that seam
//! changes shape, this test is the tripwire.

use epi_s3_gateway_contract::{
    assert_pattern_packet_identity_safe, MahamayaTranscription, NaraDeckContext,
    NaraPatternPacket, NaraReviewState, NARA_PATTERN_PACKET_TYPE,
};
use portal_core::{CpfState, CsDirection, CsField, VakAddress};
use serde_json::{json, Value};

/// The unstamped live edge: what route_nara_session_close emits today.
fn live_edge_packet() -> Value {
    json!({
        "type": "PatternPacket",
        "session_id": "session-nara-close-1",
        "mahamaya_transcription": {
            "protein_handle": "m4-protein://session/session-nara-close-1/42",
            "start_codon": 14,
            "stop_codon": 48,
            "protected_handle": true,
            "capacity": 64,
        },
        "write_through_mode": "graphiti",
    })
}

fn night_vak() -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4a".to_owned()],
        cp: "CP4.4,CP4.5".to_owned(),
        cf: "(0/1/2/3)".to_owned(),
        cfp: "CFP-reading-frame".to_owned(),
        cs: CsField {
            code: "CS0".to_owned(),
            direction: CsDirection::Night,
            recognized: false,
        },
    }
}

#[test]
fn live_unstamped_edge_parses_with_honest_absent_refs() {
    let packet = NaraPatternPacket::parse(&live_edge_packet()).expect("live edge parses");

    assert_eq!(packet.packet_type, NARA_PATTERN_PACKET_TYPE);
    assert_eq!(packet.session_id, "session-nara-close-1");
    assert_eq!(packet.mahamaya_transcription.start_codon, 14);
    assert_eq!(packet.mahamaya_transcription.stop_codon, 48);
    assert!(packet.mahamaya_transcription.protected_handle);
    assert_eq!(packet.mahamaya_transcription.capacity, 64);

    // §5.11 preserved refs are typed-optional: the unstamped seam yields
    // None/empty — never fabricated values.
    assert_eq!(packet.mahamaya_transcription.oracle_frame_ref, None);
    assert_eq!(packet.mahamaya_transcription.symbolic_protein_ref, None);
    assert_eq!(packet.mahamaya_transcription.vak_address, None);
    assert_eq!(packet.mahamaya_transcription.deck_context, None);
    assert_eq!(packet.mahamaya_transcription.sequence_mode, None);
    assert!(packet.mahamaya_transcription.packet_refs.is_empty());
    assert!(packet.mahamaya_transcription.graph_provenance_handles.is_empty());
    assert_eq!(packet.mahamaya_transcription.review_state, None);
}

#[test]
fn fully_stamped_packet_round_trips_every_preserved_ref() {
    let packet = NaraPatternPacket {
        packet_type: NARA_PATTERN_PACKET_TYPE.to_owned(),
        session_id: "session-nara-close-2".to_owned(),
        mahamaya_transcription: MahamayaTranscription {
            protein_handle: "m4-protein://session/session-nara-close-2/43".to_owned(),
            start_codon: 14,
            stop_codon: 50,
            protected_handle: true,
            capacity: 64,
            oracle_frame_ref: Some("oracle-frame-four-five".to_owned()),
            symbolic_protein_ref: Some("symbolic-protein-1".to_owned()),
            vak_address: Some(night_vak()),
            deck_context: Some(NaraDeckContext {
                macro_deck_ref: Some("protected://nara/deck/macro-inhabited-rws".to_owned()),
                session_deck_ref: Some("protected://nara/deck/session-20260712".to_owned()),
                deck_order_hash: "blake3:deck-order-fixture".to_owned(),
                entropy_mode: "seeded_replay".to_owned(),
            }),
            sequence_mode: Some("sixfold_ql".to_owned()),
            packet_refs: vec!["packet-1".to_owned(), "packet-2".to_owned()],
            graph_provenance_handles: vec!["graph://bimba/M3".to_owned()],
            review_state: Some(NaraReviewState::LiveOnly),
        },
        write_through_mode: "graphiti".to_owned(),
    };

    let wire = serde_json::to_value(&packet).expect("packet serializes");
    // Snake_case wire, matching the live edge vocabulary.
    assert_eq!(wire["mahamaya_transcription"]["oracle_frame_ref"], "oracle-frame-four-five");
    assert_eq!(
        wire["mahamaya_transcription"]["deck_context"]["deck_order_hash"],
        "blake3:deck-order-fixture"
    );
    assert_eq!(wire["mahamaya_transcription"]["deck_context"]["entropy_mode"], "seeded_replay");
    assert_eq!(wire["mahamaya_transcription"]["review_state"], "live-only");
    // Inverse-pass law survives the wire: CS.direction = Night', CP4.4/CP4.5 foregrounded.
    assert_eq!(
        wire["mahamaya_transcription"]["vak_address"]["cs"]["direction"],
        "Night'"
    );
    assert_eq!(wire["mahamaya_transcription"]["vak_address"]["cp"], "CP4.4,CP4.5");

    let decoded = NaraPatternPacket::parse(&wire).expect("stamped packet parses");
    assert_eq!(decoded, packet);
}

#[test]
fn packet_type_tag_is_enforced() {
    let mut wrong = live_edge_packet();
    wrong["type"] = json!("NotAPatternPacket");
    let err = NaraPatternPacket::parse(&wrong).expect_err("wrong tag refused");
    assert!(err.contains("PatternPacket"));
}

#[test]
fn identity_mutation_payloads_are_refused_at_the_edge() {
    // §5.11: packet chains can NEVER mutate Q_identity or M4-0 branch evidence.
    let mut poisoned = live_edge_packet();
    poisoned["mahamaya_transcription"]["q_identity"] = json!([1.0, 0.0, 0.0, 0.0]);
    let err = NaraPatternPacket::parse(&poisoned).expect_err("q_identity payload refused");
    assert!(err.contains("q_identity"));

    let mut evidence = live_edge_packet();
    evidence["m4_0_branch_evidence"] = json!({"layer_id": "M4-0-0"});
    assert!(assert_pattern_packet_identity_safe(&evidence).is_err());

    let mut natal = live_edge_packet();
    natal["mahamaya_transcription"]["natal_chart"] = json!({"planets": []});
    assert!(assert_pattern_packet_identity_safe(&natal).is_err());

    // The clean live edge passes the same law.
    assert_pattern_packet_identity_safe(&live_edge_packet()).expect("clean packet is safe");
}
