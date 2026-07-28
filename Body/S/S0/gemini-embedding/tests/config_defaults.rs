//! Config-loading contract: which keys default, which stay required, and what
//! an incomplete config is allowed to do.
//!
//! Why this file exists: on 2026-07-28 `EmbeddingConfig::from_default_file`
//! hard-errored on a missing `[gemini_embedding].canonical_context_limit_bytes`
//! on a machine that had a valid API key. The caller
//! (`Body/S/S0/epi-cli/tests/graph_seed.rs`) loads the config only after it has
//! already cleared and re-seeded a graph, so a missing *tuning* key aborted the
//! run with the database half-written. These tests pin the rule that prevents a
//! recurrence: tuning keys default, identity keys refuse.

use std::{fs, path::PathBuf};

use gemini_embedding::{
    EmbeddingConfig, RateLimitConfig, DEFAULT_BACKOFF_FACTOR, DEFAULT_BACKOFF_INITIAL_MS,
    DEFAULT_CANONICAL_CONTEXT_LIMIT_BYTES, DEFAULT_JITTER_RATIO, DEFAULT_MAX_CONCURRENT,
    DEFAULT_MAX_RETRIES, DEFAULT_MAX_RPM,
};

/// The regression that matters: a config carrying nothing but the required
/// identity key must load. Every tuning key resolves to its documented default
/// instead of aborting the caller.
#[test]
fn config_with_only_model_version_loads_with_documented_defaults() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("config.toml");
    fs::write(
        &path,
        "[gemini_embedding]\nmodel_version = \"gemini-embedding-2-preview\"\n",
    )
    .expect("write config");

    let config = EmbeddingConfig::from_file(&path).expect("minimal config must load");

    assert_eq!(
        config.canonical_context_limit_bytes, DEFAULT_CANONICAL_CONTEXT_LIMIT_BYTES,
        "the key whose absence aborted the 2026-07-28 seed run must now default"
    );
    assert_eq!(config.rate_limit, RateLimitConfig::default());
    assert_eq!(config.rate_limit.max_rpm, DEFAULT_MAX_RPM);
    assert_eq!(config.rate_limit.max_concurrent, DEFAULT_MAX_CONCURRENT);
    assert_eq!(
        config.rate_limit.backoff_initial_ms,
        DEFAULT_BACKOFF_INITIAL_MS
    );
    assert_eq!(config.rate_limit.backoff_factor, DEFAULT_BACKOFF_FACTOR);
    assert_eq!(config.rate_limit.jitter_ratio, DEFAULT_JITTER_RATIO);
    assert_eq!(config.rate_limit.max_retries, DEFAULT_MAX_RETRIES);
    assert!(config.cache_root.as_os_str().len() > 0);
}

/// A file that exists but has no `[gemini_embedding]` section at all is the
/// exact shape of the user's real `~/.epi-logos/config.toml` at the time of the
/// incident. It must fail on the identity key only — never on tuning.
#[test]
fn config_without_the_section_fails_only_on_identity() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("config.toml");
    fs::write(&path, "[some_other_section]\nvalue = 1\n").expect("write config");

    // `GEMINI_EMBEDDING_MODEL` is ambiently exported in some shells here, so
    // this may legitimately resolve either way. Both outcomes are asserted, and
    // neither is allowed to mention a tuning key.
    match EmbeddingConfig::from_file(&path) {
        Ok(config) => {
            assert_eq!(
                config.canonical_context_limit_bytes,
                DEFAULT_CANONICAL_CONTEXT_LIMIT_BYTES
            );
            assert_eq!(config.rate_limit, RateLimitConfig::default());
        }
        Err(error) => {
            let message = error.to_string();
            assert!(
                message.contains("model_version"),
                "the only permitted refusal is the identity key, got: {message}"
            );
            for tuning_key in [
                "canonical_context_limit_bytes",
                "max_rpm",
                "max_concurrent",
                "backoff_initial_ms",
                "backoff_factor",
                "jitter_ratio",
                "max_retries",
            ] {
                assert!(
                    !message.starts_with(&format!("missing [gemini_embedding].{tuning_key}")),
                    "a tuning key must never be the reason a config load fails: {message}"
                );
            }
        }
    }
}

/// Defaults are a fallback for silence, not a repair for a wrong value: values
/// the user explicitly wrote are still validated exactly as strictly as before.
#[test]
fn explicitly_written_values_are_still_validated() {
    let cases = [
        ("max_rpm = 0", "max_rpm"),
        ("max_concurrent = 0", "max_concurrent"),
        ("backoff_factor = 0.5", "backoff_factor"),
        ("jitter_ratio = 1.5", "jitter_ratio"),
        ("canonical_context_limit_bytes = 0", "canonical_context_limit_bytes"),
    ];

    for (line, key) in cases {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("config.toml");
        fs::write(
            &path,
            format!("[gemini_embedding]\nmodel_version = \"m\"\n{line}\n"),
        )
        .expect("write config");

        let error = EmbeddingConfig::from_file(&path)
            .expect_err(&format!("`{line}` must be rejected, not silently defaulted"));
        let message = error.to_string();
        assert!(message.contains(key), "error should name `{key}`: {message}");
        assert!(
            message.contains(&path.display().to_string()),
            "error should name the offending config file: {message}"
        );
    }
}

#[test]
fn explicit_values_override_the_defaults() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("config.toml");
    fs::write(
        &path,
        "[gemini_embedding]\n\
         model_version = \"m\"\n\
         canonical_context_limit_bytes = 4096\n\
         max_rpm = 600\n\
         max_concurrent = 8\n\
         backoff_initial_ms = 1\n\
         backoff_factor = 3.0\n\
         jitter_ratio = 0.0\n\
         max_retries = 7\n",
    )
    .expect("write config");

    let config = EmbeddingConfig::from_file(&path).expect("load config");

    assert_eq!(config.canonical_context_limit_bytes, 4096);
    assert_eq!(config.rate_limit.max_rpm, 600);
    assert_eq!(config.rate_limit.max_concurrent, 8);
    assert_eq!(config.rate_limit.backoff_initial_ms, 1);
    assert_eq!(config.rate_limit.backoff_factor, 3.0);
    assert_eq!(config.rate_limit.jitter_ratio, 0.0);
    assert_eq!(config.rate_limit.max_retries, 7);
}

/// The shipped template must actually load, and the values it documents as
/// defaults must be the values the code actually applies. This is what stops
/// `config.example.toml` from drifting into a lie.
#[test]
fn shipped_template_loads_and_matches_the_documented_defaults() {
    let template = template_path();
    let config = EmbeddingConfig::from_file(&template).unwrap_or_else(|error| {
        panic!("{} must load as-is: {error}", template.display())
    });

    assert!(
        !config.model_version.trim().is_empty(),
        "template must supply the required identity key"
    );
    // Every tuning key in the template is commented out, so loading it must
    // reproduce the defaults exactly. If someone changes a DEFAULT_* const
    // without updating the template's documented value, this still passes —
    // so assert the documented text too, below.
    assert_eq!(
        config.canonical_context_limit_bytes,
        DEFAULT_CANONICAL_CONTEXT_LIMIT_BYTES
    );
    assert_eq!(config.rate_limit, RateLimitConfig::default());

    let text = fs::read_to_string(&template).expect("read template");
    for (key, documented) in [
        (
            "canonical_context_limit_bytes",
            DEFAULT_CANONICAL_CONTEXT_LIMIT_BYTES.to_string(),
        ),
        ("max_rpm", DEFAULT_MAX_RPM.to_string()),
        ("max_concurrent", DEFAULT_MAX_CONCURRENT.to_string()),
        (
            "backoff_initial_ms",
            DEFAULT_BACKOFF_INITIAL_MS.to_string(),
        ),
        ("backoff_factor", DEFAULT_BACKOFF_FACTOR.to_string()),
        ("jitter_ratio", DEFAULT_JITTER_RATIO.to_string()),
        ("max_retries", DEFAULT_MAX_RETRIES.to_string()),
    ] {
        assert!(
            text.contains(&format!("# {key} = {documented}")),
            "template must document `{key}` at its real default `{documented}`; \
             update config.example.toml when a DEFAULT_* const changes"
        );
    }
}

fn template_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("config.example.toml")
}
