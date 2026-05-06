use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeRef {
    pub uuid: String,
    pub labels: Vec<String>,
    pub properties: serde_json::Value,
    pub file_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EdgeRef {
    pub source_uuid: String,
    pub target_uuid: String,
    pub rel_type: String,
    pub properties: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PathResult {
    pub nodes: Vec<NodeRef>,
    pub edges: Vec<EdgeRef>,
    pub length: usize,
    pub coordinate: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GraphResult {
    pub nodes: Vec<NodeRef>,
    pub edges: Vec<EdgeRef>,
    pub coordinate: Option<NodeRef>,
    pub path: Option<Vec<PathResult>>,
    pub sync_status: Option<serde_json::Value>,
    pub query: Option<String>,
    pub execution_time_ms: Option<f64>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RelationshipType {
    Pos0LinksTo,
    Pos1Defines,
    Pos2OperatesVia,
    Pos3Instantiates,
    Pos4SituatedIn,
    Pos5IntegratesInto,
    BimbaRef,
    ThoughtType,
    Coordinate,
    InstanceOf,
}

impl RelationshipType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pos0LinksTo => "POS0_LINKS_TO",
            Self::Pos1Defines => "POS1_DEFINES",
            Self::Pos2OperatesVia => "POS2_OPERATES_VIA",
            Self::Pos3Instantiates => "POS3_INSTANTIATES",
            Self::Pos4SituatedIn => "POS4_SITUATED_IN",
            Self::Pos5IntegratesInto => "POS5_INTEGRATES_INTO",
            Self::BimbaRef => "BIMBA_REF",
            Self::ThoughtType => "THOUGHT_TYPE",
            Self::Coordinate => "COORDINATE",
            Self::InstanceOf => "INSTANCE_OF",
        }
    }
}
