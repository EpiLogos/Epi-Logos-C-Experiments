//! Coordinate: S0/S2 -> M0' residual-browser live contract
//! Residency: Body/S/S0/epi-cli/tests
//! Position (#n): S2 graph-list adapter proof for M0-0'
//! Actualises: the real gateway adapter reading the live Neo4j M0 content set,
//! subtracting the compiled C ARCHETYPE_COORDINATE_LUT, and returning stable
//! 20-row branch pages plus the root M0 row.
//! Public surface: fail-loud live integration tests for s2.graph.list.
//! Does NOT own: the M0 dataset, LUT slot identities, or renderer behavior.

use std::collections::BTreeSet;

use epi_logos::gate::graph::dispatch_graph_method;
use epi_logos::graph::client::{Neo4jClient, Neo4jConfig};
use serde_json::{json, Value};

fn live_client() -> Neo4jClient {
    Neo4jClient::connect(&Neo4jConfig::from_env()).expect(
        "live Neo4j required: s2.graph.list must prove the current M0 graph, not a seed file",
    )
}

fn entries(artifact: &Value) -> &[Value] {
    artifact["entries"]
        .as_array()
        .expect("s2.graph.list entries array")
}

#[tokio::test]
async fn s2_graph_list_proves_live_108_minus_compiled_12_equals_96() {
    let client = live_client();
    let count_rows = client
        .run(
            "MATCH (n:Bimba) \
             WHERE n.coordinate = 'M0' OR n.coordinate STARTS WITH 'M0-' \
             RETURN count(n) AS total",
        )
        .await
        .expect("independent live M0 count");
    let independent_total = count_rows[0]
        .get::<i64>("total")
        .expect("independent total");
    assert_eq!(
        independent_total, 108,
        "live M0 content set must remain 108"
    );

    let compiled_exclusions: BTreeSet<String> = epi_lib::m0_verifier::archetype_coordinate_lut()
        .into_iter()
        .collect();
    assert_eq!(compiled_exclusions.len(), 12);

    let mut branch_total = 0i64;
    for branch in ["#0-0", "#0-1", "#0-2", "#0-3", "#0-4", "#0-5"] {
        let artifact = dispatch_graph_method(
            "s2.graph.list",
            &json!({ "coordinatePrefix": branch, "offset": 0, "limit": 20 }),
        )
        .await
        .expect("live residual branch dispatch");

        assert_eq!(artifact["datasetTotal"], 108);
        assert_eq!(artifact["residualTotal"], 96);
        assert_eq!(artifact["state"], "canonical");
        assert_eq!(artifact["rootEntry"]["coordinate"], "M0");
        branch_total += artifact["total"].as_i64().expect("branch total");
        for entry in entries(&artifact) {
            let coordinate = entry["coordinate"].as_str().expect("entry coordinate");
            assert!(
                !compiled_exclusions.contains(coordinate),
                "{coordinate} is kernel-lifted and must not enter the residual page"
            );
        }
    }
    assert_eq!(
        branch_total, 95,
        "six descendants plus the explicit M0 root must cover all 96 residual rows"
    );
}

#[tokio::test]
async fn s2_graph_list_second_page_is_stable_and_non_overlapping() {
    let first = dispatch_graph_method(
        "s2.graph.list",
        &json!({ "coordinatePrefix": "#0-3", "offset": 0, "limit": 20 }),
    )
    .await
    .expect("first live page");
    let second = dispatch_graph_method(
        "s2.graph.list",
        &json!({ "coordinatePrefix": "#0-3", "offset": 20, "limit": 20 }),
    )
    .await
    .expect("second live page");

    let first_coordinates = entries(&first)
        .iter()
        .map(|entry| entry["coordinate"].as_str().unwrap().to_owned())
        .collect::<Vec<_>>();
    let second_coordinates = entries(&second)
        .iter()
        .map(|entry| entry["coordinate"].as_str().unwrap().to_owned())
        .collect::<Vec<_>>();
    assert_eq!(first_coordinates.len(), 20);
    assert!(!second_coordinates.is_empty());
    assert!(
        first_coordinates.windows(2).all(|pair| pair[0] < pair[1]),
        "first page must be coordinate ordered"
    );
    assert!(
        second_coordinates.windows(2).all(|pair| pair[0] < pair[1]),
        "second page must be coordinate ordered"
    );
    assert!(
        first_coordinates
            .iter()
            .all(|coordinate| !second_coordinates.contains(coordinate)),
        "pages must not overlap"
    );
}
