use portal_core::{
    ActivityStateEffect, EventPrivacyClass, NaraActivityKind, NaraEmotionalValenceHint,
    NaraJournalParseError, NaraJournalParseInput, NaraJournalParser, NaraObservationKind,
};

fn valid_input(kind: NaraActivityKind, body: &str) -> NaraJournalParseInput {
    NaraJournalParseInput {
        event_id: "activity-1".to_owned(),
        kind,
        coordinate: "M4-4".to_owned(),
        day_id: "30-05-2026".to_owned(),
        now_path: "Idea/Empty/Present/30-05-2026/20260530-120000-main/now.md".to_owned(),
        session_key: "agent:main:main".to_owned(),
        identity_ref: "identity-ref-1".to_owned(),
        matheme_handle: "matheme-profile-118".to_owned(),
        raw_body_handle: "protected://nara/activity-1".to_owned(),
        body: body.to_owned(),
        source_ref: Some("[[Daily Note]]".to_owned()),
        kairos_snapshot: Some("kairos://snapshot/118".to_owned()),
    }
}

#[test]
fn journal_entries_parse_into_protected_activity_and_safe_observation() {
    let input = valid_input(
        NaraActivityKind::Journal,
        "Morning return through M2-1' and M4. Lens 7 kept pulling at position 4.\nI felt heavy at first, then clear after the tarot and I Ching oracle notes.",
    );

    let parsed = NaraJournalParser::parse(input).expect("journal parse should succeed");

    assert_eq!(parsed.activity_event.kind, NaraActivityKind::Journal);
    assert_eq!(
        parsed.activity_event.privacy,
        EventPrivacyClass::ProtectedLocalBody
    );
    assert_eq!(
        parsed.activity_event.raw_body_handle,
        "protected://nara/activity-1"
    );
    assert_eq!(
        parsed.activity_event.source_ref.as_deref(),
        Some("[[Daily Note]]")
    );
    assert_eq!(
        parsed.activity_event.kairos_snapshot.as_deref(),
        Some("kairos://snapshot/118")
    );
    assert_eq!(
        parsed.symbolic_observation.detected_activity_kind,
        NaraActivityKind::Journal
    );
    assert_eq!(parsed.symbolic_observation.word_count, 28);
    assert_eq!(parsed.symbolic_observation.line_count, 2);
    assert_eq!(
        parsed.symbolic_observation.mentioned_coordinates,
        vec!["M2-1'".to_owned(), "M4".to_owned()]
    );
    assert_eq!(parsed.symbolic_observation.mentioned_lenses, vec![7]);
    assert_eq!(parsed.symbolic_observation.mentioned_positions, vec![4]);
    assert_eq!(
        parsed.symbolic_observation.mentioned_oracle_markers,
        vec![
            "tarot".to_owned(),
            "i-ching".to_owned(),
            "oracle".to_owned(),
        ]
    );
    assert_eq!(
        parsed.symbolic_observation.emotional_valence_hint,
        Some(NaraEmotionalValenceHint::Mixed)
    );
    assert_eq!(
        parsed.symbolic_observation.privacy_class,
        EventPrivacyClass::ProtectedLocalDerived
    );
    assert_eq!(
        parsed.symbolic_observation.state_effect,
        ActivityStateEffect::EphemeralContextOnly
    );
    assert_eq!(
        parsed.symbolic_observation.observation_kind,
        NaraObservationKind::HeuristicDerived
    );
    assert!(parsed.symbolic_observation.confidence > 0.0);
    assert!(parsed.symbolic_observation.confidence <= 1.0);
}

#[test]
fn serialized_activity_never_leaks_raw_body_or_private_identity_fields() {
    let body = "A private dream about M3-2 and Lens 4 felt anxious, then steady.";
    let parsed = NaraJournalParser::parse(valid_input(NaraActivityKind::Dream, body))
        .expect("dream parse should succeed");

    let event_json = serde_json::to_value(&parsed.activity_event).expect("event serializes");
    let event_json_text = serde_json::to_string(&parsed.activity_event).expect("event stringifies");
    let observation_json =
        serde_json::to_value(&parsed.symbolic_observation).expect("observation serializes");

    assert!(event_json.get("body").is_none());
    assert!(event_json.get("rawBody").is_none());
    assert!(event_json.get("qPersonal").is_none());
    assert!(event_json.get("natalChartHandle").is_none());
    assert!(event_json.get("identityHash").is_none());
    assert!(!event_json_text.contains("private dream"));
    assert!(observation_json.get("rawBody").is_none());
    assert!(observation_json.get("qPersonal").is_none());
    assert!(observation_json.get("natalChartHandle").is_none());
    assert!(observation_json.get("identityHash").is_none());
}

#[test]
fn empty_body_returns_an_explicit_parse_error() {
    let err = NaraJournalParser::parse(valid_input(NaraActivityKind::DailyNote, " \n\t "))
        .expect_err("whitespace-only body should be rejected");

    assert_eq!(err, NaraJournalParseError::EmptyBody);
}

#[test]
fn dream_oracle_and_highlight_inputs_remain_distinguished() {
    let dream = NaraJournalParser::parse(valid_input(
        NaraActivityKind::Dream,
        "Dream fragment with M1-2 and moon-water residue.",
    ))
    .expect("dream parse succeeds");
    let oracle = NaraJournalParser::parse(valid_input(
        NaraActivityKind::Oracle,
        "Oracle cast with hexagram 24 and tarot mirror.",
    ))
    .expect("oracle parse succeeds");
    let highlight = NaraJournalParser::parse(valid_input(
        NaraActivityKind::Highlight,
        "Highlight from reading: Lens 3 at position 2.",
    ))
    .expect("highlight parse succeeds");

    assert_eq!(
        dream.symbolic_observation.detected_activity_kind,
        NaraActivityKind::Dream
    );
    assert_eq!(
        oracle.symbolic_observation.detected_activity_kind,
        NaraActivityKind::Oracle
    );
    assert_eq!(
        highlight.symbolic_observation.detected_activity_kind,
        NaraActivityKind::Highlight
    );
    assert_ne!(
        oracle.symbolic_observation.mentioned_oracle_markers,
        Vec::<String>::new()
    );
    assert_eq!(
        dream.activity_event.state_effect,
        ActivityStateEffect::EphemeralContextOnly
    );
    assert_eq!(
        oracle.activity_event.state_effect,
        ActivityStateEffect::EphemeralContextOnly
    );
    assert_eq!(
        highlight.activity_event.state_effect,
        ActivityStateEffect::EphemeralContextOnly
    );
}

#[test]
fn opaque_text_returns_a_no_derived_observation_state() {
    let parsed = NaraJournalParser::parse(valid_input(
        NaraActivityKind::Journal,
        "Filed. Archived. Routine note.",
    ))
    .expect("parse should still succeed");

    assert_eq!(
        parsed.symbolic_observation.observation_kind,
        NaraObservationKind::NoDerivedObservation
    );
    assert_eq!(parsed.symbolic_observation.confidence, 0.0);
    assert!(parsed.symbolic_observation.mentioned_coordinates.is_empty());
    assert!(parsed.symbolic_observation.mentioned_lenses.is_empty());
    assert!(parsed.symbolic_observation.mentioned_positions.is_empty());
    assert!(parsed
        .symbolic_observation
        .mentioned_oracle_markers
        .is_empty());
}

#[test]
fn malformed_required_metadata_returns_honest_field_errors() {
    let err = NaraJournalParser::parse(NaraJournalParseInput {
        session_key: " ".to_owned(),
        ..valid_input(NaraActivityKind::Journal, "Lens 5 and M2-1.")
    })
    .expect_err("missing metadata should be rejected");

    assert_eq!(
        err,
        NaraJournalParseError::MissingField {
            field: "session_key"
        }
    );
}
