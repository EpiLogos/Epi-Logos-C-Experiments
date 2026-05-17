use serde_json::{json, Value};

use crate::graph::client::{Neo4jClient, Neo4jConfig};
use crate::graph::{
    GraphMethodParams, GraphMethodService, GraphNodeRequest, GraphQueryRequest,
    GraphTraverseDirection, GraphTraverseRequest, HybridFusionConfig, RetrievalResult,
};

pub async fn dispatch_graph_method(method: &str, params: &Value) -> Result<Value, String> {
    if method == "s2'.coordinate.resolve" {
        let coordinate = required_string(params, "coordinate")?;
        let resolution = GraphMethodService::resolve_coordinate_string(&coordinate)?;
        return serde_json::to_value(resolution).map_err(|err| err.to_string());
    }

    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).map_err(|err| format!("connect failed: {err}"))?;
    let service = GraphMethodService::new(&client);

    match method {
        "s2.graph.query" => {
            let cypher = required_string(params, "cypher")?;
            let query_params = params.get("params").cloned().unwrap_or_else(|| json!({}));
            service
                .query(GraphQueryRequest {
                    cypher,
                    params: GraphMethodParams::from_json(query_params)?,
                })
                .await
        }
        "s2.graph.node" => {
            let coordinate = required_string(params, "coordinate")?;
            service.node(GraphNodeRequest { coordinate }).await
        }
        "s2.graph.traverse" => {
            let from = required_string(params, "from")?;
            let edge_types = params
                .get("edgeTypes")
                .and_then(|value| value.as_array())
                .map(|items| {
                    items
                        .iter()
                        .filter_map(|item| item.as_str().map(str::to_owned))
                        .collect::<Vec<_>>()
                })
                .unwrap_or_default();
            let direction = match params
                .get("direction")
                .and_then(|value| value.as_str())
                .unwrap_or("both")
            {
                "outbound" => GraphTraverseDirection::Outbound,
                "inbound" => GraphTraverseDirection::Inbound,
                _ => GraphTraverseDirection::Both,
            };
            let depth = params
                .get("depth")
                .and_then(|value| value.as_u64())
                .unwrap_or(1) as u32;
            service
                .traverse(GraphTraverseRequest {
                    from,
                    edge_types,
                    direction,
                    depth,
                })
                .await
        }
        "s2'.retrieve" => {
            let query = required_string(params, "query")?;
            let depth = params
                .get("depth")
                .and_then(|value| value.as_u64())
                .map(|value| value as u32);
            crate::graph::retrieval::graphrag::GraphRAGRetriever::new(&client)
                .retrieve(&query, depth, Some(10))
                .await
        }
        "s2'.rerank" => {
            let vector_results = parse_results(params, "vectorResults")?;
            let graph_results = parse_results(params, "graphResults")?;
            let results = crate::graph::fusion_rrf_results(
                &vector_results,
                &graph_results,
                HybridFusionConfig::default(),
            );
            Ok(json!({ "results": results }))
        }
        "s2'.enrich" => {
            let coordinates = params
                .get("coordinates")
                .and_then(|value| value.as_array())
                .ok_or_else(|| "coordinates must be an array".to_string())?
                .iter()
                .map(|value| {
                    value
                        .as_str()
                        .map(str::to_owned)
                        .ok_or_else(|| "coordinates must contain strings".to_string())
                })
                .collect::<Result<Vec<_>, _>>()?;
            let level = params
                .get("level")
                .and_then(|value| value.as_str())
                .and_then(|value| match value {
                    "uuid" => Some(crate::graph::retrieval::graphrag::DisclosureLevel::UuidOnly),
                    "identity" => {
                        Some(crate::graph::retrieval::graphrag::DisclosureLevel::Identity)
                    }
                    "summary" => Some(crate::graph::retrieval::graphrag::DisclosureLevel::Summary),
                    "content" => Some(crate::graph::retrieval::graphrag::DisclosureLevel::Content),
                    "connected" => {
                        Some(crate::graph::retrieval::graphrag::DisclosureLevel::Connected)
                    }
                    "complete" => {
                        Some(crate::graph::retrieval::graphrag::DisclosureLevel::Complete)
                    }
                    _ => None,
                })
                .unwrap_or(crate::graph::retrieval::graphrag::DisclosureLevel::Summary);
            let refs = coordinates.iter().map(String::as_str).collect::<Vec<_>>();
            let results = crate::graph::retrieval::graphrag::GraphRAGRetriever::new(&client)
                .progressive_disclosure_batch(&refs, level)
                .await?;
            Ok(json!({ "results": results }))
        }
        _ => Err(format!("unsupported graph method: {method}")),
    }
}

fn required_string(params: &Value, key: &str) -> Result<String, String> {
    params
        .get(key)
        .and_then(|value| value.as_str())
        .map(str::to_owned)
        .ok_or_else(|| format!("{key} must be a string"))
}

fn parse_results(params: &Value, key: &str) -> Result<Vec<RetrievalResult>, String> {
    match params.get(key) {
        Some(value) => serde_json::from_value(value.clone())
            .map_err(|err| format!("{key} must be RetrievalResult[]: {err}")),
        None => Ok(Vec::new()),
    }
}
