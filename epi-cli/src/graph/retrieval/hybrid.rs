use crate::graph::types::GraphResult;

pub struct HybridRetriever {
    top_k: usize,
}

impl HybridRetriever {
    pub fn new(top_k: usize) -> Self {
        Self { top_k }
    }

    pub fn retrieve(&self, query: &str) -> GraphResult {
        GraphResult {
            query: Some(format!("Hybrid: {} (top_k: {})", query, self.top_k)),
            error: Some("Hybrid retrieval requires Neo4j + embedding service".to_string()),
            ..Default::default()
        }
    }
}
