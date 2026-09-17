use std::path::PathBuf;

use portal_core::tunable::metadata::{PrivacyClass, ScopeClass, TuningRiskClass};
use portal_core::tunable::registry::TunableRegistry;

fn schema_dir() -> PathBuf {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("tunable-schema");
    path
}

#[test]
fn registry_loads_cross_schema_file() {
    let reg = TunableRegistry::load_from_dir(&schema_dir()).expect("load");
    let knob = reg.get("cross.spawn_timeout_ms").expect("knob present");
    assert_eq!(knob.value_type, "u32");
    assert_eq!(knob.owning_subsystem, "cross");
    assert_eq!(knob.authoritative_doc, "Track 38 §7.3");
}

#[test]
fn registry_load_fails_on_missing_required_field() {
    use std::io::Write;

    let tmp = tempfile::tempdir().expect("tmp");
    let path = tmp.path().join("bad.tunable.toml");
    let mut file = std::fs::File::create(&path).expect("create");
    writeln!(
        file,
        "[[tunable]]\nkey = \"foo.bar\"\ntype = \"bool\"\ndefault = false"
    )
    .expect("write");

    let result = TunableRegistry::load_from_dir(tmp.path());
    assert!(result.is_err(), "should fail on missing required fields");
}

#[test]
fn registry_loads_nara_session_knobs() {
    let reg = TunableRegistry::load_from_dir(&schema_dir()).expect("load");
    assert!(reg.get("nara.session.protein_capacity").is_some());
    assert!(reg.get("nara.session.stop_codon_policy").is_some());
    assert!(reg.get("nara.session.write_through_mode").is_some());
    assert!(reg.get("nara.session.protected_handle_strict").is_some());
    let capacity = reg.get("nara.session.protein_capacity").unwrap();
    assert_eq!(capacity.owning_subsystem, "M4");
    assert_eq!(capacity.authoritative_doc, "Tranche 5.26");
}

#[test]
fn registry_loads_mythos_symbolic_protein_reading_knobs() {
    let reg = TunableRegistry::load_from_dir(&schema_dir()).expect("load");
    let weights = reg
        .get("mythos.symbolic_protein_reading.cosmic_weather_weights")
        .expect("weights present");
    assert!(
        weights.ml_trainable,
        "cosmic_weather_weights MUST be ml_trainable per 5.27"
    );
    assert_eq!(weights.privacy_class, PrivacyClass::LocalOnly);
    assert_eq!(weights.scope_class, ScopeClass::PerPasu);
    assert_eq!(weights.tuning_risk_class, TuningRiskClass::A);

    for key in [
        "mythos.symbolic_protein_reading.trigger_mode",
        "mythos.symbolic_protein_reading.utterance_interval_n",
        "mythos.symbolic_protein_reading.kairos_pulse_interval_m",
        "mythos.symbolic_protein_reading.adaptive_floor_seconds",
        "mythos.symbolic_protein_reading.adaptive_ceiling_seconds",
        "mythos.symbolic_protein_reading.cosmic_weather_weights",
        "mythos.symbolic_protein_reading.secondary_archetypes_count",
        "mythos.symbolic_protein_reading.voice_template_path",
        "mythos.symbolic_protein_reading.reification_guard_strictness",
    ] {
        assert!(reg.get(key).is_some(), "knob {key} missing");
    }
}

#[test]
fn registry_loads_hen_birth_codon_knobs() {
    let reg = TunableRegistry::load_from_dir(&schema_dir()).expect("load");
    for key in [
        "hen.birth_codon.seed_composition",
        "hen.birth_codon.derivation_policy",
        "hen.birth_codon.provisional_recompute_on_edit",
        "hen.birth_codon.governance_role_assignment",
        "hen.birth_codon.candidate_codon_visible_in_orphan_review",
        "hen.birth_codon.visualisation_density_normalisation",
        "hen.birth_codon.collision_policy",
    ] {
        assert!(reg.get(key).is_some(), "knob {key} missing");
    }
    let policy = reg.get("hen.birth_codon.derivation_policy").unwrap();
    assert_eq!(policy.owning_carrier, Some("hen".to_string()));
    assert_eq!(policy.authoritative_doc, "Tranche CCT-14b");
}
