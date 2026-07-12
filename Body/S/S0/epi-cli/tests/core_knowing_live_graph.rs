//! Live-graph coverage for `epi core knowing`.
//!
//! ARCHITECT LAW (knowing-surface re-orient, 2026-07-12): the knowing surface
//! reads node name/essence/coreNature/children from the LIVE Neo4j `:Bimba`
//! graph through the same S2 seam the rest of the CLI uses — never from static
//! dataset files. These tests exercise the real `epi` binary against the running
//! local graph and assert on properties the graph genuinely carries. They carry
//! NO `#[ignore]`: if Neo4j is down (or serving different data), they fail loudly
//! rather than passing on a file fallback — that silent fallback is exactly the
//! defect this work removed.

mod common;

use common::{run_epi, TestEnv};

/// Parse stdout as JSON, failing with the full command output on error.
fn parse_json(output: &common::TestOutput) -> serde_json::Value {
    assert!(
        output.status.success(),
        "`epi core knowing` failed (is the local Neo4j up? EPILOGOS_NEO4J_URI/USER/PASSWORD):\nstdout:\n{}\n\nstderr:\n{}",
        output.stdout,
        output.stderr
    );
    serde_json::from_str(&output.stdout)
        .unwrap_or_else(|err| panic!("knowing should emit valid json: {err}\nstdout:\n{}", output.stdout))
}

#[test]
fn knowing_m2_3_surfaces_live_bimba_node() {
    let env = TestEnv::empty();
    let output = run_epi(&["--json", "core", "knowing", "M2-3"], &env);
    let json = parse_json(&output);

    // If Neo4j were unreachable the surface reports HONEST-ABSENT rather than a
    // file fallback — so `graph_available:true` proves we read the live graph.
    assert_eq!(
        json["graph_available"], true,
        "expected live graph read; got graph_status={:?}\nstdout:\n{}",
        json["graph_status"], output.stdout
    );

    // c_1_name — only obtainable from the live node (was "(graph unavailable)"
    // / "(unknown)" if the read failed).
    assert_eq!(
        json["name"], "Decans System",
        "M2-3 c_1_name must come from the live graph, got {:?}",
        json["name"]
    );

    // c_0_essence and c_0_core_nature — live node prose.
    let essence = json["essence"].as_str().unwrap_or_default().to_lowercase();
    assert!(
        essence.contains("zodiac"),
        "M2-3 essence should carry live c_0_essence, got: {:?}",
        json["essence"]
    );
    let core_nature = json["coreNature"]
        .as_str()
        .unwrap_or_default()
        .to_lowercase();
    assert!(
        core_nature.contains("decan"),
        "M2-3 coreNature should carry live c_0_core_nature, got: {:?}",
        json["coreNature"]
    );

    // Node-specific live q_ register — the controller confirmed M2-3 carries
    // q_3_four_three_three_two_nesting. `q` serialises as [key, value] pairs.
    let q_pairs = json["q"]
        .as_array()
        .expect("live M2-3 node should expose a `q` quaternal surface");
    assert!(
        q_pairs
            .iter()
            .filter_map(|pair| pair.as_array())
            .any(|pair| pair.first().and_then(|k| k.as_str())
                == Some("q_3_four_three_three_two_nesting")),
        "M2-3 must surface live q_3_four_three_three_two_nesting, got keys: {:?}",
        q_pairs
            .iter()
            .filter_map(|p| p.as_array().and_then(|a| a.first()).and_then(|k| k.as_str()))
            .collect::<Vec<_>>()
    );

    // Direct children read live by coordinate prefix (Fire..Quintessence).
    let children = json["children"]
        .as_array()
        .expect("M2-3 should surface live direct children");
    let child_coords: Vec<&str> = children
        .iter()
        .filter_map(|c| c["coord"].as_str())
        .collect();
    for expected in ["M2-3-1", "M2-3-2", "M2-3-3", "M2-3-4"] {
        assert!(
            child_coords.contains(&expected),
            "expected live child {expected}, got {child_coords:?}"
        );
    }
    let fire = children
        .iter()
        .find(|c| c["coord"].as_str() == Some("M2-3-1"))
        .expect("M2-3-1 present");
    assert!(
        fire["name"]
            .as_str()
            .unwrap_or_default()
            .to_lowercase()
            .contains("fire"),
        "M2-3-1 live name should be the Fire element decans, got {:?}",
        fire["name"]
    );
}

#[test]
fn knowing_hash_root_surfaces_live_description() {
    let env = TestEnv::empty();
    let output = run_epi(&["--json", "core", "knowing", "#"], &env);
    let json = parse_json(&output);

    assert_eq!(
        json["graph_available"], true,
        "expected live graph read for `#`; got graph_status={:?}",
        json["graph_status"]
    );
    // c_1_description of the live `#` node (Kashmir-Shaivite Svatantrya prose)
    // — proves the root portal reads the graph, not nodes_hash.json.
    let description = json["description"]
        .as_str()
        .expect("live `#` node should carry c_1_description")
        .to_lowercase();
    assert!(
        description.contains("svatantrya") || description.contains("non-dual"),
        "`#` description should be the live c_1_description, got: {:?}",
        json["description"]
    );
}
