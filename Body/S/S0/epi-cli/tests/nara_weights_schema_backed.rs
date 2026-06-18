use epi_logos::nara::weights::load_weights;

#[test]
fn nara_weights_backward_compat_with_existing_toml() {
    let original_home = std::env::var_os("HOME");
    let tmp = std::env::temp_dir().join(format!(
        "epi-nara-weights-schema-backed-{}",
        std::process::id()
    ));
    let _ = std::fs::remove_dir_all(&tmp);
    std::fs::create_dir_all(tmp.join(".epi-logos")).unwrap();
    std::env::set_var("HOME", &tmp);

    std::fs::write(
        tmp.join(".epi-logos").join("config.toml"),
        r#"
[nara.weights]
body_natal = 0.7
body_transit = 0.2
body_oracle = 0.1
oracle_pp = 0.4
oracle_nn = 0.3
oracle_mp = 0.2
oracle_pm = 0.1
"#,
    )
    .unwrap();

    let w = load_weights().expect("load");

    if let Some(home) = original_home {
        std::env::set_var("HOME", home);
    } else {
        std::env::remove_var("HOME");
    }
    let _ = std::fs::remove_dir_all(&tmp);

    assert!((w.body_natal - 0.7).abs() < 1e-6);
    assert!((w.body_transit - 0.2).abs() < 1e-6);
    assert!((w.body_oracle - 0.1).abs() < 1e-6);
    assert!((w.oracle_pp - 0.4).abs() < 1e-6);
    assert!((w.oracle_nn - 0.3).abs() < 1e-6);
    assert!((w.oracle_mp - 0.2).abs() < 1e-6);
    assert!((w.oracle_pm - 0.1).abs() < 1e-6);
}
