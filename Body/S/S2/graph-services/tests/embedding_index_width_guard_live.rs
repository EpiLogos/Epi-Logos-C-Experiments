//! The embedding-width guard against the REAL vector index.
//!
//! The unit tests in `src/embeddings.rs` pin the decision; this pins the half
//! that cannot be faked — that the guard learns the width from the graph itself
//! rather than from a constant. Nothing here names 3072: every assertion is
//! relative to whatever `SHOW VECTOR INDEXES` reports, which is the only way a
//! test can still be correct after the index moves (it already did once — see
//! `Body/S/S5/epi-gnostic/scripts/migrate_bimba_embeddings.py`, which migrated
//! `coord_embedding` from 768 to 3072).
//!
//! Read-only. `SHOW VECTOR INDEXES` is a system command with no write clause.

use epi_s2_graph_services::{
    check_write_width, live_index_width, IndexWidthSource, Neo4jClient, Neo4jConfig, EMBED_DIMS_ENV,
};

#[tokio::test]
#[ignore = "requires the live Neo4j at EPILOGOS_NEO4J_URI with the coord_embedding vector index: \
            source .env.graph-dev, then `cargo test --test embedding_index_width_guard_live -- --ignored`"]
async fn guard_reads_the_live_index_width_and_gates_writes_against_it() {
    let client = Neo4jClient::connect(&Neo4jConfig::from_env()).expect("connect to live Neo4j");
    let width = live_index_width(&client)
        .await
        .expect("read coord_embedding width from the live graph");

    assert_eq!(
        width.source,
        IndexWidthSource::LiveIndex,
        "the index must exist in this graph; a PendingSchemaDdl answer means the test proved \
         nothing about the live index"
    );
    assert_eq!(width.index, "coord_embedding");
    assert!(
        width.dimensions > 0,
        "live index reported width {}",
        width.dimensions
    );
    eprintln!(
        "live vector index `{}` reports {} dimensions",
        width.index, width.dimensions
    );

    // Matching width writes.
    check_write_width(width.dimensions, Some(EMBED_DIMS_ENV), width)
        .expect("the width the index itself reports must be accepted");

    // Every OTHER supported matryoshka width is refused, naming both numbers.
    let others: Vec<usize> = gemini_embedding::SUPPORTED_MATRYOSHKA_DIMS
        .into_iter()
        .filter(|candidate| *candidate != width.dimensions)
        .collect();
    assert!(
        !others.is_empty(),
        "expected at least one supported width that differs from the live index"
    );
    for candidate in others {
        let refusal = check_write_width(candidate, Some(EMBED_DIMS_ENV), width).expect_err(
            "a supported width that disagrees with the live index must be refused, not written",
        );
        assert!(refusal.contains(&candidate.to_string()), "{refusal}");
        assert!(refusal.contains(&width.dimensions.to_string()), "{refusal}");
        assert!(refusal.contains("coord_embedding"), "{refusal}");
        assert!(refusal.contains(EMBED_DIMS_ENV), "{refusal}");
        eprintln!("refused {candidate}: {refusal}");
    }
}
