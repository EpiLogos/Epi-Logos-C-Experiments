//! Graph-live coverage for the `epi canon coord` depth ladder (Track 09,
//! Tranche 9.13).
//!
//! GRAPH-TRUTH LAW: every rung reads the LIVE Neo4j `:Bimba` graph through the
//! S2 seam (`Neo4jConfig::from_env` / `Neo4jClient`). These tests exercise the
//! real `epi` binary against the running local graph and assert on the q_
//! registers the graph genuinely carries. They carry NO `#[ignore]`: if Neo4j
//! is down the command exits non-zero and they fail loudly rather than passing
//! on a synthetic fallback — that silent fallback is the exact defect this
//! surface eliminates. The bimba-mcp `spec_retrieve` wire contract shells this
//! same command, so its parity suite is green iff this command resolves.

mod common;

use common::{run_epi, TestEnv};

/// The parity coordinates the bimba-mcp `canon_parity` suite drives.
const PARITY_COORDS: &[&str] = &["S0", "S3", "M4-3", "M5", "P5'", "cpf"];
const DEPTHS: &[&str] = &["pithy", "qv-detail", "relational"];

fn run_json(args: &[&str]) -> serde_json::Value {
    let env = TestEnv::empty();
    let output = run_epi(args, &env);
    assert!(
        output.status.success(),
        "`epi {}` failed (is local Neo4j up? EPILOGOS_NEO4J_URI/USER/PASSWORD):\nstdout:\n{}\n\nstderr:\n{}",
        args.join(" "),
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

fn registers(value: &serde_json::Value) -> Vec<(u64, String, String)> {
    value["registers"]
        .as_array()
        .expect("registers array")
        .iter()
        .map(|reg| {
            (
                reg["position"].as_u64().expect("register position"),
                reg["phase"].as_str().unwrap_or_default().to_string(),
                reg["key"].as_str().unwrap_or_default().to_string(),
            )
        })
        .collect()
}

#[test]
fn every_parity_coord_and_depth_resolves_graph_live() {
    // Mirrors the bimba-mcp canon_parity matrix: 6 coords × 3 depths must each
    // resolve against the live graph and emit `--json`. `graph_available:true`
    // proves the read hit Neo4j (an absent node stays `node_present:false` but
    // still resolves — only Neo4j being DOWN makes the command exit non-zero).
    for coord in PARITY_COORDS {
        for depth in DEPTHS {
            let json = run_json(&["canon", "coord", coord, "--depth", depth, "--json"]);
            assert_eq!(
                json["graph_available"], true,
                "{coord}@{depth} must read the live graph, got {json}"
            );
            assert_eq!(json["depth"], *depth, "{coord}@{depth} depth echoed");
            assert!(
                json["content"].is_string(),
                "{coord}@{depth} must emit a content string"
            );
            assert!(
                json["registers"].is_array(),
                "{coord}@{depth} must emit a registers array"
            );
        }
    }
}

#[test]
fn pithy_carries_definition_and_integration_registers_from_live_node() {
    let json = run_json(&["canon", "coord", "S3", "--depth", "pithy", "--json"]);

    assert_eq!(json["graph_available"], true);
    assert_eq!(json["node_present"], true, "S3 is a live :Bimba node");
    assert_eq!(json["depth"], "pithy");

    let regs = registers(&json);
    assert!(!regs.is_empty(), "S3 pithy must surface live q_ registers");
    // pithy is the definition (q_1) + integration (q_5) archetypes only.
    assert!(
        regs.iter().all(|(pos, _, _)| *pos == 1 || *pos == 5),
        "pithy must only carry positions 1 and 5, got {regs:?}"
    );
    // canonical pithy order is q_5 then q_1 — the first register is position 5.
    assert_eq!(regs[0].0, 5, "pithy must lead with the q_5 integration register");
    // the live S3 q_5 prose (control-plane closure) must reach content.
    let content = json["content"].as_str().unwrap_or_default().to_lowercase();
    assert!(
        content.contains("control plane") || content.contains("shared state"),
        "S3 pithy content must carry live q_ prose, got: {}",
        json["content"]
    );
    assert!(
        json["token_estimate"].as_u64().unwrap_or(0) > 0,
        "pithy must report a token estimate"
    );
}

#[test]
fn qv_detail_is_a_superset_of_pithy_and_orders_all_registers() {
    let pithy = run_json(&["canon", "coord", "S3", "--depth", "pithy", "--json"]);
    let qv = run_json(&["canon", "coord", "S3", "--depth", "qv-detail", "--json"]);

    let pithy_keys: Vec<String> = registers(&pithy).into_iter().map(|(_, _, k)| k).collect();
    let qv_regs = registers(&qv);
    let qv_keys: Vec<String> = qv_regs.iter().map(|(_, _, k)| k.clone()).collect();

    // qv-detail carries every pithy register plus more (positions beyond 1/5).
    for key in &pithy_keys {
        assert!(
            qv_keys.contains(key),
            "qv-detail must be a superset of pithy; missing {key}"
        );
    }
    assert!(
        qv_regs.len() > pithy_keys.len(),
        "qv-detail must carry more registers than pithy ({} vs {})",
        qv_regs.len(),
        pithy_keys.len()
    );
    assert!(
        qv_regs.iter().any(|(pos, _, _)| *pos != 1 && *pos != 5),
        "qv-detail must include registers outside positions 1/5, got {qv_regs:?}"
    );
    // concatenation contract: positions are non-decreasing.
    let positions: Vec<u64> = qv_regs.iter().map(|(pos, _, _)| *pos).collect();
    assert!(
        positions.windows(2).all(|pair| pair[0] <= pair[1]),
        "qv-detail registers must be ordered by ascending position, got {positions:?}"
    );
    // qv-detail content is at least as long as pithy content (superset).
    let pithy_len = pithy["content"].as_str().unwrap_or_default().len();
    let qv_len = qv["content"].as_str().unwrap_or_default().len();
    assert!(
        qv_len >= pithy_len,
        "qv-detail content ({qv_len}) must be >= pithy content ({pithy_len})"
    );
    // provenance surface is present (may be empty when the node carries no qm_).
    assert!(qv["provenance"].is_array(), "qv-detail must expose provenance");
}

#[test]
fn relational_adds_locality_signature_and_one_hop_neighbours() {
    let pithy = run_json(&["canon", "coord", "S3", "--depth", "pithy", "--json"]);
    let rel = run_json(&["canon", "coord", "S3", "--depth", "relational", "--json"]);

    assert_eq!(rel["depth"], "relational");
    // locality = the node's q_4 register(s).
    let locality = rel["locality"].as_array().expect("locality array");
    assert!(
        locality
            .iter()
            .all(|reg| reg["position"].as_u64() == Some(4)),
        "locality must be the q_4 signature, got {locality:?}"
    );
    assert!(
        !locality.is_empty(),
        "S3 carries a q_4 locality register, so relational must surface it"
    );

    // neighbours = one-hop adjacent :Bimba nodes with a pithy excerpt + edges.
    let neighbours = rel["neighbours"].as_array().expect("neighbours array");
    assert!(
        !neighbours.is_empty(),
        "S3 has graph edges, so relational must surface one-hop neighbours"
    );
    assert!(
        neighbours.iter().all(|n| n["coordinate"].is_string()
            && n["relations"].is_array()
            && n["excerpt"].is_string()),
        "each neighbour must carry coordinate + relations + excerpt"
    );

    // relational content is richer than pithy (adds locality + neighbourhood).
    let pithy_len = pithy["content"].as_str().unwrap_or_default().len();
    let rel_len = rel["content"].as_str().unwrap_or_default().len();
    assert!(
        rel_len > pithy_len,
        "relational content ({rel_len}) must exceed pithy content ({pithy_len})"
    );
}

#[test]
fn absent_node_resolves_graph_live_without_synthetic_fallback() {
    // `cpf` has no :Bimba node. A reachable graph must still resolve it as an
    // empty packet (graph_available:true, node_present:false) — NOT invent one.
    let json = run_json(&["canon", "coord", "cpf", "--depth", "pithy", "--json"]);
    assert_eq!(json["graph_available"], true);
    assert_eq!(json["node_present"], false);
    assert_eq!(json["registers"].as_array().map(Vec::len), Some(0));
    assert_eq!(json["content"], "");
}

#[test]
fn canon_coord_supports_pretty_and_default_json_pipeline() {
    let env = TestEnv::empty();

    let json_output = run_epi(&["canon", "coord", "S3"], &env);
    assert!(
        json_output.status.success(),
        "stderr: {}",
        json_output.stderr
    );
    serde_json::from_str::<serde_json::Value>(&json_output.stdout)
        .expect("default coord output should pipe into jq");

    let pretty_output = run_epi(&["canon", "coord", "S3", "--pretty"], &env);
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
