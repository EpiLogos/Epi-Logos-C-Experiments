//! 50.T50.13 — the run trace read against the derived music.
//!
//! Every assertion here is checked against `ql-musical-derivation-v3.md`, which
//! is reference law: the tests quote its tables and the implementation must
//! reproduce them. Nothing in this file re-derives the music.

use portal_core::{
    cf_ordinal, lens_anchor_pitch_class, lens_index_for_label, ConjugateFace, CpfState, CsDirection,
    CsField, VakAddress, VakTonalError, VakTonalReading, VakTraceStep, CF_PROGRESSION,
};

fn step(id: &str, cf: &str) -> VakTraceStep {
    step_recognized(id, cf, false)
}

fn step_recognized(id: &str, cf: &str, recognized: bool) -> VakTraceStep {
    VakTraceStep {
        step_id: id.to_owned(),
        address: VakAddress {
            cpf: CpfState::Mechanistic,
            ct: vec!["CT4".to_owned()],
            cp: "CP4.5".to_owned(),
            cf: cf.to_owned(),
            cfp: "CFP2".to_owned(),
            cs: CsField {
                code: "CS3".to_owned(),
                direction: CsDirection::Day,
                recognized,
            },
        },
        agent: Some("anima".to_owned()),
    }
}

/// The whole CF progression, in order — one full diatonic traversal.
fn full_progression() -> Vec<VakTraceStep> {
    CF_PROGRESSION
        .iter()
        .enumerate()
        .map(|(index, cf)| step(&format!("s{}", index + 1), cf))
        .collect()
}

// ── §II-3.1 — the 12 lens-anchors are the scale-beneath ───────────────────

#[test]
fn lens_anchors_reproduce_the_derivation_table() {
    // v3 §II-3.1, "Chromatic-basis anchor" column, verbatim.
    let table: [(&str, u8, &str); 12] = [
        ("L0", 0, "C"),
        ("L1", 2, "D"),
        ("L2", 4, "E"),
        ("L3", 6, "F#"),
        ("L4", 8, "G#"),
        ("L5", 10, "A#"),
        ("L0'", 1, "C#"),
        ("L1'", 3, "D#"),
        ("L2'", 5, "F"),
        ("L3'", 7, "G"),
        ("L4'", 9, "A"),
        ("L5'", 11, "B"),
    ];
    for (label, expected_pitch_class, expected_note) in table {
        let lens = lens_index_for_label(label).expect("canonical lens label parses");
        assert_eq!(
            lens_anchor_pitch_class(lens),
            expected_pitch_class,
            "{label} anchors on pitch class {expected_pitch_class} ({expected_note}) per §II-3.1"
        );
        let reading = VakTonalReading::from_trace(label, None, &[step("s1", "(00/00)")])
            .expect("Ionian reading at every lens");
        assert_eq!(reading.lens_anchor_note, expected_note);
        assert_eq!(reading.lens, lens);
    }
}

#[test]
fn bimba_lenses_are_the_even_helix_and_pratibimba_the_odd() {
    // §II-1: two whole-tone bases. The unprimed half tiles the even chromatic
    // classes, the primed half the odd — this is what the parity law reads.
    for position in 0u8..6 {
        assert_eq!(lens_anchor_pitch_class(position) % 2, 0);
        assert_eq!(lens_anchor_pitch_class(position + 6) % 2, 1);
    }
}

#[test]
fn a_non_lens_label_is_refused_by_name() {
    for label in ["", "L6", "L", "X0", "L0''", "lens0"] {
        assert!(
            lens_index_for_label(label).is_none(),
            "{label:?} must not parse as a MEF lens"
        );
    }
    let err = VakTonalReading::from_trace("L9", None, &[step("s1", "(00/00)")])
        .expect_err("an unknown scale-beneath is refused, never defaulted");
    assert_eq!(err, VakTonalError::UnknownLens("L9".to_owned()));
    assert!(err.to_string().contains("scale-beneath"));
}

// ── §II-4.2 — the CF progression assigns the scale-degree roles ───────────

#[test]
fn lens0_ionian_reproduces_the_cf_scale_degree_table() {
    // v3 §II-4.2 at Lens 0: the C-major diatonic, one row per CF.
    let table: [(&str, u8, u8, &str, ConjugateFace); 7] = [
        ("(00/00)", 1, 0, "C", ConjugateFace::Name),
        ("(0/1)", 2, 2, "D", ConjugateFace::Name),
        ("(0/1/2)", 3, 4, "E", ConjugateFace::Name),
        ("(0/1/2/3)", 4, 5, "F", ConjugateFace::Power),
        ("(4.0/1-4.4/5)", 5, 7, "G", ConjugateFace::Power),
        ("(4.5/0)", 6, 9, "A", ConjugateFace::Power),
        ("(5/0)", 7, 11, "B", ConjugateFace::Power),
    ];
    let reading = VakTonalReading::from_trace("L0", None, &full_progression())
        .expect("the full progression reads at Lens 0");
    assert_eq!(reading.mode_name, "Ionian");
    assert_eq!(reading.tonic_cf, "(00/00)");

    for (index, (cf, degree, pitch_class, note, face)) in table.iter().enumerate() {
        let read = &reading.steps[index];
        assert_eq!(read.cf, *cf);
        assert_eq!(read.cf_ordinal, index as u8 + 1);
        assert_eq!(read.degree, *degree, "{cf} is scale-degree {degree}");
        assert_eq!(read.pitch_class, *pitch_class, "{cf} sounds {note}");
        assert_eq!(read.note, *note);
        assert_eq!(read.conjugate_face, *face, "{cf} conjugate-form per §II-4.2");
    }
}

#[test]
fn every_cf_in_the_progression_carries_an_m0_address() {
    // DR-VAK-4 (PROPOSED) — read from the landed `M0_CF_ADDRESS`, not restated.
    let reading = VakTonalReading::from_trace("L0", None, &full_progression()).expect("reads");
    let addresses: Vec<&str> = reading
        .steps
        .iter()
        .map(|step| step.m0_address.as_str())
        .collect();
    assert_eq!(
        addresses,
        vec![
            "M0-2:00/00",
            "M0-1/M0-3/M0-4/M0-5:(0/1)",
            "M0-4.0/1/2",
            "M0-4.0/1/2/3",
            "M0-4",
            "M0-4.5/0",
            "M0-5",
        ]
    );
}

// ── §II-4.5 — the seven modes as conjugate-form-selection patterns ────────

/// The conjugate-face pattern of a full progression read in one mode.
fn face_pattern(tonic_cf: &str) -> Vec<ConjugateFace> {
    // Read the progression starting at the tonic so the steps come out in
    // degree order 1..7, which is how §II-4.5 tabulates the pattern.
    let start = (cf_ordinal(tonic_cf).expect("tonic is a CF") - 1) as usize;
    let rotated: Vec<VakTraceStep> = (0..7)
        .map(|offset| step(&format!("s{offset}"), CF_PROGRESSION[(start + offset) % 7]))
        .collect();
    VakTonalReading::from_trace("L0", Some(tonic_cf), &rotated)
        .expect("every CF can sit at tonic")
        .steps
        .iter()
        .map(|step| step.conjugate_face)
        .collect()
}

#[test]
fn six_modes_reproduce_the_derivation_conjugate_patterns_verbatim() {
    use ConjugateFace::{Name as N, Power as P};
    // v3 §II-4.5, "Conjugate-form-selection-pattern across the 7 degrees".
    // Locrian is asserted separately — see the test below.
    let table: [(&str, &str, [ConjugateFace; 7]); 6] = [
        ("Ionian", "(00/00)", [N, N, N, P, P, P, P]),
        ("Dorian", "(0/1)", [N, N, P, P, P, P, N]),
        ("Phrygian", "(0/1/2)", [N, P, P, P, P, N, N]),
        ("Lydian", "(0/1/2/3)", [N, N, N, N, P, P, P]),
        ("Mixolydian", "(4.0/1-4.4/5)", [N, N, N, P, P, P, N]),
        ("Aeolian", "(4.5/0)", [N, N, P, P, P, N, N]),
    ];
    for (mode_name, tonic_cf, expected) in table {
        assert_eq!(
            face_pattern(tonic_cf),
            expected.to_vec(),
            "{mode_name} (tonic {tonic_cf}) per §II-4.5"
        );
    }
}

#[test]
fn locrian_follows_its_own_stated_intervals_where_the_table_row_disagrees() {
    use ConjugateFace::{Name as N, Power as P};
    // §II-4.5's Locrian row is internally inconsistent: its pattern cell reads
    // Name-Power-Power-NAME-POWER-Name-Name, but the same row's own
    // "characteristic intervals" cell requires a PERFECT 4th and a DIMINISHED
    // 5th — and §II-4.4's rule (Power at the 4th = perfect, Name = raised;
    // Power at the 5th = perfect, Name = diminished) makes those two cells
    // contradict each other at degrees 4 and 5. The parity law reproduces the
    // other six rows exactly, and it agrees with Locrian's interval cell, so
    // the two divergent cells read as a transposition in the table.
    // Flagged for Architect ruling; the derivation file is NOT edited here.
    assert_eq!(face_pattern("(5/0)"), vec![N, P, P, P, N, N, N]);

    // Grounded on CF7 the degrees run CF7,CF1,CF2,CF3,CF4,CF5,CF6 — so the 4th
    // is CF3 and the 5th is CF4, and at Lens 0 that is B → E and B → F.
    let reading = VakTonalReading::from_trace(
        "L0",
        Some("(5/0)"),
        &[step("s1", "(5/0)"), step("s2", "(0/1/2)"), step("s3", "(0/1/2/3)")],
    )
    .expect("reads");
    assert_eq!(reading.steps[1].degree, 4);
    assert_eq!(reading.steps[1].note, "E");
    assert_eq!(
        reading.steps[1].interval_from_tonic, 5,
        "Locrian 4th is perfect — 5 semitones"
    );
    assert_eq!(reading.steps[2].degree, 5);
    assert_eq!(reading.steps[2].note, "F");
    assert_eq!(
        reading.steps[2].interval_from_tonic, 6,
        "Locrian 5th is diminished — 6 semitones, the mode's defining interval"
    );
}

#[test]
fn mixolydian_puts_anima_at_tonic_and_flattens_the_seventh() {
    // §II-4.5: "Why Mixolydian has flat-seventh". The dispatch authority
    // `(4.0/1-4.4/5)` grounding the scale is the operationally testable case
    // DR-VAK-6 names for modal rotation.
    let reading = VakTonalReading::from_trace(
        "L0",
        Some("(4.0/1-4.4/5)"),
        &[step("s1", "(4.0/1-4.4/5)"), step("s2", "(0/1/2/3)")],
    )
    .expect("reads");
    assert_eq!(reading.mode, 4);
    assert_eq!(reading.mode_name, "Mixolydian");
    assert_eq!(reading.tonic_note, "G");
    assert_eq!(reading.steps[0].degree, 1, "Anima's CF is the ground");
    assert_eq!(reading.steps[0].interval_from_tonic, 0);
    assert_eq!(reading.steps[1].degree, 7);
    assert_eq!(
        reading.steps[1].interval_from_tonic, 10,
        "the 7th is minor — 10 semitones, not 11"
    );
}

#[test]
fn rotation_preserves_absolute_pitch_and_moves_only_the_ground() {
    // A mode does not transpose the scale; it re-grounds it. The same CF sounds
    // the same note at a given lens under every tonic (§II-3.1 anchors the
    // substrate, §II-4.5 only chooses which degree is 1).
    for tonic_cf in CF_PROGRESSION {
        let reading = VakTonalReading::from_trace("L2", Some(tonic_cf), &full_progression())
            .expect("reads");
        let pitches: Vec<u8> = reading.steps.iter().map(|step| step.pitch_class).collect();
        assert_eq!(
            pitches,
            vec![4, 6, 8, 9, 11, 1, 3],
            "L2 anchors on E; the pitch collection is fixed under tonic {tonic_cf}"
        );
        let degrees: Vec<u8> = reading.steps.iter().map(|step| step.degree).collect();
        let mut sorted = degrees.clone();
        sorted.sort_unstable();
        assert_eq!(sorted, (1u8..=7).collect::<Vec<u8>>(), "all seven degrees, once each");
    }
}

// ── §II-4.6 — the 84-fold landscape ──────────────────────────────────────

#[test]
fn every_lens_mode_pair_is_a_distinct_address_in_the_eighty_four() {
    let mut seen = std::collections::BTreeSet::new();
    for lens in 0u8..12 {
        let label = if lens < 6 {
            format!("L{lens}")
        } else {
            format!("L{}'", lens - 6)
        };
        for tonic_cf in CF_PROGRESSION {
            let reading = VakTonalReading::from_trace(&label, Some(tonic_cf), &full_progression())
                .expect("all 84 combinations are structurally realised (§II-4.6)");
            assert_eq!(reading.lens_mode_index, lens * 7 + reading.mode);
            assert!(
                seen.insert(reading.lens_mode_index),
                "{label}/{tonic_cf} collided at index {}",
                reading.lens_mode_index
            );
        }
    }
    assert_eq!(seen.len(), 84, "12 lens-scales x 7 CF-modes");
    assert_eq!(seen.iter().copied().min(), Some(0));
    assert_eq!(seen.iter().copied().max(), Some(83));
}

// ── §II-4.7 — the Klein double cover ─────────────────────────────────────

#[test]
fn the_hopf_fiber_is_the_conjugate_face() {
    // One law, two faces: the sheet a step sits on IS which conjugate half it
    // speaks from. Bimba ticks 0-5 occupy 0-300 degrees, pratibimba 6-11
    // occupy 360-660, and `hopf_fiber` splits at 360.
    for tonic_cf in CF_PROGRESSION {
        let reading =
            VakTonalReading::from_trace("L0", Some(tonic_cf), &full_progression()).expect("reads");
        for step in &reading.steps {
            let expected = match step.conjugate_face {
                ConjugateFace::Name => 0,
                ConjugateFace::Power => 1,
            };
            assert_eq!(
                step.hopf_fiber, expected,
                "{} at interval {} sits on sheet {expected}",
                step.cf, step.interval_from_tonic
            );
            assert_eq!(step.degree720 % 60, 0, "degree720 is the tick x 60 law");
            assert!(step.degree720 <= 660);
            assert_eq!(step.hopf_fiber, u8::from(step.degree720 >= 360));
        }
    }
}

#[test]
fn a_complete_octave_traversal_enacts_exactly_two_klein_twists() {
    // §II-4.7: one twist at the tetrachord bridge (E→F), one at the octave
    // return (B→C'). The bridge shows up in the seven-step progression; the
    // second twist only exists when the run actually returns to its ground.
    let open = VakTonalReading::from_trace("L0", None, &full_progression()).expect("reads");
    assert_eq!(
        open.conjugate_face_changes, 1,
        "CF1..CF7 alone crosses only the tetrachord bridge"
    );
    assert!(!open.returns_to_tonic);

    let mut closed = full_progression();
    closed.push(step_recognized("s8", "(00/00)", true));
    let closed = VakTonalReading::from_trace("L0", None, &closed).expect("reads");
    assert_eq!(
        closed.conjugate_face_changes, 2,
        "the octave return is the second Klein twist"
    );
    assert!(closed.returns_to_tonic, "the Mobius close lands on the tonic");
    assert!(closed.recognition_closed, "DR-VAK-5 recognition rides the last step");
    assert!(closed.both_faces_sounded);
}

#[test]
fn a_run_that_never_leaves_the_ground_sounds_one_face_and_six_silences() {
    let reading = VakTonalReading::from_trace(
        "L0",
        None,
        &[step("s1", "(00/00)"), step("s2", "(00/00)")],
    )
    .expect("reads");
    assert_eq!(reading.degrees_sounded, vec![1]);
    assert_eq!(reading.degrees_silent, vec![2, 3, 4, 5, 6, 7]);
    assert_eq!(reading.conjugate_face_changes, 0);
    assert!(!reading.both_faces_sounded);
    assert!(reading.returns_to_tonic);
    assert!(!reading.recognition_closed);
}

// ── refusals ─────────────────────────────────────────────────────────────

#[test]
fn an_empty_trace_and_an_unknown_frame_are_both_refused_by_name() {
    assert_eq!(
        VakTonalReading::from_trace("L0", None, &[]).expect_err("nothing to read"),
        VakTonalError::EmptyTrace
    );

    let err = VakTonalReading::from_trace("L0", Some("(9/9)"), &[step("s1", "(00/00)")])
        .expect_err("a non-CF cannot sit at tonic");
    assert_eq!(err, VakTonalError::UnknownTonicCf("(9/9)".to_owned()));

    let err = VakTonalReading::from_trace("L0", None, &[step("s1", "(4/5/0)")])
        .expect_err("a drifted CF literal is refused, not silently degreed");
    assert_eq!(
        err,
        VakTonalError::UnknownStepCf {
            step_id: "s1".to_owned(),
            cf: "(4/5/0)".to_owned(),
        }
    );
    assert!(err.to_string().contains("s1"));
}

#[test]
fn the_reading_serialises_camel_case_for_the_wire() {
    let reading = VakTonalReading::from_trace("L3'", Some("(0/1)"), &full_progression())
        .expect("reads");
    let json = serde_json::to_value(&reading).expect("serialises");
    for key in [
        "lensLabel",
        "lensAnchorPitchClass",
        "modeName",
        "tonicCf",
        "lensModeIndex",
        "degreesSounded",
        "conjugateFaceChanges",
        "bothFacesSounded",
        "returnsToTonic",
        "recognitionClosed",
    ] {
        assert!(json.get(key).is_some(), "payload carries {key}");
    }
    let first = &json["steps"][0];
    for key in [
        "stepId",
        "cfOrdinal",
        "pitchClass",
        "intervalFromTonic",
        "conjugateFace",
        "degree720",
        "hopfFiber",
        "m0Address",
    ] {
        assert!(first.get(key).is_some(), "step carries {key}");
    }
    assert_eq!(first["conjugateFace"], "name");
}
