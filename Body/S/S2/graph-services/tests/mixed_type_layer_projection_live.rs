//! `c_4_layer` is mixed-type in the live graph: it is a node-kind vocabulary
//! (`PSYCHOID`, `VAK`, `WEAVE`, `CONTEXT_FRAME`, `FAMILY_META`, `LENS`,
//! `FAMILY_ROOT`) on the scaffold nodes, while the `:Coordinate:Stack` nodes
//! written by the S/S' lattice migration carry the S-layer index `0`-`5` as an
//! INTEGER. The integer is a second semantic, not a bad cast, so READERS must
//! tolerate both.
//!
//! AMENDED 2026-07-28: the vocabulary no longer includes `COORDINATE`. That
//! value was written onto every ordinary coordinate — 1,940 of 1,978 nodes —
//! and said nothing: "COORDINATE" on a node in the coordinate graph is a
//! tautology, and it landed on nodes labelled Hexagram, Maqam, DivineName,
//! Degree/ClockPosition, Codon and GenerationEvent, none of which are
//! coordinates. The labels already carry the typology. An ordinary coordinate
//! now has NO `c_4_layer`, and the seeder and dataset importer no longer write
//! one. The property is kept only where it discriminates.
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

    // STRING branch — a node whose kind genuinely discriminates keeps its tag.
    let weave_layer = layer_of(&service, "Weave_5_5").await;
    assert_eq!(
        weave_layer, "WEAVE",
        "a scaffold node whose kind discriminates must still project its \
         c_4_layer tag verbatim"
    );

    // ABSENT branch — an ordinary coordinate carries no kind tag at all, and
    // the projector must render that as empty rather than failing.
    let ordinary = layer_of(&service, "M3").await;
    assert_eq!(
        ordinary, "",
        "an ordinary coordinate has no c_4_layer: 'COORDINATE' was a tautology \
         stamped on 1,940 nodes and was removed"
    );
}
