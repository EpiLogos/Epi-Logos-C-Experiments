mod common;

use common::{run_epi, TestEnv};

#[test]
fn canon_search_returns_ranked_coordinate_tokens() {
    let env = TestEnv::empty();
    let output = run_epi(&["canon", "search", "personal resonance coordinate"], &env);
    assert!(
        output.status.success(),
        "command failed:\nstdout:\n{}\n\nstderr:\n{}",
        output.stdout,
        output.stderr
    );

    let json: serde_json::Value =
        serde_json::from_str(&output.stdout).expect("search output should be json");
    let results = json["results"].as_array().expect("ranked results array");
    assert!(!results.is_empty(), "semantic search should return results");
    assert_eq!(results[0]["coordinate"], "P1-137-M0");
    assert!(results[0]["rank"].as_u64().unwrap() >= 1);
    assert!(results[0]["score"].as_f64().unwrap() > 0.0);
    assert!(results
        .windows(2)
        .all(|pair| pair[0]["score"].as_f64().unwrap() >= pair[1]["score"].as_f64().unwrap()));
}
