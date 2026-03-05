use crate::graph::types::GraphResult;

pub struct GraphRAGRetriever {
    max_depth: usize,
}

impl GraphRAGRetriever {
    pub fn new(max_depth: usize) -> Self {
        Self { max_depth }
    }

    pub fn retrieve(&self, query: &str) -> GraphResult {
        GraphResult {
            query: Some(format!("GraphRAG: {} (depth: {})", query, self.max_depth)),
            error: Some("GraphRAG requires active Neo4j connection".to_string()),
            ..Default::default()
        }
    }
}
