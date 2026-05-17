use std::collections::BTreeMap;

use neo4rs::{query, Query};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::{CoordinateArrayParser, Neo4jClient};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum GraphParamValue {
    String(String),
    Integer(i64),
    Float(f64),
    Boolean(bool),
    StringList(Vec<String>),
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct GraphMethodParams {
    values: BTreeMap<String, GraphParamValue>,
}

impl GraphMethodParams {
    pub fn from_json(value: Value) -> Result<Self, String> {
        let object = value
            .as_object()
            .ok_or_else(|| "graph method params must be a JSON object".to_string())?;
        let mut values = BTreeMap::new();
        for (key, value) in object {
            let parsed = match value {
                Value::String(value) => GraphParamValue::String(value.clone()),
                Value::Number(value) if value.is_i64() => {
                    GraphParamValue::Integer(value.as_i64().unwrap())
                }
                Value::Number(value) if value.is_f64() => {
                    GraphParamValue::Float(value.as_f64().unwrap())
                }
                Value::Bool(value) => GraphParamValue::Boolean(*value),
                Value::Array(items) => GraphParamValue::StringList(
                    items
                        .iter()
                        .map(|item| {
                            item.as_str().map(str::to_owned).ok_or_else(|| {
                                format!("param '{key}' only supports string arrays")
                            })
                        })
                        .collect::<Result<Vec<_>, _>>()?,
                ),
                _ => {
                    return Err(format!(
                        "param '{key}' has unsupported graph parameter value"
                    ))
                }
            };
            values.insert(key.clone(), parsed);
        }
        Ok(Self { values })
    }

    pub fn get_string(&self, key: &str) -> Option<&str> {
        match self.values.get(key) {
            Some(GraphParamValue::String(value)) => Some(value),
            _ => None,
        }
    }

    fn apply_to_query(&self, mut q: Query) -> Query {
        for (key, value) in &self.values {
            q = match value {
                GraphParamValue::String(value) => q.param(key, value.clone()),
                GraphParamValue::Integer(value) => q.param(key, *value),
                GraphParamValue::Float(value) => q.param(key, *value),
                GraphParamValue::Boolean(value) => q.param(key, *value),
                GraphParamValue::StringList(value) => q.param(key, value.clone()),
            };
        }
        q
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GraphQueryRequest {
    pub cypher: String,
    pub params: GraphMethodParams,
}

impl GraphQueryRequest {
    pub fn validate(&self) -> Result<(), String> {
        let trimmed = self.cypher.trim();
        if !trimmed.to_ascii_uppercase().starts_with("MATCH")
            && !trimmed.to_ascii_uppercase().starts_with("CALL")
            && !trimmed.to_ascii_uppercase().starts_with("RETURN")
        {
            return Err("s2.graph.query currently permits read-only Cypher".into());
        }
        if trimmed.contains('{') && !trimmed.contains('$') {
            return Err("s2.graph.query must be parameterized for dynamic values".into());
        }
        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GraphNodeRequest {
    pub coordinate: String,
}

impl GraphNodeRequest {
    pub fn validate(&self) -> Result<String, String> {
        GraphMethodService::resolve_coordinate_string(&self.coordinate).map(|resolved| resolved.canonical)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum GraphTraverseDirection {
    Outbound,
    Inbound,
    Both,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GraphTraverseRequest {
    pub from: String,
    pub edge_types: Vec<String>,
    pub direction: GraphTraverseDirection,
    pub depth: u32,
}

impl GraphTraverseRequest {
    pub fn bounded_depth(&self) -> u32 {
        self.depth.clamp(1, 4)
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CoordinateResolution {
    pub input: String,
    pub canonical: String,
    pub compatibility_property: Option<String>,
}

pub struct GraphMethodService<'a> {
    client: &'a Neo4jClient,
}

impl<'a> GraphMethodService<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self { client }
    }

    pub fn resolve_coordinate_string(input: &str) -> Result<CoordinateResolution, String> {
        let trimmed = input.trim();
        let parsed = CoordinateArrayParser::parse_one(trimmed)?;
        let canonical = if trimmed == "#" {
            "M".to_string()
        } else if trimmed.starts_with('#') && trimmed.len() == 2 {
            format!("M{}", parsed.ql_position.unwrap_or_default())
        } else {
            parsed.coordinate
        };
        let compatibility_property = if trimmed.starts_with('#') {
            Some("bimbaCoordinate".to_string())
        } else {
            None
        };
        Ok(CoordinateResolution {
            input: trimmed.to_string(),
            canonical,
            compatibility_property,
        })
    }

    pub async fn query(&self, request: GraphQueryRequest) -> Result<Value, String> {
        request.validate()?;
        let rows = self
            .client
            .run_query(request.params.apply_to_query(query(&request.cypher)))
            .await
            .map_err(|err| format!("s2.graph.query failed: {err}"))?;
        Ok(json!({
            "rowCount": rows.len(),
            "rows": rows.iter().map(known_row_json).collect::<Vec<_>>(),
        }))
    }

    pub async fn node(&self, request: GraphNodeRequest) -> Result<Value, String> {
        let resolved = Self::resolve_coordinate_string(&request.coordinate)?;
        let q = query(
            "MATCH (n:Bimba)
             WHERE n.coordinate = $canonical OR n.bimbaCoordinate = $input
             OPTIONAL MATCH (n)-[r]-(m:Bimba)
             RETURN n.coordinate AS coordinate,
                    n.uuid AS uuid,
                    n.name AS name,
                    n.family AS family,
                    n.layer AS layer,
                    n.ql_position AS ql_position,
                    collect(DISTINCT {
                      type: type(r),
                      direction: CASE WHEN startNode(r) = n THEN 'outbound' ELSE 'inbound' END,
                      coordinate: m.coordinate
                    }) AS relations",
        )
        .param("canonical", resolved.canonical.clone())
        .param("input", resolved.input.clone());
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|err| format!("s2.graph.node failed: {err}"))?;
        let Some(row) = rows.first() else {
            return Ok(json!({
                "node": Value::Null,
                "relations": [],
                "resolution": resolved,
            }));
        };
        Ok(json!({
            "node": known_row_json(row),
            "relations": row.get::<Vec<BTreeMap<String, String>>>("relations").unwrap_or_default(),
            "resolution": resolved,
        }))
    }

    pub async fn traverse(&self, request: GraphTraverseRequest) -> Result<Value, String> {
        let resolved = Self::resolve_coordinate_string(&request.from)?;
        let depth = request.bounded_depth();
        let relation_filter = if request.edge_types.is_empty() {
            String::new()
        } else {
            "WHERE all(rel IN relationships(path) WHERE type(rel) IN $edge_types)".to_string()
        };
        let pattern = match request.direction {
            GraphTraverseDirection::Outbound => format!("(start)-[*1..{depth}]->(target:Bimba)"),
            GraphTraverseDirection::Inbound => format!("(start)<-[*1..{depth}]-(target:Bimba)"),
            GraphTraverseDirection::Both => format!("(start)-[*1..{depth}]-(target:Bimba)"),
        };
        let cypher = format!(
            "MATCH (start:Bimba)
             WHERE start.coordinate = $canonical OR start.bimbaCoordinate = $input
             MATCH path = {pattern}
             {relation_filter}
             RETURN target.coordinate AS coordinate,
                    target.uuid AS uuid,
                    target.name AS name,
                    length(path) AS depth
             ORDER BY depth ASC, coordinate ASC
             LIMIT 100"
        );
        let q = query(&cypher)
            .param("canonical", resolved.canonical.clone())
            .param("input", resolved.input.clone())
            .param("edge_types", request.edge_types.clone());
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|err| format!("s2.graph.traverse failed: {err}"))?;
        Ok(json!({
            "from": resolved,
            "depth": depth,
            "direction": request.direction,
            "nodes": rows.iter().map(known_row_json).collect::<Vec<_>>(),
        }))
    }
}

fn known_row_json(row: &neo4rs::Row) -> Value {
    json!({
        "coordinate": row.get::<String>("coordinate").unwrap_or_default(),
        "uuid": row.get::<String>("uuid").unwrap_or_default(),
        "name": row.get::<String>("name").unwrap_or_default(),
        "family": row.get::<String>("family").unwrap_or_default(),
        "layer": row.get::<String>("layer").unwrap_or_default(),
        "ql_position": row.get::<i64>("ql_position").unwrap_or(-1),
        "depth": row.get::<i64>("depth").ok(),
    })
}
