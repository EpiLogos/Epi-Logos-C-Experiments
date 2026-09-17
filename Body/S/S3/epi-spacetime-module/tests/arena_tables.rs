//! 41.T41.5 structural assertions for the dialogical-arena tables.
//!
//! The crate is `cdylib`-only, so an integration-test crate cannot link it as a
//! Rust library; these tests assert over the module source text (the same
//! pattern used by `being_pattern_projection.rs`). The behavioural round-trip,
//! classifier-discrimination, privacy-projection, and coincidence-reuse tests
//! live as `#[cfg(test)]` unit tests in `src/lib.rs` (which can construct the
//! table structs and call the pure helpers directly) — notably
//! `arena_tables_round_trip`.

const MODULE_SOURCE: &str = include_str!("../src/lib.rs");

#[test]
fn spacetime_module_declares_arena_tables() {
    for table in [
        "arena_scene",
        "arena_presence",
        "arena_turn",
        "arena_dialogue_line",
        "warm_vama_shakti",
    ] {
        assert!(
            MODULE_SOURCE.contains(table),
            "SpaceTimeDB module missing arena table {table}"
        );
    }
}

#[test]
fn spacetime_module_declares_arena_reducers() {
    for reducer in [
        "open_arena_scene",
        "close_arena_scene",
        "admit_arena_presence",
        "release_arena_presence",
        "record_arena_turn",
        "emit_arena_dialogue_line",
        "upsert_warm_vama_shakti",
    ] {
        assert!(
            MODULE_SOURCE.contains(reducer),
            "SpaceTimeDB module missing arena reducer {reducer}"
        );
    }
}

#[test]
fn spacetime_module_arena_presence_carries_classifier_byte() {
    assert!(
        MODULE_SOURCE.contains("pub vama_shakti_class: u8"),
        "ArenaPresence must carry the VamaShaktiClass byte"
    );
    for class in [
        "VAMA_SHAKTI_CLASS_EGREGORE",
        "VAMA_SHAKTI_CLASS_SPRITE",
        "VAMA_SHAKTI_CLASS_DAEMON",
        "VAMA_SHAKTI_CLASS_MANTRA",
    ] {
        assert!(MODULE_SOURCE.contains(class), "missing classifier {class}");
    }
}

#[test]
fn spacetime_module_arena_scene_is_protected_local() {
    assert!(
        MODULE_SOURCE.contains("protected_local_handle_only"),
        "ArenaScene.privacy_class must be protected_local_handle_only"
    );
    // The arena tables are private (no `public` on their #[table] attributes);
    // only the derived projection is global-safe.
    assert!(
        MODULE_SOURCE.contains("project_arena_scene_global"),
        "missing the global-safe projection helper"
    );
    assert!(
        MODULE_SOURCE.contains("plan_arena_coincidence_reuse"),
        "missing the coincidence-reuse planner"
    );
}

#[test]
fn spacetime_module_bumps_projection_schema_to_v3() {
    assert!(
        MODULE_SOURCE.contains("2026-06-16.s3-projection-v3"),
        "PROJECTION_SCHEMA_VERSION must be bumped to 2026-06-16.s3-projection-v3"
    );
    assert!(
        !MODULE_SOURCE.contains(r#"PROJECTION_SCHEMA_VERSION: &str = "2026-06-02.s3-projection-v2""#),
        "old projection schema version constant must be removed"
    );
}
