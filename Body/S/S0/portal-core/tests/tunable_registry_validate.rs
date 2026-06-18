use std::io::Write;

use portal_core::tunable::registry::{TunableRegistry, ValidationError};

fn write_schema(dir: &std::path::Path, name: &str, body: &str) {
    let path = dir.join(name);
    let mut file = std::fs::File::create(&path).unwrap();
    file.write_all(body.as_bytes()).unwrap();
}

#[test]
fn validate_rejects_structural_invariant_without_warrant() {
    let tmp = tempfile::tempdir().unwrap();
    write_schema(
        tmp.path(),
        "bad.tunable.toml",
        r#"
[[tunable]]
key = "foo.locked"
type = "u32"
default = 27
structural_invariant = true
owning_subsystem = "M3"
authoritative_doc = "DR-M3-1"
"#,
    );
    let reg = TunableRegistry::load_from_dir(tmp.path()).unwrap();
    let result = reg.validate();
    assert!(matches!(
        result,
        Err(ValidationError::StructuralWithoutWarrant { ref key }) if key == "foo.locked"
    ));
}

#[test]
fn validate_accepts_structural_invariant_with_warrant() {
    let tmp = tempfile::tempdir().unwrap();
    write_schema(
        tmp.path(),
        "ok.tunable.toml",
        r#"
[[tunable]]
key = "m3.tarot_codon_map"
type = "u32_lut"
default = 0
structural_invariant = true
warrant_constants = ["M3_TAROT_CODON_MAP", "DR-M3-1"]
owning_subsystem = "M3"
authoritative_doc = "DR-M3-1"
"#,
    );
    let reg = TunableRegistry::load_from_dir(tmp.path()).unwrap();
    reg.validate().expect("should pass");
}

#[test]
fn validate_rejects_sum_to_on_non_triplet() {
    let tmp = tempfile::tempdir().unwrap();
    write_schema(
        tmp.path(),
        "bad.tunable.toml",
        r#"
[[tunable]]
key = "foo.scalar"
type = "f32"
default = 0.5
owning_subsystem = "cross"
authoritative_doc = "Track 38"
[tunable.range]
sum_to = 1.0
"#,
    );
    let reg = TunableRegistry::load_from_dir(tmp.path()).unwrap();
    let result = reg.validate();
    assert!(matches!(
        result,
        Err(ValidationError::SumToOnNonTriplet { .. })
    ));
}
