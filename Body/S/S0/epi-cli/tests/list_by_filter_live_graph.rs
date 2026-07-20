//! Live-graph receipt for `s2.graph.list_by_filter` (Track 48 §13.E — the
//! BasesView coordinate-keyed data-layer gateway method).
//!
//! REQUIRES a running local Neo4j (`Neo4jConfig::from_env` →
//! `EPILOGOS_NEO4J_URI/USER/PASSWORD`). These tests FAIL LOUDLY — they never
//! silently skip — when the graph is down: Track 48 is a graph-live (G-class)
//! track, so a green run must actually prove the CLI → gate::graph →
//! graph-services → live Neo4j seam. The harness G-stage owns environment
//! gating; here we assert the live seam.
//!
//! Real behavioural test: the adapter rows are cross-checked against an
//! INDEPENDENT coordinate-scoped read through the same `Neo4jClient` seam. A
//! fabricated or file-served row set could not match the live graph's actual
//! coordinates and ordering.

use epi_logos::gate::graph::dispatch_graph_method;
use epi_logos::graph::client::{Neo4jClient, Neo4jConfig};
use serde_json::json;

/// Independent coordinate list through the live `Neo4jClient` seam, mirroring
/// the builder's `MATCH (n:Bimba) … ORDER BY coordinate ASC LIMIT` shape.
/// `scope_literal` / `limit` are test-owned literals (no external input), so the
/// direct interpolation here carries no injection surface — the production
/// builder binds through `$scope` / `$limit`.
async fn independent_coordinates(scope_literal: &str, limit: i64) -> Option<Vec<String>> {
    let client = Neo4jClient::connect(&Neo4jConfig::from_env()).ok()?;
    let cypher = format!(
        "MATCH (n:Bimba) WHERE n.coordinate STARTS WITH '{scope_literal}' \
         RETURN n.coordinate AS coordinate ORDER BY n.coordinate ASC LIMIT {limit}"
    );
    let rows = client.run(&cypher).await.ok()?;
    Some(
        rows.iter()
            .filter_map(|row| row.get::<String>("coordinate").ok())
            .collect(),
    )
}

#[tokio::test]
async fn s2_graph_list_by_filter_rows_come_from_live_neo4j() {
    let result = dispatch_graph_method(
        "s2.graph.list_by_filter",
        &json!({ "coordinateScope": "M2", "propertyFilters": [], "limit": 5 }),
    )
    .await
    .expect("s2.graph.list_by_filter must dispatch through gate::graph");

    let rows = result["rows"]
        .as_array()
        .expect("list_by_filter must return a { rows: [...] } array");

    // Independent read through the same live seam — fail LOUDLY if the graph is
    // down, rather than passing on an empty adapter result.
    let expected = independent_coordinates("M2", 5).await.expect(
        "live Neo4j required: an independent :Bimba coordinate read must succeed \
         (EPILOGOS_NEO4J_URI/USER/PASSWORD). The G-stage owns environment gating.",
    );
    assert!(
        !expected.is_empty(),
        "the live graph must carry :Bimba nodes under coordinate scope 'M2'"
    );

    // Every adapter row is coordinate-keyed and within the requested scope.
    let adapter_coords: Vec<&str> = rows
        .iter()
        .map(|row| {
            row["coordinate"]
                .as_str()
                .expect("each base-view row carries a coordinate")
        })
        .collect();
    for coord in &adapter_coords {
        assert!(
            coord.starts_with("M2"),
            "row coordinate {coord} must fall within the requested scope 'M2'"
        );
    }

    // The adapter reads the SAME live nodes in the SAME order as the independent
    // read — a fabricated / file-served row set could not match.
    assert_eq!(
        adapter_coords,
        expected.iter().map(String::as_str).collect::<Vec<_>>(),
        "list_by_filter rows must equal an independent live-graph coordinate read"
    );
}

#[tokio::test]
async fn s2_graph_list_by_filter_property_predicate_discriminates_live_rows() {
    // Every M2 :Bimba node sits at QL position 2. A matching predicate returns
    // rows; a non-matching predicate returns none — proving the predicate binds
    // and executes against the live graph, not a fabricated pass-through.
    let matching = dispatch_graph_method(
        "s2.graph.list_by_filter",
        &json!({
            "coordinateScope": "M2",
            "propertyFilters": [{ "property": "c_4_ql_position", "op": "eq", "value": 2 }],
            "limit": 5
        }),
    )
    .await
    .expect("s2.graph.list_by_filter must dispatch");
    let matching_rows = matching["rows"]
        .as_array()
        .expect("list_by_filter must return a { rows: [...] } array");
    assert!(
        !matching_rows.is_empty(),
        "live: M2 :Bimba nodes at QL position 2 must match the predicate"
    );
    for row in matching_rows {
        assert_eq!(
            row["c_4_ql_position"],
            json!(2),
            "the c_4_ql_position==2 predicate must hold on every returned row"
        );
    }

    let non_matching = dispatch_graph_method(
        "s2.graph.list_by_filter",
        &json!({
            "coordinateScope": "M2",
            "propertyFilters": [{ "property": "c_4_ql_position", "op": "eq", "value": 5 }],
            "limit": 5
        }),
    )
    .await
    .expect("s2.graph.list_by_filter must dispatch");
    assert!(
        non_matching["rows"]
            .as_array()
            .expect("list_by_filter must return a { rows: [...] } array")
            .is_empty(),
        "live: no M2 :Bimba node sits at QL position 5 — the predicate must return zero rows"
    );
}
