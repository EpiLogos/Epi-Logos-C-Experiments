use portal_core::tunable::{TunableRegistry, TunableValue};

fn schema_dir() -> std::path::PathBuf {
    let mut p = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    p.push("tunable-schema");
    p
}

#[test]
fn full_registry_loads_migrated_config_surfaces() {
    let reg = TunableRegistry::load_from_dir(&schema_dir()).expect("schema load");
    reg.validate().expect("schema validates");

    assert_eq!(
        reg.value("nara.weights.body_natal"),
        Some(TunableValue::F32(0.5))
    );
    assert_eq!(
        reg.value("aletheia.drift_detection.min_trials"),
        Some(TunableValue::U32(50))
    );
    assert_eq!(
        reg.value("slot.epii_judge.state"),
        Some(TunableValue::Enum("cloud-opt-in".to_string()))
    );
    assert_eq!(reg.value("kairos.enabled"), Some(TunableValue::Bool(false)));
    assert_eq!(
        reg.value("pleroma.session_active_window_minutes"),
        Some(TunableValue::U32(60))
    );

    let counts = [
        ("cross.", 1usize),
        ("pleroma.", 1usize),
        ("nara.session.", 4usize),
        ("mythos.symbolic_protein_reading.", 9usize),
        ("hen.birth_codon.", 7usize),
    ];
    for (prefix, expected) in counts {
        let count = reg
            .iter()
            .filter(|(key, _)| key.starts_with(prefix))
            .count();
        assert_eq!(
            count, expected,
            "knob count under prefix {prefix} = {count}, expected {expected}"
        );
    }
}
