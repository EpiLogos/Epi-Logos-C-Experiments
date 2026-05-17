use std::collections::BTreeMap;

use neo4rs::{query, Query};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::{CoordinateArrayParser, Neo4jClient};
use epi_s2_graph_schema::{
    GRAPHITI_ARC_ID_PROPERTY, KERNEL_RESONANCE_HELIX_PROPERTY, KERNEL_RESONANCE_INDEX_PROPERTY,
    KERNEL_RESONANCE_LABEL, KERNEL_RESONANCE_LENS_PROPERTY, KERNEL_RESONANCE_POSITION_PROPERTY,
    KERNEL_RESONANCE_RELATION, KERNEL_RESONANCE_SCORE_PROPERTY, KERNEL_RESONANCE_SQUARE_PROPERTY,
    KERNEL_TICK_PROPERTY, SESSION_KEY_PROPERTY,
};

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
                            item.as_str()
                                .map(str::to_owned)
                                .ok_or_else(|| format!("param '{key}' only supports string arrays"))
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

    pub fn get_integer(&self, key: &str) -> Option<i64> {
        match self.values.get(key) {
            Some(GraphParamValue::Integer(value)) => Some(*value),
            _ => None,
        }
    }

    pub fn get_float(&self, key: &str) -> Option<f64> {
        match self.values.get(key) {
            Some(GraphParamValue::Float(value)) => Some(*value),
            _ => None,
        }
    }

    pub fn get_bool(&self, key: &str) -> Option<bool> {
        match self.values.get(key) {
            Some(GraphParamValue::Boolean(value)) => Some(*value),
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
        GraphMethodService::resolve_coordinate_string(&self.coordinate)
            .map(|resolved| resolved.canonical)
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

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct KernelResonanceObservationRequest {
    pub source_coordinate: String,
    pub session_key: String,
    pub timestamp_ms: u64,
    pub lens: u8,
    pub ascent_helix: bool,
    pub position: u8,
    pub score: f64,
    pub kernel_tick: u8,
    pub graphiti_arc_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct KernelResonanceObservationPlan {
    pub resolution: CoordinateResolution,
    pub observation_coordinate: String,
    pub resonance_index: i64,
    pub tritone_square: i64,
    pub cypher: String,
    pub params: GraphMethodParams,
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

    pub fn kernel_resonance_observation_plan(
        request: &KernelResonanceObservationRequest,
    ) -> Result<KernelResonanceObservationPlan, String> {
        let resolution = Self::resolve_coordinate_string(&request.source_coordinate)?;
        if request.session_key.trim().is_empty() {
            return Err("session key is required for kernel resonance observation".into());
        }
        if request.timestamp_ms == 0 {
            return Err("timestamp_ms is required for kernel resonance observation".into());
        }
        if !request.score.is_finite() {
            return Err("kernel resonance score must be finite".into());
        }
        if !(0.0..=1.0).contains(&request.score) {
            return Err("kernel resonance score must be normalized between 0 and 1".into());
        }
        let resonance_index =
            kernel_resonance_index(request.lens, request.ascent_helix, request.position)?;
        let tritone_square = tritone_square_for_lens(request.lens)?;
        let session_fragment = coordinate_fragment(&request.session_key);
        let observation_coordinate = format!(
            "S2.kernel.resonance.{session_fragment}.{}.{}",
            request.timestamp_ms, resonance_index
        );
        let graphiti_arc_id = request.graphiti_arc_id.clone().unwrap_or_default();
        let provenance = json!({
            "source": "s2.graph.kernel_resonance.record",
            "source_coordinate": resolution.canonical,
            "session_key": request.session_key,
            "graphiti_arc_id": graphiti_arc_id,
        })
        .to_string();
        let params = GraphMethodParams::from_json(json!({
            "source_coordinate": resolution.canonical,
            "source_input": resolution.input,
            "observation_coordinate": observation_coordinate,
            "observation_name": format!("Kernel resonance {}", resonance_index),
            "resonance_index": resonance_index,
            "tritone_square": tritone_square,
            "lens": request.lens as i64,
            "position": request.position as i64,
            "ascent_helix": request.ascent_helix,
            "score": request.score,
            "kernel_tick": (request.kernel_tick % 12) as i64,
            "session_key": request.session_key,
            "graphiti_arc_id": graphiti_arc_id,
            "timestamp_ms": request.timestamp_ms as i64,
            "provenance": provenance,
        }))?;
        let cypher = format!(
            "MATCH (source:Bimba)
             WHERE source.coordinate = $source_coordinate OR source.bimbaCoordinate = $source_input
             MERGE (obs:Bimba:{kernel_label} {{coordinate: $observation_coordinate}})
             SET obs.c_2_uuid = $observation_coordinate,
                 obs.c_1_name = $observation_name,
                 obs.c_4_family = 'S',
                 obs.c_4_layer = 'S2',
                 obs.c_4_ql_position = 2,
                 obs.{resonance_index_property} = $resonance_index,
                 obs.{resonance_score_property} = $score,
                 obs.{resonance_square_property} = $tritone_square,
                 obs.{resonance_lens_property} = $lens,
                 obs.{resonance_position_property} = $position,
                 obs.{resonance_helix_property} = $ascent_helix,
                 obs.{kernel_tick_property} = $kernel_tick,
                 obs.{session_key_property} = $session_key,
                 obs.{graphiti_arc_property} = $graphiti_arc_id
             MERGE (source)-[r:{kernel_relation}]->(obs)
             SET r.c_0_source_coordinate = source.coordinate,
                 r.c_0_target_coordinate = obs.coordinate,
                 r.c_1_relation_family = 'kernel-resonance',
                 r.c_2_relation_type = '{kernel_relation}',
                 r.c_3_created_at = datetime({{epochMillis: $timestamp_ms}}),
                 r.c_4_provenance = $provenance,
                 r.{resonance_index_property} = $resonance_index
             RETURN obs.coordinate AS coordinate,
                    obs.c_2_uuid AS uuid,
                    obs.c_1_name AS name,
                    obs.c_4_family AS family,
                    obs.c_4_layer AS layer,
                    obs.c_4_ql_position AS ql_position",
            kernel_label = KERNEL_RESONANCE_LABEL,
            kernel_relation = KERNEL_RESONANCE_RELATION,
            resonance_index_property = KERNEL_RESONANCE_INDEX_PROPERTY,
            resonance_score_property = KERNEL_RESONANCE_SCORE_PROPERTY,
            resonance_square_property = KERNEL_RESONANCE_SQUARE_PROPERTY,
            resonance_lens_property = KERNEL_RESONANCE_LENS_PROPERTY,
            resonance_position_property = KERNEL_RESONANCE_POSITION_PROPERTY,
            resonance_helix_property = KERNEL_RESONANCE_HELIX_PROPERTY,
            kernel_tick_property = KERNEL_TICK_PROPERTY,
            session_key_property = SESSION_KEY_PROPERTY,
            graphiti_arc_property = GRAPHITI_ARC_ID_PROPERTY,
        );

        Ok(KernelResonanceObservationPlan {
            resolution,
            observation_coordinate,
            resonance_index,
            tritone_square,
            cypher,
            params,
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
                    n.c_2_uuid AS uuid,
                    n.c_1_name AS name,
                    n.c_4_family AS family,
                    n.c_4_layer AS layer,
                    n.c_4_ql_position AS ql_position,
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
                    target.c_2_uuid AS uuid,
                    target.c_1_name AS name,
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

    pub async fn record_kernel_resonance(
        &self,
        request: KernelResonanceObservationRequest,
    ) -> Result<Value, String> {
        let plan = Self::kernel_resonance_observation_plan(&request)?;
        let rows = self
            .client
            .run_query(plan.params.apply_to_query(query(&plan.cypher)))
            .await
            .map_err(|err| format!("s2.graph.kernel_resonance.record failed: {err}"))?;
        Ok(json!({
            "source": plan.resolution,
            "observation": {
                "coordinate": plan.observation_coordinate,
                "label": KERNEL_RESONANCE_LABEL,
                "relation": KERNEL_RESONANCE_RELATION,
                "resonance_index": plan.resonance_index,
                "tritone_square": plan.tritone_square,
                "session_key": request.session_key,
                "graphiti_arc_id": request.graphiti_arc_id.unwrap_or_default(),
            },
            "rowCount": rows.len(),
            "rows": rows.iter().map(known_row_json).collect::<Vec<_>>(),
        }))
    }
}

fn kernel_resonance_index(lens: u8, ascent_helix: bool, position: u8) -> Result<i64, String> {
    if lens >= 6 {
        return Err("kernel resonance lens must be in 0..6".into());
    }
    if position >= 6 {
        return Err("kernel resonance position must be in 0..6".into());
    }
    let helix = if ascent_helix { 1i64 } else { 0i64 };
    Ok((lens as i64 * 12) + (helix * 6) + position as i64)
}

fn tritone_square_for_lens(lens: u8) -> Result<i64, String> {
    match lens {
        0 | 5 => Ok(0),
        1 | 4 => Ok(1),
        2 | 3 => Ok(2),
        _ => Err("kernel resonance lens must map to a tritone square".into()),
    }
}

fn coordinate_fragment(value: &str) -> String {
    let fragment = value
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' {
                ch
            } else {
                '-'
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .to_owned();
    if fragment.is_empty() {
        "session".to_owned()
    } else {
        fragment
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
