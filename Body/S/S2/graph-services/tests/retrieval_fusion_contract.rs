use epi_s2_graph_services::{
    fusion_rrf_results, fusion_weighted_results, tokenize_query, HybridFusionConfig,
    RetrievalResult,
};

fn result(coordinate: &str, score: f64, source: &str) -> RetrievalResult {
    RetrievalResult {
        coordinate: coordinate.to_owned(),
        score,
        source: source.to_owned(),
        data: serde_json::json!({ "coordinate": coordinate }),
    }
}

#[test]
fn tokenization_preserves_coordinates_and_discards_retrieval_fillers() {
    let tokens = tokenize_query("How does #4 work with M4' and the context pattern?");

    assert_eq!(tokens, vec!["#4", "m4'", "context", "pattern"]);
}

#[test]
fn rrf_fusion_prioritizes_coordinates_present_in_both_retrieval_streams() {
    let vector = vec![result("P3", 0.9, "vector"), result("M4", 0.7, "vector")];
    let graph = vec![result("M4", 0.0, "graph"), result("C0", 0.0, "graph")];

    let fused = fusion_rrf_results(&vector, &graph, HybridFusionConfig::default());

    assert_eq!(fused[0].coordinate, "M4");
    assert_eq!(fused.len(), 3);
    assert!(fused[0].score > fused[1].score);
}

#[test]
fn rrf_fusion_applies_coordinate_boost_to_structural_graph_hits() {
    let vector = vec![result("P3", 0.9, "vector")];
    let graph = vec![result("C0", 0.0, "graph")];

    let fused = fusion_rrf_results(
        &vector,
        &graph,
        HybridFusionConfig {
            rrf_k: 60,
            coordinate_boost: 2.0,
        },
    );

    assert_eq!(fused[0].coordinate, "C0");
}

#[test]
fn weighted_fusion_combines_vector_and_graph_scores_with_configured_boost() {
    let vector = vec![result("P3", 0.8, "vector"), result("M4", 0.4, "vector")];
    let graph = vec![result("M4", 1.0, "graph"), result("C0", 0.5, "graph")];

    let fused = fusion_weighted_results(&vector, &graph, 0.5, HybridFusionConfig::default());

    assert_eq!(fused[0].coordinate, "M4");
    assert_eq!(fused[0].source, "hybrid-weighted");
    assert_eq!(fused.len(), 3);
}
