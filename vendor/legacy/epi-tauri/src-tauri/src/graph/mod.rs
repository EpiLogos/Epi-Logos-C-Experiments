pub mod client;
pub mod geometry;

pub use client::Neo4jClient;
pub use geometry::{
    calculate_batch_positions, calculate_hexagonal_position, BimbaPosition, GeometryClass,
    SubGraphGeometry,
};

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GraphData {
    pub nodes: Vec<GraphNode>,
    pub edges: Vec<GraphEdge>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GraphNode {
    pub id: String,
    pub labels: Vec<String>,
    pub properties: serde_json::Value,
    pub coordinate: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GraphEdge {
    pub id: String,
    pub source: String,
    pub target: String,
    pub rel_type: String,
    pub properties: serde_json::Value,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WalkKind {
    Topological,
    Semantic,
    Temporal,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GraphWalkResult {
    pub nodes: Vec<GraphNode>,
    pub edges: Vec<GraphEdge>,
    pub depth_reached: u32,
}
