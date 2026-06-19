mod common;

use common::{run_epi, TestEnv};

fn run_json(args: &[&str]) -> serde_json::Value {
    let env = TestEnv::empty();
    let output = run_epi(args, &env);
    assert!(
        output.status.success(),
        "command failed:\nstdout:\n{}\n\nstderr:\n{}",
        output.stdout,
        output.stderr
    );
    assert_eq!(
        output.stdout.lines().count(),
        1,
        "default canon output must be a single JSON line:\n{}",
        output.stdout
    );
    serde_json::from_str(&output.stdout).expect("canon output should be valid json")
}

#[test]
fn coord_l0_returns_only_token_and_q_identity() {
    let json = run_json(&["canon", "coord", "P1-137-M0"]);

    assert_eq!(json["depth"], "token");
    assert_eq!(json["coordinate"], "P1-137-M0");
    assert!(json["q_identity"].is_object());
    assert!(json.get("frame").is_none(), "L0 must stay token lean");
    assert!(
        json.get("square").is_none(),
        "L0 must not expand square data"
    );
}

#[test]
fn coord_depth_ladder_progressively_adds_l1_to_l5_payloads() {
    let frame = run_json(&["canon", "coord", "P1-137-M0", "--depth", "frame"]);
    assert_eq!(frame["depth"], "frame");
    assert_eq!(frame["frame"]["cf"], "(0/1)");
    assert_eq!(frame["primary_classification"]["p_position"], 1);

    let square = run_json(&["canon", "coord", "P1-137-M0", "--depth", "square"]);
    assert_eq!(square["depth"], "square");
    assert_eq!(square["square"]["p_position"], 1);
    assert_eq!(square["square"]["poles"].as_array().unwrap().len(), 4);
    assert!(square["square"]["poles"]
        .as_array()
        .unwrap()
        .iter()
        .all(|pole| pole["refractions"]["l1"].is_string()
            && pole["refractions"]["l1_prime"].is_string()
            && pole["refractions"]["l4"].is_string()
            && pole["refractions"]["l4_prime"].is_string()));

    let resolve = run_json(&["canon", "coord", "P1-137-M0", "--depth", "resolve"]);
    assert_eq!(resolve["depth"], "resolve");
    assert_eq!(resolve["bimba_subgraph"]["anchor"], "P1-137-M0");
    assert!(resolve["hen_artifact_trace"].as_array().unwrap().len() >= 2);
    assert!(resolve["resonance_indicator"]["delta"].is_number());

    let identity = run_json(&["canon", "coord", "P1-137-M0", "--depth", "identity"]);
    assert_eq!(identity["depth"], "identity");
    assert!(identity["canonical_identity"]["q_personal"].is_array());
    assert!(identity["canonical_identity"]["q_cosmic"].is_array());
    assert!(identity["canonical_identity"]["s0_kernel_primitives"].is_object());

    let surface = run_json(&["canon", "coord", "P1-137-M0", "--depth", "surface"]);
    assert_eq!(surface["depth"], "surface");
    let resonance = surface["resonance"].as_f64().expect("resonance numeric");
    assert!((0.0..=1.0).contains(&resonance));
    assert!(surface["conjugate_form_character"].is_string());
    assert!(surface["elemental_glyphs"].is_array());
    assert!(surface["dominant_chakra"].is_string());
    assert!(surface["sun_decan_ruling_planet"].is_string());
    assert!(surface["matheme_harmonic_profile"].is_object());
}

#[test]
fn canon_coord_supports_pretty_and_default_json_pipeline() {
    let env = TestEnv::empty();
    let json_output = run_epi(&["canon", "coord"], &env);
    assert!(
        json_output.status.success(),
        "stderr: {}",
        json_output.stderr
    );
    serde_json::from_str::<serde_json::Value>(&json_output.stdout)
        .expect("default coord output should pipe into jq");

    let pretty_output = run_epi(&["canon", "coord", "P1-137-M0", "--pretty"], &env);
    assert!(
        pretty_output.status.success(),
        "stderr: {}",
        pretty_output.stderr
    );
    assert!(
        pretty_output.stdout.lines().count() > 1,
        "--pretty should emit multi-line human-readable JSON"
    );
}
