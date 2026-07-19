use std::collections::BTreeMap;

use neo4rs::{query, Query};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::core65_audit::{core_65_audit_payload, core_65_audit_plan, Core65AuditSummary};
use crate::ontology::anuttara_property_mappings;
use crate::{
    canonical_harmonic_bimba_relations, kernel_coordinate_anchor_from_parts, CoordinateArrayParser,
    CoordinateReferenceProjection, HarmonicBimbaRelation, KernelCoordinateAnchor, Neo4jClient,
};
use crate::{GDS_OPTION1_PROJECTION_NAME, GDS_OPTION1_PROJECTION_VERSION, GDS_PRIVACY_BOUNDARY};
use epi_s2_graph_schema::{
    GRAPHITI_ARC_ID_PROPERTY, KERNEL_RESONANCE_HELIX_PROPERTY, KERNEL_RESONANCE_INDEX_PROPERTY,
    KERNEL_RESONANCE_LABEL, KERNEL_RESONANCE_LENS_PROPERTY, KERNEL_RESONANCE_POSITION_PROPERTY,
    KERNEL_RESONANCE_RELATION, KERNEL_RESONANCE_SCORE_PROPERTY, KERNEL_RESONANCE_SQUARE_PROPERTY,
    KERNEL_TICK_PROPERTY, POINTER_COUNT_PROPERTY, POINTER_FAMILY_REFS_PROPERTY,
    POINTER_HARMONIC_ANCHOR_JSON_PROPERTY, POINTER_INVERSION_REFS_PROPERTY,
    POINTER_LENS_INVERSION_REFS_PROPERTY, POINTER_LENS_REFS_PROPERTY,
    POINTER_POSITION_REFS_PROPERTY, POINTER_REFLECTIVE_REFS_PROPERTY,
    POINTER_REFRESHED_AT_PROPERTY, POINTER_WEB_JSON_PROPERTY, SESSION_KEY_PROPERTY,
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

    pub fn get_string_list(&self, key: &str) -> Option<&[String]> {
        match self.values.get(key) {
            Some(GraphParamValue::StringList(value)) => Some(value),
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

pub fn m0_archetype_lut_coordinates() -> Vec<String> {
    portal_core::m0_archetype_lut_coordinates()
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M0ResidualListRequest {
    pub coordinate_prefix: String,
    pub offset: i64,
    pub limit: i64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct M0ResidualListPlan {
    pub requested_prefix: String,
    pub canonical_prefix: String,
    pub offset: i64,
    pub limit: i64,
    pub page_cypher: String,
    pub count_cypher: String,
    pub page_params: GraphMethodParams,
    pub count_params: GraphMethodParams,
}

/// Build the S2-owned query plan for the M0 residual data set: all 108 live
/// M0 graph rows minus the exact twelve rows projected by ARCHETYPE_LUT.
pub fn m0_residual_list_plan(
    request: &M0ResidualListRequest,
) -> Result<M0ResidualListPlan, String> {
    let requested_prefix = request.coordinate_prefix.trim().to_owned();
    let canonical_prefix = crate::convert_hash_to_m_family(&requested_prefix);
    let valid_prefixes = ["M0-0", "M0-1", "M0-2", "M0-3", "M0-4", "M0-5"];
    if !valid_prefixes.contains(&canonical_prefix.as_str()) {
        return Err("coordinatePrefix must be one of #0-0 through #0-5".into());
    }
    if request.offset < 0 || request.offset % 20 != 0 {
        return Err("offset must be a non-negative multiple of 20".into());
    }
    if request.limit != 20 {
        return Err("limit must be 20 for the M0 residual browser".into());
    }

    let excluded = m0_archetype_lut_coordinates();
    let page_params = GraphMethodParams::from_json(json!({
        "coordinate_prefix": canonical_prefix,
        "excluded_lut_coordinates": excluded,
        "offset": request.offset,
        "limit": request.limit,
    }))?;
    let count_params = GraphMethodParams::from_json(json!({
        "coordinate_prefix": canonical_prefix,
        "excluded_lut_coordinates": excluded,
    }))?;
    let page_cypher = "\
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH $coordinate_prefix
  AND NOT n.coordinate IN $excluded_lut_coordinates
RETURN n.coordinate AS coordinate,
       coalesce(n.c_1_name, n.name, n.title, n.coordinate) AS name,
       n.c_1_symbol AS symbol,
       n.c_1_form AS form
ORDER BY n.coordinate ASC
SKIP $offset LIMIT $limit"
        .to_owned();
    let count_cypher = "\
MATCH (dataset:Bimba)
WHERE dataset.coordinate = 'M0' OR dataset.coordinate STARTS WITH 'M0-'
WITH count(dataset) AS dataset_total
MATCH (residual:Bimba)
WHERE (residual.coordinate = 'M0' OR residual.coordinate STARTS WITH 'M0-')
  AND NOT residual.coordinate IN $excluded_lut_coordinates
WITH dataset_total, count(residual) AS residual_total
OPTIONAL MATCH (branch:Bimba)
WHERE branch.coordinate STARTS WITH $coordinate_prefix
  AND NOT branch.coordinate IN $excluded_lut_coordinates
WITH dataset_total, residual_total, count(branch) AS branch_total
OPTIONAL MATCH (root:Bimba {coordinate: 'M0'})
RETURN dataset_total,
       residual_total,
       branch_total,
       root.coordinate AS root_coordinate,
       coalesce(root.c_1_name, root.name, root.title, root.coordinate) AS root_name,
       root.c_1_symbol AS root_symbol,
       root.c_1_form AS root_form"
        .to_owned();

    Ok(M0ResidualListPlan {
        requested_prefix,
        canonical_prefix,
        offset: request.offset,
        limit: request.limit,
        page_cypher,
        count_cypher,
        page_params,
        count_params,
    })
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
    pub coordinate_anchor: KernelCoordinateAnchor,
    pub observation_coordinate: String,
    pub resonance_index: i64,
    pub tritone_square: i64,
    pub cypher: String,
    pub params: GraphMethodParams,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PointerWebRefreshRequest {
    pub coordinate: String,
    pub timestamp_ms: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PointerWebRefreshPlan {
    pub resolution: CoordinateResolution,
    pub coordinate_anchor: KernelCoordinateAnchor,
    pub coordinate_reference_projection: CoordinateReferenceProjection,
    pub deprecation_notice: String,
    pub cypher: String,
    pub params: GraphMethodParams,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct HarmonicRelationMaterializationRequest {
    pub timestamp_ms: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct HarmonicRelationMaterializationPlan {
    pub namespace: String,
    pub relation_count: usize,
    pub relations: Vec<HarmonicBimbaRelation>,
    pub cypher: String,
    pub params: GraphMethodParams,
}

pub struct GraphMethodService<'a> {
    pub(crate) client: &'a Neo4jClient,
}

impl<'a> GraphMethodService<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self { client }
    }

    pub fn resolve_coordinate_string(input: &str) -> Result<CoordinateResolution, String> {
        let trimmed = input.trim();
        let parsed = CoordinateArrayParser::parse_one(trimmed)?;
        let canonical = if trimmed == "#" {
            "#".to_string()
        } else if trimmed.starts_with('#') && trimmed.len() == 2 {
            format!("M{}", parsed.ql_position.unwrap_or_default())
        } else {
            parsed.coordinate
        };
        Ok(CoordinateResolution {
            input: trimmed.to_string(),
            canonical,
            compatibility_property: None,
        })
    }

    pub fn kernel_resonance_observation_plan(
        request: &KernelResonanceObservationRequest,
    ) -> Result<KernelResonanceObservationPlan, String> {
        let resolution = Self::resolve_coordinate_string(&request.source_coordinate)?;
        let coordinate_anchor = kernel_coordinate_anchor_from_parts(
            &resolution.canonical,
            &resolution.input,
            resolution.compatibility_property.clone(),
        )?;
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
            "coordinate_anchor": coordinate_anchor,
        })
        .to_string();
        let coordinate_anchor_json =
            serde_json::to_string(&coordinate_anchor).map_err(|err| err.to_string())?;
        let params = GraphMethodParams::from_json(json!({
            "source_coordinate": resolution.canonical,
            "source_input": resolution.input,
            "coordinate_anchor_json": coordinate_anchor_json,
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
             WHERE source.coordinate = $source_coordinate
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
                 obs.{graphiti_arc_property} = $graphiti_arc_id,
                 obs.c_5_kernel_coordinate_anchor = $coordinate_anchor_json
             MERGE (source)-[r:{kernel_relation}]->(obs)
             SET r.c_0_source_coordinate = source.coordinate,
                 r.c_0_target_coordinate = obs.coordinate,
                 r.c_1_relation_family = '{relation_family_kernel_core}',
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
            // CCT-13 / DR-IG-1: the family literal is the TYPED canonical
            // constant (kernel_core) — the 'kernel-resonance' hyphen literal
            // was the Phase-C drift, corrected 2026-07-10.
            relation_family_kernel_core =
                epi_s2_graph_schema::relationships::RELATION_FAMILY_KERNEL_CORE,
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
            coordinate_anchor,
            observation_coordinate,
            resonance_index,
            tritone_square,
            cypher,
            params,
        })
    }

    pub fn pointer_web_refresh_plan(
        request: &PointerWebRefreshRequest,
    ) -> Result<PointerWebRefreshPlan, String> {
        let resolution = Self::resolve_coordinate_string(&request.coordinate)?;
        if request.timestamp_ms == 0 {
            return Err("timestamp_ms is required for pointer web refresh".into());
        }
        let coordinate_anchor = kernel_coordinate_anchor_from_parts(
            &resolution.canonical,
            &resolution.input,
            resolution.compatibility_property.clone(),
        )?;
        let coordinate_reference_projection =
            coordinate_anchor.coordinate_reference_projection.clone();
        let pointer_web_json = serde_json::to_string(&coordinate_reference_projection)
            .map_err(|err| err.to_string())?;
        let harmonic_pointer_anchor_json = coordinate_anchor
            .harmonic_pointer
            .as_ref()
            .map(serde_json::to_string)
            .transpose()
            .map_err(|err| err.to_string())?
            .unwrap_or_default();
        let params = GraphMethodParams::from_json(json!({
            "source_coordinate": resolution.canonical,
            "source_input": resolution.input,
            "pointer_web_json": pointer_web_json,
            "harmonic_pointer_anchor_json": harmonic_pointer_anchor_json,
            "pointer_count": coordinate_reference_projection.reference_count as i64,
            "family_refs": pointer_ref_values(&coordinate_reference_projection.family_refs),
            "reflective_refs": pointer_ref_values(&coordinate_reference_projection.reflective_refs),
            "inversion_refs": pointer_ref_values(&coordinate_reference_projection.inversion_refs),
            "position_refs": pointer_ref_values(&coordinate_reference_projection.position_refs),
            "lens_refs": pointer_ref_values(&coordinate_reference_projection.lens_refs),
            "lens_inversion_refs": pointer_ref_values(&coordinate_reference_projection.lens_inversion_refs),
            "timestamp_ms": request.timestamp_ms as i64,
        }))?;
        let cypher = format!(
            "MATCH (n:Bimba)
             WHERE n.coordinate = $source_coordinate
             SET n.{pointer_web_property} = $pointer_web_json,
                 n.{pointer_count_property} = $pointer_count,
                 n.{pointer_family_refs_property} = $family_refs,
                 n.{pointer_reflective_refs_property} = $reflective_refs,
                 n.{pointer_inversion_refs_property} = $inversion_refs,
                 n.{pointer_position_refs_property} = $position_refs,
                 n.{pointer_lens_refs_property} = $lens_refs,
                 n.{pointer_lens_inversion_refs_property} = $lens_inversion_refs,
                 n.{pointer_harmonic_anchor_property} = $harmonic_pointer_anchor_json,
                 n.{pointer_refreshed_at_property} = datetime({{epochMillis: $timestamp_ms}})
             RETURN n.coordinate AS coordinate,
                    n.c_2_uuid AS uuid,
                    n.c_1_name AS name,
                    n.c_4_family AS family,
                    n.c_4_layer AS layer,
                    n.c_4_ql_position AS ql_position",
            pointer_web_property = POINTER_WEB_JSON_PROPERTY,
            pointer_count_property = POINTER_COUNT_PROPERTY,
            pointer_family_refs_property = POINTER_FAMILY_REFS_PROPERTY,
            pointer_reflective_refs_property = POINTER_REFLECTIVE_REFS_PROPERTY,
            pointer_inversion_refs_property = POINTER_INVERSION_REFS_PROPERTY,
            pointer_position_refs_property = POINTER_POSITION_REFS_PROPERTY,
            pointer_lens_refs_property = POINTER_LENS_REFS_PROPERTY,
            pointer_lens_inversion_refs_property = POINTER_LENS_INVERSION_REFS_PROPERTY,
            pointer_harmonic_anchor_property = POINTER_HARMONIC_ANCHOR_JSON_PROPERTY,
            pointer_refreshed_at_property = POINTER_REFRESHED_AT_PROPERTY,
        );

        Ok(PointerWebRefreshPlan {
            resolution,
            coordinate_anchor,
            coordinate_reference_projection,
            deprecation_notice:
                "deprecated compatibility projection; consume S2 Neo4j relations instead".to_owned(),
            cypher,
            params,
        })
    }

    pub fn harmonic_relation_materialization_plan(
        request: &HarmonicRelationMaterializationRequest,
    ) -> Result<HarmonicRelationMaterializationPlan, String> {
        if request.timestamp_ms == 0 {
            return Err("timestamp_ms is required for harmonic relation materialization".into());
        }
        let relations = canonical_harmonic_bimba_relations();
        let params = GraphMethodParams::from_json(json!({
            "timestamp_ms": request.timestamp_ms as i64,
        }))?;
        let cypher = harmonic_relation_materialization_cypher(&relations);

        Ok(HarmonicRelationMaterializationPlan {
            namespace: "bimba".to_owned(),
            relation_count: relations.len(),
            relations,
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
            "contract": graph_contract("s2.graph.query", None),
            "rowCount": rows.len(),
            "rows": rows.iter().map(known_row_json).collect::<Vec<_>>(),
        }))
    }

    pub async fn node(&self, request: GraphNodeRequest) -> Result<Value, String> {
        let resolved = Self::resolve_coordinate_string(&request.coordinate)?;
        let q = query(
            "MATCH (n:Bimba)
             WHERE n.coordinate = $canonical
             OPTIONAL MATCH (n)-[r]-(m:Bimba)
             RETURN n.coordinate AS coordinate,
                    n.c_2_uuid AS uuid,
                    n.c_1_name AS name,
                    n.c_4_family AS family,
                    n.c_4_layer AS layer,
                    n.c_4_ql_position AS ql_position,
                    n.c_1_symbol AS symbol,
                    n.c_1_formulation_type AS formulation_type,
                    n.c_1_complete_formulation AS complete_formulation,
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
                "contract": graph_contract("s2.graph.node", Some(&resolved)),
                "node": Value::Null,
                "relations": [],
                "resolution": resolved,
            }));
        };
        Ok(json!({
            "contract": graph_contract("s2.graph.node", Some(&resolved)),
            "node": known_row_json(row),
            "relations": row.get::<Vec<BTreeMap<String, String>>>("relations").unwrap_or_default(),
            "resolution": resolved,
        }))
    }

    pub async fn list_m0_residual(&self, request: M0ResidualListRequest) -> Result<Value, String> {
        let plan = m0_residual_list_plan(&request)?;
        let count_rows = self
            .client
            .run_query(plan.count_params.apply_to_query(query(&plan.count_cypher)))
            .await
            .map_err(|err| format!("s2.graph.list count failed: {err}"))?;
        let count_row = count_rows
            .first()
            .ok_or_else(|| "s2.graph.list count returned no row".to_owned())?;
        let dataset_total = count_row.get::<i64>("dataset_total").unwrap_or_default();
        let residual_total = count_row.get::<i64>("residual_total").unwrap_or_default();
        let branch_total = count_row.get::<i64>("branch_total").unwrap_or_default();
        let root_entry = count_row
            .get::<String>("root_coordinate")
            .ok()
            .filter(|coordinate| !coordinate.is_empty())
            .map(|coordinate| {
                json!({
                    "coordinate": coordinate,
                    "name": count_row.get::<String>("root_name").unwrap_or_else(|_| "M0".to_owned()),
                    "symbol": count_row.get::<String>("root_symbol").ok(),
                    "form": count_row.get::<String>("root_form").ok(),
                    "state": "canonical",
                })
            });

        let page_rows = self
            .client
            .run_query(plan.page_params.apply_to_query(query(&plan.page_cypher)))
            .await
            .map_err(|err| format!("s2.graph.list page failed: {err}"))?;
        let invariant_holds = dataset_total == 108 && residual_total == 96;
        Ok(json!({
            "contract": graph_contract("s2.graph.list", None),
            "coordinatePrefix": plan.requested_prefix,
            "canonicalPrefix": plan.canonical_prefix,
            "offset": plan.offset,
            "limit": plan.limit,
            "entries": page_rows.iter().map(m0_residual_row_json).collect::<Vec<_>>(),
            "rootEntry": root_entry,
            "total": branch_total,
            "residualTotal": residual_total,
            "datasetTotal": dataset_total,
            "state": if invariant_holds { "canonical" } else { "blocked" },
            "invariant": {
                "expectedDatasetTotal": 108,
                "expectedResidualTotal": 96,
                "holds": invariant_holds,
                "source": "Body/S/S0/epi-lib/docs/m0-dataset-audit.md + ARCHETYPE_LUT[12]"
            }
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
             WHERE start.coordinate = $canonical
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
            "contract": graph_contract("s2.graph.traverse", Some(&resolved)),
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
            "contract": graph_contract("s2.graph.kernel_resonance.record", Some(&plan.resolution)),
            "source": plan.resolution,
            "observation": {
                "coordinate": plan.observation_coordinate,
                "label": KERNEL_RESONANCE_LABEL,
                "relation": KERNEL_RESONANCE_RELATION,
                "resonance_index": plan.resonance_index,
                "tritone_square": plan.tritone_square,
                "session_key": request.session_key,
                "graphiti_arc_id": request.graphiti_arc_id.unwrap_or_default(),
                "coordinate_anchor": plan.coordinate_anchor,
            },
            "rowCount": rows.len(),
            "rows": rows.iter().map(known_row_json).collect::<Vec<_>>(),
        }))
    }

    pub async fn refresh_pointer_web(
        &self,
        request: PointerWebRefreshRequest,
    ) -> Result<Value, String> {
        let plan = Self::pointer_web_refresh_plan(&request)?;
        let rows = self
            .client
            .run_query(plan.params.apply_to_query(query(&plan.cypher)))
            .await
            .map_err(|err| format!("s2.graph.pointer_web.refresh failed: {err}"))?;
        Ok(json!({
            "contract": graph_contract("s2.graph.pointer_web.refresh", Some(&plan.resolution)),
            "source": plan.resolution,
            "coordinate_anchor": plan.coordinate_anchor,
            "coordinateReferenceProjection": plan.coordinate_reference_projection,
            "deprecatedPointerWeb": {
                "status": "deprecated_compatibility_only",
                "notice": plan.deprecation_notice
            },
            "rowCount": rows.len(),
            "rows": rows.iter().map(known_row_json).collect::<Vec<_>>(),
        }))
    }

    pub async fn materialize_harmonic_relations(
        &self,
        request: HarmonicRelationMaterializationRequest,
    ) -> Result<Value, String> {
        let plan = Self::harmonic_relation_materialization_plan(&request)?;
        let rows = self
            .client
            .run_query(plan.params.apply_to_query(query(&plan.cypher)))
            .await
            .map_err(|err| format!("s2.graph.harmonic_relations.materialize failed: {err}"))?;
        Ok(json!({
            "contract": graph_contract("s2.graph.harmonic_relations.materialize", None),
            "namespace": plan.namespace,
            "relationCount": plan.relation_count,
            "relations": plan.relations,
            "rowCount": rows.len(),
            "rows": rows.iter().map(known_row_json).collect::<Vec<_>>(),
        }))
    }

    pub async fn core_65_audit(&self) -> Result<Value, String> {
        let plan = core_65_audit_plan()?;
        let rows = self
            .client
            .run_query(plan.params.apply_to_query(query(&plan.cypher)))
            .await
            .map_err(|err| format!("s2.graph.core65.audit failed: {err}"))?;
        let summary = rows
            .first()
            .map(|row| {
                Core65AuditSummary::from_observation(
                    row.get::<i64>("declared_count")
                        .ok()
                        .and_then(|count| usize::try_from(count).ok())
                        .unwrap_or(plan.kernel_declared_count),
                    row.get::<i64>("observed_count")
                        .ok()
                        .and_then(|count| usize::try_from(count).ok())
                        .unwrap_or_default(),
                    row.get::<Vec<String>>("relation_types").unwrap_or_default(),
                    row.get::<Vec<String>>("neo4j_types").unwrap_or_default(),
                    row.get::<Vec<String>>("source_coordinates")
                        .unwrap_or_default(),
                    row.get::<Vec<String>>("target_coordinates")
                        .unwrap_or_default(),
                )
            })
            .unwrap_or_else(|| {
                Core65AuditSummary::from_observation(
                    plan.kernel_declared_count,
                    0,
                    Vec::new(),
                    Vec::new(),
                    Vec::new(),
                    Vec::new(),
                )
            });

        Ok(core_65_audit_payload(
            graph_contract("s2.graph.core65.audit", None),
            summary,
        ))
    }

    #[allow(non_snake_case)]
    pub async fn core65Audit(&self) -> Result<Value, String> {
        self.core_65_audit().await
    }
}

fn harmonic_relation_materialization_cypher(relations: &[HarmonicBimbaRelation]) -> String {
    let relation_maps = relations
        .iter()
        .map(|relation| {
            format!(
                "{{edge_id: '{}', source_coordinate: '{}', target_coordinate: '{}', relation_type: '{}', harmonic_family: '{}', harmonic_register: '{}', harmonic_depth: {}, harmonic_d_face: '{}', harmonic_base_pair: '{}', harmonic_active_lenses: [{}], harmonic_primary_anchor: '{}', harmonic_interval_signature: '{}', source_anchor: '{}'}}",
                cypher_literal(&relation.edge_id),
                cypher_literal(&relation.source_coordinate),
                cypher_literal(&relation.target_coordinate),
                cypher_literal(&relation.relation_type),
                cypher_literal(&relation.harmonic_family),
                cypher_literal(&relation.harmonic_register),
                relation.harmonic_depth,
                cypher_literal(&relation.harmonic_d_face),
                cypher_literal(&relation.harmonic_base_pair),
                relation
                    .harmonic_active_lenses
                    .iter()
                    .map(|lens| format!("'{}'", cypher_literal(lens)))
                    .collect::<Vec<_>>()
                    .join(", "),
                cypher_literal(&relation.harmonic_primary_anchor),
                cypher_literal(&relation.harmonic_interval_signature),
                cypher_literal(&relation.source_anchor),
            )
        })
        .collect::<Vec<_>>()
        .join(",\n  ");
    let merge_blocks = [
        "ADJACENTLY_ARTICULATES",
        "MIRRORS_COMPLEMENT",
        "CROSSES_KNOWING_LIMIT",
        "INVERTS_THROUGH_FIRST",
        "INVERTS_THROUGH_SECOND",
        "INVERTS_THROUGH_PAIR",
    ]
    .iter()
    .map(|relation_type| {
        format!(
            "FOREACH (_ IN CASE WHEN rel.relation_type = '{relation_type}' THEN [1] ELSE [] END |
  MERGE (source)-[edge:{relation_type} {{c_2_edge_id: rel.edge_id}}]->(target)
  SET {set_clause}
)",
            set_clause = harmonic_relation_set_clause("edge"),
        )
    })
    .collect::<Vec<_>>()
    .join("\n");

    format!(
        "UNWIND [
  {relation_maps}
] AS rel
MATCH (source:Bimba {{coordinate: rel.source_coordinate}})
MATCH (target:Bimba {{coordinate: rel.target_coordinate}})
{merge_blocks}
RETURN count(rel) AS relation_count"
    )
}

fn harmonic_relation_set_clause(edge: &str) -> String {
    [
        format!("{edge}.c_0_source_coordinate = source.coordinate"),
        format!("{edge}.c_0_target_coordinate = target.coordinate"),
        format!("{edge}.c_1_relation_family = rel.harmonic_family"),
        format!("{edge}.c_2_relation_type = rel.relation_type"),
        format!("{edge}.c_2_edge_id = rel.edge_id"),
        format!("{edge}.c_3_created_at = datetime({{epochMillis: $timestamp_ms}})"),
        format!("{edge}.c_4_harmonic_family = rel.harmonic_family"),
        format!("{edge}.c_4_harmonic_register = rel.harmonic_register"),
        format!("{edge}.c_4_harmonic_depth = rel.harmonic_depth"),
        format!("{edge}.c_4_harmonic_d_face = rel.harmonic_d_face"),
        format!("{edge}.c_4_harmonic_base_pair = rel.harmonic_base_pair"),
        format!("{edge}.c_4_harmonic_active_lenses = rel.harmonic_active_lenses"),
        format!("{edge}.c_4_harmonic_primary_anchor = rel.harmonic_primary_anchor"),
        format!("{edge}.c_5_harmonic_interval_signature = rel.harmonic_interval_signature"),
        format!("{edge}.c_4_provenance = rel.source_anchor"),
    ]
    .join(",\n      ")
}

fn cypher_literal(value: &str) -> String {
    value.replace('\\', "\\\\").replace('\'', "\\'")
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
    let coordinate = row.get::<String>("coordinate").unwrap_or_default();
    json!({
        "coordinate": coordinate,
        "uuid": row.get::<String>("uuid").unwrap_or_default(),
        "name": row.get::<String>("name").unwrap_or_default(),
        "family": row.get::<String>("family").unwrap_or_default(),
        "layer": row.get::<String>("layer").unwrap_or_default(),
        "ql_position": row.get::<i64>("ql_position").unwrap_or(-1),
        "depth": row.get::<i64>("depth").ok(),
        "anchors": source_traceability_anchors(&coordinate),
        "anuttara": anuttara_fields_json(row),
    })
}

fn m0_residual_row_json(row: &neo4rs::Row) -> Value {
    json!({
        "coordinate": row.get::<String>("coordinate").unwrap_or_default(),
        "name": row.get::<String>("name").unwrap_or_default(),
        "symbol": row.get::<String>("symbol").ok(),
        "form": row.get::<String>("form").ok(),
        "state": "canonical",
    })
}

pub fn graph_contract(method: &str, _resolution: Option<&CoordinateResolution>) -> Value {
    json!({
        "method": method,
        "namespace": "bimba",
        "coordinateOwner": "S2/S2'",
        "sourceAnchors": {
            "spec": "Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md",
            "plan": "Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md#T7",
            "code": "Body/S/S2/graph-services/src/graph_api.rs",
            "pointerCode": "Body/S/S2/graph-services/src/pointers.rs",
            "tests": ["Body/S/S2/graph-services/tests/graph_api_contract.rs"]
        },
        "residencyAuthority": {
            "diagramPack": "Idea/Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md",
            "flatWorldForms": "Idea/Bimba/World/{Name}.md",
            "typeCanvasIndexes": "Idea/Bimba/World/Types/{Type}/{Type}.canvas",
            "coordinateSemanticAuthority": "Idea/Bimba/World/Types/Coordinates",
            "missingResidencyPolicy": "canonical_absent; never synthesize client-renderer paths"
        },
        "deprecatedPointerWeb": {
            "status": "deprecated_compatibility_only",
            "replacement": "s2.graph.harmonic_relations.materialize + s2.graph.traverse",
            "reason": "S2 pointer_web is a coordinate reference projection, not the S0 HC_PointerWeb36 or the Bimba relation substrate"
        },
        "harmonicRelations": {
            "source": "s2.graph.harmonic_relations.materialize",
            "namespace": "bimba",
            "materialization": "Neo4j Bimba edges between P/P' source coordinates and L/L' target coordinates"
        },
        "ontologyReadiness": {
            "n10sOwner": "S2/S2'",
            "status": "reported-by-doctor-or-live-neo4j",
            "fallback": "blocked_without_fabricated_ontology_claims"
        },
        "gdsOverlay": {
            "projectionName": GDS_OPTION1_PROJECTION_NAME,
            "projectionVersion": GDS_OPTION1_PROJECTION_VERSION,
            "privacyBoundary": GDS_PRIVACY_BOUNDARY,
            "canonicalWritePerformedByApiEnvelope": false
        },
        "disclosureDensity": "public-coordinate-topology",
        "privacy": "protected-local Graphiti/Nara bodies are excluded from S2 public graph API payloads"
    })
}

pub fn source_traceability_anchors(coordinate: &str) -> Value {
    let diagram_pack = "Idea/Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md";
    let m0_spec = "Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md";
    let graph_api_code = "Body/S/S2/graph-services/src/graph_api.rs";
    let graph_api_test = "Body/S/S2/graph-services/tests/graph_api_contract.rs";
    let coordinate_authority = "Idea/Bimba/World/Types/Coordinates";
    let canonical = coordinate.trim();
    let world_path = if canonical.is_empty() {
        None
    } else {
        Some(format!("Idea/Bimba/World/{canonical}.md"))
    };
    let type_canvas_path = coordinate_type_canvas_path(canonical);
    let world_status = match &world_path {
        Some(path) if path_exists(path) => "s2_resolved",
        Some(_) => "canonical_absent",
        None => "canonical_absent",
    };
    let type_canvas_status = match &type_canvas_path {
        Some(path) if path_exists(path) => "s2_resolved",
        Some(_) => "canonical_absent",
        None => "canonical_absent",
    };

    json!({
        "source": {
            "path": diagram_pack,
            "status": path_status(diagram_pack),
            "provenance": "S2 diagram/MOC residency authority"
        },
        "spec": {
            "path": m0_spec,
            "status": path_status(m0_spec),
            "provenance": "M0' source-traceability contract"
        },
        "code": {
            "path": graph_api_code,
            "status": path_status(graph_api_code),
            "provenance": "S2 graph API payload builder"
        },
        "test": {
            "path": graph_api_test,
            "status": path_status(graph_api_test),
            "provenance": "S2 source-traceability payload contract"
        },
        "residencyChain": [
            {
                "kind": "architecture-diagram-pack",
                "path": diagram_pack,
                "status": path_status(diagram_pack)
            },
            {
                "kind": "flat-world-form",
                "path": world_path,
                "status": world_status
            },
            {
                "kind": "type-canvas-index",
                "path": type_canvas_path,
                "status": type_canvas_status
            },
            {
                "kind": "coordinate-semantic-authority",
                "path": coordinate_authority,
                "status": path_status(coordinate_authority)
            }
        ],
        "policy": {
            "owner": "S2/S1",
            "rendererLocalRegistryAllowed": false,
            "missingResidency": "canonical_absent"
        }
    })
}

fn path_exists(path: &str) -> bool {
    if std::path::Path::new(path).exists() {
        return true;
    }
    let manifest_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    manifest_dir
        .ancestors()
        .any(|ancestor| ancestor.join(path).exists())
}

fn path_status(path: &str) -> &'static str {
    if path_exists(path) {
        "s2_resolved"
    } else {
        "canonical_absent"
    }
}

fn coordinate_type_canvas_path(coordinate: &str) -> Option<String> {
    let family = coordinate.chars().next()?.to_ascii_uppercase();
    if !matches!(family, 'C' | 'L' | 'M' | 'P' | 'S') {
        return None;
    }
    Some(format!(
        "Idea/Bimba/World/Types/Coordinates/{family}/{coordinate}/{coordinate}.canvas"
    ))
}

fn anuttara_fields_json(row: &neo4rs::Row) -> Value {
    let mappings = anuttara_property_mappings();
    let present = mappings
        .iter()
        .filter_map(|mapping| {
            let value = row.get::<String>(mapping.alias.as_str()).ok()?;
            let value = value.trim();
            if value.is_empty() {
                return None;
            }
            Some((mapping, value.to_owned()))
        })
        .collect::<Vec<_>>();
    if present.is_empty() {
        return Value::Null;
    }

    let mut values = serde_json::Map::new();
    let mut provenance = serde_json::Map::new();
    for (mapping, value) in present {
        values.insert(mapping.alias.clone(), json!(value));
        provenance.insert(
            mapping.alias.clone(),
            json!({
                "source": "s2.neo4j",
                "status": "s2_supplied",
                "property": mapping.neo4j_property,
                "ontologyProperty": mapping.ontology_property,
            }),
        );
    }
    values.insert("provenance".to_owned(), Value::Object(provenance));
    Value::Object(values)
}

fn pointer_ref_values(refs: &BTreeMap<String, String>) -> Vec<String> {
    refs.iter()
        .map(|(key, value)| format!("{key}={value}"))
        .collect()
}
