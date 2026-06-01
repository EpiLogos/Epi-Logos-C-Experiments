use neo4rs::query;
use serde::{Deserialize, Serialize};

use crate::{GraphMethodService, Neo4jClient};

pub const GDS_OPTION1_PROJECTION_NAME: &str = "s2_public_bimba_option1_v1";
pub const GDS_OPTION1_PROJECTION_VERSION: &str = "2026-06-01-option1-public-coordinate-overlay";
pub const GDS_PRIVACY_BOUNDARY: &str =
    "public-coordinate-topology-only-excludes-protected-local-labels";

pub const GDS_EXCLUDED_LABELS: &[&str] = &[
    "GraphitiEpisode",
    "NaraBody",
    "ProtectedLocalBody",
    "PrivateProjection",
];

pub const GDS_ALGORITHM_VERSIONS: &[(&str, &str)] = &[
    ("fastrp", "gds.fastRP.stream"),
    ("personalized_pagerank", "gds.pageRank.stream"),
    ("node_similarity", "gds.nodeSimilarity.stream"),
    ("louvain", "gds.louvain.stream"),
    ("knn", "gds.knn.stream"),
];

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GdsProjectionPlan {
    pub projection_name: String,
    pub projection_version: String,
    pub included_labels: Vec<String>,
    pub relationship_types: Vec<String>,
    pub excluded_labels: Vec<String>,
    pub privacy_boundary: String,
    pub graph_list_cypher: String,
    pub project_cypher: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GdsOverlayRequest {
    pub coordinate: String,
    pub top_k: usize,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GdsOverlayPayload {
    pub coordinate: String,
    pub projection_name: String,
    pub projection_version: String,
    pub status: String,
    pub privacy_boundary_status: String,
    pub gds_ready: bool,
    pub reason: Option<String>,
    pub algorithms: Vec<GdsAlgorithmDescriptor>,
    pub excluded_labels: Vec<String>,
    pub derived_nodes: Vec<GdsOverlayNode>,
    pub canonical_write_performed: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GdsAlgorithmDescriptor {
    pub name: String,
    pub procedure: String,
    pub version: String,
    pub writes_canonical_graph: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GdsOverlayNode {
    pub coordinate: String,
    pub score: f64,
    pub source_algorithm: String,
}

pub fn option1_projection_plan() -> GdsProjectionPlan {
    let relationship_types = epi_s2_graph_schema::RELATIONSHIP_TYPE_SPECS
        .iter()
        .filter(|spec| !spec.compatibility)
        .map(|spec| spec.rel_type.to_owned())
        .collect::<Vec<_>>();
    GdsProjectionPlan {
        projection_name: GDS_OPTION1_PROJECTION_NAME.to_owned(),
        projection_version: GDS_OPTION1_PROJECTION_VERSION.to_owned(),
        included_labels: vec![epi_s2_graph_schema::BIMBA_LABEL.to_owned()],
        relationship_types,
        excluded_labels: GDS_EXCLUDED_LABELS
            .iter()
            .map(|label| (*label).to_owned())
            .collect(),
        privacy_boundary: GDS_PRIVACY_BOUNDARY.to_owned(),
        graph_list_cypher:
            "CALL gds.graph.list($projection_name) YIELD graphName, nodeCount, relationshipCount RETURN graphName, nodeCount, relationshipCount"
                .to_owned(),
        project_cypher:
            "CALL gds.graph.project($projection_name, $node_projection, $relationship_projection, {validateRelationships: false}) YIELD graphName, nodeCount, relationshipCount RETURN graphName, nodeCount, relationshipCount"
                .to_owned(),
    }
}

pub fn algorithm_descriptors() -> Vec<GdsAlgorithmDescriptor> {
    GDS_ALGORITHM_VERSIONS
        .iter()
        .map(|(name, procedure)| GdsAlgorithmDescriptor {
            name: (*name).to_owned(),
            procedure: (*procedure).to_owned(),
            version: GDS_OPTION1_PROJECTION_VERSION.to_owned(),
            writes_canonical_graph: false,
        })
        .collect()
}

pub fn blocked_overlay_payload(coordinate: &str, reason: impl Into<String>) -> GdsOverlayPayload {
    GdsOverlayPayload {
        coordinate: coordinate.to_owned(),
        projection_name: GDS_OPTION1_PROJECTION_NAME.to_owned(),
        projection_version: GDS_OPTION1_PROJECTION_VERSION.to_owned(),
        status: "blocked".to_owned(),
        privacy_boundary_status: GDS_PRIVACY_BOUNDARY.to_owned(),
        gds_ready: false,
        reason: Some(reason.into()),
        algorithms: algorithm_descriptors(),
        excluded_labels: GDS_EXCLUDED_LABELS
            .iter()
            .map(|label| (*label).to_owned())
            .collect(),
        derived_nodes: Vec::new(),
        canonical_write_performed: false,
    }
}

pub async fn gds_procedure_count(client: &Neo4jClient) -> Result<i64, String> {
    let rows = client
        .run("SHOW PROCEDURES YIELD name WHERE name STARTS WITH 'gds.' RETURN count(name) AS c")
        .await
        .map_err(|err| format!("gds procedure check failed: {err}"))?;
    Ok(rows
        .first()
        .and_then(|row| row.get("c").ok())
        .unwrap_or_default())
}

impl<'a> GraphMethodService<'a> {
    pub async fn gds_tangent_overlay(
        &self,
        request: GdsOverlayRequest,
    ) -> Result<serde_json::Value, String> {
        let resolved = Self::resolve_coordinate_string(&request.coordinate)?;
        let gds_count = gds_procedure_count(self.client).await.unwrap_or_default();
        if gds_count == 0 {
            let payload = blocked_overlay_payload(
                &resolved.canonical,
                "GDS procedures are unavailable; Option 1 tangent overlays remain blocked instead of returning fabricated recommendations.",
            );
            return serde_json::to_value(payload).map_err(|err| err.to_string());
        }

        let plan = option1_projection_plan();
        let rows = self
            .client
            .run_query(
                query(&plan.graph_list_cypher)
                    .param("projection_name", plan.projection_name.as_str()),
            )
            .await
            .map_err(|err| format!("gds graph list failed: {err}"))?;
        let projection_exists = rows.iter().any(|row| {
            row.get::<String>("graphName")
                .map(|name| name == plan.projection_name)
                .unwrap_or(false)
        });
        let mut payload = blocked_overlay_payload(
            &resolved.canonical,
            if projection_exists {
                "GDS is installed, but algorithm execution is intentionally gated until the projection runner is explicitly invoked."
            } else {
                "GDS is installed, but the Option 1 projection has not been created yet."
            },
        );
        payload.gds_ready = true;
        payload.status = if projection_exists {
            "projection-ready-algorithm-gated".to_owned()
        } else {
            "projection-missing".to_owned()
        };
        payload.derived_nodes.truncate(request.top_k);
        serde_json::to_value(payload).map_err(|err| err.to_string())
    }
}
