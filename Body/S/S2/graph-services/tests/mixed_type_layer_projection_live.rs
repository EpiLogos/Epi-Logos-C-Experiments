//! `c_4_layer` is mixed-type in the live graph BY DECISION (2026-07-25): it is a
//! controlled node-kind vocabulary (`COORDINATE`, `PSYCHOID`, `VAK`, …) on 1956
//! nodes, while the 84 `:Coordinate:Stack` nodes written by the S/S' lattice
//! migration carry the S-layer index `0`-`5`. The integer is a second semantic,
//! not a bad cast, so the data stays mixed and READERS must tolerate both.
//!
//! `bimba_node_row` did not: `row.get::<String>("layer").unwrap_or_default()`
//! returned `Err` for the integers and silently yielded `""`, so every S-stack
//! coordinate served an empty layer through `s2.graph.node`. This pins both
//! branches against the real corpus. No graph mutation occurs.

use epi_s2_graph_services::{GraphMethodService, GraphNodeRequest, Neo4jClient, Neo4jConfig};

async fn layer_of(service: &GraphMethodService<'_>, coordinate: &str) -> String {
    let payload = service
        .node(GraphNodeRequest {
            coordinate: coordinate.into(),
        })
        .await
        .unwrap_or_else(|err| panic!("s2.graph.node failed for {coordinate}: {err}"));
    payload
        .get("node")
        .and_then(|node| node.get("layer"))
        .and_then(|layer| layer.as_str())
        .unwrap_or_else(|| panic!("{coordinate} returned no string layer field"))
        .to_owned()
}

#[tokio::test]
#[ignore] // requires the local Neo4j corpus: `epi graph doctor` must report graph.ok=true
async fn live_mixed_type_layer_survives_both_branches() {
    let client = Neo4jClient::connect(&Neo4jConfig::from_env()).expect("connect to live Neo4j");
    let service = GraphMethodService::new(&client);

    // INTEGER branch — an S-stack coordinate. Before the fix this was "".
    let stack_layer = layer_of(&service, "S3").await;
    assert_eq!(
        stack_layer, "3",
        "an S-stack node carries c_4_layer as the INTEGER S-layer index and must \
         render as its decimal string, never as an empty string"
    );

    // STRING branch — a family coordinate keeps its kind tag unchanged.
    let coordinate_layer = layer_of(&service, "M3").await;
    assert_eq!(
        coordinate_layer, "COORDINATE",
        "a family coordinate must still project its c_4_layer kind tag verbatim"
    );
}
