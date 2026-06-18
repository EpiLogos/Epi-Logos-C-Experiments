#[test]
fn kairos_enabled_reads_from_schema_default() {
    let mut p = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    p.push("tunable-schema");
    let reg = portal_core::tunable::registry::TunableRegistry::load_from_dir(&p).unwrap();
    let v = reg.value("kairos.enabled").unwrap();
    assert_eq!(v, portal_core::tunable::metadata::TunableValue::Bool(false));
}
