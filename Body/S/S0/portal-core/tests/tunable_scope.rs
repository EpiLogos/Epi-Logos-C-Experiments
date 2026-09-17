use std::io::Write;

use portal_core::tunable::metadata::TunableValue;
use portal_core::tunable::registry::TunableRegistry;
use portal_core::tunable::scope::{ResolutionContext, ScopeResolver};

fn setup() -> (tempfile::TempDir, TunableRegistry) {
    let tmp = tempfile::tempdir().unwrap();
    let schema_dir = tmp.path().join("schema");
    std::fs::create_dir(&schema_dir).unwrap();
    let mut file = std::fs::File::create(schema_dir.join("test.tunable.toml")).unwrap();
    writeln!(
        file,
        r#"
[[tunable]]
key = "test.user_pref"
type = "u32"
default = 5
scope_class = "per-pasu"
owning_subsystem = "M4"
authoritative_doc = "Track 38"
"#
    )
    .unwrap();
    let reg = TunableRegistry::load_from_dir(&schema_dir).unwrap();
    (tmp, reg)
}

#[test]
fn scope_resolves_global_when_no_overrides() {
    let (_tmp, reg) = setup();
    let ctx = ResolutionContext {
        global_config: None,
        pasu_config: None,
        session_overrides: Default::default(),
    };
    let resolver = ScopeResolver::new(&reg, ctx);
    assert_eq!(resolver.value("test.user_pref"), Some(TunableValue::U32(5)));
}

#[test]
fn scope_per_pasu_overrides_global() {
    let (tmp, reg) = setup();
    let pasu_path = tmp.path().join("pasu_config.toml");
    std::fs::write(
        &pasu_path,
        r#"[test]
user_pref = 11
"#,
    )
    .unwrap();
    let ctx = ResolutionContext {
        global_config: None,
        pasu_config: Some(pasu_path),
        session_overrides: Default::default(),
    };
    let resolver = ScopeResolver::new(&reg, ctx);
    assert_eq!(
        resolver.value("test.user_pref"),
        Some(TunableValue::U32(11))
    );
}

#[test]
fn scope_per_session_overrides_all() {
    let (tmp, reg) = setup();
    let pasu_path = tmp.path().join("pasu_config.toml");
    std::fs::write(
        &pasu_path,
        r#"[test]
user_pref = 11
"#,
    )
    .unwrap();
    let mut session = std::collections::HashMap::new();
    session.insert("test.user_pref".to_string(), TunableValue::U32(99));
    let ctx = ResolutionContext {
        global_config: None,
        pasu_config: Some(pasu_path),
        session_overrides: session,
    };
    let resolver = ScopeResolver::new(&reg, ctx);
    assert_eq!(
        resolver.value("test.user_pref"),
        Some(TunableValue::U32(99))
    );
}
