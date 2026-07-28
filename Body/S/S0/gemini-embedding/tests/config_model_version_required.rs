//! `model_version` is the one `[gemini_embedding]` key that must stay required,
//! and its refusal must be actionable.
//!
//! This lives in its own test binary on purpose. The assertion depends on
//! `$GEMINI_EMBEDDING_MODEL` being unset, and that variable is ambiently
//! exported in some shells here. Removing a process-global env var is only safe
//! when nothing else in the process reads it concurrently — cargo runs each
//! integration-test file as its own binary, and this file holds exactly one
//! test, so this is the only thread in it.

use std::fs;

use gemini_embedding::{EmbeddingConfig, DEFAULT_MODEL_ENV};

#[test]
fn missing_model_version_refuses_with_the_file_path_and_a_pasteable_block() {
    // Sole test in this binary; see the module note above.
    std::env::remove_var(DEFAULT_MODEL_ENV);

    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("config.toml");
    fs::write(&path, "[gemini_embedding]\nmax_rpm = 120\n").expect("write config");

    let error = EmbeddingConfig::from_file(&path)
        .expect_err("model identity has no safe default and must be refused");
    let message = error.to_string();

    // Names the key, and why it cannot simply be defaulted.
    assert!(message.contains("model_version"), "{message}");
    assert!(message.contains(DEFAULT_MODEL_ENV), "{message}");

    // Names the exact file to edit. Without this the user cannot tell which
    // config is being read — `$EPI_LOGOS_CONFIG_PATH` may override the default.
    assert!(
        message.contains(&path.display().to_string()),
        "refusal must name the config file it read: {message}"
    );

    // Carries the exact TOML block to paste, not just a complaint.
    assert!(message.contains("[gemini_embedding]"), "{message}");
    assert!(
        message.contains("model_version = \"gemini-embedding-2-preview\""),
        "refusal must be pasteable, got: {message}"
    );
    assert!(
        message.contains("config.example.toml"),
        "refusal must point at the full template: {message}"
    );

    // A config missing tuning keys as well must still refuse for identity only.
    assert!(
        !message.contains("canonical_context_limit_bytes = 0"),
        "{message}"
    );
}
