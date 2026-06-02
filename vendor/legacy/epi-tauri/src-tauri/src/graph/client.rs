use crate::error::AppError;
use super::{GraphData, GraphEdge, GraphNode, GraphWalkResult, WalkKind};

pub struct Neo4jClient {
    graph: neo4rs::Graph,
}

impl Neo4jClient {
    pub async fn new(url: &str, user: &str, password: &str) -> Result<Self, AppError> {
        let graph = neo4rs::Graph::new(url, user, password)
            .await
            .map_err(|e| AppError::Graph(format!("neo4j connect: {e}")))?;
        Ok(Self { graph })
    }

    pub async fn get_full_graph(&self) -> Result<GraphData, AppError> {
        let mut nodes = Vec::new();
        let mut edges = Vec::new();

        let mut result = self
            .graph
            .execute(neo4rs::query("MATCH (n) RETURN n LIMIT 500"))
            .await
            .map_err(|e| AppError::Graph(e.to_string()))?;

        while let Ok(Some(row)) = result.next().await {
            if let Ok(node) = row.get::<neo4rs::Node>("n") {
                nodes.push(node_to_graph_node(&node));
            }
        }

        let mut result = self
            .graph
            .execute(neo4rs::query(
                "MATCH (a)-[r]->(b) RETURN elementId(a) AS src, elementId(b) AS tgt, type(r) AS t, elementId(r) AS rid LIMIT 1000",
            ))
            .await
            .map_err(|e| AppError::Graph(e.to_string()))?;

        while let Ok(Some(row)) = result.next().await {
            let src = row.get::<String>("src").unwrap_or_default();
            let tgt = row.get::<String>("tgt").unwrap_or_default();
            let t = row.get::<String>("t").unwrap_or_default();
            let rid = row.get::<String>("rid").unwrap_or_default();
            edges.push(GraphEdge {
                id: rid,
                source: src,
                target: tgt,
                rel_type: t,
                properties: serde_json::Value::Object(serde_json::Map::new()),
            });
        }

        Ok(GraphData { nodes, edges })
    }

    pub async fn get_node_by_id(&self, id: &str) -> Result<Option<GraphNode>, AppError> {
        let mut result = self
            .graph
            .execute(neo4rs::query("MATCH (n) WHERE elementId(n) = $id RETURN n").param("id", id))
            .await
            .map_err(|e| AppError::Graph(e.to_string()))?;

        if let Ok(Some(row)) = result.next().await {
            if let Ok(node) = row.get::<neo4rs::Node>("n") {
                return Ok(Some(node_to_graph_node(&node)));
            }
        }
        Ok(None)
    }

    pub async fn get_by_coordinate(&self, coord: &str) -> Result<Option<GraphNode>, AppError> {
        let mut result = self
            .graph
            .execute(
                neo4rs::query(
                    "MATCH (n) WHERE n.coordinate = $coord OR n.bimba_coordinate = $coord RETURN n LIMIT 1",
                )
                .param("coord", coord),
            )
            .await
            .map_err(|e| AppError::Graph(e.to_string()))?;

        if let Ok(Some(row)) = result.next().await {
            if let Ok(node) = row.get::<neo4rs::Node>("n") {
                return Ok(Some(node_to_graph_node(&node)));
            }
        }
        Ok(None)
    }

    pub async fn walk(
        &self,
        start: &str,
        kind: &WalkKind,
        depth: u32,
    ) -> Result<GraphWalkResult, AppError> {
        let rel_filter = match kind {
            WalkKind::Topological => "contains|member_of|sibling|parent",
            WalkKind::Semantic => "MAPS_TO_COORDINATE|RESONATES_WITH|EXPRESSED_IN|VIEWED_THROUGH",
            WalkKind::Temporal => "NEXT|PREVIOUS|TEMPORAL",
        };

        let cypher = format!(
            "MATCH path = (start)-[r:{}*1..{}]->(end) \
             WHERE start.coordinate = $coord \
             UNWIND nodes(path) AS n \
             UNWIND relationships(path) AS rel \
             RETURN DISTINCT n, rel",
            rel_filter, depth
        );

        let mut result = self
            .graph
            .execute(neo4rs::query(&cypher).param("coord", start))
            .await
            .map_err(|e| AppError::Graph(e.to_string()))?;

        let mut nodes = Vec::new();
        let edges = Vec::new();
        let mut seen_nodes = std::collections::HashSet::new();

        while let Ok(Some(row)) = result.next().await {
            if let Ok(node) = row.get::<neo4rs::Node>("n") {
                let gn = node_to_graph_node(&node);
                if seen_nodes.insert(gn.id.clone()) {
                    nodes.push(gn);
                }
            }
        }

        Ok(GraphWalkResult {
            nodes,
            edges,
            depth_reached: depth,
        })
    }

    pub async fn query_raw(
        &self,
        cypher: &str,
        params: Option<serde_json::Value>,
    ) -> Result<serde_json::Value, AppError> {
        let mut q = neo4rs::query(cypher);
        if let Some(serde_json::Value::Object(map)) = params {
            for (k, v) in map {
                match v {
                    serde_json::Value::String(s) => q = q.param(&k, s),
                    serde_json::Value::Number(n) => {
                        if let Some(i) = n.as_i64() {
                            q = q.param(&k, i);
                        } else if let Some(f) = n.as_f64() {
                            q = q.param(&k, f);
                        }
                    }
                    serde_json::Value::Bool(b) => q = q.param(&k, b),
                    _ => {}
                }
            }
        }

        let mut result = self
            .graph
            .execute(q)
            .await
            .map_err(|e| AppError::Graph(e.to_string()))?;

        let mut rows = Vec::new();
        while let Ok(Some(row)) = result.next().await {
            if let Ok(node) = row.get::<neo4rs::Node>("n") {
                rows.push(serde_json::json!({
                    "id": node.id().to_string(),
                    "labels": node.labels(),
                }));
            }
        }

        Ok(serde_json::Value::Array(rows))
    }
}

fn node_to_graph_node(node: &neo4rs::Node) -> GraphNode {
    let id = node.id().to_string();
    let labels: Vec<String> = node.labels().iter().map(|s| s.to_string()).collect();
    let coordinate = node.get::<String>("coordinate").ok();

    let mut props = serde_json::Map::new();
    if let Ok(coord) = node.get::<String>("coordinate") {
        props.insert("coordinate".into(), serde_json::Value::String(coord));
    }
    if let Ok(name) = node.get::<String>("c_1_name") {
        props.insert("c_1_name".into(), serde_json::Value::String(name));
    }
    if let Ok(family) = node.get::<String>("c_4_family") {
        props.insert("c_4_family".into(), serde_json::Value::String(family));
    }

    GraphNode {
        id,
        labels,
        properties: serde_json::Value::Object(props),
        coordinate,
    }
}
