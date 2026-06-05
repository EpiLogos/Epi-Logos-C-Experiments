use crate::{
    fusion_rrf_results, fusion_weighted_results, infer_positions, tokenize_query,
    CoordinateSearchScope, HybridFusionConfig,
};
use neo4rs::query;

use crate::meta;
use crate::Neo4jClient;
use crate::{EmbeddingConfig, GeminiEmbeddingClient};
pub use crate::{RetrievalMode, RetrievalResult};
use crate::{SemanticCacheClient, SemanticCacheConfig, SemanticCacheMatchStrategy};

/// Hybrid retriever that fuses vector and graph results using RRF or weighted
/// scoring.
pub struct HybridRetriever<'a> {
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

    pub async fn retrieve(
        &self,
        query_text: &str,
        mode: RetrievalMode,
        top_k: Option<usize>,
    ) -> Result<Vec<RetrievalResult>, String> {
        let top_k = top_k.unwrap_or(10).clamp(1, 50);

        if let Some(cache) = self.semantic_cache().await? {
            let attributes = self.cache_attributes(mode, top_k).await?;
            if let Some(cached) = cache
                .search(
                    query_text,
                    attributes.clone(),
                    vec![
                        SemanticCacheMatchStrategy::Exact,
                        SemanticCacheMatchStrategy::Semantic,
                    ],
                )
                .await?
            {
                if let Some(response) = cached.response.as_deref() {
                    if let Ok(results) = serde_json::from_str::<Vec<RetrievalResult>>(response) {
                        return Ok(results);
                    }
                }
            }

            let results = self.retrieve_uncached(query_text, mode, top_k).await?;
            cache
                .store(
                    query_text,
                    &serde_json::to_string(&results).map_err(|e| e.to_string())?,
                    attributes,
                )
                .await?;
            return Ok(results);
        }

        self.retrieve_uncached(query_text, mode, top_k).await
    }

    async fn retrieve_uncached(
        &self,
        query_text: &str,
        mode: RetrievalMode,
        top_k: usize,
    ) -> Result<Vec<RetrievalResult>, String> {
        match mode {
            RetrievalMode::GraphOnly => self.graph_search(query_text, top_k).await,
            RetrievalMode::VectorOnly => self.vector_search(query_text, top_k).await,
            RetrievalMode::HybridRrf => {
                let graph_results = self.graph_search(query_text, top_k).await?;
                let vector_results = self.vector_search_optional(query_text, top_k).await?;
                if vector_results.is_empty() {
                    return Ok(graph_results);
                }
                Ok(self.fusion_rrf(&vector_results, &graph_results))
            }
            RetrievalMode::HybridWeighted => {
                let graph_results = self.graph_search(query_text, top_k).await?;
                let vector_results = self.vector_search_optional(query_text, top_k).await?;
                if vector_results.is_empty() {
                    return Ok(graph_results);
                }
                Ok(self.fusion_weighted(&vector_results, &graph_results, 0.5))
            }
        }
    }

    async fn semantic_cache(&self) -> Result<Option<SemanticCacheClient>, String> {
        Ok(SemanticCacheConfig::from_env_optional()?.map(SemanticCacheClient::new))
    }

    async fn cache_attributes(
        &self,
        mode: RetrievalMode,
        top_k: usize,
    ) -> Result<std::collections::BTreeMap<String, String>, String> {
        let meta = meta::read_graph_meta(self.client).await?;
        let mut attributes = std::collections::BTreeMap::new();
        attributes.insert("mode".into(), mode.as_str().into());
        attributes.insert("top_k".into(), top_k.to_string());
        attributes.insert(
            "graph_revision".into(),
            meta.as_ref()
                .map(|item| item.graph_revision.to_string())
                .unwrap_or_else(|| "0".into()),
        );
        attributes.insert(
            "embedding_version".into(),
            meta.as_ref()
                .map(|item| item.embedding_version.clone())
                .unwrap_or_else(|| meta::EMBEDDING_VERSION.into()),
        );
        attributes.insert(
            "q_schema_version".into(),
            meta.as_ref()
                .map(|item| item.q_schema_version.clone())
                .unwrap_or_else(|| meta::Q_SCHEMA_VERSION.into()),
        );
        Ok(attributes)
    }

    async fn graph_search(
        &self,
        query_text: &str,
        top_k: usize,
    ) -> Result<Vec<RetrievalResult>, String> {
        let tokens = tokenize_query(query_text);
        let position_hints: Vec<i64> = infer_positions(query_text)
            .into_iter()
            .map(i64::from)
            .collect();
        let lower_query = query_text.trim().to_lowercase();
        let scope = CoordinateSearchScope::from_query_text(query_text);
        let scope_predicate = graph_search_scope_predicate("n", &scope);

        // NOTE: This legacy Cypher still reads `c_4_*` / `c_1_*` properties from the
        // Bimba graph. Canonical VAK bias keys (`cf`, `cp`, `ct`, `cs_direction`) are
        // emitted by `vak_bias_weights` below — do not conflate the two vocabularies.
        let cypher = format!(
            "MATCH (n:Bimba)
             WHERE {scope_predicate}
             WITH n,
                  size([token IN $tokens WHERE token <> '' AND toLower(n.coordinate) CONTAINS token]) AS coord_hits,
                  size([token IN $tokens WHERE token <> '' AND toLower(coalesce(n.c_1_name, '')) CONTAINS token]) AS name_hits,
                  size([token IN $tokens WHERE token <> '' AND toLower(coalesce(n.c_4_family, '')) CONTAINS token]) AS family_hits,
                  size([token IN $tokens WHERE token <> '' AND toLower(toString(coalesce(n.c_4_layer, ''))) CONTAINS token]) AS layer_hits,
                  size([token IN $tokens WHERE token <> '' AND toLower(coalesce(n.c_0_essence, '')) CONTAINS token]) AS essence_hits,
                  size([token IN $tokens WHERE token <> '' AND toLower(coalesce(n.c_1_description, '')) CONTAINS token]) AS desc_hits,
                  CASE
                      WHEN $raw_query = '' THEN 0
                      WHEN toLower(n.coordinate) = $raw_query THEN 12
                      WHEN toLower(coalesce(n.c_1_name, '')) = $raw_query THEN 10
                      ELSE 0
                  END AS exact_hits
             WITH n,
                  (coord_hits * 8 + name_hits * 6 + family_hits * 3 + layer_hits * 2 +
                   essence_hits * 3 + desc_hits * 2 + exact_hits +
                   CASE
                       WHEN size($positions) = 0 THEN 0
                       WHEN n.c_4_ql_position IN $positions THEN 2
                       ELSE 0
                   END) AS score
             WHERE score > 0
             RETURN n.coordinate AS coordinate,
                    n.c_2_uuid AS uuid,
                    n.c_1_name AS name,
                    n.c_4_family AS family,
                    n.c_4_layer AS layer,
                    n.c_4_ql_position AS ql_position,
                    score AS score
             ORDER BY score DESC, coordinate ASC
             LIMIT $top_k"
        );
        let q = query(&cypher)
        .param("tokens", tokens.clone())
        .param("positions", position_hints)
        .param("raw_query", lower_query)
        .param("scope_id", scope.scope_id())
        .param("scope_prefixes", scope.prefixes().to_vec())
        .param("top_k", top_k as i64);

        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("graph retrieval error: {}", e))?;

        Ok(rows
            .iter()
            .map(|row| RetrievalResult {
                coordinate: row.get("coordinate").unwrap_or_default(),
                score: read_score(row, "score"),
                source: "graph".into(),
                data: serde_json::json!({
                    "coordinate": row.get::<String>("coordinate").unwrap_or_default(),
                    "uuid": row.get::<String>("uuid").unwrap_or_default(),
                    "name": row.get::<String>("name").unwrap_or_default(),
                    "family": row.get::<String>("family").unwrap_or_default(),
                    "layer": row.get::<String>("layer").unwrap_or_default(),
                    "ql_position": row.get::<i64>("ql_position").unwrap_or(-1),
                }),
            })
            .collect())
    }

    async fn vector_search_optional(
        &self,
        query_text: &str,
        top_k: usize,
    ) -> Result<Vec<RetrievalResult>, String> {
        match EmbeddingConfig::from_env() {
            Ok(config) => {
                let client = GeminiEmbeddingClient::new(config);
                self.vector_search_with_client(query_text, top_k, &client)
                    .await
            }
            Err(_) => Ok(Vec::new()),
        }
    }

    async fn vector_search(
        &self,
        query_text: &str,
        top_k: usize,
    ) -> Result<Vec<RetrievalResult>, String> {
        let config = EmbeddingConfig::from_env()?;
        let client = GeminiEmbeddingClient::new(config);
        self.vector_search_with_client(query_text, top_k, &client)
            .await
    }

    async fn vector_search_with_client(
        &self,
        query_text: &str,
        top_k: usize,
        embedder: &GeminiEmbeddingClient,
    ) -> Result<Vec<RetrievalResult>, String> {
        let embedding = embedder.embed(query_text).await?;
        let embedding: Vec<f64> = embedding.into_iter().map(f64::from).collect();
        let q = query(
            "CALL db.index.vector.queryNodes('coord_embedding', $top_k, $embedding)
             YIELD node, score
             RETURN node.coordinate AS coordinate,
                    node.c_2_uuid AS uuid,
                    node.c_1_name AS name,
                    node.c_4_family AS family,
                    node.c_4_layer AS layer,
                    node.c_4_ql_position AS ql_position,
                    score AS score
             ORDER BY score DESC",
        )
        .param("top_k", top_k as i64)
        .param("embedding", embedding);

        let rows = match self.client.run_query(q).await {
            Ok(rows) => rows,
            Err(err) => {
                return Err(format!("vector retrieval error: {}", err));
            }
        };

        Ok(rows
            .iter()
            .map(|row| RetrievalResult {
                coordinate: row.get("coordinate").unwrap_or_default(),
                score: read_score(row, "score"),
                source: "vector".into(),
                data: serde_json::json!({
                    "coordinate": row.get::<String>("coordinate").unwrap_or_default(),
                    "uuid": row.get::<String>("uuid").unwrap_or_default(),
                    "name": row.get::<String>("name").unwrap_or_default(),
                    "family": row.get::<String>("family").unwrap_or_default(),
                    "layer": row.get::<String>("layer").unwrap_or_default(),
                    "ql_position": row.get::<i64>("ql_position").unwrap_or(-1),
                }),
            })
            .collect())
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
        fusion_rrf_results(vector_results, graph_results, self.fusion_config())
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
        fusion_weighted_results(vector_results, graph_results, alpha, self.fusion_config())
    }

    fn fusion_config(&self) -> HybridFusionConfig {
        HybridFusionConfig {
            rrf_k: self.k,
            coordinate_boost: self.coordinate_boost,
        }
    }

    /// Compute VAK-aware bias weights for graph retrieval.
    ///
    /// Returns a HashMap keyed by canonical VAK property names (`cf`, `cp`,
    /// `ct`, `cs_direction`) with positive f64 weights, plus sentinel entries
    /// `__cf_value:<value>` / `__cp_value:<value>` carrying the target
    /// coordinate values for matching by the downstream Cypher generator /
    /// scorer (so the caller does not need to re-thread `VakAddress` through
    /// every layer).
    ///
    /// **Dialogical mode** (CPF = `(00/00)`) returns an empty map — open
    /// conversation has no canonical VAK to bias toward; retrieval falls back
    /// to vector + symbol scoring only.
    ///
    /// **Mechanistic mode** (CPF = `(4.0/1-4.4/5)`) returns:
    /// - `cf: 0.8` — strongest signal; frame-binding affinity (agent's CF
    ///   must align with retrieved chunk's CF)
    /// - `cp: 0.5` — positional bias (CP-aligned chunks rank higher)
    /// - `ct: 0.4` — content-type bias
    /// - `cs_direction: 0.2` — Day/Night' synthesis-vs-analysis bias
    ///
    /// Canonical-prefix keys (`cf`, `cp`, `ct`, `cs_direction`) align with
    /// the B1 PromotionPlan / A4 Graphiti / A3 Hen vocabulary — no `c_4_*`
    /// drift.
    pub fn vak_bias_weights(
        vak: &portal_core::VakAddress,
    ) -> std::collections::HashMap<String, f64> {
        let mut w = std::collections::HashMap::new();
        if matches!(vak.cpf, portal_core::CpfState::Dialogical) {
            return w;
        }
        w.insert("cf".into(), 0.8);
        w.insert("cp".into(), 0.5);
        w.insert("ct".into(), 0.4);
        w.insert("cs_direction".into(), 0.2);
        // Sentinel match values for the scorer — `__<key>_value:<canonical>`
        // entries carry the target VAK coordinate values so downstream Cypher /
        // scoring code does not need to re-thread `VakAddress` through every
        // layer.
        w.insert(format!("__cf_value:{}", vak.cf), 1.0);
        w.insert(format!("__cp_value:{}", vak.cp), 1.0);
        let cs_direction_literal = serde_json::to_value(&vak.cs.direction)
            .expect("CsDirection serialization is infallible (fieldless enum)")
            .as_str()
            .expect("CsDirection serializes to JSON string")
            .to_string();
        w.insert(
            format!("__cs_direction_value:{}", cs_direction_literal),
            1.0,
        );
        w
    }
}

fn graph_search_scope_predicate(alias: &str, scope: &CoordinateSearchScope) -> String {
    match scope {
        CoordinateSearchScope::BimbaMap => "true".to_owned(),
        CoordinateSearchScope::PratibimbaExpression => {
            format!(
                "({alias}.coordinate = \"M'\" OR ({alias}.coordinate STARTS WITH 'M' AND {alias}.coordinate CONTAINS \"'\"))"
            )
        }
        CoordinateSearchScope::TechnicalStack => {
            format!("{alias}.coordinate STARTS WITH 'S'")
        }
        CoordinateSearchScope::ExplicitPrefixes(_) => {
            format!(
                "any(prefix IN $scope_prefixes WHERE {alias}.coordinate = prefix OR {alias}.coordinate STARTS WITH prefix)"
            )
        }
    }
}

fn read_score(row: &neo4rs::Row, key: &str) -> f64 {
    row.get::<f64>(key)
        .unwrap_or_else(|_| row.get::<i64>(key).unwrap_or(0) as f64)
}

// ===========================================================================
// Unit tests — pure functions, no DB required
// ===========================================================================
#[cfg(test)]
mod tests {
    use super::*;
    use crate::{CoordinateSearchScope, Neo4jClient, Neo4jConfig};

    /// Helper: create a dummy Neo4jClient (connect is sync so it just builds
    /// a driver handle; tests that only call pure methods never hit the wire).
    fn dummy_client() -> Neo4jClient {
        let config = Neo4jConfig {
            uri: "bolt://localhost:7687".into(),
            user: "neo4j".into(),
            password: "".into(),
        };
        // This may fail in CI without Neo4j — wrap in a fallback.
        Neo4jClient::connect(&config)
            .expect("dummy client failed — Neo4j driver creation should not need a live server")
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

    #[test]
    fn graph_search_scope_predicate_bounds_coordinate_families() {
        let technical = graph_search_scope_predicate("n", &CoordinateSearchScope::TechnicalStack);
        assert!(technical.contains("n.coordinate STARTS WITH 'S'"));
        assert!(!technical.contains("STARTS WITH 'M'"));

        let pratibimba =
            graph_search_scope_predicate("n", &CoordinateSearchScope::PratibimbaExpression);
        assert!(pratibimba.contains("n.coordinate STARTS WITH 'M'"));
        assert!(pratibimba.contains("n.coordinate CONTAINS"));
        assert!(!pratibimba.contains("n.coordinate = 'M5-4'"));

        let bimba = graph_search_scope_predicate("n", &CoordinateSearchScope::BimbaMap);
        assert_eq!(bimba, "true");
    }
}
