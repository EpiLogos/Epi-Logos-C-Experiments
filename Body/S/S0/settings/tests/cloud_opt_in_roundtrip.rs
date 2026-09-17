//! 34.T34.1 <-> 34.T34.2 contract: an opt-in recorded by the S0 settings store
//! MUST be honored by the gemini-embedding accessor's `CloudOptInPolicy`, and a
//! missing opt-in MUST be refused. This is the real round-trip behind
//! `epi settings opt-in gemini_embedding`.

use epi_s0_settings::CloudOptInStore;
use gemini_embedding::{CloudOptInPolicy, TaskType};

#[test]
fn opt_in_recorded_by_settings_is_honored_by_accessor() {
    let dir = tempfile::tempdir().expect("tempdir");
    let config = dir.path().join("config.toml");

    // Seed an unrelated section to prove the writer preserves it.
    std::fs::write(
        &config,
        "[gemini_embedding]\nmodel_version = \"gemini-embedding-2-preview\"\n",
    )
    .expect("seed config");

    // Before opt-in: the accessor refuses.
    let before = CloudOptInPolicy::from_file(&config);
    assert!(
        before
            .require("gemini_embedding", TaskType::RetrievalDocument)
            .is_err(),
        "accessor must refuse before opt-in is recorded"
    );

    // Record opt-in via the S0 settings store (what `epi settings opt-in` calls).
    CloudOptInStore::from_path(&config)
        .record("gemini_embedding", "RETRIEVAL_DOCUMENT", "2026-07-10T09:00:00Z")
        .expect("record opt-in");

    // After opt-in: the accessor allows — across task types (scopes = ["*"]).
    let after = CloudOptInPolicy::from_file(&config);
    assert!(
        after
            .require("gemini_embedding", TaskType::RetrievalDocument)
            .is_ok(),
        "accessor must allow after opt-in is recorded"
    );
    assert!(
        after
            .require("gemini_embedding", TaskType::SemanticSimilarity)
            .is_ok(),
        "broad opt-in (scopes = [*]) honors any task type"
    );

    // The seeded section survived the read-modify-write.
    let raw = std::fs::read_to_string(&config).expect("read back");
    assert!(raw.contains("model_version"), "unrelated section preserved:\n{raw}");
}
