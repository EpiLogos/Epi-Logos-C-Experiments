use std::io::Write;

use portal_core::tunable::metadata::TunableValue;
use portal_core::tunable::registry::TunableRegistry;

fn write_file(path: &std::path::Path, body: &str) {
    let mut file = std::fs::File::create(path).unwrap();
    file.write_all(body.as_bytes()).unwrap();
}

#[test]
fn merge_user_override_replaces_default() {
    let tmp = tempfile::tempdir().unwrap();
    let schema_dir = tmp.path().join("schema");
    std::fs::create_dir(&schema_dir).unwrap();
    write_file(
        &schema_dir.join("test.tunable.toml"),
        r#"
[[tunable]]
key = "test.foo"
type = "u32"
default = 100
owning_subsystem = "cross"
authoritative_doc = "Track 38"
"#,
    );
    let config_path = tmp.path().join("config.toml");
    write_file(
        &config_path,
        r#"
[test]
foo = 250
"#,
    );
    let reg = TunableRegistry::load_with_overrides(&schema_dir, Some(&config_path)).unwrap();
    let value = reg.value("test.foo").expect("present");
    assert_eq!(value, TunableValue::U32(250));
}

#[test]
fn merge_no_override_uses_default() {
    let tmp = tempfile::tempdir().unwrap();
    let schema_dir = tmp.path().join("schema");
    std::fs::create_dir(&schema_dir).unwrap();
    write_file(
        &schema_dir.join("test.tunable.toml"),
        r#"
[[tunable]]
key = "test.bar"
type = "bool"
default = true
owning_subsystem = "cross"
authoritative_doc = "Track 38"
"#,
    );
    let reg = TunableRegistry::load_with_overrides(&schema_dir, None).unwrap();
    let value = reg.value("test.bar").expect("present");
    assert_eq!(value, TunableValue::Bool(true));
}
