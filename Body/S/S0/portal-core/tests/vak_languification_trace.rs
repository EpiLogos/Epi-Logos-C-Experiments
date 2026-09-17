use portal_core::{
    kernel_tick_from_epogdoon, CpfState, CsDirection, CsField, MathemeHarmonicProfile, VakAddress,
    VakLanguificationTrace, VakLevel, M0_CF_ADDRESS,
};
use serde_json::json;

const CF_LITERALS: [&str; 7] = [
    "(00/00)",
    "(0/1)",
    "(0/1/2)",
    "(0/1/2/3)",
    "(4.0/1-4.4/5)",
    "(4.5/0)",
    "(5/0)",
];

fn vak(cpf: CpfState, cf: &str, recognized: bool) -> VakAddress {
    VakAddress {
        cpf,
        ct: vec!["CT4".to_owned()],
        cp: "CP4.5".to_owned(),
        cf: cf.to_owned(),
        cfp: "CFP5".to_owned(),
        cs: CsField {
            code: "CS5".to_owned(),
            direction: CsDirection::Night,
            recognized,
        },
    }
}

fn trace(
    cpf: CpfState,
    cf: &str,
    recognized: bool,
    bias_weights_empty: bool,
) -> VakLanguificationTrace {
    let profile = MathemeHarmonicProfile::with_vak(
        kernel_tick_from_epogdoon(13, if recognized { 6 } else { 5 }),
        vak(cpf, cf, recognized),
    );
    VakLanguificationTrace::from_profile(&profile, bias_weights_empty)
        .expect("profile with VAK address emits languification trace")
}

#[test]
fn vak_level_assigned_uniquely_per_cf_under_recognition() {
    for cf in CF_LITERALS {
        for recognized in [false, true] {
            for cpf in [CpfState::Dialogical, CpfState::Mechanistic] {
                let bias_weights_empty = matches!(cpf, CpfState::Dialogical);
                let trace = trace(cpf, cf, recognized, bias_weights_empty);
                assert!(
                    matches!(
                        trace.vak_level,
                        VakLevel::Para
                            | VakLevel::Pashyanti
                            | VakLevel::Madhyama
                            | VakLevel::Vaikhari
                    ),
                    "{cpf:?} {cf} recognized={recognized} did not map to exactly one level"
                );
            }
        }
    }
}

#[test]
fn dialogical_cpf_with_empty_bias_is_para() {
    for cf in CF_LITERALS {
        let trace = trace(CpfState::Dialogical, cf, true, true);
        assert_eq!(trace.vak_level, VakLevel::Para);
        assert!(trace.bias_weights_empty);
        assert_eq!(trace.cpf_notation, "(00/00)");
    }
}

#[test]
fn cf_mobius_without_recognition_is_madhyama_not_vaikhari() {
    let open = trace(CpfState::Mechanistic, "(5/0)", false, false);
    assert_eq!(open.vak_level, VakLevel::Madhyama);
    assert!(!open.recognition_closed);

    let closed = trace(CpfState::Mechanistic, "(5/0)", true, false);
    assert_eq!(closed.vak_level, VakLevel::Vaikhari);
    assert!(closed.recognition_closed);
}

#[test]
fn m0_cf_address_table_matches_psychoid_numbers_h() {
    let from_header = [
        ("(00/00)", "M0-2:00/00"),
        ("(0/1)", "M0-1/M0-3/M0-4/M0-5:(0/1)"),
        ("(0/1/2)", "M0-4.0/1/2"),
        ("(0/1/2/3)", "M0-4.0/1/2/3"),
        ("(4.0/1-4.4/5)", "M0-4"),
        ("(4.5/0)", "M0-4.5/0"),
        ("(5/0)", "M0-5"),
    ];
    assert_eq!(M0_CF_ADDRESS, from_header);
}

#[test]
fn optional_fields_serialize_as_omitted_not_null_zero() {
    let profile = MathemeHarmonicProfile::with_vak(
        kernel_tick_from_epogdoon(13, 0),
        vak(CpfState::Mechanistic, "(0/1)", false),
    );
    let mut trace = VakLanguificationTrace::from_profile(&profile, false).unwrap();
    trace.resonance72_index = None;
    trace.half_decan_index = None;
    trace.mode_tonic_cf = None;

    let value = serde_json::to_value(&trace).expect("trace serializes");
    assert_eq!(value["cfNotation"], json!("(0/1)"));
    assert_eq!(value["vakLevel"], json!("pashyanti"));
    assert!(value.get("resonance72Index").is_none());
    assert!(value.get("halfDecanIndex").is_none());
    assert!(value.get("modeTonicCf").is_none());
}

#[test]
fn full_day_night_cycle_languification_sequence() {
    let sequence = [
        (CpfState::Dialogical, "(00/00)", false, true),
        (CpfState::Mechanistic, "(0/1)", false, false),
        (CpfState::Mechanistic, "(0/1/2)", false, false),
        (CpfState::Mechanistic, "(0/1/2/3)", false, false),
        (CpfState::Mechanistic, "(4.0/1-4.4/5)", false, false),
        (CpfState::Mechanistic, "(4.5/0)", false, false),
        (CpfState::Mechanistic, "(5/0)", true, false),
    ];
    let levels = sequence
        .iter()
        .map(|(cpf, cf, recognized, bias_empty)| {
            trace(*cpf, cf, *recognized, *bias_empty).vak_level
        })
        .collect::<Vec<_>>();

    assert_eq!(
        levels,
        vec![
            VakLevel::Para,
            VakLevel::Pashyanti,
            VakLevel::Pashyanti,
            VakLevel::Pashyanti,
            VakLevel::Madhyama,
            VakLevel::Madhyama,
            VakLevel::Vaikhari,
        ]
    );

    let terminal = trace(CpfState::Mechanistic, "(5/0)", true, false);
    assert!(terminal.recognition_closed);
    assert_eq!(terminal.diatonic_degree, 0);
}
