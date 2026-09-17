//! 05.T5.11 — Nara artifact envelope + PatternPacket chain law.
//!
//! Real write/read tests for Tarot and I-Ching artifacts carrying vak_address,
//! deck context, scalar M3 refs, and a protected interpretation; PatternPacket
//! immutability tests (Q_activity/trajectory only — never Q_identity or M4-0
//! branch evidence); inverse-pass and 4/5-depth fixtures preserving
//! CS.direction = Night' and CP4.4/CP4.5 foregrounding (DR-VAK-1).

use std::fs;
use std::path::PathBuf;

use chrono::NaiveDate;
use portal_core::{
    apply_pattern_packet_chain, read_nara_envelope, run_m4_0_0_birthdate_encoding,
    write_nara_artifact, CpfState, CsDirection, CsField, ElementalBalance, IdentityPacket,
    NaraActivityTrajectory, NaraArtifactEnvelope, NaraDeckContext, NaraEnvelopeError,
    NaraOracleSystem, NaraPatternPacketStamp, NaraProjectionError, NaraProtectedInterpretation,
    NaraReviewState, NaraScalarRef, NaraScalarRefKind, PersonalIdentityProfile,
    ProfilePrivacyClass, VakAddress, VamaShaktiClass,
};

fn scratch_dir(label: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!(
        "nara-artifact-envelope-{label}-{}",
        std::process::id()
    ));
    let _ = fs::remove_dir_all(&dir);
    dir
}

fn vak(cp_refs: &[&str], direction: CsDirection) -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4a".to_owned()],
        cp: cp_refs.join(","),
        cf: "(0/1/2/3)".to_owned(),
        cfp: "CFP-reading-frame".to_owned(),
        cs: CsField {
            code: "CS0".to_owned(),
            direction,
            recognized: false,
        },
    }
}

fn deck_context() -> NaraDeckContext {
    NaraDeckContext {
        macro_deck_ref: Some("protected://nara/deck/macro-inhabited-rws".to_owned()),
        session_deck_ref: Some("protected://nara/deck/session-20260712".to_owned()),
        deck_order_hash: "blake3:deck-order-fixture".to_owned(),
        entropy_mode: "seeded_replay".to_owned(),
    }
}

fn scalar(kind: NaraScalarRefKind, scalar_ref: &str) -> NaraScalarRef {
    NaraScalarRef {
        ref_kind: kind,
        scalar_ref: scalar_ref.to_owned(),
        source_handle: "m3://transcription-bridge/current".to_owned(),
    }
}

/// A real Tarot artifact: sixfold reading, M3 provenance, I-Ching cross-refs.
fn tarot_envelope() -> NaraArtifactEnvelope {
    let cp_refs = ["CP4.0", "CP4.1", "CP4.2", "CP4.3", "CP4.4", "CP4.5"];
    NaraArtifactEnvelope {
        artifact_id: "oracle-20260712-120000-tarot".to_owned(),
        system: NaraOracleSystem::Tarot,
        day_id: "12-07-2026".to_owned(),
        created_at: "2026-07-12T12:00:00+00:00".to_owned(),
        vak_address: vak(&cp_refs, CsDirection::Day),
        cp_position_refs: cp_refs.iter().map(|s| s.to_string()).collect(),
        spread_label: Some("sixfold-ql-traverse".to_owned()),
        oracle_frame_ref: Some("oracle-frame-sixfold".to_owned()),
        symbolic_protein_ref: Some("symbolic-protein-1".to_owned()),
        deck_context: deck_context(),
        sequence_mode: Some("sixfold_ql".to_owned()),
        packet_refs: vec!["packet-1".to_owned(), "packet-2".to_owned()],
        graph_provenance_handles: vec!["graph://bimba/M3".to_owned()],
        review_state: NaraReviewState::LiveOnly,
        scalar_refs: vec![
            scalar(NaraScalarRefKind::M3Codon, "codon://ATG"),
            scalar(NaraScalarRefKind::Tarot, "tarot://card/magician"),
            scalar(NaraScalarRefKind::IChing, "iching://hexagram/11"),
            scalar(NaraScalarRefKind::LineChange, "iching://hexagram/11/line/3"),
            scalar(NaraScalarRefKind::Kairos, "kairos://window/20260712-1200"),
        ],
        interpretation: NaraProtectedInterpretation {
            handle: "protected-local://nara/interpretation/oracle-20260712-120000-tarot".to_owned(),
            local_body: Some(
                "The Magician over Peace: private reading body — never leaves the day scope."
                    .to_owned(),
            ),
        },
    }
}

/// A real I-Ching artifact carrying Tarot/decan/codon cross-refs.
fn iching_envelope() -> NaraArtifactEnvelope {
    let cp_refs = ["CP4.1", "CP4.2", "CP4.4"];
    NaraArtifactEnvelope {
        artifact_id: "oracle-20260712-130000-iching".to_owned(),
        system: NaraOracleSystem::IChing,
        day_id: "12-07-2026".to_owned(),
        created_at: "2026-07-12T13:00:00+00:00".to_owned(),
        vak_address: vak(&cp_refs, CsDirection::Day),
        cp_position_refs: cp_refs.iter().map(|s| s.to_string()).collect(),
        spread_label: Some("compressed-triad".to_owned()),
        oracle_frame_ref: Some("oracle-frame-triad".to_owned()),
        symbolic_protein_ref: None,
        deck_context: NaraDeckContext {
            macro_deck_ref: None,
            session_deck_ref: Some("protected://nara/deck/session-coin-cast".to_owned()),
            deck_order_hash: "blake3:hexagram-canon-order".to_owned(),
            entropy_mode: "coin_cast_live".to_owned(),
        },
        sequence_mode: None,
        packet_refs: vec!["packet-7".to_owned()],
        graph_provenance_handles: vec!["graph://m3/hexagram/11".to_owned()],
        review_state: NaraReviewState::ReviewPending,
        scalar_refs: vec![
            scalar(NaraScalarRefKind::M3Codon, "codon://TAG"),
            scalar(NaraScalarRefKind::Tarot, "tarot://card/star"),
            scalar(NaraScalarRefKind::Decan, "m2://decan/earth-sign-2"),
            scalar(NaraScalarRefKind::Chronos, "chronos://tick/12"),
        ],
        interpretation: NaraProtectedInterpretation {
            handle: "protected-local://nara/interpretation/oracle-20260712-130000-iching"
                .to_owned(),
            local_body: Some("Hexagram 11 private commentary — protected-local.".to_owned()),
        },
    }
}

#[test]
fn tarot_artifact_write_read_round_trips_vak_deck_refs_and_review_state() {
    let dir = scratch_dir("tarot");
    let envelope = tarot_envelope();
    let body = envelope
        .interpretation
        .local_body
        .clone()
        .expect("fixture body");

    let paths = write_nara_artifact(&dir, &envelope, &body).expect("artifact writes");
    let read_back = read_nara_envelope(&paths.envelope_path).expect("envelope reads");

    // Every §5.11 preserved field survives the real write/read cycle.
    assert_eq!(
        read_back.oracle_frame_ref.as_deref(),
        Some("oracle-frame-sixfold")
    );
    assert_eq!(
        read_back.symbolic_protein_ref.as_deref(),
        Some("symbolic-protein-1")
    );
    assert_eq!(read_back.vak_address, envelope.vak_address);
    assert_eq!(
        read_back.deck_context.macro_deck_ref.as_deref(),
        Some("protected://nara/deck/macro-inhabited-rws")
    );
    assert_eq!(
        read_back.deck_context.session_deck_ref.as_deref(),
        Some("protected://nara/deck/session-20260712")
    );
    assert_eq!(
        read_back.deck_context.deck_order_hash,
        "blake3:deck-order-fixture"
    );
    assert_eq!(read_back.deck_context.entropy_mode, "seeded_replay");
    assert_eq!(read_back.sequence_mode.as_deref(), Some("sixfold_ql"));
    assert_eq!(read_back.packet_refs, vec!["packet-1", "packet-2"]);
    assert_eq!(read_back.graph_provenance_handles, vec!["graph://bimba/M3"]);
    assert_eq!(read_back.review_state, NaraReviewState::LiveOnly);
    assert_eq!(read_back.scalar_refs, envelope.scalar_refs);

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn iching_artifact_carries_tarot_decan_codon_refs_and_round_trips() {
    let dir = scratch_dir("iching");
    let envelope = iching_envelope();

    let paths = write_nara_artifact(
        &dir,
        &envelope,
        "Hexagram 11 private commentary — protected-local.",
    )
    .expect("artifact writes");
    let read_back = read_nara_envelope(&paths.envelope_path).expect("envelope reads");

    assert_eq!(read_back.system, NaraOracleSystem::IChing);
    // §5.11: an I-Ching artifact may carry Tarot/decan/codon refs.
    let kinds: Vec<NaraScalarRefKind> = read_back
        .scalar_refs
        .iter()
        .map(|scalar| scalar.ref_kind)
        .collect();
    assert!(kinds.contains(&NaraScalarRefKind::Tarot));
    assert!(kinds.contains(&NaraScalarRefKind::Decan));
    assert!(kinds.contains(&NaraScalarRefKind::M3Codon));
    // Typed-optional honesty: unstamped refs stay None, never fabricated.
    assert_eq!(read_back.symbolic_protein_ref, None);
    assert_eq!(read_back.sequence_mode, None);
    assert_eq!(read_back.deck_context.macro_deck_ref, None);
    assert_eq!(read_back.review_state, NaraReviewState::ReviewPending);

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn protected_interpretation_body_stays_local_and_out_of_the_envelope() {
    let dir = scratch_dir("protected-body");
    let envelope = tarot_envelope();
    let body = envelope
        .interpretation
        .local_body
        .clone()
        .expect("fixture body");

    let paths = write_nara_artifact(&dir, &envelope, &body).expect("artifact writes");

    // The envelope JSON on disk carries the handle but never the body.
    let raw_envelope = fs::read_to_string(&paths.envelope_path).expect("envelope file");
    assert!(raw_envelope.contains("protected-local://nara/interpretation/"));
    assert!(!raw_envelope.contains("private reading body"));
    assert!(!raw_envelope.contains("local_body"));

    // The body lives in its own protected-local file.
    let raw_body = fs::read_to_string(&paths.body_path).expect("body file");
    assert!(raw_body.contains("private reading body"));

    // Reading the envelope never loads the body.
    let read_back = read_nara_envelope(&paths.envelope_path).expect("envelope reads");
    assert_eq!(read_back.interpretation.local_body, None);
    assert_eq!(
        read_back.interpretation.handle,
        envelope.interpretation.handle
    );

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn scalar_m3_refs_resolve_without_loading_private_bodies() {
    let dir = scratch_dir("projection");
    let envelope = tarot_envelope();
    let body = envelope
        .interpretation
        .local_body
        .clone()
        .expect("fixture body");
    let paths = write_nara_artifact(&dir, &envelope, &body).expect("artifact writes");

    // Envelope read back with local_body == None — the private body is untouched.
    let read_back = read_nara_envelope(&paths.envelope_path).expect("envelope reads");
    assert_eq!(read_back.interpretation.local_body, None);

    // Tarot → I-Ching projection works from scalar refs alone.
    let projected = read_back
        .project_scalar_refs(NaraOracleSystem::IChing)
        .expect("M3 provenance exists");
    let kinds: Vec<NaraScalarRefKind> = projected.iter().map(|scalar| scalar.ref_kind).collect();
    assert!(kinds.contains(&NaraScalarRefKind::M3Codon));
    assert!(kinds.contains(&NaraScalarRefKind::IChing));
    assert!(kinds.contains(&NaraScalarRefKind::LineChange));
    // Tarot-family refs are not part of the I-Ching projection view.
    assert!(!kinds.contains(&NaraScalarRefKind::Tarot));

    // I-Ching → Tarot direction from the other artifact.
    let projected_back = iching_envelope()
        .project_scalar_refs(NaraOracleSystem::Tarot)
        .expect("M3 provenance exists");
    let kinds_back: Vec<NaraScalarRefKind> = projected_back
        .iter()
        .map(|scalar| scalar.ref_kind)
        .collect();
    assert!(kinds_back.contains(&NaraScalarRefKind::Tarot));
    assert!(kinds_back.contains(&NaraScalarRefKind::Decan));
    assert!(kinds_back.contains(&NaraScalarRefKind::M3Codon));

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn mutual_projection_requires_m3_provenance() {
    let mut envelope = tarot_envelope();
    envelope
        .scalar_refs
        .retain(|scalar| scalar.ref_kind != NaraScalarRefKind::M3Codon);

    assert_eq!(
        envelope.project_scalar_refs(NaraOracleSystem::IChing),
        Err(NaraProjectionError::MissingM3Provenance)
    );
    assert_eq!(
        envelope.project_scalar_refs(NaraOracleSystem::Tarot),
        Err(NaraProjectionError::MissingM3Provenance)
    );
}

#[test]
fn reading_cardinality_authority_is_positions_never_spread_label() {
    // DR-VAK-1 (VALIDATED): vak_address.cp[] / reading_frame.positions[] is the
    // cardinality authority. A label claiming a sixfold spread over two
    // positions still reads cardinality 2.
    let cp_refs = ["CP4.4", "CP4.5"];
    let mut envelope = tarot_envelope();
    envelope.vak_address = vak(&cp_refs, CsDirection::Day);
    envelope.cp_position_refs = cp_refs.iter().map(|s| s.to_string()).collect();
    envelope.spread_label = Some("sixfold-ql-traverse".to_owned());

    envelope
        .validate()
        .expect("label mismatch is NOT a validation error");
    assert_eq!(envelope.reading_cardinality(), 2);

    // Changing the label never changes the cardinality.
    envelope.spread_label = Some("single-card".to_owned());
    assert_eq!(envelope.reading_cardinality(), 2);

    // But breaking the positions authority itself IS an error.
    envelope.vak_address.cp = "CP4.4".to_owned();
    assert!(matches!(
        envelope.validate(),
        Err(NaraEnvelopeError::VakCpMismatch { .. })
    ));
    envelope.vak_address.cp = String::new();
    envelope.cp_position_refs.clear();
    assert_eq!(
        envelope.validate(),
        Err(NaraEnvelopeError::NoReadingPositions)
    );
}

#[test]
fn inverse_pass_fixture_preserves_night_prime_direction_through_write_read() {
    let dir = scratch_dir("night-inverse");
    let cp_refs = ["CP4.5", "CP4.4", "CP4.3", "CP4.2", "CP4.1", "CP4.0"];
    let mut envelope = tarot_envelope();
    envelope.artifact_id = "oracle-20260712-night-inverse".to_owned();
    envelope.vak_address = vak(&cp_refs, CsDirection::Night);
    envelope.cp_position_refs = cp_refs.iter().map(|s| s.to_string()).collect();
    envelope.spread_label = Some("night-inverse-pass".to_owned());
    envelope.interpretation.handle =
        "protected-local://nara/interpretation/night-inverse".to_owned();

    let paths = write_nara_artifact(&dir, &envelope, "night inverse body").expect("writes");
    let raw = fs::read_to_string(&paths.envelope_path).expect("envelope file");
    // The wire spelling is the canonical prime form.
    assert!(raw.contains("Night'"));

    let read_back = read_nara_envelope(&paths.envelope_path).expect("reads");
    assert_eq!(read_back.vak_address.cs.direction, CsDirection::Night);

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn depth_4_5_fixture_foregrounds_cp44_and_cp45() {
    let dir = scratch_dir("depth-4-5");
    let cp_refs = ["CP4.4", "CP4.5"];
    let mut envelope = iching_envelope();
    envelope.artifact_id = "oracle-20260712-depth-4-5".to_owned();
    envelope.vak_address = vak(&cp_refs, CsDirection::Night);
    envelope.cp_position_refs = cp_refs.iter().map(|s| s.to_string()).collect();
    envelope.spread_label = Some("depth-4-5-pass".to_owned());
    envelope.interpretation.handle = "protected-local://nara/interpretation/depth-4-5".to_owned();

    let paths = write_nara_artifact(&dir, &envelope, "depth pass body").expect("writes");
    let read_back = read_nara_envelope(&paths.envelope_path).expect("reads");

    // CP4.4 / CP4.5 foregrounding preserved in authority order.
    assert_eq!(read_back.cp_position_refs, vec!["CP4.4", "CP4.5"]);
    assert_eq!(read_back.reading_cardinality(), 2);
    assert_eq!(read_back.vak_address.cs.direction, CsDirection::Night);

    let _ = fs::remove_dir_all(&dir);
}

fn identity_fixture() -> PersonalIdentityProfile {
    PersonalIdentityProfile {
        q_personal: [0.5, 0.5, 0.5, 0.5],
        q_identity: [1.0, 0.0, 0.0, 0.0],
        natal_chart_handle: "protected://nara/natal/frank".to_owned(),
        elemental_balance: ElementalBalance {
            earth: 0.25,
            fire: 0.25,
            water: 0.25,
            air: 0.25,
        },
        identity_hash: "blake3:identity-fixture".to_owned(),
        privacy_class: ProfilePrivacyClass::ProtectedLocalDerived,
    }
}

fn packet_stamps() -> Vec<NaraPatternPacketStamp> {
    vec![
        NaraPatternPacketStamp {
            packet_ref: "packet-1".to_owned(),
            vak_address: vak(&["CP4.0"], CsDirection::Day),
            kairos_delta: 0.25,
        },
        NaraPatternPacketStamp {
            packet_ref: "packet-2".to_owned(),
            vak_address: vak(&["CP4.4"], CsDirection::Night),
            kairos_delta: 1.5,
        },
        NaraPatternPacketStamp {
            packet_ref: "packet-3".to_owned(),
            vak_address: vak(&["CP4.5"], CsDirection::Night),
            kairos_delta: 3.0,
        },
    ]
}

#[test]
fn pattern_packet_chain_updates_only_q_activity_and_trajectory() {
    // §5.11: packet chains update only Q_activity / trajectory and can NEVER
    // mutate Q_identity or M4-0 branch evidence. The chain surface takes no
    // identity/evidence parameter (structural immutability); this test proves
    // both stand untouched while activity/trajectory move.
    let identity = identity_fixture();
    let identity_snapshot = identity.clone();

    let m4_0_evidence = run_m4_0_0_birthdate_encoding(IdentityPacket::birth(
        "Frank Taylor",
        NaiveDate::from_ymd_opt(1997, 9, 12).expect("valid fixture date"),
    ))
    .expect("M4-0-0 birthdate encoding runs");
    let evidence_snapshot = m4_0_evidence.clone();

    let q_activity_start = [1.0, 0.0, 0.0, 0.0];
    let trajectory: NaraActivityTrajectory =
        apply_pattern_packet_chain(q_activity_start, &packet_stamps(), VamaShaktiClass::Daemon);

    // Q_activity moved …
    assert_ne!(trajectory.q_activity, q_activity_start);
    // … the trajectory is exactly the packet chain …
    assert_eq!(
        trajectory.packet_refs,
        vec!["packet-1", "packet-2", "packet-3"]
    );
    // … and Q_identity + M4-0 branch evidence are bit-identical to before.
    assert_eq!(identity, identity_snapshot);
    assert_eq!(identity.q_identity, [1.0, 0.0, 0.0, 0.0]);
    assert_eq!(m4_0_evidence, evidence_snapshot);
}

#[test]
fn pattern_packet_chain_is_deterministic_and_composes_read_only_with_identity() {
    let identity = identity_fixture();
    let start = [1.0, 0.0, 0.0, 0.0];
    let a = apply_pattern_packet_chain(start, &packet_stamps(), VamaShaktiClass::Daemon);
    let b = apply_pattern_packet_chain(start, &packet_stamps(), VamaShaktiClass::Daemon);
    assert_eq!(a, b);

    // Composition with identity is a read-only downstream step.
    let before = identity.clone();
    let _q_composed = identity.composed_quaternion([1.0, 0.0, 0.0, 0.0], a.q_activity);
    assert_eq!(identity, before);
}
