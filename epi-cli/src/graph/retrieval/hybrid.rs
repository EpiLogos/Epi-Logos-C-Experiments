use std::cmp::Ordering;
use std::collections::HashMap;

use crate::graph::client::Neo4jClient;

/// Which retrieval strategy to use.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RetrievalMode {
    VectorOnly,
    GraphOnly,
    HybridRrf,
    HybridWeighted,
}

/// A single scored result from any retrieval pipeline.
#[derive(Debug, Clone)]
pub struct RetrievalResult {
    pub coordinate: String,
    pub score: f64,
    pub source: String,
    pub data: serde_json::Value,
}

/// Hybrid retriever that fuses vector and graph results using RRF or weighted
/// scoring.
pub struct HybridRetriever<'a> {
    #[allow(dead_code)]
    client: &'a Neo4jClient,
    k: u32,
    coordinate_boost: f64,
}

impl<'a> HybridRetriever<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self {
            client,
            k: 60,
            coordinate_boost: 1.5,
        }
    }

    pub fn with_params(client: &'a Neo4jClient, k: u32, boost: f64) -> Self {
        Self {
            client,
            k,
            coordinate_boost: boost,
        }
    }

    // -----------------------------------------------------------------------
    // Reciprocal Rank Fusion
    // -----------------------------------------------------------------------

    /// RRF formula: score(d) = SUM(1 / (k + rank(d)))
    ///
    /// Graph results receive `coordinate_boost` multiplier so that
    /// structurally-relevant nodes rank higher than pure-vector matches.
    pub fn fusion_rrf(
        &self,
        vector_results: &[RetrievalResult],
        graph_results: &[RetrievalResult],
    ) -> Vec<RetrievalResult> {
        let mut scores: HashMap<String, f64> = HashMap::new();
        let mut data_map: HashMap<String, serde_json::Value> = HashMap::new();

        for (rank, r) in vector_results.iter().enumerate() {
            let rrf = 1.0 / (self.k as f64 + rank as f64 + 1.0);
            *scores.entry(r.coordinate.clone()).or_default() += rrf;
            data_map
                .entry(r.coordinate.clone())
                .or_insert_with(|| r.data.clone());
        }

        for (rank, r) in graph_results.iter().enumerate() {
            let rrf = 1.0 / (self.k as f64 + rank as f64 + 1.0);
            *scores.entry(r.coordinate.clone()).or_default() +=
                rrf * self.coordinate_boost;
            data_map
                .entry(r.coordinate.clone())
                .or_insert_with(|| r.data.clone());
        }

        let mut results: Vec<RetrievalResult> = scores
            .into_iter()
            .map(|(coord, score)| {
                let data = data_map.remove(&coord).unwrap_or_default();
                RetrievalResult {
                    coordinate: coord,
                    score,
                    source: "hybrid-rrf".into(),
                    data,
                }
            })
            .collect();

        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(Ordering::Equal));
        results
    }

    // -----------------------------------------------------------------------
    // Weighted Fusion
    // -----------------------------------------------------------------------

    /// Weighted fusion: score(d) = alpha * vector_score + (1-alpha) * graph_score * boost
    pub fn fusion_weighted(
        &self,
        vector_results: &[RetrievalResult],
        graph_results: &[RetrievalResult],
        alpha: f64,
    ) -> Vec<RetrievalResult> {
        let mut scores: HashMap<String, (f64, serde_json::Value)> = HashMap::new();

        for r in vector_results {
            let entry = scores
                .entry(r.coordinate.clone())
                .or_insert((0.0, r.data.clone()));
            entry.0 += alpha * r.score;
        }
        for r in graph_results {
            let entry = scores
                .entry(r.coordinate.clone())
                .or_insert((0.0, r.data.clone()));
            entry.0 += (1.0 - alpha) * r.score * self.coordinate_boost;
        }

        let mut results: Vec<RetrievalResult> = scores
            .into_iter()
            .map(|(coord, (score, data))| RetrievalResult {
                coordinate: coord,
                score,
                source: "hybrid-weighted".into(),
                data,
            })
            .collect();
        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(Ordering::Equal));
        results
    }
}

// ===========================================================================
// Unit tests — pure functions, no DB required
// ===========================================================================
#[cfg(test)]
mod tests {
    use super::*;
    use crate::graph::client::{Neo4jClient, Neo4jConfig};

    /// Helper: create a dummy Neo4jClient (connect is sync so it just builds
    /// a driver handle; tests that only call pure methods never hit the wire).
    fn dummy_client() -> Neo4jClient {
        let config = Neo4jConfig {
            uri: "bolt://localhost:7687".into(),
            user: "neo4j".into(),
            password: "".into(),
        };
        // This may fail in CI without Neo4j — wrap in a fallback.
        Neo4jClient::connect(&config).expect(
            "dummy client failed — Neo4j driver creation should not need a live server",
        )
    }

    fn make_result(coord: &str, score: f64, source: &str) -> RetrievalResult {
        RetrievalResult {
            coordinate: coord.into(),
            score,
            source: source.into(),
            data: serde_json::json!({"coord": coord}),
        }
    }

    // -----------------------------------------------------------------------
    // RRF tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_fusion_rrf_basic_ranking() {
        let client = dummy_client();
        let retriever = HybridRetriever::new(&client);

        let vector = vec![
            make_result("P3", 0.9, "vector"),
            make_result("M4", 0.7, "vector"),
        ];
        let graph = vec![
            make_result("M4", 0.0, "graph"),
            make_result("C0", 0.0, "graph"),
        ];

        let fused = retriever.fusion_rrf(&vector, &graph);

        // M4 appears in both lists => highest combined score
        assert_eq!(fused[0].coordinate, "M4");
        assert!(fused[0].score > fused[1].score);
        assert_eq!(fused.len(), 3); // P3, M4, C0
    }

    #[test]
    fn test_fusion_rrf_empty_inputs() {
        let client = dummy_client();
        let retriever = HybridRetriever::new(&client);
        let fused = retriever.fusion_rrf(&[], &[]);
        assert!(fused.is_empty());
    }

    #[test]
    fn test_fusion_rrf_vector_only() {
        let client = dummy_client();
        let retriever = HybridRetriever::new(&client);

        let vector = vec![
            make_result("P3", 0.9, "vector"),
            make_result("M4", 0.7, "vector"),
        ];
        let fused = retriever.fusion_rrf(&vector, &[]);
        assert_eq!(fused.len(), 2);
        // rank-0 gets higher RRF score
        assert!(fused[0].score >= fused[1].score);
    }

    #[test]
    fn test_fusion_rrf_graph_boost_effect() {
        let client = dummy_client();
        let retriever = HybridRetriever::with_params(&client, 60, 2.0);

        let vector = vec![make_result("P3", 0.9, "vector")];
        let graph = vec![make_result("C0", 0.0, "graph")];

        let fused = retriever.fusion_rrf(&vector, &graph);
        assert_eq!(fused.len(), 2);
        // With boost=2.0, graph result at rank 0 should outscore vector rank 0
        // graph rrf = 1/(60+1) * 2.0, vector rrf = 1/(60+1)
        assert_eq!(fused[0].coordinate, "C0");
    }

    // -----------------------------------------------------------------------
    // Weighted fusion tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_fusion_weighted_basic() {
        let client = dummy_client();
        let retriever = HybridRetriever::new(&client);

        let vector = vec![make_result("P3", 0.9, "vector")];
        let graph = vec![make_result("M4", 0.8, "graph")];

        let fused = retriever.fusion_weighted(&vector, &graph, 0.5);
        assert_eq!(fused.len(), 2);
        // P3 score: 0.5 * 0.9 = 0.45
        // M4 score: 0.5 * 0.8 * 1.5 = 0.6
        let m4 = fused.iter().find(|r| r.coordinate == "M4").unwrap();
        let p3 = fused.iter().find(|r| r.coordinate == "P3").unwrap();
        assert!(m4.score > p3.score);
    }

    #[test]
    fn test_fusion_weighted_alpha_extremes() {
        let client = dummy_client();
        let retriever = HybridRetriever::new(&client);

        let vector = vec![make_result("P3", 0.9, "vector")];
        let graph = vec![make_result("P3", 0.8, "graph")];

        // alpha=1.0 => only vector
        let fused = retriever.fusion_weighted(&vector, &graph, 1.0);
        let score = fused[0].score;
        assert!((score - 0.9).abs() < 1e-9);

        // alpha=0.0 => only graph (with boost)
        let fused = retriever.fusion_weighted(&vector, &graph, 0.0);
        let score = fused[0].score;
        assert!((score - 0.8 * 1.5).abs() < 1e-9);
    }

    #[test]
    fn test_fusion_weighted_empty() {
        let client = dummy_client();
        let retriever = HybridRetriever::new(&client);
        let fused = retriever.fusion_weighted(&[], &[], 0.5);
        assert!(fused.is_empty());
    }

    #[test]
    fn test_fusion_weighted_overlap() {
        let client = dummy_client();
        let retriever = HybridRetriever::new(&client);

        let vector = vec![
            make_result("P3", 0.9, "vector"),
            make_result("M4", 0.5, "vector"),
        ];
        let graph = vec![
            make_result("P3", 0.7, "graph"),
            make_result("C0", 0.6, "graph"),
        ];

        let fused = retriever.fusion_weighted(&vector, &graph, 0.5);
        assert_eq!(fused.len(), 3); // P3, M4, C0

        // P3 score: 0.5*0.9 + 0.5*0.7*1.5 = 0.45 + 0.525 = 0.975
        let p3 = fused.iter().find(|r| r.coordinate == "P3").unwrap();
        assert!((p3.score - 0.975).abs() < 1e-9);
    }
}
